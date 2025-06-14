// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import { IIPAssetRegistry }   from "./interfaces/registries/IIPAssetRegistry.sol";
import { ILicenseRegistry }    from "./interfaces/registries/ILicenseRegistry.sol";
import { ILicensingModule }    from "./interfaces/modules/licensing/ILicensingModule.sol";
import { IPILicenseTemplate }  from "./interfaces/modules/licensing/IPILicenseTemplate.sol";
import { PILFlavors }          from "./lib/PILFlavors.sol";
import { ICoreMetadataModule } from "./interfaces/modules/metadata/ICoreMetadataModule.sol";
import { IRoyaltyModule }      from "./interfaces/modules/royalty/IRoyaltyModule.sol";
import { IModuleRegistry }     from "./interfaces/registries/IModuleRegistry.sol";
import { IDisputeModule }      from "./interfaces/modules/dispute/IDisputeModule.sol";

contract StoryNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Pausable,
    Ownable,
    ERC2981,
    ERC721Holder,
    ReentrancyGuard
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    /// @notice Tweet metadata structure
    struct TweetMetadata {
        string name;
        string handle;
        string timestamp;
        bool verified;
        uint256 comments;
        uint256 retweets;
        uint256 likes;
        uint256 analytics;
        string[] tags;
        string[] mentions;
        string profileImage;
        string tweetLink;
        string tweetId;
        string ipfsScreenshot;
    }

    /// @notice Royalty configuration for licensing
    struct RoyaltyConfig {
        uint32 commercialRevShare;    // Revenue share percentage (in basis points * 100)
        uint256 mintingFee;           // Fee for minting licenses
        address royaltyPolicy;        // Royalty policy address
        address currencyToken;        // Token for payments
        bool isActive;                // Whether royalty is active
    }

    /// @notice Mint price (in wei)
    uint256 public mintPrice;
    /// @notice Cap on total mints
    uint256 public maxSupply;
    /// @notice Allowed minters
    mapping(address => bool) public minters;
    /// @notice Prevent double-minting the same tweet
    mapping(string => bool) public mintedTweet;
    /// @notice Store tweet metadata for each token
    mapping(uint256 => TweetMetadata) public tweetMetadata;
    /// @notice Store royalty configurations for each token
    mapping(uint256 => RoyaltyConfig) public tokenRoyaltyConfigs;
    /// @notice Store IP Asset addresses for each token
    mapping(uint256 => address) public tokenToIpAsset;
    /// @notice Store license terms for each token
    mapping(uint256 => uint256) public tokenLicenseTerms;

    /// Story Protocol core modules
    IIPAssetRegistry    public immutable IP_ASSET_REGISTRY;
    ICoreMetadataModule public immutable METADATA_MODULE;
    ILicenseRegistry    public immutable LICENSE_REGISTRY;
    ILicensingModule    public immutable LICENSING_MODULE;
    IPILicenseTemplate  public immutable PIL_TEMPLATE;
    IRoyaltyModule      public immutable ROYALTY_MODULE;
    IModuleRegistry     public immutable MODULE_REGISTRY;
    IDisputeModule      public immutable DISPUTE_MODULE;

    /// @notice Default royalty policy & currency for PIL terms
    address public immutable ROYALTY_POLICY_LAP;
    address public immutable CURRENCY_TOKEN;

    /// @notice Default royalty configuration
    RoyaltyConfig public defaultRoyaltyConfig;

    event TweetRegistered(
        uint256 indexed tokenId,
        string indexed tweetId,
        address indexed owner,
        address           ipId
    );
    
    event TweetMinted(
        uint256 indexed tokenId,
        string indexed tweetId,
        string name,
        string handle,
        string timestamp,
        bool verified,
        uint256 comments,
        uint256 retweets,
        uint256 likes,
        uint256 analytics,
        string[] tags,
        string[] mentions,
        string profileImage,
        string tweetLink,
        string ipfsScreenshot
    );
    
    event TermsCreatedAndAttached(
        uint256 indexed tokenId,
        address indexed ipId,
        uint256 indexed licenseTermsId
    );
    
    event DerivativeRegistered(
        uint256 indexed tokenId,
        address indexed ipId,
        uint256 indexed licenseTokenId
    );

    event RoyaltyConfigUpdated(
        uint256 indexed tokenId,
        uint32 commercialRevShare,
        uint256 mintingFee,
        address royaltyPolicy
    );

    event RoyaltyPaid(
        uint256 indexed tokenId,
        address indexed payer,
        address indexed receiver,
        uint256 amount
    );

    event LicenseMintingFeePaid(
        uint256 indexed tokenId,
        address indexed payer,
        uint256 amount
    );

    event RoyaltyVaultDeployed(
        uint256 indexed tokenId,
        address indexed ipId,
        address indexed vault
    );

    modifier onlyMinter() {
        require(minters[msg.sender], "Not authorized to mint");
        _;
    }

    modifier onlyIPOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not IP owner");
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        require(_exists(tokenId), "Token does not exist");
        _;
    }

    modifier notDisputed(uint256 tokenId) {
        address ipId = tokenToIpAsset[tokenId];
        if (ipId != address(0)) {
            require(!DISPUTE_MODULE.isIpTagged(ipId), "IP Asset is disputed");
        }
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint256       mintPrice_,
        uint256       maxSupply_,
        address       royaltyReceiver_,
        uint96        royaltyBP_,
        // Story Protocol core
        address       ipAssetRegistry_,
        address       metadataModule_,
        address       licenseRegistry_,
        address       licensingModule_,
        address       pilTemplate_,
        address       royaltyModule_,
        address       moduleRegistry_,
        address       disputeModule_,
        address       royaltyPolicyLAP_,
        address       currencyToken_
    ) ERC721(name_, symbol_) {
        mintPrice        = mintPrice_;
        maxSupply        = maxSupply_;
        _setDefaultRoyalty(royaltyReceiver_, royaltyBP_);

        IP_ASSET_REGISTRY    = IIPAssetRegistry(ipAssetRegistry_);
        METADATA_MODULE      = ICoreMetadataModule(metadataModule_);
        LICENSE_REGISTRY     = ILicenseRegistry(licenseRegistry_);
        LICENSING_MODULE     = ILicensingModule(licensingModule_);
        PIL_TEMPLATE         = IPILicenseTemplate(pilTemplate_);
        ROYALTY_MODULE       = IRoyaltyModule(royaltyModule_);
        MODULE_REGISTRY      = IModuleRegistry(moduleRegistry_);
        DISPUTE_MODULE       = IDisputeModule(disputeModule_);
        ROYALTY_POLICY_LAP   = royaltyPolicyLAP_;
        CURRENCY_TOKEN       = currencyToken_;

        // Set default royalty configuration
        defaultRoyaltyConfig = RoyaltyConfig({
            commercialRevShare: 10 * 10**6, // 10%
            mintingFee: 0,
            royaltyPolicy: royaltyPolicyLAP_,
            currencyToken: currencyToken_,
            isActive: true
        });

        minters[_msgSender()] = true;
    }

    /// @notice Grant or revoke mint rights
    function setMinter(address who, bool allowed) external onlyOwner {
        minters[who] = allowed;
    }

    function setMintPrice(uint256 p) external onlyOwner {
        mintPrice = p;
    }

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /// @notice Update default royalty configuration
    function setDefaultRoyaltyConfig(
        uint32 commercialRevShare,
        uint256 mintingFee,
        address royaltyPolicy
    ) external onlyOwner {
        require(ROYALTY_MODULE.isWhitelistedRoyaltyPolicy(royaltyPolicy), "Invalid royalty policy");
        
        defaultRoyaltyConfig = RoyaltyConfig({
            commercialRevShare: commercialRevShare,
            mintingFee: mintingFee,
            royaltyPolicy: royaltyPolicy,
            currencyToken: CURRENCY_TOKEN,
            isActive: true
        });
    }

    /// @notice Update royalty configuration for a specific token
    function setTokenRoyaltyConfig(
        uint256 tokenId,
        uint32 commercialRevShare,
        uint256 mintingFee,
        address royaltyPolicy
    ) external onlyIPOwner(tokenId) tokenExists(tokenId) notDisputed(tokenId) {
        require(ROYALTY_MODULE.isWhitelistedRoyaltyPolicy(royaltyPolicy), "Invalid royalty policy");
        
        tokenRoyaltyConfigs[tokenId] = RoyaltyConfig({
            commercialRevShare: commercialRevShare,
            mintingFee: mintingFee,
            royaltyPolicy: royaltyPolicy,
            currencyToken: CURRENCY_TOKEN,
            isActive: true
        });

        emit RoyaltyConfigUpdated(tokenId, commercialRevShare, mintingFee, royaltyPolicy);
    }

    /// @notice Get effective royalty configuration for a token
    function getEffectiveRoyaltyConfig(uint256 tokenId) public view returns (RoyaltyConfig memory) {
        if (tokenRoyaltyConfigs[tokenId].isActive) {
            return tokenRoyaltyConfigs[tokenId];
        }
        return defaultRoyaltyConfig;
    }

    /// @notice Deploy royalty vault for a token's IP Asset
    function deployRoyaltyVault(uint256 tokenId) external tokenExists(tokenId) returns (address vault) {
        address ipId = tokenToIpAsset[tokenId];
        require(ipId != address(0), "IP not registered");
        
        vault = ROYALTY_MODULE.deployVault(ipId);
        emit RoyaltyVaultDeployed(tokenId, ipId, vault);
    }

    /// @notice Pay royalties to an IP Asset
    function payRoyalty(
        uint256 tokenId,
        address payerIpId,
        address token,
        uint256 amount
    ) external nonReentrant tokenExists(tokenId) notDisputed(tokenId) {
        address receiverIpId = tokenToIpAsset[tokenId];
        require(receiverIpId != address(0), "IP not registered");
        require(ROYALTY_MODULE.isWhitelistedRoyaltyToken(token), "Invalid royalty token");

        ROYALTY_MODULE.payRoyaltyOnBehalf(receiverIpId, payerIpId, token, amount);
        emit RoyaltyPaid(tokenId, msg.sender, receiverIpId, amount);
    }

    /// @notice Pay license minting fee
    function payLicenseMintingFee(
        uint256 tokenId,
        address token,
        uint256 amount
    ) external nonReentrant tokenExists(tokenId) notDisputed(tokenId) {
        address receiverIpId = tokenToIpAsset[tokenId];
        require(receiverIpId != address(0), "IP not registered");
        require(ROYALTY_MODULE.isWhitelistedRoyaltyToken(token), "Invalid royalty token");

        ROYALTY_MODULE.payLicenseMintingFee(receiverIpId, msg.sender, token, amount);
        emit LicenseMintingFeePaid(tokenId, msg.sender, amount);
    }

    /// @notice Get tweet metadata for a token
    function getTweetMetadata(uint256 tokenId) external view returns (TweetMetadata memory) {
        return tweetMetadata[tokenId];
    }

    /// @notice Get IP Asset address for a token
    function getIPAsset(uint256 tokenId) external view returns (address) {
        return tokenToIpAsset[tokenId];
    }

    /// @notice Check if IP Asset is disputed
    function isIPDisputed(uint256 tokenId) external view returns (bool) {
        address ipId = tokenToIpAsset[tokenId];
        if (ipId == address(0)) return false;
        return DISPUTE_MODULE.isIpTagged(ipId);
    }

    /// @notice Get module address from registry
    function getModule(string memory moduleName) external view returns (address) {
        return MODULE_REGISTRY.getModule(moduleName);
    }

    /// @notice Mint a Tweet NFT, store metadata, register as IP Asset
    function safeMint(
        address        to,
        string calldata uri,
        string calldata name_,
        string calldata handle_,
        string calldata timestamp_,
        bool           verified_,
        uint256        comments_,
        uint256        retweets_,
        uint256        likes_,
        uint256        analytics_,
        string[] calldata tags_,
        string[] calldata mentions_,
        string calldata profileImage_,
        string calldata tweetLink_,
        string calldata tweetId_,
        string calldata ipfsScreenshot_
    ) external onlyMinter whenNotPaused {
        require(_tokenIdCounter.current() < maxSupply, "Max supply reached");
        require(!mintedTweet[tweetId_],      "Tweet already used");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        mintedTweet[tweetId_] = true;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        // Store tweet metadata
        tweetMetadata[tokenId] = TweetMetadata({
            name: name_,
            handle: handle_,
            timestamp: timestamp_,
            verified: verified_,
            comments: comments_,
            retweets: retweets_,
            likes: likes_,
            analytics: analytics_,
            tags: tags_,
            mentions: mentions_,
            profileImage: profileImage_,
            tweetLink: tweetLink_,
            tweetId: tweetId_,
            ipfsScreenshot: ipfsScreenshot_
        });

        // Register on Story IP registry
        address ipId = IP_ASSET_REGISTRY.register(
            block.chainid,
            address(this),
            tokenId
        );

        // Store IP Asset address
        tokenToIpAsset[tokenId] = ipId;

        // Set default royalty configuration for this token
        tokenRoyaltyConfigs[tokenId] = defaultRoyaltyConfig;

        emit TweetRegistered(tokenId, tweetId_, to, ipId);
        emit TweetMinted(
            tokenId,
            tweetId_,
            name_,
            handle_,
            timestamp_,
            verified_,
            comments_,
            retweets_,
            likes_,
            analytics_,
            tags_,
            mentions_,
            profileImage_,
            tweetLink_,
            ipfsScreenshot_
        );
    }

    /// @notice Mint + register + create & attach PIL terms with custom royalty config
    function mintAndRegisterAndCreateTermsAndAttach(
        address receiver,
        uint32 customCommercialRevShare,
        uint256 customMintingFee
    )
        external
        returns (uint256 tokenId, address ipId, uint256 licenseTermsId)
    {
        // mint to self (so we can call attach)
        tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(address(this), tokenId);

        // register as IP asset
        ipId = IP_ASSET_REGISTRY.register(block.chainid, address(this), tokenId);
        tokenToIpAsset[tokenId] = ipId;

        // Get effective royalty config
        RoyaltyConfig memory config = getEffectiveRoyaltyConfig(tokenId);
        
        // Use custom values if provided, otherwise use config defaults
        uint32 revShare = customCommercialRevShare > 0 ? customCommercialRevShare : config.commercialRevShare;
        uint256 mintFee = customMintingFee > 0 ? customMintingFee : config.mintingFee;

        // create a new PIL license template with royalty configuration
        licenseTermsId = PIL_TEMPLATE.registerLicenseTerms(
            PILFlavors.commercialRemix({
                mintingFee:         mintFee,
                commercialRevShare: revShare,
                royaltyPolicy:      config.royaltyPolicy,
                currencyToken:      config.currencyToken
            })
        );

        // Store license terms
        tokenLicenseTerms[tokenId] = licenseTermsId;

        // attach to the IP asset
        LICENSING_MODULE.attachLicenseTerms(ipId, address(PIL_TEMPLATE), licenseTermsId);

        // Update token royalty config if custom values were used
        if (customCommercialRevShare > 0 || customMintingFee > 0) {
            tokenRoyaltyConfigs[tokenId] = RoyaltyConfig({
                commercialRevShare: revShare,
                mintingFee: mintFee,
                royaltyPolicy: config.royaltyPolicy,
                currencyToken: config.currencyToken,
                isActive: true
            });
        }

        // transfer NFT ownership to receiver
        _transfer(address(this), receiver, tokenId);

        emit TermsCreatedAndAttached(tokenId, ipId, licenseTermsId);
    }

    /// @notice Mint and register a derivative using license tokens with royalty handling
    function mintLicenseTokenAndRegisterDerivative(
        address parentIpId,
        uint256 licenseTermsId,
        address receiver
    )
        external
        returns (
            uint256 childTokenId,
            address childIpId,
            uint256 licenseTokenId
        )
    {
        // 1) Mint the child NFT to this contract
        childTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(address(this), childTokenId);

        // 2) Register the child as an IP Asset
        childIpId = IP_ASSET_REGISTRY.register(
            block.chainid,
            address(this),
            childTokenId
        );

        // Store IP Asset address
        tokenToIpAsset[childTokenId] = childIpId;

        // 3) Check if parent IP is disputed
        require(!DISPUTE_MODULE.isIpTagged(parentIpId), "Parent IP is disputed");

        // 4) Get royalty configuration for licensing
        RoyaltyConfig memory config = defaultRoyaltyConfig;
        
        // 5) Mint exactly one license token from the parent IP
        licenseTokenId = LICENSING_MODULE.mintLicenseTokens({
            licensorIpId:    parentIpId,
            licenseTemplate: address(PIL_TEMPLATE),
            licenseTermsId:  licenseTermsId,
            amount:          1,
            receiver:        address(this),
            royaltyContext:  "",
            maxMintingFee:   config.mintingFee,
            maxRevenueShare: config.commercialRevShare
        });

        // 6) Create and populate array with the license token ID
        uint256[] memory licenseTokenIds = new uint256[](1);
        licenseTokenIds[0] = licenseTokenId;

        // 7) Link the child IP as a derivative
        LICENSING_MODULE.registerDerivativeWithLicenseTokens({
            childIpId:       childIpId,
            licenseTokenIds: licenseTokenIds,
            royaltyContext:  "",
            maxRts:          config.commercialRevShare / 10**4 // Convert to proper format
        });

        // 8) Set up royalty configuration for the derivative
        tokenRoyaltyConfigs[childTokenId] = config;
        tokenLicenseTerms[childTokenId] = licenseTermsId;

        // 9) Transfer the child NFT to the final owner
        _transfer(address(this), receiver, childTokenId);

        emit DerivativeRegistered(childTokenId, childIpId, licenseTokenId);
    }

    // ──────────────────────────────────────────────────────────────────────
    // OpenZeppelin overrides

    function _beforeTokenTransfer(address from, address to, uint256 id)
        internal override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, id);
        require(!paused(), "Paused");
        
        // Check if IP is disputed before allowing transfers
        if (from != address(0) && to != address(0)) { // Skip check for mint/burn
            address ipId = tokenToIpAsset[id];
            if (ipId != address(0)) {
                require(!DISPUTE_MODULE.isIpTagged(ipId), "Cannot transfer disputed IP");
            }
        }
    }
    
    function _burn(uint256 id)
        internal override(ERC721, ERC721URIStorage)
    {
        super._burn(id);
        // Clean up mappings
        delete tokenToIpAsset[id];
        delete tokenRoyaltyConfigs[id];
        delete tokenLicenseTerms[id];
    }
    
    function tokenURI(uint256 id)
        public view override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(id);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
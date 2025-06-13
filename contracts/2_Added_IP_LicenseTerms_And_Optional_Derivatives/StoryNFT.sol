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

import { IIPAssetRegistry }   from "./interfaces/registries/IIPAssetRegistry.sol";
import { ILicenseRegistry }    from "./interfaces/registries/ILicenseRegistry.sol";
import { ILicensingModule }    from "./interfaces/modules/licensing/ILicensingModule.sol";
import { IPILicenseTemplate }  from "./interfaces/modules/licensing/IPILicenseTemplate.sol";
import { PILFlavors }          from "./lib/PILFlavors.sol";
import { ICoreMetadataModule } from "./interfaces/modules/metadata/ICoreMetadataModule.sol";

contract StoryNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Pausable,
    Ownable,
    ERC2981,
    ERC721Holder
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

    /// Story Protocol core modules
    IIPAssetRegistry    public immutable IP_ASSET_REGISTRY;
    ICoreMetadataModule public immutable METADATA_MODULE;
    ILicenseRegistry    public immutable LICENSE_REGISTRY;
    ILicensingModule    public immutable LICENSING_MODULE;
    IPILicenseTemplate  public immutable PIL_TEMPLATE;

    /// @notice royalty policy & currency for PIL terms
    address public immutable ROYALTY_POLICY_LAP;
    address public immutable CURRENCY_TOKEN;

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

    modifier onlyMinter() {
        require(minters[msg.sender], "Not authorized to mint");
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
        ROYALTY_POLICY_LAP   = royaltyPolicyLAP_;
        CURRENCY_TOKEN       = currencyToken_;

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

    /// @notice Get tweet metadata for a token
    function getTweetMetadata(uint256 tokenId) external view returns (TweetMetadata memory) {
        return tweetMetadata[tokenId];
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

        // Optionally register metadata on the off-chain indexing module
        // METADATA_MODULE.setAll(ipId, uri /* or another URI */, bytes32(0), bytes32(0));

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

    /// @notice Mint + register + create & attach PIL terms in one go
    function mintAndRegisterAndCreateTermsAndAttach(address receiver)
        external
        returns (uint256 tokenId, address ipId, uint256 licenseTermsId)
    {
        // mint to self (so we can call attach)
        tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(address(this), tokenId);

        // register as IP asset
        ipId = IP_ASSET_REGISTRY.register(block.chainid, address(this), tokenId);

        // create a new PIL license template (commercial remix flavor)
        licenseTermsId = PIL_TEMPLATE.registerLicenseTerms(
            PILFlavors.commercialRemix({
                mintingFee:         0,
                commercialRevShare: 20 * 10**6, // 20%
                royaltyPolicy:      ROYALTY_POLICY_LAP,
                currencyToken:      CURRENCY_TOKEN
            })
        );

        // attach to the IP asset
        LICENSING_MODULE.attachLicenseTerms(ipId, address(PIL_TEMPLATE), licenseTermsId);

        // transfer NFT ownership to receiver
        _transfer(address(this), receiver, tokenId);

        emit TermsCreatedAndAttached(tokenId, ipId, licenseTermsId);
    }


    /// @notice Mint and register a derivative using license tokens
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

        // 3) Mint exactly one license token from the parent IP
        licenseTokenId = LICENSING_MODULE.mintLicenseTokens({
            licensorIpId:    parentIpId,
            licenseTemplate: address(PIL_TEMPLATE),
            licenseTermsId:  licenseTermsId,
            amount:          1,
            receiver:        address(this),
            royaltyContext:  "",
            maxMintingFee:   0,
            maxRevenueShare: 0
        });

        // 4) Create and populate array with the license token ID
        uint256[] memory licenseTokenIds = new uint256[](1);
        licenseTokenIds[0] = licenseTokenId;

        // 5) Link the child IP as a derivative
        LICENSING_MODULE.registerDerivativeWithLicenseTokens({
            childIpId:       childIpId,
            licenseTokenIds: licenseTokenIds,
            royaltyContext:  "",
            maxRts:          0
        });

        // 6) Transfer the child NFT to the final owner
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
    }
    function _burn(uint256 id)
        internal override(ERC721, ERC721URIStorage)
    {
        super._burn(id);
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
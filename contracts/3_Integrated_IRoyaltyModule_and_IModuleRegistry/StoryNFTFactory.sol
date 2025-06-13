// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./StoryNFT.sol";
import { IRoyaltyModule } from "./interfaces/modules/royalty/IRoyaltyModule.sol";
import { IModuleRegistry } from "./interfaces/registries/IModuleRegistry.sol";
import { IDisputeModule } from "./interfaces/modules/dispute/IDisputeModule.sol";

contract TweetIPFactory {
    /// @notice Collection information
    struct CollectionInfo {
        address collectionAddress;
        address creator;
        string handle;
        uint256 createdAt;
        bool isActive;
    }

    /// @notice Royalty template for new collections
    struct RoyaltyTemplate {
        uint32 commercialRevShare;    // Default revenue share percentage
        uint256 mintingFee;           // Default minting fee
        address royaltyPolicy;        // Default royalty policy
        bool isActive;                // Whether template is active
    }

    /// @notice All deployed tweet‐based NFT contracts
    address[] public allCollections;
    
    /// @notice Mapping from collection address to collection info
    mapping(address => CollectionInfo) public collectionInfo;
    
    /// @notice Mapping from creator to their collections
    mapping(address => address[]) public creatorCollections;
    
    /// @notice Mapping from handle to collection (prevent duplicate handles)
    mapping(string => address) public handleToCollection;

    /// @notice Story protocol core addresses
    address public immutable IP_REGISTRY;
    address public immutable METADATA_MODULE;
    address public immutable LICENSE_REGISTRY;
    address public immutable LICENSING_MODULE;
    address public immutable PIL_TEMPLATE;
    address public immutable ROYALTY_MODULE;
    address public immutable MODULE_REGISTRY;
    address public immutable DISPUTE_MODULE;
    address public immutable ROYALTY_POLICY_LAP;
    address public immutable CURRENCY_TOKEN;

    /// @notice Factory owner
    address public owner;

    /// @notice Default royalty template
    RoyaltyTemplate public defaultRoyaltyTemplate;

    /// @notice Collection creation fee
    uint256 public collectionCreationFee;

    /// @notice Treasury for fees
    address public treasury;

    event CollectionCreated(
        address indexed creator,
        address indexed collectionAddress,
        string        handle,
        uint256       timestamp
    );

    event RoyaltyTemplateUpdated(
        uint32 commercialRevShare,
        uint256 mintingFee,
        address royaltyPolicy
    );

    event CollectionDeactivated(
        address indexed collectionAddress,
        string reason
    );

    event CollectionReactivated(
        address indexed collectionAddress
    );

    event CreationFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );

    event TreasuryUpdated(
        address oldTreasury,
        address newTreasury
    );

    event TweetAssetRegistered(
        address indexed collection,
        address indexed creator,
        uint256 indexed tokenId,
        string tweetId
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not factory owner");
        _;
    }

    modifier validHandle(string calldata handle) {
        require(bytes(handle).length > 0, "Handle cannot be empty");
        require(bytes(handle).length <= 32, "Handle too long");
        require(handleToCollection[handle] == address(0), "Handle already taken");
        _;
    }

    modifier activeCollection(address collection) {
        require(collectionInfo[collection].isActive, "Collection is not active");
        _;
    }

    modifier validCollection(address collection) {
        require(collectionInfo[collection].collectionAddress != address(0), "Collection not found");
        _;
    }

    constructor(
        address _ipRegistry,
        address _metadataModule,
        address _licenseRegistry,
        address _licensingModule,
        address _pilTemplate,
        address _royaltyModule,
        address _moduleRegistry,
        address _disputeModule,
        address _royaltyPolicyLAP,
        address _currencyToken,
        address _treasury
    ) {
        IP_REGISTRY       = _ipRegistry;
        METADATA_MODULE   = _metadataModule;
        LICENSE_REGISTRY  = _licenseRegistry;
        LICENSING_MODULE  = _licensingModule;
        PIL_TEMPLATE      = _pilTemplate;
        ROYALTY_MODULE    = _royaltyModule;
        MODULE_REGISTRY   = _moduleRegistry;
        DISPUTE_MODULE    = _disputeModule;
        ROYALTY_POLICY_LAP = _royaltyPolicyLAP;
        CURRENCY_TOKEN    = _currencyToken;
        treasury          = _treasury;
        owner             = msg.sender;

        // Set default royalty template
        defaultRoyaltyTemplate = RoyaltyTemplate({
            commercialRevShare: 10 * 10**6, // 10%
            mintingFee: 0,
            royaltyPolicy: _royaltyPolicyLAP,
            isActive: true
        });

        collectionCreationFee = 0; // Free initially
    }

    /// @notice Update factory owner
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    /// @notice Update default royalty template
    function updateRoyaltyTemplate(
        uint32 commercialRevShare,
        uint256 mintingFee,
        address royaltyPolicy
    ) external onlyOwner {
        // Verify royalty policy is whitelisted
        IRoyaltyModule royaltyMod = IRoyaltyModule(ROYALTY_MODULE);
        require(royaltyMod.isWhitelistedRoyaltyPolicy(royaltyPolicy), "Invalid royalty policy");

        defaultRoyaltyTemplate = RoyaltyTemplate({
            commercialRevShare: commercialRevShare,
            mintingFee: mintingFee,
            royaltyPolicy: royaltyPolicy,
            isActive: true
        });

        emit RoyaltyTemplateUpdated(commercialRevShare, mintingFee, royaltyPolicy);
    }

    /// @notice Update collection creation fee
    function setCollectionCreationFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = collectionCreationFee;
        collectionCreationFee = newFee;
        emit CreationFeeUpdated(oldFee, newFee);
    }

    /// @notice Update treasury address
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /// @notice Deactivate a collection (in case of disputes or violations)
    function deactivateCollection(address collection, string calldata reason) external onlyOwner {
        require(collectionInfo[collection].collectionAddress != address(0), "Collection not found");
        collectionInfo[collection].isActive = false;
        emit CollectionDeactivated(collection, reason);
    }

    /// @notice Reactivate a collection
    function reactivateCollection(address collection) external onlyOwner {
        require(collectionInfo[collection].collectionAddress != address(0), "Collection not found");
        collectionInfo[collection].isActive = true;
        emit CollectionReactivated(collection);
    }

    /// @notice Deploy a new StoryNFT whose name is "<handle>_IP" and symbol "<handle>IP"
    function createTweetCollection(
        string calldata handle,
        uint256       mintPrice,
        uint256       maxSupply,
        address       royaltyReceiver,
        uint96        royaltyBP
    ) external payable validHandle(handle) {
        require(msg.value >= collectionCreationFee, "Insufficient creation fee");

        string memory name   = string(abi.encodePacked(handle, "_IP"));
        string memory symbol = string(abi.encodePacked(handle, "IP"));

        StoryNFT nft = new StoryNFT(
            name,
            symbol,
            mintPrice,
            maxSupply,
            royaltyReceiver,
            royaltyBP,
            IP_REGISTRY,
            METADATA_MODULE,
            LICENSE_REGISTRY,
            LICENSING_MODULE,
            PIL_TEMPLATE,
            ROYALTY_MODULE,
            MODULE_REGISTRY,
            DISPUTE_MODULE,
            ROYALTY_POLICY_LAP,
            CURRENCY_TOKEN
        );

        nft.setMinter(address(this), true);
        nft.setMinter(msg.sender, true);
        nft.transferOwnership(msg.sender);

        allCollections.push(address(nft));
        
        // Store collection info
        collectionInfo[address(nft)] = CollectionInfo({
            collectionAddress: address(nft),
            creator: msg.sender,
            handle: handle,
            createdAt: block.timestamp,
            isActive: true
        });

        // Track by creator and handle
        creatorCollections[msg.sender].push(address(nft));
        handleToCollection[handle] = address(nft);

        // Send creation fee to treasury
        if (msg.value > 0) {
            payable(treasury).transfer(msg.value);
        }

        emit CollectionCreated(msg.sender, address(nft), handle, block.timestamp);
    }

    /// @notice Register a tweet as an IP asset in a specific collection
    function registerTweetAsset(
        address        collection,
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
    ) external validCollection(collection) activeCollection(collection) {
        // Only collection owner or authorized minters can register assets
        StoryNFT nftContract = StoryNFT(payable(collection));
        require(
            nftContract.minters(msg.sender) || 
            nftContract.owner() == msg.sender,
            "Not authorized to register assets"
        );

        // Check if collection is disputed
        require(!isCollectionDisputed(collection), "Collection is disputed");

        uint256 currentTokenId = nftContract.totalSupply();
        
        nftContract.safeMint(
            to,
            uri,
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
            tweetId_,
            ipfsScreenshot_
        );

        emit TweetAssetRegistered(collection, msg.sender, currentTokenId, tweetId_);
    }

    /// @notice Batch register multiple tweet assets
    function batchRegisterTweetAssets(
        address collection,
        address[] calldata recipients,
        string[] calldata uris,
        string[] calldata names,
        string[] calldata handles,
        string[] calldata timestamps,
        bool[] calldata verified,
        uint256[] calldata comments,
        uint256[] calldata retweets,
        uint256[] calldata likes,
        uint256[] calldata analytics,
        string[][] calldata tags,
        string[][] calldata mentions,
        string[] calldata profileImages,
        string[] calldata tweetLinks,
        string[] calldata tweetIds,
        string[] calldata ipfsScreenshots
    ) external validCollection(collection) activeCollection(collection) {
        require(recipients.length == uris.length, "Array length mismatch");
        require(recipients.length <= 50, "Batch size too large"); // Prevent gas issues

        StoryNFT nftContract = StoryNFT(payable(collection));
        require(
            nftContract.minters(msg.sender) || 
            nftContract.owner() == msg.sender,
            "Not authorized to register assets"
        );

        require(!isCollectionDisputed(collection), "Collection is disputed");

        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 currentTokenId = nftContract.totalSupply();
            
            nftContract.safeMint(
                recipients[i],
                uris[i],
                names[i],
                handles[i],
                timestamps[i],
                verified[i],
                comments[i],
                retweets[i],
                likes[i],
                analytics[i],
                tags[i],
                mentions[i],
                profileImages[i],
                tweetLinks[i],
                tweetIds[i],
                ipfsScreenshots[i]
            );

            emit TweetAssetRegistered(collection, msg.sender, currentTokenId, tweetIds[i]);
        }
    }

    /// @notice Check if any IP assets in a collection are disputed
    function isCollectionDisputed(address collection) public view returns (bool) {
        StoryNFT nftContract = StoryNFT(payable(collection));
        uint256 totalSupply = nftContract.totalSupply();
        
        for (uint256 i = 0; i < totalSupply; i++) {
            if (nftContract.isIPDisputed(i)) {
                return true;
            }
        }
        return false;
    }

    /// @notice Get collection information
    function getCollectionInfo(address collection) external view returns (CollectionInfo memory) {
        return collectionInfo[collection];
    }

    /// @notice Get collections created by a specific creator
    function getCreatorCollections(address creator) external view returns (address[] memory) {
        return creatorCollections[creator];
    }

    /// @notice Get collection by handle
    function getCollectionByHandle(string calldata handle) external view returns (address) {
        return handleToCollection[handle];
    }

    /// @notice Get total number of collections
    function totalCollections() external view returns (uint256) {
        return allCollections.length;
    }

    /// @notice Get active collections count
    function getActiveCollectionsCount() external view returns (uint256) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allCollections.length; i++) {
            if (collectionInfo[allCollections[i]].isActive) {
                activeCount++;
            }
        }
        return activeCount;
    }

    /// @notice Get paginated collections
    function getCollectionsPaginated(
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory collections, bool hasMore) {
        require(offset < allCollections.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > allCollections.length) {
            end = allCollections.length;
        }
        
        collections = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            collections[i - offset] = allCollections[i];
        }
        
        hasMore = end < allCollections.length;
    }

    /// @notice Emergency withdrawal (only owner)
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    /// @notice Get module address from registry
    function getModule(string memory moduleName) external view returns (address) {
        return IModuleRegistry(MODULE_REGISTRY).getModule(moduleName);
    }

    /// @notice Check if royalty policy is whitelisted
    function isRoyaltyPolicyWhitelisted(address policy) external view returns (bool) {
        return IRoyaltyModule(ROYALTY_MODULE).isWhitelistedRoyaltyPolicy(policy);
    }

    /// @notice Pause/unpause a collection (emergency function)
    function pauseCollection(address collection) external onlyOwner validCollection(collection) {
        StoryNFT(payable(collection)).pause();
    }

    /// @notice Unpause a collection
    function unpauseCollection(address collection) external onlyOwner validCollection(collection) {
        StoryNFT(payable(collection)).unpause();
    }

    /// @notice Receive function to accept ETH
    receive() external payable {}
}
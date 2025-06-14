// contracts/TweetIPFactory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./StoryNFT.sol";

contract TweetIPFactory {
    /// @notice All deployed tweet‐based NFT contracts
    address[] public allCollections;

    /// @notice Story protocol core addresses
    address public immutable ipRegistry;
    address public immutable metadataModule;
    address public immutable licenseRegistry;
    address public immutable licensingModule;
    address public immutable pilTemplate;
    address public immutable royaltyPolicyLAP;
    address public immutable currencyToken;

    event CollectionCreated(
        address indexed creator,
        address indexed collectionAddress,
        string        handle
    );

    constructor(
        address _ipRegistry,
        address _metadataModule,
        address _licenseRegistry,
        address _licensingModule,
        address _pilTemplate,
        address _royaltyPolicyLAP,
        address _currencyToken
    ) {
        ipRegistry        = _ipRegistry;
        metadataModule    = _metadataModule;
        licenseRegistry   = _licenseRegistry;
        licensingModule   = _licensingModule;
        pilTemplate       = _pilTemplate;
        royaltyPolicyLAP  = _royaltyPolicyLAP;
        currencyToken     = _currencyToken;
    }

    /// @notice Deploy a new StoryNFT whose name is "<handle>_IP" and symbol "<handle>IP"
    function createTweetCollection(
        string calldata handle,
        uint256       mintPrice,
        uint256       maxSupply,
        address       royaltyReceiver,
        uint96        royaltyBP
    ) external {
        string memory name   = string(abi.encodePacked(handle, "_IP"));
        string memory symbol = string(abi.encodePacked(handle, "IP"));

        StoryNFT nft = new StoryNFT(
            name,
            symbol,
            mintPrice,
            maxSupply,
            royaltyReceiver,
            royaltyBP,
            ipRegistry,
            metadataModule,
            licenseRegistry,
            licensingModule,
            pilTemplate,
            royaltyPolicyLAP,
            currencyToken
        );

        nft.setMinter(address(this), true);
        nft.transferOwnership(msg.sender);

        allCollections.push(address(nft));
        emit CollectionCreated(msg.sender, address(nft), handle);
    }

    function totalCollections() external view returns (uint256) {
        return allCollections.length;
    }

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
    ) external {
        StoryNFT(payable(collection)).safeMint(
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
    }
}

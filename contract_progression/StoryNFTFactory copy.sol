// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./StoryNFT.sol";

interface ILicenseRegistry {
    function registerTemplate(address template) external;
}

interface ILicenseToken {
    function mint(address to, uint256 tokenId, string calldata uri) external;
}

contract TweetIPFactory {
    address[] public allCollections;

    address public immutable ipAssetRegistry;
    address public immutable licenseRegistry;
    address public immutable licenseToken;
    address public immutable royaltyModule;

    event CollectionCreated(
        address indexed creator,
        address indexed collectionAddress,
        string handle
    );

    constructor(
        address _ipAssetRegistry,
        address _licenseRegistry,
        address _licenseToken,
        address _royaltyModule
    ) {
        ipAssetRegistry = _ipAssetRegistry;
        licenseRegistry = _licenseRegistry;
        licenseToken    = _licenseToken;
        royaltyModule   = _royaltyModule;
    }

    function createTweetCollection(
        string calldata handle,
        uint256 mintPrice,
        uint256 maxSupply,
        address royaltyReceiver,
        uint96 royaltyBP,
        address licensingHook
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
            ipAssetRegistry,
            licensingHook
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
        address collection,
        address to,
        string calldata uri,
        string calldata name,
        string calldata handle,
        string calldata timestamp,
        bool verified,
        uint256 comments,
        uint256 retweets,
        uint256 likes,
        uint256 analytics,
        string[] calldata tags,
        string[] calldata mentions,
        string calldata profileImage,
        string calldata tweetLink,
        string calldata tweetId,
        string calldata ipfsScreenshot
    ) external {
        StoryNFT(payable(collection)).safeMint(
            to,
            uri,
            name,
            handle,
            timestamp,
            verified,
            comments,
            retweets,
            likes,
            analytics,
            tags,
            mentions,
            profileImage,
            tweetLink,
            tweetId,
            ipfsScreenshot
        );

        ILicenseToken(licenseToken).mint(to, block.timestamp, uri);
    }
}

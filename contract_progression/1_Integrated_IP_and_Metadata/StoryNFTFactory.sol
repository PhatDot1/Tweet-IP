// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./StoryNFT.sol";

contract TweetIPFactory {
    /// @notice All deployed tweet-based NFT contracts
    address[] public allCollections;

    /// @notice Story Protocol core registry + metadata module
    address public immutable registry;
    address public immutable metadataModule;

    event CollectionCreated(
        address indexed creator,
        address indexed collectionAddress,
        string        handle
    );

    constructor(address registry_, address metadataModule_) {
        registry       = registry_;
        metadataModule = metadataModule_;
    }

    /// @notice Deploy a new StoryNFT whose name is "<handle>_IP" and symbol "<handle>IP"
    /// @param handle          Twitter handle (e.g. "elonmusk")
    /// @param mintPrice       price per mint
    /// @param maxSupply       cap on this series
    /// @param royaltyReceiver receiver of secondary royalties
    /// @param royaltyBP       basis points (out of 10 000)
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
            registry,
            metadataModule
        );

        // authorize factory as a minter, then hand off ownership
        nft.setMinter(address(this), true);
        nft.transferOwnership(msg.sender);

        allCollections.push(address(nft));
        emit CollectionCreated(msg.sender, address(nft), handle);
    }

    /// @notice How many collections have been created so far
    function totalCollections() external view returns (uint256) {
        return allCollections.length;
    }

    /// @notice Mint (register) a single tweet asset on-chain
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

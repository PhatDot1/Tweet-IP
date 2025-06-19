// TweetIPFactory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./StoryNFT.sol";

contract TweetIPFactory {
    /// @notice All deployed tweet-based NFT contracts
    address[] public allCollections;

    event CollectionCreated(
        address indexed creator,
        address indexed collectionAddress,
        string        handle
    );

    /// @notice Deploy a new StoryNFT whose name is "<handle>_IP" and symbol "<handle>IP"
    function createTweetCollection(
        string calldata handle,          
        uint256       mintPrice,
        uint256       maxSupply,
        address       royaltyReceiver,
        uint96        royaltyBP
    ) external {
        // build the on-chain collection name & symbol
        string memory name   = string(abi.encodePacked(handle, "_IP"));
        string memory symbol = string(abi.encodePacked(handle, "IP"));

        // deploy
        StoryNFT nft = new StoryNFT(
            name,
            symbol,
            mintPrice,
            maxSupply,
            royaltyReceiver,
            royaltyBP
        );

        // authorize this factory as a minter before we hand over ownership
        nft.setMinter(address(this), true);

        // transfer ownership to the caller
        nft.transferOwnership(msg.sender);

        allCollections.push(address(nft));
        emit CollectionCreated(msg.sender, address(nft), handle);
    }

    /// @notice How many collections have been created so far
    function totalCollections() external view returns (uint256) {
        return allCollections.length;
    }

    /// @notice Mint (register) a single tweet asset on-chain
    /// @param collection    the address returned by createTweetCollection
    /// @param to            the recipient of the new token
    /// @param uri           pointer to your JSON metadata (IPFS, etc)
    /// @param name          tweet’s author name
    /// @param handle        tweet’s handle
    /// @param timestamp     tweet’s timestamp (ISO8601)
    /// @param verified      was author verified?
    /// @param comments      reply count
    /// @param retweets      retweet count
    /// @param likes         like count
    /// @param analytics     analytics count
    /// @param tags          hashtags
    /// @param mentions      mentions
    /// @param profileImage  profile image URL
    /// @param tweetLink     link to the tweet
    /// @param tweetId       tweet’s unique ID
    /// @param ipfsScreenshot IPFS URL of the screenshot
    function registerTweetAsset(
        address        collection,
        address        to,
        string calldata uri,
        string calldata name,
        string calldata handle,
        string calldata timestamp,
        bool           verified,
        uint256        comments,
        uint256        retweets,
        uint256        likes,
        uint256        analytics,
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
    }
}

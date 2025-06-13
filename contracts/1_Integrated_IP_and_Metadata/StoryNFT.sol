// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// Story Protocol interfaces
import { IIPAssetRegistry } from "./interfaces/registries/IIPAssetRegistry.sol";
import { ICoreMetadataModule } from "./interfaces/modules/metadata/ICoreMetadataModule.sol";

contract StoryNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Pausable,
    Ownable,
    ERC2981
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    /// @notice Mint price (in wei), adjustable by owner
    uint256 public mintPrice;
    /// @notice Maximum NFTs in this collection
    uint256 public maxSupply;
    /// @notice Which addresses may mint
    mapping(address => bool) public minters;
    /// @notice Prevent double-minting the same tweet
    mapping(string => bool) public mintedTweet;

    /// @notice Story IP Asset Registry
    IIPAssetRegistry public immutable ipAssetRegistry;
    /// @notice Optional metadata module (e.g. for off-chain metadata indexing)
    ICoreMetadataModule public immutable metadataModule;

    struct TweetMeta {
        string   name;
        string   handle;
        string   timestamp;
        bool     verified;
        uint256  comments;
        uint256  retweets;
        uint256  likes;
        uint256  analytics;
        string[] tags;
        string[] mentions;
        string   profileImage;
        string   tweetLink;
        string   tweetId;
        string   ipfsScreenshot;
    }

    /// @notice On-chain storage of all tweet fields
    mapping(uint256 => TweetMeta) public tweetMeta;

    event TweetRegistered(
        uint256 indexed tokenId,
        string  indexed tweetId,
        address indexed owner,
        address           ipId
    );

    modifier onlyMinter() {
        require(minters[msg.sender], "Not authorized to mint");
        _;
    }

    /// @param registry_          Address of Story Protocol’s IIPAssetRegistry
    /// @param metadataModule_    Address of Story Protocol’s ICoreMetadataModule
    constructor(
        string memory name_,
        string memory symbol_,
        uint256       mintPrice_,
        uint256       maxSupply_,
        address       royaltyReceiver_,
        uint96        royaltyBP_,
        address       registry_,
        address       metadataModule_
    ) ERC721(name_, symbol_) {
        mintPrice = mintPrice_;
        maxSupply = maxSupply_;
        ipAssetRegistry = IIPAssetRegistry(registry_);
        metadataModule  = ICoreMetadataModule(metadataModule_);
        _setDefaultRoyalty(royaltyReceiver_, royaltyBP_);
        minters[_msgSender()] = true;
    }

    /// @notice Owner can change mint price
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    /// @notice Owner may add or remove other minters
    function setMinter(address minter, bool allowed) public onlyOwner {
        minters[minter] = allowed;
    }

    /// @notice Pause all new mints (emergency)
    function pause() external onlyOwner {
        _pause();
    }
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Mint a single token, store tweet metadata, and register it as an IP Asset
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
    )
        external
        onlyMinter
        whenNotPaused
    {
        require(_tokenIdCounter.current() < maxSupply, "Exceeds max supply");
        require(!mintedTweet[tweetId_], "Tweet already registered");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        mintedTweet[tweetId_] = true;

        // Mint the NFT itself
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        // Store all on-chain tweet fields
        tweetMeta[tokenId] = TweetMeta({
            name:           name_,
            handle:         handle_,
            timestamp:      timestamp_,
            verified:       verified_,
            comments:       comments_,
            retweets:       retweets_,
            likes:          likes_,
            analytics:      analytics_,
            tags:           tags_,
            mentions:       mentions_,
            profileImage:   profileImage_,
            tweetLink:      tweetLink_,
            tweetId:        tweetId_,
            ipfsScreenshot: ipfsScreenshot_
        });

        // **KEY**: register the freshly-minted NFT as an IP Asset
        address ipId = ipAssetRegistry.register(
            block.chainid,
            address(this),
            tokenId
        );

        // (Optional) hook into your metadata module if you need to push richer metadata
        // metadataModule.addMetadata(ipId, ...);

        emit TweetRegistered(tokenId, tweetId_, to, ipId);
    }

    /// @notice (Optional) batch mint of identical URIs + IP registration
    function mint(address to, uint256 quantity, string memory uri)
        public
        payable
        onlyMinter
        whenNotPaused
    {
        require(quantity > 0, "Quantity must be > 0");
        require(_tokenIdCounter.current() + quantity <= maxSupply, "Exceeds max supply");
        require(msg.value >= mintPrice * quantity, "Insufficient ETH sent");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();

            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uri);

            // register each as an IP Asset
            ipAssetRegistry.register(block.chainid, address(this), tokenId);
        }
    }

    /// @notice Withdraw accumulated ETH
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    receive() external payable {}
    fallback() external payable {}

    // ──────────────────────────────────────────────────────────────────────
    // Overrides for multiple inheritance
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
        require(!paused(), "StoryNFT: paused");
    }
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

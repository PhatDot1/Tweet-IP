// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IIPAssetRegistry {
    function register(address registrant, address ipAsset) external;
}

interface ILicensingHook {
    function canMintLicense(address caller, string calldata tweetId) external view returns (bool);
}

contract StoryNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, ERC2981 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint256 public mintPrice;
    uint256 public maxSupply;
    mapping(address => bool) public minters;
    mapping(string => bool) public mintedTweet;

    address public ipAssetRegistry;
    address public licensingHook;

    struct TweetMeta {
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

    mapping(uint256 => TweetMeta) public tweetMeta;

    event TweetRegistered(uint256 indexed tokenId, string indexed tweetId, address indexed owner);

    modifier onlyMinter() {
        require(minters[msg.sender], "Not authorized to mint");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 mintPrice_,
        uint256 maxSupply_,
        address royaltyReceiver_,
        uint96 royaltyBP_,
        address ipAssetRegistry_,
        address licensingHook_
    ) ERC721(name_, symbol_) {
        mintPrice         = mintPrice_;
        maxSupply         = maxSupply_;
        ipAssetRegistry   = ipAssetRegistry_;
        licensingHook     = licensingHook_;
        _setDefaultRoyalty(royaltyReceiver_, royaltyBP_);
        minters[msg.sender] = true;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function setMinter(address minter, bool allowed) public onlyOwner {
        minters[minter] = allowed;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function safeMint(
        address to,
        string calldata uri,
        string calldata name_,
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
    ) external onlyMinter whenNotPaused {
        require(_tokenIdCounter.current() < maxSupply, "Exceeds max supply");
        require(!mintedTweet[tweetId], "Tweet already registered");
        require(ILicensingHook(licensingHook).canMintLicense(to, tweetId), "Not licensed to mint");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        mintedTweet[tweetId] = true;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        tweetMeta[tokenId] = TweetMeta({
            name: name_,
            handle: handle,
            timestamp: timestamp,
            verified: verified,
            comments: comments,
            retweets: retweets,
            likes: likes,
            analytics: analytics,
            tags: tags,
            mentions: mentions,
            profileImage: profileImage,
            tweetLink: tweetLink,
            tweetId: tweetId,
            ipfsScreenshot: ipfsScreenshot
        });

        emit TweetRegistered(tokenId, tweetId, to);

        IIPAssetRegistry(ipAssetRegistry).register(to, address(this));
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    receive() external payable {}
    fallback() external payable {}

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
        require(!paused(), "StoryNFT: paused");
    }

    function _burn(uint256 tokenId)
        internal override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

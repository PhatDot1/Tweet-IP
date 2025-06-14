import { ethers } from "hardhat";
import { TweetIPFactory, StoryNFT } from "../typechain-types";

const FACTORY_ADDRESS = "0x17C35b9175B42e19e4f8793Aeab28D255d1c6192";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  // 1) Attach to your deployed factory
  const factory = (await ethers.getContractAt(
    "TweetIPFactory",
    FACTORY_ADDRESS,
    signer
  )) as TweetIPFactory;

  // 2) Create a new collection
  console.log("👉 Creating a new Tweet collection…");
  const createTx = await factory.createTweetCollection(
    "@alice",        // handle
    0,               // mintPrice
    10,              // maxSupply
    signer.address,  // royaltyReceiver
    500              // royaltyBP (5%)
  );
  await createTx.wait();
  console.log("✅ Collection created");

  // 3) Read back the very first collection
  const collection = await factory.allCollections(0);
  console.log("Using collection address:", collection);

  // 4) Mint & register a dummy tweet
  console.log("👉 Minting & registering a dummy tweet…");
  const mintTx = await factory.registerTweetAsset(
    collection,
    signer.address,
    "ipfs://QmDummyUri",
    "Alice Example",
    "@alice",
    new Date().toISOString(),
    false,
    0,
    0,
    0,
    0,
    ["#test"],
    ["@bob"],
    "https://example.com/avatar.jpg",
    "https://twitter.com/alice/status/123",
    "123",
    "ipfs://QmDummyScreenshot"
  );
  const receipt = await mintTx.wait();
  if (!receipt) throw new Error("Mint tx failed");

  console.log("✅ Mint + IP-registration in block", receipt.blockNumber);

  // 5) Figure out the token ID (it's the last one minted)
  const nft = (await ethers.getContractAt(
    "StoryNFT",
    collection,
    signer
  )) as StoryNFT;

  // totalSupply() is available because StoryNFT extends ERC721Enumerable
  const supply: bigint = await nft.totalSupply();  
  const tokenId = (supply - 1n).toString();  

  // 6) Print the StoryScan link
  console.log(
    `🔗 View your NFT here:\nhttps://aeneid.storyscan.io/token/${collection}/instance/${tokenId}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

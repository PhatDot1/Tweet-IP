import { ethers } from "hardhat";
import { TweetIPFactory } from "../typechain-types";

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

  // 2) Create a new collection (you only need to do this once)
  console.log("👉 Creating a new Tweet collection…");
  const createTx = await factory.createTweetCollection(
    "@alice",      // handle
    0,             // mintPrice in wei
    10,            // maxSupply
    signer.address,// royaltyReceiver
    500            // royaltyBP (5%)
  );
  await createTx.wait();
  console.log("✅ Collection created");

  // 3) Read back the very first collection
  const collection = await factory.allCollections(0);
  console.log("Using collection address:", collection);

  // 4) Mint & register a dummy tweet
  console.log("👉 Minting & registering a dummy tweet…");
  const mintTx = await factory.registerTweetAsset(
    collection,                         // collection address
    signer.address,                     // to
    "ipfs://QmDummyUri",                // tokenURI
    "Alice Example",                    // name
    "@alice",                           // handle
    new Date().toISOString(),           // timestamp
    false,                              // verified
    0,                                  // comments
    0,                                  // retweets
    0,                                  // likes
    0,                                  // analytics
    ["#test"],                          // tags
    ["@bob"],                           // mentions
    "https://example.com/avatar.jpg",   // profileImage
    "https://twitter.com/alice/status/123", // tweetLink
    "123",                              // tweetId
    "ipfs://QmDummyScreenshot"          // ipfsScreenshot
  );
  const receipt = await mintTx.wait();
  if (!receipt) throw new Error("Mint tx failed");

  console.log("✅ Mint + IP-registration in block", receipt.blockNumber);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

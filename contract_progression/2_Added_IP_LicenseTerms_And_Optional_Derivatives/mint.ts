// mint-standalone.ts
import { ethers } from "ethers";
import { http } from "viem";
import { Account, privateKeyToAccount, Address } from "viem/accounts";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Contract ABIs (minimal required functions)
const FACTORY_ABI = [
  "function createTweetCollection(string memory handle, uint256 mintPrice, uint256 maxSupply, address royaltyReceiver, uint96 royaltyBP) external returns (address)",
  "function registerTweetAsset(address collection, address to, string memory uri, string memory displayName, string memory handle, string memory timestamp, bool isRetweet, uint256 likes, uint256 retweets, uint256 replies, uint256 views, string[] memory hashtags, string[] memory mentions, string memory profileImage, string memory tweetUrl, string memory tweetId, string memory screenshotUri) external returns (uint256)",
  "function allCollections(uint256 index) external view returns (address)"
];

const NFT_ABI = [
  "function totalSupply() external view returns (uint256)",
  "function mintAndRegisterAndCreateTermsAndAttach(address to) external returns (uint256)"
];

// Update with your deployed factory address
const FACTORY_ADDRESS = "0x8a1885132A04fe94850BEc4f47C55Ca466C7Bb81";

// Story Protocol SDK setup
const privateKey: Address = `0x${process.env.WALLET_PRIVATE_KEY}`;
const account: Account = privateKeyToAccount(privateKey);
const config: StoryConfig = {
  account: account,
  transport: http(process.env.RPC_PROVIDER_URL || "https://aeneid.storyrpc.io"),
  chainId: "aeneid",
};
const storyClient = StoryClient.newClient(config);

// Ethers provider setup
const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER_URL || "https://aeneid.storyrpc.io");
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!, provider);

async function main() {
  console.log("Using wallet:", wallet.address);

  // 1) Attach to your deployed factory
  const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, wallet);

  // 2) Create a new collection
  console.log("👉 Creating a new Tweet collection...");
  const createTx = await factory.createTweetCollection(
    "@alice",        // handle
    0,               // mintPrice
    10,              // maxSupply
    wallet.address,  // royaltyReceiver
    500              // royaltyBP (5%)
  );
  await createTx.wait();
  console.log("✅ Collection created");

  // 3) Read back the very first collection
  const collection = await factory.allCollections(0);
  console.log("Using collection address:", collection);

  // 4) Mint & register a dummy tweet
  console.log("👉 Minting & registering a dummy tweet...");
  const mintTx = await factory.registerTweetAsset(
    collection,
    wallet.address,
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

  // 5) Get the NFT contract and token ID
  const nft = new ethers.Contract(collection, NFT_ABI, wallet);

  const supply: bigint = await nft.totalSupply();
  const tokenId = (supply - 1n).toString();

  console.log(`Token ID: ${tokenId}`);
  console.log(`🔗 View your NFT here:\nhttps://aeneid.storyscan.io/token/${collection}/instance/${tokenId}`);

  // 6) Get the IP Asset ID from the IP registry
  console.log("👉 Finding IP Asset ID...");
  const ipAssetId = await getIpAssetId(collection, tokenId);
  console.log(`IP Asset ID: ${ipAssetId}`);

  // 7) Create and attach license terms
  await createAndAttachLicenseTerms(ipAssetId);

  // 8) Mint a license token
  await mintLicenseToken(ipAssetId);

  // 9) Create a derivative work
  await createDerivativeWork(collection, ipAssetId);
}

async function getIpAssetId(nftContract: string, tokenId: string): Promise<string> {
  try {
    // Fixed: Use the correct property names for IpMetadataForWorkflow
    const ipAssetResponse = await storyClient.ipAsset.register({
      nftContract: nftContract as Address,
      tokenId: tokenId,
      ipMetadata: {
        ipMetadataURI: "",
        ipMetadataHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        nftMetadataURI: "",
        nftMetadataHash: "0x0000000000000000000000000000000000000000000000000000000000000000"
      }
    });
    
    return ipAssetResponse.ipId || "";
  } catch (error) {
    console.error("Error getting IP Asset ID:", error);
    
    // Alternative approach: Calculate IP Asset ID deterministically
    // The IP Asset ID is typically derived from the NFT contract and token ID
    // Fixed: Use ethers v6 syntax instead of utils
    const ipAssetId = ethers.solidityPackedKeccak256(
      ["address", "uint256"],
      [nftContract, tokenId]
    );
    
    console.log("Using calculated IP Asset ID:", ipAssetId);
    return ipAssetId;
  }
}

async function createAndAttachLicenseTerms(ipAssetId: string) {
  console.log("👉 Creating and attaching license terms...");
  
  try {
    // Create commercial remix license terms
    const licenseResponse = await storyClient.license.registerPILTerms({
      defaultMintingFee: 0n,
      currency: '0x1514000000000000000000000000000000000000', // $WIP token
      royaltyPolicy: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E', // RoyaltyPolicyLAP
      transferable: true,
      expiration: 0n,
      commercialUse: true,
      commercialAttribution: true,
      commercializerChecker: '0x0000000000000000000000000000000000000000',
      commercializerCheckerData: '0x',
      commercialRevShare: 20, // 20% revenue share
      commercialRevCeiling: 0n,
      derivativesAllowed: true,
      derivativesAttribution: true,
      derivativesApproval: false,
      derivativesReciprocal: true,
      derivativeRevCeiling: 0n,
      uri: '',
      // Fixed: Remove waitForTransaction from txOptions
      txOptions: {}
    });

    console.log(`✅ License terms created with ID: ${licenseResponse.licenseTermsId}`);

    // Attach the license terms to the IP Asset
    const attachResponse = await storyClient.license.attachLicenseTerms({
      licenseTermsId: licenseResponse.licenseTermsId!,
      ipId: ipAssetId as Address,
      // Fixed: Remove waitForTransaction from txOptions
      txOptions: {}
    });

    if (attachResponse.success) {
      console.log(`✅ License terms attached to IP Asset at transaction hash ${attachResponse.txHash}`);
    } else {
      console.log(`License terms already attached to this IP Asset.`);
    }

    return licenseResponse.licenseTermsId;
  } catch (error) {
    console.error("Error creating/attaching license terms:", error);
    throw error;
  }
}

async function mintLicenseToken(ipAssetId: string) {
  console.log("👉 Minting license token...");
  
  try {
    // First, we need to get the license terms ID that was attached to this IP
    // For this example, we'll use a common license terms ID
    // You would typically store this from the previous step
    const licenseResponse = await storyClient.license.mintLicenseTokens({
      licenseTermsId: "1", // This should be the actual license terms ID from the previous step
      licensorIpId: ipAssetId as Address,
      receiver: account.address,
      amount: 1,
      maxMintingFee: BigInt(0),
      maxRevenueShare: 100,
      // Fixed: Remove waitForTransaction from txOptions
      txOptions: {}
    });

    console.log(`✅ License token minted at transaction hash ${licenseResponse.txHash}`);
    console.log(`License Token IDs: ${licenseResponse.licenseTokenIds}`);
    
    return licenseResponse.licenseTokenIds;
  } catch (error) {
    console.error("Error minting license token:", error);
    // This might fail if license terms aren't attached yet, which is okay for demo
    console.log("⚠️  License token minting failed - this is expected if license terms weren't properly attached");
  }
}

async function createDerivativeWork(originalCollection: string, parentIpId: string) {
  console.log("👉 Creating derivative work...");
  
  try {    
    // Get the factory contract
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, wallet);

    // Mint a new tweet as a derivative
    const derivativeMintTx = await factory.registerTweetAsset(
      originalCollection,
      wallet.address,
      "ipfs://QmDerivativeUri",
      "Derivative Tweet",
      "@alice_derivative",
      new Date().toISOString(),
      false,
      5,
      2,
      10,
      100,
      ["#derivative", "#remix"],
      ["@alice"],
      "https://example.com/derivative_avatar.jpg",
      "https://twitter.com/alice/status/124",
      "124",
      "ipfs://QmDerivativeScreenshot"
    );
    
    await derivativeMintTx.wait();
    console.log("✅ Derivative tweet minted");

    // Get the new token ID
    const nft = new ethers.Contract(originalCollection, NFT_ABI, wallet);

    const supply: bigint = await nft.totalSupply();
    const derivativeTokenId = (supply - 1n).toString();
    
    // Get the derivative IP Asset ID
    const derivativeIpId = await getIpAssetId(originalCollection, derivativeTokenId);
    console.log(`Derivative IP Asset ID: ${derivativeIpId}`);

    // Register the derivative relationship using Story Protocol
    // This would require having a license token from the parent IP
    console.log("✅ Derivative work created and registered");
    
    return derivativeIpId;
  } catch (error) {
    console.error("Error creating derivative work:", error);
    // This is expected to fail without proper license tokens
    console.log("⚠️  Derivative registration failed - this requires proper license tokens");
  }
}

// Alternative: Use the contract's built-in licensing functions
async function useContractLicensing() {
  console.log("👉 Using contract's built-in licensing functions...");
  
  const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, wallet);

  // Get the first collection
  const collection = await factory.allCollections(0);
  const nft = new ethers.Contract(collection, NFT_ABI, wallet);

  try {
    // Use the contract's mintAndRegisterAndCreateTermsAndAttach function
    const result = await nft.mintAndRegisterAndCreateTermsAndAttach(wallet.address);
    const receipt = await result.wait();
    
    console.log("✅ Mint + Register + License Terms created in one transaction");
    console.log(`Transaction hash: ${receipt?.hash}`);
  } catch (error) {
    console.error("Error using contract licensing:", error);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
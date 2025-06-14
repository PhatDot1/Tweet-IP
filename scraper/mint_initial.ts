import { ethers } from "hardhat";
import { TweetIPFactory, StoryNFT } from "../typechain-types";
import { http } from "viem";
import { Account, privateKeyToAccount, Address } from "viem/accounts";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import axios from "axios";
import FormData from "form-data";

// Parse command line arguments
function parseArgs(): {
  handle: string;
  mintPrice: string;
  maxSupply: string;
  royaltyReceiver: string;
  royaltyBP: string;
  name: string;
  timestamp: string;
  verified: string;
  content: string;
  comments: string;
  retweets: string;
  likes: string;
  analytics: string;
  tags: string;
  mentions: string;
  profileImg: string;
  tweetLink: string;
  tweetId: string;
  ipfs: string;
  depositor: string;
  recipient: string;
  tweetHash: string;
} {
  const args = process.argv.slice(2);
  const params: any = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    params[key] = value;
  }
  
  return params;
}

// Update with your deployed factory address
const FACTORY_ADDRESS = process.env.TWEET_FACTORY_ADDRESS || "0x8a1885132A04fe94850BEc4f47C55Ca466C7Bb81";

// Story Protocol SDK setup
const privateKey: Address = `0x${process.env.WALLET_PRIVATE_KEY}`;
const account: Account = privateKeyToAccount(privateKey);
const config: StoryConfig = {
  account: account,
  transport: http(process.env.RPC_PROVIDER_URL || "https://aeneid.storyrpc.io"),
  chainId: "aeneid",
};
const storyClient = StoryClient.newClient(config);

async function main() {
  const params = parseArgs();
  
  console.log("📋 Parameters received:");
  console.log("  Handle:", params.handle);
  console.log("  Mint Price:", params.mintPrice);
  console.log("  Max Supply:", params.maxSupply);
  console.log("  Royalty Receiver:", params.royaltyReceiver);
  console.log("  Royalty BP:", params.royaltyBP);
  console.log("  Tweet ID:", params.tweetId);
  console.log("  Tweet Hash:", params.tweetHash);
  
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  // 1) Attach to your deployed factory
  const factory = (await ethers.getContractAt(
    "TweetIPFactory",
    FACTORY_ADDRESS,
    signer
  )) as TweetIPFactory;

  // 2) Create a new collection with dynamic parameters
  console.log("👉 Creating a new Tweet collection for", params.handle);
  const createTx = await factory.createTweetCollection(
    params.handle,
    ethers.parseEther(params.mintPrice || "0"),
    parseInt(params.maxSupply),
    params.royaltyReceiver,
    parseInt(params.royaltyBP)
  );
  await createTx.wait();
  console.log("✅ Collection created");

  // 3) Get the newly deployed collection address
  const total = await factory.totalCollections();
  const lastIndex = total - 1n;
  const collection = await factory.allCollections(lastIndex);
  console.log("Collection address:", collection);

  // 4) Generate metadata for the tweet
  const metadata = {
    name: `Tweet by ${params.name}`,
    description: params.content || "",
    image: params.ipfs, // This is already the IPFS URL from scraper
    external_url: params.tweetLink,
    attributes: [
      { trait_type: "Author", value: params.name },
      { trait_type: "Handle", value: params.handle },
      { trait_type: "Timestamp", value: params.timestamp },
      { trait_type: "Verified", value: params.verified },
      { trait_type: "Comments", value: params.comments },
      { trait_type: "Retweets", value: params.retweets },
      { trait_type: "Likes", value: params.likes },
      { trait_type: "Analytics", value: params.analytics },
      { trait_type: "Tweet ID", value: params.tweetId },
      { trait_type: "Tweet Hash", value: params.tweetHash },
      { trait_type: "Content", value: params.content }
    ]
  };

  // Upload metadata to IPFS
  console.log("📤 Uploading metadata to IPFS...");
  const metadataUri = await uploadMetadataToIPFS(metadata);
  console.log("✅ Metadata uploaded:", metadataUri);

  // 5) Mint & register the tweet
  console.log("👉 Minting & registering tweet", params.tweetId);
  
  // Parse tags and mentions from JSON strings
  const tags = JSON.parse(params.tags || '[]');
  const mentions = JSON.parse(params.mentions || '[]');
  
  const mintTx = await factory.registerTweetAsset(
    collection,
    params.recipient || signer.address, // Use recipient from deposit contract
    metadataUri,
    params.name,
    params.handle,
    params.timestamp,
    params.verified === 'True' || params.verified === 'true',
    parseInt(params.comments),
    parseInt(params.retweets),
    parseInt(params.likes),
    parseInt(params.analytics),
    tags,
    mentions,
    params.profileImg,
    params.tweetLink,
    params.tweetId,
    params.ipfs
  );
  
  const receipt = await mintTx.wait();
  console.log("✅ Mint + IP-registration in block", receipt?.blockNumber || "unknown");

  // 6) Get the NFT contract and token ID
  const nft = (await ethers.getContractAt(
    "StoryNFT",
    collection,
    signer
  )) as StoryNFT;

  const supply: bigint = await nft.totalSupply();
  const tokenId = (supply - 1n).toString();

  console.log(`Token ID: ${tokenId}`);
  console.log(`🔗 View your NFT here:`);
  console.log(`https://aeneid.storyscan.io/token/${collection}/instance/${tokenId}`);

  // 7) Get the IP Asset ID
  console.log("👉 Finding IP Asset ID...");
  const ipAssetId = await getIpAssetId(collection, tokenId);
  console.log(`IP Asset ID: ${ipAssetId}`);

  // 8) Create and attach license terms (can be customized based on deposit params)
  const licenseTermsId = await createAndAttachLicenseTerms(ipAssetId);

  // 9) Mint a license token
  await mintLicenseToken(ipAssetId, licenseTermsId);

  // 10) Log completion for the watch script
  console.log("🎉 Initial mint complete!");
  console.log({
    collection,
    tokenId,
    ipAssetId,
    tweetHash: params.tweetHash,
    tweetId: params.tweetId
  });
}

async function getIpAssetId(nftContract: string, tokenId: string): Promise<string> {
  try {
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
    
    // Calculate IP Asset ID deterministically
    const ipAssetId = ethers.solidityPackedKeccak256(
      ["address", "uint256"],
      [nftContract, tokenId]
    );
    
    console.log("Using calculated IP Asset ID:", ipAssetId);
    return ipAssetId;
  }
}

async function createAndAttachLicenseTerms(ipAssetId: string): Promise<string> {
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
      txOptions: {}
    });

    console.log(`✅ License terms created with ID: ${licenseResponse.licenseTermsId}`);

    // Attach the license terms to the IP Asset
    const attachResponse = await storyClient.license.attachLicenseTerms({
      licenseTermsId: licenseResponse.licenseTermsId!,
      ipId: ipAssetId as Address,
      txOptions: {}
    });

    if (attachResponse.success) {
      console.log(`✅ License terms attached to IP Asset at transaction hash ${attachResponse.txHash}`);
    } else {
      console.log(`License terms already attached to this IP Asset.`);
    }

    return licenseResponse.licenseTermsId?.toString() || "1";
  } catch (error) {
    console.error("Error creating/attaching license terms:", error);
    throw error;
  }
}

async function mintLicenseToken(ipAssetId: string, licenseTermsId: string) {
  console.log("👉 Minting license token...");
  
  try {
    const licenseResponse = await storyClient.license.mintLicenseTokens({
      licenseTermsId: licenseTermsId,
      licensorIpId: ipAssetId as Address,
      receiver: account.address,
      amount: 1,
      maxMintingFee: BigInt(0),
      maxRevenueShare: 100,
      txOptions: {}
    });

    console.log(`✅ License token minted at transaction hash ${licenseResponse.txHash}`);
    console.log(`License Token IDs: ${licenseResponse.licenseTokenIds}`);
    
    return licenseResponse.licenseTokenIds;
  } catch (error) {
    console.error("Error minting license token:", error);
    console.log("⚠️  License token minting failed - this is expected if license terms weren't properly attached");
  }
}

async function uploadMetadataToIPFS(metadata: any): Promise<string> {
  const PINATA_JWT = process.env.PINATA_JWT;
  
  if (!PINATA_JWT) {
    console.warn("⚠️  PINATA_JWT not set, using placeholder URI");
    return `ipfs://metadata_${metadata.attributes.find((a: any) => a.trait_type === "Tweet ID")?.value}`;
  }

  try {
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    const headers = {
      "Authorization": `Bearer ${PINATA_JWT}`,
      "Content-Type": "application/json"
    };

    const response = await axios.post(url, metadata, { headers });
    
    if (response.status === 200) {
      const ipfsHash = response.data.IpfsHash;
      return `ipfs://${ipfsHash}`;
    } else {
      throw new Error(`Failed to pin to IPFS: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    // Fallback to placeholder
    return `ipfs://metadata_${metadata.attributes.find((a: any) => a.trait_type === "Tweet ID")?.value}`;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
// scripts/mint_existing.ts
import { ethers } from "hardhat";
import { TweetIPFactory, StoryNFT } from "../typechain-types";
import { http } from "viem";
import { Account, privateKeyToAccount, Address } from "viem/accounts";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import axios from "axios";
import FormData from "form-data";

// Define the expected data structure
interface StdinData {
  collection: string;
  name: string;
  handle: string;
  timestamp: string;
  verified: string;
  content: string;
  comments: string;
  retweets: string;
  likes: string;
  analytics: string;
  tags: string;
  mentions: string;
  profileimg: string;
  tweetlink: string;
  tweetid: string;
  ipfs: string;
  depositor: string;
  recipient: string;
  tweethash: string;
  collectionaddress: string;
  collectionconfig: any[];
  licensetermsconfig: any[];
  licensemintparams: any[];
  cocreators: any[];
}

// Read data from stdin
async function readStdinData(): Promise<StdinData> {
  return new Promise((resolve, reject) => {
    let data = '';
    
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    
    process.stdin.on('end', () => {
      try {
        const parsed = JSON.parse(data) as StdinData;
        resolve(parsed);
      } catch (error: any) {
        reject(new Error(`Failed to parse stdin JSON: ${error.message}`));
      }
    });
    
    process.stdin.on('error', (error) => {
      reject(error);
    });
  });
}

// ———————————————— CONFIG ————————————————
const FACTORY_ADDRESS = process.env.TWEET_FACTORY_ADDRESS || "0x8a1885132A04fe94850BEc4f47C55Ca466C7Bb81";

const privateKey: Address = `0x${process.env.WALLET_PRIVATE_KEY}`;
const account: Account = privateKeyToAccount(privateKey);
const config: StoryConfig = {
  account,
  transport: http(process.env.RPC_PROVIDER_URL || "https://aeneid.storyrpc.io"),
  chainId: "aeneid",
};
const storyClient = StoryClient.newClient(config);

async function main() {
  try {
    const config = await readStdinData();
    
    // Extract all the values
    const collection = config.collection;
    const name = config.name;
    const handle = config.handle;
    const timestamp = config.timestamp;
    const verified = config.verified;
    const content = config.content;
    const comments = config.comments;
    const retweets = config.retweets;
    const likes = config.likes;
    const analytics = config.analytics;
    const tags = config.tags;
    const mentions = config.mentions;
    const profileImg = config.profileimg;
    const tweetLink = config.tweetlink;
    const tweetId = config.tweetid;
    const ipfs = config.ipfs;
    const depositor = config.depositor;
    const recipient = config.recipient;
    const tweetHash = config.tweethash;
    const collectionAddress = config.collectionaddress;
    const collectionConfig = config.collectionconfig;
    const licenseTermsConfig = config.licensetermsconfig;
    const licenseMintParams = config.licensemintparams;
    const coCreators = config.cocreators;
    
    console.log("📋 Parameters received:");
    console.log("  Collection:", collection);
    console.log("  Handle:", handle);
    console.log("  Tweet ID:", tweetId);
    console.log("  Tweet Hash:", tweetHash);
    console.log("  Recipient:", recipient);
    
    const [signer] = await ethers.getSigners();
    console.log("Using signer:", signer.address);

    // attach to factory (we need it to call registerTweetAsset)
    const factory = (await ethers.getContractAt(
      "TweetIPFactory",
      FACTORY_ADDRESS,
      signer
    )) as TweetIPFactory;

    console.log("🚀 Minting into existing collection:", collection);

    // 1) Generate metadata for the tweet
    const metadata = {
      name: `Tweet by ${name}`,
      description: content || "",
      image: ipfs, // This is already the IPFS URL from scraper
      external_url: tweetLink,
      attributes: [
        { trait_type: "Author", value: name },
        { trait_type: "Handle", value: handle },
        { trait_type: "Timestamp", value: timestamp },
        { trait_type: "Verified", value: verified },
        { trait_type: "Comments", value: comments },
        { trait_type: "Retweets", value: retweets },
        { trait_type: "Likes", value: likes },
        { trait_type: "Analytics", value: analytics },
        { trait_type: "Tweet ID", value: tweetId },
        { trait_type: "Tweet Hash", value: tweetHash },
        { trait_type: "Depositor", value: depositor },
        { trait_type: "Content", value: content }
      ]
    };

    // Upload metadata to IPFS
    console.log("📤 Uploading metadata to IPFS...");
    const metadataUri = await uploadMetadataToIPFS(metadata);
    console.log("✅ Metadata uploaded:", metadataUri);

    // 2) Mint & register the tweet
    console.log("👉 Minting & registering tweet", tweetId);
    
    // Parse tags and mentions
    const parsedTags = JSON.parse(tags || '[]');
    const parsedMentions = JSON.parse(mentions || '[]');
    
    const mintTx = await factory.registerTweetAsset(
      collection,
      recipient || signer.address,
      metadataUri,
      name,
      handle,
      timestamp,
      verified === 'True' || verified === 'true',
      parseInt(comments),
      parseInt(retweets),
      parseInt(likes),
      parseInt(analytics),
      parsedTags,
      parsedMentions,
      profileImg,
      tweetLink,
      tweetId,
      ipfs
    );
    const receipt = await mintTx.wait();
    console.log("✅ Mint + IP-registration in block", receipt?.blockNumber || "unknown");

    // 3) Figure out your new tokenId
    const nft = (await ethers.getContractAt(
      "StoryNFT",
      collection,
      signer
    )) as StoryNFT;
    const supply: bigint = await nft.totalSupply();
    const tokenId = (supply - 1n).toString();
    console.log(`Token ID: ${tokenId}`);
    console.log(
      `🔗 View your NFT here:\n` +
      `https://aeneid.storyscan.io/token/${collection}/instance/${tokenId}`
    );

    // 4) Register it on Story IP registry (and get ipAssetId)
    console.log("👉 Finding IP Asset ID...");
    const ipAssetId = await getIpAssetId(collection, tokenId);
    console.log(`IP Asset ID: ${ipAssetId}`);

    // 5) Create & attach license terms
    const licenseTermsId = await createAndAttachLicenseTerms(ipAssetId);

    // 6) Mint a license token
    await mintLicenseToken(ipAssetId, licenseTermsId);

    // 7) Log completion for the watch script
    console.log("🎉 Existing collection mint complete!");
    console.log({
      collection: collection,
      tokenId,
      ipAssetId,
      tweetHash: tweetHash,
      tweetId: tweetId
    });
    
  } catch (error: any) {
    console.error('Error reading stdin data or processing:', error.message);
    process.exit(1);
  }
}

async function getIpAssetId(nftContract: string, tokenId: string): Promise<string> {
  try {
    const resp = await storyClient.ipAsset.register({
      nftContract: nftContract as Address,
      tokenId,
      ipMetadata: {
        ipMetadataURI:   "",
        ipMetadataHash:  "0x0000000000000000000000000000000000000000000000000000000000000000",
        nftMetadataURI:  "",
        nftMetadataHash: "0x0000000000000000000000000000000000000000000000000000000000000000"
      }
    });
    return resp.ipId || "";
  } catch (error) {
    console.error("Error getting IP Asset ID:", error);
    // fallback: deterministic keccak
    const ipAssetId = ethers.solidityPackedKeccak256(
      ["address", "uint256"],
      [nftContract, tokenId]
    );
    console.log("Using calculated IP Asset ID:", ipAssetId);
    return ipAssetId;
  }
}

async function createAndAttachLicenseTerms(ipAssetId: string): Promise<string> {
  console.log("👉 Creating & attaching license terms...");
  
  try {
    const licResp = await storyClient.license.registerPILTerms({
      defaultMintingFee: 0n,
      currency:         '0x1514000000000000000000000000000000000000',
      royaltyPolicy:    '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E',
      transferable:      true,
      expiration:        0n,
      commercialUse:     true,
      commercialAttribution: true,
      commercializerChecker:     '0x0000000000000000000000000000000000000000',
      commercializerCheckerData: '0x',
      commercialRevShare:       20,
      commercialRevCeiling:     0n,
      derivativesAllowed:       true,
      derivativesAttribution:   true,
      derivativesApproval:      false,
      derivativesReciprocal:    true,
      derivativeRevCeiling:     0n,
      uri:                      "",
      txOptions: {}
    });
    console.log(`✅ LicenseTerms ID: ${licResp.licenseTermsId}`);

    const attach = await storyClient.license.attachLicenseTerms({
      licenseTermsId: licResp.licenseTermsId!,
      ipId:           ipAssetId as Address,
      txOptions:     {}
    });
    if (attach.success) {
      console.log("✅ Attached licence → tx", attach.txHash);
    } else {
      console.log("ℹ️  License already attached");
    }
    
    return licResp.licenseTermsId?.toString() || "1";
  } catch (error) {
    console.error("Error creating/attaching license terms:", error);
    throw error;
  }
}

async function mintLicenseToken(ipAssetId: string, licenseTermsId: string) {
  console.log("👉 Minting license token...");
  
  try {
    const resp = await storyClient.license.mintLicenseTokens({
      licenseTermsId:  licenseTermsId,  // Use the actual license terms ID
      licensorIpId:    ipAssetId as Address,
      receiver:        account.address,
      amount:          1,
      maxMintingFee:   0n,
      maxRevenueShare: 100,
      txOptions:      {}
    });
    console.log("✅ License token minted →", resp.txHash);
    console.log("   Token IDs:", resp.licenseTokenIds);
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

// Make sure to call main() and handle it properly
main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
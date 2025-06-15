import { ethers } from "hardhat";
import { TweetIPFactory, StoryNFT } from "../typechain-types";
import { http } from "viem";
import { Account, privateKeyToAccount, Address } from "viem/accounts";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import axios from "axios";
import FormData from "form-data";

// Read data from stdin
async function readStdinData(): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    
    process.stdin.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse stdin JSON: ${(err as Error).message}`));
      }
    });
    
    process.stdin.on('error', (error) => {
      reject(error);
    });
  });
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
  try {
    const rawConfig = await readStdinData();
    
    // Use JavaScript-style bracket notation to bypass TypeScript checking
    const handle = rawConfig['handle'];
    const mintPrice = rawConfig['mintprice'];
    const maxSupply = rawConfig['maxsupply'];
    const royaltyReceiver = rawConfig['royaltyreceiver'];
    const royaltyBp = rawConfig['royaltybp'];
    const name = rawConfig['name'];
    const timestamp = rawConfig['timestamp'];
    const verified = rawConfig['verified'];
    const content = rawConfig['content'];
    const comments = rawConfig['comments'];
    const retweets = rawConfig['retweets'];
    const likes = rawConfig['likes'];
    const analytics = rawConfig['analytics'];
    const tags = rawConfig['tags'];
    const mentions = rawConfig['mentions'];
    const profileImg = rawConfig['profileimg'];
    const tweetLink = rawConfig['tweetlink'];
    const tweetId = rawConfig['tweetid'];
    const ipfs = rawConfig['ipfs'];
    const depositor = rawConfig['depositor'];
    const recipient = rawConfig['recipient'];
    const tweetHash = rawConfig['tweethash'];
    const collectionAddress = rawConfig['collectionaddress'];
    const collectionConfig = rawConfig['collectionconfig'];
    const licenseTermsConfig = rawConfig['licensetermsconfig'];
    const licenseMintParams = rawConfig['licensemintparams'];
    const coCreators = rawConfig['cocreators'];
    
    console.log("📋 Parameters received:");
    console.log("  Handle:", handle);
    console.log("  Mint Price:", mintPrice);
    console.log("  Max Supply:", maxSupply);
    console.log("  Royalty Receiver:", royaltyReceiver);
    console.log("  Royalty BP:", royaltyBp);
    console.log("  Tweet ID:", tweetId);
    console.log("  Tweet Hash:", tweetHash);
    
    const [signer] = await ethers.getSigners();
    console.log("Using signer:", signer.address);

    // 1) Attach to your deployed factory
    const factory = (await ethers.getContractAt(
      "TweetIPFactory",
      FACTORY_ADDRESS,
      signer
    )) as TweetIPFactory;

    // 2) Create a new collection with dynamic parameters
    console.log("👉 Creating a new Tweet collection for", handle);
    const createTx = await factory.createTweetCollection(
      handle,
      ethers.parseEther(mintPrice || "0"),
      parseInt(maxSupply),
      royaltyReceiver,
      parseInt(royaltyBp)
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
        { trait_type: "Content", value: content }
      ]
    };

    // Upload metadata to IPFS
    console.log("📤 Uploading metadata to IPFS...");
    const metadataUri = await uploadMetadataToIPFS(metadata);
    console.log("✅ Metadata uploaded:", metadataUri);

    // 5) Mint & register the tweet
    console.log("👉 Minting & registering tweet", tweetId);
    
    // Parse tags and mentions from JSON strings
    const parsedTags = JSON.parse(tags || '[]');
    const parsedMentions = JSON.parse(mentions || '[]');
    
    const mintTx = await factory.registerTweetAsset(
      collection,
      recipient || signer.address, // Use recipient from deposit contract
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
      tweetHash: tweetHash,
      tweetId: tweetId
    });
    
  } catch (err) {
    console.error('Error reading stdin data or processing:', (err as Error).message);
    process.exit(1);
  }
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
  } catch (err) {
    console.error("Error getting IP Asset ID:", err);
    
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
  } catch (err) {
    console.error("Error creating/attaching license terms:", err);
    throw err;
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
  } catch (err) {
    console.error("Error minting license token:", err);
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
  } catch (err) {
    console.error("Error uploading to IPFS:", err);
    // Fallback to placeholder
    return `ipfs://metadata_${metadata.attributes.find((a: any) => a.trait_type === "Tweet ID")?.value}`;
  }
}

// Make sure to call main() and handle it properly
main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
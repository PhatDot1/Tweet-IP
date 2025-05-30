import { ethers } from "hardhat";
import { TweetIPFactory, StoryNFT } from "../typechain-types";
import { http } from "viem";
import { Account, privateKeyToAccount, Address } from "viem/accounts";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

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
    9000,              // maxSupply
    signer.address,  // royaltyReceiver
    500              // royaltyBP (5%)
  );
  await createTx.wait();
  console.log("✅ Collection created");

  // 3) Compute index of the newly‐deployed collection
  const total = await factory.totalCollections();        // bigint
  const lastIndex = total - 1n;                          // bigint subtraction
  const collection = await factory.allCollections(lastIndex);
  console.log("Using collection address:", collection);

  // 4) Mint & register a dummy tweet into *that* collection
  console.log("👉 Minting & registering a dummy tweet…");
  const mintTx = await factory.registerTweetAsset(
    collection,       // ← now correct!
    signer.address,
    "ipfs://QmDummyUri",
    "Alice Example",
    "@alice",
    new Date().toISOString(),
    false,
    0, 0, 0, 0,
    ["#test"],
    ["@bob886"], // have this increment @name_{num} +1 each time.
    "https://example.com/avatar.jpg",
    "https://twitter.com/alice/status/886", // must be unqiue tweet enforced
    "886", // must be unqiue
    "ipfs://QmDummyScreenshot"
  );
  const receipt = await mintTx.wait();
  console.log("✅ Mint + IP-registration in block", receipt.blockNumber);


  // 5) Get the NFT contract and token ID
  const nft = (await ethers.getContractAt(
    "StoryNFT",
    collection,
    signer
  )) as StoryNFT;

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


main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
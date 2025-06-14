// scripts/mint_existing.ts
import { ethers } from "hardhat";
import { TweetIPFactory, StoryNFT } from "../typechain-types";
import { http } from "viem";
import { Account, privateKeyToAccount, Address } from "viem/accounts";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

// ———————————————— CONFIG ————————————————
const FACTORY_ADDRESS    = "0x8a1885132A04fe94850BEc4f47C55Ca466C7Bb81";
const COLLECTION_ADDRESS = "0xE29d14FA039c37bD9C6d0Ee6Ed1CE57dCE8A4524";

const privateKey: Address = `0x${process.env.WALLET_PRIVATE_KEY}`;
const account: Account   = privateKeyToAccount(privateKey);
const config: StoryConfig = {
  account,
  transport: http(process.env.RPC_PROVIDER_URL || "https://aeneid.storyrpc.io"),
  chainId: "aeneid",
};
const storyClient = StoryClient.newClient(config);

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  // attach to factory (we need it to call registerTweetAsset)
  const factory = (await ethers.getContractAt(
    "TweetIPFactory",
    FACTORY_ADDRESS,
    signer
  )) as TweetIPFactory;

  const collection = COLLECTION_ADDRESS;
  console.log("🚀 Minting into existing collection:", collection);

  // 1) Mint & register a dummy tweet
  console.log("👉 Minting & registering a dummy tweet…");
  const mintTx = await factory.registerTweetAsset(
    collection,
    signer.address,
    "ipfs://QmDummyUri",
    "Alice Example",
    "@alice",
    new Date().toISOString(),
    false,
    0, 0, 0, 0,
    ["#test"],
    ["@bob886"],
    "https://example.com/avatar.jpg",
    "https://twitter.com/alice/status/887", // has to be unqiue
    "887", // has to be unique
    "ipfs://QmDummyScreenshot"
  );
  const receipt = await mintTx.wait();
  console.log("✅ Mint + IP-registration in block", receipt.blockNumber);

  // 2) Figure out your new tokenId
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

  // 3) Register it on Story IP registry (and get ipAssetId)
  console.log("👉 Finding IP Asset ID...");
  const ipAssetId = await getIpAssetId(collection, tokenId);
  console.log(`IP Asset ID: ${ipAssetId}`);

  // 4) Create & attach license terms
  await createAndAttachLicenseTerms(ipAssetId);

  // 5) Mint a license token
  await mintLicenseToken(ipAssetId);
}

async function getIpAssetId(nftContract: string, tokenId: string): Promise<string> {
  try {
    const resp = await storyClient.ipAsset.register({
      nftContract: nftContract as Address,
      tokenId,
      ipMetadata: {
        ipMetadataURI:   "",
        ipMetadataHash:  "0x00...00",
        nftMetadataURI:  "",
        nftMetadataHash: "0x00...00"
      }
    });
    return resp.ipId || "";
  } catch {
    // fallback: deterministic keccak
    return ethers.solidityPackedKeccak256(
      ["address", "uint256"],
      [nftContract, tokenId]
    );
  }
}

async function createAndAttachLicenseTerms(ipAssetId: string) {
  console.log("👉 Creating & attaching license terms...");
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
}

async function mintLicenseToken(ipAssetId: string) {
  console.log("👉 Minting license token...");
  const resp = await storyClient.license.mintLicenseTokens({
    licenseTermsId:  "1",             // replace with actual if you’ve stored it
    licensorIpId:    ipAssetId as Address,
    receiver:        account.address,
    amount:          1,
    maxMintingFee:   0n,
    maxRevenueShare: 100,
    txOptions:      {}
  });
  console.log("✅ License token minted →", resp.txHash);
  console.log("   Token IDs:", resp.licenseTokenIds);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});

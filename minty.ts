#!/usr/bin/env ts-node

import "dotenv/config";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { Account, Address } from "viem";
import { createWalletClient } from "viem";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import * as ethers from "ethers";

// ─────────────────────────────────────────────────────────────────────────────
// 🎯 CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const RPC_URL = process.env.RPC_PROVIDER_URL || "https://aeneid.storyrpc.io";
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
if (!PRIVATE_KEY) throw new Error("set WALLET_PRIVATE_KEY in .env");

const FACTORY_ADDRESS = "0x8a1885132A04fe94850BEc4f47C55Ca466C7Bb81" as Address;

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 SETUP clients
// ─────────────────────────────────────────────────────────────────────────────

// Viem wallet client (for signing SDK calls)
const account: Account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
const aeneidChain = {
  id: 1315,
  name: "aeneid",
  network: "aeneid",
  rpcUrls: {
    default: { http: [RPC_URL] },
    public:  { http: [RPC_URL] },
  },
  nativeCurrency: {
    name: "Wrapped Aeneid",
    symbol: "WIP",
    decimals: 18,
  },
  blockExplorers: {
    default: {
      name: "AeneidScan",
      url: "https://aeneid.storyscan.io",
    },
  },
  testnet: true,
} as const;

createWalletClient({
  transport: http(RPC_URL),
  account,
  chain: aeneidChain,
});

// Ethers.js provider + signer
const ethersProvider = new ethers.JsonRpcProvider(RPC_URL, 1315);
const signer = new ethers.Wallet(PRIVATE_KEY, ethersProvider);

// Story SDK client
const storyClient = StoryClient.newClient({
  account,
  transport: http(RPC_URL),
  chainId: "aeneid",
});

// ─────────────────────────────────────────────────────────────────────────────
// 🛠 UTILS
// ─────────────────────────────────────────────────────────────────────────────

async function waitTx(hash: string) {
  const receipt = await ethersProvider.waitForTransaction(hash);
  if (!receipt || receipt.status !== 1) {
    throw new Error(`tx ${hash} failed or reverted`);
  }
  return receipt;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const myAddress = (await signer.getAddress()) as Address;
  console.log("Using signer:", myAddress);

  // 1) Factory
  const factory = new ethers.Contract(
    FACTORY_ADDRESS,
    [
      "function createTweetCollection(string,uint256,uint256,address,uint96)",
      "function allCollections(uint256) view returns (address)",
      "function registerTweetAsset(address,address,string,string,string,string,bool,uint256,uint256,uint256,uint256,string[],string[],string,string,string,string)"
    ],
    signer
  );

  // 2) Create collection
  console.log("👉 Creating a new Tweet collection...");
  const txCreate = await factory.createTweetCollection(
    "@alice", 0, 10, myAddress, 500
  );
  await waitTx(txCreate.hash);
  console.log("✅ Collection created");

  // 3) Get collection
  const collection = await factory.allCollections(0);
  console.log("Using collection address:", collection);

  // 4) Mint & register
  console.log("👉 Minting & registering a dummy tweet...");
  const txMint = await factory.registerTweetAsset(
    collection,
    myAddress,
    "ipfs://QmDummyUri",
    "Alice Example",
    "@alice",
    new Date().toISOString(),
    false,
    0,0,0,0,
    ["#test"],
    ["@bob"],
    "https://example.com/avatar.jpg",
    "https://twitter.com/alice/status/123",
    "123",
    "ipfs://QmDummyScreenshot"
  );
  await waitTx(txMint.hash);
  console.log("✅ Mint + IP-registration complete");

  // 5) Token ID
  const nft = new ethers.Contract(
    collection,
    ["function totalSupply() view returns (uint256)"],
    signer
  );
  const supply = (await nft.totalSupply()).toBigInt();
  const tokenId = (supply - 1n).toString();
  console.log("Token ID:", tokenId);
  console.log(`🔗 https://aeneid.storyscan.io/token/${collection}/instance/${tokenId}`);

  // 6) Register IP Asset
  console.log("👉 Registering IP Asset...");
  const ipResp = await storyClient.ipAsset.register({
    nftContract: collection as Address,
    tokenId,
    ipMetadata: {
      ipMetadataURI: "",
      // ← cast to the `0x${string}` template type:
      ipMetadataHash: ("0x" + "0".repeat(64)) as `0x${string}`,
      nftMetadataURI: "",
      nftMetadataHash: ("0x" + "0".repeat(64)) as `0x${string}`,
    },
  });
  const ipId = ipResp.ipId! as Address;
  console.log("IP Asset ID:", ipId);

  // 7) License terms
  console.log("👉 Creating & attaching license terms...");
  const licResp = await storyClient.license.registerPILTerms({
    defaultMintingFee: 0n,
    currency: "0x1514000000000000000000000000000000000000",
    royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
    transferable: true,
    expiration: 0n,
    commercialUse: true,
    commercialAttribution: true,
    commercializerChecker: "0x0000000000000000000000000000000000000000",
    commercializerCheckerData: "0x",
    commercialRevShare: 20,
    commercialRevCeiling: 0n,
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: true,
    derivativeRevCeiling: 0n,
    uri: "",
    txOptions: {},
  });
  console.log("✅ License terms created with ID:", licResp.licenseTermsId);

  const attachResp = await storyClient.license.attachLicenseTerms({
    licenseTermsId: licResp.licenseTermsId!,
    ipId,
    txOptions: {},
  });
  console.log("✅ License attached:", attachResp.txHash);

  // 8) Mint license token
  console.log("👉 Minting license token...");
  const mintLic = await storyClient.license.mintLicenseTokens({
    licenseTermsId: licResp.licenseTermsId!,
    licensorIpId: ipId,
    receiver: myAddress,
    amount: 1,
    maxMintingFee: 0n,
    maxRevenueShare: 100,
    txOptions: {},
  });
  console.log("✅ License token tx:", mintLic.txHash);

  // 9) Optional derivative
  console.log("👉 Minting a derivative tweet…");
  const txDeriv = await factory.registerTweetAsset(
    collection,
    myAddress,
    "ipfs://QmDerivUri",
    "Derivative Tweet",
    "@alice_derivative",
    new Date().toISOString(),
    false,
    5,2,10,100,
    ["#derivative"],
    ["@alice"],
    "https://example.com/deriv.jpg",
    "https://twitter.com/alice/status/124",
    "124",
    "ipfs://QmDerivScreenshot"
  );
  await waitTx(txDeriv.hash);
  console.log("✅ Derivative minted");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

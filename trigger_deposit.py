#!/usr/bin/env python3
"""
Script to submit a test deposit to the IP_Deposit contract
Adjust the hardcoded values as needed for testing
"""

import os
import sys
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
RPC_URL          = os.getenv("RPC_URL", "https://aeneid.storyrpc.io")
PRIVATE_KEY      = os.getenv("PRIVATE_KEY")
DEPOSIT_CONTRACT = os.getenv("DEPOSIT_CONTRACT", "0x03D95676b52E5b1D65345D6fbAA5CC9319297026")

if not PRIVATE_KEY:
    print("❌ PRIVATE_KEY not found in .env file")
    sys.exit(1)

# Connect to the network
w3      = Web3(Web3.HTTPProvider(RPC_URL))
account = Account.from_key(PRIVATE_KEY)

print(f"🔗 Connected to: {RPC_URL}")
print(f"👤 Depositor address: {account.address}")
print(f"💰 Balance: {w3.from_wei(w3.eth.get_balance(account.address), 'ether')} IP")

# Contract ABI (only the depositIP function we need)
DEPOSIT_ABI = [{
    "inputs": [
        {"internalType": "address", "name": "recipient",          "type": "address"},
        {"internalType": "string",  "name": "validation",         "type": "string"},
        {"internalType": "bytes",   "name": "proof",              "type": "bytes"},
        {"internalType": "address", "name": "collectionAddress",  "type": "address"},
        {
            "components": [
                {"internalType": "string",  "name": "handle",         "type": "string"},
                {"internalType": "uint256", "name": "mintPrice",      "type": "uint256"},
                {"internalType": "uint256", "name": "maxSupply",      "type": "uint256"},
                {"internalType": "address", "name": "royaltyReceiver","type": "address"},
                {"internalType": "uint96",  "name": "royaltyBP",      "type": "uint96"}
            ],
            "internalType": "struct IP_Deposit.CollectionConfig",
            "name": "collectionConfig",
            "type": "tuple"
        },
        {"internalType": "bytes32", "name": "tweetHash",          "type": "bytes32"},
        {
            "components": [
                {"internalType": "uint256","name":"defaultMintingFee","type":"uint256"},
                {"internalType": "address","name":"currency",         "type":"address"},
                {"internalType": "address","name":"royaltyPolicy",    "type":"address"},
                {"internalType": "bool",   "name":"transferable",     "type":"bool"},
                {"internalType": "uint256","name":"expiration",       "type":"uint256"},
                {"internalType": "bool",   "name":"commercialUse",    "type":"bool"},
                {"internalType": "bool",   "name":"commercialAttribution","type":"bool"},
                {"internalType": "uint256","name":"commercialRevShare","type":"uint256"},
                {"internalType": "uint256","name":"commercialRevCeiling","type":"uint256"},
                {"internalType": "bool",   "name":"derivativesAllowed","type":"bool"},
                {"internalType": "bool",   "name":"derivativesAttribution","type":"bool"},
                {"internalType": "bool",   "name":"derivativesApproval","type":"bool"},
                {"internalType": "bool",   "name":"derivativesReciprocal","type":"bool"},
                {"internalType": "uint256","name":"derivativeRevCeiling","type":"uint256"},
                {"internalType": "string", "name":"uri",              "type":"string"}
            ],
            "internalType": "struct IP_Deposit.LicenseTermsConfig",
            "name": "licenseTermsConfig",
            "type": "tuple"
        },
        {
            "components": [
                {"internalType": "uint256","name":"licenseTermsId", "type":"uint256"},
                {"internalType": "address","name":"licensorIpId",   "type":"address"},
                {"internalType": "address","name":"receiver",       "type":"address"},
                {"internalType": "uint256","name":"amount",         "type":"uint256"},
                {"internalType": "uint256","name":"maxMintingFee",  "type":"uint256"},
                {"internalType": "uint256","name":"maxRevenueShare","type":"uint256"}
            ],
            "internalType": "struct IP_Deposit.LicenseMintParams",
            "name": "licenseMintParams",
            "type": "tuple"
        },
        {
            "components": [
                {"internalType": "string", "name":"name",   "type":"string"},
                {"internalType": "address","name":"wallet", "type":"address"}
            ],
            "internalType": "struct IP_Deposit.CoCreator[]",
            "name": "coCreators",
            "type": "tuple[]"
        }
    ],
    "name": "depositIP",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
}]

contract = w3.eth.contract(
    address=Web3.to_checksum_address(DEPOSIT_CONTRACT),
    abi=DEPOSIT_ABI
)

# ==========================================
# HARDCODED TEST VALUES — MODIFY AS NEEDED
# ==========================================

RECIPIENT           = account.address
VALIDATION          = "twitter-verification"

# **PROOF** now carries the real tweet URL bytes
TWEET_URL           = "https://x.com/randombongocat/status/1935457099586175046"
PROOF               = TWEET_URL.encode("utf-8")

# Collection config
COLLECTION_ADDRESS  = "0x0000000000000000000000000000000000000000"
COLLECTION_CONFIG   = {
    "handle":           "@randombongocat",
    "mintPrice":        w3.to_wei(0.01, "ether"),
    "maxSupply":        100,
    "royaltyReceiver":  account.address,
    "royaltyBP":        500
}

# On-chain hash of the URL
TWEET_HASH          = w3.keccak(text=TWEET_URL)

# License terms
LICENSE_TERMS_CONFIG = {
    "defaultMintingFee":      0,
    "currency":               "0x1514000000000000000000000000000000000000",
    "royaltyPolicy":          "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
    "transferable":           True,
    "expiration":             0,
    "commercialUse":          True,
    "commercialAttribution":  True,
    "commercialRevShare":     20,
    "commercialRevCeiling":   0,
    "derivativesAllowed":     True,
    "derivativesAttribution": True,
    "derivativesApproval":    False,
    "derivativesReciprocal":  True,
    "derivativeRevCeiling":   0,
    "uri":                    ""
}

LICENSE_MINT_PARAMS = {
    "licenseTermsId": 1,
    "licensorIpId":   "0x0000000000000000000000000000000000000000",
    "receiver":       account.address,
    "amount":         1,
    "maxMintingFee":  0,
    "maxRevenueShare":100
}

CO_CREATORS = [
    {"name": "Patrick", "wallet": "0x1fF116257e646b6C0220a049e893e81DE87fc475"}
]

DEPOSIT_AMOUNT = w3.to_wei(1, "ether")

# ==========================================
# BUILD & SEND
# ==========================================

print("\n📝 Preparing deposit transaction…")
print(f"   Tweet URL:      {TWEET_URL}")
print(f"   Encoded proof:  {PROOF!r}")
print(f"   Tweet Hash:     {TWEET_HASH.hex()}")
print(f"   Deposit Amount: {w3.from_wei(DEPOSIT_AMOUNT,'ether')} IP")

nonce = w3.eth.get_transaction_count(account.address)
tx = contract.functions.depositIP(
    RECIPIENT,
    VALIDATION,
    PROOF,
    COLLECTION_ADDRESS,
    COLLECTION_CONFIG,
    TWEET_HASH,
    LICENSE_TERMS_CONFIG,
    LICENSE_MINT_PARAMS,
    CO_CREATORS
).build_transaction({
    "from":     account.address,
    "value":    DEPOSIT_AMOUNT,
    "gas":      5_000_000,
    "gasPrice": w3.eth.gas_price,
    "nonce":    nonce,
})

signed = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
print("\n🚀 Sending transaction…")
tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
print(f"✅ Transaction sent: {tx_hash.hex()}\n")

print("⏳ Waiting for confirmation…")
receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
if receipt.status == 1:
    print(f"✅ Confirmed in block {receipt.blockNumber}; gas used {receipt.gasUsed}")
    print("🎉 Deposit successful! The watcher will now see the real URL & tweet ID.")
else:
    print("❌ Transaction failed:", receipt)

print(f"\n📊 View on explorer: https://aeneid.storyscan.io/tx/{tx_hash.hex()}")

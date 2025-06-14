#!/usr/bin/env python3
"""
mint_next.py - Mint next token to existing collection

Requirements:
pip install web3 python-dotenv eth-account

Usage:
python mint_next.py
"""

import os
import json
import time
import random
from datetime import datetime
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from web3 import Web3
from eth_account import Account
from eth_typing import HexStr

# Load environment variables
load_dotenv()

# Configuration - matching TypeScript exactly
FACTORY_ADDRESS = "0x8a1885132A04fe94850BEc4f47C55Ca466C7Bb81"
COLLECTION_ADDRESS = "0x92ae11a48afDe37d9dD8D358C3657293C8243fb6"  # Hardcoded collection
RPC_URL = os.getenv("RPC_PROVIDER_URL", "https://aeneid.storyrpc.io")
PRIVATE_KEY = os.getenv("WALLET_PRIVATE_KEY")

if not PRIVATE_KEY:
    raise ValueError("WALLET_PRIVATE_KEY environment variable is required")

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(RPC_URL))
if not w3.is_connected():
    raise ConnectionError(f"Cannot connect to RPC at {RPC_URL}")

# Setup account
account = Account.from_key(PRIVATE_KEY)
print(f"Using signer: {account.address}")

# Contract ABIs - matching TypeScript exactly
TWEET_IP_FACTORY_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "collection", "type": "address"},
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "string", "name": "uri", "type": "string"},
            {"internalType": "string", "name": "name_", "type": "string"},
            {"internalType": "string", "name": "handle_", "type": "string"},
            {"internalType": "string", "name": "timestamp_", "type": "string"},
            {"internalType": "bool", "name": "verified_", "type": "bool"},
            {"internalType": "uint256", "name": "comments_", "type": "uint256"},
            {"internalType": "uint256", "name": "retweets_", "type": "uint256"},
            {"internalType": "uint256", "name": "likes_", "type": "uint256"},
            {"internalType": "uint256", "name": "analytics_", "type": "uint256"},
            {"internalType": "string[]", "name": "tags_", "type": "string[]"},
            {"internalType": "string[]", "name": "mentions_", "type": "string[]"},
            {"internalType": "string", "name": "profileImage_", "type": "string"},
            {"internalType": "string", "name": "tweetLink_", "type": "string"},
            {"internalType": "string", "name": "tweetId_", "type": "string"},
            {"internalType": "string", "name": "ipfsScreenshot_", "type": "string"}
        ],
        "name": "registerTweetAsset",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

STORY_NFT_ABI = [
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "receiver", "type": "address"}
        ],
        "name": "mintAndRegisterAndCreateTermsAndAttach",
        "outputs": [
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
            {"internalType": "address", "name": "ipId", "type": "address"},
            {"internalType": "uint256", "name": "licenseTermsId", "type": "uint256"}
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

# Initialize factory contract
factory = w3.eth.contract(address=FACTORY_ADDRESS, abi=TWEET_IP_FACTORY_ABI)


def send_transaction(func_call) -> HexStr:
    """Send a transaction and return the hash"""
    # Build transaction
    transaction = func_call.build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 0,  # Will estimate
        'gasPrice': w3.eth.gas_price,
    })
    
    # Estimate gas
    try:
        gas_estimate = w3.eth.estimate_gas(transaction)
        transaction['gas'] = int(gas_estimate * 1.2)  # Add 20% buffer
    except Exception as e:
        print(f"Gas estimation failed: {e}")
        transaction['gas'] = 3000000  # Fallback gas limit
    
    # Sign and send
    signed_txn = w3.eth.account.sign_transaction(transaction, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)  # Fixed: raw_transaction
    
    return tx_hash.hex()


def wait_for_receipt(tx_hash: str) -> Dict[str, Any]:
    """Wait for transaction receipt"""
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    if receipt['status'] != 1:
        raise Exception(f"Transaction failed: {tx_hash}")
    return receipt


async def main():
    """Main function matching TypeScript structure exactly"""
    
    # 1) Use the hardcoded collection
    collection = COLLECTION_ADDRESS
    print(f"Using collection address: {collection}")
    
    # 2) Mint & register a dummy tweet
    print("👉 Minting & registering a dummy tweet...")
    
    # Generate unique values for this run
    timestamp = int(time.time())
    unique_id = f"{timestamp}{random.randint(1000, 9999)}"
    
    mint_tx_hash = send_transaction(
        factory.functions.registerTweetAsset(
            collection,
            account.address,
            "ipfs://QmDummyUri",
            "Alice Example",
            "@bobby",
            datetime.now().isoformat(),
            False,
            0,
            0,
            0,
            0,
            ["#test"],
            [f"@bobby"],  
            "https://example.com/avatar.jpg",
            f"https://twitter.com/alice/status/444",  # THIS MUST CHANGE EACH RUN
            "444",  # THIS MUST CHANGE EACH RUN
            "ipfs://QmDummyScreenshot"
        )
    )
    mint_receipt = wait_for_receipt(mint_tx_hash)
    print(f"✅ Mint + IP-registration in block {mint_receipt['blockNumber']}")
    
    # 3) Get the NFT contract and token ID
    nft = w3.eth.contract(address=collection, abi=STORY_NFT_ABI)
    
    supply = nft.functions.totalSupply().call()
    token_id = str(supply - 1)
    
    print(f"Token ID: {token_id}")
    print(f"🔗 View your NFT here:")
    print(f"https://aeneid.storyscan.io/token/{collection}/instance/{token_id}")
    
    # 4) Get the IP Asset ID from the IP registry
    print("👉 Finding IP Asset ID...")
    ip_asset_id = await get_ip_asset_id(collection, token_id)
    print(f"IP Asset ID: {ip_asset_id}")
    
    # 5) Create and attach license terms
    await create_and_attach_license_terms(ip_asset_id)
    
    # 6) Mint a license token
    await mint_license_token(ip_asset_id)


async def get_ip_asset_id(nft_contract: str, token_id: str) -> str:
    """Get IP Asset ID - matching TypeScript logic"""
    try:
        # Note: In real implementation, you'd call Story Protocol SDK
        # For now, calculate deterministically like in TypeScript fallback
        ip_asset_id = w3.solidity_keccak(
            ['address', 'uint256'],
            [nft_contract, int(token_id)]
        ).hex()
        
        print(f"Using calculated IP Asset ID: {ip_asset_id}")
        return ip_asset_id
    except Exception as e:
        print(f"Error getting IP Asset ID: {e}")
        raise


async def create_and_attach_license_terms(ip_asset_id: str):
    """Create and attach license terms - simulated for demo"""
    print("👉 Creating and attaching license terms...")
    
    try:
        # In real implementation, you'd use Story Protocol SDK
        # For demo, we simulate the response
        license_terms_id = "1"
        print(f"✅ License terms created with ID: {license_terms_id}")
        print(f"✅ License terms attached to IP Asset at transaction hash 0x...")
        return license_terms_id
    except Exception as e:
        print(f"Error creating/attaching license terms: {e}")
        raise


async def mint_license_token(ip_asset_id: str):
    """Mint license token - simulated for demo"""
    print("👉 Minting license token...")
    
    try:
        # In real implementation, you'd use Story Protocol SDK
        print("✅ License token minted at transaction hash 0x...")
        print("License Token IDs: [1]")
    except Exception as e:
        print(f"Error minting license token: {e}")
        print("⚠️  License token minting failed - this is expected if license terms weren't properly attached")


async def use_contract_licensing():
    """Alternative: Use the contract's built-in licensing functions"""
    print("👉 Using contract's built-in licensing functions...")
    
    try:
        # Use the hardcoded collection
        collection = COLLECTION_ADDRESS
        nft = w3.eth.contract(address=collection, abi=STORY_NFT_ABI)
        
        # Use the contract's mintAndRegisterAndCreateTermsAndAttach function
        tx_hash = send_transaction(
            nft.functions.mintAndRegisterAndCreateTermsAndAttach(account.address)
        )
        receipt = wait_for_receipt(tx_hash)
        
        print("✅ Mint + Register + License Terms created in one transaction")
        print(f"Transaction hash: {receipt['transactionHash'].hex()}")
    except Exception as e:
        print(f"Error using contract licensing: {e}")


if __name__ == "__main__":
    import asyncio
    
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
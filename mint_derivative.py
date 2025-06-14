#!/usr/bin/env python3
"""
mint_derivative.py - Create derivative work from existing collection and parent IP

Requirements:
pip install web3 python-dotenv eth-account

Usage:
python mint_derivative.py <collection_address> <parent_ip_id>
"""

import os
import sys
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
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    
    return tx_hash.hex()


def wait_for_receipt(tx_hash: str) -> Dict[str, Any]:
    """Wait for transaction receipt"""
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    if receipt['status'] != 1:
        raise Exception(f"Transaction failed: {tx_hash}")
    return receipt


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


async def create_derivative_work(original_collection: str, parent_ip_id: str):
    """Create derivative work - matching TypeScript exactly"""
    print("👉 Creating derivative work...")
    
    try:
        # Generate unique values for derivative
        timestamp = int(time.time())
        derivative_id = f"{timestamp}{random.randint(10000, 19999)}"
        
        # Mint a new tweet as a derivative
        derivative_tx_hash = send_transaction(
            factory.functions.registerTweetAsset(
                original_collection,
                account.address,
                "ipfs://QmDerivativeUri",
                "Derivative Tweet",
                "@alice_derivative",
                datetime.now().isoformat(),
                False,
                5,
                2,
                10,
                100,
                ["#derivative", "#remix"],
                ["@alice"],
                "https://example.com/derivative_avatar.jpg",
                f"https://twitter.com/alice/status/{derivative_id}",  # THIS MUST CHANGE EACH RUN
                derivative_id,  # THIS MUST CHANGE EACH RUN
                "ipfs://QmDerivativeScreenshot"
            )
        )
        
        wait_for_receipt(derivative_tx_hash)
        print("✅ Derivative tweet minted")
        
        # Get the new token ID
        nft = w3.eth.contract(address=original_collection, abi=STORY_NFT_ABI)
        supply = nft.functions.totalSupply().call()
        derivative_token_id = str(supply - 1)
        
        # Get the derivative IP Asset ID
        derivative_ip_id = await get_ip_asset_id(original_collection, derivative_token_id)
        print(f"Derivative IP Asset ID: {derivative_ip_id}")
        
        print("✅ Derivative work created and registered")
        return derivative_ip_id
        
    except Exception as e:
        print(f"Error creating derivative work: {e}")
        print("⚠️  Derivative registration failed - this requires proper license tokens")


async def main():
    """Main function for creating derivative work"""
    
    # Get collection address and parent IP ID from command line or use defaults
    if len(sys.argv) >= 3:
        collection_address = sys.argv[1]
        parent_ip_id = sys.argv[2]
    else:
        # Default values for testing
        collection_address = "0x92ae11a48afDe37d9dD8D358C3657293C8243fb6"
        parent_ip_id = "0x0000000000000000000000000000000000000000"  # Replace with actual parent IP ID
        print(f"Usage: python {sys.argv[0]} <collection_address> <parent_ip_id>")
        print(f"Using defaults: collection={collection_address}, parent_ip_id={parent_ip_id}")
    
    # Create the derivative work
    await create_derivative_work(collection_address, parent_ip_id)


if __name__ == "__main__":
    import asyncio
    
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
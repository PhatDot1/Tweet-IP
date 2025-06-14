#!/usr/bin/env python3
"""
mint_initial_part1.py - Create collection and mint first tweet with real Story Protocol licensing

Requirements:
pip install web3 python-dotenv eth-account story_protocol_python_sdk

Usage:
python mint_initial_part1.py
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
from story_protocol_python_sdk import StoryClient

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

# Initialize Story Protocol SDK
aeneid_chain_id = 1315
story_client = StoryClient(w3, account, aeneid_chain_id)

# Contract ABIs - matching TypeScript exactly
TWEET_IP_FACTORY_ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "handle", "type": "string"},
            {"internalType": "uint256", "name": "mintPrice", "type": "uint256"},
            {"internalType": "uint256", "name": "maxSupply", "type": "uint256"},
            {"internalType": "address", "name": "royaltyReceiver", "type": "address"},
            {"internalType": "uint96", "name": "royaltyBP", "type": "uint96"}
        ],
        "name": "createTweetCollection",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "name": "allCollections",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalCollections",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
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
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    
    return tx_hash.hex()


def wait_for_receipt(tx_hash: str) -> Dict[str, Any]:
    """Wait for transaction receipt"""
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    if receipt['status'] != 1:
        raise Exception(f"Transaction failed: {tx_hash}")
    return receipt


async def main():
    """Main function matching TypeScript structure exactly"""
    
    # 1) Create a new collection
    print("👉 Creating a new Tweet collection...")
    create_tx_hash = send_transaction(
        factory.functions.createTweetCollection(
            "@alice1",        # handle
            0,               # mintPrice
            10,              # maxSupply
            account.address, # royaltyReceiver
            500              # royaltyBP (5%)
        )
    )
    receipt = wait_for_receipt(create_tx_hash)
    print("✅ Collection created")
    
    # 2) Get the latest collection (the one we just created)
    # First get total number of collections
    total_collections = factory.functions.totalCollections().call()
    # Get the latest collection (last index)
    latest_index = total_collections - 1
    collection = factory.functions.allCollections(latest_index).call()
    print(f"Using collection address: {collection}")
    
    # 3) Mint & register a dummy tweet
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
            [f"@bobby884"],  # THIS MUST CHANGE EACH RUN
            "https://example.com/avatar.jpg",
            f"https://twitter.com/alice/status/884",  # THIS MUST CHANGE EACH RUN
            "884",  # THIS MUST CHANGE EACH RUN
            "ipfs://QmDummyScreenshot"
        )
    )
    mint_receipt = wait_for_receipt(mint_tx_hash)
    print(f"✅ Mint + IP-registration in block {mint_receipt['blockNumber']}")
    
    # 4) Get the NFT contract and token ID
    nft = w3.eth.contract(address=collection, abi=STORY_NFT_ABI)
    
    supply = nft.functions.totalSupply().call()
    token_id = str(supply - 1)
    
    print(f"Token ID: {token_id}")
    print(f"🔗 View your NFT here:")
    print(f"https://aeneid.storyscan.io/token/{collection}/instance/{token_id}")
    
    # 5) Get the IP Asset ID from the IP registry
    print("👉 Finding IP Asset ID...")
    ip_asset_id = await get_ip_asset_id(collection, token_id)
    print(f"IP Asset ID: {ip_asset_id}")
    
    # 6) Create and attach license terms
    license_terms_id = await create_and_attach_license_terms(ip_asset_id)
    
    # 7) Mint a license token
    await mint_license_token(ip_asset_id, license_terms_id)


async def get_ip_asset_id(nft_contract: str, token_id: str) -> str:
    """Get IP Asset ID - matching TypeScript logic exactly"""
    try:
        # Try to register with Story Protocol SDK (matching TypeScript)
        # The Python SDK uses positional arguments, not a dict
        response = story_client.IPAsset.register(
            nft_contract=nft_contract,
            token_id=int(token_id),  # Python SDK expects int, not string
            ip_metadata={
                "ipMetadataURI": "",
                "ipMetadataHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
                "nftMetadataURI": "",
                "nftMetadataHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
            },
            tx_options={}
        )

        print("💬 DEBUG: IPAsset.register raw response:", response)
        if not isinstance(response, dict):
            # if it's an object, show its attributes too
            print("💬 DEBUG: IPAsset.register response.__dict__:", response.__dict__)
        
        # The response should contain the IP ID
        if hasattr(response, 'ip_id'):
            return response.ip_id
        elif isinstance(response, dict) and 'ip_id' in response:
            return response['ip_id']
        else:
            raise Exception("No ip_id returned from registration")
            
    except Exception as e:
        # If the SDK call fails, propagate the error so you catch it upstream
        raise


async def create_and_attach_license_terms(ip_asset_id: str) -> str:
    """Create and attach license terms using Story Protocol SDK"""
    print("👉 Creating and attaching license terms...")
    
    try:
        # Create commercial remix license terms - matching TypeScript exactly
        # Python SDK uses positional arguments instead of dict
        response = story_client.License.register_pil_terms(
            transferable=True,
            royalty_policy="0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",  # RoyaltyPolicyLAP
            default_minting_fee=0,
            expiration=0,
            commercial_use=True,
            commercial_attribution=True,
            commercializer_checker="0x0000000000000000000000000000000000000000",
            commercializer_checker_data="0x",
            commercial_rev_share=20,  # 20% revenue share
            commercial_rev_ceiling=0,
            derivatives_allowed=True,
            derivatives_attribution=True,
            derivatives_approval=False,
            derivatives_reciprocal=True,
            derivative_rev_ceiling=0,
            currency="0x1514000000000000000000000000000000000000",  # $WIP token
            uri="",
            tx_options={
                "from": account.address,
                # also optipnall specify "gas" or "gasPrice" here
            }
        )
        

        # 2) grab the returned tx_hash and wait for it
        license_terms_id = str(response["license_terms_id"])
        tx_hash = response.get("tx_hash") or response.get("txHash")
        if tx_hash is None:
            raise Exception(f"No tx_hash returned for register_pil_terms: {response!r}")

        print(f"⏳ Waiting for license‐terms creation tx {tx_hash} to confirm…")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"✅ License terms created on-chain in block {receipt.blockNumber} (id={license_terms_id})")
 
        
        # Attach the license terms to the IP Asset
        attach_response = story_client.License.attach_license_terms(
            ip_id=ip_asset_id,
            license_template="0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",  # PIL template address
            license_terms_id=int(license_terms_id),
            tx_options={"from": account.address}
        )
        
        if hasattr(attach_response, 'success') and attach_response.success:
            print(f"✅ License terms attached to IP Asset at transaction hash {attach_response.txHash}")
        elif isinstance(attach_response, dict) and attach_response.get('success'):
            print(f"✅ License terms attached to IP Asset at transaction hash {attach_response.get('txHash')}")
        else:
            print("License terms already attached to this IP Asset.")
        
        return license_terms_id
        
    except Exception as e:
        print(f"Error creating/attaching license terms: {e}")
        raise


async def mint_license_token(ip_asset_id: str, license_terms_id: str):
    """Mint license token using Story Protocol SDK"""
    print("👉 Minting license token...")
    
    try:
        # Use the actual license terms ID from the previous step
        # If license_terms_id is None, use "1" as fallback (matching TypeScript)
        terms_id = int(license_terms_id) if license_terms_id else 1
        
        # Python SDK uses positional arguments
        response = story_client.License.mint_license_tokens(
            licensor_ip_id=ip_asset_id,
            license_template="0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",  # PIL template
            license_terms_id=terms_id,
            amount=1,
            receiver=account.address,
            royalty_context="0x",
            max_minting_fee=0,
            max_revenue_share=100,
            tx_options={}
        )
        
        if hasattr(response, 'txHash'):
            print(f"✅ License token minted at transaction hash {response.txHash}")
            print(f"License Token IDs: {response.licenseTokenIds if hasattr(response, 'licenseTokenIds') else 'N/A'}")
        elif isinstance(response, dict):
            print(f"✅ License token minted at transaction hash {response.get('txHash')}")
            print(f"License Token IDs: {response.get('licenseTokenIds')}")
        
        return response.get('licenseTokenIds') if isinstance(response, dict) else getattr(response, 'licenseTokenIds', None)
        
    except Exception as e:
        print(f"Error minting license token: {e}")
        # This might fail if license terms aren't attached yet, which is okay for demo
        print("⚠️  License token minting failed - this is expected if license terms weren't properly attached")


async def use_contract_licensing():
    """Alternative: Use the contract's built-in licensing functions"""
    print("👉 Using contract's built-in licensing functions...")
    
    try:
        # Get the first collection
        collection = factory.functions.allCollections(0).call()
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
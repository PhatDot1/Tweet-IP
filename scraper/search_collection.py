"""
Script to search for NFT collections by Twitter handle.
Usage: python search_collection.py --handle=alice
"""

import argparse
import json
import sys
from web3 import Web3
from typing import List, Dict, Optional

# Contract addresses and RPC
FACTORY_ADDRESS = "0x8a1885132A04fe94850BEc4f47C55Ca466C7Bb81"
RPC_URL = "https://aeneid.storyrpc.io"

# Factory contract ABI (minimal, focusing on what we need)
FACTORY_ABI = [
    {
        "inputs": [],
        "name": "totalCollections",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
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
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "address", "name": "creator", "type": "address"},
            {"indexed": True, "internalType": "address", "name": "collectionAddress", "type": "address"},
            {"indexed": False, "internalType": "string", "name": "handle", "type": "string"}
        ],
        "name": "CollectionCreated",
        "type": "event"
    }
]

# StoryNFT contract ABI (minimal, for getting name/symbol)
STORY_NFT_ABI = [
    {
        "inputs": [],
        "name": "name",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "maxSupply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "mintPrice",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
]

class CollectionSearcher:
    def __init__(self, rpc_url: str = RPC_URL, factory_address: str = FACTORY_ADDRESS):
        """Initialize the searcher with Web3 connection and factory address."""
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to {rpc_url}")
        
        self.factory_address = Web3.to_checksum_address(factory_address)
        self.factory_contract = self.w3.eth.contract(
            address=self.factory_address,
            abi=FACTORY_ABI
        )
    
    def get_all_collections(self) -> List[str]:
        """Get all deployed collection addresses from the factory."""
        try:
            total_collections = self.factory_contract.functions.totalCollections().call()
            collections = []
            
            for i in range(total_collections):
                collection_address = self.factory_contract.functions.allCollections(i).call()
                collections.append(collection_address)
            
            return collections
        except Exception as e:
            print(f"Error fetching collections: {e}")
            return []
    
    def get_collection_info(self, collection_address: str) -> Optional[Dict]:
        """Get detailed information about a specific collection."""
        try:
            collection_contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(collection_address),
                abi=STORY_NFT_ABI
            )
            
            name = collection_contract.functions.name().call()
            symbol = collection_contract.functions.symbol().call()
            total_supply = collection_contract.functions.totalSupply().call()
            max_supply = collection_contract.functions.maxSupply().call()
            mint_price = collection_contract.functions.mintPrice().call()
            
            # Extract handle from name (format: "handle_IP")
            handle = name.replace("_IP", "") if name.endswith("_IP") else name
            
            return {
                "address": collection_address,
                "name": name,
                "symbol": symbol,
                "handle": handle,
                "total_supply": total_supply,
                "max_supply": max_supply,
                "mint_price": mint_price,
                "mint_price_eth": self.w3.from_wei(mint_price, 'ether')
            }
        except Exception as e:
            print(f"Error fetching info for {collection_address}: {e}")
            return None
    
    def search_by_handle(self, target_handle: str) -> List[Dict]:
        """Search for collections matching the given handle."""
        # Normalize handle for comparison (ensure it has @ prefix and is lowercase)
        if not target_handle.startswith('@'):
            target_handle = '@' + target_handle
        target_handle = target_handle.lower()
        
        collections = self.get_all_collections()
        matches = []
        
        print(f"Searching through {len(collections)} collections for handle: {target_handle}")
        print("\nAll collections found:")
        print("-" * 50)
        
        for collection_address in collections:
            info = self.get_collection_info(collection_address)
            if info:
                print(f"Handle: '{info['handle']}' | Address: {collection_address}")
                if info['handle'].lower() == target_handle:
                    matches.append(info)
        
        print("-" * 50)
        
        return matches
    
    def list_all_collections(self) -> List[Dict]:
        """Get information about all collections."""
        collections = self.get_all_collections()
        all_info = []
        
        print(f"Fetching information for {len(collections)} collections...")
        
        for i, collection_address in enumerate(collections):
            print(f"Processing collection {i+1}/{len(collections)}: {collection_address}")
            info = self.get_collection_info(collection_address)
            if info:
                all_info.append(info)
        
        return all_info

def print_collection_info(collections: List[Dict]):
    """Pretty print collection information."""
    if not collections:
        print("No collections found.")
        return
    
    print(f"\nFound {len(collections)} collection(s):")
    print("-" * 80)
    
    for collection in collections:
        print(f"Handle: @{collection['handle']}")
        print(f"Address: {collection['address']}")
        print(f"Name: {collection['name']}")
        print(f"Symbol: {collection['symbol']}")
        print(f"Supply: {collection['total_supply']}/{collection['max_supply']}")
        print(f"Mint Price: {collection['mint_price_eth']} ETH ({collection['mint_price']} wei)")
        print("-" * 80)

def main():
    parser = argparse.ArgumentParser(description='Search for NFT collections by Twitter handle')
    parser.add_argument('--handle', type=str, help='Twitter handle to search for (e.g., alice)')
    parser.add_argument('--list-all', action='store_true', help='List all collections')
    parser.add_argument('--rpc-url', type=str, default=RPC_URL, 
                       help='RPC URL for blockchain connection')
    parser.add_argument('--factory-address', type=str, default=FACTORY_ADDRESS,
                       help='Address of the TweetIPFactory contract')
    
    args = parser.parse_args()
    
    if not args.handle and not args.list_all:
        print("Error: Please provide either --handle or --list-all")
        sys.exit(1)
    
    try:
        searcher = CollectionSearcher(args.rpc_url, args.factory_address)
        
        if args.list_all:
            collections = searcher.list_all_collections()
            print_collection_info(collections)
        elif args.handle:
            collections = searcher.search_by_handle(args.handle)
            if collections:
                print_collection_info(collections)
            else:
                print(f"No collections found for handle: {args.handle}")
    
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
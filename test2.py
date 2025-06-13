import os
import sys
import time
import uuid
import traceback
from web3 import Web3
from dotenv import load_dotenv
from story_protocol_python_sdk import StoryClient

load_dotenv()

RPC_URL         = os.getenv("RPC_URL", "https://aeneid.storyrpc.io")
PRIVATE_KEY     = os.getenv("PRIVATE_KEY")
if not PRIVATE_KEY:
    print("🛑 ERROR: Set PRIVATE_KEY in your .env", file=sys.stderr)
    sys.exit(1)

FACTORY_ADDRESS = Web3.to_checksum_address("0x24CaCa10deCCBFD4447d585E78dc2a7596CD4833")
LICENSE_HOOK    = Web3.to_checksum_address("0x0000000000000000000000000000000000000000")

# --- TWEET DATA ---
METADATA_URI        = "ipfs://QmQRAK6oDejNqCGEQEPwtSQRHw3eL8bkUf93odRnuFAmji"
AUTHOR_NAME         = "Test2"
AUTHOR_HANDLE       = "Person2"
TIMESTAMP           = "2025-06-12T09:45:55.000Z"
VERIFIED            = True
COMMENTS_COUNT      = 28
RETWEETS_COUNT      = 101
LIKES_COUNT         = 686
ANALYTICS_COUNT     = 0
TAGS                = ["#SOL"]
MENTIONS            = ["@man"]
PROFILE_IMAGE_URL   = "https://pbs.twimg.com/profile_images/628792948939952129/S18RmD7-_normal.jpg"
TWEET_LINK          = "https://x.com/chirocuello/status/1200000000020000345"
TWEET_ID            = "1200000000020000345"
IPFS_SCREENSHOT_URL = "https://gateway.pinata.cloud/ipfs/QmQRAK6oDejNqCGEQEPwtSQRHw3eL8bkUf93odRnuFAmji"

# --- COLLECTION PARAMETERS ---
MINT_PRICE       = 0
MAX_SUPPLY       = 1000
ROYALTY_BPS      = 500
ROYALTY_RECEIVER = None

FACTORY_ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "handle", "type": "string"},
            {"internalType": "uint256", "name": "mintPrice", "type": "uint256"},
            {"internalType": "uint256", "name": "maxSupply", "type": "uint256"},
            {"internalType": "address", "name": "royaltyReceiver", "type": "address"},
            {"internalType": "uint96", "name": "royaltyBP", "type": "uint96"},
            {"internalType": "address", "name": "licensingHook", "type": "address"}
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
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "string", "name": "handle", "type": "string"},
            {"internalType": "string", "name": "timestamp", "type": "string"},
            {"internalType": "bool", "name": "verified", "type": "bool"},
            {"internalType": "uint256", "name": "comments", "type": "uint256"},
            {"internalType": "uint256", "name": "retweets", "type": "uint256"},
            {"internalType": "uint256", "name": "likes", "type": "uint256"},
            {"internalType": "uint256", "name": "analytics", "type": "uint256"},
            {"internalType": "string[]", "name": "tags", "type": "string[]"},
            {"internalType": "string[]", "name": "mentions", "type": "string[]"},
            {"internalType": "string", "name": "profileImage", "type": "string"},
            {"internalType": "string", "name": "tweetLink", "type": "string"},
            {"internalType": "string", "name": "tweetId", "type": "string"},
            {"internalType": "string", "name": "ipfsScreenshot", "type": "string"}
        ],
        "name": "registerTweetAsset",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

def main():
    try:
        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        acct = w3.eth.account.from_key(PRIVATE_KEY)
        global ROYALTY_RECEIVER
        ROYALTY_RECEIVER = acct.address
        story_client = StoryClient(web3=w3, account=acct, chain_id=w3.eth.chain_id)

        # 1️⃣ Deploy NFT Collection
        print("🏗️ Deploying StoryNFT collection...")
        factory = w3.eth.contract(address=FACTORY_ADDRESS, abi=FACTORY_ABI)
        nonce = w3.eth.get_transaction_count(acct.address)
        fn1 = factory.functions.createTweetCollection(
            AUTHOR_HANDLE,
            MINT_PRICE,
            MAX_SUPPLY,
            ROYALTY_RECEIVER,
            ROYALTY_BPS,
            LICENSE_HOOK
        )
        tx1 = fn1.build_transaction({
            "from": acct.address,
            "nonce": nonce,
            "gas": int(fn1.estimate_gas({"from": acct.address}) * 10),  # 🔥 100x gas
            "gasPrice": w3.eth.gas_price,
        })
        signed1 = acct.sign_transaction(tx1)
        h1 = w3.eth.send_raw_transaction(signed1.raw_transaction)
        w3.eth.wait_for_transaction_receipt(h1, timeout=300)

        total = factory.functions.totalCollections().call()
        child_address = factory.functions.allCollections(total - 1).call()
        print("✅ Deployed StoryNFT at:", child_address)

        # 🕰️ Wait for contract to be recognized/indexed
        time.sleep(10)

        # 2️⃣ Register IP Asset with Unique Metadata
        print("📡 Registering IP Asset with Story Protocol (no PIL terms)...")
        unique_id = str(uuid.uuid4())
        metadata = {
            'ip_metadata_uri': f"ipfs://story-protocol-ip-meta-test-{unique_id}",
            'ip_metadata_hash': Web3.to_hex(Web3.keccak(text=f"story-protocol-ip-meta-test-{unique_id}")),
            'nft_metadata_uri': METADATA_URI,
            'nft_metadata_hash': Web3.to_hex(Web3.keccak(text=METADATA_URI))
        }

        ip_asset = story_client.IPAsset.mint_and_register_ip(
            spg_nft_contract=child_address,
            ip_metadata=metadata,
            recipient=acct.address,
            allow_duplicates=True
        )
        ip_id = ip_asset.get("ip_id")
        print("✅ IP Asset registered:", ip_id)

        # 3️⃣ Mint Required License
        print("🎟️ Issuing license for tweetId:", TWEET_ID)
        license_template_id = story_client.License.get_default_template_id()
        story_client.License.create_license(
            license_template_id=license_template_id,
            licensee=acct.address,
            ref_ip_id=ip_id,
            ref_token_id=0,
            license_terms={
                "external_id": TWEET_ID,
                "uri": METADATA_URI
            }
        )
        print("✅ License issued.")

        # 4️⃣ Mint Tweet NFT
        print("🖼️ Minting NFT from registered tweet asset...")
        nonce += 1
        fn2 = factory.functions.registerTweetAsset(
            child_address,
            acct.address,
            METADATA_URI,
            AUTHOR_NAME,
            AUTHOR_HANDLE,
            TIMESTAMP,
            VERIFIED,
            COMMENTS_COUNT,
            RETWEETS_COUNT,
            LIKES_COUNT,
            ANALYTICS_COUNT,
            TAGS,
            MENTIONS,
            PROFILE_IMAGE_URL,
            TWEET_LINK,
            TWEET_ID,
            IPFS_SCREENSHOT_URL
        )
        tx2 = fn2.build_transaction({
            "from": acct.address,
            "nonce": nonce,
            "gas": int(fn2.estimate_gas({"from": acct.address}) * 10),  # 🔥 100x gas
            "gasPrice": w3.eth.gas_price,
        })
        signed2 = acct.sign_transaction(tx2)
        h2 = w3.eth.send_raw_transaction(signed2.raw_transaction)
        w3.eth.wait_for_transaction_receipt(h2, timeout=300)
        print("✅ Tweet NFT minted.")

    except Exception as e:
        print("🚨 ERROR during execution:", str(e), file=sys.stderr)
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

# hardcoded test
import os
import sys
import traceback
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

RPC_URL         = os.getenv("RPC_URL", "https://aeneid.storyrpc.io")
PRIVATE_KEY     = os.getenv("PRIVATE_KEY")
if not PRIVATE_KEY:
    print("🛑 ERROR: Set PRIVATE_KEY in your .env", file=sys.stderr)
    sys.exit(1)

FACTORY_ADDRESS = Web3.to_checksum_address("0xC0933C5440c656464D1Eb1F886422bE3466B1459")

# --- TWEET DATA ---
METADATA_URI        = "ipfs://QmZCb4gGhieBGz8MET2VpeHwfa3hjYJB7WVhJvjpRCpUxT"
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
TWEET_LINK          = "https://x.com/chirocuello/status/1933188647748018349"
TWEET_ID            = "1933188647748018349"
IPFS_SCREENSHOT_URL = "https://gateway.pinata.cloud/ipfs/QmZCb4gGhieBGz8MET2VpeHwfa3hjYJB7WVhJvjpRCpUxT"

# --- COLLECTION PARAMETERS ---
MINT_PRICE       = 0      # in wei
MAX_SUPPLY       = 1000
ROYALTY_RECEIVER = None   # will be set to your address below
ROYALTY_BPS      = 500    # 5%

# --- FACTORY ABI (only the bits we need) ---
FACTORY_ABI = [
    {
        "inputs": [
            {"internalType":"string","name":"handle","type":"string"},
            {"internalType":"uint256","name":"mintPrice","type":"uint256"},
            {"internalType":"uint256","name":"maxSupply","type":"uint256"},
            {"internalType":"address","name":"royaltyReceiver","type":"address"},
            {"internalType":"uint96","name":"royaltyBP","type":"uint96"}
        ],
        "name":"createTweetCollection",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },
    {
        "inputs":[{"internalType":"uint256","name":"","type":"uint256"}],
        "name":"allCollections",
        "outputs":[{"internalType":"address","name":"","type":"address"}],
        "stateMutability":"view",
        "type":"function"
    },
    {
        "inputs":[],
        "name":"totalCollections",
        "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
        "stateMutability":"view",
        "type":"function"
    },
    {
        "inputs":[
            {"internalType":"address","name":"collection","type":"address"},
            {"internalType":"address","name":"to","type":"address"},
            {"internalType":"string","name":"uri","type":"string"},
            {"internalType":"string","name":"name","type":"string"},
            {"internalType":"string","name":"handle","type":"string"},
            {"internalType":"string","name":"timestamp","type":"string"},
            {"internalType":"bool","name":"verified","type":"bool"},
            {"internalType":"uint256","name":"comments","type":"uint256"},
            {"internalType":"uint256","name":"retweets","type":"uint256"},
            {"internalType":"uint256","name":"likes","type":"uint256"},
            {"internalType":"uint256","name":"analytics","type":"uint256"},
            {"internalType":"string[]","name":"tags","type":"string[]"},
            {"internalType":"string[]","name":"mentions","type":"string[]"},
            {"internalType":"string","name":"profileImage","type":"string"},
            {"internalType":"string","name":"tweetLink","type":"string"},
            {"internalType":"string","name":"tweetId","type":"string"},
            {"internalType":"string","name":"ipfsScreenshot","type":"string"}
        ],
        "name":"registerTweetAsset",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    }
]

def main():
    try:
        # ── Setup ─────────────────────────────────────────────────────────────
        print("🌐 RPC_URL:", RPC_URL)
        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        print("🔗 web3.isConnected():", w3.is_connected())
        print("   chainId:", w3.eth.chain_id)

        acct = w3.eth.account.from_key(PRIVATE_KEY)
        print("👤 Using account:", acct.address)
        global ROYALTY_RECEIVER
        ROYALTY_RECEIVER = acct.address

        factory = w3.eth.contract(address=FACTORY_ADDRESS, abi=FACTORY_ABI)
        code_hex = w3.eth.get_code(FACTORY_ADDRESS).hex()
        print(f"🏭 Factory code @ {FACTORY_ADDRESS} (first 64 chars): {code_hex[:64]}…")

        # ── 1️⃣ CREATE ────────────────────────────────────────────────────────
        nonce = w3.eth.get_transaction_count(acct.address)
        print("🔢 Starting nonce:", nonce)

        fn1 = factory.functions.createTweetCollection(
            AUTHOR_HANDLE,
            MINT_PRICE,
            MAX_SUPPLY,
            ROYALTY_RECEIVER,
            ROYALTY_BPS
        )
        # estimate + 20% buffer
        estimated_gas1 = fn1.estimate_gas({"from": acct.address})
        gas_limit1    = int(estimated_gas1 * 1.2)
        gas_price     = w3.eth.gas_price
        print(f"   estimated gas1: {estimated_gas1} → gas_limit1: {gas_limit1}, gas_price: {gas_price}")

        tx1 = fn1.build_transaction({
            "from":     acct.address,
            "nonce":    nonce,
            "gas":      gas_limit1,
            "gasPrice": gas_price,
        })
        print("📑 TX1 payload:", tx1)

        signed1 = acct.sign_transaction(tx1)
        h1 = w3.eth.send_raw_transaction(signed1.raw_transaction)
        print("⏳ createTweetCollection tx:", h1.hex())

        receipt1 = w3.eth.wait_for_transaction_receipt(h1, timeout=300)
        print("✅ receipt1.status:", receipt1.status)
        print("   receipt1.blockNumber:", receipt1.blockNumber)
        print("   receipt1.gasUsed:", receipt1.gasUsed)
        print("   receipt1.logs:", receipt1.logs)

        # ── 2️⃣ READ totalCollections ─────────────────────────────────────────
        total = factory.functions.totalCollections().call()
        print("🔍 totalCollections:", total)
        if total == 0:
            raise RuntimeError("❌ totalCollections() returned 0 — probably need to add more gas")

        idx           = total - 1
        child_address = factory.functions.allCollections(idx).call()
        print("✅ Deployed StoryNFT at:", child_address)

        # ── 3️⃣ MINT ──────────────────────────────────────────────────────────
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
        estimated_gas2 = fn2.estimate_gas({"from": acct.address})
        gas_limit2    = int(estimated_gas2 * 1.2)
        gas_price     = w3.eth.gas_price
        print(f"   estimated gas2: {estimated_gas2} → gas_limit2: {gas_limit2}, gas_price: {gas_price}")

        tx2 = fn2.build_transaction({
            "from":     acct.address,
            "nonce":    nonce,
            "gas":      gas_limit2,
            "gasPrice": gas_price,
        })
        print("📑 TX2 payload:", tx2)

        signed2 = acct.sign_transaction(tx2)
        h2 = w3.eth.send_raw_transaction(signed2.raw_transaction)
        print("⏳ registerTweetAsset tx:", h2.hex())

        receipt2 = w3.eth.wait_for_transaction_receipt(h2, timeout=300)
        print("✅ receipt2.status:", receipt2.status)
        print("   receipt2.blockNumber:", receipt2.blockNumber)
        print("   receipt2.gasUsed:", receipt2.gasUsed)
        print("   receipt2.logs:", receipt2.logs)
        print("🏁 Done — minted tweet asset.")

    except Exception as e:
        print("🚨 ERROR during execution:", str(e), file=sys.stderr)
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

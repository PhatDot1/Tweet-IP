# OUTDATED AND REMOVED
import os
import sys
import glob
import traceback
import ast
import pandas as pd
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

RPC_URL     = os.getenv("RPC_URL", "https://aeneid.storyrpc.io")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
if not PRIVATE_KEY:
    print("🛑 ERROR: Set PRIVATE_KEY in your .env", file=sys.stderr)
    sys.exit(1)

# your deployed factory
FACTORY_ADDRESS = Web3.to_checksum_address("0xC0933C5440c656464D1Eb1F886422bE3466B1459") # frontend currently using 0xdC51c42F8E7320D32F542FBB498C5dc48b60D812, other: 0xC0933C5440c656464D1Eb1F886422bE3466B1459

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

def register_row(w3, acct, factory, row):
    # map CSV columns to parameters
    uri           = row["IPFS Screenshot"]
    name          = row["Name"]
    handle        = row["Handle"]
    timestamp     = row["Timestamp"]
    verified      = bool(row["Verified"])
    comments      = int(row["Comments"])
    retweets      = int(row["Retweets"])
    likes         = int(row["Likes"])
    analytics     = int(row["Analytics"])
    tags          = ast.literal_eval(row["Tags"])
    mentions      = ast.literal_eval(row["Mentions"])
    profile_img   = row["Profile Image"]
    tweet_link    = row["Tweet Link"]
    tweet_id      = row["Tweet ID"]
    ipfs_screenshot = row["IPFS Screenshot"]

    # ── 1️⃣ CREATE COLLECTION ────────────────────────────────
    nonce = w3.eth.get_transaction_count(acct.address)
    fn1 = factory.functions.createTweetCollection(
        handle,
        0,      # mintPrice
        1000,   # maxSupply
        acct.address,
        500     # royaltyBP (5%)
    )
    gas_est1 = fn1.estimate_gas({"from": acct.address})
    tx1 = fn1.build_transaction({
        "from": acct.address,
        "nonce": nonce,
        "gas": int(gas_est1 * 1.2),
        "gasPrice": w3.eth.gas_price,
    })
    signed1 = acct.sign_transaction(tx1)
    h1 = w3.eth.send_raw_transaction(signed1.raw_transaction)
    print("⏳ createTweetCollection tx:", h1.hex())
    r1 = w3.eth.wait_for_transaction_receipt(h1, timeout=300)
    if r1.status != 1:
        raise RuntimeError("Collection creation failed")
    total = factory.functions.totalCollections().call()
    child_addr = factory.functions.allCollections(total - 1).call()
    print("✅ New collection @", child_addr)

    # ── 2️⃣ REGISTER TWEET ASSET ────────────────────────────
    nonce += 1
    fn2 = factory.functions.registerTweetAsset(
        child_addr,
        acct.address,
        uri,
        name,
        handle,
        timestamp,
        verified,
        comments,
        retweets,
        likes,
        analytics,
        tags,
        mentions,
        profile_img,
        tweet_link,
        tweet_id,
        ipfs_screenshot
    )
    gas_est2 = fn2.estimate_gas({"from": acct.address})
    tx2 = fn2.build_transaction({
        "from": acct.address,
        "nonce": nonce,
        "gas": int(gas_est2 * 1.2),
        "gasPrice": w3.eth.gas_price,
    })
    signed2 = acct.sign_transaction(tx2)
    h2 = w3.eth.send_raw_transaction(signed2.raw_transaction)
    print("⏳ registerTweetAsset tx:", h2.hex())
    r2 = w3.eth.wait_for_transaction_receipt(h2, timeout=300)
    if r2.status != 1:
        raise RuntimeError("registerTweetAsset failed")
    print("✅ Tweet asset registered — done.\n")

def main():
    # pick the latest CSV in ./tweets
    files = sorted(glob.glob("tweets/*.csv"))
    if not files:
        print("No CSV found in ./tweets/", file=sys.stderr)
        sys.exit(1)
    path = files[-1]
    print("🔍 Loading CSV:", path)
    df = pd.read_csv(path)

    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not w3.is_connected():
        print("❌ Failed to connect to RPC", RPC_URL, file=sys.stderr)
        sys.exit(1)
    acct    = w3.eth.account.from_key(PRIVATE_KEY)
    factory = w3.eth.contract(address=FACTORY_ADDRESS, abi=FACTORY_ABI)

    for idx, row in df.iterrows():
        try:
            print(f"\n➡️  Registering row {idx+1}/{len(df)} (tweet {row['Tweet ID']})")
            register_row(w3, acct, factory, row)
        except Exception as e:
            print("🚨 ERROR on row", idx, ":", e, file=sys.stderr)
            traceback.print_exc()

if __name__ == "__main__":
    main()


# https://aeneid.storyscan.io/token/{COLLECTION ADDRESS}/instance/{NFT NUMBER}
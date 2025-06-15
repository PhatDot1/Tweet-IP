#!/usr/bin/env python3
import os
import sys
import json
import time
import csv
import argparse
import logging
import subprocess

import urllib3
from web3 import Web3
from dotenv import load_dotenv

# ------------------------
# Silence internal DEBUG
# ------------------------
logging.getLogger("web3").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("requests").setLevel(logging.WARNING)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ------------------------
# Configure our logger
# ------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

# ----------------------------------------------------------------------------
# CONFIG & SETUP
# ----------------------------------------------------------------------------
load_dotenv()

RPC_URL          = os.getenv("RPC_URL", "https://aeneid.storyrpc.io")
PRIVATE_KEY      = os.getenv("PRIVATE_KEY")
DEPOSIT_ADDRESS  = os.getenv("DEPOSIT_CONTRACT",    "0x03D95676b52E5b1D65345D6fbAA5CC9319297026")
CONTRACT_ADDRESS = Web3.to_checksum_address(DEPOSIT_ADDRESS)
STATE_FILE       = "state.json"
POLL_INTERVAL    = int(os.getenv("POLL_INTERVAL", "15"))

if not PRIVATE_KEY:
    logging.error("🛑 ERROR: Set PRIVATE_KEY in your .env")
    sys.exit(1)

# Load ABI
try:
    with open("IP_Deposit.json", "r") as f:
        ABI = json.load(f)["abi"]
except Exception as e:
    logging.error(f"🛑 ERROR: Unable to load ABI: {e}")
    sys.exit(1)

# Web3 & contract
w3       = Web3(Web3.HTTPProvider(RPC_URL))
acct     = w3.eth.account.from_key(PRIVATE_KEY)
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)

# State
if os.path.exists(STATE_FILE):
    state = json.load(open(STATE_FILE))
else:
    state = {"last_block": w3.eth.block_number - 1, "seen": []}

def save_state():
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------
def send_update(tweet_hash: bytes, new_status: str):
    logging.info(f"   ➡ Sending updateValidation({tweet_hash.hex()}, {new_status})")
    fn    = contract.functions.updateValidation(tweet_hash, new_status)
    nonce = w3.eth.get_transaction_count(acct.address)
    tx    = fn.build_transaction({
        "from": acct.address,
        "nonce": nonce,
        "gas": int(fn.estimate_gas({"from": acct.address}) * 1.2),
        "gasPrice": w3.eth.gas_price,
    })
    signed = acct.sign_transaction(tx)
    return w3.eth.send_raw_transaction(signed.raw_transaction)

# ----------------------------------------------------------------------------
# Main pipeline handler
# ----------------------------------------------------------------------------
def handle_deposit(evt):
    args    = evt["args"]
    tx_hash = evt["transactionHash"].hex()

    # 1) Log event details
    logging.info("🔍 Processing DepositProcessed event:")
    logging.info(f"   • TX hash:            {tx_hash}")
    logging.info(f"   • Block:              {evt['blockNumber']}")
    logging.info(f"   • ipAmount:           {w3.from_wei(args['ipAmount'], 'ether')} ETH")
    logging.info(f"   • validation:         {args['validation']!r}")
    logging.info(f"   • proof (raw bytes):  {args['proof'].hex() or '<empty>'}")
    logging.info(f"   • collectionAddress:  {args['collectionAddress']}")
    logging.info(f"   • collectionConfig:   {args['collectionConfig']}")
    logging.info(f"   • tweetHash (key):    {args['tweetHash'].hex()}")
    logging.info(f"   • licenseTermsConfig: {args['licenseTermsConfig']}")
    logging.info(f"   • licenseMintParams:  {args['licenseMintParams']}")
    logging.info(f"   • coCreators (event): {args['coCreators']}")

    # Dedupe & filter
    if tx_hash in state["seen"]:
        logging.info("   ❗ Already seen, skipping")
        return
    if args["validation"] != "twitter-verification" or args["ipAmount"] != w3.to_wei(1, "ether"):
        logging.info("   ❌ Skipping: must be twitter-verification + 1 ETH")
        return

    # 2) Mark pending-mint
    logging.info("➡ Pipeline start → marking pending-mint")
    h1 = send_update(args["tweetHash"], "pending-mint")
    w3.eth.wait_for_transaction_receipt(h1)

    # 3) Fetch on-chain record
    th = args["tweetHash"]
    logging.info(f"   • Calling getByTweetHash({th.hex()})")
    record = contract.functions.getByTweetHash(th).call()
    (
      depositor,
      recipient,
      validation,
      proof_bytes,
      collectionAddress,
      collectionConfig,
      tweetHashOut,
      licenseTermsConfig,
      licenseMintParams,
      coCreators
    ) = record

    logging.info(f"   • record.depositor:           {depositor}")
    logging.info(f"   • record.recipient:           {recipient}")
    logging.info(f"   • record.validation:          {validation!r}")
    logging.info(f"   • record.proof (hex):         {proof_bytes.hex() or '<empty>'}")
    logging.info(f"   • record.collectionAddress:   {collectionAddress}")
    logging.info(
        "   • record.collectionConfig:    "
        f"handle={collectionConfig[0]!r}, mintPrice={collectionConfig[1]}, "
        f"maxSupply={collectionConfig[2]}, royaltyReceiver={collectionConfig[3]}, "
        f"royaltyBP={collectionConfig[4]}"
    )
    logging.info(f"   • record.tweetHashOut:        {tweetHashOut.hex()}")
    logging.info(f"   • record.licenseTermsConfig:  {tuple(licenseTermsConfig)}")
    logging.info(f"   • record.licenseMintParams:   {tuple(licenseMintParams)}")
    logging.info(f"   • record.coCreators:          {coCreators}")

    # Strip handle
    raw_handle = collectionConfig[0]
    handle     = raw_handle.lstrip("@")
    logging.info(f"   • raw handle: {raw_handle!r} → cleaned: {handle!r}")

    # Decode proof → tweet URL
    tweet_url = ""
    try:
        tweet_url = proof_bytes.decode("utf-8").strip()
    except:
        pass
    if tweet_url:
        logging.info(f"   • decoded proof → tweet URL = {tweet_url}")
    else:
        tweet_url = f"https://x.com/{handle}/status/{th.hex()}"
        logging.info(f"   • proof empty → fallback tweet URL = {tweet_url}")

    # 4) Run scraper and wait for CSV
    logging.info(f"🖨 Running scraper on: {tweet_url}")
    proc = subprocess.run(
        ["python3", "scraper", "--tweet", tweet_url],
        check=True,
        capture_output=True,
        text=True
    )

    # Dump full scraper stdout for debugging
    logging.debug("🗒 Raw scraper stdout:\n" + proc.stdout)

    # Extract the "CSV Saved: /path/to/file.csv" line
    csv_path = None
    for line in proc.stdout.splitlines():
        if line.startswith("CSV Saved:"):
            csv_path = line.split("CSV Saved:", 1)[1].strip()
            break

    if not csv_path or not os.path.exists(csv_path):
        logging.error(f"Could not find CSV file path in scraper output!")
        return

    # Read actual CSV contents
    with open(csv_path, newline='') as f:
        csv_out = f.read()

    logging.debug("🗒 Raw scraper CSV file contents:\n" + csv_out)
    reader = csv.DictReader(csv_out.splitlines())
    logging.debug(f"🗂 Fieldnames: {reader.fieldnames}")

    row = next(reader)
    # Normalize keys
    norm_map = {fn.strip().lower().replace(" ", "").replace("_", ""): fn for fn in reader.fieldnames}
    def get(label: str) -> str:
        key = norm_map.get(label.lower().replace(" ", "").replace("_", ""))
        if not key:
            raise KeyError(f"Can't find scraper column matching {label!r} in {reader.fieldnames}")
        return row[key]

    # Extract fields
    name       = get("Name");       timestamp = get("Timestamp")
    verified   = get("Verified");   content   = get("Content")
    comments   = get("Comments");   retweets  = get("Retweets")
    likes      = get("Likes");      analytics = get("Analytics")
    tags       = get("Tags");       mentions  = get("Mentions")
    profileImg = get("Profile Image"); tweetLink = get("Tweet Link")
    tweetId_raw= get("Tweet ID");   ipfsSs     = get("IPFS Screenshot")
    tweetId    = tweetId_raw.split(":",1)[-1] if ":" in tweetId_raw else tweetId_raw

    logging.info(f"   • Scraper output: name={name!r}, tweetId={tweetId}, profileImg={profileImg!r}")
    logging.info(f"   • Raw tweetId: {tweetId_raw!r} → cleaned: {tweetId!r}")

    # Debug: Print all extracted fields
    logging.debug(f"   • All extracted fields:")
    logging.debug(f"     - name: {name!r}")
    logging.debug(f"     - timestamp: {timestamp!r}")
    logging.debug(f"     - verified: {verified!r}")
    logging.debug(f"     - content: {content!r}")
    logging.debug(f"     - comments: {comments!r}")
    logging.debug(f"     - retweets: {retweets!r}")
    logging.debug(f"     - likes: {likes!r}")
    logging.debug(f"     - analytics: {analytics!r}")
    logging.debug(f"     - tags: {tags!r}")
    logging.debug(f"     - mentions: {mentions!r}")
    logging.debug(f"     - profileImg: {profileImg!r}")
    logging.debug(f"     - tweetLink: {tweetLink!r}")
    logging.debug(f"     - tweetId: {tweetId!r}")
    logging.debug(f"     - ipfsSs: {ipfsSs!r}")

    # 5) Find or create collection
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'scraper'))
    from search_collection import CollectionSearcher
    searcher = CollectionSearcher(rpc_url=RPC_URL)
    found    = searcher.search_by_handle(handle)

    # Prepare data to send via stdin
    data = {
        "name": name,
        "timestamp": timestamp,
        "verified": verified,
        "content": content,
        "comments": comments,
        "retweets": retweets,
        "likes": likes,
        "analytics": analytics,
        "tags": tags,
        "mentions": mentions,
        "profileimg": profileImg,
        "tweetlink": tweetLink,
        "tweetid": tweetId,
        "ipfs": ipfsSs,
        "depositor": depositor,
        "recipient": recipient,
        "tweethash": th.hex(),
        "collectionaddress": collectionAddress,
        "collectionconfig": collectionConfig,
        "licensetermsconfig": licenseTermsConfig,
        "licensemintparams": licenseMintParams,
        "cocreators": coCreators,
        "handle": handle
    }

    if found:
        col_addr = found[0]["address"]
        logging.info(f"   • Found existing collection at {col_addr}")
        data["collection"] = col_addr
        cmd = [
            "npx", "hardhat", "run", "scraper/mint_existing.ts",
            "--network", "story_testnet"
        ]
    else:
        logging.info("   • No existing collection → mint_initial")
        data.update({
            "mintprice": str(collectionConfig[1]),
            "maxsupply": str(collectionConfig[2]),
            "royaltyreceiver": collectionConfig[3],
            "royaltybp": str(collectionConfig[4])
        })
        cmd = [
            "npx", "hardhat", "run", "scraper/mint_initial.ts",
            "--network", "story_testnet"
        ]

    logging.info(f"   • Mint command: {' '.join(cmd)}")
    
    # Debug: Print the data being sent to stdin
    logging.debug(f"   • Data being sent via stdin:")
    for key, value in data.items():
        logging.debug(f"     - {key}: {value!r}")

    # 6) Execute mint with data passed via stdin
    try:
        stdin_data = json.dumps(data)
        result = subprocess.run(
            cmd, 
            input=stdin_data,
            text=True,
            check=True, 
            capture_output=True
        )
        logging.info("✅ Mint succeeded:\n" + result.stdout)
        
    except subprocess.CalledProcessError as e:
        logging.error("❌ Mint failed:\n" + e.stderr)
        h_err = send_update(th, "mint-failed")
        w3.eth.wait_for_transaction_receipt(h_err)
        return

    # 7) Finalize
    logging.info("➡ Pipeline complete → marking mint-verified")
    h2 = send_update(th, "mint-verified")
    w3.eth.wait_for_transaction_receipt(h2)

    state["seen"].append(tx_hash)
    save_state()
    logging.info("🎉 Done processing " + tx_hash + "\n")

# ----------------------------------------------------------------------------
# Main loop
# ----------------------------------------------------------------------------
def main(poll_interval):
    logging.info("► Starting watch loop")
    logging.info(f"   Contract: {CONTRACT_ADDRESS}")
    logging.info(f"   Poll interval: {poll_interval}s")
    logging.info(f"   Starting from block: {state['last_block']}")
    logging.info(f"   Current block:  {w3.eth.block_number}")

    while True:
        try:
            latest = w3.eth.block_number
            if latest > state["last_block"]:
                logging.info(f"   Checking blocks {state['last_block']+1}→{latest}")
                logs = contract.events.DepositProcessed().get_logs(
                    from_block=state['last_block']+1,
                    to_block=latest
                )
                logging.info(f"   Found {len(logs)} DepositProcessed event(s)")
                for ev in logs:
                    try:
                        handle_deposit(ev)
                    except Exception as e:
                        logging.error(f"   Error in handle_deposit: {e}")
                        import traceback; traceback.print_exc()
                state["last_block"] = latest
                save_state()
        except Exception as e:
            logging.error(f"Error in main loop: {e}")
            time.sleep(5)
        time.sleep(poll_interval)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--interval", type=int, default=POLL_INTERVAL,
                        help="poll every N seconds")
    args = parser.parse_args()
    main(args.interval)
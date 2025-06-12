#!/usr/bin/env python3
import os
import sys
import json
import time
import argparse
import logging
import subprocess

from web3 import Web3
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv

load_dotenv()

# ── CONFIG ────────────────────────────────────────────────────────────────
RPC_URL          = os.getenv("RPC_URL", "https://aeneid.storyrpc.io")
PRIVATE_KEY      = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = Web3.to_checksum_address(os.getenv("DEPOSIT_CONTRACT", "0xAF2A0D1CDAe0bae796083e772aF2a1736027BC30"))

CONTRACT_ABI = [
    {
      "inputs":[
        {"internalType":"bytes32","name":"txHash","type":"bytes32"},
        {"internalType":"string","name":"newValidation","type":"string"}
      ],
      "name":"updateValidation",
      "outputs":[],
      "stateMutability":"nonpayable",
      "type":"function"
    },
    {
      "anonymous":False,
      "inputs":[
        {"indexed":True,"internalType":"uint256","name":"ipAmount","type":"uint256"},
        {"indexed":True,"internalType":"address","name":"depositor","type":"address"},
        {"indexed":True,"internalType":"address","name":"recipient","type":"address"},
        {"indexed":False,"internalType":"string","name":"validation","type":"string"},
        {"indexed":False,"internalType":"bytes","name":"proof","type":"bytes"},
        {"indexed":False,"internalType":"string","name":"handle","type":"string"},
        {"indexed":False,"internalType":"string","name":"tweet","type":"string"}
      ],
      "name":"DepositProcessed",
      "type":"event"
    },
]

STATE_FILE = "state.json"
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "15"))   # seconds

# ── SETUP ─────────────────────────────────────────────────────────────────
if not PRIVATE_KEY:
    print("🛑 ERROR: Set PRIVATE_KEY in your .env", file=sys.stderr)
    sys.exit(1)

w3 = Web3(Web3.HTTPProvider(RPC_URL))

acct = w3.eth.account.from_key(PRIVATE_KEY)
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

# load last‐processed state
if os.path.exists(STATE_FILE):
    with open(STATE_FILE, "r") as f:
        state = json.load(f)
else:
    state = {"last_block": w3.eth.block_number - 1, "seen": []}

def save_state():
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def handle_deposit(evt):
    args = evt["args"]
    tx_hash = evt["transactionHash"].hex()
    # only once
    if tx_hash in state["seen"]:
        return

    ip_amount  = args["ipAmount"]
    validation = args["validation"]
    handle     = args["handle"]
    tweet_url  = args["tweet"]

    # filter
    if validation != "twitter-verification":
        return
    if ip_amount != w3.toWei(1, "ether"):
        return
    # tweet_url = https://twitter.com/<handle2>/status/...
    owner = tweet_url.split("/")[3]
    if owner.lower() != handle.lower():
        return

    logging.info(f"→ Found new twitter‐verification deposit {tx_hash}, running mint…")

    # 1) updateValidation → pending-mint
    h = send_update(tx_hash, "pending-mint")
    w3.eth.wait_for_transaction_receipt(h)
    logging.info(f"  pending-mint tx: {h.hex()}")

    # 2) run scraper
    subprocess.run(
      ["python", "scraper", f"--tweet={tweet_url}"],
      check=True
    )

    # 3) updateValidation → mint-verified
    h2 = send_update(tx_hash, "mint-verified")
    w3.eth.wait_for_transaction_receipt(h2)
    logging.info(f"  mint-verified tx: {h2.hex()}")

    state["seen"].append(tx_hash)
    save_state()

def send_update(tx_hash_hex: str, new_status: str):
    # convert hex string to bytes32
    tx_bytes = w3.toBytes(hexstr=tx_hash_hex)
    fn = contract.functions.updateValidation(tx_bytes, new_status)
    nonce = w3.eth.get_transaction_count(acct.address)
    tx = fn.build_transaction({
      "from": acct.address,
      "nonce": nonce,
      "gas": fn.estimate_gas({"from": acct.address}) * 2 // 1,  # buffer
      "gasPrice": w3.eth.gas_price,
    })
    signed = acct.sign_transaction(tx)
    return w3.eth.send_raw_transaction(signed.raw_transaction)

def main(poll_interval):
    logging.info("Starting poll loop…")
    while True:
        latest = w3.eth.block_number
        if latest > state["last_block"]:
            logs = contract.events.DepositProcessed().get_logs(
                from_block=state["last_block"]+1,
                to_block=latest
            )
            for evt in logs:
                handle_deposit(evt)
            state["last_block"] = latest
            save_state()
        time.sleep(poll_interval)

if __name__=="__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    parser = argparse.ArgumentParser()
    parser.add_argument("--interval", type=int, default=POLL_INTERVAL, help="polling interval in seconds")
    args = parser.parse_args()
    main(args.interval)

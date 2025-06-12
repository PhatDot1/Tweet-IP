#!/usr/bin/env python3
import os
import sys
import json
import re
import asyncio
import subprocess
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3
from web3.middleware import geth_poa_middleware

load_dotenv()

# ── CONFIG ────────────────────────────────────────────────────────────────
WS_URL         = os.getenv("WS_URL", "wss://???/ws") # if can find a WS without having to run own node
PRIVATE_KEY    = os.getenv("PRIVATE_KEY")
CONTRACT_ADDR  = Web3.to_checksum_address(
    os.getenv("DEPOSIT_CONTRACT", "0xAF2A0D1CDAe0bae796083e772aF2a1736027BC30")
)
SEEN_FILE      = Path("seen.json")

# minimal ABI: DepositProcessed + your new updateValidation fn
ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True,  "internalType":"uint256","name":"ipAmount","type":"uint256"},
            {"indexed": True,  "internalType":"address","name":"depositor","type":"address"},
            {"indexed": True,  "internalType":"address","name":"recipient","type":"address"},
            {"indexed": False, "internalType":"string","name":"validation","type":"string"},
            {"indexed": False, "internalType":"bytes","name":"proof","type":"bytes"},
            {"indexed": False, "internalType":"string","name":"handle","type":"string"},
            {"indexed": False, "internalType":"string","name":"tweet","type":"string"}
        ],
        "name": "DepositProcessed",
        "type": "event"
    },
    # --- add this function to your Solidity contract: ---
    {
      "inputs": [
        {"internalType":"bytes32","name":"txHash","type":"bytes32"},
        {"internalType":"string","name":"newValidation","type":"string"}
      ],
      "name":"updateValidation",
      "outputs":[],
      "stateMutability":"nonpayable",
      "type":"function"
    }
]

# ── SETUP WEB3 ─────────────────────────────────────────────────────────────
w3 = Web3(Web3.WebsocketProvider(WS_URL))
# if you’re on a PoA chain:
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

if not w3.is_connected():
    print(f"❌ cannot connect to WS at {WS_URL}", file=sys.stderr)
    sys.exit(1)

acct    = w3.eth.account.from_key(PRIVATE_KEY)
contract= w3.eth.contract(address=CONTRACT_ADDR, abi=ABI)

# load seen set
if SEEN_FILE.exists():
    seen = set(json.loads(SEEN_FILE.read_text()))
else:
    seen = set()

def save_seen():
    SEEN_FILE.write_text(json.dumps(list(seen), indent=2))

# ── EVENT HANDLER ──────────────────────────────────────────────────────────
async def handle_event(event):
    txhash     = event["transactionHash"].hex()
    args       = event["args"]
    if txhash in seen:
        return
    seen.add(txhash)
    save_seen()

    # only interested in fresh twitter-verification / 1 ETH
    if args["validation"] != "twitter-verification":
        return
    if args["ipAmount"] != 1_000_000_000_000_000_000:
        return

    url    = args["tweet"]
    m      = re.match(r"https?://(?:www\.)?twitter\.com/([^/]+)/status/", url)
    if not m or m.group(1).lower() != args["handle"].lower():
        return

    print(f"🔔 New valid deposit {txhash} → {url}")

    # 1) mark pending
    try:
        tx = contract.functions.updateValidation(
            w3.to_bytes(hexstr=txhash),
            "pending-mint"
        ).build_transaction({
            "from":      acct.address,
            "nonce":     w3.eth.get_transaction_count(acct.address),
            "gasPrice":  w3.eth.gas_price,
        })
        signed = acct.sign_transaction(tx)
        resp = w3.eth.send_raw_transaction(signed.rawTransaction)
        w3.eth.wait_for_transaction_receipt(resp)
        print(f"  ↳ on-chain set to pending-mint")
    except Exception as e:
        print("  ⚠️ failed to set pending-mint:", e)

    # 2) run your scraper
    print(f"  ↳ spawning scraper for {url}")
    p = subprocess.run(
        ["python", "scraper", "--tweet", url],
        capture_output=True,
        text=True
    )
    print("    └─ scraper stdout:", p.stdout)
    print("    └─ scraper stderr:", p.stderr)

    # 3) finally mark mint-verified
    try:
        tx = contract.functions.updateValidation(
            w3.to_bytes(hexstr=txhash),
            "mint-verified"
        ).build_transaction({
            "from":      acct.address,
            "nonce":     w3.eth.get_transaction_count(acct.address),
            "gasPrice":  w3.eth.gas_price,
        })
        signed = acct.sign_transaction(tx)
        resp = w3.eth.send_raw_transaction(signed.rawTransaction)
        w3.eth.wait_for_transaction_receipt(resp)
        print(f"  ↳ on-chain set to mint-verified")
    except Exception as e:
        print("  ⚠️ failed to set mint-verified:", e)


# ── START LISTENING ─────────────────────────────────────────────────────────
async def log_loop():
    event_filter = contract.events.DepositProcessed.createFilter(
        fromBlock="latest",
        argument_filters={"validation": "twitter-verification"}
    )
    while True:
        for ev in event_filter.get_new_entries():
            await handle_event(ev)
        await asyncio.sleep(1)

if __name__ == "__main__":
    print("✅ Listening on WebSocket, watching DepositProcessed…")
    loop = asyncio.get_event_loop()
    loop.run_until_complete(log_loop())

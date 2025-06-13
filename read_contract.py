import os
import sys
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

RPC_URL = os.getenv("RPC_URL", "https://aeneid.storyrpc.io")
if not RPC_URL:
    print("🛑 ERROR: RPC_URL not set", file=sys.stderr)
    sys.exit(1)

w3 = Web3(Web3.HTTPProvider(RPC_URL))
if not w3.is_connected():
    print(f"❌ Could not connect to RPC at {RPC_URL}", file=sys.stderr)
    sys.exit(1)

CONTRACT_ADDR = Web3.to_checksum_address("0xdC51c42F8E7320D32F542FBB498C5dc48b60D812")

ABI = [
    {
      "anonymous": False,
      "inputs": [
        {"indexed": True,  "internalType": "uint256", "name": "ipAmount",    "type": "uint256"},
        {"indexed": True,  "internalType": "address", "name": "depositor",   "type": "address"},
        {"indexed": True,  "internalType": "address", "name": "recipient",   "type": "address"},
        {"indexed": False, "internalType": "string",  "name": "validation",  "type": "string"},
        {"indexed": False, "internalType": "bytes",   "name": "proof",       "type": "bytes"},
        {"indexed": False, "internalType": "string",  "name": "handle",      "type": "string"},
        {"indexed": False, "internalType": "string",  "name": "tweet",       "type": "string"}
      ],
      "name": "DepositProcessed",
      "type": "event"
    }
]

contract = w3.eth.contract(address=CONTRACT_ADDR, abi=ABI)

def main():
    from_block = 0
    to_block   = "latest"

    print(f"🔍 Fetching DepositProcessed events from block {from_block} → {to_block}…")
    try:
        entries = contract.events.DepositProcessed.get_logs(
            from_block=from_block,
            to_block=to_block
        )
    except Exception as e:
        print("❌ Error fetching events:", e, file=sys.stderr)
        sys.exit(1)

    if not entries:
        print("⚠️  No deposits found.")
        return

    print(f"✅ Found {len(entries)} deposits:\n")
    for i, ev in enumerate(entries, 1):
        args = ev["args"]
        print(f"--- Deposit #{i} (tx {ev['transactionHash'].hex()}) ---")
        print(f"  • ipAmount   : {args['ipAmount']}")
        print(f"  • depositor  : {args['depositor']}")
        print(f"  • recipient  : {args['recipient']}")
        print(f"  • validation : {args['validation']}")
        print(f"  • proof      : {args['proof'].hex()}")
        print(f"  • handle     : {args['handle']}")
        print(f"  • tweet      : {args['tweet']}\n")

if __name__ == "__main__":
    main()

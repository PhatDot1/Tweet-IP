# outdated demo endpoint for v1 of flow
import os
import sys
import subprocess
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from web3 import Web3

# ─── Configuration & Web3 Setup ────────────────────────────────────────────────

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

# ─── Pydantic Model ────────────────────────────────────────────────────────────

class Deposit(BaseModel):
    ipAmount: int
    depositor: str
    recipient: str
    validation: str
    proof: str        # hex-encoded
    handle: str
    tweet: str
    txHash: str

# ─── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(title="Deposit Processor API")

@app.get("/deposits/", response_model=List[Deposit])
def get_and_process_deposits():
    """
    Fetch all DepositProcessed events from block 0 to latest,
    return them as JSON, and then run the scraper on the most recent tweet URL.
    """
    try:
        logs = contract.events.DepositProcessed.get_logs(
            from_block=0,
            to_block="latest"
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error fetching events: {e}")

    if not logs:
        return []

    # Transform logs into our model
    deposits = []
    for ev in logs:
        args = ev["args"]
        deposits.append(Deposit(
            ipAmount=args["ipAmount"],
            depositor=args["depositor"],
            recipient=args["recipient"],
            validation=args["validation"],
            proof=args["proof"].hex(),
            handle=args["handle"],
            tweet=args["tweet"],
            txHash=ev["transactionHash"].hex(),
        ))

    # Run scraper on the latest tweet
    latest_tweet = deposits[-1].tweet
    try:
        # This will block until the scraper finishes; adapt as needed.
        subprocess.run(
            [sys.executable, "scraper", f"--tweet={latest_tweet}"],
            check=True
        )
    except subprocess.CalledProcessError as e:
        # You might choose to log this instead of failing the entire request
        raise HTTPException(
            status_code=500,
            detail=f"Scraper failed for tweet {latest_tweet}: {e}"
        )

    return deposits

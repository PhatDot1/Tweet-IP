import os, sys, json, time, argparse, logging, subprocess
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

RPC_URL     = os.getenv("RPC_URL", "https://aeneid.storyrpc.io")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = Web3.to_checksum_address(
    os.getenv("DEPOSIT_CONTRACT", "0xAF2A0D1CDAe0bae796083e772aF2a1736027BC30")
)

ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":False,"inputs":[
      {"indexed":True,"internalType":"uint256","name":"ipAmount","type":"uint256"},
      {"indexed":True,"internalType":"address","name":"depositor","type":"address"},
      {"indexed":True,"internalType":"address","name":"recipient","type":"address"},
      {"indexed":False,"internalType":"string","name":"validation","type":"string"},
      {"indexed":False,"internalType":"bytes","name":"proof","type":"bytes"},
      {"indexed":False,"internalType":"string","name":"handle","type":"string"},
      {"indexed":False,"internalType":"string","name":"tweet","type":"string"}
    ],
    "name":"DepositProcessed","type":"event"
  },
  {"anonymous":False,"inputs":[
      {"indexed":True,"internalType":"bytes32","name":"txHash","type":"bytes32"},
      {"indexed":False,"internalType":"string","name":"newValidation","type":"string"}
    ],
    "name":"ValidationUpdated","type":"event"
  },
  {"inputs":[
      {"internalType":"address","name":"recipient","type":"address"},
      {"internalType":"string","name":"validation","type":"string"},
      {"internalType":"bytes","name":"proof","type":"bytes"},
      {"internalType":"string","name":"handle","type":"string"},
      {"internalType":"string","name":"tweet","type":"string"}
    ],
    "name":"depositIP","outputs":[],"stateMutability":"payable","type":"function"
  },
  {"inputs":[{"internalType":"bytes32","name":"txHash","type":"bytes32"},
             {"internalType":"string","name":"newValidation","type":"string"}],
    "name":"updateValidation","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  {"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],
    "name":"validationFor","outputs":[{"internalType":"string","name":"","type":"string"}],
    "stateMutability":"view","type":"function"
  },
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],
    "stateMutability":"view","type":"function"
  },
  {"inputs":[],"name":"withdrawFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"stateMutability":"payable","type":"receive"}
]

STATE_FILE    = "state.json"
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "15"))

if not PRIVATE_KEY:
    print("🛑 ERROR: Set PRIVATE_KEY in your .env", file=sys.stderr)
    sys.exit(1)

w3 = Web3(Web3.HTTPProvider(RPC_URL))
acct = w3.eth.account.from_key(PRIVATE_KEY)
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)

# load or initialize state
if os.path.exists(STATE_FILE):
    state = json.load(open(STATE_FILE))
else:
    state = {"last_block": w3.eth.block_number - 1, "seen": []}

def save_state():
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def send_update(tx_hash_hex: str, new_status: str):
    tx_bytes = w3.toBytes(hexstr=tx_hash_hex)
    fn = contract.functions.updateValidation(tx_bytes, new_status)
    nonce = w3.eth.get_transaction_count(acct.address)
    tx = fn.build_transaction({
        "from":     acct.address,
        "nonce":    nonce,
        "gas":      int(fn.estimate_gas({"from": acct.address}) * 1.2),
        "gasPrice": w3.eth.gas_price,
    })
    signed = acct.sign_transaction(tx)
    return w3.eth.send_raw_transaction(signed.raw_transaction)

def handle_deposit(evt):
    args     = evt["args"]
    tx_hash  = evt["transactionHash"].hex()
    if tx_hash in state["seen"]:
        return

    amt    = args["ipAmount"]
    val    = args["validation"]
    handle = args["handle"]
    tweet  = args["tweet"]

    # filters
    if val != "twitter-verification": return
    if amt != w3.toWei(1, "ether"):   return
    # match handle in URL
    parts = tweet.split("/")
    if len(parts) < 5 or parts[3].lower() != handle.lower():
        return

    logging.info(f"➡️  New deposit {tx_hash} → minting…")
    # 1) pending-mint
    h1 = send_update(tx_hash, "pending-mint")
    w3.eth.wait_for_transaction_receipt(h1)
    logging.info(f"   pending-mint tx: {h1.hex()}")

    # 2) scraper
    subprocess.run(["python", "scraper", f"--tweet={tweet}"], check=True)

    # 3) mint-verified
    h2 = send_update(tx_hash, "mint-verified")
    w3.eth.wait_for_transaction_receipt(h2)
    logging.info(f"   mint-verified tx: {h2.hex()}")

    state["seen"].append(tx_hash)
    save_state()

def main(interval):
    logging.info("► Starting watch loop")
    while True:
        latest = w3.eth.block_number
        if latest > state["last_block"]:
            logs = contract.events.DepositProcessed().get_logs(
                from_block=state["last_block"]+1,
                to_block=latest
            )
            for ev in logs:
                handle_deposit(ev)
            state["last_block"] = latest
            save_state()
        time.sleep(interval)

if __name__=="__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    p = argparse.ArgumentParser()
    p.add_argument("--interval", type=int, default=POLL_INTERVAL, help="poll every N seconds")
    args = p.parse_args()
    main(args.interval)

#!/usr/bin/env python3
import os
import sys
import time
import uuid
import traceback

from web3 import Web3
from dotenv import load_dotenv
from story_protocol_python_sdk import StoryClient

# ── Load .env ────────────────────────────────────────────────────────────────
load_dotenv()

RPC_URL                = os.getenv("RPC_URL", "https://aeneid.storyrpc.io")
PRIVATE_KEY            = os.getenv("PRIVATE_KEY")
FACTORY_ADDRESS        = os.getenv("FACTORY_ADDRESS")
IP_REGISTRY_ADDRESS    = os.getenv("STORY_IP_ASSET_REGISTRY")
ACCESS_MANAGER_ADDRESS = os.getenv("STORY_ACCESS_MANAGER")
LICENSE_TEMPLATE       = os.getenv("STORY_PILICENSE_TEMPLATE")
LICENSE_TERMS_ID       = int(os.getenv("STORY_LICENSE_TERMS_ID", "0"))

# ── Tweet data ────────────────────────────────────────────────────────────────
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

# ── Collection params ─────────────────────────────────────────────────────────
MINT_PRICE   = 0
MAX_SUPPLY   = 1000
ROYALTY_BPS  = 500

# ── ABIs ──────────────────────────────────────────────────────────────────────
FACTORY_ABI = [
    {
      "inputs":[
        {"internalType":"string","name":"handle","type":"string"},
        {"internalType":"uint256","name":"mintPrice","type":"uint256"},
        {"internalType":"uint256","name":"maxSupply","type":"uint256"},
        {"internalType":"address","name":"royaltyReceiver","type":"address"},
        {"internalType":"uint96","name":"royaltyBP","type":"uint96"},
        {"internalType":"address","name":"licenseTemplate","type":"address"},
        {"internalType":"uint256","name":"licenseTermsId","type":"uint256"},
        {
          "components":[
            {"internalType":"bool","name":"transferable","type":"bool"},
            {"internalType":"address","name":"royaltyPolicy","type":"address"},
            {"internalType":"uint256","name":"defaultMintingFee","type":"uint256"},
            {"internalType":"uint256","name":"expiration","type":"uint256"},
            {"internalType":"bool","name":"commercialUse","type":"bool"},
            {"internalType":"bool","name":"commercialAttribution","type":"bool"},
            {"internalType":"address","name":"commercializerChecker","type":"address"},
            {"internalType":"bytes","name":"commercializerCheckerData","type":"bytes"},
            {"internalType":"uint32","name":"commercialRevShare","type":"uint32"},
            {"internalType":"uint256","name":"commercialRevCeiling","type":"uint256"},
            {"internalType":"bool","name":"derivativesAllowed","type":"bool"},
            {"internalType":"bool","name":"derivativesAttribution","type":"bool"},
            {"internalType":"bool","name":"derivativesApproval","type":"bool"},
            {"internalType":"bool","name":"derivativesReciprocal","type":"bool"},
            {"internalType":"uint256","name":"derivativeRevCeiling","type":"uint256"},
            {"internalType":"address","name":"currency","type":"address"},
            {"internalType":"string","name":"uri","type":"string"}
          ],
          "internalType":"struct PILTerms","name":"customTerms","type":"tuple"
        }
      ],
      "name":"createTweetCollection",
      "outputs":[],
      "stateMutability":"nonpayable",
      "type":"function"
    },
    {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],
     "name":"allCollections","outputs":[{"internalType":"address","name":"","type":"address"}],
     "stateMutability":"view","type":"function"},
    {"inputs":[],"name":"totalCollections","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
     "stateMutability":"view","type":"function"},
    {
      "inputs":[
        {"internalType":"address","name":"collection","type":"address"},
        {"internalType":"address","name":"to","type":"address"},
        {"internalType":"string","name":"uri","type":"string"},
        {"internalType":"string","name":"name_","type":"string"},
        {"internalType":"string","name":"handle_","type":"string"},
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
        {"internalType":"string","name":"ipfsScreenshot","type":"string"},
        {"internalType":"string","name":"ipMetadataURI","type":"string"},
        {"internalType":"string[]","name":"coCreatorNames","type":"string[]"},
        {"internalType":"address[]","name":"coCreatorWallets","type":"address[]"}
      ],
      "name":"registerTweetAsset","outputs":[],"stateMutability":"nonpayable","type":"function"
    }
]

REGISTRY_ABI = [
    {"inputs":[{"internalType":"address","name":"accessManager","type":"address"}],
     "name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"getFeeAmount","outputs":[{"internalType":"uint96","name":"","type":"uint96"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"getFeeToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"getTreasury","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"chainId","type":"uint256"},
               {"internalType":"address","name":"tokenContract","type":"address"},
               {"internalType":"uint256","name":"tokenId","type":"uint256"}],
     "name":"ipId","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"id","type":"address"}],
     "name":"isRegistered","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}
]

def zero_pilters():
    return (
      False,
      "0x0000000000000000000000000000000000000000",
      0,
      0,
      False,
      False,
      "0x0000000000000000000000000000000000000000",
      b"",
      0,
      0,
      False,
      False,
      False,
      False,
      0,
      "0x0000000000000000000000000000000000000000",
      ""
    )

def main():
    try:
        w3    = Web3(Web3.HTTPProvider(RPC_URL))
        acct  = w3.eth.account.from_key(PRIVATE_KEY)
        story = StoryClient(web3=w3, account=acct, chain_id=w3.eth.chain_id)
        royalty_receiver = acct.address

        factory  = w3.eth.contract(address=Web3.to_checksum_address(FACTORY_ADDRESS), abi=FACTORY_ABI)
        registry = w3.eth.contract(address=Web3.to_checksum_address(IP_REGISTRY_ADDRESS), abi=REGISTRY_ABI)

        # ── (optional) Initialize registry ───────────────────────────────────
        fee_tok = registry.functions.getFeeToken().call()
        if fee_tok == "0x0000000000000000000000000000000000000000" and ACCESS_MANAGER_ADDRESS:
            print("🔧 Initializing IPAssetRegistry…")
            tx = registry.functions.initialize(
                    Web3.to_checksum_address(ACCESS_MANAGER_ADDRESS)
                 ).build_transaction({
                    "from":     acct.address,
                    "nonce":    w3.eth.get_transaction_count(acct.address),
                    "gas":      int(200_000 * 10),
                    "gasPrice": w3.eth.gas_price,
                 })
            signed = acct.sign_transaction(tx)
            w3.eth.send_raw_transaction(signed.raw_transaction)
            w3.eth.wait_for_transaction_receipt(signed.hash, timeout=300)
            print("✅  Registry initialized.")

        # ── 1️⃣ Deploy new collection ───────────────────────────────────────
        print("🏗️  createTweetCollection…")
        nonce = w3.eth.get_transaction_count(acct.address)
        fn1   = factory.functions.createTweetCollection(
                   AUTHOR_HANDLE, MINT_PRICE, MAX_SUPPLY,
                   royalty_receiver, ROYALTY_BPS,
                   Web3.to_checksum_address(LICENSE_TEMPLATE),
                   LICENSE_TERMS_ID,
                   zero_pilters()
                )
        est1  = fn1.estimate_gas({"from": acct.address})
        tx1   = fn1.build_transaction({
                   "from":     acct.address,
                   "nonce":    nonce,
                   "gas":      int(est1 * 10),
                   "gasPrice": w3.eth.gas_price,
                })
        signed1 = acct.sign_transaction(tx1)
        h1      = w3.eth.send_raw_transaction(signed1.raw_transaction)
        w3.eth.wait_for_transaction_receipt(h1, timeout=300)
        total   = factory.functions.totalCollections().call()
        child   = Web3.to_checksum_address(factory.functions.allCollections(total - 1).call())
        print("✅  New StoryNFT at:", child)

        # ── **FIX**: grant RegistrationWorkflows minter role ──────────────
        rw_address = story.IPAsset.registration_workflows_client.contract.address
        print("🔑  RegistrationWorkflows address is:", rw_address)
        spg_abi = [{
          "inputs":[{"internalType":"address","name":"account","type":"address"},
                    {"internalType":"bool","name":"enabled","type":"bool"}],
          "name":"setMinter","outputs":[],"stateMutability":"nonpayable","type":"function"
        }]
        spg = w3.eth.contract(address=child, abi=spg_abi)
        nonce += 1
        txm = spg.functions.setMinter(rw_address, True).build_transaction({
            "from":     acct.address,
            "nonce":    nonce,
            "gas":      100_000,
            "gasPrice": w3.eth.gas_price
        })
        signed_m = acct.sign_transaction(txm)
        h_m = w3.eth.send_raw_transaction(signed_m.raw_transaction)
        w3.eth.wait_for_transaction_receipt(h_m, timeout=300)
        print("✅  Granted minter role to RegistrationWorkflows.")

        # ── 2️⃣ Register & mint IP & NFT ─────────────────────────────────
        print("📡  Register & license & mint…")
        time.sleep(5)

        unique        = str(uuid.uuid4())
        ip_meta_tuple = (
          f"ipfs://story-ip-meta-test-{unique}",
          Web3.to_hex(Web3.keccak(text=f"story-ip-meta-test-{unique}")),
          METADATA_URI,
          Web3.to_hex(Web3.keccak(text=METADATA_URI))
        )
        print("🔍 IP metadata tuple:", ip_meta_tuple)

        nonce += 1
        rw     = story.IPAsset.registration_workflows_client.contract
        mint_fn= rw.functions.mintAndRegisterIp(child, acct.address, ip_meta_tuple, True)
        est_ip = mint_fn.estimate_gas({"from": acct.address})
        ip     = story.IPAsset.mint_and_register_ip(
                    spg_nft_contract=child,
                    ip_metadata={},  # overridden by build_fn
                    recipient=acct.address,
                    allow_duplicates=True,
                    tx_options={
                      "from":     acct.address,
                      "nonce":    nonce,
                      "gas":      int(est_ip * 10),
                      "gasPrice": w3.eth.gas_price,
                    },
                    build_fn=lambda opts: mint_fn.build_transaction(opts)
                 )
        ipid = ip.get("ip_id")
        print("✅  IP Asset:", ipid)

        # ── issue license ───────────────────────────────────────────────
        print("🎟️  issuing license…")
        tpl = story.License.get_default_template_id()
        story.License.create_license(
          license_template_id=tpl,
          licensee=acct.address,
          ref_ip_id=ipid,
          ref_token_id=0,
          license_terms={"external_id": TWEET_ID, "uri": METADATA_URI}
        )
        print("✅  License done.")

        # ── mint the Tweet‐NFT ───────────────────────────────────────────
        print("🖼️  minting tweet NFT…")
        nonce += 1
        fn2   = factory.functions.registerTweetAsset(
                    child, acct.address, METADATA_URI,
                    AUTHOR_NAME, AUTHOR_HANDLE, TIMESTAMP, VERIFIED,
                    COMMENTS_COUNT, RETWEETS_COUNT, LIKES_COUNT, ANALYTICS_COUNT,
                    TAGS, MENTIONS, PROFILE_IMAGE_URL,
                    TWEET_LINK, TWEET_ID, IPFS_SCREENSHOT_URL,
                    METADATA_URI, [], []
                )
        est2  = fn2.estimate_gas({"from": acct.address})
        tx2   = fn2.build_transaction({
                    "from":     acct.address,
                    "nonce":    nonce,
                    "gas":      int(est2 * 10),
                    "gasPrice": w3.eth.gas_price,
                })
        signed2 = acct.sign_transaction(tx2)
        h2      = w3.eth.send_raw_transaction(signed2.raw_transaction)
        w3.eth.wait_for_transaction_receipt(h2, timeout=300)
        print("✅  Tweet NFT minted.")

    except Exception as e:
        print("🚨 ERROR:", e, file=sys.stderr)
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

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

RPC_URL             = os.getenv("RPC_URL", "https://aeneid.storyrpc.io")
PRIVATE_KEY         = os.getenv("PRIVATE_KEY")
FACTORY_ADDRESS     = os.getenv("FACTORY_ADDRESS", "0x24CaCa10deCCBFD4447d585E78dc2a7596CD4833")

# ── New Story-Protocol constructor params ────────────────────────────────────
LICENSE_TEMPLATE    = os.getenv("STORY_PILICENSE_TEMPLATE", "0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316")
LICENSE_TERMS_ID    = int(os.getenv("STORY_LICENSE_TERMS_ID", "0"))  # 0 = register custom

# ── TWEET DATA ───────────────────────────────────────────────────────────────
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

# ── COLLECTION PARAMETERS ─────────────────────────────────────────────────────
MINT_PRICE          = 0
MAX_SUPPLY          = 1000
ROYALTY_BPS         = 500
ROYALTY_RECEIVER    = None  # will be set to your address

# ── Minimal ABI for your factory ─────────────────────────────────────────────
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
        ROYALTY_RECEIVER = acct.address

        factory = w3.eth.contract(
            address=Web3.to_checksum_address(FACTORY_ADDRESS),
            abi=FACTORY_ABI
        )

        # ── 1️⃣ Deploy a new NFT-Collection ───────────────────────────────
        print("🏗️  createTweetCollection…")
        nonce = w3.eth.get_transaction_count(acct.address)
        fn1   = factory.functions.createTweetCollection(
          AUTHOR_HANDLE,
          MINT_PRICE,
          MAX_SUPPLY,
          ROYALTY_RECEIVER,
          ROYALTY_BPS,
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

        total = factory.functions.totalCollections().call()
        child = Web3.to_checksum_address(
            factory.functions.allCollections(total - 1).call()
        )
        print("✅  New StoryNFT at:", child)

        # ── 2️⃣ Mint the Tweet-NFT (token 0) into your collection ──────────
        print("🖼️  minting tweet NFT…")
        nonce += 1
        fn2   = factory.functions.registerTweetAsset(
                  child,
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
                  IPFS_SCREENSHOT_URL,
                  METADATA_URI,  # ipMetadataURI
                  [],            # coCreatorNames
                  []             # coCreatorWallets
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
        print("✅  Tweet NFT minted (token 0)")

        # ── 3️⃣ Now register that NFT as an IP asset ──────────────────────
        print("📡 Register & license & mint…")
        time.sleep(5)

        # pack your IP-metadata as a tuple in the exact ABI order:
        unique = str(uuid.uuid4())
        ip_meta_tuple = (
          f"ipfs://story-ip-meta-test-{unique}",
          Web3.to_hex(Web3.keccak(text=f"story-ip-meta-test-{unique}")),
          METADATA_URI,
          Web3.to_hex(Web3.keccak(text=METADATA_URI))
        )
        print("🔍 IP metadata tuple:", ip_meta_tuple)

        # estimate & send your mint_and_register_ip with 10× gas
        rw      = story.IPAsset.registration_workflows_client.contract
        mint_fn = rw.functions.mintAndRegisterIp(child, acct.address, ip_meta_tuple, True)
        est_ip  = mint_fn.estimate_gas({"from": acct.address})
        nonce  += 1
        ip = story.IPAsset.mint_and_register_ip(
            spg_nft_contract=child,
            ip_metadata={},     # ignored when using build_fn override
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

        # ── 4️⃣ Issue the license on-chain ───────────────────────────────
        print("🎟️  issuing license…")
        tpl = story.License.get_default_template_id()
        story.License.create_license(
          license_template_id=tpl,
          licensee=acct.address,
          ref_ip_id=ipid,
          ref_token_id=0,
          license_terms={
            "external_id": TWEET_ID,
            "uri":          METADATA_URI
          }
        )
        print("✅  License done.")

    except Exception as e:
        print("🚨 ERROR:", e, file=sys.stderr)
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

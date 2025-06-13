TODO:
Streamline comms between frontend and backend for proper error handling and edge cases not being a black box to users

Adding:
custom PIL license
IP metadata
Link co-creators 

/////////

WANT TO:
Pre-mint a license manually before the IP registration
AKA need to:

Deploy the NFT collection

Call create_license(...) with a known/fixed ref_ip_id

Then register the IP and attach license terms in the same call

////////

NOTE:
ADDING ALL AT ONCE TOO AUDACIOS, FIRST FIX OG CONTRACT TO REGISTER NFT AS IP, NOT CONTRACT
THEN ITERATIVELY 1 BY 1 ADD AND TEST:
Co-creators with names + wallets
Metadata URI [P Metadata]
Custom license fields [PIL License]

////////

ADJUST FRONTEND TO ALLOW FOR THIS CUSTOMIZABLE TOO:
✅ PIL License	story_input["license_terms"]	Custom royalty, remix, and revenue params
✅ IP Metadata	story_input["ip_metadata_uri"]	NFT + IP metadata bundled
✅ Co-Creators	story_input["co_creators"]	Off-chain for now, can be used in UI or indexed

RUN EXAMPLE:
python watch_and_run.py --interval 10



# 🌟 Story Protocol Backend

Welcome to **Story Protocol**, the seamless bridge that transforms any public tweet into a secure, on-chain NFT asset—capturing text, images, video, and beyond. Whether you’re an artist, influencer, or just love storytelling, minting your tweet is now as simple as a deposit and an automated scrape.

---

## 🚀 Why Story Protocol?

- **No-Code Minting**: Anyone can mint a tweet with a single Ether deposit.
- **End-to-End Automation**: From Twitter scraping to IPFS pinning to on‑chain NFT mint, our backend handles it all.
- **Future‑Proof**: NFTs are minted on the customizable factory, enabling royalty splits, metadata updates, and unlimited supply controls.
- **Transparent & Verifiable**: Every action emits events; you can track each mint through the deposit contract.

---

## 🔥 Key Features

1. **Twitter Scraper**  
   - **Profiles, Queries, Hashtags**: Scrape feeds, searches, or individual tweet URLs.  
   - **Selenium‑based**: Headless, robust login, dynamic content support.  
   - **Screenshot to IPFS**: Capture the exact render and pin via Pinata; retrieve via IPFS gateway.

2. **On‑Chain Factory & NFT Minting**  
   - **Tweet Collection Factory**: Deploy a dedicated NFT collection per Twitter handle.  
   - **Asset Registration**: Register tweet metadata (text, author, metrics) as NFT attributes.  
   - **Royalties & Supply**: Configure mint price, max supply, and royalty BPS.

3. **Deposit Watcher**  
   - **Deposit Contract**: Users deposit exactly 1 ETH with `twitter-verification` validation tag.  
   - **Event Handler**: Monitors `DepositProcessed`, validates tweet URL, kicks off scraper & mint.  
   - **Stateful & Retry‑Safe**: Persists last processed block and avoids duplicates.

4. **Register IP Script**  
   - **CSV or Direct**: Map scraped tweet data into contract calls.  
   - **Gas‑Efficient**: Estimate and buffer gas, auto‑nonce management, receipt polling.

---

## 🏗 Architecture Overview

```
+------------+       +-----------------+       +-------------+       +----------------+
|  Deposit   |  Tx   |  Watch Script   |  CLI  |  Scraper    |  IPFS | Pinata / IPFS  |
|  Contract  | ----> | (monitor & mint)| ----> | (selenium)  | ----> |  Gateway       |
+------------+       +-----------------+       +-------------+       +----------------+
                                                           |
                                                           v
                                                     +-------------+
                                                     |  Factory    |
                                                     |  Contract   |
                                                     +-------------+
                                                           |
                                                           v
                                                     +-------------+
                                                     |  NFT Asset  |
                                                     +-------------+
```

---

## 📥 Installation & Setup

1. **Clone repository**  
   ```bash
   git clone https://github.com/yourorg/story-backend.git
   cd story-backend
   ```

2. **Create & populate `.env`**  
   ```ini
   # Twitter
   TWITTER_MAIL=you@example.com
   TWITTER_USERNAME=your_handle
   TWITTER_PASSWORD=your_password
   HEADLESS=yes

   # Pinata
   PINATA_API_KEY=...
   PINATA_API_SECRET=...
   PINATA_JWT=...

   # Blockchain
   RPC_URL=https://aeneid.storyrpc.io
   PRIVATE_KEY=0x...
   DEPOSIT_CONTRACT=0xAF2A0D1CDAe0...
   ```

3. **Install dependencies**  
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

---

## ⚙️ Usage

### 1. Manual Scrape & Mint (CLI)

- **Single Tweet**  
  ```bash
  python scraper --tweet https://x.com/.../status/1234
  ```
  - Automatically scrapes, pins to IPFS, saves backup CSV, and triggers on-chain mint.

- **Profile / Query**  
  ```bash
  python scraper --username your_handle -t 10
  python scraper --query "blockchain" -t 20
  ```

### 2. Deposit‑Driven Mint (Daemon)

Run the watcher to auto‑detect deposits and mint:

```bash
python watch_deposits.py --interval 15
```

---

## 📜 Smart Contracts

1. **Deposit Contract**  
   - `depositIP(recipient, validation, proof, handle, tweetUrl)`  
   - Emits `DepositProcessed(ipAmount, depositor, recipient, validation, proof, handle, tweet)`.

2. **Factory Contract**  
   - `createTweetCollection(string handle, uint256 mintPrice, uint256 maxSupply, address royaltyReceiver, uint96 royaltyBP)`  
   - `registerTweetAsset(address collection, address to, string uri, string name, string handle, string timestamp, bool verified, uint256 comments, uint256 retweets, uint256 likes, uint256 analytics, string[] tags, string[] mentions, string profileImage, string tweetLink, string tweetId, string ipfsScreenshot)`.

3. **NFT Collection**  
   - ERC‑721 with configurable royalties (EIP‑2981).

---

## 🎉 Demo & Explorer

- **Mint a tweet**: deposit 1 IP to the deposit contract with `twitter-verification` tag.
- **View your NFT**:  
  `https://aeneid.storyscan.io/token/{COLLECTION_ADDRESS}/instance/{TOKEN_ID}`

---

## 🌟 Future Roadmap

- **Video & Media Support**: 
- **Dashboard**: Real‑time monitoring, analytics, and reclamations.  
- **Community Tools**: Bulk mint, Twitter giveaways, auction integration.
- CREATOR INSENTIVES/REWARDS

---

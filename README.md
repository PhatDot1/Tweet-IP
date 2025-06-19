# 🌟 Story Protocol Backend

Welcome to **Story Protocol**, the seamless bridge that transforms any public tweet into a secure, on-chain NFT asset—capturing text, images, video, and beyond. With the latest updates, we've integrated advanced Story Protocol functionalities, enabling robust IP asset management, programmable licensing, and derivative creation directly on-chain. Whether you’re an artist, influencer, or just love storytelling, minting your tweet is now as simple as a deposit and an automated scrape, all while ensuring your intellectual property is protected and monetizable through cutting-edge blockchain technology.

---

## 🚀 Why Story Protocol?

- **No-Code Minting**: Anyone can mint a tweet with a single Ether deposit.
- **End-to-End Automation**: From Twitter scraping to IPFS pinning to on‑chain NFT mint, our backend handles it all.
- **Future‑Proof**: NFTs are minted on the customizable factory, enabling royalty splits, metadata updates, and unlimited supply controls.
- **Transparent & Verifiable**: Every action emits events; you can track each mint through the deposit contract.
- **On-chain IP Asset Management**: Leverage Story Protocol's core modules to register your tweet NFTs as official IP Assets, enabling verifiable ownership and rights management.
- **Programmable Licensing**: Attach customizable, on-chain licenses (PILs) to your IP Assets, defining terms for commercial use, derivatives, and revenue sharing.
- **Derivative Tracking**: Easily track and manage derivatives created from your original IP, ensuring proper attribution and royalty distribution.

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
   - **Deposit Contract**: Users deposit exactly 1 ETH with `twitter-verification` validation tag, along with detailed configuration for collection, licensing, and co-creators.  
   - **Event Handler**: Monitors `DepositProcessed`, validates tweet URL, kicks off scraper & mint.  
   - **Stateful & Retry‑Safe**: Persists last processed block and avoids duplicates.

4. **Register IP Script**  
   - **CSV or Direct**: Map scraped tweet data into contract calls.  
   - **Gas‑Efficient**: Estimate and buffer gas, auto‑nonce management, receipt polling.

5. **Story Protocol Integration**
   - **IP Asset Registration**: Automatically registers minted NFTs as IP Assets on the Story Protocol registry.
   - **Programmable IP Licenses (PILs)**: Attaches pre-defined or custom PILs to IP Assets, enabling on-chain licensing terms for commercial use, derivatives, and revenue sharing.
   - **License Token Minting**: Facilitates the minting of license tokens, representing on-chain permissions for using the IP.
   - **Derivative Registration**: Supports the registration of new IP Assets as derivatives of existing ones, ensuring proper lineage and rights management.

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
                                                           |
                                                           v
                                                     +-------------------+
                                                     | Story Protocol    |
                                                     | (IP Asset, PILs)  |
                                                     +-------------------+
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
   DEPOSIT_CONTRACT=0x03D95676b52E5b1D65345D6fbAA5CC9319297026 
   TWEET_FACTORY_ADDRESS=0x8a1885132A04fe94850BEc4f47C55Ca466C7Bb81 
   WALLET_PRIVATE_KEY=0x... 
   RPC_PROVIDER_URL=https://aeneid.storyrpc.io 
   STORY_IP_ASSET_REGISTRY=0x77319B4031e6eF1250907aa00018B8B1c67a244b
   STORY_METADATA_MODULE=0x6E81a25C99C6e8430aeC7353325EB138aFE5DC16
   STORY_LICENSING_MODULE=0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f
   STORY_ROYALTY_MODULE=0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086
   STORY_LICENSE_REGISTRY=0x529a750E02d8E2f15649c13D69a465286a780e24
   STORY_MODULE_REGISTRY=0x022DBAAeA5D8fB31a0Ad793335e39Ced5D631fa5
   STORY_PILICENSE_TEMPLATE=0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316
   STORY_ACCESS_MANAGER=0xFdece7b8a2f55ceC33b53fd28936B4B1e3153d53
   ```

3. **Install dependencies**  
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   npm install # For Hardhat and Story Protocol SDK dependencies
   ```

---

## ⚙️ Usage


### 1. Deposit‑Driven Mint 

Run the watcher to auto‑detect deposits and mint:

```bash
python watch_and_run.py
```

### 2. Testing / Manual Scrape & Mint (CLI)

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

---

## 📜 Smart Contracts

1. **Deposit Contract (`IP_Deposit.sol`)**  
   - `depositIP(recipient, validation, proof, collectionAddress, collectionConfig, tweetHash, licenseTermsConfig, licenseMintParams, coCreators)`: Emits `DepositProcessed` with detailed configuration for collection, licensing, and co-creators.
   - Supports new structs: `CollectionConfig`, `LicenseTermsConfig`, `LicenseMintParams`, and `CoCreator`.

2. **Factory Contract (`TweetIPFactory.sol`)**  
   - `createTweetCollection(string handle, uint256 mintPrice, uint256 maxSupply, address royaltyReceiver, uint96 royaltyBP)`: Deploys a new `StoryNFT` contract, passing Story Protocol core module addresses.
   - `registerTweetAsset(...)`: Mints an NFT and registers its metadata.

3. **NFT Collection (`StoryNFT.sol`)**  
   - ERC‑721 with configurable royalties (EIP‑2981).
   - Integrates directly with Story Protocol's `IIPAssetRegistry`, `ILicenseRegistry`, `ILicensingModule`, `IPILicenseTemplate`, and `ICoreMetadataModule`.
   - `safeMint(...)`: Mints a Tweet NFT, stores metadata, and registers it as an IP Asset.
   - `mintAndRegisterAndCreateTermsAndAttach(address receiver)`: Mints an NFT, registers it as an IP Asset, creates a `commercialRemix` PIL with 20% revenue share, and attaches it to the IP Asset.
   - `mintLicenseTokenAndRegisterDerivative(address parentIpId, uint256 licenseTermsId, address receiver)`: Mints a license token and registers a new IP Asset as a derivative.

---

## 🎉 Demo & Explorer

- **Mint a tweet**: deposit 1 IP to the deposit contract with `twitter-verification` tag, providing necessary `CollectionConfig`, `LicenseTermsConfig`, `LicenseMintParams`, and `CoCreator` data.
- **View your NFT**:  
  `https://aeneid.storyscan.io/token/{COLLECTION_ADDRESS}/instance/{TOKEN_ID}`
- **View your IP Asset**:  
  `https://aeneid.storyscan.io/ip-asset/{IP_ASSET_ID}`

---

## 🌟 Future Roadmap

- **Video & Media Support**: 
- **Dashboard**: Real‑time monitoring, analytics, and reclamations.  
- **Community Tools**: Bulk mint, Twitter giveaways, auction integration.
- **Creator Incentives/Rewards**: Further integration with Story Protocol for advanced creator monetization and reward mechanisms.

---



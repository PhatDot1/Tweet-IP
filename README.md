Need Deposit To Specify:
Security Params Plus:
    "@alice",        // handle
    0,               // mintPrice
    9000,              // maxSupply
    signer.address,  // royaltyReceiver [should be set to current owner?]
    500              // royaltyBP (5%) [prob 100%??? Since means sale??]

    "ipfs://QmDummyUri", // metadata
    "Alice Example", // Asset Name
    "@alice", // handle
    new Date().toISOString(), 
    false,
    0, 0, 0, 0,
    ["#test"],
    ["@bob886"], // have this increment @name_{num} +1 each time.
    "https://example.com/avatar.jpg",
    "https://twitter.com/alice/status/886", // must be unqiue tweet enforced
    "886", // must be unqiue
    "ipfs://QmDummyScreenshot"

    const licenseResponse = await storyClient.license.registerPILTerms({
      defaultMintingFee: 0n,
      currency: '0x1514000000000000000000000000000000000000', // $WIP token
      royaltyPolicy: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E', // RoyaltyPolicyLAP
      transferable: true,
      expiration: 0n,
      commercialUse: true,
      commercialAttribution: true,
      commercializerChecker: '0x0000000000000000000000000000000000000000',
      commercializerCheckerData: '0x',
      commercialRevShare: 20, // 20% revenue share
      commercialRevCeiling: 0n,
      derivativesAllowed: true,
      derivativesAttribution: true,
      derivativesApproval: false,
      derivativesReciprocal: true,
      derivativeRevCeiling: 0n,
      uri: '',
      // Fixed: Remove waitForTransaction from txOptions
      txOptions: {}

      licenseTermsId: "1", // This should be the actual license terms ID from the previous step
      licensorIpId: ipAssetId as Address,
      receiver: account.address,
      amount: 1,
      maxMintingFee: BigInt(0),
      maxRevenueShare: 100,
      // Fixed: Remove waitForTransaction from txOptions
      txOptions: {}

  tl;dr:
1.  Collection creation (if you’re also deploying a new one) [user data]
handle (string) – e.g. "@alice"

mintPrice (number or BigNumber) – wei price to mint

maxSupply (number) – cap on total mints

royaltyReceiver (address) – who gets on-chain royalties

royaltyBP (number) – basis-points (500 = 5%)

2. Minting & registering the tweet [data from the tweet]
recipient (address) – who the NFT is minted to

uri (string) – your token’s metadata URI (e.g. an IPFS link)

name_ (string) – tweet author’s display name

handle_ (string) – tweet author’s handle

timestamp_ (string) – when the tweet was posted (ISO)

verified_ (boolean) – whether the author is verified

comments_, retweets_, likes_, analytics_ (numbers) – on-chain stats

tags_ (string[]) – array of hashtags

mentions_ (string[]) – array of @-mentions

profileImage_ (string) – avatar URL

tweetLink_ (string) – link to the original tweet

tweetId_ (string) – the tweet’s unique ID

ipfsScreenshot_ (string) – URI of a screenshot

3. IP-registration metadata (if you want to customize) [data from the tweet]
ipMetadataURI, ipMetadataHash

nftMetadataURI, nftMetadataHash

(these are currently blank in your script but can be set if you have off-chain metadata)

4. License-terms setup [user defined data]
defaultMintingFee (BigInt)

currency (address) – e.g. your token used for fees

royaltyPolicy (address) – on-chain royalty policy module

transferable (boolean)

expiration (BigInt)

commercialUse, commercialAttribution (booleans)

commercialRevShare (number)

commercialRevCeiling (BigInt)

derivativesAllowed, derivativesAttribution, derivativesApproval, derivativesReciprocal (booleans)

derivativeRevCeiling (BigInt)

uri (string) – optional pointer to human-readable license text

5. License-token minting [user defined data]
licenseTermsId (string or number) – from the previous step

licensorIpId (address) – the IP asset you just registered

receiver (address) – who gets the license token

amount (number) – how many tokens to mint

maxMintingFee (BigInt)

maxRevenueShare (number)




PythonSDK issues:
IPAsset.register raw response: {'tx_hash': None, 'ip_id': '0xC323fe0C32133621630B709BEFD8D769696Cd537'}
No TXhash making it difficult to create & attatch license terms. So using TS SDK for this.

Bare Factory:


Factory With ^ + Basic IP and Story Metadata + Bugfix on NFT IP registration:
0x17C35b9175B42e19e4f8793Aeab28D255d1c6192

Factory With ^ + License terms and Optional Derivatives Added:
0x8a1885132A04fe94850BEc4f47C55Ca466C7Bb81

Factory With ^ + RoyaltyModule and ModuleRegistry:


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

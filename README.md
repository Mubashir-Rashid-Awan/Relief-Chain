# ReliefChain

## Transparent On-Chain Relief & Donation Platform

ReliefChain is a transparent donation platform for humanitarian campaigns built on Solana. Every donation is a real SPL token transfer, independently verified on-chain, and publicly auditable.

> **Demo Environment — Solana Devnet.** All donations use test tokens. No real money is involved.

---

## Problem

Traditional donation platforms require donors to trust centralized reports. You send money and hope it reaches the people who need it. There is no way to independently verify that your donation was received or how the total was calculated.

## Solution

ReliefChain records every donation as a real SPL token transfer on Solana. Each donation is independently verifiable on the Solana blockchain. Instead of trusting a dashboard number, you can click any donation and see the actual transaction on Solana Explorer — the sender, the recipient, the token, the amount, and the confirmation status.

---

## Features

- **Real Solana Wallet Connection** — Connect Phantom or any Solana-compatible wallet
- **Real SPL Token Donations** — Donations are actual USDC token transfers on Solana Devnet
- **On-Chain Transaction Verification** — Backend independently verifies each transaction against Solana RPC
- **Public Transparency Dashboard** — Every number comes from verified on-chain donations
- **Campaign Transparency Pages** — Per-campaign donation history with Solana Explorer links
- **Campaign Creation** — Create campaigns with milestones and categories
- **Duplicate Prevention** — Each transaction signature can only be recorded once
- **Solana Network Status** — Live RPC connectivity indicator
- **Responsive Design** — Works on desktop, tablet, and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Icons | Lucide React |
| Routing | React Router DOM |
| Blockchain | Solana Web3.js, SPL Token |
| Wallet | Phantom (direct provider integration) |
| Backend | Supabase Edge Functions (Deno) |
| Database | PostgreSQL (Supabase) |
| Validation | Zod |


---

## Architecture

```
DONOR
  ↓
SOLANA WALLET (Phantom)
  ↓
USDC / SPL TOKEN TRANSFER
  ↓
SOLANA DEVNET
  ↓
TRANSACTION SIGNATURE
  ↓
RELIEFCHAIN VERIFICATION API (Supabase Edge Function)
  ↓
POSTGRESQL DATABASE (Supabase)
  ↓
PUBLIC TRANSPARENCY DASHBOARD
```

### Transaction Flow

1. User opens a campaign
2. User enters donation amount
3. User connects Solana wallet (Phantom)
4. App checks wallet token balance
5. App validates amount
6. App creates SPL token transfer transaction (with ATA creation if needed)
7. User signs transaction in their wallet
8. Transaction is submitted to Solana Devnet
9. App waits for confirmation
10. App sends transaction signature to backend verification endpoint
11. Backend independently queries Solana RPC and verifies:
    - Transaction exists
    - Transaction succeeded
    - Correct token mint was transferred
    - Correct recipient wallet received the tokens
    - Amount matches expected donation
    - Donor wallet matches expected sender
12. Only then is the donation saved as **VERIFIED**
13. Campaign totals and transparency dashboard update
14. Success screen with Solana Explorer link

### Why This Architecture?

- **No custodial wallet** — The donor's wallet signs every transaction. The backend never receives private keys.
- **No trusting the frontend** — The backend independently verifies all transaction data against Solana RPC.
- **No double-counting** — Unique constraint on transaction signatures prevents duplicate donations.
- **Server-side verification** — Verification happens in a Supabase Edge Function using the service role key, not in the browser.

---

## Solana Integration

ReliefChain uses Solana meaningfully:

- **Real SPL token transfers** — Donations are actual `TransferChecked` instructions on the SPL token program
- **Associated Token Accounts** — Proper ATA handling, including idempotent ATA creation if the recipient doesn't have one yet
- **On-chain verification** — The backend fetches the full transaction from Solana RPC using `getTransaction` with `jsonParsed` encoding and inspects the parsed instructions
- **Token decimals** — Amounts are handled as bigint base units, never floating point
- **Configurable mint** — The USDC token mint is configurable via environment variables

### Wallet Integration

ReliefChain uses direct Phantom provider integration (`window.solana`) rather than `@solana/wallet-adapter-react` for the transaction flow. This is the most stable approach for signing and sending transactions in a Vite + React SPA without Next.js SSR concerns. The wallet adapter libraries are installed but the direct provider approach avoids unnecessary abstraction for a single-wallet MVP.

---

## Database Schema

### campaigns
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| title | text | Campaign title |
| slug | text (unique) | URL-friendly identifier |
| description | text | Campaign description |
| category | text | Category (Flood Relief, etc.) |
| goal_amount | bigint | Goal amount in token base units |
| recipient_wallet | text | Solana wallet address receiving donations |
| image_url | text | Optional cover image URL |
| status | text | active / paused / completed |
| is_demo | boolean | Whether this is a demo campaign |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### milestones
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| campaign_id | uuid (FK) | Reference to campaigns |
| title | text | Milestone title |
| description | text | Optional description |
| target | text | Target metric |
| status | text | pending / in_progress / completed |

### donations
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| campaign_id | uuid (FK) | Reference to campaigns |
| donor_wallet | text | Donor's Solana wallet address |
| amount | bigint | Donation amount in token base units |
| token_mint | text | SPL token mint address |
| signature | text (unique) | Solana transaction signature |
| status | text | verified / pending / failed |
| verified_at | timestamptz | When verification completed |

### impact_updates
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| campaign_id | uuid (FK) | Reference to campaigns |
| title | text | Update title |
| description | text | Optional description |
| image_url | text | Optional image URL |

---

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- A Phantom wallet (browser extension)
- Solana CLI (optional, for creating test tokens)

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL (pre-configured) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (pre-configured) |
| `VITE_SOLANA_NETWORK` | Solana network (devnet, testnet, mainnet-beta) |
| `VITE_SOLANA_RPC_URL` | Solana RPC endpoint URL |
| `VITE_USDC_MINT_ADDRESS` | SPL token mint address for USDC/test token |
| `VITE_USDC_DECIMALS` | Token decimals (6 for USDC) |
| `VITE_SOLANA_EXPLORER_CLUSTER` | Cluster parameter for Solana Explorer links |

Optional:

| Variable | Description |
|----------|-------------|

### 3. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Solana Devnet Setup

### Get Devnet SOL

You need Devnet SOL to pay for transaction fees (creating token accounts, transfer fees).

1. Open your Phantom wallet
2. Switch to **Devnet** (Settings → Developer → Test Networks → Devnet)
3. Visit the [Solana Faucet](https://faucet.solana.com/) and request Devnet SOL
4. Or use the CLI: `solana airdrop 2 --url https://api.devnet.solana.com`

### Configure the Token Mint

ReliefChain needs an SPL token mint address for donations. Since there is no official USDC mint on Devnet that is widely available for testing, you should create your own test token.

#### Option A: Create a Test Token with Solana CLI

```bash
# Install Solana CLI if needed
# See: https://docs.solana.com/cli/install-solana-cli-tools

# Set to devnet
solana config set --url https://api.devnet.solana.com

# Create a new token
spl-token create-token --decimals 6

# This outputs a token mint address like:
# Creating token TokenMintAddress...
# Signature: ...

# Copy the mint address and set it in your .env:
# VITE_USDC_MINT_ADDRESS=TokenMintAddress

# Create your token account
spl-token create-account <TokenMintAddress>

# Mint some test tokens to yourself
spl-token mint <TokenMintAddress> 10000

# Now you have 10,000 test tokens to donate with
```

#### Option B: Use an Existing Devnet Token

If you already have an SPL token on Devnet, just set its mint address in `VITE_USDC_MINT_ADDRESS`.

### Important Notes

- The UI clearly displays **"Devnet Test Token"** — this is not real USDC
- Token amounts are handled as bigint base units (no floating point)
- The configured mint is validated against the actual transaction during verification

---

## How to Test a Donation

1. Open the app at `http://localhost:5173`
2. Click **"Connect Wallet"** and connect your Phantom wallet (set to Devnet)
3. Make sure your wallet has:
   - Devnet SOL (for transaction fees)
   - Test tokens (from the mint you configured)
4. Navigate to **Campaigns** → click the demo campaign "Punjab Flood Relief 2026"
   - **Note:** Update the demo campaign's recipient wallet to your own wallet address in the database, or create a new campaign with your wallet as the recipient
5. Enter a donation amount (e.g., `10`)
6. Click **"Donate with Solana"**
7. Phantom will pop up — approve the transaction
8. Watch the status: "Waiting for wallet approval..." → "Transaction submitted. Verifying on Solana..." → "Verifying transaction on Solana RPC..."
9. On success: **"Donation verified on-chain"** with a Solana Explorer link
10. Check the campaign page — the donation appears in verified donation history
11. Check the **Transparency Dashboard** — totals have updated
12. Click the Explorer link to verify the transaction on Solana Explorer
13. Refresh the page — the donation persists (stored in PostgreSQL)

### Testing Edge Cases

- **Invalid transaction:** Try submitting an invalid signature to the verify endpoint — it will be rejected
- **Duplicate transaction:** Try verifying the same signature twice — the second attempt will be rejected
- **Wrong token mint:** Send a different token — verification will fail
- **Wrong recipient:** Send to a different address — verification will fail

---

## Vercel Deployment

ReliefChain is designed to be Vercel-friendly. The database is cloud-hosted (Supabase PostgreSQL) and all backend logic runs as Supabase Edge Functions (serverless).

### Steps

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "ReliefChain - Transparent on-chain relief platform"
   git branch -M main
   git remote add origin https://github.com/yourusername/reliefchain.git
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Environment Variables in Vercel:**
   - `VITE_SUPABASE_URL` — your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon key
   - `VITE_SOLANA_NETWORK` — `devnet`
   - `VITE_SOLANA_RPC_URL` — `https://api.devnet.solana.com`
   - `VITE_USDC_MINT_ADDRESS` — your test token mint
   - `VITE_USDC_DECIMALS` — `6`
   - `VITE_SOLANA_EXPLORER_CLUSTER` — `devnet`

4. **Deploy** — Vercel will build the project automatically

5. **Test** the deployed app:
   - Connect wallet
   - Make a test donation
   - Verify the transaction appears on Solana Explorer
   - Check the transparency dashboard

### Important: Vercel SPA Routing

The app uses client-side routing. The `vercel.json` file is included to handle SPA fallback so all routes work correctly.

---

## API Architecture

ReliefChain uses Supabase Edge Functions for server-side logic:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/functions/v1/verify-donation` | POST | Verify a Solana transaction and record the donation |

The frontend talks directly to Supabase PostgreSQL (via the anon key with RLS) for reading campaigns, donations, and creating campaigns. Donation insertion is handled exclusively by the `verify-donation` edge function (using the service role key) after on-chain verification.

---

## Project Structure

```
src/
├── App.tsx                    # Main app with routing
├── main.tsx                   # Entry point
├── index.css                  # Tailwind + global styles
├── types/
│   └── index.ts               # TypeScript types
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── campaigns.ts           # Campaign data access functions
│   ├── validation.ts          # Zod schemas
│   ├── utils.ts               # Utility functions
│   ├── solana/
│   │   ├── constants.ts       # Solana config, helpers
│   │   └── token.ts           # Token transfer, balance, formatting
│   └── wallet/
│       └── WalletContext.tsx  # Phantom wallet provider
├── components/
│   ├── navbar/
│   │   ├── Navbar.tsx
│   │   ├── WalletButton.tsx
│   │   └── NetworkStatus.tsx
│   ├── footer/
│   │   └── Footer.tsx
│   ├── campaign/
│   │   └── CampaignCard.tsx
│   ├── donation/
│   │   └── DonationForm.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Modal.tsx
│       ├── Progress.tsx
│       ├── StatCard.tsx
│       ├── SectionHeading.tsx
│       └── Feedback.tsx
└── pages/
    ├── HomePage.tsx
    ├── CampaignsPage.tsx
    ├── CampaignDetailPage.tsx
    ├── CampaignTransparencyPage.tsx
    ├── CreateCampaignPage.tsx
    ├── TransparencyDashboardPage.tsx
    └── HowItWorksPage.tsx

supabase/
├── config.toml
├── functions/
│   ├── verify-donation/
│   │   └── index.ts           # Solana transaction verification
└── migrations/
    └── *.sql                  # Database schema
```

---

## Known Limitations

1. **Devnet only** — The app is configured for Solana Devnet. Mainnet deployment would require updating the RPC URL and token mint.
2. **Test token, not real USDC** — There is no widely available official USDC mint on Devnet. The app uses a configurable test token. The UI clearly labels this as "Devnet Test Token."
3. **Single wallet provider** — The MVP integrates directly with Phantom. Wallet adapter support for multiple wallets could be added.
4. **No user authentication** — Campaign creation is open. For production, wallet-based authentication would be added.
5. **Demo campaign recipient** — The demo campaign uses a placeholder wallet address. Update it to your own wallet before testing donations.

---

## Future Improvements

- Multi-wallet support via Solana Wallet Adapter
- Wallet-based authentication for campaign ownership
- Mainnet deployment with real USDC
- Campaign approval workflow for verified organizations
- Recurring donations via Solana token vesting
- Milestone-based fund release with multi-sig
- Mobile app
- Multi-language support
- IPFS storage for campaign images
- Real-time donation notifications via Supabase Realtime

---

## Hackathon Submission Description

**ReliefChain** is a transparent on-chain relief and donation platform built on Solana. It solves the trust problem in humanitarian donations by recording every contribution as a real SPL token transfer on the Solana blockchain.

**Why blockchain matters:** Traditional donation platforms require trust. ReliefChain provides proof — every donation has a verifiable Solana transaction signature.

**Why Solana:** Solana's low fees, high throughput, and mature SPL token ecosystem make it ideal for micro-donations and high-volume relief campaigns.

**What makes it different:** ReliefChain doesn't just display a donation number. It provides the blockchain transaction as proof. Anyone can independently verify any donation on Solana Explorer.

**Technical credibility:** The backend independently verifies each transaction against Solana RPC — checking transaction existence, success status, token mint, recipient, amount, and sender. Duplicate signatures are rejected. No fake transactions, no mock verification.

---

## License

MIT — see [LICENSE](LICENSE)

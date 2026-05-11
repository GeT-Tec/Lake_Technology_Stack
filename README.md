# Lake — Opening digital horizons

Lake is a state-of-the-art Web3 tokenization platform designed for the Brazilian market. It bridges the gap between traditional Real World Assets (RWA) and decentralized finance, allowing users to legally and securely structure, tokenize, and manage assets on the **Solana** blockchain with immutable document auditing via **Arweave (Irys)**.

## 🌟 Key Features

- **Trilateral Currency Engine**: Real-time financial conversion between BRL (Real), USDC (Digital Dollar), and SOL (Solana) across the entire platform, providing institutional-grade transparency.
- **Titanium Credit System**: A fully integrated credit architecture that gates premium actions (like Web3 Tokenization) using a fiat-to-credit model.
- **Arweave & Irys Immutability**: All legal documents and feasibility studies are permanently uploaded to the Arweave blockchain using Irys gateways, ensuring CVM compliance and zero-tampering guarantees.
- **Dual-Oracle Pricing**: Integrates AwesomeAPI (Fiat) and Jupiter/Pyth (Solana) to ensure real-time precision for financial projections.
- **UX Financeira Premium**: A responsive, beautifully crafted interface built with Tailwind CSS, handling everything from micro-animations to astronomical numeric stress tests (Trillions) seamlessly.
- **Next.js App Router**: Optimized for maximum performance, SSR, and SEO.

## 🛠 Technology Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | Next.js 14+ (App Router), React, TypeScript |
| **Styling** | Tailwind CSS v4, Lucide Icons, Modern UI Aesthetics |
| **Backend & ORM** | Prisma, PostgreSQL (Supabase) |
| **Web3 & Storage** | Solana SDK, Arweave, Irys Relayer |
| **Oracles** | AwesomeAPI (USD/BRL), Jupiter API (SOL/USD) |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Local or Supabase)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/lake"
   NEXT_PUBLIC_IRYS_NETWORK="devnet"
   NEXT_PUBLIC_IRYS_TOKEN="solana"
   IRYS_PRIVATE_KEY="[YOUR_TREASURY_WALLET_PRIVATE_KEY]"
   ```

3. **Initialize the Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the Development Server:**
   *(If you encounter file lock errors on Windows, run `Stop-Process -Name node -Force` first).*
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the platform.

## 💡 Architecture Highlights

### The Tokenization Flow
The `/tokenize` pipeline guides the user through three critical steps:
1. **Structuring**: Defining the legal and commercial nature of the RWA.
2. **Financial Engine**: Dynamic real-time calculation of Valuation, Captação Total, and Lucro Estimado using trilateral BRL/USDC/SOL rates.
3. **Immutable Audit**: Uploading the contract to Arweave via a backend Irys relayer, sponsored entirely by the platform's treasury.

### Credit Engine
The platform uses a `CreditsModal` combined with a robust `/api/users/credits` backend endpoint to manage user balances, gating expensive on-chain operations to prevent abuse while providing a premium onboarding experience.

## 🔒 Security & Performance
- **Safe Math**: All frontend currency calculations use `Intl.NumberFormat` to prevent JavaScript floating-point errors and e-notation overflow.
- **Relayer Architecture**: Private keys are strictly kept on the backend. The Next.js API Routes sign Irys transactions securely, shielding the treasury from client-side attacks.

---
*Built with excellence by the LakeZero team.*

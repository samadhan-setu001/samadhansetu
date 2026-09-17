# VeriCity Blockchain Infrastructure (Polygon Amoy & Local Hardhat)

This subproject provides Solidity smart contracts, tests, and deployment automation for VeriCity:
1. **`ResolutionAnchor.sol`**: Anchors nightly Merkle roots of field resolution records to the blockchain with timestamp verification.
2. **`OfficerReputation.sol`**: Append-only, non-overwritable on-chain log of nightly municipal officer performance score updates.

---

## Quick Start: Local Blockchain (Zero Faucet Tokens Needed)

### 1. Install Dependencies
```bash
cd blockchain
npm install
```

### 2. Start Local Blockchain Node
In a dedicated terminal window:
```bash
npm run node
```
This launches a local JSON-RPC Ethereum node at `http://127.0.0.1:8545` with 20 pre-funded test accounts (10,000 ETH each).

### 3. Deploy Contracts Locally
In another terminal:
```bash
npm run deploy:local
```
This deploys both `ResolutionAnchor` and `OfficerReputation`, saves the addresses to `deployed-contracts.json`, and updates `frontend/samadhan-setu/.env.local` automatically.

### 4. Run Contract Tests
```bash
npm test
```
Runs the automated test suite verifying root anchoring, append-only score history, batch recording, and security constraints.

---

## Deploy to Polygon Amoy Testnet

### 1. Get Amoy Testnet Tokens
- Connect your MetaMask to **Polygon Amoy Testnet** (Chain ID: `80002`, RPC: `https://rpc-amoy.polygon.technology`).
- Claim testnet POL from [faucet.polygon.technology](https://faucet.polygon.technology).

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and set:
```ini
TARGET_NETWORK=amoy
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_metamask_private_key_here
```

### 3. Deploy to Amoy
```bash
npm run deploy:amoy
```
The script will display the deployed contract addresses and their direct links on **Polygonscan Amoy**:
- ResolutionAnchor: `https://amoy.polygonscan.com/address/<ADDRESS>`
- OfficerReputation: `https://amoy.polygonscan.com/address/<ADDRESS>`

---

## Switching Between Local and Amoy
You can toggle between local and Amoy by running either:
- `npm run deploy:local` (for localhost)
- `npm run deploy:amoy` (for Polygon Amoy)

Or update `TARGET_NETWORK=local` or `TARGET_NETWORK=amoy` in `.env`.

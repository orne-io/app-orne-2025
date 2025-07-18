# ORNE Staking DApp

A modern decentralized application for staking ORNE tokens with integrated carbon offset tracking on Arbitrum.

## 🌱 Full Feature List

- **ORNE Token Staking**: Stake your tokens to earn rewards.
- **Rewards System**: Earn additional ORNE by participating in staking.
- **Carbon Offset Tracking**: Visualize the environmental impact of your staking (global and individual CO2 offset).
- **Carbon Footprint Calculator**: Estimate your footprint and compare it to your offset via staking.
- **Real-time Dashboard**: Global statistics, interactive charts, staking/CO2/price evolution, and more.
- **Holders Page**: List of all token holders, with balances, staking, unstaking, and Arbiscan links.
- **Detailed History**: Access the history of staking, unstaking, rewards, and CO2 additions (global and per user).
- **Integrated Swap Interface**: Swap your ORNE on Uniswap V3 directly from the DApp.
- **Wallet Connection**: RainbowKit (WalletConnect, MetaMask, etc.)
- **Responsive Interface**: Optimized for desktop & mobile
- **Security**:
  - Audited contracts, time-locks
  - Input validation, error handling, HTTPS only
  - Non-custodial transactions (your keys remain private)

## 🚀 Installation

```bash
npm install
npm start
```

## 🛠️ Usage

- Open [http://localhost:3000](http://localhost:3000) in your browser after starting the app.
- Connect your wallet using the "Connect Wallet" button.
- Stake your ORNE to earn rewards and offset CO2.

## ⚡ Tech Stack
- React 18
- RainbowKit & Wagmi
- Ethers.js
- Express.js backend (stats, holders API)
- SQLite database (secure copy for the API)
- Arbitrum mainnet

## 📦 Project Structure
- `src/` — React frontend (components, hooks, styles)
- `orne-api/` — Express backend for stats
- `public/` — Static assets

## 🔗 Main API Endpoints
- `/api/global-staked`, `/api/global-unstaking`, `/api/global-rewards-distributed`, `/api/global-co2`, `/api/global-holders`, `/api/global-stakers`, `/api/global-co2-per-orne`
- `/api/holders`: complete list of holders and balances
- `/api/history-staked`, `/api/history-staked/:address`, `/api/history-co2`, `/api/history-rewards`
- `/api/indexer-status`: platform info (last block, last action, last DB modification)
- `/api/admin-balance` (circulating supply)

## 🛡️ Security & Best Practices
- Audited contracts, time-locks
- Signed transactions, never store private keys
- Robust input validation and error handling
- Always use the official URL and keep your wallet up to date

## 📝 License
MIT

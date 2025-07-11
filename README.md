# ORNE Staking DApp

A modern, responsive DApp for staking ORNE tokens with integrated CO2 offset tracking on Arbitrum.

## 🌱 Features

- Stake ORNE tokens and earn rewards
- CO2 offset tracking per staked token
- Real-time statistics and charts
- Admin panel for rewards and CO2 management (owner only)
- Responsive interface (desktop & mobile)
- Wallet connection via RainbowKit (WalletConnect, MetaMask, etc.)

## 🚀 Installation

```bash
npm install
npm start
```

## 🛠️ Usage

- Open [http://localhost:3000](http://localhost:3000) in your browser after starting the app.
- Connect your wallet using the "Connect Wallet" button.
- Stake your ORNE tokens to earn rewards and contribute to CO2 offset.
- Admins can access the admin panel by connecting with the contract owner wallet and adding `#admin` to the URL.

## ⚡ Tech Stack
- React
- RainbowKit & Wagmi
- Ethers.js
- Express.js backend (API for stats)
- Arbitrum Sepolia testnet

## 📦 Project Structure
- `src/` — React frontend (components, hooks, styles)
- `orne-api/` — Express backend for blockchain stats
- `public/` — Static assets

## 🌍 Environment
- Make sure to set up your environment variables for API keys (see `orne-api/.env.example` if available).

## 📝 License
MIT

<!--
# ORNE Staking DApp (FR)

DApp de staking pour les tokens ORNE avec compensation carbone sur Arbitrum.

## 🌱 Fonctionnalités

- Staking de tokens ORNE
- Système de rewards
- Tracking CO2 offset
- Interface moderne et responsive

## 🚀 Installation

```bash
npm install
npm start
```
-->

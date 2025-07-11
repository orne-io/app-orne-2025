const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();
const axios = require('axios');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;

// Adresse du contrat et ABI minimale
const CONTRACT_ADDRESS = "0x62A8347f59491F38d13EEe04c2C481bBAa0Ae326";
const ABI = [
  "function getTotalPendingUnstakes() view returns (uint256)",
  "function getUniqueHoldersCount() view returns (uint256)",
  "function getUniqueStakersCount() view returns (uint256)",
  "function getTotalCO2Offset() view returns (uint256)",
  "function co2PerOrne() view returns (uint256)",
  "function totalStaked() view returns (uint256)"
];

// RPC Arbitrum Sepolia (mets ta clé Alchemy/Infura si besoin)
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// Total staké (en ORNE)
app.get('/api/global-staked', async (req, res) => {
  try {
    const value = await contract.totalStaked();
    res.json({ totalStaked: ethers.formatUnits(value, 18) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Blockchain read error' });
  }
});

// Nombre de détenteurs uniques (via Arbiscan)
app.get('/api/global-holders', async (req, res) => {
  try {
    const tokenAddress = "0xaf3acac72af103dc0aded53f1cc08638f856bf8f";
    const apiKey = process.env.ARBISCAN_API_KEY;
    // Fallback: récupère les 1000 dernières txs du token
    const url = `https://api-sepolia.arbiscan.io/api?module=account&action=tokentx&contractaddress=${tokenAddress}&page=1&offset=1000&sort=desc&apikey=${apiKey}`;
    const response = await axios.get(url);
	console.log('Arbiscan tokentx response:', response.data);
    const txs = response.data.result;
	if (!Array.isArray(txs)) {
	  console.error('Arbiscan tokentx result is not an array:', response.data);
	  return res.json({ uniqueHolders: 0 });
	}
	// Compte les adresses uniques destinataires
	const holders = new Set();
	txs.forEach(tx => {
	  holders.add(tx.to.toLowerCase());
	});
	res.json({ uniqueHolders: holders.size });
  } catch (err) {
  console.error('Arbiscan API error:', err.response ? err.response.data : err.message);
  res.status(500).json({ error: 'Arbiscan API error' });
}
});

// Nombre de stakers uniques
app.get('/api/global-stakers', async (req, res) => {
  try {
    const value = await contract.getUniqueStakersCount();
    res.json({ uniqueStakers: Number(value) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Blockchain read error' });
  }
});

// Total CO2 offset (en kg)
app.get('/api/global-co2', async (req, res) => {
  try {
    const value = await contract.getTotalCO2Offset();
    // Conversion en kg
    const valueKg = Number(value.toString()) / 1000;
    res.json({ totalCO2OffsetKg: valueKg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Blockchain read error' });
  }
});

// CO2 par ORNE (en grammes)
app.get('/api/global-co2-per-orne', async (req, res) => {
  try {
    const value = await contract.co2PerOrne();
    res.json({ co2PerOrne: Number(value) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Blockchain read error' });
  }
});

// Unstaking global (en ORNE)
app.get('/api/global-unstaking', async (req, res) => {
  try {
    const value = await contract.getTotalPendingUnstakes();
    res.json({ totalPendingUnstakes: ethers.formatUnits(value, 18) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Blockchain read error' });
  }
});

// === HISTORIQUE CO2 ===
app.get('/api/history-co2', async (req, res) => {
  try {
    const ABI = [
      "event CO2Updated(uint256 addedTonnes, uint256 newCO2PerOrne)"
    ];
    const co2Contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const events = await co2Contract.queryFilter("CO2Updated");
    // Récupérer les timestamps des blocks
    const history = await Promise.all(events.map(async (ev) => {
      const block = await provider.getBlock(ev.blockNumber);
      return {
        date: new Date(block.timestamp * 1000).toISOString().slice(0, 10),
        tonnes: Number(ev.args.addedTonnes),
        txHash: ev.transactionHash
      };
    }));
    res.json(history.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur historique CO2' });
  }
});

// === HISTORIQUE REWARDS ===
app.get('/api/history-rewards', async (req, res) => {
  try {
    const ABI = [
      "event RewardsDeposited(uint256 amount)"
    ];
    const rewardsContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const events = await rewardsContract.queryFilter("RewardsDeposited", -10000);
    const history = await Promise.all(events.map(async (ev) => {
      const block = await provider.getBlock(ev.blockNumber);
      return {
        date: new Date(block.timestamp * 1000).toISOString().slice(0, 10),
        amount: Number(ethers.formatUnits(ev.args.amount, 18)),
        txHash: ev.transactionHash
      };
    }));
    res.json(history.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur historique rewards' });
  }
});

app.listen(PORT, () => {
  console.log(`ORNE backend listening on port ${PORT}`);
});
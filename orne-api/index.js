const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json()); // Ajouter cette ligne pour parser le JSON

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

// Total des ORNE distribués (rewards)
app.get('/api/global-rewards-distributed', async (req, res) => {
  try {
    const ABI = [
      "function totalRewardsDeposited() view returns (uint256)"
    ];
    const rewardsContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const value = await rewardsContract.totalRewardsDeposited();
    res.json({ totalRewardsDistributed: ethers.formatUnits(value, 18) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Blockchain read error' });
  }
});

// Balance du wallet admin (pour calculer le circulating supply)
app.get('/api/admin-balance', async (req, res) => {
  try {
    const adminAddress = "0x734af0e9a54029b28ebcbba144b13264e0eac6fe";
    const ABI = [
      "function balanceOf(address) view returns (uint256)"
    ];
    const tokenContract = new ethers.Contract("0xaf3acac72af103Dc0adeD53F1CC08638f856Bf8F", ABI, provider);
    const balance = await tokenContract.balanceOf(adminAddress);
    res.json({ adminBalance: ethers.formatUnits(balance, 18) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Blockchain read error' });
  }
});

// Récupérer le délai d'unstaking actuel
app.get('/api/current-unstaking-delay', async (req, res) => {
  try {
    const ABI = [
      "function unstakingDelay() view returns (uint256)"
    ];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const delayInSeconds = await contract.unstakingDelay();
    const delayInMinutes = Number(delayInSeconds) / 60;
    const delayInDays = delayInMinutes / 1440; // 1440 minutes = 1 jour
    
    res.json({ 
      delaySeconds: Number(delayInSeconds),
      delayMinutes: delayInMinutes,
      delayDays: delayInDays
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting current unstaking delay' });
  }
});

// Modifier le délai d'unstaking (admin only)
app.post('/api/set-unstaking-delay', async (req, res) => {
  try {
    console.log('setUnstakingDelay called with body:', req.body);
    const { minutes } = req.body;
    
    if (!minutes || minutes < 1 || minutes > 525600) { // Max 1 an
      console.log('Invalid minutes:', minutes);
      return res.status(400).json({ error: 'Invalid delay (1-525600 minutes)' });
    }
    
    const delayInSeconds = minutes * 60;
    console.log('Delay in seconds:', delayInSeconds);
    
    // Signature de la fonction setUnstakingDelay(uint256)
    // Method ID: 0x54c8dbcc (calculé manuellement)
    const methodId = '0x54c8dbcc';
    
    // Encoder le paramètre uint256 (delayInSeconds) en hex
    const paramHex = delayInSeconds.toString(16).padStart(64, '0');
    const data = methodId + paramHex;
    
    console.log('Generated data:', data);
    
    res.json({ 
      success: true, 
      delayMinutes: minutes,
      delaySeconds: delayInSeconds,
      data: data 
    });
  } catch (err) {
    console.error('Error in setUnstakingDelay:', err);
    res.status(500).json({ error: 'Error setting unstaking delay: ' + err.message });
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
      const date = new Date(block.timestamp * 1000);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        fullDate: date.toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
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
    const events = await rewardsContract.queryFilter("RewardsDeposited");
    const history = await Promise.all(events.map(async (ev) => {
      const block = await provider.getBlock(ev.blockNumber);
      const date = new Date(block.timestamp * 1000);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        fullDate: date.toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
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

// === HISTORIQUE STAKING ===
app.get('/api/history-staked', async (req, res) => {
  try {
    const ABI = [
      "event Staked(address indexed user, uint256 amount)",
      "event UnstakeRequested(address indexed user, uint256 amount, uint256 unlockTime)"
    ];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    // Récupère tous les events Staked et UnstakeRequested
    const stakedEvents = await contract.queryFilter("Staked");
    const unstakeEvents = await contract.queryFilter("UnstakeRequested");
    // Fusionne et trie les events par blockNumber
    const allEvents = [...stakedEvents, ...unstakeEvents].sort((a, b) => a.blockNumber - b.blockNumber);
    let totalStaked = 0;
    const history = [];
    for (const ev of allEvents) {
      const block = await provider.getBlock(ev.blockNumber);
      const eventName = ev.event || ev.eventName || (ev.fragment && ev.fragment.name);
      console.log('Event:', eventName, 'Amount:', ev.args.amount.toString(), 'Block:', ev.blockNumber);
      console.log('Formatted:', ethers.formatUnits(ev.args.amount, 18));
      if (eventName === "Staked") {
        totalStaked += parseFloat(ethers.formatUnits(ev.args.amount, 18));
      } else if (eventName === "UnstakeRequested") {
        totalStaked -= parseFloat(ethers.formatUnits(ev.args.amount, 18));
      }
      const date = new Date(block.timestamp * 1000);
      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        fullDate: date.toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        totalStaked: Number(totalStaked.toFixed(4))
      });
    }
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur historique staking' });
  }
});

// === HISTORIQUE STAKING PAR UTILISATEUR ===
app.get('/api/history-staked/:address', async (req, res) => {
  try {
    const userAddress = req.params.address.toLowerCase();
    const ABI = [
      "event Staked(address indexed user, uint256 amount)",
      "event UnstakeRequested(address indexed user, uint256 amount, uint256 unlockTime)",
      "event Unstaked(address indexed user, uint256 amount)",
      "event RewardsClaimed(address indexed user, uint256 amount)"
    ];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    // Filtrer tous les events pour l'utilisateur
    const stakedEvents = await contract.queryFilter(contract.filters.Staked(userAddress));
    const unstakeRequestedEvents = await contract.queryFilter(contract.filters.UnstakeRequested(userAddress));
    const unstakedEvents = await contract.queryFilter(contract.filters.Unstaked(userAddress));
    const rewardsClaimedEvents = await contract.queryFilter(contract.filters.RewardsClaimed(userAddress));
    
    // Fusionner et trier par blockNumber
    const allEvents = [...stakedEvents, ...unstakeRequestedEvents, ...unstakedEvents, ...rewardsClaimedEvents].sort((a, b) => a.blockNumber - b.blockNumber);
    const history = await Promise.all(allEvents.map(async (ev) => {
      const block = await provider.getBlock(ev.blockNumber);
      const eventName = ev.event || ev.eventName || (ev.fragment && ev.fragment.name);
      let amount = Number(ethers.formatUnits(ev.args.amount, 18));
      let unlockTime = null;
      let type = eventName;
      
      // Mapper les types d'événements pour l'affichage
      if (eventName === 'Staked') {
        type = 'Stake';
      } else if (eventName === 'UnstakeRequested') {
        type = 'Unstake Request';
        if (ev.args.unlockTime) {
          unlockTime = new Date(Number(ev.args.unlockTime) * 1000).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        }
      } else if (eventName === 'Unstaked') {
        type = 'Unstake Final';
      } else if (eventName === 'RewardsClaimed') {
        type = 'Claim Rewards';
      }
      
      return {
        type,
        date: new Date(block.timestamp * 1000).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        amount,
        unlockTime,
        txHash: ev.transactionHash
      };
    }));
    res.json(history.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur historique staking utilisateur' });
  }
});

app.listen(PORT, () => {
  console.log(`ORNE backend listening on port ${PORT}`);
});
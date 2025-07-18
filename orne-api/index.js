const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();
const axios = require('axios');
const Database = require('better-sqlite3');
const SQLITE_PATH = './events-api.sqlite';
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json()); // Ajouter cette ligne pour parser le JSON

const PORT = process.env.PORT || 4000;

// MAINNET CONFIG: All addresses below are for Arbitrum One mainnet
const CONTRACT_ADDRESS = "0x100156F27A3686a4da7fEE7148520A229320e7c8"; // Staking Vault mainnet
const ORNE_TOKEN_ADDRESS = "0x89DbdB8e3b0e41aAe0871Bf9e1fcCe72F117bB1f";
const ADMIN_ADDRESS = "0x38b27cb0339334e0ac2B73D0bF5B57b6Fc3Db8c5";
const ABI = [
  "function getTotalPendingUnstakes() view returns (uint256)",
  "function getUniqueHoldersCount() view returns (uint256)",
  "function getUniqueStakersCount() view returns (uint256)",
  "function getTotalCO2Offset() view returns (uint256)",
  "function co2PerOrne() view returns (uint256)",
  "function totalStaked() view returns (uint256)"
];

// RPC Arbitrum Mainnet
const RPC_URL = "https://arb-mainnet.g.alchemy.com/v2/-ofb30ntFCdQjf6j0VbjwHdTu7Yubcw5";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// === GLOBAL STATS FROM SQLITE ===

// Total staké (en ORNE)
app.get('/api/global-staked', async (req, res) => {
  try {
    const db = new Database(SQLITE_PATH, { readonly: true });
    const events = db.prepare(`SELECT eventType, amount FROM events WHERE eventType IN ('Staked', 'UnstakeRequested')`).all();
    let total = 0;
    for (const ev of events) {
      const amount = parseFloat(ev.amount) / 1e18;
      if (ev.eventType === 'Staked') total += amount;
      else if (ev.eventType === 'UnstakeRequested') total -= amount;
    }
    db.close();
    res.json({ totalStaked: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur global-staked (sqlite)' });
  }
});

// Total en cours d'unstaking (en ORNE)
app.get('/api/global-unstaking', async (req, res) => {
  try {
    const db = new Database(SQLITE_PATH, { readonly: true });
    // On considère les UnstakeRequested non encore "Unstaked"
    const requests = db.prepare(`SELECT user, amount, blockNumber FROM events WHERE eventType = 'UnstakeRequested'`).all();
    const unstaked = db.prepare(`SELECT user, amount, blockNumber FROM events WHERE eventType = 'Unstaked'`).all();
    // On fait le solde par user
    const pending = {};
    for (const req of requests) {
      const key = req.user + '-' + req.amount;
      pending[key] = (pending[key] || 0) + parseFloat(req.amount) / 1e18;
    }
    for (const u of unstaked) {
      const key = u.user + '-' + u.amount;
      if (pending[key]) pending[key] -= parseFloat(u.amount) / 1e18;
    }
    const total = Object.values(pending).reduce((a, b) => a + (b > 0 ? b : 0), 0);
    db.close();
    res.json({ totalPendingUnstakes: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur global-unstaking (sqlite)' });
  }
});

// Total des ORNE distribués (rewards)
app.get('/api/global-rewards-distributed', async (req, res) => {
  try {
    const db = new Database(SQLITE_PATH, { readonly: true });
    const events = db.prepare(`SELECT amount FROM events WHERE eventType = 'RewardsDeposited'`).all();
    let total = 0;
    for (const ev of events) {
      total += parseFloat(ev.amount) / 1e18;
    }
    db.close();
    res.json({ totalRewardsDistributed: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur global-rewards-distributed (sqlite)' });
  }
});

// Total CO2 offset (en tonnes)
app.get('/api/global-co2', async (req, res) => {
  try {
    const db = new Database(SQLITE_PATH, { readonly: true });
    const events = db.prepare(`SELECT amount FROM events WHERE eventType = 'CO2Updated'`).all();
    let total = 0;
    for (const ev of events) {
      total += parseFloat(ev.amount);
    }
    db.close();
    res.json({ totalCO2OffsetT: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur global-co2 (sqlite)' });
  }
});

// Nombre de détenteurs uniques (approximatif)
app.get('/api/global-holders', async (req, res) => {
  try {
    const db = new Database(SQLITE_PATH, { readonly: true });
    // Compte toutes les adresses distinctes ayant reçu des ORNE (hors mint vers 0x0)
    const holders = db.prepare(`
      SELECT COUNT(DISTINCT "to") as count
      FROM erc20_transfers
      WHERE "to" != '0x0000000000000000000000000000000000000000'
    `).get();
    db.close();
    res.json({ uniqueHolders: holders.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur global-holders (sqlite)' });
  }
});

// Nombre de stakers uniques (approximatif)
app.get('/api/global-stakers', async (req, res) => {
  try {
    const db = new Database(SQLITE_PATH, { readonly: true });
    // On considère tous les users ayant au moins un event Staked
    const users = db.prepare(`SELECT DISTINCT user FROM events WHERE eventType = 'Staked' AND user IS NOT NULL AND user != ''`).all();
    db.close();
    res.json({ uniqueStakers: users.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur global-stakers (sqlite)' });
  }
});

// CO2 par ORNE (en grammes)
app.get('/api/global-co2-per-orne', async (req, res) => {
  try {
    const db = new Database(SQLITE_PATH, { readonly: true });
    // Total CO2 (en grammes)
    const co2Events = db.prepare(`SELECT amount FROM events WHERE eventType = 'CO2Updated'`).all();
    let totalCO2 = 0;
    for (const ev of co2Events) {
      totalCO2 += parseFloat(ev.amount) * 1000; // Convertir tonnes -> grammes
    }
    // Total staké (en ORNE)
    const events = db.prepare(`SELECT eventType, amount FROM events WHERE eventType IN ('Staked', 'UnstakeRequested')`).all();
    let totalStaked = 0;
    for (const ev of events) {
      const amount = parseFloat(ev.amount) / 1e18;
      if (ev.eventType === 'Staked') totalStaked += amount;
      else if (ev.eventType === 'UnstakeRequested') totalStaked -= amount;
    }
    db.close();
    let co2PerOrne = 0;
    if (totalStaked > 0) co2PerOrne = totalCO2 / totalStaked;
    res.json({ co2PerOrne });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur global-co2-per-orne (sqlite)' });
  }
});

// Balance du wallet admin (pour calculer le circulating supply)
app.get('/api/admin-balance', async (req, res) => {
  try {
    const ABI = [
      "function balanceOf(address) view returns (uint256)"
    ];
    const tokenContract = new ethers.Contract(ORNE_TOKEN_ADDRESS, ABI, provider);
    const balance = await tokenContract.balanceOf(ADMIN_ADDRESS);
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

// === HISTORIQUE CO2 (depuis SQLite) ===
app.get('/api/history-co2', async (req, res) => {
  try {
    const db = new Database(SQLITE_PATH, { readonly: true });
    // On récupère tous les events CO2Updated, triés par blockNumber
    const events = db.prepare(`SELECT amount, blockNumber, txHash, timestamp, extra FROM events WHERE eventType = 'CO2Updated' ORDER BY blockNumber ASC`).all();
    let total = 0;
    const history = events.map(ev => {
      total += parseFloat(ev.amount);
      const date = new Date(ev.timestamp * 1000);
      let newCO2PerOrne = null;
      if (ev.extra) {
        try {
          const extra = JSON.parse(ev.extra);
          newCO2PerOrne = extra.newCO2PerOrne;
        } catch {}
      }
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        fullDate: date.toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        tonnes: parseFloat(ev.amount),
        txHash: ev.txHash,
        newCO2PerOrne
      };
    });
    db.close();
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur historique CO2 (sqlite)' });
  }
});

// === HISTORIQUE REWARDS ===
app.get('/api/history-rewards', async (req, res) => {
  try {
    const db = new Database(SQLITE_PATH, { readonly: true });
    // On récupère tous les events RewardsDeposited, triés par blockNumber
    const events = db.prepare(`SELECT amount, blockNumber, txHash, timestamp FROM events WHERE eventType = 'RewardsDeposited' ORDER BY blockNumber ASC`).all();
    const history = events.map(ev => {
      const date = new Date(ev.timestamp * 1000);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        fullDate: date.toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        amount: parseFloat(ev.amount) / 1e18,
        txHash: ev.txHash
      };
    });
    db.close();
    res.json(history.reverse()); // du plus récent au plus ancien
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur historique rewards (sqlite)' });
  }
});

// === HISTORIQUE STAKING GLOBAL (depuis SQLite) ===
app.get('/api/history-staked', async (req, res) => {
  try {
    const db = new Database(SQLITE_PATH, { readonly: true });
    // On récupère tous les events Staked et UnstakeRequested, triés par blockNumber
    const events = db.prepare(`SELECT eventType, amount, blockNumber, timestamp FROM events WHERE eventType IN ('Staked', 'UnstakeRequested') ORDER BY blockNumber ASC`).all();
    let totalStaked = 0;
    const history = [];
    for (const ev of events) {
      const amount = parseFloat(ev.amount) / 1e18;
      if (ev.eventType === 'Staked') totalStaked += amount;
      else if (ev.eventType === 'UnstakeRequested') totalStaked -= amount;
      const date = new Date(ev.timestamp * 1000);
      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        fullDate: date.toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        totalStaked: totalStaked
      });
    }
    db.close();
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur historique staking (sqlite)' });
  }
});

// === HISTORIQUE STAKING PAR UTILISATEUR (depuis SQLite) ===
app.get('/api/history-staked/:address', async (req, res) => {
  const userAddress = req.params.address.toLowerCase();
  try {
    const db = new Database(SQLITE_PATH, { readonly: true });
    // On récupère tous les events de l'utilisateur, triés par blockNumber
    const events = db.prepare(`SELECT eventType, amount, unlockTime, blockNumber, txHash, timestamp FROM events WHERE user = ? AND eventType IN ('Staked', 'UnstakeRequested', 'Unstaked', 'RewardsClaimed') ORDER BY blockNumber ASC`).all(userAddress);
    const history = events.map(ev => {
      let type = ev.eventType;
      if (ev.eventType === 'Staked') type = 'Stake';
      else if (ev.eventType === 'UnstakeRequested') type = 'Unstake Request';
      else if (ev.eventType === 'Unstaked') type = 'Unstake Final';
      else if (ev.eventType === 'RewardsClaimed') type = 'Claim Rewards';
      let unlockTime = null;
      if (ev.unlockTime) {
        unlockTime = new Date(Number(ev.unlockTime) * 1000).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      }
      return {
        date: ev.timestamp ? new Date(ev.timestamp * 1000).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '',
        type,
        amount: parseFloat(ev.amount) / 1e18,
        unlockTime,
        txHash: ev.txHash
      };
    });
    db.close();
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur historique staking utilisateur (sqlite)' });
  }
});

// === NEW HOLDERS ROUTE (FULL ERC20 + STAKING) ===
app.get('/api/holders', async (req, res) => {
  try {
    const db = new Database(SQLITE_PATH, { readonly: true });
    // 1. Get all addresses that ever received or sent ORNE
    const allAddresses = db.prepare(`
      SELECT address FROM (
        SELECT DISTINCT "from" as address FROM erc20_transfers
        UNION
        SELECT DISTINCT "to" as address FROM erc20_transfers
      )
      WHERE address != '0x0000000000000000000000000000000000000000'
    `).all().map(r => r.address.toLowerCase());

    // 2. Build ERC20 balances
    const balances = {};
    for (const addr of allAddresses) {
      let received = db.prepare('SELECT SUM(CAST(amount AS TEXT)) as total FROM erc20_transfers WHERE "to" = ?').get(addr).total;
      let sent = db.prepare('SELECT SUM(CAST(amount AS TEXT)) as total FROM erc20_transfers WHERE "from" = ?').get(addr).total;
      received = received === null ? '0' : received;
      sent = sent === null ? '0' : sent;
      try {
        const totalHolding = (BigInt(received) - BigInt(sent)) / 10n**18n;
        balances[addr] = { totalHolding: Number(totalHolding) };
      } catch (e) {
        throw e;
      }
    }

    // 3. Build staking/unstaking per address
    const events = db.prepare("SELECT eventType, user, amount FROM events WHERE user IS NOT NULL AND user != '' AND eventType IN ('Staked', 'UnstakeRequested', 'Unstaked')").all();
    const staking = {};
    for (const ev of events) {
      const address = ev.user.toLowerCase();
      if (!staking[address]) {
        staking[address] = { totalStaking: 0, totalUnstaking: 0, totalUnstaked: 0 };
      }
      const amount = parseFloat(ev.amount) / 1e18;
      if (ev.eventType === 'Staked') staking[address].totalStaking += amount;
      else if (ev.eventType === 'UnstakeRequested') staking[address].totalUnstaking += amount;
      else if (ev.eventType === 'Unstaked') staking[address].totalUnstaked += amount;
    }

    // 4. Merge and compute liquid
    const result = allAddresses.map(addr => {
      let totalHolding = balances[addr]?.totalHolding || 0;
      const totalStaking = staking[addr]?.totalStaking || 0;
      const totalUnstaking = staking[addr]?.totalUnstaking || 0;
      const totalUnstaked = staking[addr]?.totalUnstaked || 0;
      // Currently staked = staked - unstake requested - unstaked
      const currentlyStaked = totalStaking - totalUnstaking - totalUnstaked;
      // Unstaking in progress = totalUnstaking - totalUnstaked
      const unstaking = totalUnstaking - totalUnstaked;
      // Correction : totalHolding doit être au moins égal à currentlyStaked
      if (currentlyStaked > totalHolding) totalHolding = currentlyStaked;
      // Liquid = totalHolding - currentlyStaked - unstaking
      const liquid = totalHolding - currentlyStaked - unstaking;
      return {
        address: addr,
        totalHolding,
        totalStaking: currentlyStaked > 0 ? currentlyStaked : 0,
        totalUnstaking: unstaking > 0 ? unstaking : 0,
        totalLiquid: liquid > 0 ? liquid : 0
      };
    }).filter(h => h.totalHolding > 0 || h.totalStaking > 0 || h.totalUnstaking > 0);

    res.json(result);
  } catch (err) {
    console.error('Holders API error:', err);
    res.status(500).json({ error: 'Error in holders (sqlite)' });
  }
});

// === INDEXER STATUS ===
app.get('/api/indexer-status', async (req, res) => {
  try {
    const db = new Database(SQLITE_PATH, { readonly: true });
    // Dernier block indexé
    const lastBlockRow = db.prepare('SELECT value FROM meta WHERE key = ?').get('lastBlock');
    const lastBlock = lastBlockRow ? Number(lastBlockRow.value) : null;
    // Date de la dernière action sur la dapp (dernier event ou transfert)
    const lastEvent = db.prepare('SELECT MAX(timestamp) as ts FROM events').get();
    const lastTransfer = db.prepare('SELECT MAX(timestamp) as ts FROM erc20_transfers').get();
    let lastTimestamp = 0;
    if (lastEvent && lastEvent.ts) lastTimestamp = lastEvent.ts;
    if (lastTransfer && lastTransfer.ts && lastTransfer.ts > lastTimestamp) lastTimestamp = lastTransfer.ts;
    const lastActionDate = lastTimestamp ? new Date(lastTimestamp * 1000).toISOString() : null;
    db.close();
    // Date de dernière modification physique du fichier DB
    let dbLastModified = null;
    try {
      const stats = fs.statSync('./events-api.sqlite');
      dbLastModified = stats.mtime.toISOString();
    } catch {}
    res.json({ lastBlock, lastActionDate, dbLastModified });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur indexer-status (sqlite)' });
  }
});

app.listen(PORT, () => {
  console.log(`ORNE backend listening on port ${PORT}`);
});
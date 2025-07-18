const { ethers } = require('ethers');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// --- CONFIG ---
const RPC_URL = process.env.RPC_URL || "https://arb-mainnet.g.alchemy.com/v2/-ofb30ntFCdQjf6j0VbjwHdTu7Yubcw5";
const CONTRACT_ADDRESS = "0x100156F27A3686a4da7fEE7148520A229320e7c8";
const DEPLOY_BLOCK = 356584497; // Le plus ancien des deux contrats (staking ou token)
const DB_PATH = path.join(__dirname, '../events.sqlite');
const ABI = [
  "event Staked(address indexed user, uint256 amount)",
  "event UnstakeRequested(address indexed user, uint256 amount, uint256 unlockTime)",
  "event Unstaked(address indexed user, uint256 amount)",
  "event RewardsClaimed(address indexed user, uint256 amount)",
  "event RewardsDeposited(uint256 amount)",
  "event CO2Updated(uint256 addedTonnes, uint256 newCO2PerOrne)"
];
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
const ORNE_TOKEN_ADDRESS = "0x89DbdB8e3b0e41aAe0871Bf9e1fcCe72F117bB1f";
const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];
const tokenContract = new ethers.Contract(ORNE_TOKEN_ADDRESS, ERC20_ABI, provider);

// --- DB INIT ---
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eventType TEXT,
  user TEXT,
  amount TEXT,
  unlockTime TEXT,
  blockNumber INTEGER,
  txHash TEXT,
  timestamp INTEGER,
  extra TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(eventType);
CREATE INDEX IF NOT EXISTS idx_events_block ON events(blockNumber);
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
CREATE TABLE IF NOT EXISTS erc20_transfers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  "from" TEXT,
  "to" TEXT,
  amount TEXT,
  blockNumber INTEGER,
  txHash TEXT,
  timestamp INTEGER
);
CREATE INDEX IF NOT EXISTS idx_erc20_from ON erc20_transfers("from");
CREATE INDEX IF NOT EXISTS idx_erc20_to ON erc20_transfers("to");
CREATE INDEX IF NOT EXISTS idx_erc20_block ON erc20_transfers(blockNumber);
`);

function getLastBlock() {
  const row = db.prepare('SELECT value FROM meta WHERE key = ?').get('lastBlock');
  return row ? parseInt(row.value, 10) : null;
}
function setLastBlock(blockNumber) {
  db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run('lastBlock', String(blockNumber));
}

// Helper pour retry avec délai exponentiel
async function withRetry(fn, maxRetries = 5, baseDelay = 2000) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (e) {
      attempt++;
      if (attempt > maxRetries) throw e;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(`[RETRY] Tentative ${attempt}/${maxRetries} après erreur : ${e.code || e.message || e}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// --- INDEXATION ---
async function indexAll() {
  const latestBlock = await withRetry(() => provider.getBlockNumber());
  let fromBlock = DEPLOY_BLOCK;
  // On récupère le dernier block indexé (staking ou token)
  const lastStaking = db.prepare('SELECT value FROM meta WHERE key = ?').get('lastBlock');
  const lastToken = db.prepare('SELECT value FROM meta WHERE key = ?').get('lastTokenBlock');
  if (lastStaking && lastToken) {
    fromBlock = Math.max(fromBlock, Math.min(parseInt(lastStaking.value, 10), parseInt(lastToken.value, 10)));
  } else if (lastStaking) {
    fromBlock = Math.max(fromBlock, parseInt(lastStaking.value, 10));
  } else if (lastToken) {
    fromBlock = Math.max(fromBlock, parseInt(lastToken.value, 10));
  }
  if (fromBlock >= latestBlock) {
    console.log('Already up to date. Last indexed block:', fromBlock);
    return;
  }
  const step = 500;
  console.log(`Indexing all events from ${fromBlock + 1} to ${latestBlock}...`);
  for (let start = fromBlock + 1; start <= latestBlock; start += step) {
    const end = Math.min(start + step - 1, latestBlock);
    console.log(`  Blocks ${start} to ${end}`);
    // Staking events
    const staked = await withRetry(() => contract.queryFilter(contract.filters.Staked(), start, end));
    for (const ev of staked) {
      const block = await withRetry(() => provider.getBlock(ev.blockNumber));
      db.prepare(`INSERT INTO events (eventType, user, amount, blockNumber, txHash, timestamp) VALUES (?, ?, ?, ?, ?, ?)`)
        .run('Staked', ev.args.user.toLowerCase(), ev.args.amount.toString(), ev.blockNumber, ev.transactionHash, block.timestamp);
    }
    const unstakeReq = await withRetry(() => contract.queryFilter(contract.filters.UnstakeRequested(), start, end));
    for (const ev of unstakeReq) {
      const block = await withRetry(() => provider.getBlock(ev.blockNumber));
      db.prepare(`INSERT INTO events (eventType, user, amount, unlockTime, blockNumber, txHash, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run('UnstakeRequested', ev.args.user.toLowerCase(), ev.args.amount.toString(), ev.args.unlockTime.toString(), ev.blockNumber, ev.transactionHash, block.timestamp);
    }
    const unstaked = await withRetry(() => contract.queryFilter(contract.filters.Unstaked(), start, end));
    for (const ev of unstaked) {
      const block = await withRetry(() => provider.getBlock(ev.blockNumber));
      db.prepare(`INSERT INTO events (eventType, user, amount, blockNumber, txHash, timestamp) VALUES (?, ?, ?, ?, ?, ?)`)
        .run('Unstaked', ev.args.user.toLowerCase(), ev.args.amount.toString(), ev.blockNumber, ev.transactionHash, block.timestamp);
    }
    const rewardsClaimed = await withRetry(() => contract.queryFilter(contract.filters.RewardsClaimed(), start, end));
    for (const ev of rewardsClaimed) {
      const block = await withRetry(() => provider.getBlock(ev.blockNumber));
      db.prepare(`INSERT INTO events (eventType, user, amount, blockNumber, txHash, timestamp) VALUES (?, ?, ?, ?, ?, ?)`)
        .run('RewardsClaimed', ev.args.user.toLowerCase(), ev.args.amount.toString(), ev.blockNumber, ev.transactionHash, block.timestamp);
    }
    const rewardsDeposited = await withRetry(() => contract.queryFilter(contract.filters.RewardsDeposited(), start, end));
    for (const ev of rewardsDeposited) {
      const block = await withRetry(() => provider.getBlock(ev.blockNumber));
      db.prepare(`INSERT INTO events (eventType, amount, blockNumber, txHash, timestamp) VALUES (?, ?, ?, ?, ?)`)
        .run('RewardsDeposited', ev.args.amount.toString(), ev.blockNumber, ev.transactionHash, block.timestamp);
    }
    const co2Updated = await withRetry(() => contract.queryFilter(contract.filters.CO2Updated(), start, end));
    for (const ev of co2Updated) {
      const block = await withRetry(() => provider.getBlock(ev.blockNumber));
      db.prepare(`INSERT INTO events (eventType, amount, blockNumber, txHash, timestamp, extra) VALUES (?, ?, ?, ?, ?, ?)`)
        .run('CO2Updated', ev.args.addedTonnes.toString(), ev.blockNumber, ev.transactionHash, block.timestamp, JSON.stringify({ newCO2PerOrne: ev.args.newCO2PerOrne.toString() }));
    }
    // ERC20 transfers
    const transfers = await withRetry(() => tokenContract.queryFilter(tokenContract.filters.Transfer(), start, end));
    for (const ev of transfers) {
      const block = await withRetry(() => provider.getBlock(ev.blockNumber));
      db.prepare(`INSERT INTO erc20_transfers ("from", "to", amount, blockNumber, txHash, timestamp) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(ev.args.from.toLowerCase(), ev.args.to.toLowerCase(), ev.args.value.toString(), ev.blockNumber, ev.transactionHash, block.timestamp);
    }
    // Update meta for both
    db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run('lastBlock', String(end));
    db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run('lastTokenBlock', String(end));
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('Indexing finished. Last block:', latestBlock);
}

async function main() {
  await indexAll();
}

main().then(() => {
  db.close();
  process.exit(0);
}).catch(e => {
  console.error(e);
  db.close();
  process.exit(1);
}); 
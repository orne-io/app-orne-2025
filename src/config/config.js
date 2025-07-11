// Configuration des contrats
export const CONFIG = {
  ORNE_TOKEN_ADDRESS: "0xaf3acac72af103Dc0adeD53F1CC08638f856Bf8F",
  STAKING_VAULT_ADDRESS: "0x62A8347f59491F38d13EEe04c2C481bBAa0Ae326", // V5 Contract
  NETWORK_ID: 421614,
  NETWORK_NAME: "Arbitrum Sepolia"
};

// Signatures des fonctions pour le contrat V5
export const FUNCTION_SIGNATURES = {
  // Token functions
  'balanceOf(address)': '0x70a08231',
  'allowance(address,address)': '0xdd62ed3e',
  'approve(address,uint256)': '0x095ea7b3',
  
  // Staking functions V5
  'stake(uint256)': '0xa694fc3a',
  'requestUnstake(uint256)': '0x23095721',
  'unstake()': '0x2def6620',
  'cancelUnstake()': '0x4ab17969',
  'claimRewards()': '0x372500ab',
  
  // View functions
  'stakes(address)': '0x16934fc4',
  'pendingRewards(address)': '0x31d7a262',
  'getUnstakeInfo(address)': '0xf9bc81ee',
  'canUnstake(address)': '0x85f4498b',
  'timeUntilUnstake(address)': '0xf19d9b8c',
  'co2OffsetOf(address)': '0x939d4936',
  'co2PerOrne()': '0xa419aeeb',
  'totalStaked()': '0x817b1cd2',
  'pendingUnstakes(address)': '0x7db3aba7',
  
  // Nouvelles fonctions V5
  'getTotalPendingUnstakes()': '0x8b83209b',
  'getUniqueStakersCount()': '0x4f735a36',
  'getUniqueHoldersCount()': '0x91b7f5ed',
  'getTotalCO2Offset()': '0x5d1ca631',
  'getGlobalStats()': '0x33ce93fe',
  'updateTokenHolderStatus(address)': '0x2c1e816d',
  
  // Admin functions
  'depositRewards(uint256)': '0x8bdf67f2',
  'updateCO2(uint256)': '0x5c7c86ee',
  'owner()': '0x8da5cb5b'
};


// Configuration des contrats
export const CONFIG = {
  ORNE_TOKEN_ADDRESS: "0x89DbdB8e3b0e41aAe0871Bf9e1fcCe72F117bB1f",
  STAKING_VAULT_ADDRESS: "0x100156F27A3686a4da7fEE7148520A229320e7c8", // Mainnet
  NETWORK_ID: 42161,
  NETWORK_NAME: "Arbitrum One"
};

// Signatures des fonctions pour le contrat V5
export const FUNCTION_SIGNATURES = {
  'accRewardsPerShare()': '0x7cbaccd5',
  'canUnstake(address)': '0x85f4498b',
  'cancelUnstake()': '0x4ab17969',
  'claimRewards()': '0x372500ab',
  'co2OffsetOf(address)': '0x939d4936',
  'co2PerOrne()': '0xa419aeeb',
  'depositRewards(uint256)': '0x8bdf67f2',
  'emergencyWithdraw(address,uint256)': '0x95ccea67',
  'getGlobalStats()': '0x6b4169c3',
  'getTotalCO2Offset()': '0x6a05b4b9',
  'getTotalPendingUnstakes()': '0x126d5df6',
  'getUniqueHoldersCount()': '0x9f20d316',
  'getUniqueStakersCount()': '0xcc526631',
  'getUnstakeInfo(address)': '0xf9bc81ee',
  'getUserInfo(address)': '0x6386c1c7',
  'hasStaked(address)': '0xc93c8f34',
  'hasTokens(address)': '0x3cefc1e0',
  'orneToken()': '0x24e00349',
  'owner()': '0x8da5cb5b',
  'pendingRewards(address)': '0x31d7a262',
  'pendingUnstakes(address)': '0xd6b6b23f',
  'renounceOwnership()': '0x715018a6',
  'requestUnstake(uint256)': '0x23095721',
  'setUnstakingDelay(uint256)': '0x54c8dbcc',
  'stake(uint256)': '0xa694fc3a',
  'stakes(address)': '0x16934fc4',
  'timeUntilUnstake(address)': '0xf19d9b8c',
  'totalCO2Added()': '0xb92d52e3',
  'totalPendingUnstakes()': '0x68bbf757',
  'totalRewardsDeposited()': '0x1f4c74fd',
  'totalStaked()': '0x817b1cd2',
  'transferOwnership(address)': '0xf2fde38b',
  'uniqueHolders()': '0xcaa9334f',
  'uniqueStakers()': '0x7c356df8',
  'unstake()': '0x2def6620',
  'unstakeRequests(address)': '0xe0eb4d2e',
  'unstakingDelay()': '0x07089246',
  'updateCO2(uint256)': '0x5c7c86ee',
  'updateTokenHolderStatus(address)': '0x1e489f41',
  'balanceOf(address)': '0x70a08231',
};


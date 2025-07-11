import { ethers } from 'ethers';

// Uniswap V3 Pool ABI (minimal)
export const UNISWAP_V3_POOL_ABI = [
  'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  'function liquidity() external view returns (uint128)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function balanceOf(address) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
];

// Placeholder: ORNE/WETH pool address on mainnet (to be replaced with real one)
export const ORNE_WETH_V3_POOL = '0x0000000000000000000000000000000000000000';

// Helper to get price and pooled tokens from a Uniswap V3 pool
export async function getUniswapV3PoolData(poolAddress, token0Decimals, token1Decimals, provider) {
  const pool = new ethers.Contract(poolAddress, UNISWAP_V3_POOL_ABI, provider);
  // Get slot0 for price
  const [slot0, liquidity] = await Promise.all([
    pool.slot0(),
    pool.liquidity(),
  ]);
  // sqrtPriceX96 is a Q64.96 value
  const sqrtPriceX96 = slot0[0];
  // Price calculation: (sqrtPriceX96 ** 2) / 2**192
  // This gives price of token1 in terms of token0
  const price = (sqrtPriceX96 ** 2) / (2n ** 192n);
  // Adjust for decimals
  const adjustedPrice = Number(price) * 10 ** (token0Decimals - token1Decimals);
  // Get pooled token balances
  // For V3, you need to get token0/token1 addresses and their balances in the pool
  const [token0, token1] = await Promise.all([
    pool.token0(),
    pool.token1(),
  ]);
  const token0Contract = new ethers.Contract(token0, ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'], provider);
  const token1Contract = new ethers.Contract(token1, ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'], provider);
  const [pooledToken0, pooledToken1] = await Promise.all([
    token0Contract.balanceOf(poolAddress),
    token1Contract.balanceOf(poolAddress),
  ]);
  return {
    price: adjustedPrice,
    pooledToken0: Number(ethers.formatUnits(pooledToken0, token0Decimals)),
    pooledToken1: Number(ethers.formatUnits(pooledToken1, token1Decimals)),
    token0,
    token1,
  };
} 
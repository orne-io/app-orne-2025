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

// MAINNET: ORNE/WETH Uniswap V3 pool address
export const ORNE_WETH_V3_POOL = '0x198d0136c5e7766572F6918eda7ac2B576B43d2f'; // Mainnet pool

// Helper to get price and pooled tokens from a Uniswap V3 pool
export async function getUniswapV3PoolData(poolAddress, token0Decimals, token1Decimals, provider) {
  const pool = new ethers.Contract(poolAddress, UNISWAP_V3_POOL_ABI, provider);
  // Get slot0 for price
  const [slot0, liquidity] = await Promise.all([
    pool.slot0(),
    pool.liquidity(),
  ]);
  // sqrtPriceX96 is a Q64.96 value
  const sqrtPriceX96 = ethers.toBigInt(slot0[0]);
  const Q96 = 2n ** 96n;
  // (sqrtPriceX96 / Q96) ** 2
  const priceInWETH_BI = (sqrtPriceX96 * sqrtPriceX96 * 10n ** 18n) / (Q96 * Q96);
  const priceInWETH = Number(priceInWETH_BI) / 1e18;

  // Correction : on veut le prix de 1 ORNE en WETH
  // Si ORNE est token0, il faut inverser le prix
  let adjustedPrice;
  if (token0Decimals === 18 && token1Decimals === 18) {
    // On suppose ORNE est token0, WETH est token1
    adjustedPrice = 1 / priceInWETH;
  } else {
    // Sinon, on garde le prix tel quel
    adjustedPrice = priceInWETH;
  }
  // Get pooled token balances
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
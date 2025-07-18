/* eslint-disable no-undef */
import { Interface } from 'ethers';

// Uniswap V3 Pool ABI (minimal for price calculations)
const UNISWAP_V3_POOL_ABI = [
  'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function liquidity() external view returns (uint128)',
];

// Uniswap V3 Factory ABI (to find pool address)
const UNISWAP_V3_FACTORY_ABI = [
  'function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)',
];

const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const WETH_ADDRESS = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const ORNE_TOKEN_ADDRESS = "0x89DbdB8e3b0e41aAe0871Bf9e1fcCe72F117bB1f";
const POOL_FEE = 3000; // 0.3%

const poolInterface = new Interface(UNISWAP_V3_POOL_ABI);
const factoryInterface = new Interface(UNISWAP_V3_FACTORY_ABI);

// Helper function to calculate amount out from sqrt price
const calculateAmountOut = (amountIn, sqrtPriceX96, isToken0ToToken1, decimalsIn = 18, decimalsOut = 18) => {
  const Q96 = BigInt(2) ** BigInt(96);
  const sqrtPrice = BigInt(sqrtPriceX96);

  if (isToken0ToToken1) {
    // token0 -> token1: amountOut = amountIn * price
    // For Uniswap V3: price = (sqrtPriceX96 / 2^96)^2
    // But we need to handle the scaling properly
    const priceNumerator = sqrtPrice * sqrtPrice;
    const priceDenominator = Q96 * Q96;
    const amountOut = (BigInt(amountIn) * priceNumerator) / priceDenominator;

    return amountOut;
  } else {
    // token1 -> token0: amountOut = amountIn / price
    // For Uniswap V3: price = (sqrtPriceX96 / 2^96)^2
    const priceNumerator = sqrtPrice * sqrtPrice;
    const priceDenominator = Q96 * Q96;
    const amountOut = (BigInt(amountIn) * priceDenominator) / priceNumerator;

    return amountOut;
  }
};

// Get pool address from factory
export const getPoolAddress = async (tokenA, tokenB, fee = POOL_FEE) => {
  try {
    if (!window.ethereum) throw new Error('MetaMask not available');

    const data = factoryInterface.encodeFunctionData('getPool', [tokenA, tokenB, fee]);
    const result = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: UNISWAP_V3_FACTORY,
        data: data
      }, 'latest']
    });

    const poolAddress = factoryInterface.decodeFunctionResult('getPool', result)[0];
    return poolAddress;
  } catch (error) {
    console.error('Error getting pool address:', error);
    return null;
  }
};

// Get pool data (sqrt price, liquidity, etc.)
export const getPoolData = async (poolAddress) => {
  try {
    if (!window.ethereum) throw new Error('MetaMask not available');

    // Get slot0 data (contains sqrt price)
    const slot0Data = poolInterface.encodeFunctionData('slot0');
    const slot0Result = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: poolAddress,
        data: slot0Data
      }, 'latest']
    });

    const slot0 = poolInterface.decodeFunctionResult('slot0', slot0Result);
    const sqrtPriceX96 = slot0[0];

    // Get liquidity
    const liquidityData = poolInterface.encodeFunctionData('liquidity');
    const liquidityResult = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: poolAddress,
        data: liquidityData
      }, 'latest']
    });

    const liquidity = poolInterface.decodeFunctionResult('liquidity', liquidityResult)[0];

    // Get token addresses
    const token0Data = poolInterface.encodeFunctionData('token0');
    const token0Result = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: poolAddress,
        data: token0Data
      }, 'latest']
    });

    const token0 = poolInterface.decodeFunctionResult('token0', token0Result)[0];

    const token1Data = poolInterface.encodeFunctionData('token1');
    const token1Result = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: poolAddress,
        data: token1Data
      }, 'latest']
    });

    const token1 = poolInterface.decodeFunctionResult('token1', token1Result)[0];

    return {
      sqrtPriceX96: sqrtPriceX96.toString(),
      liquidity: liquidity.toString(),
      token0,
      token1,
      tick: slot0[1]
    };
  } catch (error) {
    console.error('Error getting pool data:', error);
    return null;
  }
};

// Calculate amount out using Uniswap V3 formula with liquidity
const calculateAmountOutWithLiquidity = (amountIn, sqrtPriceX96, liquidity, isToken0ToToken1) => {
  const Q96 = BigInt(2) ** BigInt(96);
  const sqrtPrice = BigInt(sqrtPriceX96);
  const L = BigInt(liquidity);

  if (isToken0ToToken1) {
    // token0 -> token1: WETH -> ORNE
    // Calculate price
    const priceNumerator = sqrtPrice * sqrtPrice;
    const priceDenominator = Q96 * Q96;
    const price = (priceNumerator * (BigInt(10) ** BigInt(18))) / priceDenominator;

    // Calculate theoretical amount out
    const theoreticalAmountOut = (BigInt(amountIn) * price) / (BigInt(10) ** BigInt(18));

    // Apply fee
    const feeAmount = theoreticalAmountOut * BigInt(3) / BigInt(1000); // 0.3% fee
    let finalAmountOut = theoreticalAmountOut - feeAmount;

    // Check if we're trying to swap more than available liquidity
    // For WETH -> ORNE, we need to check ORNE liquidity
    // The liquidity is in terms of the pool's base units, so we need to convert
    const maxOrneAvailable = L * BigInt(2); // Approximate max ORNE available

    if (finalAmountOut > maxOrneAvailable) {
      finalAmountOut = maxOrneAvailable;
    }

    return finalAmountOut;
  } else {
    // token1 -> token0: ORNE -> WETH
    // Calculate price
    const priceNumerator = sqrtPrice * sqrtPrice;
    const priceDenominator = Q96 * Q96;
    const price = (priceNumerator * (BigInt(10) ** BigInt(18))) / priceDenominator;

    // Calculate theoretical amount out
    const theoreticalAmountOut = (BigInt(amountIn) * (BigInt(10) ** BigInt(18))) / price;

    // Apply fee
    const feeAmount = theoreticalAmountOut * BigInt(3) / BigInt(1000); // 0.3% fee
    let finalAmountOut = theoreticalAmountOut - feeAmount;

    // Check if we're trying to swap more than available liquidity
    // For ORNE -> WETH, we need to check WETH liquidity
    const maxWethAvailable = L * BigInt(2) / (BigInt(10) ** BigInt(18)); // Approximate max WETH available

    if (finalAmountOut > maxWethAvailable) {
      finalAmountOut = maxWethAvailable;
    }

    return finalAmountOut;
  }
};

// Get accurate swap quote using real pool data
export const getAccurateSwapQuote = async (tokenIn, tokenOut, amountIn, fee = POOL_FEE, slippagePercent = 0.5) => {
  try {
    // Get pool address
    const poolAddress = await getPoolAddress(tokenIn, tokenOut, fee);
    if (!poolAddress || poolAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Pool not found');
    }

    // Get pool data
    const poolData = await getPoolData(poolAddress);
    if (!poolData) {
      throw new Error('Failed to get pool data');
    }

    // Determine token order
    const isToken0ToToken1 = tokenIn.toLowerCase() === poolData.token0.toLowerCase();

    // Calculate amount out
    const amountOut = calculateAmountOut(
      amountIn,
      poolData.sqrtPriceX96,
      isToken0ToToken1
    );

    // Apply slippage
    const slippageMultiplier = BigInt(Math.floor((100 - slippagePercent) * 1000));
    const amountOutMinimum = amountOut * slippageMultiplier / BigInt(100000);

    return {
      amountOut: amountOut.toString(),
      amountOutMinimum: amountOutMinimum.toString(),
      priceImpact: 0.1, // Could be calculated more accurately
      gasEstimate: 200000
    };
  } catch (error) {
    console.error('Error getting accurate quote:', error);
    // Fallback to simple calculation
    return getSimpleSwapQuote(tokenIn, tokenOut, amountIn, slippagePercent);
  }
};

// Get current price from pool data
const getCurrentPriceFromPool = async (tokenIn, tokenOut, fee = POOL_FEE) => {
  try {
    const poolAddress = await getPoolAddress(tokenIn, tokenOut, fee);
    if (!poolAddress || poolAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Pool not found');
    }

    const poolData = await getPoolData(poolAddress);
    if (!poolData) {
      throw new Error('Failed to get pool data');
    }

    // Calculate current price from sqrt price using correct Uniswap V3 formula
    const Q96 = BigInt(2) ** BigInt(96);
    const sqrtPrice = BigInt(poolData.sqrtPriceX96);

    // Calculate price: price = (sqrtPriceX96 / 2^96)^2
    // This gives us the price of token1 in terms of token0
    // But we need to handle the scaling properly for 18 decimals
    const priceNumerator = sqrtPrice * sqrtPrice;
    const priceDenominator = Q96 * Q96;

    // The price is in terms of token1/token0, but we need to scale it properly
    // For 18 decimal tokens, we need to multiply by 10^18 to get the proper price
    const price = (priceNumerator * (BigInt(10) ** BigInt(18))) / priceDenominator;

    const isToken0ToToken1 = tokenIn.toLowerCase() === poolData.token0.toLowerCase();

    return { price: price.toString(), isToken0ToToken1 };
  } catch (error) {
    console.error('Error getting current price from pool:', error);
    return null;
  }
};

// Simple fallback quote calculation with dynamic price
export const getSimpleSwapQuote = async (tokenIn, tokenOut, amountIn, slippagePercent = 0.5) => {
  // Vérifier l'ordre des tokens (ordre lexicographique)
  const tokenInLower = tokenIn.toLowerCase();
  const tokenOutLower = tokenOut.toLowerCase();
  const wethLower = WETH_ADDRESS.toLowerCase();
  const orneLower = ORNE_TOKEN_ADDRESS.toLowerCase();

  // Try to get dynamic price from pool first
  try {
    const poolAddress = await getPoolAddress(tokenIn, tokenOut);
    if (!poolAddress || poolAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Pool not found');
    }

    const poolData = await getPoolData(poolAddress);
    if (!poolData) {
      throw new Error('Failed to get pool data');
    }

    // Determine token order
    const isToken0ToToken1 = tokenInLower === poolData.token0.toLowerCase();

    // Calculate amount out using liquidity
    const amountOut = calculateAmountOutWithLiquidity(
      amountIn,
      poolData.sqrtPriceX96,
      poolData.liquidity,
      isToken0ToToken1
    );

    // Calculate slippage
    const slippageMultiplier = BigInt(Math.floor((100 - slippagePercent) * 1000));
    const amountOutMinimum = amountOut * slippageMultiplier / BigInt(100000);

    // Calculate price impact (simplified)
    const amountInEther = Number(amountIn) / 1e18;
    const amountOutEther = Number(amountOut) / 1e18;
    const priceImpact = amountInEther > 0 ? Math.abs((amountOutEther / amountInEther - 1) * 100) : 0;

    return {
      amountOut: amountOut.toString(),
      amountOutMinimum: amountOutMinimum.toString(),
      priceImpact: priceImpact,
      gasEstimate: 200000
    };
  } catch (error) {
    console.error('Failed to get dynamic price, falling back to fixed price:', error);
  }

  // Fallback to fixed price if dynamic price fails
  const isWETHToORNE = tokenInLower === wethLower && tokenOutLower === orneLower;
  const isORNEToWETH = tokenInLower === orneLower && tokenOutLower === wethLower;

  let amountOut;
  if (isWETHToORNE) {
    // 1 WETH = 295,900 ORNE (fixed price for now)
    // Convert to wei: 295,900 * 10^18
    amountOut = BigInt(amountIn) * BigInt(295900) * (BigInt(10) ** BigInt(18)) / (BigInt(10) ** BigInt(18));
  } else if (isORNEToWETH) {
    // 295,900 ORNE = 1 WETH (fixed price for now)
    // Convert to wei: amountIn / 295,900 * 10^18
    amountOut = BigInt(amountIn) * (BigInt(10) ** BigInt(18)) / (BigInt(295900) * (BigInt(10) ** BigInt(18)));
  } else {
    // Fallback pour d'autres cas
    console.warn('Unknown token pair, using 1:1 fallback');
    amountOut = BigInt(amountIn);
  }

  // Apply 0.3% fee
  const feeAmount = amountOut * BigInt(3) / BigInt(1000);
  amountOut = amountOut - feeAmount;

  // Calculate slippage: for 0.5% slippage, we want 99.5% of the amount
  const slippageMultiplier = BigInt(Math.floor((100 - slippagePercent) * 1000));
  const amountOutMinimum = amountOut * slippageMultiplier / BigInt(100000);

  return {
    amountOut: amountOut.toString(),
    amountOutMinimum: amountOutMinimum.toString(),
    priceImpact: 0.1,
    gasEstimate: 200000
  };
}; 
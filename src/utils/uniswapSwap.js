/* eslint-disable no-undef */
import { parseEther, formatEther, Interface } from 'ethers';
import { useWagmiClients, sendTransactionWithWagmi, waitForTransactionWithWagmi, getCurrentAllowanceWithWagmi } from './wagmiUtils';
import { WETH_ADDRESS, ORNE_TOKEN_ADDRESS, UNISWAP_V3_ROUTER, UNISWAP_V3_QUOTER_V2 } from './constants';
import { useNotificationContext } from '../contexts/NotificationContext';

// ERC20 ABI for approve and allowance
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)"
];

const erc20Interface = new Interface(ERC20_ABI);

// Uniswap V3 Router ABI (simplified for exactInputSingle)
const UNISWAP_V3_ROUTER_ABI = [
  "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)"
];

const uniswapRouterInterface = new Interface(UNISWAP_V3_ROUTER_ABI);

// Known pool liquidity for fallback calculations (DEPRECATED - will be removed)
// const KNOWN_POOL_LIQUIDITY = {
//   orneLiquidity: 298236000, // ~298M ORNE
//   wethLiquidity: 1000, // ~1000 WETH (this was wrong!)
//   rate: 298236 // 1 WETH = 298,236 ORNE
// };

// Updated with realistic pool data (DEPRECATED - will be removed)
// const REALISTIC_POOL_DATA = {
//   orneLiquidity: 298236000, // ~298M ORNE
//   wethLiquidity: 0.0618, // Actual WETH in pool
//   rate: 298236, // 1 WETH = 298,236 ORNE
//   maxSwapAmount: 1000000 // Maximum ORNE that can be swapped without major price impact
// };

// Get swap quote using real-time pool data
export const getSwapQuote = async (tokenIn, tokenOut, amountIn, fee = 3000, slippage = 0.5, poolData = null) => {
  try {


    // If no pool data, use fallback calculation
    if (!poolData || !poolData.orneLiquidity || !poolData.wethLiquidity || !poolData.price) {

      
      // Fallback to basic calculation - but we still need some reasonable values
      const amountInNumber = parseFloat(formatEther(amountIn));
      let amountOutNumber;
      
      if (tokenIn === WETH_ADDRESS && tokenOut === ORNE_TOKEN_ADDRESS) {
        // WETH to ORNE - use a very conservative rate to avoid overestimation
        amountOutNumber = amountInNumber * 100000; // Conservative fallback rate
      } else if (tokenIn === ORNE_TOKEN_ADDRESS && tokenOut === WETH_ADDRESS) {
        // ORNE to WETH - use a very conservative rate to avoid overestimation
        amountOutNumber = amountInNumber / 100000; // Conservative fallback rate
        
        if (amountOutNumber < 0.000001) {
          throw new Error('Amount too small for meaningful swap. Please try a larger amount or wait for pool data to load.');
        }
      } else {
        throw new Error('Unsupported token pair');
      }

      // Apply slippage tolerance
      const slippageMultiplier = 1 - (slippage / 100);
      const amountOutMinimum = amountOutNumber * slippageMultiplier;

      // Convert to wei
      const amountOut = parseEther(amountOutNumber.toFixed(18));
      const amountOutMinimumBigInt = parseEther(amountOutMinimum.toFixed(18));

      return {
        amountOut: amountOut.toString(),
        amountOutMinimum: amountOutMinimumBigInt.toString(),
        priceImpact: 0.01
      };
    }

    const amountInNumber = parseFloat(formatEther(amountIn));
    let amountOutNumber;
    

    
    if (tokenIn === WETH_ADDRESS && tokenOut === ORNE_TOKEN_ADDRESS) {
      // WETH to ORNE
      const currentPrice = parseFloat(poolData.price);
      amountOutNumber = amountInNumber / currentPrice;
      
      // Calculate price impact with safety checks
      const wethLiquidity = parseFloat(poolData.wethLiquidity);
      let priceImpact = 0;
      
      if (wethLiquidity > 0) {
        priceImpact = (amountInNumber / wethLiquidity) * 100;
      } else {
        // If liquidity is zero or very low, use a fallback calculation
        console.warn('Very low WETH liquidity detected, using fallback calculation');
        priceImpact = 0.1; // Assume 0.1% price impact for small amounts
      }
      
      if (priceImpact > 10) { // Increased from 5% to 10%
        throw new Error(`Price impact too high (${priceImpact.toFixed(2)}%). Please reduce the amount to avoid excessive slippage.`);
      }
      

      
    } else if (tokenIn === ORNE_TOKEN_ADDRESS && tokenOut === WETH_ADDRESS) {
      // ORNE to WETH
      const currentPrice = parseFloat(poolData.price);
      amountOutNumber = amountInNumber * currentPrice;
      

      
      // Calculate price impact with safety checks
      const orneLiquidity = parseFloat(poolData.orneLiquidity);
      let priceImpact = 0;
      
      if (orneLiquidity > 0) {
        priceImpact = (amountInNumber / orneLiquidity) * 100;
      } else {
        // If liquidity is zero or very low, use a fallback calculation
        console.warn('Very low ORNE liquidity detected, using fallback calculation');
        priceImpact = 0.1; // Assume 0.1% price impact for small amounts
      }
      
      if (priceImpact > 10) { // Increased from 5% to 10%
        throw new Error(`Price impact too high (${priceImpact.toFixed(2)}%). Please reduce the amount to avoid excessive slippage.`);
      }
      

      
      // Check if the amount is too small to be meaningful
      if (amountOutNumber < 0.0000001) { // Reduced threshold from 0.000001 to 0.0000001

        throw new Error('Amount too small for meaningful swap. Please try a larger amount.');
      }
    } else {
      throw new Error('Unsupported token pair');
    }

    // Apply slippage tolerance
    const slippageMultiplier = 1 - (slippage / 100);
    const amountOutMinimum = amountOutNumber * slippageMultiplier;

    // Ensure minimum amounts are reasonable - reduced threshold
    if (amountOutNumber < 0.0000001) { // Reduced threshold from 0.000001 to 0.0000001

      throw new Error('Swap amount too small. Please try a larger amount.');
    }

    // Convert to wei with proper handling of small numbers
    let amountOut, amountOutMinimumBigInt;
    
    try {
      // Convert to a string with limited decimal places to avoid precision issues
      const amountOutString = amountOutNumber.toFixed(18);
      amountOut = parseEther(amountOutString);
      
      const amountOutMinimumString = amountOutMinimum.toFixed(18);
      amountOutMinimumBigInt = parseEther(amountOutMinimumString);
    } catch (parseError) {
      console.error('Error parsing amounts:', parseError);
      throw new Error('Unable to calculate swap amounts. Please try a larger amount.');
    }

    // Calculate price impact percentage
    let priceImpact;
    if (tokenIn === ORNE_TOKEN_ADDRESS) {
      const orneLiquidity = parseFloat(poolData.orneLiquidity);
      priceImpact = orneLiquidity > 0 ? (amountInNumber / orneLiquidity) * 100 : 0.1;
    } else {
      const wethLiquidity = parseFloat(poolData.wethLiquidity);
      priceImpact = wethLiquidity > 0 ? (amountInNumber / wethLiquidity) * 100 : 0.1;
    }

    console.log('Quote calculated:', {
      amountIn: formatEther(amountIn),
      amountOut: formatEther(amountOut),
      amountOutMinimum: formatEther(amountOutMinimumBigInt),
      priceImpact: `${priceImpact.toFixed(2)}%`,
      amountOutNumber: amountOutNumber
    });

    return {
      amountOut: amountOut.toString(),
      amountOutMinimum: amountOutMinimumBigInt.toString(),
      priceImpact: priceImpact
    };
  } catch (error) {
    console.error('Error getting swap quote:', error);
    throw error;
  }
};

// Hook for swap operations
export const useSwapOperations = () => {
  const { publicClient, walletClient } = useWagmiClients();
  const { showSuccess, showError, showWarning, showInfo } = useNotificationContext();

  // Check and approve token if needed
  const checkAndApproveToken = async (tokenAddress, spenderAddress, amount, walletAddress) => {
    try {


      // Get current allowance using wagmi
      const currentAllowance = await getCurrentAllowanceWithWagmi(
        publicClient,
        walletAddress,
        tokenAddress,
        spenderAddress
      );

      const requiredAmount = parseFloat(formatEther(amount));
      
      if (currentAllowance >= requiredAmount) {
        return true;
      }
      showWarning('Approval required. Please approve tokens in your wallet.');
      
      // Encode approve function
      const approveData = erc20Interface.encodeFunctionData('approve', [
        spenderAddress,
        amount
      ]);



      // Send approval transaction using wagmi
      const txHash = await sendTransactionWithWagmi(
        walletClient,
        publicClient,
        tokenAddress,
        approveData,
        walletAddress
      );


      showInfo(`Approval transaction sent (${txHash.slice(0, 10)}...)`);

      // Wait for approval confirmation with longer timeout
      await waitForTransactionWithWagmi(publicClient, txHash, 'Approval');
      

      showSuccess('Token approval confirmed!');
      return true;
    } catch (error) {
      console.error('Error in checkAndApproveToken:', error);
      throw error;
    }
  };

  // Execute swap transaction
  const executeSwap = async (swapParams, walletAddress) => {
    try {


      const { tokenIn, tokenOut, amountIn, amountOutMinimum } = swapParams;

      // Validate parameters
      if (!tokenIn || !tokenOut || !amountIn || !amountOutMinimum) {
        throw new Error('Missing required swap parameters');
      }

      // Check and approve token if needed
      await checkAndApproveToken(tokenIn, UNISWAP_V3_ROUTER, amountIn, walletAddress);

      // Prepare swap parameters - ensure all values are properly formatted
      const swapParamsStruct = {
        tokenIn: tokenIn.toLowerCase(),
        tokenOut: tokenOut.toLowerCase(),
        fee: 3000, // 0.3% fee tier
        recipient: walletAddress.toLowerCase(),
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1200), // 20 minutes from now
        amountIn: BigInt(amountIn),
        amountOutMinimum: BigInt(amountOutMinimum),
        sqrtPriceLimitX96: BigInt(0)
      };



      // Validate that amounts are reasonable
      const amountInNumber = parseFloat(formatEther(amountIn));
      const amountOutNumber = parseFloat(formatEther(amountOutMinimum));
      
      if (amountInNumber <= 0 || amountOutNumber <= 0) {
        throw new Error('Invalid swap amounts');
      }

      // Encode the swap function with proper struct format
      const swapData = uniswapRouterInterface.encodeFunctionData('exactInputSingle', [swapParamsStruct]);

      // Determine if we need to send ETH with the transaction
      const value = tokenIn.toLowerCase() === WETH_ADDRESS.toLowerCase() ? amountIn : '0x0';

      // Send swap transaction using wagmi with better error handling
      try {
        const txHash = await sendTransactionWithWagmi(
          walletClient,
          publicClient,
          UNISWAP_V3_ROUTER,
          swapData,
          walletAddress,
          value
        );

        return txHash;
      } catch (txError) {
        console.error('Transaction failed:', txError);
        
        // Check for specific error types
        if (txError.message.includes('User rejected') || txError.message.includes('User denied')) {
          throw new Error('Transaction was cancelled by user');
        } else if (txError.message.includes('insufficient funds') || txError.message.includes('balance')) {
          throw new Error('Insufficient funds for transaction');
        } else if (txError.message.includes('gas') || txError.message.includes('fee')) {
          throw new Error('Insufficient gas for transaction. Please increase gas limit.');
        } else if (txError.message.includes('slippage') || txError.message.includes('amount')) {
          throw new Error('Swap failed due to price movement. Please try again.');
        } else if (txError.message.includes('internal error') || txError.message.includes('execution reverted')) {
          throw new Error('Transaction failed. This might be due to insufficient liquidity or invalid parameters.');
        } else {
          throw new Error(`Transaction failed: ${txError.message}`);
        }
      }
    } catch (error) {
      console.error('Error executing swap:', error);
      throw error;
    }
  };

  // Wait for swap transaction confirmation
  const waitForSwapTransaction = async (txHash) => {
    try {

      
      const receipt = await waitForTransactionWithWagmi(publicClient, txHash, 'Swap');
      
              return receipt;
    } catch (error) {
      console.error('Error waiting for swap transaction:', error);
      throw error;
    }
  };

  return {
    checkAndApproveToken,
    executeSwap,
    waitForSwapTransaction
  };
};

// Legacy functions for backward compatibility (will be removed)
export const checkAndApproveToken = async (tokenAddress, spenderAddress, amount, walletAddress) => {
  console.warn('checkAndApproveToken is deprecated. Use useSwapOperations hook instead.');
  throw new Error('Use useSwapOperations hook instead');
};

export const executeSwap = async (swapParams, walletAddress) => {
  console.warn('executeSwap is deprecated. Use useSwapOperations hook instead.');
  throw new Error('Use useSwapOperations hook instead');
};

export const waitForSwapTransaction = async (txHash) => {
  console.warn('waitForSwapTransaction is deprecated. Use useSwapOperations hook instead.');
  throw new Error('Use useSwapOperations hook instead');
};

export const getCurrentPrice = async (tokenIn, tokenOut, poolData = null) => {
  try {
    // If we have pool data, use it
    if (poolData && poolData.price) {
      const currentPrice = parseFloat(poolData.price);
      
      if (tokenIn === WETH_ADDRESS && tokenOut === ORNE_TOKEN_ADDRESS) {
        // WETH to ORNE: return ORNE per WETH
        return (1 / currentPrice).toString();
      } else if (tokenIn === ORNE_TOKEN_ADDRESS && tokenOut === WETH_ADDRESS) {
        // ORNE to WETH: return WETH per ORNE
        return currentPrice.toString();
      }
    }
    
    // If no pool data, return null to indicate we need real-time data
    console.warn('No pool data available for price calculation');
    return null;
  } catch (error) {
    console.error('Error getting current price:', error);
    return null;
  }
}; 
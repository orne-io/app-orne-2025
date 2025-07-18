import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';

const UNISWAP_V3_POOL_ADDRESS = '0x198d0136c5e7766572f6918eda7ac2b576b43d2f';
const ORNE_ADDRESS = '0x89DbdB8e3b0e41aAe0871Bf9e1fcCe72F117bB1f';
const WETH_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Pool ABI for basic functions
const POOL_ABI = [
  {
    "inputs": [],
    "name": "liquidity",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "slot0",
    "outputs": [
      {
        "internalType": "uint160",
        "name": "sqrtPriceX96",
        "type": "uint160"
      },
      {
        "internalType": "int24",
        "name": "tick",
        "type": "int24"
      },
      {
        "internalType": "uint16",
        "name": "observationIndex",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "observationCardinality",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "observationCardinalityNext",
        "type": "uint16"
      },
      {
        "internalType": "uint8",
        "name": "feeProtocol",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "unlocked",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token0",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token1",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const useUniswapV3PoolData = () => {
  const [poolData, setPoolData] = useState({
    liquidity: null,
    sqrtPriceX96: null,
    tick: null,
    token0: null,
    token1: null,
    orneLiquidity: null,
    wethLiquidity: null,
    price: null,
    loading: true,
    error: null
  });

  // Read pool liquidity
  const liquidityData = useReadContract({
    address: UNISWAP_V3_POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: 'liquidity',
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  });

  // Read pool slot0 (price data)
  const slot0Data = useReadContract({
    address: UNISWAP_V3_POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: 'slot0',
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  });

  // Read token addresses
  const token0Data = useReadContract({
    address: UNISWAP_V3_POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: 'token0',
  });

  const token1Data = useReadContract({
    address: UNISWAP_V3_POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: 'token1',
  });

  // Read ORNE balance of the pool
  const orneBalanceData = useReadContract({
    address: ORNE_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [UNISWAP_V3_POOL_ADDRESS],
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  });

  // Read WETH balance of the pool
  const wethBalanceData = useReadContract({
    address: WETH_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [UNISWAP_V3_POOL_ADDRESS],
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  });

  useEffect(() => {
    if (liquidityData.data && slot0Data.data && token0Data.data && token1Data.data && 
        orneBalanceData.data && wethBalanceData.data) {
      try {
        const liquidity = liquidityData.data;
        const sqrtPriceX96 = slot0Data.data[0];
        const tick = slot0Data.data[1];
        const token0 = token0Data.data;
        const token1 = token1Data.data;
        const orneBalance = orneBalanceData.data;
        const wethBalance = wethBalanceData.data;



        // Calculate price from sqrtPriceX96
        const price = (Number(sqrtPriceX96) / (2 ** 96)) ** 2;
        
        // Determine which token is ORNE and which is WETH
        
        let calculatedPrice;
        
        if (token0.toLowerCase() === ORNE_ADDRESS.toLowerCase()) {
          // token0 is ORNE, token1 is WETH
          calculatedPrice = price; // ORNE/WETH price
        } else {
          // token0 is WETH, token1 is ORNE
          calculatedPrice = 1 / price; // ORNE/WETH price
        }

        // Convert balances to human-readable format (divide by 10^18 for tokens with 18 decimals)
        const orneLiquidityFormatted = (Number(orneBalance) / (10 ** 18)).toFixed(2);
        const wethLiquidityFormatted = (Number(wethBalance) / (10 ** 18)).toFixed(6);



        setPoolData({
          liquidity: liquidity.toString(),
          sqrtPriceX96: sqrtPriceX96.toString(),
          tick: tick.toString(),
          token0,
          token1,
          orneLiquidity: orneLiquidityFormatted,
          wethLiquidity: wethLiquidityFormatted,
          price: calculatedPrice.toFixed(12),
          loading: false,
          error: null
        });



      } catch (error) {
        console.error('Error calculating pool data:', error);
        
        // Calculate price even if balance reading fails
        let fallbackPrice = '0';
        if (slot0Data.data && token0Data.data && token1Data.data) {
          try {
            const sqrtPriceX96 = slot0Data.data[0];
            const token0 = token0Data.data;
            const token1 = token1Data.data;
            
            const price = (Number(sqrtPriceX96) / (2 ** 96)) ** 2;
            
            if (token0.toLowerCase() === ORNE_ADDRESS.toLowerCase()) {
              fallbackPrice = price.toFixed(12);
            } else {
              fallbackPrice = (1 / price).toFixed(12);
            }
          } catch (priceError) {
            console.error('Error calculating fallback price:', priceError);
          }
        }
        
        // Fallback to known values
        setPoolData({
          liquidity: '0',
          sqrtPriceX96: '0',
          tick: '0',
          token0: '',
          token1: '',
          orneLiquidity: '0',
          wethLiquidity: '0',
          price: fallbackPrice,
          loading: false,
          error: null
        });
      }
    }
  }, [liquidityData.data, slot0Data.data, token0Data.data, token1Data.data, orneBalanceData.data, wethBalanceData.data]);

  // Handle loading states
  useEffect(() => {
    if (liquidityData.isLoading || slot0Data.isLoading || token0Data.isLoading || token1Data.isLoading ||
        orneBalanceData.isLoading || wethBalanceData.isLoading) {
      setPoolData(prev => ({ ...prev, loading: true }));
    }
  }, [liquidityData.isLoading, slot0Data.isLoading, token0Data.isLoading, token1Data.isLoading,
      orneBalanceData.isLoading, wethBalanceData.isLoading]);

  // Handle errors
  useEffect(() => {
    if (liquidityData.error || slot0Data.error || token0Data.error || token1Data.error ||
        orneBalanceData.error || wethBalanceData.error) {
      const error = liquidityData.error || slot0Data.error || token0Data.error || token1Data.error ||
                   orneBalanceData.error || wethBalanceData.error;
      setPoolData(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to fetch pool data'
      }));
    }
  }, [liquidityData.error, slot0Data.error, token0Data.error, token1Data.error,
      orneBalanceData.error, wethBalanceData.error]);



  return poolData;
}; 
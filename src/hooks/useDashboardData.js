import { useMemo } from 'react';
import { useWethPrice } from './useWethPrice';

export const useDashboardData = (globalStats, uniswapData) => {
  const wethPrice = useWethPrice();
  
  const dashboardData = useMemo(() => {
    // Calculate USD price based on WETH price
    let priceUSD = 0;
    let ornePriceInWeth = 0;
    

    
    if (uniswapData?.price && parseFloat(uniswapData.price) > 0) {
      ornePriceInWeth = parseFloat(uniswapData.price);

    } else if (uniswapData?.price === '0' || !uniswapData?.price) {
      // If pool price is 0 or null, use the calculated price from pool data
      // This happens when the pool calculation fails but we have valid data
      if (uniswapData?.sqrtPriceX96 && uniswapData?.token0 && uniswapData?.token1) {
        const ORNE_ADDRESS = '0x89DbdB8e3b0e41aAe0871Bf9e1fcCe72F117bB1f';
        const sqrtPriceX96 = parseFloat(uniswapData.sqrtPriceX96);
        const price = (sqrtPriceX96 / (2 ** 96)) ** 2;
        
        if (uniswapData.token0.toLowerCase() === ORNE_ADDRESS.toLowerCase()) {
          ornePriceInWeth = price;
        } else {
          ornePriceInWeth = 1 / price;
        }

      }
    }
    
    if (ornePriceInWeth > 0) {
      if (wethPrice.usd) {
        priceUSD = ornePriceInWeth * wethPrice.usd;

      } else if (!wethPrice.loading) {
        // Fallback to approximate WETH price if API fails
        const wethPriceUSD = 3000; // Fallback price
        priceUSD = ornePriceInWeth * wethPriceUSD;

      }
    }

    const result = {
      ornePrice: ornePriceInWeth > 0 ? ornePriceInWeth.toFixed(12) : '0',
      priceUSD: priceUSD,
      wethPriceUSD: wethPrice.usd,
      maxSupply: 100000000,
      circulatingSupply: 100000000 - parseFloat(globalStats.totalStaked) - parseFloat(globalStats.adminBalance || 0),
      apr: 5.0,
      estimatedHolders: (() => {
        if (window.orneGlobalStatsV5?.uniqueHolders !== undefined) {
          return window.orneGlobalStatsV5.uniqueHolders;
        }
        if (window.orneGlobalStatsV5?.uniqueStakers !== undefined) {
          return window.orneGlobalStatsV5.uniqueStakers;
        }
        const totalStakedNumber = parseFloat(globalStats.totalStaked);
        return totalStakedNumber > 0 ? 1 : 0;
      })(),
      totalCO2Offset: (() => {
        if (window.orneGlobalStatsV5?.totalCO2OffsetT !== undefined) {
          return window.orneGlobalStatsV5.totalCO2OffsetT.toFixed(3);
        }
        const totalStakedNumber = parseFloat(globalStats.totalStaked);
        const co2PerOrneNumber = parseFloat(globalStats.co2PerOrne.replace(/,/g, '')) || 0;
        if (totalStakedNumber === 0 || co2PerOrneNumber === 0) return 0;
        const totalCO2Grams = totalStakedNumber * co2PerOrneNumber;
        return (totalCO2Grams / 1000).toFixed(3);
      })()
    };
    

    
    return result;
  }, [globalStats, uniswapData, wethPrice]);

  return dashboardData;
};
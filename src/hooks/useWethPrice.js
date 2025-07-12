import { useState, useEffect } from 'react';

export const useWethPrice = () => {
  const [wethPrice, setWethPrice] = useState({
    usd: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchWethPrice = async () => {
      try {
        setWethPrice(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=weth&vs_currencies=usd');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const usdPrice = data?.weth?.usd;
        
        if (usdPrice) {
          setWethPrice({
            usd: usdPrice,
            loading: false,
            error: null
          });
        } else {
          throw new Error('No WETH price data received');
        }
      } catch (error) {
        console.error('Error fetching WETH price:', error);
        setWethPrice({
          usd: null,
          loading: false,
          error: error.message
        });
      }
    };

    // Fetch immediately
    fetchWethPrice();

    // Set up interval to refresh every 5 minutes
    const interval = setInterval(fetchWethPrice, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return wethPrice;
}; 
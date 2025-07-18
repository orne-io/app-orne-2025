/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'ethers';
import { getSwapQuote, useSwapOperations } from '../utils/uniswapSwap';
import { useNotificationContext } from '../contexts/NotificationContext';
import { WETH_ADDRESS, ORNE_TOKEN_ADDRESS } from '../utils/constants';
import { useUniswapV3PoolData } from '../hooks/useUniswapV3PoolData';
import { useWethPrice } from '../hooks/useWethPrice';

const CustomSwapWidget = () => {
  const { address, isConnected } = useAccount();
  const { showSuccess, showError, showWarning } = useNotificationContext();
  const { executeSwap, waitForSwapTransaction } = useSwapOperations();
  const poolData = useUniswapV3PoolData();
  const wethPrice = useWethPrice();

  // Token balances
  const wethBalance = useBalance({
    address,
    token: WETH_ADDRESS,
    watch: true,
  });

  const orneBalance = useBalance({
    address,
    token: ORNE_TOKEN_ADDRESS,
    watch: true,
  });

  // Token allowances
  const wethAllowance = useReadContract({
    address: WETH_ADDRESS,
    abi: [
      {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' }
        ],
        outputs: [{ name: '', type: 'uint256' }]
      }
    ],
    functionName: 'allowance',
    args: [address, '0xE592427A0AEce92De3Edee1F18E0157C05861564'], // Uniswap V3 Router
    query: {
      enabled: !!address,
    }
  });

  const orneAllowance = useReadContract({
    address: ORNE_TOKEN_ADDRESS,
    abi: [
      {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' }
        ],
        outputs: [{ name: '', type: 'uint256' }]
      }
    ],
    functionName: 'allowance',
    args: [address, '0xE592427A0AEce92De3Edee1F18E0157C05861564'], // Uniswap V3 Router
    query: {
      enabled: !!address,
    }
  });

  // State
  const [fromToken, setFromToken] = useState('ORNE');
  const [toToken, setToToken] = useState('WETH');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [swapQuote, setSwapQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [slippage, setSlippage] = useState(2.0); // Changed default to 2%
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [customSlippage, setCustomSlippage] = useState('2.0');



  // Get quote when inputs change
  useEffect(() => {
    if (!isConnected || !fromAmount || fromAmount === '0' || fromAmount === '') {
      setToAmount('');
      setSwapQuote(null);
      return;
    }

    const getQuote = async () => {
      setIsGettingQuote(true);
      try {
        if (!fromAmount || fromAmount === '0' || fromAmount === '') {
          setToAmount('');
          setSwapQuote(null);
          return;
        }
        
        const tokenIn = fromToken === 'WETH' ? WETH_ADDRESS : ORNE_TOKEN_ADDRESS;
        const tokenOut = toToken === 'WETH' ? WETH_ADDRESS : ORNE_TOKEN_ADDRESS;
        const amountIn = parseEther(fromAmount).toString();

        // Use custom slippage if set, otherwise use default
        const currentSlippage = showSlippageSettings ? parseFloat(customSlippage) : slippage;

        // Pass pool data to getSwapQuote
        const quote = await getSwapQuote(tokenIn, tokenOut, amountIn, 3000, currentSlippage, poolData);
        
        setSwapQuote(quote);
        // The quote.amountOut is already in wei, so we need to format it properly
        setToAmount(formatEther(quote.amountOut));
      } catch (error) {
        console.error('Error getting quote:', error);
        setToAmount('');
        setSwapQuote(null);
        
        // Show specific error messages for different cases
        if (error.message.includes('too small') || error.message.includes('Minimum')) {
          showWarning(error.message);
        } else if (error.message.includes('Price impact too high')) {
          const priceImpactMatch = error.message.match(/(\d+\.?\d*)%/);
          const priceImpact = priceImpactMatch ? parseFloat(priceImpactMatch[1]) : 0;
          const currentSlippage = showSlippageSettings ? parseFloat(customSlippage) : slippage;
          
          if (priceImpact > currentSlippage) {
            showWarning(`Price impact (${priceImpact.toFixed(2)}%) is higher than your slippage tolerance (${currentSlippage}%). Please increase slippage or reduce amount.`);
          } else {
            showWarning(error.message);
          }
        } else {
          showWarning(error.message);
        }
      } finally {
        setIsGettingQuote(false);
      }
    };

    // Debounce the quote request
    const timeoutId = setTimeout(getQuote, 500);
    return () => clearTimeout(timeoutId);
  }, [fromAmount, fromToken, toToken, isConnected, slippage, customSlippage, showSlippageSettings, showWarning, poolData]);

  const handleSwap = async () => {
    if (!isConnected) {
      showWarning('Please connect your wallet first');
      return;
    }

    if (!fromAmount || !toAmount || !swapQuote || fromAmount === '0' || fromAmount === '') {
      showWarning('Please enter amounts and wait for quote');
      return;
    }

    try {
      setIsLoading(true);
      
      const tokenIn = fromToken === 'WETH' ? WETH_ADDRESS : ORNE_TOKEN_ADDRESS;
      const tokenOut = toToken === 'WETH' ? WETH_ADDRESS : ORNE_TOKEN_ADDRESS;
      
      // Validate amount before parsing
      if (isNaN(parseFloat(fromAmount)) || parseFloat(fromAmount) <= 0) {
        throw new Error('Invalid amount');
      }
      
      const amountIn = parseEther(fromAmount).toString();
      
      // Use the pre-calculated amountOutMinimum from the quote
      const amountOutMinimum = swapQuote.amountOutMinimum;

      const swapParams = {
        tokenIn,
        tokenOut,
        amountIn,
        amountOutMinimum: amountOutMinimum.toString(),
        isExactInput: true
      };



      // Execute the swap (this will handle approval automatically)
      const txHash = await executeSwap(swapParams, address);
      
      showSuccess(`Swap transaction sent! Hash: ${txHash.slice(0, 10)}...`);
      
      // Wait for confirmation
      await waitForSwapTransaction(txHash);
      
      // Show detailed success message with amounts
      const fromAmountFormatted = parseFloat(fromAmount).toLocaleString(undefined, { maximumFractionDigits: 6 });
      const toAmountFormatted = parseFloat(toAmount).toLocaleString(undefined, { maximumFractionDigits: 6 });
      showSuccess(`✅ Swap successful! You exchanged ${fromAmountFormatted} ${fromToken} for ${toAmountFormatted} ${toToken}`);
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setSwapQuote(null);
      
    } catch (error) {
      console.error('Swap error:', error);
      showError(`Swap failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const getCurrentBalance = () => {
    if (fromToken === 'WETH') {
      return wethBalance?.data?.formatted || '0';
    } else {
      return orneBalance?.data?.formatted || '0';
    }
  };

  const getCurrentAllowance = () => {
    if (fromToken === 'WETH') {
      return wethAllowance?.data ? formatEther(wethAllowance.data) : '0';
    } else {
      return orneAllowance?.data ? formatEther(orneAllowance.data) : '0';
    }
  };

  const needsApproval = () => {
    if (!fromAmount || fromAmount === '0' || fromAmount === '') return false;
    
    const currentAllowance = fromToken === 'WETH' ? wethAllowance?.data : orneAllowance?.data;
    if (!currentAllowance) return false;
    
    try {
      const requiredAmount = parseEther(fromAmount);
      return BigInt(currentAllowance) < BigInt(requiredAmount);
    } catch (error) {
      console.error('Error parsing amount:', error);
      return false;
    }
  };

  const isPriceImpactTooHigh = () => {
    if (!swapQuote || !swapQuote.priceImpact) return false;
    
    const currentSlippage = showSlippageSettings ? parseFloat(customSlippage) : slippage;
    return swapQuote.priceImpact > currentSlippage;
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e9ecef',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#383e5c' }}>Swap Tokens</h4>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Swap between $WETH and $ORNE tokens
        </p>
        
        {/* Pool Data Display */}
        {poolData && !poolData.loading && !poolData.error && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            background: '#f8f9fa', 
            borderRadius: '8px', 
            fontSize: '12px',
            color: '#666'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Pool Liquidity:</span>
              <span>{poolData.orneLiquidity} ORNE / {poolData.wethLiquidity} WETH</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Current Price:</span>
              <span>1 ORNE = {parseFloat(poolData.price).toFixed(8)} WETH</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>WETH Price:</span>
              <span>
                {wethPrice.loading ? 'Loading...' : 
                 wethPrice.error ? 'Error' : 
                 wethPrice.usd ? `$${wethPrice.usd.toFixed(2)}` : 'N/A'}
              </span>
            </div>
          </div>
        )}
        
        {poolData && poolData.loading && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            background: '#fff3cd', 
            borderRadius: '8px', 
            fontSize: '12px',
            color: '#856404'
          }}>
            Loading pool data...
          </div>
        )}
        
        {poolData && poolData.error && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            background: '#f8d7da', 
            borderRadius: '8px', 
            fontSize: '12px',
            color: '#721c24'
          }}>
            Error loading pool data: {poolData.error}
          </div>
        )}
      </div>

      {/* From Token */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <label style={{ fontSize: '14px', color: '#666' }}>From</label>
          <span style={{ fontSize: '12px', color: '#666' }}>
            Balance: {getCurrentBalance()} ${fromToken}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          border: '1px solid #e9ecef', 
          borderRadius: '8px', 
          overflow: 'hidden',
          background: '#f8f9fa'
        }}>
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => {
              const value = e.target.value;
              setFromAmount(value);
              

              
              // Show warning for large ORNE amounts
              if (fromToken === 'ORNE' && value && parseFloat(value) > 1000000) {
                showWarning('Amount too large. Maximum recommended swap is 1,000,000 ORNE to avoid excessive price impact.');
              }
            }}
            placeholder="0.0"
            style={{
              flex: 1,
              border: 'none',
              padding: '12px',
              background: 'transparent',
              fontSize: '16px'
            }}
          />
          <div style={{
            padding: '12px',
            background: '#e9ecef',
            borderLeft: '1px solid #e9ecef',
            minWidth: '80px',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            {fromToken}
          </div>
        </div>
        
        {/* Percentage buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginTop: '8px',
          flexWrap: 'wrap'
        }}>
          {[25, 50, 75].map((percent) => (
            <button
              key={percent}
              onClick={() => {
                const balance = parseFloat(getCurrentBalance());
                const amount = (balance * percent / 100).toFixed(6);
                setFromAmount(amount);
              }}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#495057'
              }}
              onMouseOver={(e) => e.target.style.background = '#e9ecef'}
              onMouseOut={(e) => e.target.style.background = '#f8f9fa'}
            >
              {percent}%
            </button>
          ))}
          <button
            onClick={() => {
              const balance = parseFloat(getCurrentBalance());
              setFromAmount(balance.toFixed(6));
            }}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              background: '#007bff',
              border: '1px solid #007bff',
              borderRadius: '4px',
              cursor: 'pointer',
              color: 'white',
              fontWeight: '600'
            }}
            onMouseOver={(e) => e.target.style.background = '#0056b3'}
            onMouseOut={(e) => e.target.style.background = '#007bff'}
          >
            MAX
          </button>
        </div>
        

        
        {fromToken === 'ORNE' && fromAmount && parseFloat(fromAmount) > 1000000 && (
          <div style={{ 
            marginTop: '5px', 
            fontSize: '12px', 
            color: '#721c24',
            background: '#f8d7da',
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #f5c6cb'
          }}>
            ⚠️ Amount too large! This will cause high price impact. Consider smaller amounts.
          </div>
        )}
      </div>

      {/* Switch Button */}
      <div style={{ textAlign: 'center', margin: '10px 0' }}>
        <button
          onClick={switchTokens}
          style={{
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ↓
        </button>
      </div>

      {/* To Token */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <label style={{ fontSize: '14px', color: '#666' }}>To</label>
          <span style={{ fontSize: '12px', color: '#666' }}>
            Balance: {toToken === 'WETH' ? (wethBalance?.data?.formatted || '0') : (orneBalance?.data?.formatted || '0')} ${toToken}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          border: '1px solid #e9ecef', 
          borderRadius: '8px', 
          overflow: 'hidden',
          background: '#f8f9fa'
        }}>
          <input
            type="number"
            value={toAmount}
            onChange={(e) => setToAmount(e.target.value)}
            placeholder={isGettingQuote ? 'Getting quote...' : '0.0'}
            disabled={isGettingQuote}
            style={{
              flex: 1,
              border: 'none',
              padding: '12px',
              background: 'transparent',
              fontSize: '16px',
              opacity: isGettingQuote ? 0.6 : 1
            }}
          />
          <div style={{
            padding: '12px',
            background: '#e9ecef',
            borderLeft: '1px solid #e9ecef',
            minWidth: '80px',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            {toToken}
          </div>
        </div>
        {swapQuote && (
          <div style={{ 
            marginTop: '8px', 
            fontSize: '12px', 
            color: '#666',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ 
              color: isPriceImpactTooHigh() ? '#dc3545' : '#666',
              fontWeight: isPriceImpactTooHigh() ? '600' : 'normal'
            }}>
              Price Impact: {swapQuote.priceImpact?.toFixed(2) || '0.00'}%
            </span>
            <span>Min Received: {formatEther(swapQuote.amountOutMinimum)} ${toToken}</span>
          </div>
        )}
        
        {isPriceImpactTooHigh() && (
          <div style={{ 
            marginTop: '5px', 
            fontSize: '12px', 
            color: '#721c24',
            background: '#f8d7da',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #f5c6cb'
          }}>
            ⚠️ Price impact ({swapQuote.priceImpact?.toFixed(2)}%) exceeds slippage tolerance ({showSlippageSettings ? customSlippage : slippage}%). Increase slippage or reduce amount.
          </div>
        )}
      </div>

      {/* Slippage */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
          <label style={{ fontSize: '14px', color: '#666' }}>
            Slippage Tolerance
          </label>
          <button
            onClick={() => setShowSlippageSettings(!showSlippageSettings)}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              fontSize: '12px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {showSlippageSettings ? 'Hide' : 'Custom'}
          </button>
        </div>
        
        {!showSlippageSettings ? (
          <select
            value={slippage}
            onChange={(e) => setSlippage(parseFloat(e.target.value))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              background: 'white'
            }}
          >
            <option value={0.1}>0.1%</option>
            <option value={0.5}>0.5%</option>
            <option value={1.0}>1.0%</option>
            <option value={2.0}>2.0%</option>
            <option value={5.0}>5.0%</option>
            <option value={10.0}>10.0%</option>
          </select>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              value={customSlippage}
              onChange={(e) => setCustomSlippage(e.target.value)}
              placeholder="2.0"
              min="0.1"
              max="50"
              step="0.1"
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                background: 'white'
              }}
            />
            <span style={{ fontSize: '14px', color: '#666' }}>%</span>
          </div>
        )}
        
        {showSlippageSettings && (
          <div style={{ 
            marginTop: '5px', 
            fontSize: '11px', 
            color: '#856404',
            background: '#fff3cd',
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ffeaa7'
          }}>
            ⚠️ Higher slippage increases risk of MEV attacks. Use with caution.
          </div>
        )}
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!isConnected || !fromAmount || !toAmount || !swapQuote || isLoading || isGettingQuote || isPriceImpactTooHigh()}
        style={{
          width: '100%',
          padding: '12px',
          background: !isConnected ? '#ccc' : 
                     isPriceImpactTooHigh() ? '#dc3545' :
                     needsApproval() ? '#ffc107' : '#89be83',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: !isConnected || !fromAmount || !toAmount || !swapQuote || isPriceImpactTooHigh() ? 'not-allowed' : 'pointer',
          opacity: !isConnected || !fromAmount || !toAmount || !swapQuote || isPriceImpactTooHigh() ? 0.6 : 1
        }}
      >
        {!isConnected ? 'Connect Wallet' : 
         isGettingQuote ? 'Getting Quote...' :
         isPriceImpactTooHigh() ? 'Price Impact Too High' :
         needsApproval() ? 'Approve First' : 
         isLoading ? 'Processing...' : 'Swap'}
      </button>

      {/* Info */}
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Current Allowance:</span>
          <span>{getCurrentAllowance()} {fromToken}</span>
        </div>
        {needsApproval() && (
          <div style={{ 
            background: '#fff3cd', 
            color: '#856404', 
            padding: '8px', 
            borderRadius: '6px', 
            marginTop: '10px',
            fontSize: '12px'
          }}>
            ⚠️ Approval required before swap
          </div>
        )}
      </div>
      
            </div>
    );
};

export default CustomSwapWidget; 
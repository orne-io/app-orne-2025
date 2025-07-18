import React, { useEffect, useState } from 'react';
import { styles } from '../styles/styles';
import { useUniswapV3PoolData } from '../hooks/useUniswapV3PoolData';
import { useDashboardData } from '../hooks/useDashboardData';
import { useGlobalStats } from '../hooks/useGlobalStats';
import InfoTooltip from './InfoTooltip';
import CustomSwapWidget from './CustomSwapWidget';
import ornePriceIcon from '../images/orne-price.png';
import circulatingOrneIcon from '../images/circulating-orne.png';
import totalOrneStakedIcon from '../images/total-orne-staked.png';
import pooledWethIcon from '../images/pooled-weth.png';
import { useAccount } from 'wagmi';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useWethPrice } from '../hooks/useWethPrice';
import tokenIcon from '../images/token_icon.png';
import { ethers } from 'ethers';
import { ORNE_WETH_V3_POOL } from '../utils/uniswapV3';

const ORNE_TOKEN_ADDRESS = "0x89DbdB8e3b0e41aAe0871Bf9e1fcCe72F117bB1f";
const ORNE_TOKEN_SYMBOL = "ORNE";
const ORNE_TOKEN_DECIMALS = 18;
const WETH_ADDRESS = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"; // WETH on Arbitrum

function addTokenToMetaMask() {
  if (window.ethereum && window.ethereum.request) {
    window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: ORNE_TOKEN_ADDRESS,
          symbol: ORNE_TOKEN_SYMBOL,
          decimals: ORNE_TOKEN_DECIMALS,
          image: window.location.origin + tokenIcon.replace(/^\./, ''),
        },
      },
    }).then((success) => {
      if (success) {
        // Optionally show a notification
        if (typeof window.showSuccess === 'function') {
          window.showSuccess('$ORNE token added to wallet!');
        }
      }
    }).catch(console.error);
  } else {
    alert('MetaMask is not available.');
  }
}

const Swap = () => {
  const { address, isConnected } = useAccount();
  const { showSuccess } = useNotificationContext();
  const poolData = useUniswapV3PoolData();
  const wethPrice = useWethPrice();
  const { globalStats, loadGlobalStats } = useGlobalStats();
  
  useEffect(() => {
    loadGlobalStats();
    const interval = setInterval(loadGlobalStats, 60000);
    return () => clearInterval(interval);
  }, [loadGlobalStats]);
  
  // Extract data from the new pool data format
  const price = poolData?.price || 0;
  const pooledOrne = poolData?.orneLiquidity || 0;
  const pooledWeth = poolData?.wethLiquidity || 0;
  const loading = poolData?.loading || false;
  const error = poolData?.error || null;
  
  const dashboardData = useDashboardData(globalStats, poolData);
  const { circulatingSupply = 0 } = dashboardData;
  const marketCap = !circulatingSupply || isNaN(circulatingSupply) ? null : dashboardData.priceUSD * circulatingSupply;
  const totalMarketCap = dashboardData.priceUSD * 100000000; // Total supply = 100M

  const poolAvailable = true; // Pool is always available now

  const getUniswapAddLiquidityUrl = () => {
    return `https://app.uniswap.org/add/${WETH_ADDRESS}/${ORNE_TOKEN_ADDRESS}?chain=arbitrum`;
  };

  const handleOpenUniswapLiquidity = () => {
    window.open(getUniswapAddLiquidityUrl(), '_blank');
  };

  return (
    <div>
      {/* Top 4 stat blocks */}
      <div style={{ ...styles.statsGrid, marginBottom: 40 }}>
        <div style={styles.statCard}>
          <div className="stat-icon">
            <img src={ornePriceIcon} alt="$ORNE Price" />
          </div>
          <div style={styles.statLabel}>
            $ORNE Price
            <InfoTooltip title="$ORNE Price" content="Current price of the $ORNE token in USD and WETH, updated in real time from the Uniswap V3 pool.">
              <span className="tooltip-icon text-primary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div style={styles.statValue}>
            {loading ? 'Loading...' : error ? 'N/A' : `$${Number(dashboardData.priceUSD).toFixed(6)}`}
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              {loading ? '' : error ? '' : `${Number(price).toFixed(8)} WETH`}
            </div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div className="stat-icon">
            <img src={circulatingOrneIcon} alt="Circulating $ORNE" />
          </div>
          <div style={styles.statLabel}>
            Market Cap
            <InfoTooltip title="Market Cap" content="Total market capitalization calculated using circulating supply (tokens not staked or held by admin). The smaller value shows total supply market cap.">
              <span className="tooltip-icon text-secondary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div style={styles.statValue}>
            {loading ? 'Loading...' : error ? 'N/A' : (marketCap === null ? 'N/A' : `$${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}`)}
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              {loading ? '' : error ? '' : `Total: $${totalMarketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            </div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div className="stat-icon">
            <img src={totalOrneStakedIcon} alt="Total $ORNE Staked" />
          </div>
          <div style={styles.statLabel}>
            Pooled $ORNE
            <InfoTooltip title="Pooled $ORNE" content="Total amount of $ORNE tokens currently locked in the Uniswap V3 liquidity pool.">
              <span className="tooltip-icon text-secondary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div style={styles.statValue}>
            {loading ? 'Loading...' : error ? 'N/A' : `${Number(pooledOrne).toLocaleString(undefined, { maximumFractionDigits: 0 })} $ORNE`}
          </div>
        </div>
        <div style={styles.statCard}>
          <div className="stat-icon">
            <img src={pooledWethIcon} alt="Pooled WETH" />
          </div>
          <div style={styles.statLabel}>
            Pooled $WETH
            <InfoTooltip title="Pooled $WETH" content="Total amount of WETH tokens currently locked in the Uniswap V3 liquidity pool.">
              <span className="tooltip-icon text-secondary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div style={styles.statValue}>
            {loading ? 'Loading...' : error ? 'N/A' : `${Number(pooledWeth).toLocaleString(undefined, { maximumFractionDigits: 4 })} WETH`}
          </div>
        </div>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: 20 }}>Error: {error}</div>
      )}
      
      {!poolAvailable && (
        <div style={{ color: '#856404', background: '#fff3cd', border: '1px solid #ffeaa7', padding: 12, borderRadius: 8, marginBottom: 24 }}>
          The Uniswap V3 pool is not available yet. Swap and liquidity features will be enabled once the pool is live.
        </div>
      )}

      {/* Main Swap Interface */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
        {/* Swap Widget */}
        <div style={styles.card}>
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            🔄 Swap $ORNE / $WETH
            <InfoTooltip title="Swap" content="Official Uniswap swap widget integrated directly into the DApp. Connect your wallet to start trading.">
              <span className="tooltip-icon text-primary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </h3>
          


          {/* Custom Swap Widget */}
          <CustomSwapWidget />
          
          <div style={{ marginTop: 15, textAlign: 'center' }}>
            <a 
              href="https://app.uniswap.org/swap?inputCurrency=0x89DbdB8e3b0e41aAe0871Bf9e1fcCe72F117bB1f&outputCurrency=0x82aF49447D8a07e3bd95BD0d56f35241523fBab1&chain=arbitrum"
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#007bff', 
                fontSize: '14px', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              Trade on Uniswap →
            </a>
          </div>
        </div>
        
        {/* Add Liquidity block */}
        <div style={styles.card}>
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            💧 Add Liquidity
            <InfoTooltip title="Add Liquidity" content="Add liquidity to the ORNE/WETH pool on Uniswap to earn trading fees. This will open the Uniswap liquidity interface in a new tab.">
              <span className="tooltip-icon text-primary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </h3>
          
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', marginBottom: 15 }}>
              Provide liquidity to the ORNE/WETH pool and earn trading fees. 
              The more liquidity you provide, the more fees you can earn.
            </p>
            
            <div style={{ 
              background: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: 20,
              border: '1px solid #e9ecef'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: '600', color: '#383e5c' }}>Pooled ORNE:</span>
                <span style={{ fontWeight: '600', color: '#89be83' }}>
                  {loading ? 'Loading...' : error ? 'N/A' : `${Number(pooledOrne).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>Pooled WETH:</span>
                <span style={{ color: '#666', fontSize: '14px' }}>
                  {loading ? 'Loading...' : error ? 'N/A' : `${Number(pooledWeth).toLocaleString(undefined, { maximumFractionDigits: 4 })}`}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleOpenUniswapLiquidity}
            disabled={!poolAvailable}
            style={{ 
              ...styles.button, 
              opacity: !poolAvailable ? 0.5 : 1,
              cursor: !poolAvailable ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            💧 Add Liquidity
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div style={{ marginTop: 15, textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: '12px' }}>
              Opens Uniswap liquidity interface in a new tab
            </p>
          </div>

          {/* Add Token to Wallet - moved here */}
          <div style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid #e9ecef' }}>
            <h4 style={{ marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
              🎯 Add $ORNE to Wallet
              <InfoTooltip title="Add Token" content="Add the $ORNE token to your wallet for easier tracking and management.">
                <span className="tooltip-icon text-primary">
                  <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
                </span>
              </InfoTooltip>
            </h4>
            
            <div style={{ marginBottom: 15 }}>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', marginBottom: 15 }}>
                Add the $ORNE token to your wallet to track your balance and transactions more easily.
              </p>
              
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: 15,
                border: '1px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: '600', color: '#383e5c' }}>Token Address:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#666', fontSize: '12px', fontFamily: 'monospace' }}>
                      {ORNE_TOKEN_ADDRESS}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(ORNE_TOKEN_ADDRESS);
                        showSuccess('Token address copied to clipboard!');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        cursor: 'pointer',
                        padding: '2px',
                        fontSize: '12px'
                      }}
                      title="Copy address"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Symbol:</span>
                  <span style={{ color: '#666', fontSize: '14px' }}>$ORNE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Decimals:</span>
                  <span style={{ color: '#666', fontSize: '14px' }}>18</span>
                </div>
              </div>
            </div>

            <button 
              onClick={addTokenToMetaMask}
              style={{ 
                ...styles.button, 
                fontSize: '14px',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#17a2b8',
                width: '100%'
              }}
            >
              🎯 Add $ORNE to Wallet
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div style={{ marginTop: 10, textAlign: 'center' }}>
              <p style={{ color: '#666', fontSize: '11px' }}>
                Works with MetaMask and other compatible wallets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap; 
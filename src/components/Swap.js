import React, { useEffect, useState } from 'react';
import { styles } from '../styles/styles';
import { ORNE_WETH_V3_POOL, getUniswapV3PoolData } from '../utils/uniswapV3';
import { ethers } from 'ethers';

const ORNE_TOKEN_ADDRESS = "0xaf3acac72af103Dc0adeD53F1CC08638f856Bf8F";
const ORNE_TOKEN_SYMBOL = "ORNE";
const ORNE_TOKEN_DECIMALS = 18;
const WETH_DECIMALS = 18;
const CIRCULATING_SUPPLY = 90000000; // mock, replace with real value if available

function addTokenToMetaMask() {
  if (window.ethereum) {
    window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: ORNE_TOKEN_ADDRESS,
          symbol: ORNE_TOKEN_SYMBOL,
          decimals: ORNE_TOKEN_DECIMALS,
          image: window.location.origin + '/logo192.png',
        },
      },
    });
  }
}

function useUniswapV3PoolData() {
  const [data, setData] = useState({
    price: 0.10,
    pooledToken0: 50000,
    pooledToken1: 10,
    token0: ORNE_TOKEN_ADDRESS,
    token1: 'WETH',
    loading: true,
    error: null
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      if (!ORNE_WETH_V3_POOL || ORNE_WETH_V3_POOL === '0x0000000000000000000000000000000000000000') {
        setData(d => ({ ...d, loading: false }));
        return;
      }
      setData(d => ({ ...d, loading: true, error: null }));
      try {
        const provider = ethers.getDefaultProvider('mainnet');
        const result = await getUniswapV3PoolData(
          ORNE_WETH_V3_POOL,
          ORNE_TOKEN_DECIMALS,
          WETH_DECIMALS,
          provider
        );
        if (!cancelled) {
          setData({ ...result, loading: false, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setData(d => ({ ...d, loading: false, error: e.message || 'Error fetching pool data' }));
        }
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  return data;
}

const Swap = () => {
  const { price, pooledToken0, pooledToken1, loading, error } = useUniswapV3PoolData();
  const marketCap = price * CIRCULATING_SUPPLY;

  // State for swap and add liquidity forms
  const [swapAmount, setSwapAmount] = useState('');
  const [addOrneAmount, setAddOrneAmount] = useState('');
  const [addWethAmount, setAddWethAmount] = useState('');
  const [swapMessage, setSwapMessage] = useState('');
  const [liquidityMessage, setLiquidityMessage] = useState('');

  const poolAvailable = ORNE_WETH_V3_POOL && ORNE_WETH_V3_POOL !== '0x0000000000000000000000000000000000000000';

  // Handler for swap (mock)
  const handleSwap = (e) => {
    e.preventDefault();
    if (!poolAvailable) {
      setSwapMessage('Pool not available yet.');
      return;
    }
    // TODO: Integrate real Uniswap V3 swap logic here
    setSwapMessage('Swap functionality coming soon!');
  };

  // Handler for add liquidity (mock)
  const handleAddLiquidity = (e) => {
    e.preventDefault();
    if (!poolAvailable) {
      setLiquidityMessage('Pool not available yet.');
      return;
    }
    // TODO: Integrate real Uniswap V3 add liquidity logic here
    setLiquidityMessage('Add liquidity functionality coming soon!');
  };

  return (
    <div>
      {/* Top 4 stat blocks */}
      <div style={{ ...styles.statsGrid, marginBottom: 40 }}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>$ORNE Price</div>
          <div style={styles.statValue}>
            {loading ? 'Loading...' : error ? 'N/A' : `$${Number(price).toFixed(6)}`}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Market Cap</div>
          <div style={styles.statValue}>
            {loading ? 'Loading...' : error ? 'N/A' : `$${marketCap.toLocaleString()}`}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Pooled $ORNE</div>
          <div style={styles.statValue}>
            {loading ? 'Loading...' : error ? 'N/A' : pooledToken0.toLocaleString()}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Pooled $WETH</div>
          <div style={styles.statValue}>
            {loading ? 'Loading...' : error ? 'N/A' : pooledToken1}
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
      {/* Swap & Add Liquidity blocks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
        {/* Swap block */}
        <div style={styles.card}>
          <h3 style={{ marginBottom: 20 }}>
            🔄 Swap $ORNE / $WETH
          </h3>
          <form onSubmit={handleSwap}>
            <input
              type="number"
              placeholder="Amount to swap"
              style={styles.input}
              value={swapAmount}
              onChange={e => setSwapAmount(e.target.value)}
              disabled={!poolAvailable}
            />
            <div style={{ margin: '10px 0', color: '#666', fontSize: 14 }}>
              From: <b>$WETH</b> → To: <b>$ORNE</b>
            </div>
            <button style={styles.button} type="submit" disabled={!poolAvailable || !swapAmount}>
              Swap
            </button>
            {swapMessage && <div style={{ color: '#383e5c', marginTop: 10 }}>{swapMessage}</div>}
          </form>
        </div>
        {/* Add Liquidity block */}
        <div style={styles.card}>
          <h3 style={{ marginBottom: 20 }}>
            💧 Add Liquidity
          </h3>
          <form onSubmit={handleAddLiquidity}>
            <input
              type="number"
              placeholder="$ORNE amount"
              style={styles.input}
              value={addOrneAmount}
              onChange={e => setAddOrneAmount(e.target.value)}
              disabled={!poolAvailable}
            />
            <input
              type="number"
              placeholder="$WETH amount"
              style={styles.input}
              value={addWethAmount}
              onChange={e => setAddWethAmount(e.target.value)}
              disabled={!poolAvailable}
            />
            <button style={styles.button} type="submit" disabled={!poolAvailable || !addOrneAmount || !addWethAmount}>
              Add Liquidity
            </button>
            {liquidityMessage && <div style={{ color: '#383e5c', marginTop: 10 }}>{liquidityMessage}</div>}
          </form>
        </div>
      </div>
      {/* Token details block */}
      <div style={styles.card}>
        <h3 style={{ marginBottom: 16 }}>Token Details</h3>
        <div style={{ marginBottom: 8 }}>
          <b>Token:</b> ORNE
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Contract:</b> <span style={{ fontFamily: 'monospace' }}>{ORNE_TOKEN_ADDRESS}</span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Decimals:</b> {ORNE_TOKEN_DECIMALS}
        </div>
        <button style={styles.button} onClick={addTokenToMetaMask}>
          ➕ Add ORNE to MetaMask
        </button>
      </div>
    </div>
  );
};

export default Swap; 
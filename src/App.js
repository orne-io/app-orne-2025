import React, { useState, useEffect } from 'react';

// Configuration des contrats (À MODIFIER avec tes vraies adresses)
const CONFIG = {
  ORNE_TOKEN_ADDRESS: "0xaf3acac72af103Dc0adeD53F1CC08638f856Bf8F", // Remplace par ton adresse token
  STAKING_VAULT_ADDRESS: "0x03EE803De6fA90f5501ccF3E3b3f48eEf09Ce3E6", // Remplace par ton adresse vault
  NETWORK_ID: 421614, // Arbitrum Sepolia testnet
  NETWORK_NAME: "Arbitrum Sepolia"
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  innerContainer: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    color: 'white'
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  subtitle: {
    fontSize: '1.2rem',
    opacity: 0.9
  },
  card: {
    background: 'white',
    borderRadius: '15px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  button: {
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '8px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  buttonSecondary: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '8px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontWeight: '600',
    marginLeft: '10px'
  },
  buttonDanger: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '8px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontWeight: '600',
    width: '100%',
    marginBottom: '10px'
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '20px',
    boxSizing: 'border-box'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
  },
  statTitle: {
    color: '#667eea',
    marginBottom: '10px',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '600'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px',
    marginBottom: '30px'
  },
  cardTitle: {
    color: '#667eea',
    marginBottom: '20px',
    fontSize: '1.5rem',
    fontWeight: '600'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#555'
  },
  status: {
    padding: '10px 20px',
    borderRadius: '5px',
    margin: '10px 0',
    fontWeight: '600'
  },
  statusSuccess: {
    background: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  },
  statusError: {
    background: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  },
  statusWarning: {
    background: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffeaa7'
  },
  co2Section: {
    background: 'linear-gradient(135deg, #28a745, #20c997)',
    color: 'white',
    padding: '30px',
    borderRadius: '15px',
    marginBottom: '30px'
  },
  co2Grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },
  co2Stat: {
    background: 'rgba(255,255,255,0.1)',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center'
  },
  hidden: {
    display: 'none'
  }
};

export default function ORNEStakingDApp() {
  // États
  const [wallet, setWallet] = useState({
    connected: false,
    address: '',
    balance: '0',
    network: ''
  });
  
  const [userStats, setUserStats] = useState({
    orneBalance: '0',
    stakedBalance: '0',
    pendingRewards: '0',
    unstakingAvailable: '0',
    userCO2Offset: '0',
    canUnstake: false,
    timeUntilUnstake: 0
  });
  
  const [globalStats, setGlobalStats] = useState({
    totalStaked: '0',
    co2PerOrne: '0'
  });
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  
  // Utilitaires
  const formatEther = (value) => {
    if (!value) return '0';
    return (Number(value) / 1e18).toFixed(4);
  };
  
  const parseEther = (value) => {
    return window.BigInt(Math.floor(parseFloat(value) * 1e18));
  };
  
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum;
  };
  
  // Connecter le wallet
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      showStatus('MetaMask n\'est pas installé !', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        showStatus('Aucun compte sélectionné', 'error');
        return;
      }
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkId = parseInt(chainId, 16);
      
      if (networkId !== CONFIG.NETWORK_ID) {
        showStatus(`Mauvais réseau ! Connectez-vous à ${CONFIG.NETWORK_NAME}`, 'error');
        await switchNetwork();
        return;
      }
      
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });
      
      setWallet({
        connected: true,
        address: accounts[0],
        balance: formatEther(window.BigInt(balance)),
        network: CONFIG.NETWORK_NAME
      });
      
      showStatus('Wallet connecté avec succès !', 'success');
      
    } catch (error) {
      console.error('Erreur de connexion:', error);
      showStatus('Erreur de connexion: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Changer de réseau
  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CONFIG.NETWORK_ID.toString(16)}` }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${CONFIG.NETWORK_ID.toString(16)}`,
            chainName: 'Arbitrum Sepolia',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
            blockExplorerUrls: ['https://sepolia.arbiscan.io/']
          }]
        });
      }
    }
  };
  
  // Charger les données (version démo)
  const loadUserData = React.useCallback(async () => {
    if (!wallet.connected) return;
    
    setUserStats({
      orneBalance: '1000.0',
      stakedBalance: '500.0',
      pendingRewards: '12.5',
      unstakingAvailable: '0.0',
      userCO2Offset: '2.5',
      canUnstake: false,
      timeUntilUnstake: 0
    });
    
    setGlobalStats({
      totalStaked: '50000.0',
      co2PerOrne: '5.2'
    });
  }, [wallet.connected]);
  
  // Envoyer une transaction
  const sendTransaction = async (to, data, value = '0x0') => {
    const transactionParameters = {
      to: to,
      from: wallet.address,
      value: value,
      data: data,
    };
    
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    
    return txHash;
  };
  
  // Fonctions de staking
  const approveTokens = async () => {
    if (!stakeAmount || stakeAmount <= 0) {
      showStatus('Montant invalide', 'error');
      return;
    }
    
    try {
      setLoading(true);
      showStatus('Approbation en cours...', 'warning');
      
      const spender = CONFIG.STAKING_VAULT_ADDRESS.slice(2).padStart(64, '0');
      const amount = parseEther(stakeAmount).toString(16).padStart(64, '0');
      const data = '0x095ea7b3' + spender + amount;
      
      const txHash = await sendTransaction(CONFIG.ORNE_TOKEN_ADDRESS, data);
      showStatus('Approbation réussie ! Hash: ' + txHash, 'success');
      
    } catch (error) {
      showStatus('Erreur: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const stakeTokens = async () => {
    if (!stakeAmount || stakeAmount <= 0) {
      showStatus('Montant invalide', 'error');
      return;
    }
    
    try {
      setLoading(true);
      showStatus('Staking en cours...', 'warning');
      
      const amount = parseEther(stakeAmount).toString(16).padStart(64, '0');
      const data = '0xa694fc3a' + amount;
      
      const txHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, data);
      showStatus('Staking réussi ! Hash: ' + txHash, 'success');
      setStakeAmount('');
      
    } catch (error) {
      showStatus('Erreur: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const requestUnstake = async () => {
    if (!unstakeAmount || unstakeAmount <= 0) {
      showStatus('Montant invalide', 'error');
      return;
    }
    
    try {
      setLoading(true);
      showStatus('Demande d\'unstaking...', 'warning');
      
      const amount = parseEther(unstakeAmount).toString(16).padStart(64, '0');
      const data = '0x745400c9' + amount;
      
      const txHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, data);
      showStatus('Demande réussie ! Hash: ' + txHash, 'success');
      setUnstakeAmount('');
      
    } catch (error) {
      showStatus('Erreur: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const unstakeTokens = async () => {
    try {
      setLoading(true);
      showStatus('Unstaking en cours...', 'warning');
      
      const data = '0x2e17de78';
      const txHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, data);
      showStatus('Unstaking réussi ! Hash: ' + txHash, 'success');
      
    } catch (error) {
      showStatus('Erreur: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const claimRewards = async () => {
    try {
      setLoading(true);
      showStatus('Récupération des rewards...', 'warning');
      
      const data = '0x372500ab';
      const txHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, data);
      showStatus('Rewards récupérés ! Hash: ' + txHash, 'success');
      
    } catch (error) {
      showStatus('Erreur: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const disconnectWallet = () => {
    setWallet({ connected: false, address: '', balance: '0', network: '' });
    showStatus('Wallet déconnecté', 'success');
  };
  
  const showStatus = (message, type) => {
    setStatus({ message, type });
    setTimeout(() => setStatus({ message: '', type: '' }), 5000);
  };
  
  useEffect(() => {
    if (wallet.connected) {
      loadUserData();
    }
  }, [wallet.connected, loadUserData]);
  
  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>🌱 ORNE Staking</h1>
          <p style={styles.subtitle}>Stakez vos tokens ORNE et participez à la compensation carbone</p>
        </div>
        
        {/* Status Message */}
        {status.message && (
          <div style={{
            ...styles.status,
            ...(status.type === 'success' ? styles.statusSuccess :
                status.type === 'error' ? styles.statusError :
                styles.statusWarning)
          }}>
            {status.message}
          </div>
        )}
        
        {/* Wallet Connection */}
        <div style={styles.card}>
          {!wallet.connected ? (
            <div style={{textAlign: 'center'}}>
              <h3>Connectez votre wallet</h3>
              <p style={{color: '#666', marginBottom: '20px'}}>Connectez MetaMask pour commencer</p>
              <button
                onClick={connectWallet}
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : {})
                }}
              >
                {loading ? 'Connexion...' : 'Connecter MetaMask'}
              </button>
            </div>
          ) : (
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h3>Wallet connecté</h3>
                <p><strong>Adresse:</strong> {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</p>
                <p><strong>Réseau:</strong> {wallet.network}</p>
                <p><strong>Balance:</strong> {parseFloat(wallet.balance).toFixed(4)} ETH</p>
              </div>
              <button onClick={disconnectWallet} style={styles.buttonSecondary}>
                Déconnecter
              </button>
            </div>
          )}
        </div>
        
        {wallet.connected && (
          <>
            {/* Statistiques */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <h4 style={styles.statTitle}>Balance ORNE</h4>
                <p style={styles.statValue}>{parseFloat(userStats.orneBalance).toFixed(2)}</p>
              </div>
              <div style={styles.statCard}>
                <h4 style={styles.statTitle}>ORNE Stakés</h4>
                <p style={styles.statValue}>{parseFloat(userStats.stakedBalance).toFixed(2)}</p>
              </div>
              <div style={styles.statCard}>
                <h4 style={styles.statTitle}>Rewards</h4>
                <p style={styles.statValue}>{parseFloat(userStats.pendingRewards).toFixed(4)}</p>
              </div>
              <div style={styles.statCard}>
                <h4 style={styles.statTitle}>Unstaking</h4>
                <p style={styles.statValue}>{parseFloat(userStats.unstakingAvailable).toFixed(2)}</p>
              </div>
            </div>
            
            {/* Section CO2 */}
            <div style={styles.co2Section}>
              <h3 style={{fontSize: '1.8rem', marginBottom: '20px'}}>🌍 Impact Carbone</h3>
              <div style={styles.co2Grid}>
                <div style={styles.co2Stat}>
                  <h4 style={{marginBottom: '10px'}}>Votre CO2 Offset</h4>
                  <p style={{fontSize: '1.8rem', fontWeight: 'bold'}}>{userStats.userCO2Offset} kg</p>
                </div>
                <div style={styles.co2Stat}>
                  <h4 style={{marginBottom: '10px'}}>CO2 par ORNE</h4>
                  <p style={{fontSize: '1.8rem', fontWeight: 'bold'}}>{globalStats.co2PerOrne} g</p>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div style={styles.cardsGrid}>
              {/* Staking */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>💰 Staking</h3>
                <label style={styles.label}>Montant à staker</label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.1"
                  style={styles.input}
                />
                <button
                  onClick={stakeTokens}
                  disabled={loading || !stakeAmount}
                  style={{
                    ...styles.button,
                    width: '100%',
                    marginBottom: '10px',
                    ...(loading || !stakeAmount ? styles.buttonDisabled : {})
                  }}
                >
                  {loading ? 'Staking...' : 'Staker ORNE'}
                </button>
                <button
                  onClick={approveTokens}
                  disabled={loading || !stakeAmount}
                  style={{
                    ...styles.buttonSecondary,
                    width: '100%',
                    marginLeft: '0',
                    ...(loading || !stakeAmount ? styles.buttonDisabled : {})
                  }}
                >
                  {loading ? 'Approbation...' : 'Approuver'}
                </button>
              </div>
              
              {/* Unstaking */}
              <div style={styles.card}>
                <h3 style={{...styles.cardTitle, color: '#dc3545'}}>📤 Unstaking</h3>
                <label style={styles.label}>Montant à unstaker</label>
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.1"
                  style={styles.input}
                />
                <button
                  onClick={requestUnstake}
                  disabled={loading || !unstakeAmount}
                  style={{
                    ...styles.buttonDanger,
                    ...(loading || !unstakeAmount ? styles.buttonDisabled : {})
                  }}
                >
                  {loading ? 'Demande...' : 'Demander Unstaking'}
                </button>
                <button
                  onClick={unstakeTokens}
                  disabled={loading || !userStats.canUnstake}
                  style={{
                    ...styles.button,
                    width: '100%',
                    background: '#fd7e14',
                    ...(loading || !userStats.canUnstake ? styles.buttonDisabled : {})
                  }}
                >
                  {loading ? 'Unstaking...' : 'Finaliser Unstaking'}
                </button>
              </div>
              
              {/* Rewards */}
              <div style={styles.card}>
                <h3 style={{...styles.cardTitle, color: '#28a745'}}>🎁 Rewards</h3>
                <p style={{color: '#666', marginBottom: '10px'}}>Rewards disponibles:</p>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745', marginBottom: '20px'}}>
                  {parseFloat(userStats.pendingRewards).toFixed(4)} ORNE
                </p>
                <button
                  onClick={claimRewards}
                  disabled={loading || parseFloat(userStats.pendingRewards) === 0}
                  style={{
                    ...styles.button,
                    width: '100%',
                    background: '#28a745',
                    ...(loading || parseFloat(userStats.pendingRewards) === 0 ? styles.buttonDisabled : {})
                  }}
                >
                  {loading ? 'Récupération...' : 'Récupérer Rewards'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
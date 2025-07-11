import React, { useState, useEffect } from 'react';

// Configuration des contrats
const CONFIG = {
  ORNE_TOKEN_ADDRESS: "0xaf3acac72af103Dc0adeD53F1CC08638f856Bf8F",
  STAKING_VAULT_ADDRESS: "0xb1dB3F94951437572FFa422fD4605c1554817267",
  NETWORK_ID: 421614, // Arbitrum Sepolia testnet
  NETWORK_NAME: "Arbitrum Sepolia"
};

// Styles CSS
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
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px'
  },
  maxButton: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    minWidth: '60px'
  },
  percentageButtons: {
    display: 'flex',
    gap: '5px',
    marginBottom: '15px',
    flexWrap: 'wrap'
  },
  percentageButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500'
  },
  balanceInfo: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '15px',
    fontStyle: 'italic'
  },
  smartStakeButton: {
    background: 'linear-gradient(45deg, #28a745, #20c997)',
    color: 'white',
    border: 'none',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%'
  },
  infoBox: {
    marginTop: '15px',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.4'
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
  
  // Fonction pour encoder les paramètres uint256
  const encodeUint256 = (value) => {
    const bigIntValue = window.BigInt(Math.floor(parseFloat(value) * 1e18));
    const hex = bigIntValue.toString(16);
    return hex.padStart(64, '0');
  };
  
  // Fonction pour encoder les adresses
  const encodeAddress = (address) => {
    return address.slice(2).toLowerCase().padStart(64, '0');
  };
  
  // Fonction pour décoder les résultats
  const decodeResult = (result, type) => {
    if (!result || result === '0x') return '0';
    
    const hex = result.slice(2);
    
    if (type === 'uint256') {
      const value = window.BigInt('0x' + hex);
      return (Number(value) / 1e18).toFixed(4);
    }
    
    if (type === 'bool') {
      return hex === '0'.repeat(63) + '1';
    }
    
    return '0';
  };
  
  // Fonction pour appeler un contrat en lecture
  const callContract = async (contractAddress, functionSignature, params = []) => {
    try {
      const signatures = {
        'balanceOf(address)': '0x70a08231',
        'allowance(address,address)': '0xdd62ed3e',
        'stakes(address)': '0x16934fc4',
        'pendingRewards(address)': '0xf40f0f52',
        'pendingUnstakes(address)': '0x3e4f49e6',
        'canUnstake(address)': '0x0dcdfbf3',
        'timeUntilUnstake(address)': '0x5c975abb',
        'co2OffsetOf(address)': '0x8b7afe2e',
        'co2PerOrne()': '0x9dc29fac',
        'totalStaked()': '0x817b1cd2'
      };
      
      const methodId = signatures[functionSignature];
      let data = methodId;
      
      if (params.length === 1 && typeof params[0] === 'string') {
        const address = params[0].slice(2).padStart(64, '0');
        data = methodId + address;
      }
      
      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: contractAddress,
          data: data
        }, 'latest']
      });
      
      return result;
    } catch (error) {
      console.error('Erreur appel contrat:', error);
      return '0x';
    }
  };
  
  // Fonction pour envoyer des transactions avec estimation de gas automatique
  const sendTransaction = async (to, data, value = '0x0') => {
    if (!window.ethereum) throw new Error('MetaMask non disponible');
    
    try {
      // D'abord, estimer le gas nécessaire
      const gasEstimate = await window.ethereum.request({
        method: 'eth_estimateGas',
        params: [{
          to: to,
          from: wallet.address,
          data: data,
          value: value
        }]
      });
      
      console.log('Gas estimé:', parseInt(gasEstimate, 16));
      
      // Ajouter une marge de sécurité de 20%
      const gasWithMargin = Math.floor(parseInt(gasEstimate, 16) * 1.2);
      
      console.log('Gas avec marge:', gasWithMargin);
      
      const transactionParameters = {
        to: to,
        from: wallet.address,
        data: data,
        value: value,
        gas: '0x' + gasWithMargin.toString(16),
        // Laisser MetaMask gérer le gasPrice automatiquement
      };
      
      console.log('Paramètres de transaction:', transactionParameters);
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      
      return txHash;
    } catch (error) {
      console.error('Erreur sendTransaction:', error);
      throw error;
    }
  };
  
  // Fonction pour attendre qu'une transaction soit confirmée
  const waitForTransaction = async (txHash, description = 'Transaction') => {
    return new Promise((resolve, reject) => {
      const checkTx = async () => {
        try {
          const receipt = await window.ethereum.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash]
          });
          
          if (receipt) {
            console.log(`${description} confirmée:`, receipt);
            resolve(receipt);
          } else {
            setTimeout(checkTx, 2000);
          }
        } catch (error) {
          console.error(`Erreur lors de la vérification de ${description}:`, error);
          reject(error);
        }
      };
      
      checkTx();
    });
  };
  
  // Fonction pour vérifier l'allowance actuelle
  const getCurrentAllowance = async () => {
    try {
      const ownerAddress = encodeAddress(wallet.address);
      const spenderAddress = encodeAddress(CONFIG.STAKING_VAULT_ADDRESS);
      const data = '0xdd62ed3e' + ownerAddress + spenderAddress;
      
      const allowanceHex = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: CONFIG.ORNE_TOKEN_ADDRESS,
          data: data
        }, 'latest']
      });
      
      const allowance = decodeResult(allowanceHex, 'uint256');
      return parseFloat(allowance);
    } catch (error) {
      console.error('Erreur getCurrentAllowance:', error);
      return 0;
    }
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
  
  // Charger les données utilisateur
  const loadUserData = React.useCallback(async () => {
    if (!wallet.connected) return;
    
    try {
      console.log('Chargement des données utilisateur...');
      
      const [
        orneBalanceHex,
        stakeInfoHex,
        pendingRewardsHex,
        pendingUnstakesHex,
        userCO2Hex,
        canUnstakeHex,
        timeUntilUnstakeHex,
        co2PerOrneHex,
        totalStakedHex
      ] = await Promise.all([
        callContract(CONFIG.ORNE_TOKEN_ADDRESS, 'balanceOf(address)', [wallet.address]),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'stakes(address)', [wallet.address]),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'pendingRewards(address)', [wallet.address]),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'pendingUnstakes(address)', [wallet.address]),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'co2OffsetOf(address)', [wallet.address]),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'canUnstake(address)', [wallet.address]),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'timeUntilUnstake(address)', [wallet.address]),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'co2PerOrne()', []),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'totalStaked()', [])
      ]);
      
      const orneBalance = decodeResult(orneBalanceHex, 'uint256');
      const pendingRewards = decodeResult(pendingRewardsHex, 'uint256');
      const pendingUnstakes = decodeResult(pendingUnstakesHex, 'uint256');
      const canUnstake = decodeResult(canUnstakeHex, 'bool');
      const totalStaked = decodeResult(totalStakedHex, 'uint256');
      
      let stakedBalance = '0';
      if (stakeInfoHex && stakeInfoHex.length > 2) {
        const stakedHex = stakeInfoHex.slice(2, 66);
        stakedBalance = decodeResult('0x' + stakedHex, 'uint256');
      }
      
      let userCO2Offset = '0';
      if (userCO2Hex && userCO2Hex !== '0x') {
        const co2Value = Number(window.BigInt(userCO2Hex)) / 1e18 / 1000;
        userCO2Offset = co2Value.toFixed(3);
      }
      
      let co2PerOrne = '0';
      if (co2PerOrneHex && co2PerOrneHex !== '0x') {
        const co2Value = Number(window.BigInt(co2PerOrneHex)) / 1e18 * 1000;
        co2PerOrne = co2Value.toFixed(1);
      }
      
      let timeUntilUnstake = 0;
      if (timeUntilUnstakeHex && timeUntilUnstakeHex !== '0x') {
        timeUntilUnstake = Number(window.BigInt(timeUntilUnstakeHex));
      }
      
      setUserStats({
        orneBalance,
        stakedBalance,
        pendingRewards,
        unstakingAvailable: pendingUnstakes,
        userCO2Offset,
        canUnstake,
        timeUntilUnstake
      });
      
      setGlobalStats({
        totalStaked,
        co2PerOrne
      });
      
    } catch (error) {
      console.error('Erreur de chargement des données:', error);
      
      setUserStats({
        orneBalance: '0',
        stakedBalance: '0',
        pendingRewards: '0',
        unstakingAvailable: '0',
        userCO2Offset: '0',
        canUnstake: false,
        timeUntilUnstake: 0
      });
      
      setGlobalStats({
        totalStaked: '0',
        co2PerOrne: '0'
      });
    }
  }, [wallet.connected, wallet.address]);
  
  // Fonction pour remplir automatiquement le montant max
  const fillMaxAmount = () => {
    const maxAmount = parseFloat(userStats.orneBalance);
    
    if (maxAmount <= 0) {
      showStatus('Aucun token ORNE disponible', 'error');
      return;
    }
    
    const amountToFill = Math.max(maxAmount - 0.001, 0);
    
    if (amountToFill <= 0) {
      showStatus('Solde insuffisant', 'error');
      return;
    }
    
    setStakeAmount(amountToFill.toString());
    showStatus(`✅ Montant maximum défini: ${amountToFill.toFixed(4)} ORNE`, 'success');
  };
  
  // Fonction pour calculer le pourcentage du solde
  const fillPercentage = (percentage) => {
    const maxAmount = parseFloat(userStats.orneBalance);
    
    if (maxAmount <= 0) {
      showStatus('Aucun token ORNE disponible', 'error');
      return;
    }
    
    const amountToFill = (maxAmount * percentage / 100);
    
    if (amountToFill <= 0) {
      showStatus('Solde insuffisant', 'error');
      return;
    }
    
    setStakeAmount(amountToFill.toFixed(4));
    showStatus(`✅ ${percentage}% du solde défini: ${amountToFill.toFixed(4)} ORNE`, 'success');
  };
  
  // Fonction de staking intelligent
  const smartStake = async () => {
    if (!stakeAmount || stakeAmount <= 0) {
      showStatus('Veuillez entrer un montant valide', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const amountToStake = parseFloat(stakeAmount);
      
      console.log('=== STAKING INTELLIGENT ===');
      console.log('Montant à staker:', amountToStake, 'ORNE');
      
      // Étape 1: Vérifier l'allowance actuelle
      showStatus('🔍 Vérification de l\'allowance...', 'warning');
      const currentAllowance = await getCurrentAllowance();
      
      console.log('Allowance actuelle:', currentAllowance, 'ORNE');
      
      // Étape 2: Approbation si nécessaire
      if (currentAllowance < amountToStake) {
        showStatus('📝 Approbation des tokens en cours...', 'warning');
        
        const approvalAmount = Math.max(amountToStake * 2, 1000);
        
        const spenderAddress = encodeAddress(CONFIG.STAKING_VAULT_ADDRESS);
        const amount = encodeUint256(approvalAmount.toString());
        const approvalData = '0x095ea7b3' + spenderAddress + amount;
        
        console.log('Approbation pour', approvalAmount, 'ORNE');
        
        const approvalTxHash = await sendTransaction(CONFIG.ORNE_TOKEN_ADDRESS, approvalData);
        showStatus(`⏳ Approbation envoyée (${approvalTxHash.slice(0, 10)}...)`, 'warning');
        
        await waitForTransaction(approvalTxHash, 'Approbation');
        showStatus('✅ Approbation confirmée !', 'success');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        console.log('✅ Allowance suffisante, pas besoin d\'approbation');
      }
      
      // Étape 3: Staking
      showStatus('🚀 Staking en cours...', 'warning');
      
      const stakingAmount = encodeUint256(stakeAmount);
      const stakingData = '0xa694fc3a' + stakingAmount;
      
      console.log('Staking de', stakeAmount, 'ORNE');
      
      const stakingTxHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, stakingData);
      showStatus(`⏳ Staking envoyé (${stakingTxHash.slice(0, 10)}...)`, 'warning');
      
      await waitForTransaction(stakingTxHash, 'Staking');
      
      showStatus(`🎉 Staking de ${amountToStake} ORNE réussi !`, 'success');
      setStakeAmount('');
      
      setTimeout(() => loadUserData(), 3000);
      
    } catch (error) {
      console.error('Erreur smart staking:', error);
      showStatus('❌ Erreur: ' + (error.message || 'Inconnue'), 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour remplir automatiquement le montant max pour unstaking
  const fillMaxUnstakeAmount = () => {
    const maxAmount = parseFloat(userStats.stakedBalance);
    
    if (maxAmount <= 0) {
      showStatus('Aucun token ORNE staké disponible', 'error');
      return;
    }
    
    const amountToFill = Math.max(maxAmount - 0.001, 0);
    
    if (amountToFill <= 0) {
      showStatus('Solde staké insuffisant', 'error');
      return;
    }
    
    setUnstakeAmount(amountToFill.toString());
    showStatus(`✅ Montant maximum défini: ${amountToFill.toFixed(4)} ORNE`, 'success');
  };
  
  // Fonction pour calculer le pourcentage du solde staké
  const fillUnstakePercentage = (percentage) => {
    const maxAmount = parseFloat(userStats.stakedBalance);
    
    if (maxAmount <= 0) {
      showStatus('Aucun token ORNE staké disponible', 'error');
      return;
    }
    
    const amountToFill = (maxAmount * percentage / 100);
    
    if (amountToFill <= 0) {
      showStatus('Solde staké insuffisant', 'error');
      return;
    }
    
    setUnstakeAmount(amountToFill.toFixed(4));
    showStatus(`✅ ${percentage}% du solde staké défini: ${amountToFill.toFixed(4)} ORNE`, 'success');
  };

  // Diagnostic complet des conditions d'unstaking
  const diagnosticUnstaking = async () => {
    if (!unstakeAmount || unstakeAmount <= 0) {
      showStatus('Veuillez entrer un montant valide', 'error');
      return;
    }
    
    try {
      console.log('=== DIAGNOSTIC COMPLET UNSTAKING ===');
      console.log('Montant à unstaker:', unstakeAmount, 'ORNE');
      console.log('Wallet:', wallet.address);
      console.log('Contract:', CONFIG.STAKING_VAULT_ADDRESS);
      
      // 1. Vérifier les données de staking actuelles
      const stakeInfoHex = await callContract(CONFIG.STAKING_VAULT_ADDRESS, 'stakes(address)', [wallet.address]);
      console.log('Stake info brute:', stakeInfoHex);
      
      let stakedAmount = 0;
      let stakeTimestamp = 0;
      
      if (stakeInfoHex && stakeInfoHex.length > 2) {
        // Décoder toutes les données du stake
        const amount = stakeInfoHex.slice(2, 66); // Premiers 32 bytes
        const timestamp = stakeInfoHex.slice(66, 130); // Seconds 32 bytes
        const rewardDebt = stakeInfoHex.slice(130, 194); // Troisième 32 bytes
        const co2Baseline = stakeInfoHex.slice(194, 258); // Quatrième 32 bytes
        
        console.log('Stake amount (hex):', amount);
        console.log('Stake timestamp (hex):', timestamp);
        console.log('Reward debt (hex):', rewardDebt);
        console.log('CO2 baseline (hex):', co2Baseline);
        
        stakedAmount = Number(window.BigInt('0x' + amount)) / 1e18;
        stakeTimestamp = Number(window.BigInt('0x' + timestamp));
        
        console.log('Montant staké:', stakedAmount, 'ORNE');
        console.log('Timestamp du stake:', stakeTimestamp, new Date(stakeTimestamp * 1000));
      }
      
      // 2. Vérifier les unstakings en cours
      const pendingUnstakesHex = await callContract(CONFIG.STAKING_VAULT_ADDRESS, 'pendingUnstakes(address)', [wallet.address]);
      console.log('Pending unstakes (hex):', pendingUnstakesHex);
      
      const pendingAmount = pendingUnstakesHex && pendingUnstakesHex !== '0x' ? 
        Number(window.BigInt(pendingUnstakesHex)) / 1e18 : 0;
      console.log('Unstaking déjà en cours:', pendingAmount, 'ORNE');
      
      // 3. Vérifier si on peut unstaker
      const canUnstakeHex = await callContract(CONFIG.STAKING_VAULT_ADDRESS, 'canUnstake(address)', [wallet.address]);
      console.log('Can unstake (hex):', canUnstakeHex);
      
      // 4. Vérifier le temps restant
      const timeUntilUnstakeHex = await callContract(CONFIG.STAKING_VAULT_ADDRESS, 'timeUntilUnstake(address)', [wallet.address]);
      console.log('Time until unstake (hex):', timeUntilUnstakeHex);
      
      const timeRemaining = timeUntilUnstakeHex && timeUntilUnstakeHex !== '0x' ?
        Number(window.BigInt(timeUntilUnstakeHex)) : 0;
      console.log('Temps restant:', timeRemaining, 'secondes');
      
      // 5. Analyse du problème principal
      console.log('=== ANALYSE DU PROBLÈME ===');
      
      if (stakeTimestamp > 0) {
        console.log('Timestamp du stake:', new Date(stakeTimestamp * 1000));
        console.log('Maintenant:', new Date());
        console.log('Différence:', (Date.now() / 1000) - stakeTimestamp, 'secondes');
        
        // Vérifier si le timestamp est cohérent
        const now = Math.floor(Date.now() / 1000);
        if (stakeTimestamp > now + 3600) { // Plus d'1 heure dans le futur
          console.log('🚨 PROBLÈME: Timestamp du stake semble dans le futur');
          console.log('🚨 Stake timestamp:', stakeTimestamp);
          console.log('🚨 Timestamp actuel:', now);
          console.log('🚨 Différence:', stakeTimestamp - now, 'secondes');
          
          showStatus('⚠️ Timestamp du stake semble incorrect', 'warning');
        }
      }
      
      // 6. Test simple avec récupération des rewards d'abord
      console.log('=== TEST RÉCUPÉRATION REWARDS ===');
      const pendingRewardsHex = await callContract(CONFIG.STAKING_VAULT_ADDRESS, 'pendingRewards(address)', [wallet.address]);
      const pendingRewards = pendingRewardsHex && pendingRewardsHex !== '0x' ? 
        Number(window.BigInt(pendingRewardsHex)) / 1e18 : 0;
      
      console.log('Rewards en attente:', pendingRewards, 'ORNE');
      
      if (pendingRewards > 0) {
        console.log('💡 RECOMMANDATION: Récupérez vos rewards avant d\'unstaker');
        showStatus(`💡 Récupérez d'abord vos ${pendingRewards.toFixed(4)} ORNE de rewards`, 'warning');
      }
      
      // 7. Vérifier les montants
      const requestAmount = parseFloat(unstakeAmount);
      const stakedBalance = parseFloat(userStats.stakedBalance);
      
      // 8. Vérifier les montants
      console.log('=== VÉRIFICATIONS ===');
      console.log('Montant demandé:', requestAmount, 'ORNE');
      console.log('Montant staké:', stakedBalance, 'ORNE');
      console.log('Montant déjà en unstaking:', pendingAmount, 'ORNE');
      console.log('Montant disponible pour unstaking:', stakedBalance - pendingAmount, 'ORNE');
      
      // 9. Diagnostiquer le problème
      let problemes = [];
      
      if (requestAmount > stakedBalance) {
        problemes.push('❌ Montant demandé supérieur au montant staké');
      }
      
      if (requestAmount > (stakedBalance - pendingAmount)) {
        problemes.push('❌ Montant demandé supérieur au montant disponible (unstaking déjà en cours)');
      }
      
      if (requestAmount <= 0) {
        problemes.push('❌ Montant demandé invalide');
      }
      
      if (pendingAmount > 0 && timeRemaining > 0) {
        problemes.push('⚠️ Un unstaking est déjà en cours');
      }
      
      // 10. Test de la fonction avec un montant minimal
      console.log('=== TEST AVEC MONTANT MINIMAL ===');
      const testAmount = 0.1; // Test avec 0.1 ORNE
      console.log('Test avec montant minimal:', testAmount, 'ORNE');
      
      const testAmountHex = window.BigInt(Math.floor(testAmount * 1e18)).toString(16).padStart(64, '0');
      const testData = '0x745400c9' + testAmountHex;
      
      console.log('Test data:', testData);
      
      try {
        const testGasEstimate = await window.ethereum.request({
          method: 'eth_estimateGas',
          params: [{
            to: CONFIG.STAKING_VAULT_ADDRESS,
            from: wallet.address,
            data: testData,
            value: '0x0'
          }]
        });
        
        console.log('✅ Test avec montant minimal réussi, gas estimé:', parseInt(testGasEstimate, 16));
        showStatus(`✅ Test avec ${testAmount} ORNE réussi ! Le problème vient du montant.`, 'success');
        
      } catch (testError) {
        console.log('❌ Test avec montant minimal échoué:', testError.message);
        
        // Le problème n'est pas le montant, c'est plus profond
        console.log('=== ANALYSE APPROFONDIE ===');
        console.log('Le problème n\'est pas le montant mais probablement:');
        console.log('1. Rewards non récupérés');
        console.log('2. Problème de timing dans le contrat');
        console.log('3. Fonction requestUnstake désactivée');
        console.log('4. Problème de permissions');
        
        showStatus('❌ Problème dans le contrat lui-même', 'error');
      }
      
      if (problemes.length > 0) {
        console.log('=== PROBLÈMES IDENTIFIÉS ===');
        problemes.forEach(p => console.log(p));
      }
      
      // 8. Recommandations
      console.log('=== RECOMMANDATIONS ===');
      if (pendingAmount > 0) {
        console.log('💡 Vous avez déjà un unstaking en cours');
        console.log('💡 Attendez la fin du délai ou récupérez vos tokens');
      }
      
      if (requestAmount > stakedBalance * 0.8) {
        console.log('💡 Essayez avec un montant plus petit (ex: 50% du stake)');
      }
      
      console.log('💡 Vérifiez que vous n\'avez pas de rewards à récupérer avant l\'unstaking');
      
    } catch (error) {
      console.error('Erreur diagnostic:', error);
      showStatus('Erreur diagnostic: ' + error.message, 'error');
    }
  };

  // Test direct de la fonction requestUnstake pour déboguer
  const testUnstakeCall = async () => {
    if (!unstakeAmount || unstakeAmount <= 0) {
      showStatus('Veuillez entrer un montant valide', 'error');
      return;
    }
    
    try {
      console.log('=== TEST UNSTAKE CALL ===');
      console.log('Montant:', unstakeAmount, 'ORNE');
      console.log('Wallet:', wallet.address);
      console.log('Contract:', CONFIG.STAKING_VAULT_ADDRESS);
      
      // Vérifier que le contrat existe
      const code = await window.ethereum.request({
        method: 'eth_getCode',
        params: [CONFIG.STAKING_VAULT_ADDRESS, 'latest']
      });
      console.log('Contract code exists:', code !== '0x');
      
      // Vérifier le solde staké
      const stakeInfoHex = await callContract(CONFIG.STAKING_VAULT_ADDRESS, 'stakes(address)', [wallet.address]);
      console.log('Stake info:', stakeInfoHex);
      
      const stakedBalance = parseFloat(userStats.stakedBalance);
      const requestAmount = parseFloat(unstakeAmount);
      
      console.log('Solde staké:', stakedBalance);
      console.log('Montant demandé:', requestAmount);
      
      if (requestAmount > stakedBalance) {
        showStatus('Erreur: Montant supérieur au solde staké', 'error');
        return;
      }
      
      // Tester l'encodage
      const amount = encodeUint256(unstakeAmount);
      console.log('Montant encodé:', amount);
      
      // Method ID pour requestUnstake(uint256)
      const methodId = '0x745400c9';
      const data = methodId + amount;
      
      console.log('Method ID:', methodId);
      console.log('Data complète:', data);
      console.log('Data length:', data.length);
      
      // Tester l'estimation de gas
      try {
        const gasEstimate = await window.ethereum.request({
          method: 'eth_estimateGas',
          params: [{
            to: CONFIG.STAKING_VAULT_ADDRESS,
            from: wallet.address,
            data: data,
            value: '0x0'
          }]
        });
        
        console.log('Gas estimé:', parseInt(gasEstimate, 16));
        showStatus(`Gas estimé: ${parseInt(gasEstimate, 16)} unités`, 'success');
        
      } catch (gasError) {
        console.error('Erreur estimation gas:', gasError);
        showStatus('Erreur estimation gas: ' + gasError.message, 'error');
        
        // Tester avec un gas fixe très élevé pour voir si c'est un problème de gas ou de fonction
        console.log('Test avec gas fixe élevé...');
        
        const transactionParameters = {
          to: CONFIG.STAKING_VAULT_ADDRESS,
          from: wallet.address,
          data: data,
          value: '0x0',
          gas: '0x' + (1000000).toString(16), // 1M gas
        };
        
        try {
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
          });
          
          showStatus(`Transaction envoyée avec gas fixe: ${txHash.slice(0, 10)}...`, 'success');
          
        } catch (txError) {
          console.error('Erreur avec gas fixe:', txError);
          showStatus('Erreur avec gas fixe: ' + txError.message, 'error');
        }
      }
      
    } catch (error) {
      console.error('Erreur test:', error);
      showStatus('Erreur test: ' + error.message, 'error');
    }
  };

  // Demander l'unstaking avec approche simplifiée
  const requestUnstake = async () => {
    if (!unstakeAmount || unstakeAmount <= 0) {
      showStatus('Veuillez entrer un montant valide', 'error');
      return;
    }
    
    try {
      setLoading(true);
      showStatus('Demande d\'unstaking en cours...', 'warning');
      
      // Vérifications préliminaires
      const stakedBalance = parseFloat(userStats.stakedBalance);
      const requestAmount = parseFloat(unstakeAmount);
      
      if (requestAmount > stakedBalance) {
        showStatus('Erreur: Montant supérieur au solde staké', 'error');
        return;
      }
      
      // Encodage simplifié avec vérification
      const amountWei = parseEther(unstakeAmount);
      const amountHex = amountWei.toString(16).padStart(64, '0');
      
      console.log('Montant en Wei:', amountWei.toString());
      console.log('Montant en hex:', amountHex);
      
      const data = '0x745400c9' + amountHex;
      
      console.log('Data finale:', data);
      
      // Essayer d'abord avec MetaMask qui gère tout automatiquement
      try {
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            to: CONFIG.STAKING_VAULT_ADDRESS,
            from: wallet.address,
            data: data,
            value: '0x0'
            // Pas de gas ni gasPrice - laisser MetaMask gérer
          }]
        });
        
        showStatus(`⏳ Demande d'unstaking envoyée (${txHash.slice(0, 10)}...)`, 'warning');
        
        // Attendre la confirmation
        await waitForTransaction(txHash, 'Demande d\'unstaking');
        
        showStatus(`✅ Demande d'unstaking confirmée ! Attendez 21 jours.`, 'success');
        setUnstakeAmount('');
        
        setTimeout(() => loadUserData(), 3000);
        
      } catch (txError) {
        console.error('Erreur transaction:', txError);
        
        // Si l'erreur est "intrinsic gas too low", essayer avec gas fixe
        if (txError.message.includes('intrinsic gas too low')) {
          console.log('Tentative avec gas fixe...');
          
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
              to: CONFIG.STAKING_VAULT_ADDRESS,
              from: wallet.address,
              data: data,
              value: '0x0',
              gas: '0x' + (800000).toString(16), // 800k gas
            }]
          });
          
          showStatus(`⏳ Demande d'unstaking envoyée (${txHash.slice(0, 10)}...)`, 'warning');
          await waitForTransaction(txHash, 'Demande d\'unstaking');
          showStatus(`✅ Demande d'unstaking confirmée ! Attendez 21 jours.`, 'success');
          setUnstakeAmount('');
          setTimeout(() => loadUserData(), 3000);
          
        } else {
          throw txError;
        }
      }
      
    } catch (error) {
      console.error('Erreur de demande d\'unstaking:', error);
      showStatus('Erreur: ' + (error.message || 'Inconnue'), 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Finaliser l'unstaking avec estimation de gas automatique
  const unstakeTokens = async () => {
    try {
      setLoading(true);
      showStatus('Récupération des tokens en cours...', 'warning');
      
      const data = '0x2e17de78';
      
      console.log('Données de récupération:', data);
      
      const txHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, data);
      
      showStatus(`⏳ Récupération envoyée (${txHash.slice(0, 10)}...)`, 'warning');
      
      // Attendre la confirmation
      await waitForTransaction(txHash, 'Récupération des tokens');
      
      showStatus(`🎉 Tokens récupérés avec succès !`, 'success');
      setTimeout(() => loadUserData(), 3000);
      
    } catch (error) {
      console.error('Erreur de récupération:', error);
      showStatus('Erreur: ' + (error.message || 'Inconnue'), 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Récupérer les rewards
  const claimRewards = async () => {
    try {
      setLoading(true);
      showStatus('Récupération des rewards...', 'warning');
      
      const data = '0x372500ab';
      const txHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, data);
      
      showStatus(`Rewards récupérés ! Hash: ${txHash.slice(0, 10)}...`, 'success');
      setTimeout(() => loadUserData(), 5000);
      
    } catch (error) {
      console.error('Erreur de récupération des rewards:', error);
      showStatus('Erreur: ' + (error.message || 'Inconnue'), 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Déconnecter le wallet
  const disconnectWallet = () => {
    setWallet({ connected: false, address: '', balance: '0', network: '' });
    setUserStats({
      orneBalance: '0',
      stakedBalance: '0',
      pendingRewards: '0',
      unstakingAvailable: '0',
      userCO2Offset: '0',
      canUnstake: false,
      timeUntilUnstake: 0
    });
    showStatus('Wallet déconnecté', 'success');
  };
  
  // Afficher un message de statut
  const showStatus = (message, type) => {
    setStatus({ message, type });
    setTimeout(() => setStatus({ message: '', type: '' }), 5000);
  };
  
  // Formatter le temps restant
  const formatTimeRemaining = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  // Fonction pour formater une date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Fonction pour calculer la date de fin d'unstaking
  const getUnstakeEndDate = () => {
    if (userStats.timeUntilUnstake <= 0) return null;
    
    const now = Math.floor(Date.now() / 1000);
    const endTimestamp = now + userStats.timeUntilUnstake;
    return endTimestamp;
  };
  
  // Fonction pour calculer la date de début d'unstaking
  const getUnstakeStartDate = () => {
    if (userStats.timeUntilUnstake <= 0) return null;
    
    const now = Math.floor(Date.now() / 1000);
    const startTimestamp = now - (21 * 24 * 60 * 60) + userStats.timeUntilUnstake;
    return startTimestamp;
  };
  
  // Charger les données au démarrage
  useEffect(() => {
    if (wallet.connected) {
      loadUserData();
      const interval = setInterval(loadUserData, 30000);
      return () => clearInterval(interval);
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
              {/* Staking Intelligent */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>💰 Staking Intelligent</h3>
                
                <div style={styles.balanceInfo}>
                  💳 Solde disponible: <strong>{parseFloat(userStats.orneBalance).toFixed(4)} ORNE</strong>
                </div>
                
                <div>
                  <label style={styles.label}>Montant à staker</label>
                  <div style={styles.inputContainer}>
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.0"
                      step="0.1"
                      style={{...styles.input, marginBottom: '0', flex: '1'}}
                    />
                    <button
                      onClick={fillMaxAmount}
                      disabled={loading || parseFloat(userStats.orneBalance) <= 0}
                      style={{
                        ...styles.maxButton,
                        ...(loading || parseFloat(userStats.orneBalance) <= 0 ? 
                          {opacity: 0.5, cursor: 'not-allowed'} : {})
                      }}
                    >
                      MAX
                    </button>
                  </div>
                </div>
                
                <div style={styles.percentageButtons}>
                  {[25, 50, 75, 100].map(percentage => (
                    <button
                      key={percentage}
                      onClick={() => fillPercentage(percentage)}
                      disabled={loading}
                      style={{
                        ...styles.percentageButton,
                        ...(percentage === 100 ? {background: '#28a745'} : {}),
                        ...(loading ? {opacity: 0.5, cursor: 'not-allowed'} : {})
                      }}
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={smartStake}
                  disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                  style={{
                    ...styles.smartStakeButton,
                    ...(loading || !stakeAmount || parseFloat(stakeAmount) <= 0 ? 
                      {opacity: 0.5, cursor: 'not-allowed', background: '#6c757d'} : {})
                  }}
                >
                  {loading ? '⏳ Staking en cours...' : '🚀 Staking Intelligent'}
                </button>
                
                <div style={styles.infoBox}>
                  <strong>💡 Staking Intelligent :</strong><br />
                  • Vérifie automatiquement l'allowance<br />
                  • Approuve les tokens si nécessaire<br />
                  • Stake en une seule action<br />
                  • Attend les confirmations
                </div>
              </div>
              
              {/* Unstaking */}
              <div style={styles.card}>
                <h3 style={{...styles.cardTitle, color: '#dc3545'}}>📤 Unstaking</h3>
                
                <div style={styles.balanceInfo}>
                  🔒 Solde staké: <strong>{parseFloat(userStats.stakedBalance).toFixed(4)} ORNE</strong>
                </div>
                
                {/* Affichage de l'unstaking en cours */}
                {parseFloat(userStats.unstakingAvailable) > 0 && (
                  <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{margin: '0 0 10px 0', color: '#856404'}}>⏳ Unstaking en cours</h4>
                    <p style={{margin: '5px 0', fontSize: '14px', color: '#856404'}}>
                      <strong>Montant:</strong> {parseFloat(userStats.unstakingAvailable).toFixed(4)} ORNE
                    </p>
                    {getUnstakeStartDate() && (
                      <p style={{margin: '5px 0', fontSize: '14px', color: '#856404'}}>
                        <strong>Démarré le:</strong> {formatDate(getUnstakeStartDate())}
                      </p>
                    )}
                    {getUnstakeEndDate() && (
                      <p style={{margin: '5px 0', fontSize: '14px', color: '#856404'}}>
                        <strong>Disponible le:</strong> {formatDate(getUnstakeEndDate())}
                      </p>
                    )}
                    {userStats.timeUntilUnstake > 0 && (
                      <p style={{margin: '5px 0', fontSize: '14px', color: '#856404'}}>
                        <strong>Temps restant:</strong> {formatTimeRemaining(userStats.timeUntilUnstake)}
                      </p>
                    )}
                    <button
                      onClick={unstakeTokens}
                      disabled={loading || !userStats.canUnstake}
                      style={{
                        ...styles.button,
                        width: '100%',
                        marginTop: '10px',
                        background: userStats.canUnstake ? '#28a745' : '#6c757d',
                        ...(loading || !userStats.canUnstake ? styles.buttonDisabled : {})
                      }}
                    >
                      {loading ? '⏳ Récupération...' : 
                       userStats.canUnstake ? '🎉 Récupérer mes tokens' : 
                       '⏱️ Pas encore disponible'}
                    </button>
                  </div>
                )}
                
                {/* Formulaire de demande d'unstaking */}
                <div>
                  <label style={styles.label}>Montant à unstaker</label>
                  <div style={styles.inputContainer}>
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="0.0"
                      step="0.1"
                      style={{...styles.input, marginBottom: '0', flex: '1'}}
                    />
                    <button
                      onClick={fillMaxUnstakeAmount}
                      disabled={loading || parseFloat(userStats.stakedBalance) <= 0}
                      style={{
                        ...styles.maxButton,
                        ...(loading || parseFloat(userStats.stakedBalance) <= 0 ? 
                          {opacity: 0.5, cursor: 'not-allowed'} : {})
                      }}
                    >
                      MAX
                    </button>
                  </div>
                </div>
                
                <div style={styles.percentageButtons}>
                  {[25, 50, 75, 100].map(percentage => (
                    <button
                      key={percentage}
                      onClick={() => fillUnstakePercentage(percentage)}
                      disabled={loading}
                      style={{
                        ...styles.percentageButton,
                        ...(percentage === 100 ? {background: '#dc3545'} : {}),
                        ...(loading ? {opacity: 0.5, cursor: 'not-allowed'} : {})
                      }}
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>
                
                <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                  <button
                    onClick={requestUnstake}
                    disabled={loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                    style={{
                      ...styles.buttonDanger,
                      flex: '1',
                      ...(loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0 ? 
                        styles.buttonDisabled : {})
                    }}
                  >
                    {loading ? '⏳ Demande...' : '📤 Demander Unstaking'}
                  </button>
                  
                  <button
                    onClick={diagnosticUnstaking}
                    disabled={loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                    style={{
                      ...styles.button,
                      background: '#17a2b8',
                      flex: '0 0 auto',
                      padding: '15px 20px',
                      ...(loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0 ? 
                        styles.buttonDisabled : {})
                    }}
                  >
                    🔍 Diagnostic
                  </button>
                </div>
                
                <div style={styles.infoBox}>
                  <strong>⚠️ Processus d'unstaking :</strong><br />
                  • Demandez l'unstaking du montant souhaité<br />
                  • Attendez 21 jours (délai de sécurité)<br />
                  • Récupérez vos tokens quand disponibles<br />
                  • Pendant l'attente, vous ne gagnez plus de rewards
                </div>
              </div>
              
              {/* Rewards */}
              <div style={styles.card}>
                <h3 style={{...styles.cardTitle, color: '#28a745'}}>🎁 Rewards</h3>
                <div style={{marginBottom: '20px'}}>
                  <p style={{color: '#666', marginBottom: '10px'}}>Rewards disponibles:</p>
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745', marginBottom: '0'}}>
                    {parseFloat(userStats.pendingRewards).toFixed(4)} ORNE
                  </p>
                </div>
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
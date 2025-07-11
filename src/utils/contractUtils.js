import { CONFIG, FUNCTION_SIGNATURES } from '../config/config';
import { ethers } from 'ethers';

// Utilitaires de formatage
export const formatEther = (value) => {
  if (!value) return '0';
  return (Number(value) / 1e18).toFixed(4);
};

export const parseEther = (value) => {
  return window.BigInt(Math.floor(parseFloat(value) * 1e18));
};

export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && window.ethereum;
};

// Ajout d'un provider dédié pour bypasser les RPC buggés/metamask
const FORCED_RPC_URL = 'https://arb-sepolia.g.alchemy.com/v2/-ofb30ntFCdQjf6j0VbjwHdTu7Yubcw5';
const forcedProvider = new ethers.JsonRpcProvider(FORCED_RPC_URL);

// Fonctions d'encodage
export const encodeUint256 = (value) => {
  // Convertir en wei (multiplier par 1e18) pour les montants de tokens
  const bigIntValue = window.BigInt(Math.floor(parseFloat(value) * 1e18));
  const hex = bigIntValue.toString(16);
  return hex.padStart(64, '0');
};

// Fonction spéciale pour l'admin qui n'a pas besoin de conversion wei
export const encodeUint256Admin = (value) => {
  // Pour les fonctions admin, ne pas multiplier par 1e18
  const bigIntValue = window.BigInt(Math.floor(parseFloat(value)));
  const hex = bigIntValue.toString(16);
  return hex.padStart(64, '0');
};

export const encodeAddress = (address) => {
  return address.slice(2).toLowerCase().padStart(64, '0');
};

// Fonctions de décodage
export const decodeResult = (result, type) => {
  if (!result || result === '0x') return '0';
  
  const hex = result.slice(2);
  
  if (type === 'uint256') {
    const value = window.BigInt('0x' + hex);
    return (Number(value) / 1e18).toFixed(4);
  }
  
  if (type === 'bool') {
    return hex !== '0'.repeat(64);
  }
  
  return '0';
};

// Signature des méthodes
export const getMethodSignature = (functionName) => {
  return FUNCTION_SIGNATURES[functionName] || '0x00000000';
};

// Appel de contrat en lecture
export const callContract = async (contractAddress, functionSignature, params = []) => {
  try {
    const methodId = getMethodSignature(functionSignature);
    let data = methodId;
    
    if (params.length === 1 && typeof params[0] === 'string') {
      const address = params[0].slice(2).padStart(64, '0');
      data = methodId + address;
    }
    
    // Utilise le provider ethers.js forcé
    const tx = {
        to: contractAddress,
        data: data
    };
    const result = await forcedProvider.call(tx);
    return result;
  } catch (error) {
    console.error('Erreur appel contrat:', error);
    return '0x';
  }
};

// Envoi de transaction
export const sendTransaction = async (to, data, from, value = '0x0', provider = null) => {
  if (!provider) {
    // Fallback: MetaMask direct (pour compatibilité)
    if (!window.ethereum) throw new Error('Wallet provider not available');
  try {
    const transactionParameters = {
      to: to,
      from: from,
      data: data,
      value: value,
        gas: '0xf4240' // 1 000 000 en hexadécimal
    };
      console.log('Transaction data:', { to, from, data, value });
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    return txHash;
  } catch (error) {
      if (typeof error === 'object') {
        console.error('Erreur sendTransaction:', {
          message: error.message,
          code: error.code,
          data: error.data,
          stack: error.stack,
          error
        });
      } else {
    console.error('Erreur sendTransaction:', error);
      }
      throw error;
    }
  } else {
    // Utilisation du provider ethers (Web3Modal)
    try {
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to,
        data,
        value,
        gasLimit: 1000000
      });
      return tx.hash;
    } catch (error) {
      console.error('Erreur sendTransaction (Web3Modal):', error);
    throw error;
    }
  }
};

// Attendre la confirmation d'une transaction
export const waitForTransaction = async (txHash, description = 'Transaction') => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 60;
    
    const checkTx = async () => {
      try {
        attempts++;
        const receipt = await window.ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash]
        });
        
        if (receipt) {
          if (receipt.status === '0x1') {
            resolve(receipt);
          } else {
            reject(new Error(`Transaction échouée: ${txHash}`));
          }
        } else if (attempts >= maxAttempts) {
          reject(new Error(`Timeout: ${description} non confirmée`));
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

// Vérifier l'allowance actuelle
export const getCurrentAllowance = async (walletAddress) => {
  try {
    const ownerAddress = encodeAddress(walletAddress);
    const spenderAddress = encodeAddress(CONFIG.STAKING_VAULT_ADDRESS);
    const data = getMethodSignature('allowance(address,address)') + ownerAddress + spenderAddress;
    
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

// Fonctions utilitaires pour les dates
export const formatTimeRemaining = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
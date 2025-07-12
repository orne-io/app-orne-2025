/* global BigInt */
import { CONFIG, FUNCTION_SIGNATURES } from '../config/config';
import { Interface, parseEther, formatEther, toBigInt, JsonRpcProvider } from 'ethers';

// ERC20 Interface for proper encoding
const ERC20_ABI = [
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
];
const erc20Interface = new Interface(ERC20_ABI);

// Utilitaires de formatage
export const formatEtherFixed = (value) => {
  if (!value) return '0';
  return (Number(value) / 1e18).toFixed(4);
};

export const parseEtherFixed = (value) => {
  return BigInt(Math.floor(parseFloat(value) * 1e18));
};

export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && window.ethereum;
};

// Provider pour les appels en lecture
const getProvider = () => {
  const FALLBACK_RPC_URL = 'https://arb-mainnet.g.alchemy.com/v2/-ofb30ntFCdQjf6j0VbjwHdTu7Yubcw5';
  return new JsonRpcProvider(FALLBACK_RPC_URL);
};

// Fonctions d'encodage
export const encodeUint256 = (value) => {
  // Convertir en wei (multiplier par 1e18) pour les montants de tokens
  const bigIntValue = BigInt(Math.floor(parseFloat(value) * 1e18));
  const hex = bigIntValue.toString(16);
  return hex.padStart(64, '0');
};

// Fonction spéciale pour l'admin qui n'a pas besoin de conversion wei
export const encodeUint256Admin = (value) => {
  // Pour les fonctions admin, ne pas multiplier par 1e18
  const bigIntValue = BigInt(Math.floor(parseFloat(value)));
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
    const value = BigInt('0x' + hex);
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
      // S'assurer que l'adresse est correctement formatée
      const address = params[0].startsWith('0x') ? params[0].slice(2) : params[0];
      const paddedAddress = address.toLowerCase().padStart(64, '0');
      data = methodId + paddedAddress;
    }
    // Utilise le provider ethers direct
    const provider = getProvider();
    const result = await provider.call({
      to: contractAddress,
      data: data
    });
    return result;
  } catch (error) {
    console.error('Erreur appel contrat:', error);
    // Retourner une valeur par défaut au lieu de '0x' pour éviter les erreurs
    if (functionSignature.includes('co2PerOrne')) {
      return '0x0000000000000000000000000000000000000000000000000000000000000001'; // 1 gramme par défaut
    }
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }
};

// Envoi de transaction - version simplifiée avec MetaMask direct
export const sendTransaction = async (to, data, from, value = '0x0', provider = null) => {
  try {
    // Vérifier que MetaMask est disponible
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    // Utiliser l'adresse fournie en paramètre (depuis wagmi) ou récupérer depuis MetaMask
    let fromAddress = from;
    if (!fromAddress) {
      // Fallback: récupérer depuis MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }
      fromAddress = accounts[0];
    }
    console.log('Sending transaction from:', fromAddress);
    console.log('Transaction data:', { to, data, value });
    // Envoyer la transaction
    const hash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        to: to,
        from: fromAddress,
        data: data,
        value: value || '0x0',
        gas: '0xf4240' // 1 000 000 en hexadécimal
      }]
    });
    return hash;
  } catch (error) {
    console.error('Erreur sendTransaction:', error);
    // Améliorer les messages d'erreur pour l'utilisateur
    if (error.message.includes('MetaMask is not installed')) {
      throw new Error('Please install MetaMask to perform this action');
    } else if (error.message.includes('No accounts found')) {
      throw new Error('Please connect your wallet to perform this action');
    } else if (error.message.includes('User rejected')) {
      throw new Error('Transaction was rejected by user');
    } else if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient funds for transaction');
    } else {
      throw new Error('Transaction failed: ' + error.message);
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
        const provider = getProvider();
        const receipt = await provider.getTransactionReceipt(txHash);
        if (receipt) {
          const status = receipt.status === 'success' || receipt.status === '0x1' || receipt.status === 1;
          if (status) {
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

// Vérifier l'allowance actuelle (utilise ethers.js Interface)
export const getCurrentAllowance = async (walletAddress) => {
  try {
    if (!walletAddress) {
      console.warn('No wallet address provided for allowance check');
      return 0;
    }
    const provider = getProvider();
    const data = erc20Interface.encodeFunctionData('allowance', [
      walletAddress,
      CONFIG.STAKING_VAULT_ADDRESS
    ]);
    const allowanceHex = await provider.call({
      to: CONFIG.ORNE_TOKEN_ADDRESS,
      data
    });
    const allowance = formatEther(toBigInt(allowanceHex));
    return parseFloat(allowance);
  } catch (error) {
    console.error('Erreur getCurrentAllowance:', error);
    return 0;
  }
};

// Helper for approve data (to be used in Staking/Admin)
export const getApproveData = (spender, amount) => {
  return erc20Interface.encodeFunctionData('approve', [
    spender,
    parseEther(amount.toString())
  ]);
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

// Vérifier si un contrat est vérifié sur Arbiscan
export const checkContractVerification = async (contractAddress) => {
  try {
    const response = await fetch(`https://api.arbiscan.io/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=YourApiKeyToken`);
    const data = await response.json();
    
    if (data.status === '1' && data.result && data.result[0]) {
      const contract = data.result[0];
      return {
        verified: contract.SourceCode !== '',
        name: contract.ContractName || 'Unknown',
        compiler: contract.CompilerVersion || 'Unknown'
      };
    }
    return { verified: false, name: 'Unknown', compiler: 'Unknown' };
  } catch (error) {
    console.warn('Could not check contract verification:', error);
    return { verified: false, name: 'Unknown', compiler: 'Unknown' };
  }
};

// Améliorer les messages d'erreur pour les contrats non vérifiés
export const getTransactionErrorMessage = (error, contractAddress, functionName) => {
  if (error.message?.includes('dangerous') || error.message?.includes('unknown')) {
    return `⚠️ Transaction may appear as "Dangerous Request" because the contract ${contractAddress.slice(0, 8)}...${contractAddress.slice(-6)} is not verified on Arbiscan. This is normal for unverified contracts. The transaction is safe if you trust this DApp.`;
  }
  return error.message || 'Unknown error occurred';
};
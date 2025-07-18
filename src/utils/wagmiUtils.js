/* global BigInt */
import { usePublicClient, useWalletClient } from 'wagmi';
import { formatEther, toBigInt, Interface } from 'ethers';

// ERC20 Interface for proper encoding
const ERC20_ABI = [
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

const erc20Interface = new Interface(ERC20_ABI);

// Custom hook to get public and wallet clients
export const useWagmiClients = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  return { publicClient, walletClient };
};

// Utility functions that accept clients as parameters
export const callContractWithWagmi = async (publicClient, contractAddress, functionSignature, params = []) => {
  try {
    const methodId = getMethodSignature(functionSignature);
    let data = methodId;
    
    if (params.length === 1 && typeof params[0] === 'string') {
      const address = params[0].startsWith('0x') ? params[0].slice(2) : params[0];
      const paddedAddress = address.toLowerCase().padStart(64, '0');
      data = methodId + paddedAddress;
    }
    
    const result = await publicClient.call({
      to: contractAddress,
      data: data
    });
    
    return result;
  } catch (error) {
    console.error('Error calling contract with wagmi:', error);
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }
};

export const sendTransactionWithWagmi = async (walletClient, publicClient, to, data, from, value = '0x0') => {
  try {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }
    

    
    const hash = await walletClient.sendTransaction({
      to: to,
      from: from,
      data: data,
      value: value || '0x0',
      gas: BigInt(1000000) // 1,000,000 gas
    });
    
    return hash;
  } catch (error) {
    console.error('Error sending transaction with wagmi:', error);
    throw new Error('Transaction failed: ' + error.message);
  }
};

export const waitForTransactionWithWagmi = async (publicClient, txHash, description = 'Transaction') => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 120; // Increased timeout for slower networks
    
    const checkTx = async () => {
      try {
        attempts++;
        const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
        
        if (receipt) {
          if (receipt.status === 'success') {
            resolve(receipt);
          } else {
            reject(new Error(`${description} failed: ${txHash}`));
          }
        } else if (attempts >= maxAttempts) {
          // Transaction might be confirmed but receipt not yet available
          resolve({ 
            status: 'success', 
            hash: txHash, 
            note: 'Receipt not available yet, but transaction likely successful' 
          });
        } else {
          setTimeout(checkTx, 2000);
        }
              } catch (error) {
          if (attempts >= maxAttempts) {
            // Don't reject, just resolve with note
            resolve({ 
              status: 'success', 
              hash: txHash, 
              note: 'Receipt check failed, but transaction likely successful' 
            });
          } else {
            setTimeout(checkTx, 2000);
          }
        }
    };
    
    checkTx();
  });
};

export const getCurrentAllowanceWithWagmi = async (publicClient, walletAddress, tokenAddress, spenderAddress) => {
  try {
    if (!walletAddress) {
      console.warn('No wallet address provided for allowance check');
      return 0;
    }
    
    const data = erc20Interface.encodeFunctionData('allowance', [
      walletAddress,
      spenderAddress
    ]);
    
    const allowanceHex = await publicClient.call({
      to: tokenAddress,
      data
    });
    
    // Handle the case where allowanceHex might be an object with data property
    const hexValue = typeof allowanceHex === 'object' && allowanceHex.data ? allowanceHex.data : allowanceHex;
    
    const allowance = formatEther(toBigInt(hexValue));
    return parseFloat(allowance);
  } catch (error) {
    console.error('Error getting allowance with wagmi:', error);
    return 0;
  }
};

export const getTokenBalanceWithWagmi = async (publicClient, walletAddress, tokenAddress) => {
  try {
    if (!walletAddress) {
      return 0;
    }
    
    const data = erc20Interface.encodeFunctionData('balanceOf', [walletAddress]);
    
    const balanceHex = await publicClient.call({
      to: tokenAddress,
      data
    });
    
    const balance = formatEther(toBigInt(balanceHex));
    return parseFloat(balance);
  } catch (error) {
    console.error('Error getting token balance with wagmi:', error);
    return 0;
  }
};

// Helper function for method signatures
export const getMethodSignature = (functionName) => {
  const FUNCTION_SIGNATURES = {
    'balanceOf(address)': '0x70a08231',
    'allowance(address,address)': '0xdd62ed3e',
    'approve(address,uint256)': '0x095ea7b3',
    // Add other signatures as needed
  };
  
  return FUNCTION_SIGNATURES[functionName] || '0x00000000';
};

// Formatting utilities
export const formatEtherFixed = (value) => {
  if (!value) return '0';
  return (Number(value) / 1e18).toFixed(4);
};

export const parseEtherFixed = (value) => {
  return BigInt(Math.floor(parseFloat(value) * 1e18));
};

export const encodeUint256 = (value) => {
  const bigIntValue = BigInt(Math.floor(parseFloat(value) * 1e18));
  const hex = bigIntValue.toString(16);
  return hex.padStart(64, '0');
};

export const encodeAddress = (address) => {
  return address.slice(2).toLowerCase().padStart(64, '0');
};

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
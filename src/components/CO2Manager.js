import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { CONFIG_TESTNET, FUNCTION_SIGNATURES_V6, CO2_TOKEN_SIGNATURES, GREEN_CERTIFICATE_SIGNATURES } from '../config/config-testnet';

const CO2Manager = () => {
  const { address } = useAccount();
  const [co2Amount, setCo2Amount] = useState('');
  const [certificateAmount, setCertificateAmount] = useState('');
  const [certificateURI, setCertificateURI] = useState('');

  // Lecture des données CO2
  const { data: claimableCO2 } = useContractRead({
    address: CONFIG_TESTNET.STAKING_VAULT_ADDRESS,
    abi: [{
      name: 'getClaimableCO2',
      type: 'function',
      inputs: [{ name: 'user', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view'
    }],
    functionName: 'getClaimableCO2',
    args: [address],
    enabled: !!address
  });

  const { data: co2Balance } = useContractRead({
    address: CONFIG_TESTNET.CO2_TOKEN_ADDRESS,
    abi: [{
      name: 'balanceOf',
      type: 'function',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view'
    }],
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address
  });

  const { data: userCertificates } = useContractRead({
    address: CONFIG_TESTNET.GREEN_CERTIFICATE_ADDRESS,
    abi: [{
      name: 'getUserCertificates',
      type: 'function',
      inputs: [{ name: 'user', type: 'address' }],
      outputs: [{ name: '', type: 'uint256[]' }],
      stateMutability: 'view'
    }],
    functionName: 'getUserCertificates',
    args: [address],
    enabled: !!address
  });

  // Écriture - Claim CO2
  const { write: claimCO2, data: claimCO2Data } = useContractWrite({
    address: CONFIG_TESTNET.STAKING_VAULT_ADDRESS,
    abi: [{
      name: 'claimCO2',
      type: 'function',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable'
    }],
    functionName: 'claimCO2'
  });

  // Écriture - Mint certificat
  const { write: mintCertificate, data: mintCertificateData } = useContractWrite({
    address: CONFIG_TESTNET.GREEN_CERTIFICATE_ADDRESS,
    abi: [{
      name: 'mintCertificate',
      type: 'function',
      inputs: [
        { name: 'co2Amount', type: 'uint256' },
        { name: 'certificateURI', type: 'string' }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    }],
    functionName: 'mintCertificate'
  });

  // Écriture - Approve CO2 pour certificat
  const { write: approveCO2, data: approveCO2Data } = useContractWrite({
    address: CONFIG_TESTNET.CO2_TOKEN_ADDRESS,
    abi: [{
      name: 'approve',
      type: 'function',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable'
    }],
    functionName: 'approve'
  });

  // Attendre les transactions
  const { isLoading: isClaimingCO2 } = useWaitForTransaction({
    hash: claimCO2Data?.hash
  });

  const { isLoading: isMintingCertificate } = useWaitForTransaction({
    hash: mintCertificateData?.hash
  });

  const { isLoading: isApprovingCO2 } = useWaitForTransaction({
    hash: approveCO2Data?.hash
  });

  const handleClaimCO2 = () => {
    if (claimableCO2 && claimableCO2 > 0n) {
      claimCO2();
    }
  };

  const handleMintCertificate = () => {
    if (certificateAmount && certificateURI) {
      const amount = BigInt(certificateAmount) * BigInt(10 ** 18); // Convertir en wei
      mintCertificate({
        args: [amount, certificateURI]
      });
    }
  };

  const handleApproveCO2 = () => {
    if (certificateAmount) {
      const amount = BigInt(certificateAmount) * BigInt(10 ** 18); // Convertir en wei
      approveCO2({
        args: [CONFIG_TESTNET.GREEN_CERTIFICATE_ADDRESS, amount]
      });
    }
  };

  const formatCO2 = (amount) => {
    if (!amount) return '0';
    return (Number(amount) / 10 ** 18).toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">🌱 Gestion des Crédits Carbone</h2>
      
      {/* Section Claim CO2 */}
      <div className="mb-8 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold text-green-700 mb-4">📈 Claim des Tokens CO2</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">CO2 Claimable</p>
            <p className="text-xl font-bold text-green-600">
              {formatCO2(claimableCO2)} kg CO2
            </p>
          </div>
          
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">Balance CO2</p>
            <p className="text-xl font-bold text-green-600">
              {formatCO2(co2Balance)} kg CO2
            </p>
          </div>
        </div>

        <button
          onClick={handleClaimCO2}
          disabled={!claimableCO2 || claimableCO2 === 0n || isClaimingCO2}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded transition-colors"
        >
          {isClaimingCO2 ? '⏳ Claim en cours...' : '🎯 Claim CO2'}
        </button>
      </div>

      {/* Section Certificats Verts */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-700 mb-4">🏆 Certificats Verts</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Vos certificats: {userCertificates?.length || 0}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant CO2 à brûler (kg)
            </label>
            <input
              type="number"
              value={certificateAmount}
              onChange={(e) => setCertificateAmount(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URI des métadonnées du certificat
            </label>
            <input
              type="text"
              value={certificateURI}
              onChange={(e) => setCertificateURI(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://api.orne.io/certificates/metadata.json"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleApproveCO2}
              disabled={!certificateAmount || isApprovingCO2}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded transition-colors"
            >
              {isApprovingCO2 ? '⏳ Approbation...' : '✅ Approuver CO2'}
            </button>

            <button
              onClick={handleMintCertificate}
              disabled={!certificateAmount || !certificateURI || isMintingCertificate}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded transition-colors"
            >
              {isMintingCertificate ? '⏳ Mint en cours...' : '🏆 Mint Certificat'}
            </button>
          </div>
        </div>
      </div>

      {/* Informations */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">ℹ️ Informations</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Les tokens CO2 sont distribués proportionnellement à votre stake</li>
          <li>• Chaque certificat vert représente un montant spécifique de CO2 compensé</li>
          <li>• Les certificats sont des NFTs uniques et traçables</li>
          <li>• Vous devez approuver les tokens CO2 avant de mint un certificat</li>
        </ul>
      </div>
    </div>
  );
};

export default CO2Manager; 
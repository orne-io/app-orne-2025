import { useState, useCallback } from 'react';
import { CONFIG } from '../config/config';
import {
  callContract,
  sendTransaction,
  waitForTransaction,
  getCurrentAllowance,
  encodeUint256,
  encodeUint256Admin,
  getMethodSignature,
  getApproveData
} from '../utils/contractUtils';
import { useAccount } from 'wagmi';

export const useAdmin = (loadGlobalStats, loadUserData, showStatus, setLoading, provider) => {
  const { address, isConnected } = useAccount();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminData, setAdminData] = useState({
    co2ToAdd: '',
    rewardsToAdd: '',
    co2History: [],
    rewardsHistory: [],
    isOwner: false
  });

  const MAINNET_ADMIN_ADDRESS = "0x38b27cb0339334e0ac2B73D0bF5B57b6Fc3Db8c5";

  // Charger l'historique admin (réel depuis le backend)
  const loadAdminHistory = useCallback(async () => {
    try {
      const [co2Res, rewardsRes] = await Promise.all([
        fetch('/api/history-co2'),
        fetch('/api/history-rewards')
      ]);
      const co2HistoryRaw = await co2Res.json();
      const rewardsHistoryRaw = await rewardsRes.json();
      // Formatage pour l'affichage
      const co2History = co2HistoryRaw.map(entry => ({
        date: entry.date,
        tonnes: entry.tonnes,
        txHash: entry.txHash
      }));
      const rewardsHistory = rewardsHistoryRaw.map(entry => ({
        date: entry.date,
        amount: entry.amount,
        txHash: entry.txHash
      }));
      setAdminData(prev => ({
        ...prev,
        co2History,
        rewardsHistory
      }));
    } catch (err) {
      console.error('Erreur chargement historique admin:', err);
      setAdminData(prev => ({
        ...prev,
        co2History: [],
        rewardsHistory: []
      }));
    }
  }, []);

  // Vérifier l'accès admin via URL et propriétaire du contrat
  const checkAdminAccess = useCallback(async () => {
    const currentPath = window.location.pathname;
    const hasAdminPath = currentPath === '/admin';
    
    if (hasAdminPath && isConnected && address) {
      try {
        const ownerHex = await callContract(CONFIG.STAKING_VAULT_ADDRESS, 'owner()', []);
        
        if (ownerHex && ownerHex.length > 2) {
          const ownerAddress = '0x' + ownerHex.slice(-40);
          
          const isOwner = ownerAddress.toLowerCase() === MAINNET_ADMIN_ADDRESS.toLowerCase();
          const isCurrentUser = address.toLowerCase() === MAINNET_ADMIN_ADDRESS.toLowerCase();
          
          if (isOwner || isCurrentUser) {
            setShowAdminPanel(true);
            setAdminData(prev => ({ ...prev, isOwner: true }));
            loadAdminHistory();
          } else {
            showStatus('❌ Access denied: You are not the contract owner', 'error');
          }
        } else {
          showStatus('❌ Could not verify contract ownership', 'error');
        }
      } catch (error) {
        console.error('Erreur vérification owner:', error);
        showStatus('❌ Error checking admin access', 'error');
      }
    } else {
      setShowAdminPanel(false);
      setAdminData(prev => ({ ...prev, isOwner: false }));
    }
  }, [isConnected, address, showStatus, loadAdminHistory]);

  // Ajouter du CO2
  const addCO2 = async () => {
    if (!adminData.co2ToAdd || adminData.co2ToAdd <= 0) {
      showStatus('Please enter a valid number of tons', 'error');
      return;
    }

    if (!address) {
      showStatus('❌ No wallet address available', 'error');
      return;
    }

    try {
      setLoading(true);
      showStatus('🌱 Adding CO2...', 'warning');



      // Utiliser encodeUint256Admin pour les fonctions admin (pas de conversion wei)
      const tonnes = encodeUint256Admin(adminData.co2ToAdd);
      const data = getMethodSignature('updateCO2(uint256)') + tonnes;

      const txHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, data, address, '0x0', provider);
      showStatus(`⏳ CO2 added (${txHash.slice(0, 10)}...)`, 'warning');

      await waitForTransaction(txHash, 'CO2 addition');

      showStatus(`🎉 ${adminData.co2ToAdd} tons of CO2 added!`, 'success');
      setAdminData(prev => ({ ...prev, co2ToAdd: '' }));
      
      setTimeout(() => {
        loadGlobalStats();
        loadUserData();
        loadAdminHistory();
      }, 3000);

    } catch (error) {
      console.error('Error adding CO2:', error);
      showStatus('❌ Error: ' + (error.message || 'Unknown'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Distribuer des rewards
  const distributeRewards = async () => {
    if (!adminData.rewardsToAdd || adminData.rewardsToAdd <= 0) {
      showStatus('Veuillez entrer un montant de rewards valide', 'error');
      return;
    }

    if (!address) {
      showStatus('❌ No wallet address available', 'error');
      return;
    }

    try {
      setLoading(true);



      // Vérifier l'allowance d'abord
      showStatus('🔍 Vérification de l\'allowance...', 'warning');
      const currentAllowance = await getCurrentAllowance(address);
      const rewardsAmount = parseFloat(adminData.rewardsToAdd);

      if (currentAllowance < rewardsAmount) {
        showStatus('📝 Approbation des tokens en cours...', 'warning');
        
        const approvalAmount = Math.max(rewardsAmount * 2, 10000);
        // Utiliser getApproveData pour encoder correctement
        const approvalData = getApproveData(CONFIG.STAKING_VAULT_ADDRESS, approvalAmount.toString());
        
        const approvalTxHash = await sendTransaction(CONFIG.ORNE_TOKEN_ADDRESS, approvalData, address, '0x0', provider);
        await waitForTransaction(approvalTxHash, 'Approbation');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      showStatus('💰 Distribution des rewards en cours...', 'warning');

      // Utiliser encodeUint256 normal pour les rewards (conversion wei nécessaire)
      const rewardsWei = encodeUint256(adminData.rewardsToAdd);
      const data = getMethodSignature('depositRewards(uint256)') + rewardsWei;

      const txHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, data, address, '0x0', provider);
      showStatus(`⏳ Rewards distribués (${txHash.slice(0, 10)}...)`, 'warning');

      await waitForTransaction(txHash, 'Distribution rewards');

      showStatus(`🎉 ${adminData.rewardsToAdd} $ORNE distribués en rewards !`, 'success');
      setAdminData(prev => ({ ...prev, rewardsToAdd: '' }));
      
      setTimeout(() => {
        loadGlobalStats();
        loadUserData();
        loadAdminHistory();
      }, 3000);

    } catch (error) {
      console.error('Erreur distribution rewards:', error);
      showStatus('❌ Erreur: ' + (error.message || 'Inconnue'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Modifier le délai d'unstaking
  const setUnstakingDelay = async () => {
    if (!adminData.unstakingDelayMinutes || adminData.unstakingDelayMinutes <= 0) {
      showStatus('Please enter a valid delay in minutes', 'error');
      return;
    }

    if (!address) {
      showStatus('❌ No wallet address available', 'error');
      return;
    }

    try {
      setLoading(true);
      showStatus('⏱️ Updating unstaking delay...', 'warning');



      const response = await fetch('/api/set-unstaking-delay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minutes: parseInt(adminData.unstakingDelayMinutes)
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update delay');
      }

      // Envoyer la transaction
      const data = result.data;
      const txHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, data, address, '0x0', provider);
      showStatus(`⏳ Delay update sent (${txHash.slice(0, 10)}...)`, 'warning');

      await waitForTransaction(txHash, 'Delay update');

      showStatus(`🎉 Unstaking delay updated to ${adminData.unstakingDelayMinutes} minutes!`, 'success');
      setAdminData(prev => ({ ...prev, unstakingDelayMinutes: '' }));
      
      setTimeout(() => {
        loadGlobalStats();
        loadUserData();
      }, 3000);

    } catch (error) {
      console.error('Error updating unstaking delay:', error);
      showStatus('❌ Error: ' + (error.message || 'Unknown'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    showAdminPanel,
    adminData,
    setAdminData,
    checkAdminAccess,
    addCO2,
    distributeRewards,
    setUnstakingDelay
  };
};
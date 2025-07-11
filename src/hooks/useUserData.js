import { useState, useCallback, useEffect } from 'react';
import { CONFIG } from '../config/config';
import { callContract, decodeResult } from '../utils/contractUtils';
import { useAccount } from 'wagmi';

export const useUserData = (globalStats) => {
  const { address, isConnected } = useAccount();
  const [userStats, setUserStats] = useState({
    orneBalance: '0',
    stakedBalance: '0',
    pendingRewards: '0',
    unstakingAvailable: '0',
    userCO2Offset: '0',
    canUnstake: false,
    timeUntilUnstake: 0
  });

  const loadUserData = useCallback(async () => {
    if (!isConnected || !address) return;
    
    try {
      const [
        orneBalanceHex,
        stakeInfoHex,
        pendingRewardsHex,
        unstakeInfoHex,
        userCO2Hex,
        canUnstakeHex,
        timeUntilUnstakeHex,
        co2PerOrneHex,
        totalStakedHex
      ] = await Promise.all([
        callContract(CONFIG.ORNE_TOKEN_ADDRESS, 'balanceOf(address)', [address]),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'stakes(address)', [address]),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'pendingRewards(address)', [address]),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'getUnstakeInfo(address)', [address]),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'co2OffsetOf(address)', [address]),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'canUnstake(address)', [address]),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'timeUntilUnstake(address)', [address]),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'co2PerOrne()', []),
        callContract(CONFIG.STAKING_VAULT_ADDRESS, 'totalStaked()', [])
      ]);
      
      const orneBalance = decodeResult(orneBalanceHex, 'uint256');
      const pendingRewards = decodeResult(pendingRewardsHex, 'uint256');
      const canUnstake = decodeResult(canUnstakeHex, 'bool');
      const totalStaked = decodeResult(totalStakedHex, 'uint256');
      
      let pendingUnstakes = '0';
      if (unstakeInfoHex && unstakeInfoHex.length > 2) {
        const amount = unstakeInfoHex.slice(2, 66);
        pendingUnstakes = decodeResult('0x' + amount, 'uint256');
      }
      
      let timeUntilUnstake = 0;
      if (timeUntilUnstakeHex && timeUntilUnstakeHex !== '0x') {
        timeUntilUnstake = Number(window.BigInt(timeUntilUnstakeHex));
      }
      
      let stakedBalance = '0';
      if (stakeInfoHex && stakeInfoHex.length > 2) {
        const stakedHex = stakeInfoHex.slice(2, 66);
        stakedBalance = decodeResult('0x' + stakedHex, 'uint256');
      }
      
      let userCO2Offset = '0';
      if (userCO2Hex && userCO2Hex !== '0x') {
        const co2Value = Number(window.BigInt(userCO2Hex));
        const co2InKg = (co2Value / 1000).toFixed(3);
        userCO2Offset = co2InKg;
      } else if (stakedBalance !== '0' && co2PerOrneHex !== '0x') {
        // Calcul alternatif selon votre formule
        const totalStakedNumber = parseFloat(totalStaked);
        const myStakedNumber = parseFloat(stakedBalance);
        const co2PerOrneNumber = parseFloat(String(globalStats.co2PerOrne).replace(/,/g, '')) || 0;
        
        console.log('=== CALCUL CO2 OFFSET ===');
        console.log('Total ORNE stakés:', totalStakedNumber);
        console.log('Mes ORNE stakés:', myStakedNumber);
        console.log('CO2 par ORNE (grammes):', co2PerOrneNumber);
        
        if (totalStakedNumber > 0 && co2PerOrneNumber > 0) {
          const totalCO2Grams = totalStakedNumber * co2PerOrneNumber;
          const otherStakedNumber = totalStakedNumber - myStakedNumber;
          const otherCO2Grams = otherStakedNumber * co2PerOrneNumber;
          const myCO2Grams = totalCO2Grams - otherCO2Grams;
          const myCO2Kg = (myCO2Grams / 1000).toFixed(3);
          
          console.log('Mon CO2 (kg):', myCO2Kg);
          userCO2Offset = myCO2Kg;
        }
      }
      
      // console.log('CO2 Offset final affiché:', userCO2Offset); // Supprimé pour éviter le spam
      
      setUserStats({
        orneBalance,
        stakedBalance,
        pendingRewards,
        unstakingAvailable: pendingUnstakes,
        userCO2Offset,
        canUnstake,
        timeUntilUnstake
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
    }
  }, [isConnected, address, globalStats.co2PerOrne]);

  useEffect(() => {
    if (isConnected && address) {
      loadUserData();
      const interval = setInterval(loadUserData, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address, loadUserData]);

  return {
    userStats,
    loadUserData
  };
};
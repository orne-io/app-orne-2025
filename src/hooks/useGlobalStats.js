import { useState, useCallback } from 'react';

export const useGlobalStats = () => {
  const [globalStats, setGlobalStats] = useState({
    totalStaked: '0',
    co2PerOrne: '0'
  });
  const [globalUnstakingStats, setGlobalUnstakingStats] = useState({
    totalUnstaking: '0'
  });

  const loadGlobalStats = useCallback(async () => {
    try {
      // Fetch toutes les stats globales depuis le backend
      const [
        stakedRes,
        co2PerOrneRes,
        unstakingRes,
        holdersRes,
        stakersRes,
        co2Res,
        rewardsRes,
        adminBalanceRes
      ] = await Promise.all([
        fetch('/api/global-staked'),
        fetch('/api/global-co2-per-orne'),
        fetch('/api/global-unstaking'),
        fetch('/api/global-holders'),
        fetch('/api/global-stakers'),
        fetch('/api/global-co2'),
        fetch('/api/global-rewards-distributed'), // nouvelle route
        fetch('/api/admin-balance') // nouvelle route
      ]);
      const totalStaked = (await stakedRes.json()).totalStaked || '0';
      let co2PerOrne = (await co2PerOrneRes.json()).co2PerOrne || '0';
      co2PerOrne = Number(co2PerOrne).toFixed(2);
      const totalUnstaking = (await unstakingRes.json()).totalPendingUnstakes || '0';
      const uniqueHolders = (await holdersRes.json()).uniqueHolders || 0;
      const uniqueStakers = (await stakersRes.json()).uniqueStakers || 0;
      const totalCO2OffsetT = (await co2Res.json()).totalCO2OffsetT || 0;
      const totalRewardsDistributed = (await rewardsRes.json()).totalRewardsDistributed || 0;
      const adminBalance = (await adminBalanceRes.json()).adminBalance || '0';
      
      // Si co2PerOrne est 0 mais qu'on a des données CO2 et staking, calculer manuellement
      if (Number(co2PerOrne) === 0 && Number(totalCO2OffsetT) > 0 && Number(totalStaked) > 0) {
        // totalCO2OffsetT est en tonnes, on veut des grammes par ORNE
        const totalCO2Grams = totalCO2OffsetT * 1_000_000;
        const totalStakedNumber = Number(totalStaked);
        co2PerOrne = (totalCO2Grams / totalStakedNumber).toFixed(1);
      }
      
      co2PerOrne = String(co2PerOrne); // Force string
      
      setGlobalStats({ totalStaked, co2PerOrne, adminBalance });
      setGlobalUnstakingStats({ totalUnstaking });
      window.orneGlobalStatsV5 = { uniqueStakers, uniqueHolders, totalCO2OffsetT, totalRewardsDistributed };
    } catch (err) {
      console.error('Erreur de chargement des statistiques globales via backend:', err);
      setGlobalStats({ totalStaked: '0', co2PerOrne: '0', adminBalance: '0' });
      setGlobalUnstakingStats({ totalUnstaking: '0' });
      window.orneGlobalStatsV5 = { uniqueStakers: 0, uniqueHolders: 0, totalCO2OffsetT: 0, totalRewardsDistributed: 0 };
    }
  }, []);

  return {
    globalStats,
    globalUnstakingStats,
    loadGlobalStats
  };
};
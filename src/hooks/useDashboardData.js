import { useMemo } from 'react';

export const useDashboardData = (globalStats) => {
  const dashboardData = useMemo(() => {
    return {
      ornePrice: 0.1,
      maxSupply: 100000000,
      circulatingSupply: 100000000 - parseFloat(globalStats.totalStaked),
      apr: 5.0,
      estimatedHolders: (() => {
        if (window.orneGlobalStatsV5?.uniqueHolders !== undefined) {
          return window.orneGlobalStatsV5.uniqueHolders;
        }
        if (window.orneGlobalStatsV5?.uniqueStakers !== undefined) {
          return window.orneGlobalStatsV5.uniqueStakers;
        }
        const totalStakedNumber = parseFloat(globalStats.totalStaked);
        return totalStakedNumber > 0 ? 1 : 0;
      })(),
      totalCO2Offset: (() => {
        if (window.orneGlobalStatsV5?.totalCO2OffsetKg !== undefined) {
          return window.orneGlobalStatsV5.totalCO2OffsetKg.toFixed(3);
        }
        const totalStakedNumber = parseFloat(globalStats.totalStaked);
        const co2PerOrneNumber = parseFloat(globalStats.co2PerOrne.replace(/,/g, '')) || 0;
        if (totalStakedNumber === 0 || co2PerOrneNumber === 0) return 0;
        const totalCO2Grams = totalStakedNumber * co2PerOrneNumber;
        return (totalCO2Grams / 1000).toFixed(3);
      })()
    };
  }, [globalStats]);

  return dashboardData;
};
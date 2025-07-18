import React, { useState, useEffect } from 'react';
import { useUniswapV3PoolData } from '../hooks/useUniswapV3PoolData';
import { useWethPrice } from '../hooks/useWethPrice';
import SimpleChart from './SimpleChart';
import InfoTooltip from './InfoTooltip';
import ornePriceIcon from '../images/orne-price.png';
import circulatingOrneIcon from '../images/circulating-orne.png';
import distributedOrneIcon from '../images/distributed-orne.png';
import userStakingIcon from '../images/user-staking.png';

const Dashboard = ({ dashboardData, globalStats, globalUnstakingStats, styles }) => {
  const [stakingHistory, setStakingHistory] = useState([]);
  const [co2History, setCO2History] = useState([]);

  // Use pool data directly like Swap component
  const uniswapData = useUniswapV3PoolData();
  const wethPrice = useWethPrice();

  // Calculate price directly from pool data
  const price = uniswapData?.price ? parseFloat(uniswapData.price) : 0;
  const priceUSD = price > 0 && wethPrice.usd ? price * wethPrice.usd : 0;

  // Restaurer le calcul du market cap et du circulating supply
  const circulatingSupply = 100000000 - parseFloat(globalStats.totalStaked) - parseFloat(globalStats.adminBalance || 0);
  const marketCap = priceUSD > 0 ? circulatingSupply * priceUSD : null;
  const totalMarketCap = priceUSD > 0 ? 100000000 * priceUSD : null;

  // Calculate total CO2 offset
  const totalCO2Offset = (() => {
    if (window.orneGlobalStatsV5?.totalCO2OffsetT !== undefined) {
      return window.orneGlobalStatsV5.totalCO2OffsetT.toFixed(3);
    }
    return 0;
  })();

  useEffect(() => {
    function fetchData() {
    fetch('/api/history-staked')
      .then(res => res.json())
        .then(data => {
          const sortedData = data.sort((a, b) => {
            const dateA = new Date(a.fullDate || a.date);
            const dateB = new Date(b.fullDate || b.date);
            return dateA - dateB;
          });
          setStakingHistory(sortedData);
        })
      .catch(() => setStakingHistory([]));
    fetch('/api/history-co2')
      .then(res => res.json())
      .then(data => {
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.fullDate || a.date);
          const dateB = new Date(b.fullDate || b.date);
          return dateA - dateB;
        });
        let total = 0;
        const cumu = sortedData.map(entry => {
          total += Number(entry.tonnes);
          return {
            date: entry.date,
            fullDate: entry.fullDate,
            totalCO2: total
          };
        });
        setCO2History(cumu);
      })
      .catch(() => setCO2History([]));
    }
    fetchData(); // initial fetch
    const interval = setInterval(fetchData, 60000); // 1 minute
    return () => clearInterval(interval);
  }, []);

  // Helper pour forcer l'affichage des 10 derniers points si le filtre de période retourne trop peu de points
  function getChartDataWithFallback(data, period) {
    // Filtrage comme dans SimpleChart
    const now = new Date();
    let fromDate;
    switch (period) {
      case '1d': fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case '1w': fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '1m': fromDate = new Date(now.setMonth(now.getMonth() - 1)); break;
      case '3m': fromDate = new Date(now.setMonth(now.getMonth() - 3)); break;
      case '6m': fromDate = new Date(now.setMonth(now.getMonth() - 6)); break;
      case '1y': fromDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
      default: return data;
    }
    const filtered = data.filter(d => {
      const dateStr = d.fullDate || d.date;
      if (!dateStr) return true;
      const date = new Date(dateStr);
      return date >= fromDate;
    });
    if (filtered.length >= 10) return filtered;
    // Sinon, on prend les 10 derniers points disponibles
    return data.slice(-10);
  }

  // Bloc stat moderne avec bordure verticale
  const StatBlock = ({ color, title, value, tooltip }) => (
    <div className="flex gap-0 mb-0">
      <div style={{
        width: 4,
        height: 38,
        background: color,
        borderRadius: 3,
        marginRight: 12
      }} />
      <div>
        <div className="text-muted mb-10 flex items-center gap-4" style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
          {title}
          {tooltip && (
            <InfoTooltip content={tooltip} title={title}>
              <span className="tooltip-icon" style={{ color: color }}>
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          )}
        </div>
        <div className="text-secondary" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );

  // Selector de période réutilisable
  const PeriodSelector = ({ period, setPeriod, color }) => (
    <div className="flex" style={{ gap: 8 }}>
      {['1d','1w','1m','3m','6m','1y'].map(p => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className="btn-percentage"
          style={{
            background: period === p ? color : '#f3efec',
            color: period === p ? 'white' : '#383e5c',
            boxShadow: period === p ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          {p}
        </button>
      ))}
    </div>
  );

  // --- LOG POUR DEBUG DES CHARTS ---
  const stakingDataSorted = [...stakingHistory].sort((a, b) => new Date(a.fullDate || a.date) - new Date(b.fullDate || b.date));
  const stakingChartData = stakingDataSorted.length > 10 ? stakingDataSorted.slice(-10) : stakingDataSorted;
  const co2DataSorted = [...co2History].sort((a, b) => new Date(a.fullDate || a.date) - new Date(b.fullDate || b.date));
  const co2ChartData = co2DataSorted.length > 10 ? co2DataSorted.slice(-10) : co2DataSorted;

  return (
    <>
      {/* Première section - 4 blocs principaux */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <img src={ornePriceIcon} alt="$ORNE Price" />
          </div>
          <div className="stat-label">
            $ORNE Price
            <InfoTooltip title="$ORNE Price" content="Current price of the $ORNE token, updated in real time.">
              <span className="tooltip-icon text-primary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">${priceUSD ? priceUSD.toFixed(6) : 'N/A'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <img src={circulatingOrneIcon} alt="Circulating $ORNE" />
          </div>
          <div className="stat-label">
            Circulating $ORNE
            <InfoTooltip title="Circulating $ORNE" content="Total number of $ORNE tokens currently in circulation (not staked or held by admin).">
              <span className="tooltip-icon text-secondary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{circulatingSupply.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <img src={distributedOrneIcon} alt="Distributed $ORNE" />
          </div>
          <div className="stat-label">
            Distributed $ORNE
            <InfoTooltip title="Distributed $ORNE" content="Total amount of $ORNE tokens distributed as staking rewards to users.">
              <span className="tooltip-icon text-secondary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{window.orneGlobalStatsV5?.totalRewardsDistributed != null ? window.orneGlobalStatsV5.totalRewardsDistributed.toLocaleString() : 'N/A'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <img src={userStakingIcon} alt="User Staking" />
          </div>
          <div className="stat-label">
            User Staking
            <InfoTooltip title="User Staking" content="Number of unique users currently staking $ORNE tokens.">
              <span className="tooltip-icon text-secondary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{window.orneGlobalStatsV5?.uniqueStakers != null ? window.orneGlobalStatsV5.uniqueStakers.toLocaleString() : 'N/A'}</div>
        </div>
      </div>

      {/* Bloc Staking $ORNE Evolution */}
      <div className="card" style={{ marginBottom: 40, padding: 28 }}>
        <div className="dashboard-period-row flex-between" style={{ marginBottom: 20 }}>
          <div className="flex" style={{ gap: 32 }}>
            <StatBlock
              color="#89be83"
              title="Staked $ORNE"
              value={parseFloat(globalStats.totalStaked).toLocaleString()}
              tooltip="Total amount of $ORNE tokens currently staked by all users."
            />
            <StatBlock
              color="#dc3545"
              title="In Unstaking (global)"
              value={globalUnstakingStats.totalUnstaking}
              tooltip="Total amount of $ORNE tokens currently in the unstaking process (pending withdrawal)."
            />
              </div>
          {/* PeriodSelector supprimé ici */}
        </div>
        <SimpleChart
          data={stakingChartData}
          color="#89be83"
          dataKey="totalStaked"
          yLabel="Staked $ORNE"
          gradientId="stakingGradient"
        />
              </div>

      {/* Bloc CO2 Offset Evolution */}
      <div className="card" style={{ marginBottom: 40, padding: 28 }}>
        <div className="dashboard-period-row flex-between" style={{ marginBottom: 20 }}>
          <div className="flex" style={{ gap: 32 }}>
            <StatBlock
              color="#28a745"
              title="Total CO2 Offset"
              value={totalCO2Offset + ' t'}
              tooltip="Total tonnes of CO2 offset by all staked $ORNE tokens."
            />
            <StatBlock
              color="#28a745"
              title="CO2 per $ORNE"
              value={Number(globalStats.co2PerOrne).toFixed(2) + ' g'}
              tooltip="Current amount of CO2 (in grams) offset per staked $ORNE token."
            />
          </div>
          {/* PeriodSelector supprimé ici */}
        </div>
        <SimpleChart
          data={co2ChartData}
          color="#28a745"
          dataKey="totalCO2"
          yLabel="CO2 offset (tons)"
          gradientId="co2Gradient"
        />
      </div>
    </>
  );
};

export default Dashboard;
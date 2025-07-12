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
  const [stakingPeriod, setStakingPeriod] = useState('1m');
  const [co2Period, setCO2Period] = useState('1m');
  const [stakingHistory, setStakingHistory] = useState([]);
  const [co2History, setCO2History] = useState([]);

  // Use pool data directly like Swap component
  const uniswapData = useUniswapV3PoolData();
  const wethPrice = useWethPrice();

  // Calculate price directly from pool data
  const price = uniswapData?.price ? parseFloat(uniswapData.price) : 0;
  const priceUSD = price > 0 && wethPrice.usd ? price * wethPrice.usd : 0;

  // Calculate market cap
  const circulatingSupply = 100000000 - parseFloat(globalStats.totalStaked) - parseFloat(globalStats.adminBalance || 0);
  const marketCap = priceUSD > 0 ? circulatingSupply * priceUSD : null;
  const totalMarketCap = priceUSD > 0 ? 100000000 * priceUSD : null;

  // Calculate total CO2 offset
  const totalCO2Offset = (() => {
    if (window.orneGlobalStatsV5?.totalCO2OffsetKg !== undefined) {
      return window.orneGlobalStatsV5.totalCO2OffsetKg.toFixed(3);
    }
    const totalStakedNumber = parseFloat(globalStats.totalStaked);
    const co2PerOrneNumber = parseFloat(globalStats.co2PerOrne.replace(/,/g, '')) || 0;
    if (totalStakedNumber === 0 || co2PerOrneNumber === 0) return 0;
    const totalCO2Grams = totalStakedNumber * co2PerOrneNumber;
    return (totalCO2Grams / 1000).toFixed(3);
  })();

  useEffect(() => {
    fetch('/api/history-staked')
      .then(res => res.json())
      .then(data => setStakingHistory(data))
      .catch(() => setStakingHistory([]));
    fetch('/api/history-co2')
      .then(res => res.json())
      .then(data => {
        // Trier les données par date (du plus ancien au plus récent)
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
  }, []);

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
          <div className="PeriodSelector">
            <PeriodSelector period={stakingPeriod} setPeriod={setStakingPeriod} color="#89be83" />
          </div>
        </div>
        <SimpleChart
          data={stakingHistory}
          color="#89be83"
          dataKey="totalStaked"
          yLabel="Staked $ORNE"
          period={stakingPeriod}
          setPeriod={setStakingPeriod}
          gradientId="stakingGradient"
          renderPeriodSelector={null}
        />
              </div>

      {/* Bloc CO2 Offset Evolution */}
      <div className="card" style={{ marginBottom: 40, padding: 28 }}>
        <div className="dashboard-period-row flex-between" style={{ marginBottom: 20 }}>
          <div className="flex" style={{ gap: 32 }}>
            <StatBlock
              color="#28a745"
              title="Total CO2 Offset"
              value={totalCO2Offset + ' kg'}
              tooltip="Total kilograms of CO2 offset by all staked $ORNE tokens."
            />
            <StatBlock
              color="#28a745"
              title="CO2 per $ORNE"
              value={globalStats.co2PerOrne + ' g'}
              tooltip="Current amount of CO2 (in grams) offset per staked $ORNE token."
            />
              </div>
          <div className="PeriodSelector">
            <PeriodSelector period={co2Period} setPeriod={setCO2Period} color="#28a745" />
          </div>
        </div>
        <SimpleChart
          data={co2History}
          color="#28a745"
          dataKey="totalCO2"
          yLabel="CO2 offset (tons)"
          period={co2Period}
          setPeriod={setCO2Period}
          gradientId="co2Gradient"
          renderPeriodSelector={null}
        />
      </div>
    </>
  );
};

export default Dashboard;
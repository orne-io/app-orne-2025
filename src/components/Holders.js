import React, { useEffect, useState } from 'react';
import InfoTooltip from './InfoTooltip';
import distributedOrneIcon from '../images/distributed-orne.png';
import circulatingOrneIcon from '../images/circulating-orne.png';
import userStakingIcon from '../images/user-staking.png';
import totalHoldersIcon from '../images/total-holders.png';
import { useGlobalStats } from '../hooks/useGlobalStats';

const ARBISCAN_URL = 'https://arbiscan.io/address/';

function StatBlock({ color, title, value, tooltip, icon }) {
  return (
    <div className="flex gap-0 mb-0 stat-card">
      <div style={{
        width: 4,
        height: 38,
        background: color,
        borderRadius: 3,
        marginRight: 12
      }} />
      <div>
        <div className="text-muted mb-10 flex items-center gap-4" style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
          {icon && <img src={icon} alt={title} style={{ width: 24, height: 24, marginRight: 6, verticalAlign: 'middle' }} />}
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
}

function Holders() {
  const [holders, setHolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { globalStats } = useGlobalStats();
  const loadingStats = !globalStats || globalStats.totalStaked === undefined || globalStats.adminBalance === undefined;

  useEffect(() => {
    fetch('/api/holders')
      .then(res => res.json())
      .then(data => {
        setHolders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError('Error loading holders');
        setLoading(false);
      });
  }, []);

  if (loading || loadingStats) return <div className="text-center mt-20" style={{ color: '#383e5c' }}>Loading...</div>;
  if (error) return <div className="alert alert-error text-center mt-20">{error}</div>;

  // Sort by totalHolding descending
  const sorted = holders.slice().sort((a, b) => b.totalHolding - a.totalHolding);

  // Calcul circulating supply comme dans Dashboard
  const circulatingSupply = 100000000 - parseFloat(globalStats.totalStaked || 0) - parseFloat(globalStats.adminBalance || 0);

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <img src={distributedOrneIcon} alt="Total $ORNE Supply" />
          </div>
          <div className="stat-label">
            Total $ORNE Supply
            <InfoTooltip title="Total $ORNE Supply" content="Total supply of $ORNE tokens minted at genesis.">
              <span className="tooltip-icon text-secondary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">100,000,000</div>
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
          <div className="stat-value">{circulatingSupply.toLocaleString('en-US')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <img src={totalHoldersIcon} alt="Total Holders" />
          </div>
          <div className="stat-label">
            Total Holders
            <InfoTooltip title="Total Holders" content="Number of unique addresses that have ever held $ORNE tokens.">
              <span className="tooltip-icon text-secondary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{window.orneGlobalStatsV5?.uniqueHolders != null ? window.orneGlobalStatsV5.uniqueHolders.toLocaleString('en-US') : 'N/A'}</div>
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
          <div className="stat-value">{window.orneGlobalStatsV5?.uniqueStakers != null ? window.orneGlobalStatsV5.uniqueStakers.toLocaleString('en-US') : 'N/A'}</div>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 className="title text-center mb-20">$ORNE Token Holders</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', minWidth: 520 }}>
            <thead>
              <tr>
                <th className="text-left">Address</th>
                <th className="text-right">Total holding</th>
                <th className="text-right">Liquid</th>
                <th className="text-right">Staking</th>
                <th className="text-right">Unstaking</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted" style={{ padding: 24 }}>No holders found.</td></tr>
              )}
              {sorted.map(h => (
                <tr key={h.address}>
                  <td style={{ fontFamily: 'monospace', maxWidth: 220, overflowWrap: 'break-word' }}>
                    <a href={ARBISCAN_URL + h.address} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>{h.address}</a>
                  </td>
                  <td className="text-right">{h.totalHolding.toLocaleString('en-US', { maximumFractionDigits: 4 })}</td>
                  <td className="text-right">{h.totalLiquid.toLocaleString('en-US', { maximumFractionDigits: 4 })}</td>
                  <td className="text-right">{h.totalStaking.toLocaleString('en-US', { maximumFractionDigits: 4 })}</td>
                  <td className="text-right">{h.totalUnstaking.toLocaleString('en-US', { maximumFractionDigits: 4 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-muted text-center mt-15" style={{ fontSize: 13 }}>
          All amounts are in $ORNE. Balances are computed from on-chain indexed events.<br/>
        </div>
      </div>
    </>
  );
}

export default Holders; 
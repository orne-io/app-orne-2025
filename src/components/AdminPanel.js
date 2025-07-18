import React, { useState, useEffect } from 'react';
import InfoTooltip from './InfoTooltip';
import ornePriceIcon from '../images/orne-price.png';
import circulatingOrneIcon from '../images/circulating-orne.png';
import userStakingIcon from '../images/user-staking.png';
import distributedOrneIcon from '../images/distributed-orne.png';
import totalHoldersIcon from '../images/total-holders.png';

const AdminPanel = ({
  adminData,
  setAdminData,
  globalStats,
  dashboardData,
  addCO2,
  distributeRewards,
  setUnstakingDelay,
  loading,
  status,
  styles
}) => {
  const [currentUnstakingDelay, setCurrentUnstakingDelay] = useState(null);
  const [indexerStatus, setIndexerStatus] = useState({ lastBlock: null, lastActionDate: null, dbLastModified: null });
  const [apiStatus, setApiStatus] = useState('loading');

  // Charger le délai d'unstaking actuel
  useEffect(() => {
    fetch('/api/current-unstaking-delay')
      .then(res => res.json())
      .then(data => setCurrentUnstakingDelay(data))
      .catch(() => setCurrentUnstakingDelay(null));
    // Charger le status de l'indexeur
    fetch('/api/indexer-status')
      .then(res => res.json())
      .then(data => {
        setIndexerStatus(data);
        setApiStatus('online');
      })
      .catch(() => {
        setIndexerStatus({ lastBlock: null, lastActionDate: null, dbLastModified: null });
        setApiStatus('offline');
      });
  }, []);

  return (
    <div>
      {/* Titre principal */}
      <div style={{
        ...styles.card,
        background: 'linear-gradient(135deg, #89be83, #6fa869)',
        color: 'white',
        marginBottom: '30px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem' }}>
          🔧 Administration Panel
        </h2>
      </div>

      {/* Status Message */}
      {status.message && (
        <div style={{
          ...styles.status,
          ...(status.type === 'success' ? styles.statusSuccess :
              status.type === 'error' ? styles.statusError :
              styles.statusWarning)
        }}>
          {status.message}
        </div>
      )}

      {/* 4 blocs stats uniformisés */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-icon"><img src={ornePriceIcon} alt="Total Staked" /></div>
          <div className="stat-label">
            Total Staked
            <InfoTooltip title="Total Staked" content="Total amount of $ORNE tokens currently staked by all users.">
              <span className="tooltip-icon text-primary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{parseFloat(globalStats.totalStaked).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><img src={circulatingOrneIcon} alt="CO2 per $ORNE" /></div>
          <div className="stat-label">
            CO2 per $ORNE
            <InfoTooltip title="CO2 per $ORNE" content="Current amount of CO2 (in grams) offset per staked $ORNE token.">
              <span className="tooltip-icon text-primary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{Number(globalStats.co2PerOrne).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} g</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><img src={distributedOrneIcon} alt="Total CO2" /></div>
          <div className="stat-label">
            Total CO2
            <InfoTooltip title="Total CO2" content="Total tonnes of CO2 offset by all staked $ORNE tokens.">
              <span className="tooltip-icon text-primary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{dashboardData.totalCO2Offset} t</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><img src={userStakingIcon} alt="Stakers" /></div>
          <div className="stat-label">
            Stakers
            <InfoTooltip title="Stakers" content="Number of unique users currently staking $ORNE tokens.">
              <span className="tooltip-icon text-primary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{window.orneGlobalStatsV5?.uniqueStakers != null ? window.orneGlobalStatsV5.uniqueStakers : 'N/A'}</div>
        </div>
      </div>

      {/* Actions d'administration */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
        {/* Gestion CO2 */}
        <div style={{ ...styles.card, flex: 1 }}>
          <h3 style={{ color: '#28a745', marginBottom: '20px', fontSize: '1.5rem', fontWeight: '600' }}>
            🌱 CO2 Management
          </h3>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
              Tons of CO2 to add
            </label>
            <input
              type="number"
              value={adminData.co2ToAdd}
              onChange={(e) => setAdminData(prev => ({ ...prev, co2ToAdd: e.target.value }))}
              placeholder="Ex: 5"
              step="0.1"
              style={styles.input}
            />
          </div>
          
          <button
            onClick={addCO2}
            disabled={loading || !adminData.co2ToAdd || parseFloat(adminData.co2ToAdd) <= 0}
            style={{
              ...styles.button,
              backgroundColor: '#28a745',
              ...(loading || !adminData.co2ToAdd || parseFloat(adminData.co2ToAdd) <= 0 ? 
                {opacity: 0.5, cursor: 'not-allowed'} : {})
            }}
          >
            {loading ? '⏳ Adding...' : '🌱 Add CO2'}
          </button>

          {/* Historique CO2 */}
          <div style={{ marginTop: '25px' }}>
            <h4 style={{ color: '#383e5c', marginBottom: '15px', fontSize: '1.1rem', fontWeight: '600' }}>📈 CO2 History</h4>
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {adminData.co2History.map((entry, index) => (
                <div key={index} style={{
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                  padding: '10px',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>{entry.tonnes} tonnes</strong></span>
                    <span>{entry.date}</span>
                  </div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    TX: {entry.txHash}
                  </div>
                </div>
              ))}
              {adminData.co2History.length === 0 && (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No history yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Gestion Rewards */}
        <div style={{ ...styles.card, flex: 1 }}>
          <h3 style={{ color: '#89be83', marginBottom: '20px', fontSize: '1.5rem', fontWeight: '600' }}>
            💰 Rewards Management
          </h3>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
              $ORNE amount to distribute
            </label>
            <input
              type="number"
              value={adminData.rewardsToAdd}
              onChange={(e) => setAdminData(prev => ({ ...prev, rewardsToAdd: e.target.value }))}
              placeholder="Ex: 1000"
              step="0.1"
              style={styles.input}
            />
          </div>
          
          <button
            onClick={distributeRewards}
            disabled={loading || !adminData.rewardsToAdd || parseFloat(adminData.rewardsToAdd) <= 0}
            style={{
              ...styles.button,
              ...(loading || !adminData.rewardsToAdd || parseFloat(adminData.rewardsToAdd) <= 0 ? 
                {opacity: 0.5, cursor: 'not-allowed'} : {})
            }}
          >
            {loading ? '⏳ Distributing...' : '💰 Distribute Rewards'}
          </button>

          {/* Historique Rewards */}
          <div style={{ marginTop: '25px' }}>
            <h4 style={{ color: '#383e5c', marginBottom: '15px', fontSize: '1.1rem', fontWeight: '600' }}>📈 Rewards History</h4>
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {adminData.rewardsHistory.map((entry, index) => (
                <div key={index} style={{
                  backgroundColor: 'rgba(137, 190, 131, 0.1)',
                  padding: '10px',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>{entry.amount} $ORNE</strong></span>
                    <span>{entry.date}</span>
                  </div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    TX: {entry.txHash}
                  </div>
                </div>
              ))}
              {adminData.rewardsHistory.length === 0 && (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No history yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unstaking Delay + Admin Info */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
        {/* Configuration Unstaking Delay */}
        <div style={{ ...styles.card, flex: 1 }}>
          <h3 style={{ color: '#6c757d', marginBottom: '20px', fontSize: '1.5rem', fontWeight: '600' }}>⏱️ Unstaking Delay Configuration</h3>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '6px', 
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            <strong>Quick reference:</strong> 21 days = 30,240 minutes
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
              Unstaking Delay (minutes)
            </label>
            <input
              type="number"
              value={adminData.unstakingDelayMinutes}
              onChange={(e) => setAdminData(prev => ({ ...prev, unstakingDelayMinutes: e.target.value }))}
              placeholder={currentUnstakingDelay ? 
                `Current: ${currentUnstakingDelay.delayMinutes.toFixed(0)} minutes` : 
                "Enter new delay in minutes"}
              min="1"
              max="525600"
              style={styles.input}
            />
          </div>
          <button
            onClick={setUnstakingDelay}
            disabled={loading || !adminData.unstakingDelayMinutes || parseFloat(adminData.unstakingDelayMinutes) <= 0}
            style={{
              ...styles.button,
              backgroundColor: '#6c757d',
              ...(loading || !adminData.unstakingDelayMinutes || parseFloat(adminData.unstakingDelayMinutes) <= 0 ? 
                {opacity: 0.5, cursor: 'not-allowed'} : {})
            }}
          >
            {loading ? '⏳ Updating...' : '⏱️ Update Unstaking Delay'}
          </button>
        </div>
        {/* Bloc Admin Info */}
        <div style={{ ...styles.card, flex: 1, background: '#f8f9fa', color: '#383e5c' }}>
          <h3 style={{ color: '#383e5c', marginBottom: '20px', fontSize: '1.5rem', fontWeight: '600' }}>🛠️ Admin Info</h3>
          <div style={{ fontSize: '15px', color: '#383e5c', marginBottom: 8 }}>
            <strong>Last indexed block:</strong> {indexerStatus.lastBlock ?? 'N/A'}
          </div>
          <div style={{ fontSize: '15px', color: '#383e5c', marginBottom: 8 }}>
            <strong>Last action on DApp:</strong> {indexerStatus.lastActionDate ? new Date(indexerStatus.lastActionDate).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
          </div>
          <div style={{ fontSize: '15px', color: '#383e5c', marginBottom: 8 }}>
            <strong>DB last modified:</strong> {indexerStatus.dbLastModified ? new Date(indexerStatus.dbLastModified).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
          </div>
          <div style={{ fontSize: '15px', color: '#383e5c', marginBottom: 8 }}>
            <strong>API status:</strong> {apiStatus === 'online' ? <span style={{ color: '#28a745' }}>Online</span> : <span style={{ color: '#dc3545' }}>Offline</span>}
          </div>
        </div>
      </div>
      {/* Fin du container principal */}
    </div>
  );
};

export default AdminPanel;
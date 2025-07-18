import React, { useState, useEffect } from 'react';

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

  // Charger le délai d'unstaking actuel
  useEffect(() => {
    fetch('/api/current-unstaking-delay')
      .then(res => res.json())
      .then(data => setCurrentUnstakingDelay(data))
      .catch(() => setCurrentUnstakingDelay(null));
  }, []);

  return (
    <div>
      <div style={{
        ...styles.card,
        background: 'linear-gradient(135deg, #89be83, #6fa869)',
        color: 'white',
        marginBottom: '30px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem' }}>
          🔧 Administration Panel
        </h2>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Rewards and CO2 offset management - V5 Contract
        </p>
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

      {/* Actions d'administration */}
      <div style={styles.actionGrid}>
        {/* Gestion CO2 */}
        <div style={styles.card}>
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
        <div style={styles.card}>
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

      {/* Statistiques actuelles */}
      <div style={styles.card}>
        <h3 style={{ color: '#383e5c', marginBottom: '20px', fontSize: '1.5rem', fontWeight: '600' }}>📊 Current Statistics</h3>
        <div style={styles.userStatsGrid}>
          <div style={styles.userStatCard}>
            <h4 style={styles.userStatTitle}>Total Staked</h4>
            <p style={styles.userStatValue}>{parseFloat(globalStats.totalStaked).toFixed(0)} $ORNE</p>
          </div>
          <div style={styles.userStatCard}>
            <h4 style={styles.userStatTitle}>CO2 per $ORNE</h4>
            <p style={styles.userStatValue}>{Number(globalStats.co2PerOrne).toFixed(2)} g</p>
          </div>
          <div style={styles.userStatCard}>
            <h4 style={styles.userStatTitle}>Total CO2</h4>
            <p style={styles.userStatValue}>{dashboardData.totalCO2Offset} t</p>
          </div>
          <div style={styles.userStatCard}>
            <h4 style={styles.userStatTitle}>Stakers</h4>
            <p style={styles.userStatValue}>{window.orneGlobalStatsV5?.uniqueStakers != null ? window.orneGlobalStatsV5.uniqueStakers : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Configuration Unstaking Delay */}
      <div style={styles.card}>
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

      {/* Calculs automatiques */}
      <div style={styles.card}>
        <h3 style={{ color: '#383e5c', marginBottom: '20px' }}>🧮 Automatic Calculations</h3>
        <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>CO2 per $ORNE formula:</strong> Total CO2 (grams) ÷ Total staked $ORNE
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>If you add {adminData.co2ToAdd || 'X'} tons:</strong>
          </p>
          <ul style={{ margin: '10px 0', paddingLeft: '20px', fontSize: '14px' }}>
            <li>+ {(parseFloat(adminData.co2ToAdd || 0) * 1000000).toLocaleString()} grams to total</li>
            <li>New CO2/$ORNE ≈ {parseFloat(globalStats.totalStaked) > 0 ? 
              Math.round(
                ((parseFloat(String(globalStats.co2PerOrne).replace(/,/g, '')) || 0) * parseFloat(globalStats.totalStaked) + (parseFloat(adminData.co2ToAdd || 0) * 1000000)) / parseFloat(globalStats.totalStaked)
              ).toLocaleString() : 0} grams</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
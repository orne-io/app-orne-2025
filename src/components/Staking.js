import React, { useState, useEffect } from 'react';
import { CONFIG } from '../config/config';
import {
  encodeUint256,
  getMethodSignature,
  sendTransaction,
  waitForTransaction,
  getCurrentAllowance,
  parseEtherFixed,
  formatTimeRemaining,
  getApproveData,
  getTransactionErrorMessage
} from '../utils/contractUtils';
import InfoTooltip from './InfoTooltip';
import { useAccount } from 'wagmi';
import balanceOrneIcon from '../images/balance-orne.png';
import stakedOrneIcon from '../images/staked-orne.png';
import rewardsIcon from '../images/rewards.png';
import unstakingIcon from '../images/unstaking.png';
import { useNotificationContext } from '../contexts/NotificationContext';

const Staking = ({
  userStats,
  globalStats,
  loadUserData,
  loadGlobalStats,
  loading,
  setLoading,
  status,
  showStatus,
  styles
}) => {
  const { address, isConnected } = useAccount();
  const { showSuccess, showError, showWarning, showInfo } = useNotificationContext();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isConnected && address) {
      fetch(`/api/history-staked/${address}`)
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(() => setHistory([]));
    } else {
      setHistory([]);
    }
  }, [isConnected, address]);

  // Fonctions utilitaires pour le staking
  const fillMaxAmount = () => {
    const maxAmount = parseFloat(userStats.orneBalance);
    if (maxAmount <= 0) {
      showError('No $ORNE token available');
      return;
    }
    const amountToFill = Math.max(maxAmount - 0.001, 0);
    if (amountToFill <= 0) {
      showError('Insufficient balance');
      return;
    }
    setStakeAmount(amountToFill.toString());
    showSuccess(`Maximum amount set: ${amountToFill.toFixed(4)} $ORNE`);
  };

  const fillPercentage = (percentage) => {
    const maxAmount = parseFloat(userStats.orneBalance);
    if (maxAmount <= 0) {
      showError('No $ORNE token available');
      return;
    }
    const amountToFill = (maxAmount * percentage / 100);
    if (amountToFill <= 0) {
      showError('Insufficient balance');
      return;
    }
    setStakeAmount(amountToFill.toFixed(4));
    showSuccess(`${percentage}% of balance set: ${amountToFill.toFixed(4)} $ORNE`);
  };

  const smartStake = async () => {
    if (!stakeAmount || stakeAmount <= 0) {
      showError('Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(true);
      const amountToStake = parseFloat(stakeAmount);
      
      showInfo('Checking allowance...');
      const currentAllowance = await getCurrentAllowance(address);
      
      if (currentAllowance < amountToStake) {
        showWarning('Approving tokens...');
        
        const approvalAmount = Math.max(amountToStake * 2, 1000);
        // Utiliser getApproveData pour encoder correctement
        const approvalData = getApproveData(CONFIG.STAKING_VAULT_ADDRESS, approvalAmount.toString());
        
        const approvalTxHash = await sendTransaction(CONFIG.ORNE_TOKEN_ADDRESS, approvalData, address, '0x0', undefined);
        showInfo(`Approval sent (${approvalTxHash.slice(0, 10)}...)`);
        
        await waitForTransaction(approvalTxHash, 'Approval');
        showSuccess('Approval confirmed!');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      showWarning('Staking in progress...');
      
      const stakingAmount = encodeUint256(stakeAmount);
      const stakingData = getMethodSignature('stake(uint256)') + stakingAmount;
      
      const stakingTxHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, stakingData, address, '0x0', undefined);
      showInfo(`Staking sent (${stakingTxHash.slice(0, 10)}...)`);
      
      await waitForTransaction(stakingTxHash, 'Staking');
      
      showSuccess(`Staking of ${amountToStake} $ORNE successful!`);
      setStakeAmount('');
      
      // Recharger les données utilisateur ET globales
      setTimeout(() => {
        loadUserData();
        loadGlobalStats();
      }, 3000);
      
    } catch (error) {
      console.error('Erreur smart staking:', error);
      const errorMessage = getTransactionErrorMessage(error, CONFIG.STAKING_VAULT_ADDRESS, 'stake');
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour l'unstaking
  const fillMaxUnstakeAmount = () => {
    const maxAmount = parseFloat(userStats.stakedBalance);
    if (maxAmount <= 0) {
      showError('No $ORNE staked available');
      return;
    }
    const amountToFill = Math.max(maxAmount - 0.001, 0);
    if (amountToFill <= 0) {
      showError('Insufficient staked balance');
      return;
    }
    setUnstakeAmount(amountToFill.toString());
    showSuccess(`Maximum amount set: ${amountToFill.toFixed(4)} $ORNE`);
  };

  const fillUnstakePercentage = (percentage) => {
    const maxAmount = parseFloat(userStats.stakedBalance);
    if (maxAmount <= 0) {
      showError('No $ORNE staked available');
      return;
    }
    const amountToFill = (maxAmount * percentage / 100);
    if (amountToFill <= 0) {
      showError('Insufficient staked balance');
      return;
    }
    setUnstakeAmount(amountToFill.toFixed(4));
    showSuccess(`${percentage}% of staked balance set: ${amountToFill.toFixed(4)} $ORNE`);
  };

  const requestUnstake = async () => {
    if (!unstakeAmount || unstakeAmount <= 0) {
      showError('Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(true);
      showWarning('Requesting unstaking...');
      
      const stakedBalance = parseFloat(userStats.stakedBalance);
      const requestAmount = parseFloat(unstakeAmount);
      
      if (requestAmount > stakedBalance) {
        showError('Error: Amount exceeds staked balance');
        return;
      }
      
      const amountWei = parseEtherFixed(unstakeAmount);
      const amountHex = amountWei.toString(16).padStart(64, '0');
      const data = getMethodSignature('requestUnstake(uint256)') + amountHex;
      
      const txHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, data, address, '0x0', undefined);
      showInfo(`Unstaking sent (${txHash.slice(0, 10)}...)`);
      
      await waitForTransaction(txHash, 'Unstaking');
      
      showSuccess(`Unstaking confirmed! Wait 21 days.`);
      setUnstakeAmount('');
      
      setTimeout(() => {
        loadUserData();
        loadGlobalStats();
      }, 3000);
      
    } catch (error) {
      console.error('Erreur unstaking:', error);
      showError('Error: ' + (error.message || 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  const unstakeTokens = async () => {
    try {
      setLoading(true);
      showWarning('Recovering tokens...');
      
      const data = getMethodSignature('unstake()');
      const txHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, data, address, '0x0', undefined);
      
      showInfo(`Recovery sent (${txHash.slice(0, 10)}...)`);
      
      await waitForTransaction(txHash, 'Recovery of tokens');
      
      showSuccess(`Tokens recovered successfully!`);
      setTimeout(() => {
        loadUserData();
        loadGlobalStats();
      }, 3000);
      
    } catch (error) {
      console.error('Erreur de récupération:', error);
      showError('Error: ' + (error.message || 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  const claimRewards = async () => {
    try {
      setLoading(true);
      showWarning('Recovering rewards...');
      
      const data = getMethodSignature('claimRewards()');
      const txHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, data, address, '0x0', undefined);
      
      showSuccess(`Rewards recovered! Hash: ${txHash.slice(0, 10)}...`);
      setTimeout(() => {
        loadUserData();
        loadGlobalStats();
      }, 5000);
      
    } catch (error) {
      console.error('Erreur de récupération des rewards:', error);
      showError('Error: ' + (error.message || 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  const cancelUnstake = async () => {
    try {
      setLoading(true);
      showWarning('Cancelling unstaking request...');
      
      const data = getMethodSignature('cancelUnstake()');
      const txHash = await sendTransaction(CONFIG.STAKING_VAULT_ADDRESS, data, address, '0x0', undefined);
      
      showInfo(`Cancellation sent (${txHash.slice(0, 10)}...)`);
      
      await waitForTransaction(txHash, 'Cancellation');
      
      showSuccess(`Unstaking request cancelled!`);
      
      setTimeout(() => {
        loadUserData();
        loadGlobalStats();
      }, 3000);
      
    } catch (error) {
      console.error('Erreur d\'annulation:', error);
      showError('Error: ' + (error.message || 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  // Si pas connecté
  if (!isConnected) {
    return (
      <div className="card">
        <h2 className="title title-large text-center mb-30">
          Connect your wallet to access staking
        </h2>
        <div className="text-center">
          <p className="text-muted">Please connect your wallet using the button at the top right.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Status Message */}
      {status.message && (
        <div className={`alert alert-${status.type === 'success' ? 'success' : status.type === 'error' ? 'error' : 'warning'}`}>
          {status.message}
        </div>
      )}

      {/* Statistiques utilisateur */}
      <div className="user-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <img src={balanceOrneIcon} alt="Balance $ORNE" />
          </div>
          <div className="stat-label">
            Balance $ORNE
            <InfoTooltip title="Balance $ORNE" content="Your current $ORNE token balance available in your wallet.">
              <span className="tooltip-icon text-primary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{parseFloat(userStats.orneBalance).toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <img src={stakedOrneIcon} alt="Staked $ORNE" />
          </div>
          <div className="stat-label">
            Staked $ORNE
            <InfoTooltip title="Staked $ORNE" content="Total $ORNE tokens you have currently staked in the vault.">
              <span className="tooltip-icon text-primary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{parseFloat(userStats.stakedBalance).toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <img src={rewardsIcon} alt="Rewards" />
          </div>
          <div className="stat-label">
            Rewards
            <InfoTooltip title="Rewards" content="$ORNE tokens you have earned as staking rewards and can claim.">
              <span className="tooltip-icon text-primary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{parseFloat(userStats.pendingRewards).toFixed(4)} $ORNE</div>
          {parseFloat(userStats.pendingRewards) > 0 && (
            <button
              onClick={claimRewards}
              disabled={loading}
              className="btn btn-success btn-small btn-full"
              style={{ marginTop: '8px' }}
            >
              {loading ? '⏳ Claiming...' : '🎁 Claim Rewards'}
            </button>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <img src={unstakingIcon} alt="Unstaking" />
          </div>
          <div className="stat-label">
            Unstaking
            <InfoTooltip title="Unstaking" content="$ORNE tokens you have requested to unstake and are waiting for the delay to finish.">
              <span className="tooltip-icon text-primary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </div>
          <div className="stat-value">{parseFloat(userStats.unstakingAvailable).toFixed(2)}</div>
        </div>
      </div>

      {/* Actions de staking et unstaking */}
      <div className="action-grid">
        {/* Staking */}
        <div className="card">
          <h3 className="title title-primary flex items-center" style={{ gap: 6 }}>
            💰 Staking
            <InfoTooltip title="Staking" content="Stake your $ORNE tokens to earn rewards and contribute to CO2 offset.">
              <span className="tooltip-icon text-primary">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </h3>
          
          <div className="text-muted mb-15">
            💳 Available balance: <strong>{parseFloat(userStats.orneBalance).toFixed(4)} $ORNE</strong>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Amount to stake
            </label>
            <div className="input-container">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.0"
                step="0.1"
                className="form-input"
              />
              <button
                onClick={fillMaxAmount}
                disabled={loading || parseFloat(userStats.orneBalance) <= 0}
                className="btn-max"
              >
                MAX
              </button>
            </div>
          </div>
          
          <div className="flex gap-5 mb-15" style={{ flexWrap: 'wrap' }}>
            {[25, 50, 75, 100].map(percentage => (
              <button
                key={percentage}
                onClick={() => fillPercentage(percentage)}
                disabled={loading}
                className={`btn-percentage ${percentage === 100 ? 'active' : ''}`}
              >
                {percentage}%
              </button>
            ))}
          </div>
          
          <button
            onClick={smartStake}
            disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0}
            className={`btn btn-full ${loading || !stakeAmount || parseFloat(stakeAmount) <= 0 ? 'btn-secondary' : 'btn-primary'}`}
          >
            {loading ? '⏳ Staking in progress...' : '🚀 Stake my $ORNE'}
          </button>
        </div>
        
        {/* Unstaking */}
        <div className="card">
          <h3 className="title title-danger flex items-center" style={{ gap: 6 }}>
            📤 Unstaking
            <InfoTooltip title="Unstaking" content="Request to unstake your $ORNE tokens. After the delay, you can withdraw them back to your wallet.">
              <span className="tooltip-icon text-danger">
                <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
              </span>
            </InfoTooltip>
          </h3>
          <div className="text-muted mb-15">
            🔒 Staked balance: <strong>{parseFloat(userStats.stakedBalance).toFixed(4)} $ORNE</strong>
          </div>
          {/* Affichage de l'unstaking en cours */}
          {parseFloat(userStats.unstakingAvailable) > 0 ? (
            <div className="alert alert-warning mb-20">
              <h4 className="mb-10" style={{ color: '#856404', fontSize: '16px' }}>
                ⏳ Unstaking in progress
              </h4>
              <p className="mb-5" style={{ fontSize: '14px', color: '#856404' }}>
                <strong>Amount:</strong> {parseFloat(userStats.unstakingAvailable).toFixed(4)} $ORNE
              </p>
              {userStats.timeUntilUnstake > 0 && (
                <p className="mb-5" style={{ fontSize: '14px', color: '#856404' }}>
                  <strong>Time remaining:</strong> {formatTimeRemaining(userStats.timeUntilUnstake)}
                </p>
              )}
              <div className="flex gap-10 mt-15">
                <button
                  onClick={unstakeTokens}
                  disabled={loading || !userStats.canUnstake}
                  className={`btn flex-1 ${userStats.canUnstake ? 'btn-success' : 'btn-secondary'}`}
                >
                  {loading ? '⏳ Retrieving...' : 
                   userStats.canUnstake ? '🎉 Retrieve' : 
                   '⏱️ Not available yet'}
                </button>
                <button
                  onClick={cancelUnstake}
                  disabled={loading}
                  className="btn btn-secondary"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">
                  Amount to unstake
            </label>
                <div className="input-container">
              <input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="0.0"
                step="0.1"
                    className="form-input"
              />
              <button
                onClick={fillMaxUnstakeAmount}
                disabled={loading || parseFloat(userStats.stakedBalance) <= 0}
                    className="btn-max"
              >
                MAX
              </button>
            </div>
          </div>
              <div className="flex gap-5 mb-15" style={{ flexWrap: 'wrap' }}>
            {[25, 50, 75, 100].map(percentage => (
              <button
                key={percentage}
                onClick={() => fillUnstakePercentage(percentage)}
                disabled={loading}
                    className={`btn-percentage ${percentage === 100 ? 'active' : ''}`}
              >
                {percentage}%
              </button>
            ))}
          </div>
          <button
            onClick={requestUnstake}
            disabled={loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                className={`btn btn-danger btn-full ${loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0 ? 'btn-secondary' : ''}`}
          >
                {loading ? '⏳ Requesting...' : '📤 Request Unstaking'}
          </button>
            </>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h3 className="title flex items-center" style={{ gap: 6 }}>
          📊 Transaction History
          <InfoTooltip title="Transaction History" content="View all your staking, unstaking, and claim transactions for your wallet.">
            <span className="tooltip-icon text-secondary">
              <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1621_4337)"><path d="M9.99984 18.3327C5.39734 18.3327 1.6665 14.6018 1.6665 9.99935C1.6665 5.39685 5.39734 1.66602 9.99984 1.66602C14.6023 1.66602 18.3332 5.39685 18.3332 9.99935C18.3332 14.6018 14.6023 18.3327 9.99984 18.3327ZM9.1665 9.16602V14.166H10.8332V9.16602H9.1665ZM9.1665 5.83268V7.49935H10.8332V5.83268H9.1665Z" fill="currentColor"></path></g><defs><clipPath id="clip0_1621_4337"><rect width="20" height="20" fill="currentColor"></rect></clipPath></defs></svg>
            </span>
          </InfoTooltip>
        </h3>
        {isConnected ? (
          history.length === 0 ? (
            <div className="text-muted text-center" style={{ margin: '20px 0' }}>
              No transactions yet.
            </div>
          ) : (
            <div className="transaction-history">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount ($ORNE)</th>
                    <th>Unlock Time</th>
                    <th>Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((tx, idx) => (
                    <tr key={idx}>
                      <td>{tx.date}</td>
                      <td>
                        <span className={`badge ${
                          tx.type === 'Stake' ? 'badge-success' :
                          tx.type === 'Unstake Request' ? 'badge-warning' :
                          tx.type === 'Unstake Final' ? 'badge-danger' :
                          tx.type === 'Claim Rewards' ? 'badge-info' :
                          'badge-secondary'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td>{tx.amount}</td>
                      <td>{tx.unlockTime || '-'}</td>
                      <td>
                        <a href={`https://sepolia.arbiscan.io/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="text-primary">
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
          )
        ) : (
          <div className="text-muted text-center" style={{ margin: '20px 0' }}>
            Connect your wallet to see your transaction history.
          </div>
        )}
      </div>
      

    </>
  );
};

export default Staking;
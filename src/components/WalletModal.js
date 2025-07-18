import React from 'react';
import { useAccount } from 'wagmi';
import { useBalance } from 'wagmi';

const WalletModal = ({ userStats, onClose, styles }) => {
  const { address, chain } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: '#fcf9f8',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3 style={{ color: '#383e5c', marginBottom: '20px', fontSize: '1.5rem' }}>
          🔗 Wallet Information
        </h3>
        
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#383e5c', marginBottom: '8px' }}>
            <strong>Address:</strong> {address}
          </p>
          <p style={{ color: '#383e5c', marginBottom: '8px' }}>
            <strong>Network:</strong> {chain?.name}
          </p>
          <p style={{ color: '#383e5c', marginBottom: '8px' }}>
            <strong>ETH Balance:</strong> {ethBalance ? parseFloat(ethBalance.formatted).toFixed(4) : '...'} ETH
          </p>
          <p style={{ color: '#383e5c', marginBottom: '8px' }}>
            <strong>$ORNE Balance:</strong> {userStats && userStats.orneBalance !== undefined ? parseFloat(userStats.orneBalance).toFixed(4) : '...'} $ORNE
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#89be83',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              flex: 1
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
import React from 'react';

const NotificationContainer = ({ notifications, removeNotification }) => {
  const getNotificationStyle = (type) => {
    const baseStyle = {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '10px',
      maxWidth: '400px',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      animation: 'slideIn 0.3s ease-out',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyle,
          background: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb'
        };
      case 'error':
        return {
          ...baseStyle,
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb'
        };
      case 'warning':
        return {
          ...baseStyle,
          background: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeaa7'
        };
      case 'info':
      default:
        return {
          ...baseStyle,
          background: '#d1ecf1',
          color: '#0c5460',
          border: '1px solid #bee5eb'
        };
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={getNotificationStyle(notification.type)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <span style={{ fontSize: '16px' }}>{getIcon(notification.type)}</span>
            <span style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'inherit' }}>{notification.message}</span>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
    </div>
      ))}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationContainer; 
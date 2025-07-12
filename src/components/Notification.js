import React, { useState, useEffect } from 'react';

const Notification = ({ message, type = 'info', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    // Animation d'entrée
    const enterTimer = setTimeout(() => {
      setIsEntering(false);
    }, 100);

    // Auto-disparition
    const timer = setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300); // Animation duration
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(enterTimer);
    };
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#89be83';
      case 'error':
        return '#dc3545';
      case 'warning':
        return '#ffc107';
      default:
        return '#17a2b8';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isAnimating ? '-100px' : '20px',
        right: '20px',
        background: getBackgroundColor(),
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '300px',
        maxWidth: '400px',
        transition: 'all 0.3s ease-in-out',
        transform: isAnimating ? 'translateY(20px)' : (isEntering ? 'translateY(100px)' : 'translateY(0)'),
        opacity: isAnimating ? 0 : (isEntering ? 0 : 1),
      }}
    >
      <div
        style={{
          fontSize: '18px',
          fontWeight: 'bold',
          minWidth: '20px',
          textAlign: 'center'
        }}
      >
        {getIcon()}
      </div>
      <div style={{ flex: 1, fontSize: '14px' }}>
        {message}
      </div>
      <button
        onClick={() => {
          setIsAnimating(true);
          setTimeout(() => {
            setIsVisible(false);
            onClose?.();
          }, 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '0',
          marginLeft: '10px',
          opacity: 0.7,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0.7}
      >
        ×
      </button>
    </div>
  );
};

export default Notification; 
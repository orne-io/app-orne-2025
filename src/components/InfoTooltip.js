import React, { useState, useRef, useEffect } from 'react';

const isTouchDevice = () => {
  return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
};

const InfoTooltip = ({ content, children, placement = 'top', title }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef();
  const isTouch = isTouchDevice();

  // Fermer au clic en dehors (mobile)
  useEffect(() => {
    if (!isTouch || !visible) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [visible, isTouch]);

  // Gestion hover/clic
  const triggerProps = isTouch
    ? {
        onClick: () => setVisible(v => !v)
      }
    : {
        onMouseEnter: () => setVisible(true),
        onMouseLeave: () => setVisible(false)
      };

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-block' }} {...triggerProps}>
      {children}
      {visible && (
        <div style={{
          position: 'absolute',
          zIndex: 1000,
          minWidth: 220,
          maxWidth: 320,
          background: '#232323',
          color: 'white',
          borderRadius: 10,
          boxShadow: '0 6px 32px rgba(0,0,0,0.25)',
          padding: '14px 18px',
          fontSize: 15,
          left: placement === 'right' ? '100%' : '50%',
          top: placement === 'top' ? '-12px' : '100%',
          transform: placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
          whiteSpace: 'pre-line',
          pointerEvents: 'auto',
        }}>
          {/* Flèche */}
          <div style={{
            position: 'absolute',
            left: placement === 'right' ? '-8px' : '50%',
            top: placement === 'top' ? '100%' : '-8px',
            transform: placement === 'top' ? 'translateX(-50%)' : '',
            width: 0,
            height: 0,
            borderLeft: placement === 'right' ? '8px solid #232323' : '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: placement === 'top' ? '8px solid #232323' : '8px solid transparent',
            borderBottom: placement === 'top' ? '8px solid transparent' : '8px solid #232323',
          }} />
          {title && (
            <div style={{ color: '#FFF', fontWeight: 700, fontSize: 16, marginBottom: 6, textTransform: 'none' }}>{title}</div>
          )}
          <div style={{ color: '#fcf9f8', fontSize: 13, fontWeight: 400, lineHeight: 1.5, textTransform: 'none' }}>{content}</div>
        </div>
      )}
    </span>
  );
};

export default InfoTooltip; 
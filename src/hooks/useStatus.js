import { useState, useCallback } from 'react';

export const useStatus = () => {
  const [status, setStatus] = useState({ message: '', type: '' });

  const showStatus = useCallback((message, type) => {
    setStatus({ message, type });
    setTimeout(() => setStatus({ message: '', type: '' }), 5000);
  }, []);

  const clearStatus = useCallback(() => {
    setStatus({ message: '', type: '' });
  }, []);

  return {
    status,
    showStatus,
    clearStatus
  };
};
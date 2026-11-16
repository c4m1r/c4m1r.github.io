import React, { useEffect, useState } from 'react';
import './toast.scss';

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  if (!isVisible) return null;
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  return (
    <div className={`toast ${type}`} role="alert" aria-live="polite">
      <span className="toast-icon" aria-hidden="true">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button 
        className="toast-close"
        onClick={() => setIsVisible(false)}
        aria-label="Close notification"
        type="button"
      >
        ✕
      </button>
    </div>
  );
}

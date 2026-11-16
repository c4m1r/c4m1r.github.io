import React from 'react';
import './loadingSpinner.scss';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}

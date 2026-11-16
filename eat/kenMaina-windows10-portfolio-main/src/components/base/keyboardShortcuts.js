import React, { useState, useEffect } from 'react';
import './keyboardShortcuts.scss';

export default function KeyboardShortcuts() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '?' || e.key === '/') {
        setIsVisible(!isVisible);
      }
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="keyboard-shortcuts-overlay" onClick={() => setIsVisible(false)}>
      <div className="keyboard-shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>⌨ Keyboard Shortcuts</h2>
          <button 
            className="close-button"
            onClick={() => setIsVisible(false)}
            aria-label="Close shortcuts"
          >
            ✕
          </button>
        </div>

        <div className="shortcuts-content">
          <div className="shortcuts-column">
            <h3>Navigation</h3>
            <ul>
              <li>
                <kbd>Tab</kbd>
                <span>Navigate between elements</span>
              </li>
              <li>
                <kbd>Shift + Tab</kbd>
                <span>Navigate backwards</span>
              </li>
              <li>
                <kbd>Enter</kbd>
                <span>Open/Activate selected element</span>
              </li>
              <li>
                <kbd>Escape</kbd>
                <span>Close current window</span>
              </li>
            </ul>
          </div>

          <div className="shortcuts-column">
            <h3>Window Management</h3>
            <ul>
              <li>
                <kbd>↑ ↓ ← →</kbd>
                <span>Move window</span>
              </li>
              <li>
                <kbd>Shift + ↑ ↓ ← →</kbd>
                <span>Resize window</span>
              </li>
              <li>
                <kbd>Alt + Tab</kbd>
                <span>Switch windows</span>
              </li>
              <li>
                <kbd>Alt + F4</kbd>
                <span>Close window</span>
              </li>
            </ul>
          </div>

          <div className="shortcuts-column">
            <h3>General</h3>
            <ul>
              <li>
                <kbd>?</kbd>
                <span>Show this help</span>
              </li>
              <li>
                <kbd>Alt + M</kbd>
                <span>Minimize window</span>
              </li>
              <li>
                <kbd>Alt + X</kbd>
                <span>Maximize window</span>
              </li>
              <li>
                <kbd>Alt + R</kbd>
                <span>Restore window</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="shortcuts-footer">
          <p>Press <kbd>?</kbd> or <kbd>Esc</kbd> to close</p>
        </div>
      </div>
    </div>
  );
}

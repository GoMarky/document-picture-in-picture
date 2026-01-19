import { useState, useRef, useEffect, useCallback } from 'react';
import { usePictureInPictureWindow } from '@gomarky/picture-in-picture-window-react';

function App() {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const pipContentRef = useRef<HTMLDivElement>(null);

  const { isSupported, isOpen, open, close, resize, focusOpener } = usePictureInPictureWindow({
    width,
    height,
    copyStyles: true,
    onOpen: (win) => {
      console.log('PiP window opened!', win);
      if (pipContentRef.current) {
        win.document.body.appendChild(pipContentRef.current);
      }
    },
    onClose: () => {
      console.log('PiP window closed!');
    },
  });

  const handleToggle = useCallback(async () => {
    if (isOpen) {
      close();
    } else {
      await open();
    }
  }, [isOpen, open, close]);

  const handleResize = useCallback(() => {
    resize(500, 400);
  }, [resize]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <header>
        <h1>🖼️ Picture-in-Picture Window</h1>
        <p className="subtitle">React Hook Demo</p>
        <div className="react-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(120 12 12)" />
          </svg>
          React
        </div>
      </header>

      <div className="status-bar">
        <div className="status-item">
          <span className={`status-dot ${isSupported ? 'active' : ''}`}></span>
          <span>{isSupported ? 'API Supported' : 'Not Supported'}</span>
        </div>
        <div className="status-item">
          <span className={`status-dot ${isOpen ? 'active' : ''}`}></span>
          <span>{isOpen ? 'Window open' : 'Window closed'}</span>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          Controls
        </h2>

        <div className="input-group">
          <div className="input-wrapper">
            <label htmlFor="width">Width (px)</label>
            <input
              type="number"
              id="width"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min={200}
              max={800}
            />
          </div>
          <div className="input-wrapper">
            <label htmlFor="height">Height (px)</label>
            <input
              type="number"
              id="height"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min={150}
              max={600}
            />
          </div>
        </div>

        <div className="controls">
          <button className="btn-primary" onClick={handleToggle} disabled={!isSupported}>
            {!isOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h6v6M14 10l7-7M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            )}
            {isOpen ? 'Close PiP Window' : 'Open PiP Window'}
          </button>
          <button className="btn-secondary" onClick={handleResize} disabled={!isOpen}>
            Resize to 500x400
          </button>
          <button className="btn-secondary" onClick={focusOpener} disabled={!isOpen}>
            Focus Main Window
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          PiP Content
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          This content will be moved to the Picture-in-Picture window when opened.
        </p>
        <div ref={pipContentRef} className={`pip-content ${isOpen ? 'in-pip' : ''}`}>
          <div className="video-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Video Player Placeholder</span>
          </div>
          <p>Current time: <code>{currentTime}</code></p>
        </div>
      </div>

      {!isSupported && (
        <div className="not-supported">
          ⚠️ Document Picture-in-Picture API is not supported in your browser.
          <br />
          Please use Chrome 116+ or Edge 116+.
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'unlock' | 'exit'

  useEffect(() => {
    // 1. Logo animates in (0–1.2s)
    // 2. Lock appears and turns open (1.2s–1.9s)
    const unlockTimer = setTimeout(() => setPhase('unlock'), 800);
    const exitTimer = setTimeout(() => setPhase('exit'), 1200);
    const doneTimer = setTimeout(() => onComplete(), 2000);
    return () => {
      clearTimeout(unlockTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`splash-overlay ${phase === 'exit' ? 'splash-exit' : ''}`}
      aria-hidden="true"
    >
      {/* Shutter slats pattern */}
      <div className="splash-shutter-slats" />

      {/* Bottom lock bar with rotating handle */}
      <div className={`splash-shutter-bar ${phase !== 'enter' ? 'splash-bar-visible' : ''}`}>
        <div className={`splash-lock-handle ${phase === 'unlock' || phase === 'exit' ? 'splash-lock-open' : ''}`} />
      </div>

      {/* Logo content */}
      <div className={`splash-content ${phase === 'exit' ? 'splash-content-exit' : ''}`}>
        <img
          src="/satguru-splash.png"
          alt=""
          className="splash-logo"
        />
        <div className="splash-shimmer" />
      </div>
    </div>
  );
};

export default SplashScreen;

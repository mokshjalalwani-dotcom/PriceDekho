import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  // Start in 'loading' phase so animation doesn't begin until image is ready
  const [phase, setPhase] = useState('loading'); 

  useEffect(() => {
    // Don't start timers until the image has actually loaded
    if (phase === 'loading') return;

    const unlockTimer = setTimeout(() => setPhase('unlock'), 800);
    const exitTimer = setTimeout(() => setPhase('exit'), 1200);
    const doneTimer = setTimeout(() => onComplete(), 2000);
    return () => {
      clearTimeout(unlockTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [phase, onComplete]);

  // Failsafe: if the image is already cached, onLoad might not fire
  useEffect(() => {
    const img = new Image();
    img.src = '/satguru-splash.png';
    if (img.complete) {
      setPhase(p => p === 'loading' ? 'enter' : p);
    }
  }, []);

  return (
    <div
      className={`splash-overlay ${phase === 'exit' ? 'splash-exit' : ''}`}
      aria-hidden="true"
    >
      {/* Shutter slats pattern */}
      <div className="splash-shutter-slats" />

      {/* Bottom lock bar with rotating handle */}
      <div className={`splash-shutter-bar ${phase === 'unlock' || phase === 'exit' ? 'splash-bar-visible' : ''}`}>
        <div className={`splash-lock-handle ${phase === 'unlock' || phase === 'exit' ? 'splash-lock-open' : ''}`} />
      </div>

      {/* Logo content — only animate enter once loaded */}
      <div className={`splash-content ${phase === 'exit' ? 'splash-content-exit' : ''} ${phase === 'loading' ? 'opacity-0' : ''}`}>
        <img
          src="/satguru-splash.png"
          alt=""
          className="splash-logo"
          onLoad={() => setPhase(p => p === 'loading' ? 'enter' : p)}
        />
        {phase !== 'loading' && <div className="splash-shimmer" />}
      </div>
    </div>
  );
};

export default SplashScreen;

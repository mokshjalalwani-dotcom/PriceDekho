import React, { useState, useEffect, useRef } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState('loading'); // 'loading' | 'enter' | 'unlock' | 'exit'
  const timersRef = useRef([]);

  useEffect(() => {
    // Preload the splash image before starting any animation
    const img = new Image();
    img.src = '/satguru-splash.png';

    const startAnimation = () => {
      setPhase('enter');
      timersRef.current = [
        setTimeout(() => setPhase('unlock'), 800),
        setTimeout(() => setPhase('exit'), 1200),
        setTimeout(() => onComplete(), 2000),
      ];
    };

    if (img.complete) {
      // Already cached
      startAnimation();
    } else {
      img.onload = startAnimation;
      // If image fails to load, still run the animation after 1s fallback
      img.onerror = () => setTimeout(startAnimation, 100);
    }

    return () => timersRef.current.forEach(clearTimeout);
  }, [onComplete]);

  // Don't render anything visible until image is ready
  if (phase === 'loading') {
    return (
      <div className="splash-overlay" aria-hidden="true">
        <div className="splash-shutter-slats" />
        <div className="splash-shutter-bar">
          <div className="splash-lock-handle" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`splash-overlay ${phase === 'exit' ? 'splash-exit' : ''}`}
      aria-hidden="true"
    >
      {/* Shutter slats pattern */}
      <div className="splash-shutter-slats" />

      {/* Bottom lock bar with rotating handle */}
      <div className="splash-shutter-bar">
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

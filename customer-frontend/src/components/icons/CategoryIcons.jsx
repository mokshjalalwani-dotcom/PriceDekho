import React from 'react';

// Common SVG props to match PriceDekho's ultra-thin modern outline style
const commonProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const TvIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
    <path d="M17 2l-5 5-5-5"></path>
    <text x="12" y="16" textAnchor="middle" dominantBaseline="middle" fill="currentColor" stroke="none" fontSize="6" fontWeight="bold" fontFamily="Arial, sans-serif">TV</text>
  </svg>
);

export const RefrigeratorIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
    <path d="M5 10h14"></path>
    <path d="M9 4v4"></path>
    <path d="M9 12v5"></path>
  </svg>
);

export const AcIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <rect x="2" y="5" width="20" height="8" rx="2" ry="2"></rect>
    <path d="M4 9h16"></path>
    <path d="M17 7h2"></path>
    <path d="M6 16v3"></path>
    <path d="M10 16v4"></path>
    <path d="M14 16v4"></path>
    <path d="M18 16v3"></path>
  </svg>
);

export const WashingMachineIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <circle cx="12" cy="13" r="5"></circle>
    <path d="M4 6h16"></path>
    <circle cx="16" cy="4" r="0.5"></circle>
    <circle cx="18" cy="4" r="0.5"></circle>
    <path d="M6 4h4"></path>
  </svg>
);

export const MicrowaveIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
    <rect x="4" y="8" width="12" height="8" rx="1"></rect>
    <path d="M18 8v.01"></path>
    <path d="M18 11v.01"></path>
    <path d="M18 14v.01"></path>
    <path d="M6 10l2 4 2-4 2 4"></path>
  </svg>
);

export const SoundSystemIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <rect x="9" y="8" width="6" height="12" rx="1"></rect>
    <circle cx="12" cy="11" r="1.5"></circle>
    <circle cx="12" cy="16" r="2.5"></circle>
    <rect x="2" y="10" width="5" height="10" rx="1"></rect>
    <circle cx="4.5" cy="13" r="1"></circle>
    <circle cx="4.5" cy="17" r="1.5"></circle>
    <rect x="17" y="10" width="5" height="10" rx="1"></rect>
    <circle cx="19.5" cy="13" r="1"></circle>
    <circle cx="19.5" cy="17" r="1.5"></circle>
  </svg>
);

export const DishwasherIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
    {/* Outer Box */}
    <rect x="10" y="10" width="80" height="80" rx="8" />
    {/* Control Panel Line */}
    <line x1="10" y1="30" x2="90" y2="30" />
    {/* Control Panel Circles */}
    <circle cx="26" cy="20" r="4" />
    <circle cx="42" cy="20" r="4" />
    {/* Control Panel Screen */}
    <rect x="58" y="16" width="22" height="8" rx="2" />
    {/* Inner Tub Frame */}
    <path d="M 18 30 V 82 H 82 V 30" />
    {/* Wavy Water Line */}
    <path d="M 18 42 Q 26 36 34 42 T 50 42 T 66 42 T 82 42" />
    {/* Wine Glass */}
    <path d="M 26 50 H 42 V 58 Q 42 68 34 68 Q 26 68 26 58 Z" />
    <line x1="34" y1="68" x2="34" y2="82" />
    <line x1="28" y1="82" x2="40" y2="82" />
    {/* Plate */}
    <circle cx="64" cy="65" r="14" />
    <circle cx="64" cy="65" r="7" />
  </svg>
);

// Custom matching thin-line styles for the rest of categories
export const FanIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="currentColor">
    {/* Center Ring */}
    <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="8" />
    <g transform="translate(50, 50)">
      {/* Blade 1 */}
      <path d="M 8 -8 C 20 -35, 40 -40, 45 -20 C 35 -5, 20 -5, 12 -4 Z" />
      <path d="M 12 -42 C 35 -48, 55 -25, 45 5 C 55 -25, 35 -42, 12 -42 Z" />
      {/* Blade 2 */}
      <g transform="rotate(120)">
        <path d="M 8 -8 C 20 -35, 40 -40, 45 -20 C 35 -5, 20 -5, 12 -4 Z" />
        <path d="M 12 -42 C 35 -48, 55 -25, 45 5 C 55 -25, 35 -42, 12 -42 Z" />
      </g>
      {/* Blade 3 */}
      <g transform="rotate(240)">
        <path d="M 8 -8 C 20 -35, 40 -40, 45 -20 C 35 -5, 20 -5, 12 -4 Z" />
        <path d="M 12 -42 C 35 -48, 55 -25, 45 5 C 55 -25, 35 -42, 12 -42 Z" />
      </g>
    </g>
  </svg>
);

export const MixerIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    {/* Base */}
    <path d="M7 21h10l-2-7H9l-2 7z" />
    {/* Pitcher */}
    <path d="M8 6h8l-1 8H9L8 6z" />
    {/* Lid */}
    <path d="M7 6h10" />
    <path d="M10 3h4v3" />
    {/* Handle */}
    <path d="M16 8h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1" />
    {/* Knob/Dial on base */}
    <circle cx="12" cy="18" r="1.5" />
  </svg>
);

export const WaterPurifierIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <rect x="5" y="3" width="14" height="18" rx="2"></rect>
    <path d="M5 8h14"></path>
    <path d="M12 12c-1.5 2-3 3.5-3 5a3 3 0 0 0 6 0c0-1.5-1.5-3-3-5z"></path>
    <path d="M9 5h6"></path>
  </svg>
);

export const GasStoveIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <rect x="2" y="10" width="20" height="6" rx="1"></rect>
    <path d="M4 16v2"></path>
    <path d="M20 16v2"></path>
    <circle cx="8" cy="13" r="1.5"></circle>
    <circle cx="16" cy="13" r="1.5"></circle>
    <path d="M6 10c0-2 1-3 2-5 1 2 2 3 2 5"></path>
    <path d="M14 10c0-2 1-3 2-5 1 2 2 3 2 5"></path>
  </svg>
);

export const GharGhantiIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
    {/* Hopper Top */}
    <rect x="22" y="16" width="40" height="12" />
    {/* Hopper Funnel */}
    <path d="M26 28 L36 45 H48 L58 28" />
    {/* Lid */}
    <line x1="15" y1="45" x2="69" y2="45" />
    {/* Mid Band */}
    <line x1="15" y1="58" x2="69" y2="58" />
    {/* Base Band */}
    <line x1="15" y1="80" x2="69" y2="80" />
    {/* Body Left */}
    <line x1="18" y1="45" x2="18" y2="80" />
    {/* Body Right */}
    <line x1="66" y1="45" x2="66" y2="80" />
    {/* Crank Shaft */}
    <path d="M 66 51 H 78 V 30 H 84" />
    {/* Crank Knob */}
    <rect x="84" y="26" width="12" height="8" rx="4" fill="currentColor" stroke="none" />
  </svg>
);

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
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M 3 8 H 21"></path>
    <circle cx="7" cy="5.5" r="1"></circle>
    <circle cx="11" cy="5.5" r="1"></circle>
    <rect x="15" y="4.5" width="4" height="2" rx="0.5"></rect>
    {/* Inner Box */}
    <rect x="5" y="10" width="14" height="9" rx="1"></rect>
    {/* Wavy Line inside inner box */}
    <path d="M 5 13 Q 8.5 11, 12 13 T 19 13"></path>
    {/* Wine glass */}
    <path d="M 8 14 H 11 V 15 C 11 16.5, 8 16.5, 8 15 Z"></path>
    <line x1="9.5" y1="16.5" x2="9.5" y2="19"></line>
    <line x1="8" y1="19" x2="11" y2="19"></line>
    {/* Plate */}
    <circle cx="15" cy="16.5" r="2.5"></circle>
    <circle cx="15" cy="16.5" r="1"></circle>
  </svg>
);

// Custom matching thin-line styles for the rest of categories
export const FanIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <circle cx="12" cy="12" r="2.5"></circle>
    <path d="M 12 9.5 C 16 3, 21 5, 20 9 C 19 13, 14 11, 12 9.5 Z"></path>
    <g transform="rotate(120 12 12)">
      <path d="M 12 9.5 C 16 3, 21 5, 20 9 C 19 13, 14 11, 12 9.5 Z"></path>
    </g>
    <g transform="rotate(240 12 12)">
      <path d="M 12 9.5 C 16 3, 21 5, 20 9 C 19 13, 14 11, 12 9.5 Z"></path>
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
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    {/* Hopper Top */}
    <rect x="7" y="3" width="10" height="3" />
    {/* Hopper Funnel */}
    <path d="M 8 6 L 10 12 H 14 L 16 6" />
    {/* Body */}
    <rect x="5" y="12" width="14" height="9" />
    {/* Mid Band */}
    <line x1="5" y1="16" x2="19" y2="16" />
    {/* Inner Body Lines */}
    <line x1="7" y1="12" x2="7" y2="21" />
    <line x1="17" y1="12" x2="17" y2="21" />
    {/* Crank Shaft */}
    <path d="M 19 14 H 21 V 8 H 22" />
    {/* Crank Knob */}
    <circle cx="22" cy="8" r="1" />
  </svg>
);

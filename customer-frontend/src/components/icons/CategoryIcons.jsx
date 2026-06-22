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
    {/* Main Body */}
    <path d="M 3 20 V 4 A 2 2 0 0 1 5 2 H 19 A 2 2 0 0 1 21 4 V 20 Z" />
    
    {/* Control Panel Separator */}
    <line x1="3" y1="6" x2="21" y2="6" />
    
    {/* 3 Dots */}
    <circle cx="5.5" cy="4" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="8" cy="4" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="10.5" cy="4" r="0.8" fill="currentColor" stroke="none" />
    
    {/* Right Trapezoid Display */}
    <path d="M 14.5 6 L 15.5 3.5 H 18.5 L 19.5 6" />
    
    {/* Door Handle */}
    <rect x="6.5" y="8.5" width="11" height="2" rx="1" />
    
    {/* Bottom Base */}
    <path d="M 4 20 V 22 H 20 V 20" />
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
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    {/* Hopper Top */}
    <rect x="6" y="3" width="12" height="3" />
    {/* Hopper Funnel */}
    <path d="M7 6 L10 11 H14 L17 6" />
    {/* Lid */}
    <line x1="4" y1="11" x2="20" y2="11" />
    {/* Mid Band */}
    <line x1="4" y1="14" x2="20" y2="14" />
    {/* Base Band */}
    <line x1="4" y1="20" x2="20" y2="20" />
    {/* Body Left */}
    <line x1="5" y1="11" x2="5" y2="20" />
    {/* Body Right */}
    <line x1="19" y1="11" x2="19" y2="20" />
    {/* Crank Shaft */}
    <path d="M 19 12.5 H 22 V 7 H 23" />
    {/* Crank Knob */}
    <rect x="23" y="6" width="1" height="2" rx="0.5" fill="currentColor" stroke="none" />
  </svg>
);

export const ProjectorIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    {/* Body */}
    <rect x="3" y="7" width="18" height="10" rx="2" ry="2"></rect>
    {/* Lens */}
    <circle cx="16" cy="12" r="3"></circle>
    {/* Lens inner */}
    <circle cx="16" cy="12" r="1.5"></circle>
    {/* Buttons */}
    <line x1="5" y1="10" x2="8" y2="10"></line>
    <line x1="5" y1="12" x2="7" y2="12"></line>
    <line x1="5" y1="14" x2="9" y2="14"></line>
    {/* Stand / Feet */}
    <line x1="6" y1="17" x2="6" y2="19"></line>
    <line x1="18" y1="17" x2="18" y2="19"></line>
  </svg>
);

export const VacuumCleanerIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    {/* Base/Head */}
    <path d="M5 20h10l-1-4H8z"></path>
    {/* Stick/Tube */}
    <line x1="10" y1="16" x2="13" y2="6"></line>
    {/* Handle */}
    <path d="M13 6l2-2h3v3l-3 2"></path>
    {/* Canister/Motor */}
    <rect x="9" y="10" width="4" height="6" rx="1" transform="rotate(-15 11 13)"></rect>
  </svg>
);

export const GeyserIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    {/* Main tank */}
    <rect x="6" y="3" width="12" height="15" rx="4"></rect>
    {/* Temperature dial / display */}
    <circle cx="12" cy="10" r="2"></circle>
    <path d="M12 9v1"></path>
    {/* In / Out Pipes */}
    <path d="M8 18v3"></path>
    <path d="M16 18v3"></path>
    {/* Drops */}
    <circle cx="8" cy="22" r="0.5"></circle>
    <circle cx="16" cy="22" r="0.5"></circle>
  </svg>
);

export const PersonalCareIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    {/* Trimmer/Shaver Body */}
    <path d="M9 8h6v10a3 3 0 0 1-6 0V8z"></path>
    {/* Trimmer Head Base */}
    <rect x="10" y="5" width="4" height="3"></rect>
    {/* Blades */}
    <path d="M9 5 L10 2 L14 2 L15 5"></path>
    {/* Power Button */}
    <circle cx="12" cy="13" r="1.5"></circle>
  </svg>
);

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

// ─── New Category Icons ─────────────────────────────────────────────

export const ProjectorIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    {/* Body */}
    <rect x="2" y="8" width="20" height="10" rx="2" ry="2" />
    {/* Lens */}
    <circle cx="7" cy="13" r="3" />
    <circle cx="7" cy="13" r="1.5" />
    {/* Controls */}
    <circle cx="16" cy="11" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="18" cy="11" r="0.5" fill="currentColor" stroke="none" />
    {/* Vent lines */}
    <path d="M13 14h6" />
    <path d="M13 16h6" />
    {/* Feet */}
    <path d="M6 18v1" />
    <path d="M18 18v1" />
    {/* Light beam */}
    <path d="M4 8L2 5" />
    <path d="M10 8L12 5" />
  </svg>
);

export const AirCoolerIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    {/* Body */}
    <rect x="4" y="2" width="16" height="18" rx="2" ry="2" />
    {/* Top vent */}
    <path d="M7 5h10" />
    <path d="M7 7h10" />
    <path d="M7 9h10" />
    {/* Water tank area */}
    <path d="M4 13h16" />
    {/* Control panel */}
    <circle cx="8" cy="16" r="1" />
    <circle cx="12" cy="16" r="1" />
    <circle cx="16" cy="16" r="1" />
    {/* Wheels */}
    <circle cx="8" cy="21" r="1" />
    <circle cx="16" cy="21" r="1" />
  </svg>
);

export const VacuumCleanerIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    {/* Handle */}
    <path d="M10 2L8 8" />
    {/* Body */}
    <ellipse cx="9" cy="11" rx="5" ry="4" />
    {/* Hose */}
    <path d="M14 10c2-1 4-1 5 0s2 3 1 5" />
    {/* Nozzle */}
    <path d="M19 15l2 1" />
    <path d="M18 16l2 1" />
    {/* Wheels */}
    <circle cx="6" cy="15" r="1.5" />
    <circle cx="12" cy="15" r="1.5" />
    {/* Power cord */}
    <path d="M4 8c-1-2-1-4 0-5" />
  </svg>
);

export const KitchenApplianceIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    {/* Cutting board */}
    <rect x="3" y="14" width="18" height="3" rx="1" />
    {/* Knife */}
    <path d="M7 14V5c0-1 1-2 2-2s2 1 2 2v9" />
    <path d="M9 3v2" />
    {/* Spatula */}
    <path d="M15 14V7" />
    <rect x="13.5" y="3" width="3" height="4" rx="1.5" />
    {/* Counter */}
    <path d="M2 17h20" />
    {/* Legs */}
    <path d="M5 17v3" />
    <path d="M19 17v3" />
  </svg>
);

export const ChimneyIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    {/* Hood */}
    <path d="M3 14h18l-3-8H6L3 14z" />
    {/* Filter */}
    <rect x="5" y="14" width="14" height="2" rx="0.5" />
    {/* Pipe */}
    <rect x="9" y="2" width="6" height="4" rx="1" />
    {/* Connector */}
    <path d="M10 6v2" />
    <path d="M14 6v2" />
    {/* Steam */}
    <path d="M8 18c0 1.5 1 3 2 4" />
    <path d="M12 18c0 1.5 0 3 0 4" />
    <path d="M16 18c0 1.5-1 3-2 4" />
  </svg>
);

export const GeyserIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    {/* Tank body */}
    <rect x="5" y="3" width="14" height="16" rx="3" ry="3" />
    {/* Temperature indicator */}
    <circle cx="12" cy="9" r="3" />
    <path d="M12 7v4" />
    <path d="M10 9h4" />
    {/* Control knob */}
    <circle cx="12" cy="15" r="1.5" />
    {/* Pipes */}
    <path d="M8 19v3" />
    <path d="M16 19v3" />
    {/* Mounting */}
    <path d="M7 3V1" />
    <path d="M17 3V1" />
  </svg>
);

export const PersonalCareIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    {/* Trimmer body */}
    <rect x="8" y="6" width="8" height="14" rx="3" ry="3" />
    {/* Head/blade area */}
    <rect x="9" y="3" width="6" height="4" rx="1" />
    {/* Blade lines */}
    <path d="M10 4h4" />
    <path d="M10 5.5h4" />
    {/* Button */}
    <circle cx="12" cy="12" r="1.5" />
    {/* Indicator */}
    <path d="M12 15v2" />
    {/* Bottom */}
    <path d="M10 20h4" />
  </svg>
);


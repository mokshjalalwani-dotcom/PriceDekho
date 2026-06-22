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
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <path d="M4 6h16"></path>
    <circle cx="18" cy="4" r="0.5"></circle>
    <circle cx="16" cy="4" r="0.5"></circle>
    <circle cx="14" cy="4" r="0.5"></circle>
    <path d="M8 10h8"></path>
    <path d="M8 14h8"></path>
    <path d="M8 18h8"></path>
  </svg>
);

// Custom matching thin-line styles for the rest of categories
export const FanIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 9c-2-3-1-7 3-7 2 0 4 2 2 5s-5 2-5 2z"></path>
    <path d="M15 12c3-2 7-1 7 3 0 2-2 4-5 2s-2-5-2-5z"></path>
    <path d="M12 15c2 3 1 7-3 7-2 0-4-2-2-5s5-2 5-2z"></path>
    <path d="M9 12c-3 2-7 1-7-3 0-2 2-4 5-2s2 5 2 5z"></path>
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
    <path d="M6 2L4 8v14h16V8L18 2H6z"></path>
    <path d="M4 8h16"></path>
    <circle cx="12" cy="14" r="3"></circle>
    <path d="M10 18h4"></path>
  </svg>
);

// ─── New Category Icons ─────────────────────────────────────────────

export const ProjectorIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <rect x="2" y="8" width="20" height="10" rx="2" ry="2" />
    <circle cx="7" cy="13" r="3" />
    <circle cx="7" cy="13" r="1.5" />
    <circle cx="16" cy="11" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="18" cy="11" r="0.5" fill="currentColor" stroke="none" />
    <path d="M13 14h6" />
    <path d="M13 16h6" />
    <path d="M6 18v1" />
    <path d="M18 18v1" />
    <path d="M4 8L2 5" />
    <path d="M10 8L12 5" />
  </svg>
);

export const AirCoolerIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <rect x="4" y="2" width="16" height="18" rx="2" ry="2" />
    <path d="M7 5h10" />
    <path d="M7 7h10" />
    <path d="M7 9h10" />
    <path d="M4 13h16" />
    <circle cx="8" cy="16" r="1" />
    <circle cx="12" cy="16" r="1" />
    <circle cx="16" cy="16" r="1" />
    <circle cx="8" cy="21" r="1" />
    <circle cx="16" cy="21" r="1" />
  </svg>
);

export const VacuumCleanerIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <path d="M10 2L8 8" />
    <ellipse cx="9" cy="11" rx="5" ry="4" />
    <path d="M14 10c2-1 4-1 5 0s2 3 1 5" />
    <path d="M19 15l2 1" />
    <path d="M18 16l2 1" />
    <circle cx="6" cy="15" r="1.5" />
    <circle cx="12" cy="15" r="1.5" />
    <path d="M4 8c-1-2-1-4 0-5" />
  </svg>
);

export const KitchenApplianceIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <rect x="3" y="14" width="18" height="3" rx="1" />
    <path d="M7 14V5c0-1 1-2 2-2s2 1 2 2v9" />
    <path d="M9 3v2" />
    <path d="M15 14V7" />
    <rect x="13.5" y="3" width="3" height="4" rx="1.5" />
    <path d="M2 17h20" />
    <path d="M5 17v3" />
    <path d="M19 17v3" />
  </svg>
);

export const ChimneyIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <path d="M3 14h18l-3-8H6L3 14z" />
    <rect x="5" y="14" width="14" height="2" rx="0.5" />
    <rect x="9" y="2" width="6" height="4" rx="1" />
    <path d="M10 6v2" />
    <path d="M14 6v2" />
    <path d="M8 18c0 1.5 1 3 2 4" />
    <path d="M12 18c0 1.5 0 3 0 4" />
    <path d="M16 18c0 1.5-1 3-2 4" />
  </svg>
);

export const GeyserIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <rect x="5" y="3" width="14" height="16" rx="3" ry="3" />
    <circle cx="12" cy="9" r="3" />
    <path d="M12 7v4" />
    <path d="M10 9h4" />
    <circle cx="12" cy="15" r="1.5" />
    <path d="M8 19v3" />
    <path d="M16 19v3" />
    <path d="M7 3V1" />
    <path d="M17 3V1" />
  </svg>
);

export const PersonalCareIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...commonProps}>
    <rect x="8" y="6" width="8" height="14" rx="3" ry="3" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M10 4h4" />
    <path d="M10 5.5h4" />
    <circle cx="12" cy="12" r="1.5" />
    <path d="M12 15v2" />
    <path d="M10 20h4" />
  </svg>
);

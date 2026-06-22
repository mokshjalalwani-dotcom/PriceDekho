import React from 'react';
import {
  TvIcon,
  ProjectorIcon,
  SoundSystemIcon,
  RefrigeratorIcon,
  WashingMachineIcon,
  DishwasherIcon,
  AcIcon,
  FanIcon,
  VacuumCleanerIcon,
  GharGhantiIcon,
  MicrowaveIcon,
  WaterPurifierIcon,
  KitchenApplianceIcon,
  GasStoveIcon,
  GeyserIcon,
  PersonalCareIcon,
} from '../components/icons/CategoryIcons';

// ─── 16 Categories in exact business-required order ─────────────────
// Every slug matches an existing DB category or a future one.
// Existing DB _ids and product mappings are NEVER changed.
export const CATEGORIES = [
  {
    name: 'Television',
    slug: 'tv',                      // DB _id: 6a2b00b2345d2e4909b302ba
    icon: <TvIcon size={52} className="text-white" />,
    color: 'from-[#FFB732] to-[#F19A1A]',
    smallColor: 'bg-[#FFB300]',
  },
  {
    name: 'Projector',
    slug: 'projector',               // NEW — not in DB yet
    icon: <ProjectorIcon size={52} className="text-white" />,
    color: 'from-[#7C4DFF] to-[#651FFF]',
    smallColor: 'bg-[#7C4DFF]',
  },
  {
    name: 'Sound System',
    slug: 'sound-system',            // DB _id: 6a2b00b2345d2e4909b302c8
    icon: <SoundSystemIcon size={52} className="text-white" />,
    color: 'from-[#614385] to-[#516395]',
    smallColor: 'bg-[#5C6BC0]',
  },
  {
    name: 'Refrigerator',
    slug: 'refrigerator',            // DB _id: 6a2b00b2345d2e4909b302bc
    icon: <RefrigeratorIcon size={52} className="text-white" />,
    color: 'from-[#B0D136] to-[#8CBB1B]',
    smallColor: 'bg-[#8BC34A]',
  },
  {
    name: 'Washing Machine',
    slug: 'washing-machines',        // DB _id: 6a2b00b2345d2e4909b302cd
    icon: <WashingMachineIcon size={52} className="text-white" />,
    color: 'from-[#FF6368] to-[#F0444A]',
    smallColor: 'bg-[#F44336]',
  },
  {
    name: 'Dish Washer',
    slug: 'dishwashers',             // DB _id: 6a2b00b3345d2e4909b302d6
    icon: <DishwasherIcon size={52} className="text-white" />,
    color: 'from-[#FF875A] to-[#F56434]',
    smallColor: 'bg-[#FF7043]',
  },
  {
    name: 'Air Conditioner',
    slug: 'air-conditioners',        // DB _id: 6a2b00b2345d2e4909b302cb
    icon: <AcIcon size={52} className="text-white" />,
    color: 'from-[#1CC89B] to-[#0CB07D]',
    smallColor: 'bg-[#00BFA5]',
  },
  {
    name: 'Fan & Air Cooler',
    slug: 'fan',                     // DB _id: 6a2b00b2345d2e4909b302be
    icon: <FanIcon size={52} className="text-white" />,
    color: 'from-[#00BCD4] to-[#0097A7]',
    smallColor: 'bg-[#00BCD4]',
    isCombined: true,
    subCategories: ['Fan', 'Air Cooler'],
  },
  {
    name: 'Vacuum Cleaner',
    slug: 'vacuum-cleaner',          // NEW — not in DB yet
    icon: <VacuumCleanerIcon size={52} className="text-white" />,
    color: 'from-[#78909C] to-[#546E7A]',
    smallColor: 'bg-[#78909C]',
  },
  {
    name: 'Ghar Ghanti',
    slug: 'ghar-ghanti',             // DB _id: 6a2b00b2345d2e4909b302c5
    icon: <GharGhantiIcon size={52} className="text-white" />,
    color: 'from-[#1880C4] to-[#2B2384]',
    smallColor: 'bg-[#1A237E]',
  },
  {
    name: 'Oven',
    slug: 'oven',                    // DB _id: 6a2b00b2345d2e4909b302d0
    icon: <MicrowaveIcon size={52} className="text-white" />,
    color: 'from-[#FF9800] to-[#F57C00]',
    smallColor: 'bg-[#FF9800]',
  },
  {
    name: 'Water Purifier',
    slug: 'water-purifier',          // DB _id: 6a2b00b2345d2e4909b302c2
    icon: <WaterPurifierIcon size={52} className="text-white" />,
    color: 'from-[#00D2FF] to-[#3A7BD5]',
    smallColor: 'bg-[#00B0FF]',
  },
  {
    name: 'Kitchen Appliance',
    slug: 'mixer',                   // DB _id: 6a2b00b2345d2e4909b302c0 — display name change only
    icon: <KitchenApplianceIcon size={52} className="text-white" />,
    color: 'from-[#E91E63] to-[#C2185B]',
    smallColor: 'bg-[#E91E63]',
  },
  {
    name: 'Gas Stove & Chimney',
    slug: 'gas-stove',               // DB _id: 6a2b00b3345d2e4909b302d3
    icon: <GasStoveIcon size={52} className="text-white" />,
    color: 'from-[#FF5722] to-[#E64A19]',
    smallColor: 'bg-[#FF5722]',
    isCombined: true,
    subCategories: ['Gas Stove', 'Chimney'],
  },
  {
    name: 'Geyser',
    slug: 'geyser',                  // NEW — not in DB yet
    icon: <GeyserIcon size={52} className="text-white" />,
    color: 'from-[#FF7043] to-[#E64A19]',
    smallColor: 'bg-[#FF7043]',
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',           // NEW — not in DB yet
    icon: <PersonalCareIcon size={52} className="text-white" />,
    color: 'from-[#EC407A] to-[#D81B60]',
    smallColor: 'bg-[#EC407A]',
    subCategories: [
      'Trimmer', 'One Blade', 'Body Groomer',
      'Nose, Ear & Eyebrow Trimmer', 'Hair Straightener',
      'Hair Dryer', 'Hair Straightening Brush', 'Styler',
      'Epilator', 'Shaver', 'Female Trimmer', 'Hair Clipper',
    ],
  },
];

// Display name overrides: maps DB slug → homepage display name
// Used by Shop.jsx for breadcrumbs and page titles
export const CATEGORY_DISPLAY_NAMES = {
  'mixer': 'Kitchen Appliance',
  'fan': 'Fan & Air Cooler',
  'gas-stove': 'Gas Stove & Chimney',
};

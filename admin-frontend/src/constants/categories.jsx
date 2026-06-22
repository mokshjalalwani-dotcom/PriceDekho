import React from 'react';
import {
  TvIcon,
  RefrigeratorIcon,
  FanIcon,
  MixerIcon,
  WaterPurifierIcon,
  GharGhantiIcon,
  SoundSystemIcon,
  AcIcon,
  WashingMachineIcon,
  MicrowaveIcon,
  GasStoveIcon,
  DishwasherIcon,
  ProjectorIcon,
  VacuumCleanerIcon,
  GeyserIcon,
  PersonalCareIcon
} from '../components/icons/CategoryIcons';

import { Grid } from 'lucide-react';

export const CATEGORY_ICONS_MAP = {
  tv: <TvIcon size={52} className="text-white" />,
  refrigerator: <RefrigeratorIcon size={52} className="text-white" />,
  fan: <FanIcon size={52} className="text-white" />,
  mixer: <MixerIcon size={52} className="text-white" />,
  'water-purifier': <WaterPurifierIcon size={52} className="text-white" />,
  'ghar-ghanti': <GharGhantiIcon size={52} className="text-white" />,
  'sound-system': <SoundSystemIcon size={52} className="text-white" />,
  'air-conditioners': <AcIcon size={52} className="text-white" />,
  'washing-machines': <WashingMachineIcon size={52} className="text-white" />,
  oven: <MicrowaveIcon size={52} className="text-white" />,
  'gas-stove': <GasStoveIcon size={52} className="text-white" />,
  dishwashers: <DishwasherIcon size={52} className="text-white" />,
  projector: <ProjectorIcon size={52} className="text-white" />,
  'vacuum-cleaner': <VacuumCleanerIcon size={52} className="text-white" />,
  gyser: <GeyserIcon size={52} className="text-white" />,
  'personal-care': <PersonalCareIcon size={52} className="text-white" />,
  default: <Grid size={52} className="text-white" strokeWidth={1} />
};

export const HARDCODED_FALLBACK_CATEGORIES = [
  { _id: '1', name: 'Television', slug: 'tv', iconKey: 'tv', color: 'from-[#FFB732] to-[#F19A1A]', smallColor: 'bg-[#FFB300]', icon: CATEGORY_ICONS_MAP['tv'] },
  { _id: '2', name: 'Projector', slug: 'projector', iconKey: 'projector', color: 'from-[#8A2387] to-[#E94057]', smallColor: 'bg-[#F27121]', icon: CATEGORY_ICONS_MAP['projector'] },
  { _id: '3', name: 'Sound System', slug: 'sound-system', iconKey: 'sound-system', color: 'from-[#614385] to-[#516395]', smallColor: 'bg-[#5C6BC0]', icon: CATEGORY_ICONS_MAP['sound-system'] },
  { _id: '4', name: 'Refrigerator', slug: 'refrigerator', iconKey: 'refrigerator', color: 'from-[#B0D136] to-[#8CBB1B]', smallColor: 'bg-[#8BC34A]', icon: CATEGORY_ICONS_MAP['refrigerator'] },
  { _id: '5', name: 'Washing Machine', slug: 'washing-machines', iconKey: 'washing-machines', color: 'from-[#FF6368] to-[#F0444A]', smallColor: 'bg-[#F44336]', icon: CATEGORY_ICONS_MAP['washing-machines'] },
  { _id: '6', name: 'Dish Washer', slug: 'dishwashers', iconKey: 'dishwashers', color: 'from-[#FF875A] to-[#F56434]', smallColor: 'bg-[#FF7043]', icon: CATEGORY_ICONS_MAP['dishwashers'] },
  { _id: '7', name: 'Air Conditioner', slug: 'air-conditioners', iconKey: 'air-conditioners', color: 'from-[#1CC89B] to-[#0CB07D]', smallColor: 'bg-[#00BFA5]', icon: CATEGORY_ICONS_MAP['air-conditioners'] },
  { _id: '8', name: 'Fan & Air Cooler', slug: 'fan', iconKey: 'fan', color: 'from-[#00BCD4] to-[#0097A7]', smallColor: 'bg-[#00BCD4]', icon: CATEGORY_ICONS_MAP['fan'] },
  { _id: '9', name: 'Vacuum Cleaner', slug: 'vacuum-cleaner', iconKey: 'vacuum-cleaner', color: 'from-[#8E2DE2] to-[#4A00E0]', smallColor: 'bg-[#4A00E0]', icon: CATEGORY_ICONS_MAP['vacuum-cleaner'] },
  { _id: '10', name: 'Ghar Ghanti', slug: 'ghar-ghanti', iconKey: 'ghar-ghanti', color: 'from-[#1880C4] to-[#2B2384]', smallColor: 'bg-[#1A237E]', icon: CATEGORY_ICONS_MAP['ghar-ghanti'] },
  { _id: '11', name: 'Oven', slug: 'oven', iconKey: 'oven', color: 'from-[#FF9800] to-[#F57C00]', smallColor: 'bg-[#FF9800]', icon: CATEGORY_ICONS_MAP['oven'] },
  { _id: '12', name: 'Water Purifier', slug: 'water-purifier', iconKey: 'water-purifier', color: 'from-[#00D2FF] to-[#3A7BD5]', smallColor: 'bg-[#00B0FF]', icon: CATEGORY_ICONS_MAP['water-purifier'] },
  { _id: '13', name: 'Kitchen Appliance', slug: 'mixer', iconKey: 'mixer', color: 'from-[#E91E63] to-[#C2185B]', smallColor: 'bg-[#E91E63]', icon: CATEGORY_ICONS_MAP['mixer'] },
  { _id: '14', name: 'Gas Stove & Chimney', slug: 'gas-stove', iconKey: 'gas-stove', color: 'from-[#FF5722] to-[#E64A19]', smallColor: 'bg-[#FF5722]', icon: CATEGORY_ICONS_MAP['gas-stove'] },
  { _id: '15', name: 'Geyser', slug: 'gyser', iconKey: 'gyser', color: 'from-[#FF416C] to-[#FF4B2B]', smallColor: 'bg-[#FF416C]', icon: CATEGORY_ICONS_MAP['gyser'] },
  { _id: '16', name: 'Personal Care', slug: 'personal-care', iconKey: 'personal-care', color: 'from-[#4CB8C4] to-[#3CD3AD]', smallColor: 'bg-[#3CD3AD]', icon: CATEGORY_ICONS_MAP['personal-care'] }
];

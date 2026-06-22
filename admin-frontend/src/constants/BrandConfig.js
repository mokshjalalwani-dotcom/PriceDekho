// Centralized Brand Configuration
// Maps category slugs and subcategories to allowed brand names.
// Used for filtering brand dropdowns in admin panel and filtering in frontend.

export const CATEGORY_BRANDS = {
  'tv': ['Samsung', 'Sony', 'LG', 'OnePlus', 'TCL', 'Xiaomi', 'Acer', 'Vu', 'Hisense', 'Panasonic', 'Lloyd'],
  'projector': ['Sony', 'Epson', 'BenQ', 'Optoma', 'ViewSonic', 'Zebronics', 'Samsung', 'LG'],
  'sound-system': ['Sony', 'JBL', 'Bose', 'Samsung', 'Boat', 'Zebronics', 'Philips', 'LG', 'Yamaha'],
  'refrigerator': ['Samsung', 'LG', 'Whirlpool', 'Haier', 'Godrej', 'Bosch', 'Voltas Beko', 'Panasonic'],
  'washing-machines': ['LG', 'Samsung', 'Whirlpool', 'Bosch', 'IFB', 'Panasonic', 'Godrej', 'Haier', 'Lloyd'],
  'dishwashers': ['Bosch', 'IFB', 'LG', 'Samsung', 'Voltas Beko', 'Faber', 'Siemens'],
  'air-conditioners': ['Voltas', 'LG', 'Daikin', 'Lloyd', 'Blue Star', 'Hitachi', 'Panasonic', 'Samsung', 'Haier'],
  'fan': {
    'Fan': ['Havells', 'Crompton', 'Orient', 'Atomberg', 'Bajaj', 'Usha', 'Luminous', 'Polycab'],
    'Air Cooler': ['Symphony', 'Bajaj', 'Kenstar', 'Crompton', 'Orient', 'Hindware', 'Voltas']
  },
  'vacuum-cleaner': ['Eureka Forbes', 'Philips', 'Dyson', 'Agaro', 'Karcher', 'Panasonic', 'Kent'],
  'ghar-ghanti': ['Natraj', 'Navroop', 'Milcent', 'Micro Active', 'Haystar'],
  'oven': ['Samsung', 'LG', 'IFB', 'Panasonic', 'Bajaj', 'Morphy Richards', 'Whirlpool'],
  'water-purifier': ['Kent', 'Aquaguard', 'Pureit', 'Livpure', 'AO Smith', 'Havells', 'Eureka Forbes'],
  'mixer': ['Prestige', 'Bajaj', 'Philips', 'Sujata', 'Bosch', 'Butterfly', 'Preethi', 'Havells', 'Maharaja', 'Crompton'],
  'gas-stove': {
    'Gas Stove': ['Prestige', 'Pigeon', 'Sunflame', 'Butterfly', 'Elica', 'Milton', 'Glen', 'Vidiem'],
    'Chimney': ['Faber', 'Elica', 'Hindware', 'Glen', 'Kaff', 'Sunflame', 'Bosch']
  },
  'geyser': ['AO Smith', 'Bajaj', 'Crompton', 'Havells', 'V-Guard', 'Racold', 'Hindware', 'Venus'],
  'personal-care': ['Philips', 'Nova', 'Syska', 'Braun', 'Havells', 'Vega', 'Wahl', 'Panasonic', 'Gillette']
};

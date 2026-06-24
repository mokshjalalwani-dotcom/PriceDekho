// Category-specific form field definitions for all 12 product categories.
// Used by: Admin ProductModal (dynamic form), Customer filter sidebar, Product detail page specs.
//
// Field types: 'text', 'number', 'select', 'boolean'
// 'boolean' renders as Yes/No select
// 'select' renders as dropdown with options array

export const CATEGORY_FIELDS = {
  tv: {
    label: 'TV',
    fields: [
      { key: 'screenSize', label: 'Screen Size', type: 'select', options: ['24 inch', '32 inch', '40 inch', '43 inch', '50 inch', '55 inch', '65 inch', '75 inch', '85 inch'], required: true },
      { key: 'displayType', label: 'Display Type', type: 'select', options: ['LED', 'OLED', 'QLED', 'Mini LED', 'Micro LED', 'LCD', 'Plasma'] },
      { key: 'resolution', label: 'Resolution', type: 'select', options: ['HD Ready', 'Full HD', '4K Ultra HD', '8K Ultra HD'] },
      { key: 'smartTv', label: 'Smart TV', type: 'boolean' },
      { key: 'operatingSystem', label: 'Operating System', type: 'select', options: ['Android TV', 'Google TV', 'webOS', 'Tizen', 'Fire OS', 'Roku', 'Other', 'None'] },
      { key: 'refreshRate', label: 'Refresh Rate', type: 'select', options: ['60 Hz', '120 Hz', '144 Hz'] },
      { key: 'hdmiPorts', label: 'HDMI Ports', type: 'select', options: ['1', '2', '3', '4'] },
      { key: 'usbPorts', label: 'USB Ports', type: 'select', options: ['1', '2', '3'] },
      { key: 'speakerOutput', label: 'Speaker Output', type: 'text', placeholder: 'e.g. 20W' },
      { key: 'connectivity', label: 'Connectivity', type: 'text', placeholder: 'e.g. WiFi, Bluetooth, Ethernet' },
      { key: 'wallMountIncluded', label: 'Wall Mount Included', type: 'boolean' },
      { key: 'energyRating', label: 'Energy Rating', type: 'select', options: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'] },
    ],
    filterFields: ['screenSize', 'resolution', 'smartTv', 'displayType'],
  },

  refrigerator: {
    label: 'Fridge / Refrigerator',
    fields: [
      { key: 'capacityLitres', label: 'Capacity (Litres)', type: 'text', placeholder: 'e.g. 253', required: true },
      { key: 'doorType', label: 'Door Type', type: 'select', options: ['Single Door', 'Double Door', 'Triple Door', 'Side by Side', 'Multi Door', 'French Door'] },
      { key: 'energyStarRating', label: 'Energy Star Rating', type: 'select', options: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'] },
      { key: 'compressorType', label: 'Compressor Type', type: 'select', options: ['Standard', 'Digital Inverter', 'Smart Inverter', 'Linear Inverter'] },
      { key: 'inverterTechnology', label: 'Inverter Technology', type: 'boolean' },
      { key: 'coolingTechnology', label: 'Cooling Technology', type: 'text', placeholder: 'e.g. Twin Cooling Plus' },
      { key: 'defrostType', label: 'Defrost Type', type: 'select', options: ['Frost Free', 'Direct Cool', 'Auto Defrost'] },
      { key: 'freezerCapacity', label: 'Freezer Capacity', type: 'text', placeholder: 'e.g. 50L' },
      { key: 'shelfType', label: 'Shelf Type', type: 'select', options: ['Toughened Glass', 'Wire', 'Plastic'] },
      { key: 'stabilizerRequired', label: 'Stabilizer Required', type: 'boolean' },
    ],
    filterFields: ['capacityLitres', 'doorType', 'energyStarRating', 'compressorType'],
  },

  fan: {
    label: 'Fan',
    fields: [
      { key: 'fanType', label: 'Fan Type', type: 'select', options: ['Ceiling Fan', 'Table Fan', 'Wall Fan', 'Exhaust Fan', 'Pedestal Fan', 'Tower Fan'], required: true },
      { key: 'sweepSize', label: 'Sweep Size', type: 'select', options: ['300 mm', '400 mm', '600 mm', '900 mm', '1050 mm', '1200 mm', '1400 mm'] },
      { key: 'speedSettings', label: 'Speed Settings', type: 'select', options: ['3 Speed', '4 Speed', '5 Speed', 'Variable'] },
      { key: 'rpm', label: 'RPM', type: 'text', placeholder: 'e.g. 370' },
      { key: 'powerConsumption', label: 'Power Consumption', type: 'text', placeholder: 'e.g. 75W' },
      { key: 'bladeMaterial', label: 'Blade Material', type: 'select', options: ['Aluminium', 'Stainless Steel', 'Plastic', 'ABS'] },
      { key: 'numberOfBlades', label: 'Number of Blades', type: 'select', options: ['3', '4', '5'] },
      { key: 'remoteControl', label: 'Remote Control', type: 'boolean' },
      { key: 'noiseLevel', label: 'Noise Level', type: 'text', placeholder: 'e.g. Low / 40 dB' },
    ],
    filterFields: ['fanType', 'sweepSize', 'powerConsumption'],
  },

  mixer: {
    label: 'Mixer',
    fields: [
      { key: 'motorPowerWatts', label: 'Motor Power (Watts)', type: 'text', placeholder: 'e.g. 750', required: true },
      { key: 'numberOfJars', label: 'Number of Jars', type: 'select', options: ['1', '2', '3', '4', '5'] },
      { key: 'jarMaterial', label: 'Jar Material', type: 'select', options: ['Stainless Steel', 'Polycarbonate', 'ABS Plastic', 'Glass'] },
      { key: 'speedSettings', label: 'Speed Settings', type: 'select', options: ['2 Speed', '3 Speed', '4 Speed', 'Variable'] },
      { key: 'overloadProtection', label: 'Overload Protection', type: 'boolean' },
      { key: 'bladeType', label: 'Blade Type', type: 'select', options: ['Stainless Steel', 'Multi-purpose', 'Sharp Edge'] },
      { key: 'bodyMaterial', label: 'Body Material', type: 'select', options: ['ABS Plastic', 'Stainless Steel', 'Metal'] },
      { key: 'suitableFor', label: 'Suitable For', type: 'text', placeholder: 'e.g. Grinding, Juicing, Mixing' },
      { key: 'safetyLock', label: 'Safety Lock', type: 'boolean' },
    ],
    filterFields: ['motorPowerWatts', 'numberOfJars', 'speedSettings'],
  },

  'water-purifier': {
    label: 'RO Water Purifier',
    fields: [
      { key: 'purificationTechnology', label: 'Purification Technology', type: 'select', options: ['RO', 'UV', 'UF', 'RO+UV', 'RO+UV+UF', 'RO+UV+UF+TDS', 'Gravity Based'], required: true },
      { key: 'roUvUfType', label: 'RO/UV/UF Type', type: 'text', placeholder: 'e.g. Multi-stage' },
      { key: 'storageCapacity', label: 'Storage Capacity', type: 'select', options: ['5L', '7L', '8L', '9L', '10L', '12L', '15L'] },
      { key: 'purificationCapacity', label: 'Purification Capacity/hr', type: 'text', placeholder: 'e.g. 20 L/hr' },
      { key: 'filterType', label: 'Filter Type', type: 'text', placeholder: 'e.g. Sediment, Carbon, RO Membrane' },
      { key: 'tdsController', label: 'TDS Controller', type: 'boolean' },
      { key: 'installationType', label: 'Installation Type', type: 'select', options: ['Wall Mounted', 'Counter Top', 'Under Sink'] },
      { key: 'waterSource', label: 'Suitable Water Source', type: 'select', options: ['Borewell', 'Municipal', 'Both'] },
      { key: 'indicatorAvailability', label: 'Indicator Available', type: 'boolean' },
    ],
    filterFields: ['purificationTechnology', 'storageCapacity'],
  },

  'ghar-ghanti': {
    label: 'Ghar-Ghanti / Domestic Flour Mill',
    fields: [
      { key: 'motorPower', label: 'Motor Power', type: 'select', options: ['0.5 HP', '1 HP', '1.5 HP', '2 HP', '3 HP'], required: true },
      { key: 'grindingCapacity', label: 'Grinding Capacity', type: 'select', options: ['5-7 kg/hr', '7-10 kg/hr', '8-10 kg/hr', '10-12 kg/hr', '12-15 kg/hr'] },
      { key: 'hopperCapacity', label: 'Hopper Capacity', type: 'text', placeholder: 'e.g. 5 kg' },
      { key: 'stoneType', label: 'Stone Type', type: 'select', options: ['Natural Stone', 'Emery Stone', 'Corundum Stone'] },
      { key: 'cabinetMaterial', label: 'Cabinet Material', type: 'select', options: ['Stainless Steel', 'Mild Steel', 'ABS Plastic', 'Wooden'] },
      { key: 'automaticOperation', label: 'Automatic Operation', type: 'boolean' },
      { key: 'childSafetyLock', label: 'Child Safety Lock', type: 'boolean' },
      { key: 'noiseLevel', label: 'Noise Level', type: 'text', placeholder: 'e.g. Low / Medium' },
      { key: 'suitableGrains', label: 'Suitable Grains', type: 'text', placeholder: 'e.g. Wheat, Rice, Corn, Spices' },
    ],
    filterFields: ['motorPower', 'grindingCapacity'],
  },

  'sound-system': {
    label: 'Sound System',
    fields: [
      { key: 'speakerType', label: 'Speaker Type', type: 'select', options: ['Soundbar', 'Home Theatre', 'Tower Speaker', 'Bookshelf', 'Portable', 'Party Speaker'], required: true },
      { key: 'channelConfiguration', label: 'Channel Configuration', type: 'select', options: ['2.0', '2.1', '3.1', '5.1', '7.1', '9.1', 'Dolby Atmos'] },
      { key: 'outputPower', label: 'Output Power', type: 'text', placeholder: 'e.g. 300W' },
      { key: 'bluetooth', label: 'Bluetooth', type: 'boolean' },
      { key: 'usbSupport', label: 'USB Support', type: 'boolean' },
      { key: 'auxSupport', label: 'AUX Support', type: 'boolean' },
      { key: 'hdmiArcSupport', label: 'HDMI ARC Support', type: 'boolean' },
      { key: 'subwooferIncluded', label: 'Subwoofer Included', type: 'boolean' },
      { key: 'remoteControl', label: 'Remote Control', type: 'boolean' },
      { key: 'fmSupport', label: 'FM Support', type: 'boolean' },
    ],
    filterFields: ['outputPower', 'channelConfiguration', 'bluetooth'],
  },

  'air-conditioners': {
    label: 'AC / Air Conditioner',
    fields: [
      { key: 'acType', label: 'AC Type', type: 'select', options: ['Split', 'Window', 'Portable', 'Cassette', 'Tower'], required: true },
      { key: 'capacityTons', label: 'Capacity (Tons)', type: 'select', options: ['0.8 Ton', '1 Ton', '1.2 Ton', '1.5 Ton', '2 Ton', '2.5 Ton'], required: true },
      { key: 'starRating', label: 'Star Rating', type: 'select', options: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'] },
      { key: 'inverterTechnology', label: 'Inverter Technology', type: 'boolean' },
      { key: 'coolingCapacity', label: 'Cooling Capacity', type: 'text', placeholder: 'e.g. 5100W' },
      { key: 'compressorType', label: 'Compressor Type', type: 'select', options: ['Rotary', 'Reciprocating', 'Scroll', 'Inverter'] },
      { key: 'condenserCoilMaterial', label: 'Condenser Coil Material', type: 'select', options: ['Copper', 'Aluminium', 'Copper with Gold Fin'] },
      { key: 'refrigerantType', label: 'Refrigerant Type', type: 'select', options: ['R-32', 'R-410A', 'R-22', 'R-290'] },
      { key: 'powerConsumption', label: 'Power Consumption', type: 'text', placeholder: 'e.g. 1500W' },
      { key: 'noiseLevel', label: 'Noise Level', type: 'text', placeholder: 'e.g. 32 dB' },
      { key: 'roomSizeCoverage', label: 'Room Size Coverage', type: 'text', placeholder: 'e.g. 150-180 sq ft' },
    ],
    filterFields: ['capacityTons', 'starRating', 'inverterTechnology', 'acType'],
  },

  'washing-machines': {
    label: 'Washing Machine',
    fields: [
      { key: 'capacityKg', label: 'Capacity (Kg)', type: 'select', options: ['5 kg', '6 kg', '6.5 kg', '7 kg', '7.5 kg', '8 kg', '9 kg', '10 kg', '11 kg', '12 kg'], required: true },
      { key: 'washerType', label: 'Washer Type', type: 'select', options: ['Fully Automatic', 'Semi Automatic'] },
      { key: 'loadType', label: 'Load Type', type: 'select', options: ['Front Load', 'Top Load'] },
      { key: 'washPrograms', label: 'Wash Programs', type: 'text', placeholder: 'e.g. 15 programs' },
      { key: 'rpm', label: 'RPM', type: 'text', placeholder: 'e.g. 1200' },
      { key: 'inverterMotor', label: 'Inverter Motor', type: 'boolean' },
      { key: 'drumMaterial', label: 'Drum Material', type: 'select', options: ['Stainless Steel', 'Porcelain Enamel', 'Plastic'] },
      { key: 'waterLevelSelection', label: 'Water Level Selection', type: 'boolean' },
      { key: 'childLock', label: 'Child Lock', type: 'boolean' },
      { key: 'dryerFunction', label: 'Dryer Function', type: 'boolean' },
    ],
    filterFields: ['capacityKg', 'loadType', 'washerType'],
  },

  oven: {
    label: 'Oven',
    fields: [
      { key: 'ovenType', label: 'Oven Type', type: 'select', options: ['Microwave', 'OTG', 'Convection Microwave', 'Solo Microwave', 'Grill Microwave', 'Built-in Oven'], required: true },
      { key: 'capacityLitresOven', label: 'Capacity (Litres)', type: 'select', options: ['15L', '20L', '23L', '25L', '28L', '30L', '32L', '35L', '40L', '45L'] },
      { key: 'powerConsumption', label: 'Power Consumption', type: 'text', placeholder: 'e.g. 1400W' },
      { key: 'autoCookMenu', label: 'Auto Cook Menu', type: 'boolean' },
      { key: 'grillFunction', label: 'Grill Function', type: 'boolean' },
      { key: 'convectionFunction', label: 'Convection Function', type: 'boolean' },
      { key: 'timer', label: 'Timer', type: 'text', placeholder: 'e.g. 60 minutes' },
      { key: 'temperatureControl', label: 'Temperature Control', type: 'text', placeholder: 'e.g. 100-250°C' },
      { key: 'turntable', label: 'Turntable', type: 'boolean' },
    ],
    filterFields: ['capacityLitresOven', 'ovenType', 'convectionFunction'],
  },

  'gas-stove': {
    label: 'Gas Stove',
    fields: [
      { key: 'numberOfBurners', label: 'Number of Burners', type: 'select', options: ['1 Burner', '2 Burner', '3 Burner', '4 Burner', '5 Burner'], required: true },
      { key: 'burnerMaterial', label: 'Burner Material', type: 'select', options: ['Brass', 'Aluminium', 'Cast Iron'] },
      { key: 'bodyMaterial', label: 'Body Material', type: 'select', options: ['Stainless Steel', 'Glass Top', 'Mild Steel', 'Toughened Glass'] },
      { key: 'ignitionType', label: 'Ignition Type', type: 'select', options: ['Manual', 'Auto Ignition', 'Battery Operated', 'Electric'] },
      { key: 'glassTop', label: 'Glass Top', type: 'boolean' },
      { key: 'isiCertified', label: 'ISI Certified', type: 'boolean' },
      { key: 'panSupportMaterial', label: 'Pan Support Material', type: 'select', options: ['Heavy Duty Pan Support', 'Stainless Steel', 'Cast Iron', 'Mild Steel'] },
      { key: 'spillTray', label: 'Spill Tray', type: 'boolean' },
    ],
    filterFields: ['numberOfBurners', 'ignitionType', 'glassTop'],
  },

  dishwashers: {
    label: 'Dishwasher',
    fields: [
      { key: 'placeSettings', label: 'Capacity (Place Settings)', type: 'select', options: ['8 Place', '10 Place', '12 Place', '13 Place', '14 Place', '15 Place', '16 Place'], required: true },
      { key: 'numberOfWashPrograms', label: 'Number of Wash Programs', type: 'select', options: ['4', '5', '6', '7', '8', '10', '12'] },
      { key: 'waterConsumption', label: 'Water Consumption', type: 'text', placeholder: 'e.g. 10 Litres' },
      { key: 'energyRating', label: 'Energy Rating', type: 'select', options: ['A', 'A+', 'A++', 'A+++'] },
      { key: 'noiseLevel', label: 'Noise Level', type: 'text', placeholder: 'e.g. 44 dB' },
      { key: 'installationType', label: 'Installation Type', type: 'select', options: ['Free Standing', 'Built-in', 'Semi Built-in', 'Countertop'] },
      { key: 'halfLoadOption', label: 'Half Load Option', type: 'boolean' },
      { key: 'childLock', label: 'Child Lock', type: 'boolean' },
      { key: 'dryingFeature', label: 'Drying Feature', type: 'boolean' },
      { key: 'suitableUtensils', label: 'Suitable Utensils', type: 'text', placeholder: 'e.g. Indian, Steel, Non-stick' },
    ],
    filterFields: ['placeSettings', 'numberOfWashPrograms', 'installationType'],
  },

  projector: {
    label: 'Projector',
    fields: [
      { key: 'brightnessLumens', label: 'Brightness (Lumens)', type: 'text', placeholder: 'e.g. 3000 ANSI Lumens', required: true },
      { key: 'resolutionType', label: 'Resolution', type: 'select', options: ['HD Ready', 'Full HD', '4K Ultra HD'] },
      { key: 'projectionSize', label: 'Projection Size', type: 'text', placeholder: 'e.g. 30 to 300 inches' },
      { key: 'lampLifeHours', label: 'Lamp Life (Hours)', type: 'text', placeholder: 'e.g. 10000 Hours' },
      { key: 'contrastRatio', label: 'Contrast Ratio', type: 'text', placeholder: 'e.g. 10000:1' },
      { key: 'connectivity', label: 'Connectivity', type: 'text', placeholder: 'e.g. HDMI, USB, Wi-Fi' },
      { key: 'speakerOutput', label: 'Speaker Output', type: 'text', placeholder: 'e.g. 10W' },
      { key: 'smartFeatures', label: 'Smart Features', type: 'boolean' },
    ],
    filterFields: ['brightnessLumens', 'resolutionType'],
  },

  gyser: {
    label: 'Geyser / Water Heater',
    fields: [
      { key: 'capacityLitresGeyser', label: 'Capacity (Litres)', type: 'select', options: ['3L', '6L', '10L', '15L', '25L', '35L', '50L'], required: true },
      { key: 'mountType', label: 'Mount Type', type: 'select', options: ['Vertical', 'Horizontal'] },
      { key: 'tankMaterial', label: 'Tank Material', type: 'select', options: ['Stainless Steel', 'Glass Lined', 'Copper', 'Titanium Enamel'] },
      { key: 'heatingElement', label: 'Heating Element', type: 'select', options: ['Copper', 'Incoloy', 'Glass Coated'] },
      { key: 'starRatingGeyser', label: 'Star Rating', type: 'select', options: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'] },
      { key: 'pressureRating', label: 'Pressure Rating', type: 'text', placeholder: 'e.g. 8 Bar' },
      { key: 'powerConsumption', label: 'Power Consumption', type: 'text', placeholder: 'e.g. 2000W' },
      { key: 'autoShutOff', label: 'Auto Shut Off', type: 'boolean' },
    ],
    filterFields: ['capacityLitresGeyser', 'mountType', 'starRatingGeyser'],
  },

  'vacuum-cleaner': {
    label: 'Vacuum Cleaner',
    fields: [
      { key: 'cleanerType', label: 'Cleaner Type', type: 'select', options: ['Canister', 'Handheld', 'Stick', 'Robotic', 'Upright', 'Wet & Dry'], required: true },
      { key: 'suctionPowerWatts', label: 'Suction Power (Watts)', type: 'text', placeholder: 'e.g. 1900W' },
      { key: 'dustCapacity', label: 'Dust Capacity', type: 'text', placeholder: 'e.g. 2 Litres' },
      { key: 'cordLength', label: 'Cord Length', type: 'text', placeholder: 'e.g. 5 meters' },
      { key: 'attachmentsIncluded', label: 'Attachments Included', type: 'text', placeholder: 'e.g. Crevice Tool, Dusting Brush' },
      { key: 'noiseLevel', label: 'Noise Level', type: 'text', placeholder: 'e.g. 80 dB' },
      { key: 'powerConsumption', label: 'Power Consumption', type: 'text', placeholder: 'e.g. 1500W' },
      { key: 'hepaFilter', label: 'HEPA Filter', type: 'boolean' },
    ],
    filterFields: ['cleanerType', 'suctionPowerWatts'],
  },
  chimney: {
    label: 'Chimney',
    fields: [
      { key: 'filterType', label: 'Filter Type', type: 'select', options: ['Baffle Filter', 'Cassette Filter', 'Mesh Filter', 'Filterless'], required: true },
      { key: 'suctionCapacity', label: 'Suction Capacity', type: 'text', placeholder: 'e.g. 1200 m3/hr', required: true },
      { key: 'motorType', label: 'Motor Type', type: 'text', placeholder: 'e.g. BLDC' },
      { key: 'controlType', label: 'Control Type', type: 'select', options: ['Touch Control', 'Push Button', 'Gesture Control'] },
      { key: 'noiseLevel', label: 'Noise Level', type: 'text', placeholder: 'e.g. 58 dB' },
      { key: 'autoClean', label: 'Auto Clean', type: 'boolean' },
      { key: 'lightingType', label: 'Lighting Type', type: 'text', placeholder: 'e.g. LED 2x1.5W' },
      { key: 'ductType', label: 'Duct Type', type: 'select', options: ['Ducted', 'Ductless'] },
      { key: 'powerConsumption', label: 'Power Consumption', type: 'text', placeholder: 'e.g. 150W' },
      { key: 'installationType', label: 'Installation Type', type: 'select', options: ['Wall Mounted', 'Island', 'Built-in'] },
      { key: 'warranty', label: 'Warranty', type: 'text', placeholder: 'e.g. 1 Year on Product, 5 Years on Motor' },
    ],
    filterFields: ['filterType', 'suctionCapacity', 'autoClean', 'installationType'],
  },

  'air-cooler': {
    label: 'Air Cooler',
    fields: [
      { key: 'tankCapacity', label: 'Tank Capacity', type: 'text', placeholder: 'e.g. 40 Litres', required: true },
      { key: 'airDelivery', label: 'Air Delivery', type: 'text', placeholder: 'e.g. 3000 m3/hr' },
      { key: 'coolingArea', label: 'Cooling Area', type: 'text', placeholder: 'e.g. 150 sq. ft.' },
      { key: 'honeycombPads', label: 'Honeycomb Pads', type: 'boolean' },
      { key: 'iceChamber', label: 'Ice Chamber', type: 'boolean' },
      { key: 'powerConsumption', label: 'Power Consumption', type: 'text', placeholder: 'e.g. 130W' },
    ],
    filterFields: ['tankCapacity', 'honeycombPads'],
  },
};

// Helper: Get category config by slug and optional subCategoryName
export const getCategoryConfig = (slug, subCategoryName) => {
  if (slug === 'gas-stove') {
    if (subCategoryName === 'Chimney') return CATEGORY_FIELDS['chimney'];
    if (subCategoryName === 'Gas Stove') return CATEGORY_FIELDS['gas-stove'];
    return null; // Return null if subcategory not explicitly selected
  }

  if (slug === 'fan') {
    if (subCategoryName === 'Air Cooler') return CATEGORY_FIELDS['air-cooler'];
    if (subCategoryName === 'Fan') return CATEGORY_FIELDS['fan'];
    return null;
  }

  return CATEGORY_FIELDS[slug] || null;
};

// Helper: Get all category slugs
export const getAllCategorySlugs = () => {
  return Object.keys(CATEGORY_FIELDS);
};

// Helper: Get filter fields for a category
export const getFilterFields = (slug, subCategoryName) => {
  const config = getCategoryConfig(slug, subCategoryName);
  if (!config) return [];
  return config.fields.filter(f => config.filterFields.includes(f.key));
};

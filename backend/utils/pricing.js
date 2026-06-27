export const calculateDiscount = () => {
  // Reserved for future coupon logic
  return 0;
};

export const calculateShipping = (settings, subtotal) => {
  if (!settings || !settings.shippingEnabled) return 0;
  if (subtotal >= settings.freeShippingThreshold) return 0;
  return settings.shippingCharge || 0;
};

export const calculateTax = (settings, subtotal) => {
  return 0; // GST removed as per request
};

export const calculateAdvance = (settings, paymentMethod, subtotal) => {
  if (!settings || !settings.advancePaymentEnabled) return 0;
  
  if (!settings.applicableAdvanceMethods || !settings.applicableAdvanceMethods.includes(paymentMethod)) {
    return 0;
  }

  let advance = 0;
  if (settings.advancePaymentType === 'fixed') {
    advance = settings.advancePaymentFixed || 0;
  } else {
    // Always use percentage based on subtotal (Selling Price), not grandTotal
    const pct = settings.advancePaymentPercentage || 0;
    advance = (subtotal * pct) / 100;
  }

  // Advance cannot exceed the subtotal
  return Math.min(advance, subtotal);
};

export const calculateGrandTotal = (subtotal, shipping, tax, discount) => {
  return subtotal + shipping + tax - discount;
};

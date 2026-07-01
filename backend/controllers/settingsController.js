import Settings from '../models/Settings.js';

// @desc    Get store settings (public — filtered)
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Only expose fields the customer frontend needs — hide sensitive business config
    const publicSettings = {
      isCodEnabled: settings.isCodEnabled,
      isUpiEnabled: settings.isUpiEnabled,
      isRazorpayEnabled: settings.isRazorpayEnabled,
      shippingEnabled: settings.shippingEnabled,
      shippingCharge: settings.shippingCharge,
      freeShippingThreshold: settings.freeShippingThreshold,
      advancePaymentEnabled: settings.advancePaymentEnabled,
      advancePaymentPercentage: settings.advancePaymentPercentage,
      applicableAdvanceMethods: settings.applicableAdvanceMethods,
      maxOrderQuantity: settings.maxOrderQuantity,
      allowGuestCheckout: settings.allowGuestCheckout,
      whatsappNumber: settings.whatsappNumber,
    };
    
    res.json(publicSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Admin
export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.getSettings();
    
    const allowedFields = [
      'whatsappNumber', 'upiId', 'upiQrImage', 'upiMerchantName', 'bankName', 'accountNumber',
      'isCodEnabled', 'isUpiEnabled', 'isRazorpayEnabled', 'paymentMethods',
      'advancePaymentEnabled', 'advancePaymentType', 'advancePaymentPercentage', 'advancePaymentFixed', 'applicableAdvanceMethods',
      'shippingEnabled', 'shippingCharge', 'freeShippingThreshold',
      'gstPercentage',
      'autoConfirmOrders', 'allowGuestCheckout', 'invoicePrefix',
      'maxOrderQuantity',
      'googleSheetUrl'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });
    
    const updated = await settings.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get full store settings (admin only — unfiltered)
// @route   GET /api/settings/admin
// @access  Admin
export const getAdminSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

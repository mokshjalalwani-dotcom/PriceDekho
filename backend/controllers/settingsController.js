import Settings from '../models/Settings.js';

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertTriangle, Truck, CreditCard, Settings as SettingsIcon } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    whatsappNumber: '',
    isCodEnabled: true,
    isUpiEnabled: true,
    isRazorpayEnabled: false,
    upiMerchantName: '',
    upiId: '',
    bankName: '',
    accountNumber: '',
    advancePaymentEnabled: false,
    advancePaymentType: 'percentage',
    advancePaymentPercentage: 20,
    advancePaymentFixed: 500,
    applicableAdvanceMethods: ['cod'],
    shippingEnabled: true,
    shippingCharge: 60,
    freeShippingThreshold: 999,
    gstPercentage: 18,
    autoConfirmOrders: false,
    allowGuestCheckout: true,
    invoicePrefix: 'ORD-',
    maxOrderQuantity: 10,
    googleSheetUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('payments');

  const token = localStorage.getItem('adminToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings/admin', authHeader);
        if (res.data) {
          // Merge defaults in case new fields are missing
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch (error) {
        console.error('Failed to fetch settings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePaymentMethodToggle = (id) => {
    setSettings(prev => {
      const pms = [...(prev.paymentMethods || [])];
      const idx = pms.findIndex(p => p.id === id);
      if (idx > -1) {
        pms[idx].enabled = !pms[idx].enabled;
      } else {
        pms.push({ id, enabled: true });
      }
      return { ...prev, paymentMethods: pms };
    });
  };

  const isMethodEnabled = (id) => {
    return settings.paymentMethods?.find(p => p.id === id)?.enabled || false;
  };

  const handleAdvanceMethodToggle = (id) => {
    setSettings(prev => {
      let arr = [...(prev.applicableAdvanceMethods || [])];
      if (arr.includes(id)) arr = arr.filter(m => m !== id);
      else arr.push(id);
      return { ...prev, applicableAdvanceMethods: arr };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.put('/api/settings', settings, authHeader);
      setSettings(prev => ({ ...prev, ...res.data }));
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  const inputCls = "w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-focus";

  return (
    <div className="max-w-5xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex border-b border-gray-200 bg-gray-50/50">
        <button onClick={() => setActiveTab('payments')} className={`px-6 py-4 font-semibold text-sm ${activeTab === 'payments' ? 'text-theme-primary border-b-2 border-theme-primary bg-white' : 'text-gray-600 hover:bg-gray-100'}`}>Payments & Advance</button>
        <button onClick={() => setActiveTab('shipping')} className={`px-6 py-4 font-semibold text-sm ${activeTab === 'shipping' ? 'text-theme-primary border-b-2 border-theme-primary bg-white' : 'text-gray-600 hover:bg-gray-100'}`}>Shipping & Taxes</button>
        <button onClick={() => setActiveTab('general')} className={`px-6 py-4 font-semibold text-sm ${activeTab === 'general' ? 'text-theme-primary border-b-2 border-theme-primary bg-white' : 'text-gray-600 hover:bg-gray-100'}`}>General Config</button>
      </div>

      <form onSubmit={handleSave} className="p-6">
        {activeTab === 'payments' && (
          <div className="space-y-8">
            {/* Payment Methods */}
            <div className="space-y-4">
              <h4 className="text-md font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><CreditCard size={18}/> Payment Methods</h4>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isCodEnabled" checked={settings.isCodEnabled} onChange={handleChange} className="accent-[var(--color-primary)] w-4 h-4" />
                  <span className="font-medium text-gray-700">Cash on Delivery (COD)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isUpiEnabled" checked={settings.isUpiEnabled} onChange={handleChange} className="accent-[var(--color-primary)] w-4 h-4" />
                  <span className="font-medium text-gray-700">Direct UPI</span>
                </label>
              </div>

              {settings.isUpiEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Merchant Name</label>
                    <input type="text" name="upiMerchantName" value={settings.upiMerchantName} onChange={handleChange} placeholder="Satguru Electronics" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                    <input type="text" name="upiId" value={settings.upiId} onChange={handleChange} placeholder="satguru@upi" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input type="text" name="bankName" value={settings.bankName} onChange={handleChange} placeholder="HDFC Bank" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input type="text" name="accountNumber" value={settings.accountNumber} onChange={handleChange} placeholder="XXXX XXXX 1234" className={inputCls} />
                  </div>
                </div>
              )}
            </div>

            {/* Advance Payment */}
            <div className="space-y-4">
              <h4 className="text-md font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                Advance Payment Policy <AlertTriangle size={16} className="text-theme-primary" />
              </h4>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="advancePaymentEnabled" checked={settings.advancePaymentEnabled} onChange={handleChange} className="accent-[var(--color-primary)] w-4 h-4" />
                <span className="font-medium text-gray-700">Enable Advance Payment Rules</span>
              </label>

              {settings.advancePaymentEnabled && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Advance Percentage (%)</label>
                      <input type="number" name="advancePaymentPercentage" value={settings.advancePaymentPercentage} onChange={handleChange} min="1" max="100" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apply Advance Rule To:</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="checkbox" checked={settings.applicableAdvanceMethods?.includes('cod')} onChange={() => handleAdvanceMethodToggle('cod')} className="accent-[var(--color-primary)]" />
                        COD
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="checkbox" checked={settings.applicableAdvanceMethods?.includes('upi')} onChange={() => handleAdvanceMethodToggle('upi')} className="accent-[var(--color-primary)]" />
                        UPI
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-md font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><Truck size={18}/> Shipping Settings</h4>
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input type="checkbox" name="shippingEnabled" checked={settings.shippingEnabled} onChange={handleChange} className="accent-[var(--color-primary)] w-4 h-4" />
                <span className="font-medium text-gray-700">Enable Delivery Charges</span>
              </label>

              {settings.shippingEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Standard Shipping Charge (₹)</label>
                    <input type="number" name="shippingCharge" value={settings.shippingCharge} onChange={handleChange} min="0" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (₹)</label>
                    <input type="number" name="freeShippingThreshold" value={settings.freeShippingThreshold} onChange={handleChange} min="0" className={inputCls} />
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-md font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><SettingsIcon size={18}/> General Configurations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Enquiry Number</label>
                  <input type="text" name="whatsappNumber" value={settings.whatsappNumber} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
                  <input type="text" name="invoicePrefix" value={settings.invoicePrefix} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Order Quantity (Per Item)</label>
                  <input type="number" name="maxOrderQuantity" value={settings.maxOrderQuantity} onChange={handleChange} min="1" className={inputCls} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-bold text-gray-800 border-b pb-2 flex items-center gap-2">Integrations</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Sheet URL</label>
                <input type="text" name="googleSheetUrl" value={settings.googleSheetUrl} onChange={handleChange} placeholder="https://docs.google.com/spreadsheets/d/..." className={inputCls} />
                <p className="text-xs text-gray-500 mt-1">This sheet will be used for the product sync engine.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-bold text-gray-800 border-b pb-2">Checkout Flow</h4>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="allowGuestCheckout" checked={settings.allowGuestCheckout} onChange={handleChange} className="accent-[var(--color-primary)] w-4 h-4" />
                  <span className="font-medium text-gray-700">Allow Guest Checkout</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="autoConfirmOrders" checked={settings.autoConfirmOrders} onChange={handleChange} className="accent-[var(--color-primary)] w-4 h-4" />
                  <span className="font-medium text-gray-700">Auto-Confirm Online Paid Orders</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 mt-8 border-t border-gray-100 flex flex-col items-end gap-3">
          {message.text && (
            <div className={`px-4 py-2 w-full max-w-sm rounded-lg text-sm font-medium text-center shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}
          <button type="submit" disabled={saving} className="btn-primary py-2 px-8 flex items-center gap-2 font-semibold">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;

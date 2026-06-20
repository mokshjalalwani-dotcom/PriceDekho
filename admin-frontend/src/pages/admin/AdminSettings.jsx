import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertTriangle } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    whatsappNumber: '',
    upiId: '',
    upiQrImage: '',
    upiEnabled: false,
    codAdvanceEnabled: true,
    codAdvancePercent: 50
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const token = localStorage.getItem('adminToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        if (res.data) {
          setSettings(res.data);
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
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.put('/api/settings', settings, authHeader);
      setSettings(res.data);
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

  return (
    <div className="max-w-4xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900">Store Settings</h3>
        <p className="text-sm text-gray-500">Configure WhatsApp enquiries, UPI payments, and COD policies.</p>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-8">
        {/* WhatsApp Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-bold text-gray-800 border-b pb-2">WhatsApp Enquiry</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
            <input
              type="text"
              name="whatsappNumber"
              value={settings.whatsappNumber}
              onChange={handleChange}
              placeholder="e.g. +919876543210"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 max-w-md"
            />
            <p className="text-xs text-gray-500 mt-1">Include country code. Customers will be redirected to this number.</p>
          </div>
        </div>

        {/* UPI Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-bold text-gray-800 border-b pb-2">UPI Payments</h4>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="upiEnabled" checked={settings.upiEnabled} onChange={handleChange} className="accent-[var(--color-primary)] w-4 h-4" />
            <span className="text-sm font-medium text-gray-700">Enable Direct UPI Payments</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
              <input
                type="text"
                name="upiId"
                value={settings.upiId}
                onChange={handleChange}
                placeholder="e.g. satguru@upi"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UPI QR Code Image URL (Optional)</label>
              <input
                type="text"
                name="upiQrImage"
                value={settings.upiQrImage}
                onChange={handleChange}
                placeholder="https://example.com/qr.png"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
        </div>

        {/* COD Policy */}
        <div className="space-y-4">
          <h4 className="text-md font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
            Cash on Delivery (COD) Policy <AlertTriangle size={16} className="text-orange-500" />
          </h4>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="codAdvanceEnabled" checked={settings.codAdvanceEnabled} onChange={handleChange} className="accent-[var(--color-primary)] w-4 h-4" />
            <span className="text-sm font-medium text-gray-700">Require Advance Payment for COD</span>
          </label>

          {settings.codAdvanceEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advance Percentage (%)</label>
              <input
                type="number"
                name="codAdvancePercent"
                value={settings.codAdvancePercent}
                onChange={handleChange}
                min="1"
                max="100"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 max-w-[150px]"
              />
              <p className="text-xs text-gray-500 mt-1">Customers selecting COD will be asked to pay this percentage of the total via UPI first.</p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col items-end gap-3">
          {message.text && (
            <div className={`px-4 py-2 w-full max-w-sm rounded-lg text-sm font-medium text-center shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}
          <button type="submit" disabled={saving} className="btn-primary py-2 px-6 flex items-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;

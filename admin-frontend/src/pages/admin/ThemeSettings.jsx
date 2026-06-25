import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { Palette, Save, RefreshCcw } from 'lucide-react';

const defaultTheme = {
  primary: '#FF6600',
  primaryLight: '#FFF3E0',
  primaryDark: '#E65C00',
  primaryHover: '#E65C00',
  primaryFocus: '#FF8533',
  discountBadge: '#00C853'
};

const presetPalettes = [
  { name: 'Satguru Orange', primary: '#FF6600', primaryLight: '#FFF3E0', primaryDark: '#E65C00', primaryHover: '#E65C00', primaryFocus: '#FF8533' },
  { name: 'Luxury Brown', primary: '#7B3F00', primaryLight: '#EBD8C7', primaryDark: '#331B00', primaryHover: '#693600', primaryFocus: '#A8612A' },
  { name: 'Royal Blue', primary: '#1D4ED8', primaryLight: '#DBEAFE', primaryDark: '#1E3A8A', primaryHover: '#1E40AF', primaryFocus: '#3B82F6' },
  { name: 'Emerald Green', primary: '#059669', primaryLight: '#D1FAE5', primaryDark: '#064E3B', primaryHover: '#047857', primaryFocus: '#34D399' },
  { name: 'Deep Purple', primary: '#7C3AED', primaryLight: '#EDE9FE', primaryDark: '#4C1D95', primaryHover: '#6D28D9', primaryFocus: '#A78BFA' },
  { name: 'Rose Red', primary: '#E11D48', primaryLight: '#FFE4E6', primaryDark: '#9F1239', primaryHover: '#BE123C', primaryFocus: '#FB7185' },
  { name: 'Teal', primary: '#0D9488', primaryLight: '#CCFBF1', primaryDark: '#134E4A', primaryHover: '#0F766E', primaryFocus: '#2DD4BF' },
  { name: 'Slate Dark', primary: '#475569', primaryLight: '#F1F5F9', primaryDark: '#1E293B', primaryHover: '#334155', primaryFocus: '#94A3B8' },
];

const ThemeSettings = () => {
  const { theme, fetchTheme } = useTheme();
  const [formData, setFormData] = useState(defaultTheme);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (theme) {
      setFormData({
        primary: theme.primary || defaultTheme.primary,
        primaryLight: theme.primaryLight || defaultTheme.primaryLight,
        primaryDark: theme.primaryDark || defaultTheme.primaryDark,
        primaryHover: theme.primaryHover || defaultTheme.primaryHover,
        primaryFocus: theme.primaryFocus || defaultTheme.primaryFocus,
        discountBadge: theme.discountBadge || defaultTheme.discountBadge,
      });
    }
  }, [theme]);

  const handleColorChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put('/api/theme', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchTheme();
      setMessage('Theme updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update theme.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put('/api/theme', defaultTheme, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(defaultTheme);
      await fetchTheme();
      setMessage('Theme reset to default successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to reset theme.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
          <Palette size={24} className="text-[var(--theme-primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Theme Builder</h1>
          <p className="text-gray-500 text-sm mt-1">Customize the global brand colors across the customer storefront and admin panel.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSave} className="p-6">
          {/* Preset Palettes */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 border-b pb-2 mb-4">Quick Presets</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {presetPalettes.map((preset) => {
                const isActive = formData.primary.toLowerCase() === preset.primary.toLowerCase();
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setFormData({
                      primary: preset.primary,
                      primaryLight: preset.primaryLight,
                      primaryDark: preset.primaryDark,
                      primaryHover: preset.primaryHover,
                      primaryFocus: preset.primaryFocus,
                    })}
                    className={`group relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 ${
                      isActive
                        ? 'border-gray-900 bg-gray-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex gap-1">
                      <div className="w-8 h-8 rounded-full shadow-inner ring-1 ring-black/10" style={{ backgroundColor: preset.primary }} />
                      <div className="w-5 h-5 rounded-full shadow-inner ring-1 ring-black/5 self-end -ml-1.5" style={{ backgroundColor: preset.primaryHover }} />
                      <div className="w-4 h-4 rounded-full shadow-inner ring-1 ring-black/5 self-start -ml-1" style={{ backgroundColor: preset.primaryLight }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{preset.name}</span>
                    {isActive && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* Primary Colors */}
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Core Palette</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Primary Brand Color</label>
                  <p className="text-xs text-gray-500 mt-1">Main accent used for buttons, links, etc.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 uppercase">{formData.primary}</span>
                  <input 
                    type="color" 
                    value={formData.primary} 
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="h-10 w-14 p-1 rounded border border-gray-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hover State</label>
                  <p className="text-xs text-gray-500 mt-1">Used when hovering over primary buttons.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 uppercase">{formData.primaryHover}</span>
                  <input 
                    type="color" 
                    value={formData.primaryHover} 
                    onChange={(e) => handleColorChange('primaryHover', e.target.value)}
                    className="h-10 w-14 p-1 rounded border border-gray-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dark Accent</label>
                  <p className="text-xs text-gray-500 mt-1">Used for deep borders or heavy text.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 uppercase">{formData.primaryDark}</span>
                  <input 
                    type="color" 
                    value={formData.primaryDark} 
                    onChange={(e) => handleColorChange('primaryDark', e.target.value)}
                    className="h-10 w-14 p-1 rounded border border-gray-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Subtle Colors */}
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Subtle & Utility</h3>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Light Background</label>
                  <p className="text-xs text-gray-500 mt-1">Used for soft backgrounds (e.g. orange-50).</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 uppercase">{formData.primaryLight}</span>
                  <input 
                    type="color" 
                    value={formData.primaryLight} 
                    onChange={(e) => handleColorChange('primaryLight', e.target.value)}
                    className="h-10 w-14 p-1 rounded border border-gray-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Focus Ring</label>
                  <p className="text-xs text-gray-500 mt-1">Used for glowing borders and outlines.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 uppercase">{formData.primaryFocus}</span>
                  <input 
                    type="color" 
                    value={formData.primaryFocus} 
                    onChange={(e) => handleColorChange('primaryFocus', e.target.value)}
                    className="h-10 w-14 p-1 rounded border border-gray-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Discount Badge</label>
                  <p className="text-xs text-gray-500 mt-1">Used for the "% OFF" badge on product cards.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 uppercase">{formData.discountBadge || '#00C853'}</span>
                  <input 
                    type="color" 
                    value={formData.discountBadge || '#00C853'} 
                    onChange={(e) => handleColorChange('discountBadge', e.target.value)}
                    className="h-10 w-14 p-1 rounded border border-gray-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 mb-8">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Live Preview Components</h4>
            <div className="flex flex-wrap gap-4 items-center">
              <button type="button" style={{ backgroundColor: formData.primary, color: '#fff' }} className="px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors" onMouseOver={(e) => e.currentTarget.style.backgroundColor = formData.primaryHover} onMouseOut={(e) => e.currentTarget.style.backgroundColor = formData.primary}>
                Primary Button
              </button>
              
              <div style={{ backgroundColor: formData.primaryLight, color: formData.primaryDark, borderColor: formData.primaryFocus }} className="px-4 py-2 border-2 rounded-lg font-medium text-sm">
                Active Selection
              </div>
              
              <span style={{ backgroundColor: formData.primary, color: '#fff' }} className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide">
                NEW BADGE
              </span>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-6 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button 
              type="button" 
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
            >
              <RefreshCcw size={16} /> Reset to Default
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 bg-[var(--theme-primary)] hover:bg-[var(--theme-hover)] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Theme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThemeSettings;

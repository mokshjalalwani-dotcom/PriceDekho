import React, { useState } from 'react';
import { X, User, Mail, Phone, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'register') {
        if (!form.name || !form.email || !form.password || !form.confirmPassword) {
          setError('Please fill all required fields');
          setLoading(false);
          return;
        }
        if (form.password !== form.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await register(form.name, form.email, form.phone, form.password);
        addToast('Account created successfully!', 'success');
      } else {
        await login(form.email, form.password);
        addToast('Logged in successfully!', 'success');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switch */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
              mode === 'login' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
              mode === 'register' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="name" value={form.name} onChange={handleChange}
                  className="input-field pl-10" placeholder="Your full name" required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                className="input-field pl-10" placeholder="email@example.com" required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="phone" value={form.phone} onChange={handleChange}
                  className="input-field pl-10" placeholder="9876543210" maxLength={10}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                name="password" type="password" value={form.password} onChange={handleChange}
                className="input-field pl-10" placeholder="••••••••" required minLength={6}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                  className="input-field pl-10" placeholder="••••••••" required minLength={6}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Please wait...</>
            ) : (
              mode === 'login' ? 'Login' : 'Create Account'
            )}
          </button>

          <p className="text-center text-xs text-gray-500">
            {mode === 'login' ? (
              <>Don't have an account? <button type="button" onClick={() => setMode('register')} className="text-orange-600 font-semibold hover:underline">Sign Up</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => setMode('login')} className="text-orange-600 font-semibold hover:underline">Login</button></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;

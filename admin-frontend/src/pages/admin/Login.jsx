import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Sending login request to /api/admin/login with email:', email);
      const res = await axios.post('/api/admin/login', { email, password });
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminInfo', JSON.stringify(res.data));
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('LOGIN ERROR DETAILS:', err);
      if (err.response) {
        // The request was made and the server responded with a status code outside of 2xx
        setError(err.response?.data?.message || `Server Error: ${err.response.status}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('Network Error: Could not connect to the server (Proxy issue?)');
      } else {
        // Something happened in setting up the request
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mb-16">
        <div className="text-center mb-10">
          <div className="w-[104px] h-[104px] rounded-2xl flex items-center justify-center overflow-hidden bg-white mx-auto mb-6 shadow-lg p-2">
            <img src="/logo.png" alt="Satguru Admin Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-600">Secure access for authorized personnel only</p>
        </div>

        <div className="bg-white py-8 px-10 shadow-xl rounded-2xl border border-gray-100">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 mb-6 text-sm font-medium border border-red-100">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 bg-gray-50 focus:bg-white" 
                  placeholder="admin@satguru.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 bg-gray-50 focus:bg-white" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

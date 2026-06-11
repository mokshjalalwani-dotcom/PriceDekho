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
      const res = await axios.post('/api/admin/login', { email, password });
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminInfo', JSON.stringify(res.data));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mb-16">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden bg-white mx-auto mb-6 shadow-lg">
            <img src="https://scontent.fstv8-3.fna.fbcdn.net/v/t39.30808-6/300021862_402490028652945_4472372223676585025_n.png?stp=dst-png&cstp=mx1988x1988&ctp=s1988x1988&_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=a27DF4JTHrkQ7kNvwGa_95R&_nc_oc=AdpCpnZHRWUOA8J7g3cIN0eD0qnWflCUg2iCAfvHIJGMpIGO4zAdMFJhKHxRXoFWVcdYxjNQdziCGF8Xo4f1QDFG&_nc_zt=23&_nc_ht=scontent.fstv8-3.fna&_nc_gid=OgBEbQELv3IGsxePTgMJ9Q&_nc_ss=7b289&oh=00_Af8ktO_MTN191pgTqic1Z6LL--6lBrJkGujJa2OFNoJuZQ&oe=6A2F99E0" alt="Satguru Admin Logo" className="w-full h-full object-cover" />
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

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// VITE_API_BASE_URL should be the backend root, e.g. https://pricedekho-1backend.onrender.com
// All axios calls already include /api/ prefix, so baseURL must NOT end with /api
let baseURL = import.meta.env.VITE_API_BASE_URL || '';
// Safety: strip trailing /api or /api/ to prevent double-pathing
baseURL = baseURL.replace(/\/api\/?$/, '');
axios.defaults.baseURL = baseURL;

console.log('[PriceDekho Admin] API Base URL:', baseURL || '(proxy mode)');

import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

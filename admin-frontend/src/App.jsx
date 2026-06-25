import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import GoogleSheetsSync from './pages/admin/GoogleSheetsSync';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Admin Routes - Standalone Fullscreen Layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/sync/google-sheets" element={<GoogleSheetsSync />} />
          
          {/* Default Route */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;

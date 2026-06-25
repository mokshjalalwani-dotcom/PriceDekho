import React, { createContext, useEffect, useState, useContext } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  // We expose fetchTheme so Admin panel can refresh after saving new settings
  const fetchTheme = async () => {
    try {
      const { data } = await axios.get('/api/theme');
      setTheme(data);
      
      const root = document.documentElement;
      if (data.primary) root.style.setProperty('--theme-primary', data.primary);
      if (data.primaryLight) root.style.setProperty('--theme-light', data.primaryLight);
      if (data.primaryDark) root.style.setProperty('--theme-dark', data.primaryDark);
      if (data.primaryHover) root.style.setProperty('--theme-hover', data.primaryHover);
      if (data.primaryFocus) root.style.setProperty('--theme-focus', data.primaryFocus);
      if (data.discountBadge) root.style.setProperty('--theme-discount', data.discountBadge);
    } catch (err) {
      console.error('Failed to load theme configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, loading, fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

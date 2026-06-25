import React, { createContext, useEffect, useState, useContext } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data } = await axios.get('/api/theme');
        setTheme(data);
        
        // Inject theme variables into the root document safely
        const root = document.documentElement;
        if (data.primary) root.style.setProperty('--theme-primary', data.primary);
        if (data.primaryLight) root.style.setProperty('--theme-light', data.primaryLight);
        if (data.primaryDark) root.style.setProperty('--theme-dark', data.primaryDark);
        if (data.primaryHover) root.style.setProperty('--theme-hover', data.primaryHover);
        if (data.primaryFocus) root.style.setProperty('--theme-focus', data.primaryFocus);
        if (data.discountBadge) root.style.setProperty('--theme-discount', data.discountBadge);
      } catch (err) {
        console.error('Failed to load theme configuration:', err);
        // Do nothing else, CSS fallbacks defined in index.css will handle it safely
      } finally {
        setLoading(false);
      }
    };
    
    fetchTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

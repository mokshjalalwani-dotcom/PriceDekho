import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { CATEGORY_ICONS_MAP, HARDCODED_FALLBACK_CATEGORIES } from '../constants/categories';

const CategoryContext = createContext();

export const useCategory = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Tier 1: Live API
        const res = await axios.get('/api/categories');
        
        // Map the backend data to include the React icon components
        const mappedCategories = res.data.map(cat => ({
          ...cat,
          icon: CATEGORY_ICONS_MAP[cat.iconKey] || CATEGORY_ICONS_MAP['default']
        }));

        setCategories(mappedCategories);
        localStorage.setItem('satguru_categories', JSON.stringify(res.data)); // Cache raw data
      } catch (error) {
        console.error('Failed to fetch categories via API:', error);
        
        // Tier 2: localStorage Cache
        try {
          const cached = localStorage.getItem('satguru_categories');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const mappedCached = parsed.map(cat => ({
                ...cat,
                icon: CATEGORY_ICONS_MAP[cat.iconKey] || CATEGORY_ICONS_MAP['default']
              }));
              setCategories(mappedCached);
              return; // Exit if cache succeeded
            }
          }
        } catch (e) {
          console.error('Cache parsing failed:', e);
        }
        
        // Tier 3: Hardcoded Fallback
        setCategories(HARDCODED_FALLBACK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, loading }}>
      {children}
    </CategoryContext.Provider>
  );
};

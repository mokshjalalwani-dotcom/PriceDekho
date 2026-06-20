import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CompareContext = createContext();

const MAX_COMPARE_ITEMS = 4;

const compareReducer = (state, action) => {
  switch (action.type) {
    case 'ADD': {
      // Don't add if already in list or max reached
      if (state.find(item => item._id === action.payload._id)) return state;
      if (state.length >= MAX_COMPARE_ITEMS) return state;
      const newState = [...state, action.payload];
      localStorage.setItem('compareItems', JSON.stringify(newState));
      return newState;
    }
    case 'REMOVE': {
      const newState = state.filter(item => item._id !== action.payload);
      localStorage.setItem('compareItems', JSON.stringify(newState));
      return newState;
    }
    case 'CLEAR': {
      localStorage.removeItem('compareItems');
      return [];
    }
    default:
      return state;
  }
};

const getInitialState = () => {
  try {
    const stored = localStorage.getItem('compareItems');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const CompareProvider = ({ children }) => {
  const [compareItems, dispatch] = useReducer(compareReducer, [], getInitialState);

  const isInCompare = (productId) => compareItems.some(item => item._id === productId);
  const compareCount = compareItems.length;
  const compareIds = compareItems.map(item => item._id).join(',');
  const isFull = compareItems.length >= MAX_COMPARE_ITEMS;

  return (
    <CompareContext.Provider value={{ compareItems, compareCount, compareIds, isInCompare, isFull, dispatch }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

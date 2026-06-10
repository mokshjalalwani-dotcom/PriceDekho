import React, { createContext, useContext, useReducer, useEffect } from 'react';

const WishlistContext = createContext();

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE': {
      const exists = state.items.find(i => i._id === action.payload._id);
      return {
        ...state,
        items: exists
          ? state.items.filter(i => i._id !== action.payload._id)
          : [...state.items, action.payload],
      };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i._id !== action.payload) };
    case 'LOAD':
      return { ...state, items: action.payload };
    default:
      return state;
  }
};

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

  useEffect(() => {
    const saved = localStorage.getItem('satguru_wishlist');
    if (saved) dispatch({ type: 'LOAD', payload: JSON.parse(saved) });
  }, []);

  useEffect(() => {
    localStorage.setItem('satguru_wishlist', JSON.stringify(state.items));
  }, [state.items]);

  const isWishlisted = (id) => state.items.some(i => i._id === id);
  const wishlistCount = state.items.length;

  return (
    <WishlistContext.Provider value={{ wishlist: state.items, wishlistCount, isWishlisted, dispatch }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

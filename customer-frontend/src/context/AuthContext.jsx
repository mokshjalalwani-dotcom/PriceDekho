import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('customerUser', JSON.stringify(action.payload));
      return { ...state, user: action.payload };
    case 'LOGOUT':
      localStorage.removeItem('customerUser');
      return { ...state, user: null };
    default:
      return state;
  }
};

const getInitialState = () => {
  try {
    const stored = localStorage.getItem('customerUser');
    return { user: stored ? JSON.parse(stored) : null };
  } catch {
    return { user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, null, getInitialState);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    dispatch({ type: 'LOGIN', payload: res.data });
    return res.data;
  };

  const register = async (name, email, phone, password) => {
    const res = await axios.post('/api/auth/register', { name, email, phone, password });
    dispatch({ type: 'LOGIN', payload: res.data });
    return res.data;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ user: state.user, login, register, logout, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Create api instance that updates when token changes
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: `${API_URL}/api`
    });
    
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    return instance;
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      
      try {
        const bizResponse = await api.get('/business');
        setBusiness(bizResponse.data);
      } catch (e) {
        setBusiness(null);
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const newToken = response.data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const newToken = response.data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setBusiness(null);
  };

  const createBusiness = async (data) => {
    const response = await api.post('/business', data);
    setBusiness(response.data);
    return response.data;
  };

  const updateBusiness = async (data) => {
    const response = await api.put('/business', data);
    setBusiness(response.data);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      business,
      loading,
      token,
      api,
      login,
      register,
      logout,
      createBusiness,
      updateBusiness,
      refreshUser: fetchUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

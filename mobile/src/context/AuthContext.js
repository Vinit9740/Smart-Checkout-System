import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const persistAuth = async (authToken, authUser) => {
    await AsyncStorage.setItem('smart_checkout_token', authToken);
    await AsyncStorage.setItem('smart_checkout_user', JSON.stringify(authUser));
  };

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('smart_checkout_token');
      const storedUser = await AsyncStorage.getItem('smart_checkout_user');

      if (storedToken) {
        setToken(storedToken);
        setUser(storedUser ? JSON.parse(storedUser) : null);
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.login(email, password);
    const authUser = response.data.user;
    const authToken = response.data.token;

    setUser(authUser);
    setToken(authToken);
    await persistAuth(authToken, authUser);
    return { success: true };
  };

  const register = async (name, email, password) => {
    const response = await api.register(name, email, password);
    const authUser = response.data.user;
    const authToken = response.data.token;

    setUser(authUser);
    setToken(authToken);
    await persistAuth(authToken, authUser);
    return { success: true };
  };

  const logout = async () => {
    await AsyncStorage.removeItem('smart_checkout_token');
    await AsyncStorage.removeItem('smart_checkout_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

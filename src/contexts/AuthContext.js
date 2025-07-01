import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  const API_URL = process.env.REACT_APP_API_URL || '/api';

  axios.defaults.baseURL = API_URL;
  axios.defaults.withCredentials = true;

  // Add token to requests
  axios.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
        toast.error('Session expired. Please log in again.');
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = Cookies.get('token');
      if (token) {
        const response = await axios.get('/auth/me');
        setUser(response.data.data.user);
      }
    } catch (error) {
      Cookies.remove('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { user, accessToken } = response.data.data;

      Cookies.set('token', accessToken, { expires: 1 }); // 1 day
      setUser(user);
      toast.success(`Welcome back, ${user.firstName}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      const { user, accessToken } = response.data.data;

      Cookies.set('token', accessToken, { expires: 1 });
      setUser(user);
      toast.success(`Welcome, ${user.firstName}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
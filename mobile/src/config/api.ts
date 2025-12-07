import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Update this with your backend URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://clinic-management-backend-2fuj.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('user');
      // Navigate to login (handled in navigation)
    }
    return Promise.reject(error);
  }
);

export default api;


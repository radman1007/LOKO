// src/services/auth.service.js
import apiClient from './api.client';

export const authService = {
  // ====== لاگین ======
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  // ====== ثبت‌نام والدین (عمومی) ======
  registerParent: async (data) => {
    const response = await apiClient.post('/auth/register/parent', data);
    return response.data;
  },

  // ====== خروج ======
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      // خروج محلی صرف‌نظر از خطای سرور
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // ====== دریافت کاربر از localStorage ======
  getStoredUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined') return null;
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  },

  setStoredUser: (user) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
  },

  isAuthenticated: () => !!localStorage.getItem('accessToken'),

  getToken: () => localStorage.getItem('accessToken'),

  // ====== دریافت اطلاعات کاربر جاری از سرور ======
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  updateUser: async () => {
    try {
      const response = await authService.getCurrentUser();
      return response?.success ? response.data : null;
    } catch (error) {
      return null;
    }
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await apiClient.post('/auth/refresh', { refreshToken });
    if (response.data.success) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
      return response.data;
    }
    throw new Error('Refresh failed');
  },
};

export default authService;

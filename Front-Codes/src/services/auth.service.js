// src/services/auth.service.js
import apiClient from './api.client';

export const authService = {
  // ====== لاگین ======
  login: async (credentials) => {
    try {
      const response = await apiClient.post('v1/auth/login', credentials);
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // ====== خروج ======
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('v1/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
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
      console.error('Error parsing stored user:', error);
      return null;
    }
  },

  // ====== ذخیره کاربر در localStorage ======
  setStoredUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  // ====== بررسی احراز هویت ======
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // ====== دریافت توکن ======
  getToken: () => {
    return localStorage.getItem('accessToken');
  },

  // ====== دریافت اطلاعات کاربر جاری از سرور ======
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('v1/auth/me');
      if (response.data.success) {
        const user = response.data.data;
        // به‌روزرسانی localStorage
        localStorage.setItem('user', JSON.stringify(user));
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  // ====== به‌روزرسانی اطلاعات کاربر ======
  updateUser: async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response?.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  },

  // ====== تمدید توکن ======
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('v1/auth/refresh', { refreshToken });
      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        return response.data;
      }
      throw new Error('Refresh failed');
    } catch (error) {
      console.error('Refresh token error:', error);
      // اگر تمدید توکن失敗، کاربر را خارج کنید
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error;
    }
  }
};
// src/contexts/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { GUEST_USER, resetGuestData } from '../data/guestData';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ فقط یک بار در شروع اجرا می‌شود
  useEffect(() => {
    const storedUser = authService.getStoredUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  // ====== لاگین ======
  const login = async (username, password) => {
    try {
      const response = await authService.login({ username, password });
      if (response?.success) {
        setUser(response.data.user);
        return response;
      }
      return { success: false, error: 'ورود ناموفق بود' };
    } catch (error) {
      return { success: false, error: 'خطا در ارتباط با سرور' };
    }
  };

  // ====== ورود به عنوان مهمان (بدون حساب) ======
  const loginAsGuest = () => {
    // پاک‌سازی توکن‌های احتمالی قبلی تا درخواست‌های احراز هویت‌دار زده نشوند
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    resetGuestData();
    localStorage.setItem('user', JSON.stringify(GUEST_USER));
    setUser(GUEST_USER);
    return { success: true, user: GUEST_USER };
  };

  // ====== خروج ======
  const logout = async () => {
    if (!user?.isGuest) {
      await authService.logout();
    } else {
      localStorage.removeItem('user');
      resetGuestData();
    }
    setUser(null);
  };

  // ====== به‌روزرسانی اطلاعات کاربر ======
  const updateUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response?.success && response.data) {
        setUser(response.data);
        // ذخیره در localStorage (توسط authService انجام میشه)
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      loading,
      login,
      loginAsGuest,
      logout,
      updateUser,
      setUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
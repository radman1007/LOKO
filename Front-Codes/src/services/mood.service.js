// src/services/mood.service.js
import apiClient from './api.client';

export const moodService = {
  // بررسی نیاز به نمایش پرسش روزانه
  checkPrompt: async () => {
    const response = await apiClient.get('/mood/prompt');
    return response.data;
  },

  // ثبت وضعیت روحی
  checkin: async (data) => {
    const response = await apiClient.post('/mood/checkin', data);
    return response.data;
  },

  // دریافت تاریخچه
  getHistory: async (days = 30) => {
    const response = await apiClient.get('/mood/history', { params: { days } });
    return response.data;
  },
};

export const breathingService = {
  // ثبت جلسه تنفس
  createSession: async (data) => {
    const response = await apiClient.post('/breathing/sessions', data);
    return response.data;
  },

  // دریافت تاریخچه
  getSessions: async () => {
    const response = await apiClient.get('/breathing/sessions');
    return response.data;
  },

  // وضعیت در دسترس بودن تمرین (هر ۴ ساعت)
  getStatus: async () => {
    const response = await apiClient.get('/breathing/status');
    return response.data;
  },
};

export const gardenService = {
  getState: async () => {
    const response = await apiClient.get('/garden');
    return response.data;
  },
  // شاخص سلامت روان بر اساس داده‌های باغ و تنفس
  getWellbeing: async () => {
    const response = await apiClient.get('/garden/wellbeing');
    return response.data;
  },
};

export const healthService = {
  // آمار کامل سلامت (daily/weekly/monthly/yearly + شاخص سلامت روان)
  getStats: async () => {
    const response = await apiClient.get('/health/stats');
    return response.data;
  },
};

export default moodService;

// src/services/mood.service.js
import apiClient from './api.client';

export const moodService = {
  // بررسی نیاز به نمایش پرسش روزانه
  checkPrompt: async () => {
    // ✅ تصحیح: بدون / ابتدا و با v1/
    const response = await apiClient.get('v1/mood/prompt');
    return response.data;
  },

  // ثبت وضعیت روحی
  checkin: async (data) => {
    // ✅ تصحیح: بدون / ابتدا و با v1/
    const response = await apiClient.post('v1/mood/checkin', data);
    return response.data;
  },

  // دریافت تاریخچه
  getHistory: async () => {
    // ✅ تصحیح: بدون / ابتدا و با v1/
    const response = await apiClient.get('v1/mood/history');
    return response.data;
  },
};

export const breathingService = {
  // ثبت جلسه تنفس
  createSession: async (data) => {
    // ✅ تصحیح: بدون / ابتدا و با v1/
    const response = await apiClient.post('v1/breathing/sessions', data);
    return response.data;
  },

  // دریافت تاریخچه
  getSessions: async () => {
    // ✅ تصحیح: بدون / ابتدا و با v1/
    const response = await apiClient.get('v1/breathing/sessions');
    return response.data;
  },
};
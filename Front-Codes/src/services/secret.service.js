// src/services/secret.service.js
import apiClient from './api.client';

export const secretService = {
  // لیست راز‌ها (بدون محتوای رمزدار — فقط عنوان/متادیتا)
  getSecrets: async () => {
    const response = await apiClient.get('/secrets');
    return response.data;
  },
  // ایجاد راز با رمز اختصاصی
  createSecret: async (data) => {
    // data: { content, moodTag, secretPassword }
    const response = await apiClient.post('/secrets', data);
    return response.data;
  },
  // باز کردن یک راز با رمز همان راز
  unlockSecret: async (id, secretPassword) => {
    const response = await apiClient.post(`/secrets/${id}/unlock`, { secretPassword });
    return response.data;
  },
  // ویرایش راز (نیازمند رمز همان راز)
  updateSecret: async (id, data) => {
    const response = await apiClient.put(`/secrets/${id}`, data);
    return response.data;
  },
  // حذف راز (نیازمند رمز همان راز)
  deleteSecret: async (id, secretPassword) => {
    const response = await apiClient.delete(`/secrets/${id}`, {
      data: { secretPassword },
    });
    return response.data;
  },
};

export default secretService;

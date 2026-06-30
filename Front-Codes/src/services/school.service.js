// src/services/school.service.js
import apiClient from './api.client';

export const schoolService = {
  // دریافت لیست مدارس
  getSchools: async () => {
    const response = await apiClient.get('/v1/schools');
    return response.data;
  },

  // ایجاد مدرسه
  createSchool: async (data) => {
    const response = await apiClient.post('/v1/schools', data);
    return response.data;
  },

  // دریافت کلاس‌های مدرسه
  getSchoolClasses: async (schoolId) => {
    const response = await apiClient.get(`/v1/schools/${schoolId}/classes`);
    return response.data;
  },

  // ایجاد کلاس
  createClass: async (schoolId, data) => {
    const response = await apiClient.post(`/v1/schools/${schoolId}/classes`, data);
    return response.data;
  },
};
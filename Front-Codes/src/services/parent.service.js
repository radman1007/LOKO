// src/services/parent.service.js
import apiClient from './api.client';

export const parentService = {
  // لیست فرزندان
  getChildren: async () => {
    const response = await apiClient.get('/parent/children');
    return response.data;
  },
  // افزودن فرزند
  addChild: async (data) => {
    const response = await apiClient.post('/parent/children', data);
    return response.data;
  },
  // گزارش فرزند
  getChildReport: async (childId) => {
    const response = await apiClient.get(`/parent/children/${childId}/report`);
    return response.data;
  },
  // حذف رابطه والد-فرزند
  removeChild: async (childId) => {
    const response = await apiClient.delete(`/parent/children/${childId}`);
    return response.data;
  },
};

export default parentService;

// src/services/task.service.js
import apiClient from './api.client';

export const taskService = {
  // ثبت انجام تسک
  completeTask: async (taskId) => {
    const response = await apiClient.post(`/tasks/${taskId}/complete`);
    return response.data;
  },
};
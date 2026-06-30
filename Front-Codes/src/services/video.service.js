// src/services/video.service.js
import apiClient from './api.client';

export const videoService = {
  // دریافت لیست ویدیوها
  getVideos: async (params = {}) => {
    const response = await apiClient.get('/videos', { params });
    return response.data;
  },

  // دریافت یک ویدیو
  getVideo: async (id) => {
    const response = await apiClient.get(`/videos/${id}`);
    return response.data;
  },

  // ثبت تعامل (بازدید، لایک)
  addInteraction: async (data) => {
    const response = await apiClient.post('/content/interactions', data);
    return response.data;
  },
};
// src/services/video.service.js
import apiClient from './api.client';

export const videoService = {
  // دریافت لیست ویدیوها (با فیلتر اختیاری categoryId/search/page)
  getVideos: async (params = {}) => {
    const response = await apiClient.get('/videos', { params });
    return response.data;
  },

  // دریافت یک ویدیو
  getVideo: async (id) => {
    const response = await apiClient.get(`/videos/${id}`);
    return response.data;
  },

  // آخرین ویدیوها به تفکیک هر دسته (برای صفحه اصلی Loko TV)
  getLatestByCategory: async () => {
    const response = await apiClient.get('/videos/latest-by-category');
    return response.data;
  },

  // دسته‌بندی‌های ویدیو
  getCategories: async () => {
    const response = await apiClient.get('/content/categories/video');
    return response.data;
  },

  // ثبت تعامل (بازدید، لایک، تکمیل)
  addInteraction: async (data) => {
    const response = await apiClient.post('/content/interactions', data);
    return response.data;
  },

  // آپلود ویدیو (multipart) — مخصوص ادمین
  uploadVideo: async (formData) => {
    const response = await apiClient.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateVideo: async (id, data) => {
    const response = await apiClient.put(`/videos/${id}`, data);
    return response.data;
  },

  deleteVideo: async (id) => {
    const response = await apiClient.delete(`/videos/${id}`);
    return response.data;
  },
};

export const podcastService = {
  // لیست پادکست‌ها
  getPodcasts: async (params = {}) => {
    const response = await apiClient.get('/podcasts', { params });
    return response.data;
  },

  // آخرین پادکست‌ها (صفحه اصلی Loko Podcast)
  getLatest: async (params = {}) => {
    const response = await apiClient.get('/podcasts', {
      params: { ...params, sort: 'latest' },
    });
    return response.data;
  },

  // پادکست روزانه بر اساس حال کاربر
  getDaily: async () => {
    const response = await apiClient.get('/podcasts/daily');
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('/content/categories/podcast');
    return response.data;
  },

  uploadPodcast: async (formData) => {
    const response = await apiClient.post('/podcasts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updatePodcast: async (id, data) => {
    const response = await apiClient.put(`/podcasts/${id}`, data);
    return response.data;
  },

  deletePodcast: async (id) => {
    const response = await apiClient.delete(`/podcasts/${id}`);
    return response.data;
  },
};

export default videoService;

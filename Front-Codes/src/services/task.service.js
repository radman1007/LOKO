// src/services/task.service.js
import apiClient from './api.client';

export const taskService = {
  // لیست تسک‌های امروز دانش‌آموز (با وضعیت انجام‌شده/نشده)
  getDailyTasks: async () => {
    const response = await apiClient.get('/tasks/daily');
    return response.data;
  },

  // ثبت انجام تسک
  completeTask: async (taskId) => {
    const response = await apiClient.post(`/tasks/${taskId}/complete`);
    return response.data;
  },
};

export const clubService = {
  // خلاصه باشگاه: سکه، نشان‌ها، استریک
  getSummary: async () => {
    const response = await apiClient.get('/club/summary');
    return response.data;
  },
  // موجودی سکه
  getCoins: async () => {
    const response = await apiClient.get('/club/coins');
    return response.data;
  },
  // لیست جوایز
  getRewards: async () => {
    const response = await apiClient.get('/club/rewards');
    return response.data;
  },
  // دریافت جایزه
  redeemReward: async (rewardId) => {
    const response = await apiClient.post(`/club/rewards/${rewardId}/redeem`);
    return response.data;
  },
  // نشان‌ها / مدال‌ها
  getBadges: async () => {
    const response = await apiClient.get('/club/badges');
    return response.data;
  },
  // وضعیت استریک هفتگی
  getStreak: async () => {
    const response = await apiClient.get('/club/streak');
    return response.data;
  },
};

export default taskService;

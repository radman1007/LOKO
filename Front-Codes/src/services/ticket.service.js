// src/services/ticket.service.js
import apiClient from './api.client';

export const ticketService = {
  // دریافت لیست تیکت‌ها
  getTickets: async (params = {}) => {
    const response = await apiClient.get('/tickets', { params });
    return response.data;
  },

  // دریافت یک تیکت + پیام‌ها
  getTicket: async (id) => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  // ایجاد تیکت
  createTicket: async (data) => {
    const response = await apiClient.post('/tickets', data);
    return response.data;
  },

  // پاسخ به تیکت
  replyTicket: async (id, message) => {
    const response = await apiClient.post(`/tickets/${id}/reply`, { message });
    return response.data;
  },

  // تغییر وضعیت
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/tickets/${id}/status`, { status });
    return response.data;
  },
};

export default ticketService;

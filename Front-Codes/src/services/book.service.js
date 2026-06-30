// src/services/book.service.js
import apiClient from './api.client';

export const bookService = {
  // کتاب‌های دانش‌آموز جاری (بر اساس کلاس‌های او)
  getMyBooks: async () => {
    const response = await apiClient.get('/books/my');
    return response.data;
  },
  // کلاس‌های دانش‌آموز جاری
  getMyClasses: async () => {
    const response = await apiClient.get('/classes/my');
    return response.data;
  },
  // جزئیات یک کتاب + اطلاعات بازی
  getBook: async (id) => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data;
  },
  // اطلاعات بازی یک کتاب
  getBookGame: async (id) => {
    const response = await apiClient.get(`/books/${id}/game`);
    return response.data;
  },
  // ثبت پایان بازی و دریافت سکه
  completeGame: async (bookId, payload = {}) => {
    const response = await apiClient.post(`/books/${bookId}/game/complete`, payload);
    return response.data;
  },
};

export default bookService;

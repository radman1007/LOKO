// src/services/book.service.js
import apiClient from './api.client';

export const bookService = {
  // کتاب‌های دانش‌آموز جاری (بر اساس کلاس‌های او) — شامل game_count
  getMyBooks: async () => {
    const response = await apiClient.get('/books/my');
    return response.data;
  },
  // کلاس‌های دانش‌آموز جاری
  getMyClasses: async () => {
    const response = await apiClient.get('/classes/my');
    return response.data;
  },
  // جزئیات یک کتاب
  getBook: async (id) => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data;
  },
  // لیست بازی‌های یک کتاب
  getBookGames: async (bookId) => {
    const response = await apiClient.get(`/books/${bookId}/games`);
    return response.data;
  },
  // اطلاعات یک بازی مشخص برای پخش
  getGame: async (gameId) => {
    const response = await apiClient.get(`/games/${gameId}`);
    return response.data;
  },
  // ثبت پایان یک بازی و دریافت سکه
  completeGame: async (gameId, payload = {}) => {
    const response = await apiClient.post(`/games/${gameId}/complete`, payload);
    return response.data;
  },
};

export default bookService;

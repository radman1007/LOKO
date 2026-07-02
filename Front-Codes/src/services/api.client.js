// src/services/api.client.js
import axios from 'axios';

// ✅ آدرس پایه - شامل نسخه v1.
// پیش‌فرض «نسبی» است تا در dev از طریق پروکسی Vite (server.proxy) و در
// production از طریق nginx به بک‌اند برسد — هر دو same-origin و بدون نیاز به CORS.
// در production توسط Dockerfile مقدار REACT_APP_API_URL=/api/v1 جای‌گذاری می‌شود.
const API_URL =
  process.env.REACT_APP_API_URL || '/api/v1';

const IS_DEV = process.env.NODE_ENV !== 'production';
const log = (...args) => { if (IS_DEV) console.log(...args); };
const warn = (...args) => { if (IS_DEV) console.warn(...args); };

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 ثانیه تایم‌اوت
});

// ============================================
// ✅ Interceptor درخواست — افزودن توکن
// ============================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    log('🚀', config.method?.toUpperCase(), (config.baseURL || '') + config.url);
    return config;
  },
  (error) => {
    warn('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// ✅ Interceptor پاسخ — مدیریت خطا و refresh خودکار
// ============================================
let isRefreshing = false;
let refreshQueue = [];

function flushQueue(error, token = null) {
  refreshQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    log('❌', error.response?.status, originalRequest?.url, error.response?.data);

    // کاربر مهمان توکن ندارد؛ نباید با هر 401 به صفحه‌ی ورود هدایت شود
    let isGuestUser = false;
    try {
      isGuestUser = !!JSON.parse(localStorage.getItem('user') || 'null')?.isGuest;
    } catch (e) { /* ignore */ }
    if (isGuestUser) {
      return Promise.reject(error);
    }

    // مسیرهای auth نباید وارد چرخه refresh شوند
    const isAuthPath =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthPath) {
      if (isRefreshing) {
        // منتظر بمان تا refresh جاری تمام شود
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken =
          response.data.data?.accessToken || response.data.accessToken;
        const newRefreshToken =
          response.data.data?.refreshToken || response.data.refreshToken;

        if (!newAccessToken) throw new Error('No access token in refresh response');

        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

        flushQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

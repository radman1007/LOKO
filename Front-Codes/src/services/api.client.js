// src/services/api.client.js
import axios from 'axios';

// ✅ آدرس پایه - مطابق با مستندات
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 ثانیه تایم‌اوت
});

// ============================================
// ✅ Interceptor برای اضافه کردن توکن به درخواست‌ها
// ============================================
apiClient.interceptors.request.use(
  (config) => {
    // 📝 لاگ برای دیباگ
    console.log('🚀 ====== REQUEST ======');
    console.log('📍 URL:', config.baseURL + config.url);
    console.log('📝 Method:', config.method?.toUpperCase());
    console.log('📦 Data:', config.data);
    
    // 🔑 گرفتن توکن از localStorage
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Token exists:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to headers');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    
    console.log('📋 Headers:', config.headers);
    console.log('🚀 ====== END REQUEST ======');
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// ✅ Interceptor برای پاسخ‌ها و مدیریت خطاها
// ============================================
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ ====== RESPONSE ======');
    console.log('📍 URL:', response.config.url);
    console.log('📊 Status:', response.status);
    console.log('📦 Data:', response.data);
    console.log('✅ ====== END RESPONSE ======');
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ ====== ERROR ======');
    console.error('📍 URL:', originalRequest?.url);
    console.error('📊 Status:', error.response?.status);
    console.error('📦 Data:', error.response?.data);
    console.error('❌ ====== END ERROR ======');
    
    // اگر خطای 401 (Unauthorized) بود و قبلاً تلاش نکرده بودیم
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        console.log('🔄 Trying to refresh token...');
        
        if (!refreshToken) {
          console.warn('⚠️ No refresh token found');
          throw new Error('No refresh token');
        }
        
        // درخواست برای دریافت توکن جدید
        const response = await axios.post(`${API_URL}v1/auth/refresh`, {
          refreshToken,
        });
        
        console.log('✅ Token refreshed successfully');
        
        const newAccessToken = response.data.data?.accessToken || response.data.accessToken;
        
        if (!newAccessToken) {
          throw new Error('No access token in refresh response');
        }
        
        // ذخیره توکن جدید
        localStorage.setItem('accessToken', newAccessToken);
        
        // به‌روزرسانی هدر و تکرار درخواست
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Refresh token failed:', refreshError);
        
        // پاک کردن اطلاعات کاربر
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // هدایت به صفحه لاگین
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
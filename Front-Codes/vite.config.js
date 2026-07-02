// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// جایگزین react-scripts (CRA). خروجی بیلد داخل build/ با پوشهٔ static/
// تا Dockerfile و nginx بدون تغییر کار کنند.
export default defineConfig(({ mode }) => {
  // بارگذاری همهٔ متغیرها (از فایل‌های .env و همچنین متغیرهای محیطی سیستم مثل Docker ENV)
  const env = loadEnv(mode, process.cwd(), '')

  // آدرس API که در Dockerfile به‌صورت REACT_APP_API_URL=/api/v1 ست شده است.
  const apiUrl = env.REACT_APP_API_URL || ''

  return {
    plugins: [react()],

    build: {
      outDir: 'build',
      assetsDir: 'static',
      sourcemap: false,
    },

    // حفظ رفتار process.env.REACT_APP_API_URL موجود در کد بدون تغییر سورس.
    // process.env.NODE_ENV را خود Vite به‌صورت خودکار مدیریت می‌کند.
    define: {
      'process.env.REACT_APP_API_URL': JSON.stringify(apiUrl),
    },

    server: {
      port: 3001,
      // 127.0.0.1 (نه localhost) تا در Node 18+ به‌جای IPv6 (::1) روی IPv4
      // به بک‌اند/پورت‌مپ داکر وصل شود و از ECONNREFUSED جلوگیری شود.
      // در صورت نیاز می‌توان با متغیر محیطی VITE_API_PROXY_TARGET override کرد.
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3000',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

// src/components/common/Toast.jsx
import React, { useEffect } from 'react';

/**
 * نوتیفیکیشن سبک بالای صفحه که بعد از چند ثانیه خودکار محو می‌شود.
 * props:
 *   message  : متن پیام
 *   type     : 'info' | 'success' | 'error'
 *   duration : میلی‌ثانیه (پیش‌فرض 3000)
 *   onClose  : callback هنگام بسته‌شدن
 */
const TYPE_STYLES = {
  info: { bg: '#37474F', icon: 'ℹ️' },
  success: { bg: '#2E7D32', icon: '✅' },
  error: { bg: '#C62828', icon: '⚠️' },
};

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  const s = TYPE_STYLES[type] || TYPE_STYLES.info;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: s.bg,
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '14px',
        fontSize: '14px',
        fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        direction: 'rtl',
        maxWidth: '90%',
        animation: 'toastIn 0.3s ease',
      }}
      role="alert"
    >
      <span>{s.icon}</span>
      <span>{message}</span>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, -14px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

export default Toast;

// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import Logo from '../icons/icon26.png';

const Login = () => {
  const { login, loginAsGuest, user, loading } = useUser();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const colors = {
    primary: '#4DB6AC',
    bg: '#E8F5E9',
    cardBg: '#FFFFFF',
    text: '#455A64',
    textSecondary: '#78909C'
  };

  // هدایت کاربر بعد از ورود
  useEffect(() => {
    if (!loading && user) {
      const routes = {
        team_admin: '/admin-panel',
        school_admin: '/school-panel',
        teacher: '/teacher-panel',
        parent: '/parent-panel',
        student: '/'
      };

      navigate(routes[user.role] || '/', { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.bg
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: `3px solid ${colors.primary}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <style>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('لطفاً نام کاربری و رمز عبور را وارد کنید');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (!result?.success) {
        setError(result?.error || 'ورود ناموفق بود');
      }
      // در صورت موفقیت useEffect بالا کاربر را هدایت می‌کند.
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    }

    setIsLoading(false);
  };

  const handleGuest = () => {
    loginAsGuest();
    navigate('/', { replace: true });
  };

  // تا زمان هدایت چیزی نمایش نده
  if (!loading && user) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          background: colors.cardBg,
          borderRadius: '28px',
          padding: '40px 24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src={Logo}
            alt="Loco"
            style={{ width: '70px', height: '70px' }}
          />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              color: colors.primary,
              fontSize: '26px',
              fontWeight: '700'
            }}
          >
            لوکو
          </h1>
          <p style={{ color: colors.text, fontSize: '14px' }}>
            به خانواده لوکو خوش اومدی!
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#FFEBEE',
              color: '#F44336',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '12px',
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              position: 'relative',
              borderRadius: '16px',
              border: `2px solid ${
                focusedField === 'username' || username
                  ? colors.primary
                  : '#E0E0E0'
              }`
            }}
          >
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '18px 18px 8px',
                border: 'none',
                borderRadius: '16px',
                fontSize: '15px',
                outline: 'none',
                background: 'transparent',
                boxSizing: 'border-box',
                textAlign: 'right'
              }}
            />

            <label
              style={{
                position: 'absolute',
                right: '16px',
                top:
                  focusedField === 'username' || username ? '-10px' : '50%',
                transform:
                  focusedField === 'username' || username
                    ? 'translateY(0)'
                    : 'translateY(-50%)',
                fontSize:
                  focusedField === 'username' || username ? '11px' : '15px',
                color:
                  focusedField === 'username' || username
                    ? colors.primary
                    : '#9AA6B5',
                transition: 'all .2s',
                pointerEvents: 'none',
                background: colors.cardBg,
                padding:
                  focusedField === 'username' || username ? '0 8px' : '0'
              }}
            >
              نام کاربری
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              position: 'relative',
              borderRadius: '16px',
              border: `2px solid ${
                focusedField === 'password' || password
                  ? colors.primary
                  : '#E0E0E0'
              }`
            }}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '18px 18px 8px',
                border: 'none',
                borderRadius: '16px',
                fontSize: '15px',
                outline: 'none',
                background: 'transparent',
                boxSizing: 'border-box',
                textAlign: 'right'
              }}
            />

            <label
              style={{
                position: 'absolute',
                right: '16px',
                top:
                  focusedField === 'password' || password ? '-10px' : '50%',
                transform:
                  focusedField === 'password' || password
                    ? 'translateY(0)'
                    : 'translateY(-50%)',
                fontSize:
                  focusedField === 'password' || password ? '11px' : '15px',
                color:
                  focusedField === 'password' || password
                    ? colors.primary
                    : '#9AA6B5',
                transition: 'all .2s',
                pointerEvents: 'none',
                background: colors.cardBg,
                padding:
                  focusedField === 'password' || password ? '0 8px' : '0'
              }}
            >
              رمز عبور
            </label>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px',
            background: isLoading ? '#B0BEC5' : colors.primary,
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'در حال ورود...' : 'ورود به لوکو'}
        </button>

        {/* جداکننده */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#E0E0E0' }} />
          <span style={{ fontSize: '12px', color: colors.textSecondary }}>یا</span>
          <div style={{ flex: 1, height: '1px', background: '#E0E0E0' }} />
        </div>

        {/* ورود به عنوان مهمان */}
        <button
          onClick={handleGuest}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            color: colors.primary,
            border: `2px solid ${colors.primary}`,
            borderRadius: '20px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🚀 ورود به عنوان مهمان
        </button>
        <p style={{ textAlign: 'center', fontSize: '11px', color: colors.textSecondary, marginTop: '8px' }}>
          بدون ثبت‌نام، محصول را با محتوای نمونه‌ی کلاس اول تجربه کن
        </p>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link
            to="/register"
            style={{
              color: colors.textSecondary,
              fontSize: '13px',
              textDecoration: 'none'
            }}
          >
            ثبت‌نام نکردی؟{' '}
            <span style={{ color: colors.primary, fontWeight: '600' }}>
              ثبت‌نام
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
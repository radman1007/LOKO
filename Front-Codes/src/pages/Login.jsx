// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import Logo from '../icons/icon26.png';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const colors = {
    primary: '#4DB6AC',
    bg: '#E8F5E9',
    cardBg: '#FFFFFF',
    text: '#455A64'
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('لطفاً نام کاربری و رمز عبور را وارد کنید');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const result = login(username, password);
      
      if (result.success) {
        const user = result.user;
        
        // اگر دانش‌آموز است و پروفایل کامل نیست، به صفحه تکمیل پروفایل برود
        if (user.role === 'student' && !user.isProfileComplete) {
          navigate('/complete-profile');
        } 
        // والدین
        else if (user.role === 'parent') {
          navigate(`/student-profile/${user.child}`);
        }
        // مدیریتی
        else if (user.role === 'admin') {
          navigate('/admin-panel');
        } else if (user.role === 'school_manager') {
          navigate('/school-panel');
        } else if (user.role === 'teacher') {
          navigate('/teacher-panel');
        }
        // سایر
        else {
          navigate('/');
        }
      } else {
        setError(result.error);
      }
      
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Vazir", "IRANSans", sans-serif'
    }}>
      
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: colors.cardBg,
        borderRadius: '28px',
        padding: '40px 24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        animation: 'fadeInUp 0.4s ease'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src={Logo} alt="Loco" style={{ width: '70px', height: '70px' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: colors.primary, fontSize: '26px', fontWeight: '700', marginBottom: '6px' }}>
            لوکو
          </h1>
          <p style={{ color: colors.text, fontSize: '14px' }}>
            به خانواده لوکو خوش اومدی!
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FFEBEE',
            color: '#F44336',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '24px', position: 'relative' }}>
          <div style={{
            position: 'relative',
            background: 'transparent',
            borderRadius: '16px',
            border: `2px solid ${focusedField === 'username' || username ? colors.primary : '#E0E0E0'}`,
            transition: 'all 0.2s ease'
          }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '18px 18px 8px 18px',
                border: 'none',
                borderRadius: '16px',
                fontSize: '15px',
                outline: 'none',
                background: 'transparent',
                boxSizing: 'border-box',
                textAlign: 'right',
                direction: 'rtl'
              }}
              placeholder=""
            />
            <label style={{
              position: 'absolute',
              right: '16px',
              top: (focusedField === 'username' || username) ? '-10px' : '50%',
              transform: (focusedField === 'username' || username) ? 'translateY(0)' : 'translateY(-50%)',
              fontSize: (focusedField === 'username' || username) ? '11px' : '15px',
              color: (focusedField === 'username' || username) ? colors.primary : '#9AA6B5',
              transition: 'all 0.2s ease',
              pointerEvents: 'none',
              background: colors.cardBg,
              padding: (focusedField === 'username' || username) ? '0 8px' : '0',
              right: '16px',
              zIndex: 1
            }}>
              نام کاربری
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '28px', position: 'relative' }}>
          <div style={{
            position: 'relative',
            background: 'transparent',
            borderRadius: '16px',
            border: `2px solid ${focusedField === 'password' || password ? colors.primary : '#E0E0E0'}`,
            transition: 'all 0.2s ease'
          }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '18px 18px 8px 18px',
                border: 'none',
                borderRadius: '16px',
                fontSize: '15px',
                outline: 'none',
                background: 'transparent',
                boxSizing: 'border-box',
                textAlign: 'right',
                direction: 'rtl'
              }}
              placeholder=""
            />
            <label style={{
              position: 'absolute',
              right: '16px',
              top: (focusedField === 'password' || password) ? '-10px' : '50%',
              transform: (focusedField === 'password' || password) ? 'translateY(0)' : 'translateY(-50%)',
              fontSize: (focusedField === 'password' || password) ? '11px' : '15px',
              color: (focusedField === 'password' || password) ? colors.primary : '#9AA6B5',
              transition: 'all 0.2s ease',
              pointerEvents: 'none',
              background: colors.cardBg,
              padding: (focusedField === 'password' || password) ? '0 8px' : '0',
              right: '16px',
              zIndex: 1
            }}>
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
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isLoading ? 'none' : `0 3px 10px ${colors.primary}50`
          }}
        >
          {isLoading ? 'در حال ورود...' : 'ورود به لوکو'}
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px white inset;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default Login;
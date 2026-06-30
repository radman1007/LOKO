// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { authService } from '../services/auth.service';
import Logo from '../icons/icon26.png';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const colors = {
    primary: '#4DB6AC',
    bg: '#E8F5E9',
    cardBg: '#FFFFFF',
    text: '#455A64'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // اعتبارسنجی
    if (!username.trim() || username.length < 3) {
      setError('نام کاربری باید حداقل ۳ کاراکتر باشد');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    if (password !== confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارد');
      return;
    }

    setIsLoading(true);

    try {
      // ثبت‌نام
      await authService.registerParent({
        username: username,
        password: password,
      });

      // بعد از ثبت‌نام موفق، خودکار لاگین کن
      const result = await login(username, password);
      
      if (result.success) {
        const user = result.user;
        
        // بر اساس نقش هدایت کن
        if (user.role === 'student' && !user.isProfileComplete) {
          navigate('/complete-profile');
        } else if (user.role === 'parent') {
          navigate(`/student-profile/${user.child}`);
        } else if (user.role === 'admin') {
          navigate('/admin-panel');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error);
      }
      
    } catch (error) {
      setError(error.response?.data?.message || 'خطا در ثبت‌نام');
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
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
            ثبت‌نام در لوکو
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

        <form onSubmit={handleSubmit}>
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

          <div style={{ marginBottom: '20px', position: 'relative' }}>
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
                رمز عبور (حداقل ۶ کاراکتر)
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '28px', position: 'relative' }}>
            <div style={{
              position: 'relative',
              background: 'transparent',
              borderRadius: '16px',
              border: `2px solid ${focusedField === 'confirmPassword' || confirmPassword ? colors.primary : '#E0E0E0'}`,
              transition: 'all 0.2s ease'
            }}>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField('confirmPassword')}
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
                top: (focusedField === 'confirmPassword' || confirmPassword) ? '-10px' : '50%',
                transform: (focusedField === 'confirmPassword' || confirmPassword) ? 'translateY(0)' : 'translateY(-50%)',
                fontSize: (focusedField === 'confirmPassword' || confirmPassword) ? '11px' : '15px',
                color: (focusedField === 'confirmPassword' || confirmPassword) ? colors.primary : '#9AA6B5',
                transition: 'all 0.2s ease',
                pointerEvents: 'none',
                background: colors.cardBg,
                padding: (focusedField === 'confirmPassword' || confirmPassword) ? '0 8px' : '0',
                right: '16px',
                zIndex: 1
              }}>
                تکرار رمز عبور
              </label>
            </div>
          </div>

          <button
            type="submit"
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
            {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام 🚀'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link to="/login" style={{
            color: colors.textSecondary,
            fontSize: '13px',
            textDecoration: 'none',
            cursor: 'pointer'
          }}>
            قبلاً ثبت‌نام کردی؟ <span style={{ color: colors.primary, fontWeight: '600' }}>ورود</span>
          </Link>
        </div>
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

export default Register;
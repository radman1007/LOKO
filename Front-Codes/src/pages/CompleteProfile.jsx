// src/pages/CompleteProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import Logo from '../icons/icon26.png';
import Icon24 from '../icons/icon24.png';
import Icon25 from '../icons/icon25.png';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showLokoAvatars, setShowLokoAvatars] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = {
    primary: '#4DB6AC',
    bg: '#E8F5E9',
    cardBg: '#FFFFFF',
    text: '#455A64'
  };

  const lokoAvatars = [
    { id: 1, src: Icon24, name: 'دختر' },
    { id: 2, src: Icon25, name: 'پسر' }
  ];

  // اگر کاربر وجود ندارد، به لاگین برگرد
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAvatar(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLokoAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar.src);
    setShowLokoAvatars(false);
    setError('');
  };

  const handleComplete = () => {
    if (!selectedAvatar) {
      setError('لطفاً یک عکس پروفایل انتخاب کنید');
      return;
    }
    
    setIsLoading(true);
    
    // ایجاد کاربر کامل شده
    const completedUser = {
      ...user,
      avatar: selectedAvatar,
      grade: 'پایه اول',
      isProfileComplete: true,
      name: user?.username?.replace('@', '') || 'کاربر'
    };
    
    // ذخیره در localStorage
    localStorage.setItem('locoUser', JSON.stringify(completedUser));
    
    // به‌روزرسانی context
    updateUser(completedUser);
    
    // بررسی اینکه آیا ذخیره شده
    const savedUser = localStorage.getItem('locoUser');
    const parsedUser = JSON.parse(savedUser);
    console.log('Saved user - isProfileComplete:', parsedUser?.isProfileComplete);
    
    // هدایت به صفحه اصلی بعد از 1 ثانیه
    setTimeout(() => {
      // هدایت مستقیم با window.location
      window.location.href = '/';
    }, 1000);
  };

  if (!user) {
    return null;
  }

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
        padding: '36px 24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        animation: 'fadeInUp 0.4s ease'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src={Logo} alt="Loco" style={{ width: '60px', height: '60px' }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '600', marginBottom: '6px' }}>
            انتخاب عکس پروفایل
          </h2>
          <p style={{ color: colors.primary, fontSize: '13px' }}>
            {user?.username || 'کاربر'} جان، یه عکس برای خودت انتخاب کن
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FFEBEE',
            color: '#F44336',
            padding: '10px',
            borderRadius: '12px',
            fontSize: '12px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: colors.bg,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2.5px solid ${selectedAvatar ? colors.primary : '#E0E0E0'}`,
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            {selectedAvatar ? (
              <img src={selectedAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '44px' }}>📸</span>
            )}
          </div>
        </div>

        <label style={{
          display: 'block',
          width: '100%',
          padding: '13px',
          background: colors.primary,
          color: 'white',
          border: 'none',
          borderRadius: '22px',
          fontSize: '15px',
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '12px',
          transition: 'all 0.3s ease'
        }}>
          📸 انتخاب عکس از گالری
          <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
        </label>

        <button
          onClick={() => setShowLokoAvatars(!showLokoAvatars)}
          style={{
            width: '100%',
            padding: '13px',
            background: 'transparent',
            color: colors.primary,
            border: `1.5px solid ${colors.primary}`,
            borderRadius: '22px',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'all 0.3s ease'
          }}
        >
          🦎 پروفایل لوکو
        </button>

        {showLokoAvatars && (
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            marginBottom: '24px',
            padding: '14px',
            background: colors.bg,
            borderRadius: '22px',
            animation: 'fadeInUp 0.3s ease'
          }}>
            {lokoAvatars.map((avatar) => (
              <div 
                key={avatar.id} 
                onClick={() => handleLokoAvatarSelect(avatar)} 
                style={{ 
                  cursor: 'pointer', 
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '75px',
                  height: '75px',
                  borderRadius: '50%',
                  border: selectedAvatar === avatar.src ? `2.5px solid ${colors.primary}` : '2.5px solid transparent',
                  padding: '3px',
                  transition: 'all 0.2s ease'
                }}>
                  <img 
                    src={avatar.src} 
                    alt={avatar.name} 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  color: selectedAvatar === avatar.src ? colors.primary : '#999', 
                  marginTop: '6px', 
                  display: 'block' 
                }}>
                  {avatar.name}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleComplete}
          disabled={!selectedAvatar || isLoading}
          style={{
            width: '100%',
            padding: '14px',
            background: (selectedAvatar && !isLoading) ? colors.primary : '#E8ECF0',
            color: 'white',
            border: 'none',
            borderRadius: '22px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: (selectedAvatar && !isLoading) ? 'pointer' : 'not-allowed',
            opacity: (selectedAvatar && !isLoading) ? 1 : 0.5,
            transition: 'all 0.3s ease',
            boxShadow: selectedAvatar ? `0 3px 10px ${colors.primary}50` : 'none'
          }}
        >
          {isLoading ? 'در حال رفتن...' : 'شروع ماجراجویی 🚀'}
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default CompleteProfile;
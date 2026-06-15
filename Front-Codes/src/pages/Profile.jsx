import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useHealth } from '../contexts/HealthContext';
import { HiOutlineHome, HiOutlineUser, HiOutlineFire, HiOutlinePlay, HiOutlineHeart, HiOutlineLogout } from 'react-icons/hi';
import TicketList from '../components/common/TicketList';
const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser(); // اضافه کردن logout از context
  const { getTodayStats, getWeeklyStats, getProgressPercentage, healthData, resetHealthData } = useHealth(); // اضافه کردن resetHealthData
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;

  const todayStats = getTodayStats();
  const weeklyStats = getWeeklyStats();
  const progress = getProgressPercentage();

  // تابع خروج از حساب
  const handleLogout = () => {
    // پاک کردن localStorage
    localStorage.clear();
    
    // پاک کردن sessionStorage
    sessionStorage.clear();
    
    // پاک کردن کوکی‌ها (اختیاری)
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // ریست کردن stateهای context
    if (logout) logout();
    if (resetHealthData) resetHealthData();
    
    // هدایت به صفحه لاگین
    navigate('/login', { replace: true });
  };

  const colors = {
    primary: '#4DB6AC',
    bg: '#E8F5E9',
    cardBg: '#FFFFFF',
    text: '#455A64',
    textSecondary: '#78909C'
  };

  const navItems = [
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' }
  ];

  const displayUsername = user?.username?.replace('@', '') || 'کاربر';

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      fontFamily: "'Shoor', 'Shoor Rounded', sans-serif",
      direction: 'rtl',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: colors.cardBg,
        padding: isMobile ? '16px 16px' : '20px 24px',
        borderBottom: `1px solid ${colors.primary}30`,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: isDesktop ? '1200px' : '100%',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <HiOutlineUser size={24} color={colors.primary} />
            <h1 style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: '700', color: colors.text }}>
              گزارش سلامت
            </h1>
          </div>
          
          {/* دکمه خروج از حساب */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              backgroundColor: '#FF525210',
              color: '#FF5252'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FF525220';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FF525210';
            }}
          >
            <HiOutlineLogout size={isMobile ? 18 : 20} color="#FF5252" />
            <span style={{ 
              fontSize: isMobile ? '12px' : '14px', 
              fontWeight: '500',
              color: '#FF5252'
            }}>
              خروج
            </span>
          </button>
        </div>
      </div>

      {/* Content - بقیه محتوا بدون تغییر */}
      <div style={{
        maxWidth: isDesktop ? '1200px' : '100%',
        margin: '0 auto',
        padding: isMobile ? '20px 16px' : '32px 24px'
      }}>
        {/* Progress Card */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '24px',
          padding: '24px',
          marginBottom: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: `conic-gradient(${colors.primary} 0deg ${progress * 3.6}deg, #E0E0E0 ${progress * 3.6}deg 360deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
              <span style={{ fontSize: '28px', fontWeight: 'bold', color: colors.primary }}>{progress}%</span>
              <span style={{ fontSize: '11px', color: colors.textSecondary }}>سلامت ذهن</span>
            </div>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text, marginBottom: '8px' }}>
            سلامت روانت نسبت به هفته قبل
          </h3>
          <p style={{ fontSize: '13px', color: colors.textSecondary }}>
            {progress >= 70 ? 'عالی! ادامه بده ✨' : progress >= 50 ? 'خوب، می‌تونی بهتر بشی 💪' : 'بیا با هم تمرین کنیم 🌱'}
          </p>
        </div>

        {/* Today's Stats */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>📊</span>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.text }}>امروز</h3>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.primary }}>{todayStats.totalBreathingTime || 0}</div>
              <div style={{ fontSize: '11px', color: colors.textSecondary }}>ثانیه تنفس عمیق</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.primary }}>{todayStats.totalBreaths || 0}</div>
              <div style={{ fontSize: '11px', color: colors.textSecondary }}>نفس عمیق</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.primary }}>{todayStats.focusScore || 0}</div>
              <div style={{ fontSize: '11px', color: colors.textSecondary }}>امتیاز تمرکز</div>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>📈</span>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.text }}>گزارش هفتگی</h3>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '8px',
            height: '150px'
          }}>
            {weeklyStats.map((day, index) => (
              <div key={index} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: `${Math.min(day.focusScore * 1.2, 120)}px`,
                  backgroundColor: day.hasMood ? colors.primary : '#E0E0E0',
                  borderRadius: '8px 8px 4px 4px',
                  marginBottom: '8px'
                }} />
                <span style={{ fontSize: '10px', color: colors.textSecondary }}>{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '20px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <HiOutlineUser size={24} color="white" />
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.text }}>{displayUsername}</h3>
              <p style={{ fontSize: '12px', color: colors.textSecondary }}>عضو لوکو لرن</p>
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            <div style={{ background: colors.bg, borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.primary }}>{healthData?.moodHistory?.length || 0}</div>
              <div style={{ fontSize: '11px', color: colors.textSecondary }}>ثبت وضعیت روحی</div>
            </div>
            <div style={{ background: colors.bg, borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.primary }}>{healthData?.breathingHistory?.length || 0}</div>
              <div style={{ fontSize: '11px', color: colors.textSecondary }}>جلسه تنفس عمیق</div>
            </div>
          </div>
        </div>

        {/* Night Message */}
        {new Date().getHours() >= 20 && (
          <div style={{
            marginTop: '20px',
            background: `linear-gradient(135deg, ${colors.primary}10, ${colors.primary}20)`,
            borderRadius: '20px',
            padding: '20px',
            borderRight: `4px solid ${colors.primary}`
          }}>
            <p style={{ fontSize: '13px', color: colors.text, lineHeight: 1.6 }}>
              🌙 امروز {todayStats.totalBreathingTime || 0} ثانیه تنفس عمیق داشتی و {todayStats.totalBreaths || 0} نفس کشیدی!
              {todayStats.focusScore > 0 && ` تمرکزت ${todayStats.focusScore} درصد بود.`}
              فردا هم می‌تونی بهتر باشی 💚
            </p>
          </div>
        )}
        <TicketList user={user} colors={colors} isMobile={isMobile} />
      </div>

      {/* Navigation Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        left: 0,
        background: 'white',
        boxShadow: '0 -2px 20px rgba(0,0,0,0.08)',
        borderRadius: '28px 28px 0 0',
        padding: isMobile ? '10px 12px' : '12px 20px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100
      }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = item.id === 'پروفایل';
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'transform 0.05s linear'
              }}
            >
              
              <IconComponent size={isMobile ? 20 : 22} color={isActive ? colors.primary : '#999'} />
              <span style={{ fontSize: isMobile ? '9px' : '10px', color: isActive ? colors.primary : '#999', fontWeight: isActive ? '600' : '400' }}>
                {item.name}
              </span>
              {isActive && <div style={{ width: '4px', height: '4px', borderRadius: '2px', background: colors.primary, marginTop: '2px' }} />}
            </div>
          );
        })}
        
      </div>
    </div>
  );
};

export default Profile;
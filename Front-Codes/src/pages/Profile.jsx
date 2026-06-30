// Profile.jsx - نسخه نهایی با رفع خطا
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useHealth } from '../contexts/HealthContext';
import apiClient from '../services/api.client';
import { 
  HiOutlineHome, 
  HiOutlineUser, 
  HiOutlineFire, 
  HiOutlinePlay, 
  HiOutlineHeart, 
  HiOutlineLogout,
  HiOutlineTicket,
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineClock
} from 'react-icons/hi';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useUser();
  const { 
    getTodayStats, 
    getWeeklyStats, 
    getProgressPercentage, 
    healthData, 
    resetHealthData,
    recordBreathing
  } = useHealth();
  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalMoods: 0,
    totalBreathing: 0,
    totalTasks: 0,
    totalPoints: 0,
    level: 1
  });
  const [recentActivities, setRecentActivities] = useState([]);
  
  // ====== State تیکت‌ها ======
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // بارگذاری آمار کاربر و تیکت‌ها
  useEffect(() => {
    loadUserStats();
    loadTickets();
  }, [user, healthData]);

  // ====== بارگذاری آمار کاربر (با بررسی ایمن) ======
  const loadUserStats = () => {
    setLoading(true);
    try {
      // بررسی ایمن برای moodHistory
      const moodHistory = Array.isArray(healthData?.moodHistory) ? healthData.moodHistory : [];
      const breathingHistory = Array.isArray(healthData?.breathingHistory) ? healthData.breathingHistory : [];
      
      setUserStats({
        totalMoods: moodHistory.length || 0,
        totalBreathing: breathingHistory.length || 0,
        totalTasks: 0,
        totalPoints: user?.points || user?.xp || 0,
        level: user?.level || 1
      });
      
      // دریافت فعالیت‌های اخیر از moodHistory
      if (moodHistory.length > 0) {
        const recent = moodHistory
          .slice(-5)
          .reverse()
          .map(m => ({
            id: m.id || Date.now(),
            type: 'mood',
            title: `ثبت حالت ${m.mood === 'good' ? 'خوب' : m.mood === 'normal' ? 'عادی' : 'بد'}`,
            date: m.date || new Date().toISOString(),
            icon: '😊'
          }));
        setRecentActivities(recent);
      } else {
        setRecentActivities([]);
      }
      
    } catch (error) {
      console.error('Error loading user stats:', error);
      // تنظیم مقادیر پیش‌فرض در صورت خطا
      setUserStats({
        totalMoods: 0,
        totalBreathing: 0,
        totalTasks: 0,
        totalPoints: user?.points || user?.xp || 0,
        level: user?.level || 1
      });
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // ====== بارگذاری تیکت‌ها ======
  const loadTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await apiClient.get('v1/tickets');
      console.log('Tickets API response:', res.data);
      
      if (res.data.success) {
        const ticketData = res.data.data;
        if (Array.isArray(ticketData)) {
          setTickets(ticketData);
        } else {
          console.warn('Tickets data is not an array:', ticketData);
          setTickets([]);
        }
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  // ====== ثبت تنفس ======
  const handleBreathing = async () => {
    try {
      await recordBreathing(120, 10);
      
      if (updateUser) {
        await updateUser();
      }
      
      loadUserStats();
      alert('✅ جلسه تنفس با موفقیت ثبت شد!');
      
    } catch (error) {
      console.error('Error recording breathing:', error);
      alert('خطا در ثبت جلسه تنفس');
    }
  };

  // ====== ارسال تیکت ======
  const handleSubmitTicket = async () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      alert('لطفاً موضوع و متن تیکت را وارد کنید');
      return;
    }

    setUpdating(true);
    try {
      await apiClient.post('v1/tickets', {
        subject: ticketSubject,
        message: ticketMessage,
        priority: ticketPriority
      });
      
      alert('✅ تیکت با موفقیت ارسال شد');
      setShowTicketModal(false);
      setTicketSubject('');
      setTicketMessage('');
      setTicketPriority('medium');
      await loadTickets();
      
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert(error.response?.data?.message || 'خطا در ارسال تیکت');
    } finally {
      setUpdating(false);
    }
  };

  // ====== ارسال پاسخ به تیکت ======
  const handleReply = async () => {
    if (!replyMessage.trim()) {
      alert('لطفاً متن پاسخ را وارد کنید');
      return;
    }

    setUpdating(true);
    try {
      await apiClient.post(`v1/tickets/${selectedTicket.id}/reply`, {
        message: replyMessage
      });
      
      alert('✅ پاسخ با موفقیت ارسال شد');
      setReplyMessage('');
      setShowReplyModal(false);
      setSelectedTicket(null);
      await loadTickets();
      
    } catch (error) {
      console.error('Error sending reply:', error);
      alert(error.response?.data?.message || 'خطا در ارسال پاسخ');
    } finally {
      setUpdating(false);
    }
  };

  // ====== تغییر وضعیت تیکت ======
  const handleStatusChange = async (ticketId, status) => {
    setUpdating(true);
    try {
      await apiClient.patch(`v1/tickets/${ticketId}/status`, { status });
      alert('✅ وضعیت تیکت تغییر کرد');
      await loadTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert(error.response?.data?.message || 'خطا در تغییر وضعیت');
    } finally {
      setUpdating(false);
    }
  };

  // ====== خروج ======
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    if (logout) logout();
    if (resetHealthData) resetHealthData();
    navigate('/login', { replace: true });
  };

  // ====== دریافت وضعیت تیکت ======
  const getStatusBadge = (status) => {
    const statusMap = {
      open: { label: 'باز', color: '#FF9800', icon: HiOutlineClock },
      answered: { label: 'پاسخ داده شده', color: '#4CAF50', icon: HiOutlineCheck },
      closed: { label: 'بسته', color: '#9E9E9E', icon: HiOutlineX }
    };
    const s = statusMap[status] || statusMap.open;
    const Icon = s.icon;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: `${s.color}20`,
        color: s.color,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '500'
      }}>
        <Icon size={12} />
        {s.label}
      </span>
    );
  };

  // ====== دریافت اولویت ======
  const getPriorityBadge = (priority) => {
    const priorityMap = {
      low: { label: 'کم', color: '#4CAF50' },
      medium: { label: 'متوسط', color: '#FF9800' },
      high: { label: 'بالا', color: '#F44336' },
      critical: { label: 'فوری', color: '#D32F2F' }
    };
    const p = priorityMap[priority] || priorityMap.medium;
    return (
      <span style={{
        background: `${p.color}20`,
        color: p.color,
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: '500'
      }}>
        {p.label}
      </span>
    );
  };

  // ====== فرمت تاریخ ======
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;

  const todayStats = getTodayStats();
  const weeklyStats = getWeeklyStats();
  const progress = getProgressPercentage();

  const colors = {
    primary: '#4DB6AC',
    bg: '#E8F5E9',
    cardBg: '#FFFFFF',
    text: '#455A64',
    textSecondary: '#78909C',
    primaryLight: '#E0F2F1'
  };

  const navItems = [
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' }
  ];

  const displayUsername = user?.firstName || user?.username?.replace('@', '') || 'کاربر';

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.bg
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${colors.primary}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

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
              پروفایل من
            </h1>
          </div>
          
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
          >
            <HiOutlineLogout size={isMobile ? 18 : 20} color="#FF5252" />
            <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '500', color: '#FF5252' }}>
              خروج
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
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
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.text }}>آمار امروز</h3>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center', background: colors.primaryLight, borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.primary }}>{todayStats.totalBreathingTime || 0}</div>
              <div style={{ fontSize: '11px', color: colors.textSecondary }}>ثانیه تنفس</div>
            </div>
            <div style={{ textAlign: 'center', background: colors.primaryLight, borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.primary }}>{todayStats.totalBreaths || 0}</div>
              <div style={{ fontSize: '11px', color: colors.textSecondary }}>نفس عمیق</div>
            </div>
            <div style={{ textAlign: 'center', background: colors.primaryLight, borderRadius: '12px', padding: '12px' }}>
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
                  marginBottom: '8px',
                  transition: 'height 0.3s ease'
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
          padding: '20px',
          marginBottom: '20px'
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
              <p style={{ fontSize: '12px', color: colors.textSecondary }}>
                سطح {userStats.level} | {userStats.totalPoints} امتیاز
              </p>
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '12px'
          }}>
            <div style={{ background: colors.bg, borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.primary }}>{userStats.totalMoods}</div>
              <div style={{ fontSize: '11px', color: colors.textSecondary }}>ثبت حال</div>
            </div>
            <div style={{ background: colors.bg, borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.primary }}>{userStats.totalBreathing}</div>
              <div style={{ fontSize: '11px', color: colors.textSecondary }}>جلسه تنفس</div>
            </div>
            <div style={{ background: colors.bg, borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.primary }}>{userStats.totalPoints}</div>
              <div style={{ fontSize: '11px', color: colors.textSecondary }}>امتیاز کل</div>
            </div>
          </div>
        </div>

        {/* ====== بخش تیکت‌ها ====== */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineTicket size={20} color={colors.primary} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.text }}>تیکت‌های پشتیبانی</h3>
              <span style={{
                background: colors.bg,
                color: colors.textSecondary,
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {Array.isArray(tickets) ? tickets.length : 0}
              </span>
            </div>
            <button
              onClick={() => setShowTicketModal(true)}
              style={{
                background: colors.primary,
                border: 'none',
                borderRadius: '10px',
                padding: '6px 14px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <HiOutlinePlus size={14} />
              تیکت جدید
            </button>
          </div>

          {ticketsLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: `2px solid ${colors.primary}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto'
              }} />
              <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '8px' }}>در حال بارگذاری...</p>
            </div>
          ) : !Array.isArray(tickets) || tickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <HiOutlineTicket size={32} color={colors.textSecondary} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '8px' }}>هنوز تیکتی ثبت نشده</p>
              <button
                onClick={() => setShowTicketModal(true)}
                style={{
                  marginTop: '8px',
                  background: colors.primary,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ثبت تیکت جدید
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tickets.slice(0, 5).map(ticket => (
                <div
                  key={ticket.id}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setShowReplyModal(true);
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>
                        {ticket.subject}
                      </p>
                      <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
                        {ticket.message && ticket.message.length > 60
                          ? ticket.message.substring(0, 60) + '...'
                          : ticket.message}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <span style={{ fontSize: '10px', color: colors.textSecondary }}>
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {Array.isArray(tickets) && tickets.length > 5 && (
                <button
                  onClick={() => setShowTicketModal(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: colors.primary,
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '8px'
                  }}
                >
                  مشاهده همه {tickets.length} تیکت
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <button
            onClick={handleBreathing}
            style={{
              background: colors.cardBg,
              border: 'none',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <span style={{ fontSize: '24px' }}>🌬️</span>
            <p style={{ fontSize: '12px', color: colors.text, marginTop: '4px' }}>تنفس عمیق</p>
          </button>
          
          <button
            onClick={() => setShowTicketModal(true)}
            style={{
              background: colors.cardBg,
              border: 'none',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <span style={{ fontSize: '24px' }}>🎫</span>
            <p style={{ fontSize: '12px', color: colors.text, marginTop: '4px' }}>تیکت جدید</p>
          </button>
          
          <button
            onClick={() => navigate('/achievements')}
            style={{
              background: colors.cardBg,
              border: 'none',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <span style={{ fontSize: '24px' }}>🏆</span>
            <p style={{ fontSize: '12px', color: colors.text, marginTop: '4px' }}>دستاوردها</p>
          </button>
          
          <button
            onClick={() => navigate('/calm-games')}
            style={{
              background: colors.primary,
              border: 'none',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <span style={{ fontSize: '24px' }}>🧘</span>
            <p style={{ fontSize: '12px', color: 'white', marginTop: '4px' }}>تمرین آرامش</p>
          </button>
        </div>

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <div style={{
            background: colors.cardBg,
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>🕐</span>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.text }}>فعالیت‌های اخیر</h3>
            </div>
            {recentActivities.map((activity) => (
              <div key={activity.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <span style={{ fontSize: '20px' }}>{activity.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: colors.text }}>{activity.title}</p>
                  <p style={{ fontSize: '11px', color: colors.textSecondary }}>
                    {new Date(activity.date).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

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
      </div>

      {/* Modal ارسال تیکت */}
      {showTicketModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }} onClick={() => setShowTicketModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>تیکت جدید</h3>
            
            <input
              type="text"
              placeholder="موضوع *"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${colors.primary}`,
                borderRadius: '12px',
                marginBottom: '12px',
                fontSize: '14px'
              }}
            />
            
            <textarea
              placeholder="متن تیکت *"
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${colors.primary}`,
                borderRadius: '12px',
                marginBottom: '12px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
            
            <select
              value={ticketPriority}
              onChange={(e) => setTicketPriority(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${colors.primary}`,
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '14px'
              }}
            >
              <option value="low">اولویت: کم</option>
              <option value="medium">اولویت: متوسط</option>
              <option value="high">اولویت: بالا</option>
              <option value="critical">اولویت: فوری</option>
            </select>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowTicketModal(false)}
                disabled={updating}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#E0E0E0',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                انصراف
              </button>
              <button
                onClick={handleSubmitTicket}
                disabled={updating}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: colors.primary,
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: updating ? 0.6 : 1
                }}
              >
                {updating ? 'در حال ارسال...' : 'ارسال'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal پاسخ به تیکت */}
      {showReplyModal && selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }} onClick={() => { setShowReplyModal(false); setSelectedTicket(null); }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{selectedTicket.subject}</h3>
              <button
                onClick={() => { setShowReplyModal(false); setSelectedTicket(null); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: colors.textSecondary
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {getStatusBadge(selectedTicket.status)}
                {getPriorityBadge(selectedTicket.priority)}
                <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                  {formatDate(selectedTicket.createdAt)}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: colors.text, lineHeight: 1.6 }}>
                {selectedTicket.message}
              </p>
            </div>

            {/* بخش پاسخ */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                {user?.role === 'team_admin' || user?.role === 'school_admin' ? 'پاسخ به تیکت' : 'ارسال پاسخ'}
              </h4>
              <textarea
                placeholder="متن پاسخ خود را وارد کنید..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${colors.primary}`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
              
              {(user?.role === 'team_admin' || user?.role === 'school_admin') && (
                <div style={{ marginTop: '12px' }}>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => {
                      handleStatusChange(selectedTicket.id, e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${colors.primary}`,
                      borderRadius: '12px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="open">باز</option>
                    <option value="answered">پاسخ داده شده</option>
                    <option value="closed">بسته</option>
                  </select>
                </div>
              )}
              
              <button
                onClick={handleReply}
                disabled={updating}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  padding: '12px',
                  background: colors.primary,
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: updating ? 0.6 : 1
                }}
              >
                {updating ? 'در حال ارسال...' : 'ارسال پاسخ'}
              </button>
            </div>
          </div>
        </div>
      )}

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
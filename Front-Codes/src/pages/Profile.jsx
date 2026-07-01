import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useHealth } from '../contexts/HealthContext';
import apiClient from '../services/api.client';
import { healthService } from '../services/mood.service';
import { clubService } from '../services/task.service';
import { getGuestCoins } from '../data/guestData';
import { HiOutlineHome, HiOutlineUser, HiOutlineFire, HiOutlinePlay, HiOutlineHeart, HiOutlineLogout, HiOutlineTicket, HiOutlinePlus, HiOutlineCheck, HiOutlineX, HiOutlineClock, HiOutlineShoppingBag, HiOutlineAcademicCap, HiOutlineLockClosed } from 'react-icons/hi';

import Header from '../components/common/Header';
import Icon11 from '../icons/icon11.png'; import Icon12 from '../icons/icon12.png'; import Icon13 from '../icons/icon13.png';
import Icon14 from '../icons/icon14.png'; import Icon19 from '../icons/icon19.png'; import Icon20 from '../icons/icon20.png';
import Icon15 from '../icons/icon15.png'; import Icon16 from '../icons/icon16.png'; import Icon17 from '../icons/icon17.png';
import Icon18 from '../icons/icon18.png'; import Icon3 from '../icons/icon3.png';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getTodayStats, getWeeklyStats } = useHealth();
  const isMobile = true;
  
  const [activeStatTab, setActiveStatTab] = useState('weekly');
  const [tickets, setTickets] = useState([]); const [ticketsLoading, setTicketsLoading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false); const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState(''); const [ticketPriority, setTicketPriority] = useState('medium');
  const [selectedTicket, setSelectedTicket] = useState(null); const [replyMessage, setReplyMessage] = useState('');
  const [updating, setUpdating] = useState(false); const [showReplyModal, setShowReplyModal] = useState(false);
  const [healthStats, setHealthStats] = useState(null); // آمار واقعی سلامت از بک‌اند
  const [clubSummary, setClubSummary] = useState(null);  // امتیاز/سکه/استریک واقعی از بک‌اند

  useEffect(() => { loadTickets(); }, [user]);

  // بارگذاری داده‌ی واقعی سلامت + امتیاز/سکه (برای هر کاربر واقعی)
  useEffect(() => {
    if (user?.isGuest) {
      setHealthStats(null);
      // مهمان: امتیاز از سکه‌ی محلی
      setClubSummary({ points: getGuestCoins(), coins: getGuestCoins(), streak: 0 });
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const [healthRes, clubRes] = await Promise.allSettled([
          healthService.getStats(),
          clubService.getSummary(),
        ]);
        if (!mounted) return;
        if (healthRes.status === 'fulfilled' && healthRes.value?.success) setHealthStats(healthRes.value.data);
        if (clubRes.status === 'fulfilled' && clubRes.value?.success) setClubSummary(clubRes.value.data);
      } catch (e) { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, [user]);
  const loadTickets = async () => { if (user?.isGuest) { setTickets([]); return; } setTicketsLoading(true); try { const res = await apiClient.get('/tickets'); if (res.data.success && Array.isArray(res.data.data)) setTickets(res.data.data); else setTickets([]); } catch (error) { setTickets([]); } finally { setTicketsLoading(false); } };

  const handleLogout = () => { localStorage.clear(); sessionStorage.clear(); document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); }); if (user?.resetHealthData) user.resetHealthData(); window.location.href = '/login'; };

  const handleSubmitTicket = async () => { if (user?.isGuest) { alert('برای ثبت تیکت باید ابتدا وارد حساب کاربری شوی. این قابلیت در حالت مهمان در دسترس نیست.'); return; } if (!ticketSubject.trim() || ticketSubject.trim().length < 3) return alert('موضوع تیکت باید حداقل ۳ کاراکتر باشد'); if (!ticketMessage.trim()) return alert('لطفاً متن تیکت را وارد کنید'); setUpdating(true); try { await apiClient.post('/tickets', { subject: ticketSubject.trim(), message: ticketMessage.trim(), priority: ticketPriority }); alert('✅ تیکت با موفقیت ارسال شد'); setShowTicketModal(false); setTicketSubject(''); setTicketMessage(''); setTicketPriority('medium'); await loadTickets(); } catch (error) { alert(error.response?.data?.error?.message || error.response?.data?.message || 'خطا در ارسال تیکت'); } finally { setUpdating(false); } };
  const handleReply = async () => { if (!replyMessage.trim()) return alert('لطفاً متن پاسخ را وارد کنید'); setUpdating(true); try { await apiClient.post(`/tickets/${selectedTicket.id}/reply`, { message: replyMessage.trim() }); alert('✅ پاسخ ارسال شد'); setReplyMessage(''); setShowReplyModal(false); setSelectedTicket(null); await loadTickets(); } catch (error) { alert(error.response?.data?.error?.message || error.response?.data?.message || 'خطا در ارسال پاسخ'); } finally { setUpdating(false); } };

  // امتیاز واحد در کل برنامه = سکه‌ی بک‌اند (هماهنگ با کلاب/کتاب‌ها)
  const currentXP = clubSummary?.coins ?? 0;
  const currentStreak = clubSummary?.streak ?? 0;
  const purchasedIds = JSON.parse(localStorage.getItem('lukoClubPurchased') || '[]');

  const allMedals = [ { id: 1, name: 'مدال ریاضی', icon: Icon15, xpRequired: 200 }, { id: 2, name: 'مدال علوم', icon: Icon16, xpRequired: 300 }, { id: 3, name: 'مدال هنر', icon: Icon17, xpRequired: 400 }, { id: 4, name: 'مدال زبان', icon: Icon18, xpRequired: 500 }, { id: 5, name: 'مدال ورزش', icon: Icon11, xpRequired: 600 }, { id: 6, name: 'مدال موسیقی', icon: Icon12, xpRequired: 700 }, { id: 7, name: 'مدال برنامه‌نویسی', icon: Icon13, xpRequired: 800 }, { id: 8, name: 'مدال رهبری', icon: Icon14, xpRequired: 900 } ].map(m => ({ ...m, earned: currentXP >= m.xpRequired }));
  const shopItems = [ { id: 1, title: 'استیکر سکه', icon: Icon3, price: 50 }, { id: 2, title: 'پروفایل ویژه', icon: Icon14, price: 75 }, { id: 3, title: 'پس زمینه ویژه', icon: Icon19, price: 100 }, { id: 4, title: 'استیکر ویژه', icon: Icon20, price: 120 } ];
  const myPurchasedItems = shopItems.filter(item => purchasedIds.includes(item.id));

  // آمار واقعی از بک‌اند؛ در حالت مهمان از داده‌ی محلی HealthContext استفاده می‌شود
  const localToday = getTodayStats();
  const localWeekly = getWeeklyStats();
  const todayStats = healthStats?.today || localToday;
  const weeklyStats = healthStats?.weekly || localWeekly;
  const monthlyStats = healthStats?.monthly || [];
  const yearlyStats = healthStats?.yearly || [];
  const wellbeing = healthStats?.wellbeing || null;
  const getChartData = () => {
    if (activeStatTab === 'daily') return [{ day: 'امروز', focusScore: todayStats.focusScore || 0, hasMood: !!todayStats.hasMood }];
    if (activeStatTab === 'monthly') return monthlyStats;
    if (activeStatTab === 'yearly') return yearlyStats;
    return weeklyStats;
  };

  const colors = { primary: '#4DB6AC', primaryDark: '#00897B', bg: '#F5F7FA', cardBg: '#FFFFFF', text: '#2D3436', textSecondary: '#636E72', primaryLight: '#E0F2F1', gold: '#F9CA24' };

  const getStatusBadge = (status) => { const map = { open: { label: 'باز', color: '#FF9800', icon: HiOutlineClock }, answered: { label: 'پاسخ داده شده', color: '#4CAF50', icon: HiOutlineCheck }, closed: { label: 'بسته', color: '#9E9E9E', icon: HiOutlineX } }; const s = map[status] || map.open; const Icon = s.icon; return (<span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: `${s.color}20`, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}><Icon size={12} />{s.label}</span>); };
  const formatDate = (date) => new Date(date).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
  const navItems = [ { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' }, { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' }, { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' }, { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' }, { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' } ];

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Shoor', 'Shoor Rounded', sans-serif", direction: 'rtl', paddingBottom: '80px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 'min(600px, 100%)' }}>
        <Header title="پروفایل من" user={user} showGreeting={false} colors={colors} rightAction={<button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FF525215', border: 'none', padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 14px)', borderRadius: '12px', color: '#FF5252', fontWeight: '600', fontSize: 'clamp(11px, 3vw, 13px)', cursor: 'pointer' }}><HiOutlineLogout size={16} /> خروج</button>} />

        <div style={{ padding: '0 clamp(12px, 3vw, 16px)' }}>
          {/* Hero */}
          <div style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`, borderRadius: '28px', padding: 'clamp(20px, 5vw, 32px) clamp(16px, 4vw, 24px)', marginTop: '16px', marginBottom: '16px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: `0 15px 35px rgba(77,182,172,0.3)` }}>
            <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ width: 'clamp(80px, 25vw, 110px)', height: 'clamp(80px, 25vw, 110px)', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.4)', margin: '0 auto 16px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', overflow: 'hidden', background: '#ddd' }}>
                {user?.avatar ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <HiOutlineUser size={50} color="white" style={{ marginTop: '20px' }} />}
              </div>
              <h2 style={{ margin: 0, fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: '900', marginBottom: '8px' }}>{user?.firstName || user?.username?.replace('@', '') || 'کاربر'}</h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '8px 20px', borderRadius: '50px', fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: '700' }}><span style={{ fontSize: 16 }} aria-hidden>🪙</span> {currentXP} امتیاز</div>
            </div>
          </div>

          {/* Streak */}
          <div style={{ background: 'white', borderRadius: '20px', padding: 'clamp(14px, 3vw, 20px)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 'clamp(40px, 12vw, 50px)', height: 'clamp(40px, 12vw, 50px)', borderRadius: '14px', background: 'linear-gradient(135deg, #FF9800, #FF5722)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(255,87,34,0.3)' }}><span style={{ fontSize: 'clamp(18px, 5vw, 24px)', animation: 'pulse 2s infinite' }}>🔥</span></div>
              <div><h3 style={{ margin: 0, fontSize: 'clamp(13px, 3.5vw, 16px)', fontWeight: '800', color: colors.text }}>رکورد روزانه</h3><p style={{ margin: 0, fontSize: 'clamp(10px, 2.8vw, 13px)', color: colors.textSecondary }}>{currentStreak} روز متوالی فعالیت کردی</p></div>
            </div>
            <div style={{ fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: '900', color: '#FF5722' }}>{currentStreak}</div>
          </div>

          {/* شاخص سلامت روان (لوکو سلامت) — داده‌ی واقعی */}
          {wellbeing && (
            <div style={{ background: 'white', borderRadius: '20px', padding: 'clamp(14px, 3vw, 20px)', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin: '0 0 14px', color: colors.text }}>لوکو سلامت</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* دایره‌ی امتیاز */}
                <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                  <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="36" cy="36" r="30" fill="none" stroke="#EEF1F4" strokeWidth="8" />
                    <circle cx="36" cy="36" r="30" fill="none" stroke={wellbeing.score >= 55 ? '#4DB6AC' : wellbeing.score >= 40 ? '#F9CA24' : '#FF7043'} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(wellbeing.score / 100) * 188.4} 188.4`} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: colors.text }}>{wellbeing.score}</span>
                    <span style={{ fontSize: 9, color: colors.textSecondary }}>از ۱۰۰</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 800, color: colors.text }}>وضعیت: {wellbeing.label}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: colors.textSecondary, background: colors.primaryLight, padding: '4px 10px', borderRadius: 999 }}>😊 حال: {wellbeing.factors?.mood ?? 0}٪</span>
                    <span style={{ fontSize: 11, color: colors.textSecondary, background: colors.primaryLight, padding: '4px 10px', borderRadius: 999 }}>🫁 تنفس: {wellbeing.factors?.breathing ?? 0}٪</span>
                    <span style={{ fontSize: 11, color: colors.textSecondary, background: colors.primaryLight, padding: '4px 10px', borderRadius: 999 }}>🌱 باغ: {wellbeing.factors?.garden ?? 0}٪</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{ background: 'white', borderRadius: '20px', padding: 'clamp(14px, 3vw, 20px)', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', backgroundColor: '#F0F2F5', padding: '4px', borderRadius: '12px' }}>
              {['daily', 'weekly', 'monthly', 'yearly'].map(tab => (<button key={tab} onClick={() => setActiveStatTab(tab)} style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: '10px', fontSize: 'clamp(10px, 2.8vw, 13px)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', backgroundColor: activeStatTab === tab ? 'white' : 'transparent', color: activeStatTab === tab ? colors.primaryDark : colors.textSecondary, boxShadow: activeStatTab === tab ? '0 2px 10px rgba(0,0,0,0.08)' : 'none' }}>{tab === 'daily' ? 'روزانه' : tab === 'weekly' ? 'هفتگی' : tab === 'monthly' ? 'ماهانه' : 'سالانه'}</button>))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '4px', height: '140px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
              {getChartData().map((day, index) => (<div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}><div style={{ width: '100%', maxWidth: '20px', height: `${Math.max((day.focusScore || 10) * 1.2, 10)}px`, backgroundColor: day.hasMood ? colors.primary : '#E0E0E0', borderRadius: '6px', transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} /><span style={{ fontSize: activeStatTab === 'yearly' || activeStatTab === 'monthly' ? '7px' : '9px', color: colors.textSecondary, fontWeight: '600', whiteSpace: 'nowrap' }}>{day.day}</span></div>))}
            </div>
            {activeStatTab === 'daily' && (<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '10px' }}><div style={{ background: colors.primaryLight, borderRadius: '14px', padding: '10px', textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: '800', color: colors.primaryDark }}>{todayStats.totalBreathingTime || 0}</div><div style={{ fontSize: '10px', color: colors.textSecondary }}>ثانیه تنفس</div></div><div style={{ background: colors.primaryLight, borderRadius: '14px', padding: '10px', textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: '800', color: colors.primaryDark }}>{todayStats.totalBreaths || 0}</div><div style={{ fontSize: '10px', color: colors.textSecondary }}>نفس عمیق</div></div><div style={{ background: colors.primaryLight, borderRadius: '14px', padding: '10px', textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: '800', color: colors.primaryDark }}>{todayStats.focusScore || 0}%</div><div style={{ fontSize: '10px', color: colors.textSecondary }}>امتیاز تمرکز</div></div></div>)}
          </div>


<div style={{ marginBottom: '16px' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
    <div style={{ width: 28, height: 28, borderRadius: '8px', background: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <HiOutlineAcademicCap size={16} color="#F57F17" />
    </div>
    <h3 style={{ margin: 0, fontSize: 'clamp(13px, 3.5vw, 16px)', fontWeight: '800', color: colors.text }}>
      مدال‌های لوکو کلاب
    </h3>
  </div>
  
  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
    {allMedals.map(medal => (
      <div 
        key={medal.id} 
        style={{ 
          flex: '0 0 90px', 
          background: 'white', 
          borderRadius: '16px', 
          padding: '12px 8px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '6px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)', 
          position: 'relative', 
          opacity: medal.earned ? 1 : 0.5,
          transition: 'transform 0.2s ease'
        }}
      >
        <div style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '14px', 
          background: medal.earned ? '#FFF8E1' : '#EEEEEE', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          position: 'relative' 
        }}>
          <img 
            src={medal.icon} 
            alt={medal.name} 
            style={{ width: '35px', height: '35px', objectFit: 'contain' }} 
          />
          {!medal.earned && (
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'rgba(255,255,255,0.6)', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <HiOutlineLockClosed size={20} color="#999" />
            </div>
          )}
        </div>
        
        <span style={{ 
          fontSize: '9px', 
          fontWeight: '700', 
          color: medal.earned ? colors.text : colors.textSecondary, 
          textAlign: 'center',
          lineHeight: '1.2'
        }}>
          {medal.name}
        </span>

        {/* نشان دادن امتیاز لازم برای باز شدن مدال */}
        {!medal.earned && (
          <span style={{ 
            fontSize: '8px', 
            color: '#F57F17', 
            fontWeight: '700', 
            textAlign: 'center',
            background: '#FFF8E1',
            padding: '2px 6px',
            borderRadius: '8px',
            marginTop: '2px'
          }}>
            🔒 {medal.xpRequired} XP
          </span>
        )}
        
        {medal.earned && (
          <span style={{ 
            fontSize: '8px', 
            color: '#4CAF50', 
            fontWeight: '600', 
            textAlign: 'center'
          }}>
            ✅ کسب شده
          </span>
        )}
      </div>
    ))}
  </div>
</div>

          {/* Tickets */}
          <div style={{ background: 'white', borderRadius: '20px', padding: 'clamp(14px, 3vw, 20px)', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HiOutlineTicket size={18} color={colors.primary} /><h3 style={{ margin: 0, fontSize: 'clamp(13px, 3.5vw, 16px)', fontWeight: '800', color: colors.text }}>تیکت‌های پشتیبانی</h3></div><button onClick={() => setShowTicketModal(true)} style={{ background: colors.primary, border: 'none', borderRadius: '10px', padding: '6px 12px', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}><HiOutlinePlus size={12} /> تیکت جدید</button></div>
            {ticketsLoading ? (<p style={{ textAlign: 'center', color: colors.textSecondary, padding: '20px' }}>در حال بارگذاری...</p>) : !tickets.length ? (<p style={{ textAlign: 'center', color: colors.textSecondary, padding: '20px' }}>هنوز تیکتی ثبت نشده</p>) : (<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{tickets.slice(0, 3).map(ticket => (<div key={ticket.id} onClick={() => { setSelectedTicket(ticket); setShowReplyModal(true); }} style={{ padding: '12px', borderRadius: '14px', border: '1px solid #f0f0f0', cursor: 'pointer' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}><span style={{ fontSize: '13px', fontWeight: '700', color: colors.text }}>{ticket.subject}</span>{getStatusBadge(ticket.status)}</div><p style={{ margin: 0, fontSize: '11px', color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.message}</p></div>))}</div>)}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTicketModal && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowTicketModal(false)}><div style={{ background: 'white', borderRadius: '20px', padding: '20px', width: '100%', maxWidth: '400px' }} onClick={e => e.stopPropagation()}><h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800' }}>ارسال تیکت جدید</h3><input type="text" placeholder="موضوع" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #eee', borderRadius: '12px', marginBottom: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} /><textarea placeholder="متن پیام..." value={ticketMessage} onChange={e => setTicketMessage(e.target.value)} rows={4} style={{ width: '100%', padding: '12px', border: '1px solid #eee', borderRadius: '12px', marginBottom: '10px', fontSize: '14px', resize: 'none', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} /><div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setShowTicketModal(false)} style={{ flex: 1, padding: '12px', background: '#f5f5f5', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>انصراف</button><button onClick={handleSubmitTicket} disabled={updating} style={{ flex: 1, padding: '12px', background: colors.primary, border: 'none', borderRadius: '12px', color: 'white', fontWeight: '700', cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.6 : 1 }}>ارسال</button></div></div></div>)}
      {showReplyModal && selectedTicket && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => { setShowReplyModal(false); setSelectedTicket(null); }}><div style={{ background: 'white', borderRadius: '20px', padding: '20px', width: '100%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{selectedTicket.subject}</h3><span onClick={() => setShowReplyModal(false)} style={{ cursor: 'pointer', fontSize: '16px', color: '#999' }}>✕</span></div><div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}><p style={{ margin: 0, fontSize: '12px', color: '#333', lineHeight: 1.6 }}>{selectedTicket.message}</p><span style={{ fontSize: '10px', color: '#999', marginTop: '6px', display: 'block' }}>{formatDate(selectedTicket.createdAt)}</span></div><textarea placeholder="پاسخ شما..." value={replyMessage} onChange={e => setReplyMessage(e.target.value)} rows={3} style={{ width: '100%', padding: '12px', border: '1px solid #eee', borderRadius: '12px', fontSize: '14px', resize: 'none', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', marginBottom: '10px' }} /><button onClick={handleReply} disabled={updating} style={{ width: '100%', padding: '12px', background: colors.primary, border: 'none', borderRadius: '12px', color: 'white', fontWeight: '700', cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.6 : 1 }}>ارسال پاسخ</button></div></div>)}

      {/* App Shell Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 'min(600px, 100%)', background: colors.cardBg, boxShadow: '0 -2px 20px rgba(0,0,0,0.08)', borderRadius: '24px 24px 0 0', padding: 'clamp(8px, 2vw, 12px) 0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100 }}>
        {navItems.map(item => { const Icon = item.icon; const isActive = item.id === 'پروفایل'; return (<div key={item.id} onClick={() => navigate(item.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer', transition: 'transform 0.05s linear' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}><Icon size={20} color={isActive ? colors.primary : '#999'} /><span style={{ fontSize: 'clamp(8px, 2.5vw, 10px)', color: isActive ? colors.primary : '#999', fontWeight: isActive ? '600' : '400' }}>{item.name}</span>{isActive && <div style={{ width: '4px', height: '4px', borderRadius: '2px', background: colors.primary, marginTop: '1px' }} />}</div>); })}
      </div>

      <style>{` @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } } ::-webkit-scrollbar { width: 0; height: 0; } * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; } input, textarea { font-family: inherit; user-select: text; } `}</style>
    </div>
  );
};
export default Profile;
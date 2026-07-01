// Home.jsx — بازطراحی پریمیوم (فقط این صفحه؛ سایر کامپوننت‌ها و استایل سراسری بدون تغییر)
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useHealth } from '../contexts/HealthContext';
import {
  HiOutlineHome, HiOutlineUser, HiOutlineFire, HiOutlinePlay, HiOutlineHeart,
  HiOutlineBell, HiOutlineChevronLeft, HiOutlineSparkles, HiOutlineLightningBolt,
} from 'react-icons/hi';

import NavigationBar from '../components/common/NavigationBar';
import Header from '../components/common/Header';
import MoodModal from '../components/home/MoodModal';
import PodcastChar from '../icons/icon54.png';

import BookIcon from '../icons/icon7.png';
import Icon11 from '../icons/icon11.png';
import Icon21 from '../icons/icon21.png';
import Icon22 from '../icons/icon22.png';
import Icon1 from '../icons/icon1.png';
import Icon4 from '../icons/icon4.png';
import Icon5 from '../icons/icon5.png';
import Icon15 from '../icons/icon15.png';
import Icon16 from '../icons/icon16.png';
import Icon17 from '../icons/icon17.png';
import Icon18 from '../icons/icon18.png';
import BookCover1 from '../icons/icon30.png';
import BookCover2 from '../icons/icon31.png';
import BookCover3 from '../icons/icon32.png';
import BookCover4 from '../icons/icon33.png';
import BookCover5 from '../icons/icon34.png';
import BookCover6 from '../icons/icon35.png';
import TvBanner1 from '../icons/icon36.png';
import TvBanner2 from '../icons/icon37.png';
import TvBanner3 from '../icons/icon38.png';
import TvBanner4 from '../icons/icon39.png';
import TvBanner5 from '../icons/icon40.png';

import { getTodayMissions } from '../data/dailyMissionsData';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { showMoodReminder, showSuggestion, recordMood, dismissReminder, dismissSuggestion } = useHealth();
  const isMobile = true;

  const [userXP, setUserXP] = useState(() => parseInt(localStorage.getItem('luko_user_xp'), 10) || 0);
  const [activeNav, setActiveNav] = useState('خانه');
  const [pressedItem, setPressedItem] = useState(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifSeen, setNotifSeen] = useState(() => localStorage.getItem('luko_notifs_seen') || '');
  const [completedTasks] = useState(() => JSON.parse(localStorage.getItem('luko_completed_tasks')) || []);

  const streak = parseInt(localStorage.getItem('luko_current_day'), 10) || 0;

  const colors = {
    primary: '#4DB6AC', primaryLight: '#E0F2F1', primaryDark: '#2E9E93',
    purple: '#BA68C8', purpleLight: '#F3E5F5', amber: '#F6B100',
    bg: '#EEF4F3', cardBg: '#FFFFFF', text: '#37474F', textSoft: '#78909C',
    navBg: '#FFFFFF',
  };

  useEffect(() => { localStorage.setItem('luko_user_xp', String(userXP)); }, [userXP]);
  useEffect(() => { setShowMoodModal(showMoodReminder); }, [showMoodReminder]);

  const lukoVideos = useMemo(() => ([
    { id: 1, title: 'لوکو ریاضی', image: TvBanner1 },
    { id: 2, title: 'لوکو علوم', image: TvBanner2 },
    { id: 3, title: 'لوکو فارسی', image: TvBanner3 },
    { id: 4, title: 'لوکو هنر', image: TvBanner4 },
    { id: 5, title: 'لوکو زبان', image: TvBanner5 },
  ]), []);

  const todayMissions = useMemo(
    () => getTodayMissions().missions.filter((m) => m.type === 'video'),
    []
  );
  const missionsDone = completedTasks.length;
  const missionsTotal = todayMissions.length || 0;
  const missionPercent = missionsTotal > 0 ? Math.round((missionsDone / missionsTotal) * 100) : 0;

  const moodOptions = [
    { id: 'good', icon: Icon1, label: 'خوب' },
    { id: 'bad', icon: Icon4, label: 'بد' },
    { id: 'normal', icon: Icon5, label: 'عادی' },
  ];

  const achievements = [
    { id: 1, title: 'مدال ریاضی', icon: Icon15, earned: true },
    { id: 2, title: 'مدال علوم', icon: Icon16, earned: true },
    { id: 3, title: 'مدال هنر', icon: Icon17, earned: false },
    { id: 4, title: 'مدال زبان', icon: Icon18, earned: false },
  ];

  const books = [BookCover1, BookCover2, BookCover3, BookCover4, BookCover5, BookCover6];

  const quickActions = [
    { id: 'books', name: 'کتاب‌های من', desc: 'یادگیری با بازی', icon: BookIcon, path: '/books', from: '#EDE1F7', to: '#F7EFFC', ring: colors.purple },
    { id: 'club', name: 'لوکو کلاب', desc: 'مأموریت روزانه', icon: Icon11, path: '/luko-club', from: '#DCF1EE', to: '#EBF8F6', ring: colors.primary },
    { id: 'tv', name: 'لوکو تلویزیون', desc: 'ویدیوهای آموزشی', icon: Icon22, path: '/entertainment', from: '#DDEFFB', to: '#EEF7FD', ring: '#42A5F5' },
    { id: 'health', name: 'لوکو سلامت', desc: 'حال و آرامش', icon: Icon21, path: '/luko-health', from: '#FBE7EC', to: '#FDF1F4', ring: '#EC6E8A' },
  ];

  const navItems = [
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' },
  ];

  const handleMoodSelect = (mood) => { recordMood(mood.id); setShowMoodModal(false); setTimeout(() => navigate('/luko-health'), 300); };
  const handleSuggestion = () => { dismissSuggestion(); navigate('/luko-health'); };
  const go = (path, id) => { setPressedItem(id); setTimeout(() => { setPressedItem(null); navigate(path); }, 110); };

  // props دسترس‌پذیر برای عناصر تعاملی
  const pressable = (path, id, label) => ({
    role: 'button',
    tabIndex: 0,
    'aria-label': label,
    onClick: () => go(path, id),
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(path, id); } },
    style: { cursor: 'pointer', outline: 'none' },
  });

  const scale = (id) => (pressedItem === id ? 'scale(0.97)' : 'scale(1)');

  const sectionHead = (title, path, id) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 2px 12px' }}>
      <h2 style={{ color: colors.text, margin: 0 }}>{title}</h2>
      <button
        {...pressable(path, id, `مشاهده همه ${title}`)}
        style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'transparent', border: 'none', color: colors.primary, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        مشاهده همه <HiOutlineChevronLeft size={14} />
      </button>
    </div>
  );

  const displayName = user?.firstName || user?.username?.replace('@', '') || 'دوست من';

  // ===== اعلان‌ها =====
  const missionsRemaining = useMemo(() => {
    const total = getTodayMissions().missions.filter((m) => m.type === 'video').length;
    return Math.max(total - completedTasks.length, 0);
  }, [completedTasks]);

  const notifications = useMemo(() => {
    const list = [];
    if (missionsRemaining > 0) {
      list.push({ id: 'missions', icon: '🎯', color: '#FB8C00', title: 'مأموریت‌های امروزت', msg: `${missionsRemaining} مأموریت باقی مونده — انجامشون بده و سکه بگیر!`, path: '/luko-club' });
    }
    if (showMoodReminder) {
      list.push({ id: 'mood', icon: '😊', color: '#4DB6AC', title: 'حالت چطوره؟', msg: 'وقتشه حال امروزت رو ثبت کنی.', path: '/luko-health' });
    }
    if (showSuggestion) {
      list.push({ id: 'breath', icon: '🌬️', color: '#42A5F5', title: 'یه نفس عمیق بکش', msg: 'بیا با هم یه تمرین تنفس آرام انجام بدیم.', path: '/luko-health' });
    }
    list.push({ id: 'podcast', icon: '🎧', color: '#7E57C2', title: 'پادکست جدید اومده', msg: 'یه قسمت تازه برات آماده‌ست — گوش بده!', path: '/luko-podcast' });
    list.push({ id: 'tv', icon: '📺', color: '#EC6E8A', title: 'ویدیوهای تازه', msg: 'ویدیوهای جدید در لوکو تلویزیون منتظرتن.', path: '/entertainment' });
    return list;
  }, [missionsRemaining, showMoodReminder, showSuggestion]);

  const notifSignature = `${new Date().toDateString()}|${notifications.length}|${missionsRemaining}|${showMoodReminder ? 1 : 0}|${showSuggestion ? 1 : 0}`;
  const hasUnread = notifications.length > 0 && notifSeen !== notifSignature;

  const openNotifications = () => {
    setShowNotifications(true);
    setNotifSeen(notifSignature);
    localStorage.setItem('luko_notifs_seen', notifSignature);
  };
  const handleNotifClick = (path) => { setShowNotifications(false); navigate(path); };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Shoor', 'Shoor Rounded', sans-serif", direction: 'rtl', paddingBottom: '90px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 'min(600px, 100%)' }}>
        <Header
          user={user}
          showGreeting
          onProfileClick={() => navigate('/profile')}
          rightAction={
            <div
              role="button" tabIndex={0} aria-label={`اعلان‌ها${hasUnread ? ' (خوانده‌نشده)' : ''}`}
              onClick={openNotifications}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNotifications(); } }}
              style={{ width: 52, height: 52, borderRadius: 18, background: 'linear-gradient(180deg,#FFFFFF 0%,#F8FAFF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 10px 20px rgba(0,0,0,0.06)', cursor: 'pointer', outline: 'none' }}
            >
              <HiOutlineBell size={26} color="#202540" />
              {hasUnread && (
                <span style={{ position: 'absolute', top: 11, right: 12, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999, background: '#FF5252', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 800, lineHeight: 1 }}>
                  {notifications.length}
                </span>
              )}
            </div>
          }
        />

        <div style={{ padding: '4px clamp(12px, 3vw, 16px) 20px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* ===== HERO ===== */}
          <section
            className="loko-anim"
            style={{
              position: 'relative', overflow: 'hidden', borderRadius: 28,
              background: 'linear-gradient(135deg, #4DB6AC 0%, #3AA79C 55%, #2E9E93 100%)',
              padding: '20px 20px 22px', color: '#fff',
              boxShadow: '0 18px 40px rgba(46,158,147,0.30)',
            }}
          >
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', top: -70, left: -50 }} />
            <div style={{ position: 'absolute', width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', bottom: -50, right: -30 }} />

            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.18)', padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, backdropFilter: 'blur(6px)' }}>
                  <HiOutlineSparkles size={14} /> آماده‌ی یادگیری؟
                </span>
                <h1 style={{ margin: '12px 0 4px', color: '#fff', lineHeight: 1.35 }}>سلام {displayName} 👋</h1>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                  امروز هم یه قدم به قهرمان‌شدن نزدیک‌تر شو!
                </p>
              </div>
              <img src={Icon11} alt="" aria-hidden className="loko-float" style={{ width: 84, height: 84, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 10px 16px rgba(0,0,0,0.18))' }} />
            </div>

            {/* آمار سریع */}
            <div style={{ position: 'relative', display: 'flex', gap: 10, marginTop: 16 }}>
              {[
                { icon: <HiOutlineLightningBolt size={16} />, val: userXP, label: 'امتیاز' },
                { icon: <HiOutlineFire size={16} />, val: streak, label: 'روز فعال' },
                { icon: '🎯', val: `${missionsDone}/${missionsTotal || '۰'}`, label: 'مأموریت' },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.16)', borderRadius: 16, padding: '10px 8px', textAlign: 'center', backdropFilter: 'blur(6px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 17, fontWeight: 800 }}>
                    {typeof s.icon === 'string' ? <span>{s.icon}</span> : s.icon}{s.val}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA اصلی */}
            <button
              {...pressable('/books', 'hero_cta', 'ادامه یادگیری')}
              style={{ marginTop: 16, width: '100%', border: 'none', borderRadius: 16, padding: '13px', background: '#fff', color: colors.primaryDark, fontWeight: 800, fontSize: 15, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 8px 18px rgba(0,0,0,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transform: scale('hero_cta'), transition: 'transform .12s ease' }}
            >
              ▶ ادامه‌ی یادگیری
            </button>
          </section>

          {/* ===== QUICK ACTIONS ===== */}
          <section>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {quickActions.map((a, i) => (
                <div
                  key={a.id}
                  {...pressable(a.path, `qa_${a.id}`, a.name)}
                  className="loko-anim"
                  style={{
                    background: `linear-gradient(145deg, ${a.from} 0%, ${a.to} 100%)`,
                    borderRadius: 22, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.6)',
                    transform: scale(`qa_${a.id}`), transition: 'transform .12s ease',
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 15, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 14px ${a.ring}33` }}>
                    <img src={a.icon} alt="" aria-hidden style={{ width: 30, height: 30, objectFit: 'contain' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: colors.text }}>{a.name}</h3>
                    <p style={{ margin: '2px 0 0', fontSize: 11.5, color: colors.textSoft, fontWeight: 600 }}>{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== DAILY MISSION PREVIEW ===== */}
          <section
            {...pressable('/luko-club', 'mission_card', 'مأموریت‌های امروز لوکو کلاب')}
            className="loko-anim"
            style={{ background: colors.cardBg, borderRadius: 22, padding: '16px 18px', boxShadow: '0 8px 22px rgba(0,0,0,0.05)', transform: scale('mission_card'), transition: 'transform .12s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#FFB74D,#FB8C00)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 16px rgba(251,140,0,0.28)' }}>
                <HiOutlineFire size={26} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, color: colors.text }}>مأموریت‌های امروز</h3>
                  <span style={{ fontSize: 12, fontWeight: 800, color: colors.primary }}>{missionsDone} از {missionsTotal || 0}</span>
                </div>
                <div style={{ marginTop: 8, height: 9, borderRadius: 999, background: '#EEF2F1', overflow: 'hidden' }}>
                  <div style={{ width: `${missionPercent}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#4DB6AC,#80CBC4)', transition: 'width .5s ease' }} />
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 11.5, color: colors.textSoft, fontWeight: 600 }}>
                  {missionPercent === 100 ? '🎉 عالی! همه‌ی مأموریت‌های امروز انجام شد.' : 'مأموریت‌ها رو کامل کن و سکه بگیر!'}
                </p>
              </div>
            </div>
          </section>

          {/* ===== LOKO TV ===== */}
          <section>
            {sectionHead('لوکو تلویزیون', '/entertainment', 'tv_all')}
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, margin: '0 -2px' }}>
              {lukoVideos.map((v) => (
                <div
                  key={v.id}
                  {...pressable('/entertainment', `tv_${v.id}`, v.title)}
                  style={{ flexShrink: 0, width: 140, transform: scale(`tv_${v.id}`), transition: 'transform .12s ease' }}
                >
                  <div style={{ position: 'relative', width: 140, height: 96, borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 18px rgba(0,0,0,0.10)' }}>
                    <img src={v.image} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.45) 100%)' }} />
                    <div style={{ position: 'absolute', top: 8, left: 8, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HiOutlinePlay size={16} color={colors.primary} style={{ marginRight: -2 }} />
                    </div>
                  </div>
                  <p style={{ margin: '8px 2px 0', fontSize: 12.5, fontWeight: 700, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ===== LOKO PODCAST (بازطراحی‌شده — هماهنگ با تم جدید) ===== */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 2px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: 12, background: 'linear-gradient(135deg,#8E6BE0,#6A48B0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 14px rgba(106,72,176,0.3)' }}>
                  <span style={{ fontSize: 16 }} aria-hidden>🎧</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ color: colors.text, margin: 0 }}>لوکو پادکست</h2>
                  <p style={{ margin: '1px 0 0', fontSize: 11.5, color: colors.textSoft, fontWeight: 600 }}>گوش بده و چیزهای جدید یاد بگیر!</p>
                </div>
              </div>
              <button
                {...pressable('/luko-podcast', 'pod_all', 'مشاهده همه پادکست‌ها')}
                style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'transparent', border: 'none', color: '#7E57C2', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
              >
                مشاهده همه <HiOutlineChevronLeft size={14} />
              </button>
            </div>

            <div
              {...pressable('/luko-podcast', 'podcast_card', 'پخش پادکست جدید لوکو')}
              className="loko-anim"
              style={{
                position: 'relative', overflow: 'hidden', borderRadius: 24,
                background: 'linear-gradient(135deg, #8E6BE0 0%, #7B57E8 50%, #6A48B0 100%)',
                minHeight: 132, padding: '16px 18px', color: '#fff',
                boxShadow: '0 16px 34px rgba(106,72,176,0.30)',
                transform: scale('podcast_card'), transition: 'transform .12s ease',
              }}
            >
              <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', top: -80, right: -40 }} />
              <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', bottom: -50, left: 30 }} />

              {/* کاراکتر */}
              <img
                src={PodcastChar} alt="" aria-hidden className="loko-float"
                style={{ position: 'absolute', bottom: -6, left: 6, width: 118, objectFit: 'contain', zIndex: 2, pointerEvents: 'none', filter: 'drop-shadow(0 12px 20px rgba(50,20,100,0.28))' }}
              />

              {/* محتوا */}
              <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.20)', padding: '5px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, backdropFilter: 'blur(6px)' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', boxShadow: '0 0 8px #fff' }} /> پادکست جدید
                </span>
                <h3 style={{ margin: '12px 0 4px', color: '#fff', maxWidth: '68%' }}>قسمت ۷: جنگل اسرارآمیز</h3>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.88)' }}>🕒 ۲۱:۴۵ دقیقه</p>
              </div>

              {/* دکمه پخش */}
              <div style={{ position: 'absolute', bottom: 16, right: 18, zIndex: 4, width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(180deg,#FFFFFF,#F5EEFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(60,30,120,0.28)' }}>
                <div style={{ width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderRight: '15px solid #7B57E8', marginRight: 4 }} />
              </div>
            </div>
          </section>

          {/* ===== BOOKS ===== */}
          <section>
            {sectionHead('کتاب‌های من', '/books', 'books_all')}
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, margin: '0 -2px' }}>
              {books.map((cover, i) => (
                <div
                  key={i}
                  {...pressable('/books', `book_${i}`, `کتاب ${i + 1}`)}
                  style={{ flexShrink: 0, width: 104, transform: scale(`book_${i}`), transition: 'transform .12s ease' }}
                >
                  <div style={{ width: 104, height: 140, borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 18px rgba(0,0,0,0.12)', background: '#fff' }}>
                    <img src={cover} alt={`کتاب ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== ACHIEVEMENTS ===== */}
          <section>
            {sectionHead('دستاوردهای من', '/luko-club', 'ach_all')}
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, margin: '0 -2px' }}>
              {achievements.map((a) => (
                <div key={a.id} style={{ flexShrink: 0, width: 96, background: colors.cardBg, borderRadius: 18, padding: '14px 10px', textAlign: 'center', boxShadow: '0 6px 16px rgba(0,0,0,0.05)', opacity: a.earned ? 1 : 0.55 }}>
                  <div style={{ position: 'relative', width: 56, height: 56, margin: '0 auto', borderRadius: '50%', background: a.earned ? 'linear-gradient(135deg,#FFF3D6,#FFE0A3)' : '#EEF1F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={a.icon} alt="" aria-hidden style={{ width: 34, height: 34, objectFit: 'contain', filter: a.earned ? 'none' : 'grayscale(1)' }} />
                    {!a.earned && <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 13 }}>🔒</span>}
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 11, fontWeight: 700, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* ===== پنل اعلان‌ها ===== */}
      {showNotifications && (
        <>
          <div
            onClick={() => setShowNotifications(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.28)', animation: 'notifFade .2s ease' }}
          />
          <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 'min(600px, 100%)', padding: '0 clamp(12px, 3vw, 16px)', zIndex: 201, direction: 'rtl' }}>
            <div style={{ background: '#fff', borderRadius: 22, boxShadow: '0 22px 48px rgba(0,0,0,0.22)', overflow: 'hidden', animation: 'notifDown .28s ease' }}>
              {/* هدر پنل */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid #F0F2F1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HiOutlineBell size={20} color={colors.primaryDark} />
                  <h2 style={{ margin: 0, color: colors.text }}>اعلان‌ها</h2>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  aria-label="بستن"
                  style={{ background: '#F5F7F7', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.textSoft }}
                >
                  <HiOutlineChevronLeft size={18} style={{ transform: 'rotate(-90deg)' }} />
                </button>
              </div>

              {/* لیست اعلان‌ها */}
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: colors.textSoft }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>🔔</div>
                    <p style={{ fontSize: 13, margin: 0 }}>فعلاً اعلان جدیدی نداری.</p>
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div
                      key={n.id}
                      role="button" tabIndex={0}
                      aria-label={n.title}
                      onClick={() => handleNotifClick(n.path)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNotifClick(n.path); } }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', cursor: 'pointer', borderTop: i === 0 ? 'none' : '1px solid #F5F7F7', outline: 'none', transition: 'background .15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F7FAFA'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ width: 42, height: 42, borderRadius: 14, background: `${n.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
                        <span aria-hidden>{n.icon}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: colors.text }}>{n.title}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: colors.textSoft, fontWeight: 600, lineHeight: 1.5 }}>{n.msg}</p>
                      </div>
                      <HiOutlineChevronLeft size={18} color="#C5CFCD" style={{ flexShrink: 0 }} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <MoodModal isOpen={showMoodModal} moodOptions={moodOptions} onSelectMood={handleMoodSelect} onDismiss={dismissReminder} />

      {showSuggestion && !showMoodModal && (
        <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 'min(600px, 100%)', padding: '0 16px', zIndex: 99 }}>
          <div style={{ backgroundColor: colors.primary, borderRadius: '20px', padding: 'clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 20px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'homeSlideUp 0.3s ease', boxShadow: '0 8px 24px rgba(46,158,147,0.35)' }}>
            <div>
              <p style={{ fontSize: 'clamp(11px, 3vw, 13px)', fontWeight: '700', color: 'white', marginBottom: '2px' }}>🌬️ وقت یه نفس عمیقه!</p>
              <p style={{ fontSize: 'clamp(9px, 2.5vw, 11px)', color: 'rgba(255,255,255,0.9)' }}>بیا با هم یه نفس عمیق بکشیم</p>
            </div>
            <button onClick={handleSuggestion} style={{ backgroundColor: 'white', border: 'none', borderRadius: '30px', padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 18px)', fontSize: 'clamp(10px, 2.8vw, 12px)', fontWeight: '700', color: colors.primary, cursor: 'pointer', fontFamily: 'inherit' }}>بریم</button>
          </div>
        </div>
      )}

      <NavigationBar navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} isMobile={isMobile} colors={colors} onNavigate={navigate} setPressedItem={setPressedItem} pressedItem={pressedItem} />

      <style>{`
        @keyframes homeSlideUp { from { transform: translate(-50%, 100px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes homeFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes homeFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes notifFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes notifDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
        .loko-anim { animation: homeFadeUp .45s ease both; }
        .loko-float { animation: homeFloat 3.4s ease-in-out infinite; }
        ::-webkit-scrollbar { display: none; }
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        div { user-select: none; }
        input { user-select: text; }
      `}</style>
    </div>
  );
};

export default Home;

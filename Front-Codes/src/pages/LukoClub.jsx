// src/pages/LukoClub.jsx — بازطراحی هماهنگ با صفحه اصلی (تم سبزآبی پریمیوم)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import {
  HiOutlineHome, HiOutlineUser, HiOutlineFire, HiOutlinePlay, HiOutlineHeart,
  HiOutlineSparkles,
} from 'react-icons/hi';

import Header from '../components/common/Header';
import NavigationBar from '../components/common/NavigationBar';
import DayCard from '../components/luko-club/DayCard';
import DailyMissions from '../components/luko-club/DailyMissions';
import WeekStreak from '../components/luko-club/WeekStreak';
import MedalsSection from '../components/luko-club/MedalsSection';
import ShopSection from '../components/luko-club/ShopSection';
import VideoModal from '../components/luko-club/VideoModal';

import Icon11 from '../icons/icon11.png'; import Icon12 from '../icons/icon12.png';
import Icon13 from '../icons/icon13.png'; import Icon14 from '../icons/icon14.png';
import Icon19 from '../icons/icon19.png'; import Icon20 from '../icons/icon20.png';
import Icon15 from '../icons/icon15.png'; import Icon16 from '../icons/icon16.png';
import Icon17 from '../icons/icon17.png'; import Icon18 from '../icons/icon18.png';
import Icon3 from '../icons/icon3.png';

import VideoCapitan from '../video/capitan.mp4';
import VideoShabihsaz from '../video/shabihsaz.mp4';
import VideoVadeakhar from '../video/vadeakhar.mp4';

import { getTodayMissions } from '../data/dailyMissionsData';
import { clubService } from '../services/task.service';
import { getGuestCoins, addGuestCoins } from '../data/guestData';

const LukoClub = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const isMobile = true;

  const [coins, setCoins] = useState(0);
  const [backendRewards, setBackendRewards] = useState(null);
  const [backendBadges, setBackendBadges] = useState(null);
  const [backendStreak, setBackendStreak] = useState(null);

  const refreshClub = useCallback(async () => {
    if (user?.isGuest) { setCoins(getGuestCoins()); return; }
    try {
      const [summaryRes, rewardsRes, badgesRes, streakRes] = await Promise.allSettled([
        clubService.getSummary(), clubService.getRewards(), clubService.getBadges(), clubService.getStreak(),
      ]);
      if (summaryRes.status === 'fulfilled' && summaryRes.value?.success) setCoins(summaryRes.value.data?.coins ?? 0);
      if (rewardsRes.status === 'fulfilled' && rewardsRes.value?.success) setBackendRewards(rewardsRes.value.data || []);
      if (badgesRes.status === 'fulfilled' && badgesRes.value?.success) setBackendBadges(badgesRes.value.data || []);
      if (streakRes.status === 'fulfilled' && streakRes.value?.success) setBackendStreak(streakRes.value.data || null);
    } catch (e) {}
  }, [user]);

  useEffect(() => { refreshClub(); }, [refreshClub]);

  const [streakWeekDays, setStreakWeekDays] = useState(null);
  useEffect(() => {
    if (!backendStreak?.week) { setStreakWeekDays(null); return; }
    const persianDays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
    const todayStr = new Date().toISOString().split('T')[0];
    setStreakWeekDays(backendStreak.week.map((d, i) => ({ id: i + 1, name: persianDays[new Date(d.date).getDay()], status: d.date === todayStr ? 'today' : (d.done ? 'passed' : 'future'), isToday: d.date === todayStr, isPassed: d.done })));
  }, [backendStreak]);

  const userXP = coins;

  const purchaseItem = useCallback(async (rewardId, price = 0) => {
    if (user?.isGuest) { const current = getGuestCoins(); if (price > current) return false; const balance = addGuestCoins(-price); setCoins(balance); return true; }
    try { const res = await clubService.redeemReward(rewardId); if (res?.success) { setCoins(res.data?.coinBalance ?? coins); return true; } return false; } catch (e) { return false; }
  }, [coins, user]);

  const [activeNav, setActiveNav] = useState('لوکو کلاب');
  const [pressedItem, setPressedItem] = useState(null);
  const [todayMissionsList, setTodayMissionsList] = useState([]);
  const [mainMissionData, setMainMissionData] = useState(null);
  const [weekDays, setWeekDays] = useState([]);
  const [localCompletedTasks, setLocalCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('luko_completed_tasks')) || []);
  const [localMissionCompleted, setLocalMissionCompleted] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [videoModal, setVideoModal] = useState({ isOpen: false, src: '', title: '', xp: 0, missionId: null });

  // پالت سبزآبی هماهنگ با صفحه اصلی + همه‌ی کلیدهای موردنیاز کامپوننت‌ها (بدون تغییر آن‌ها)
  const colors = {
    primary: '#4DB6AC', primaryDark: '#2E9E93', primaryLight: '#E0F2F1',
    bg: '#EEF4F3', cardBg: '#FFFFFF', navBg: '#FFFFFF',
    text: '#37474F', textSecondary: '#78909C',
    iconBg: '#E0F2F1', xpBg: '#FFF3D6',
    streakBg: '#E0F2F1', streakBorder: '#4DB6AC', streakPassed: '#FB8C00',
    streakTodayBg: '#FFFFFF', streakOtherBg: 'transparent',
    medalUnlockedBg: '#FFF3D6', medalLockedBg: '#EEF1F3',
    coin: '#F6B100',
  };

  useEffect(() => { const savedDay = localStorage.getItem('luko_current_day'); if (savedDay) setCurrentDay(parseInt(savedDay, 10)); }, []);
  useEffect(() => { localStorage.setItem('luko_current_day', currentDay); }, [currentDay]);

  const checkHasWatchedVideoToday = (title) => { const today = new Date().toDateString(); const watchData = JSON.parse(localStorage.getItem('luko_watched_videos') || '{}'); return watchData[title] === today; };

  useEffect(() => {
    const todayData = getTodayMissions();
    const missionsWithIcons = todayData.missions.map(mission => {
      let iconSrc; switch(mission.icon) { case 'Icon11': iconSrc = Icon11; break; case 'Icon12': iconSrc = Icon12; break; case 'Icon13': iconSrc = Icon13; break; case 'Icon14': iconSrc = Icon14; break; case 'Icon15': iconSrc = Icon15; break; case 'Icon16': iconSrc = Icon16; break; case 'Icon17': iconSrc = Icon17; break; case 'Icon18': iconSrc = Icon18; break; case 'Icon19': iconSrc = Icon19; break; case 'Icon20': iconSrc = Icon20; break; default: iconSrc = Icon12; }
      let videoSrc = null; if (mission.videoTitle) { switch(mission.videoTitle) { case 'کاپیتان': videoSrc = VideoCapitan; break; case 'شبیه ساز': videoSrc = VideoShabihsaz; break; case 'واده آخر': videoSrc = VideoVadeakhar; break; default: videoSrc = VideoCapitan; } }
      return { ...mission, iconSrc, videoSrc };
    });
    const videoOnlyMissions = missionsWithIcons.filter(m => m.type === 'video');
    setTodayMissionsList(videoOnlyMissions);
    setMainMissionData(todayData.mainMission);
    if (localCompletedTasks.length === videoOnlyMissions.length && videoOnlyMissions.length > 0) setLocalMissionCompleted(true);

    const persianDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
    const today = new Date(); const jsDay = today.getDay(); let persianTodayIndex; if (jsDay === 6) persianTodayIndex = 0; else if (jsDay === 0) persianTodayIndex = 1; else if (jsDay === 1) persianTodayIndex = 2; else if (jsDay === 2) persianTodayIndex = 3; else if (jsDay === 3) persianTodayIndex = 4; else if (jsDay === 4) persianTodayIndex = 5; else persianTodayIndex = 6;
    // فقط امروز و آن هم در صورت تکمیل تسک‌ها آتش می‌گیرد؛ روزهای گذشته بدون فعالیت واقعی خالی‌اند
    const todayDone = videoOnlyMissions.length > 0 && localCompletedTasks.length >= videoOnlyMissions.length;
    setWeekDays(persianDays.map((name, index) => {
      const isToday = index === persianTodayIndex;
      const done = isToday ? todayDone : false;
      return { id: index + 1, name, done, isToday, isPassed: done, status: done ? 'passed' : (isToday ? 'today' : 'future') };
    }));
  }, [localCompletedTasks]);

  const currentDayName = currentDay === 1 ? 'روز اول' : currentDay === 2 ? 'روز دوم' : currentDay === 3 ? 'روز سوم' : currentDay === 4 ? 'روز چهارم' : currentDay === 5 ? 'روز پنجم' : currentDay === 6 ? 'روز ششم' : currentDay === 7 ? 'روز هفتم' : `روز ${currentDay}`;
  const tasksCompletedCount = localCompletedTasks.length; const totalTasksCount = todayMissionsList.length; const progressPercent = totalTasksCount > 0 ? (tasksCompletedCount / totalTasksCount) * 100 : 0;

  const REWARD_ICONS = [Icon3, Icon14, Icon19, Icon20];
  const fallbackRewards = [ { id: 1, title: 'استیکر سکه', icon: Icon3, price: 50, description: 'استیکر مخصوص پروفایل' }, { id: 2, title: 'پروفایل ویژه', icon: Icon14, price: 75, description: 'قاب پروفایل اختصاصی' }, { id: 3, title: 'پس زمینه ویژه', icon: Icon19, price: 100, description: 'تم اختصاصی برنامه' }, { id: 4, title: 'استیکر ویژه', icon: Icon20, price: 120, description: 'استیکر لوکو' } ];
  const rewards = backendRewards ? backendRewards.map((r, i) => ({ id: r.id, title: r.title, icon: REWARD_ICONS[i % REWARD_ICONS.length], price: r.cost_coins, description: r.description || '' })) : fallbackRewards;

  const MEDAL_ICONS = [Icon15, Icon16, Icon17, Icon18, Icon11, Icon12, Icon13, Icon14];
  const fallbackMedals = [ { id: 1, name: 'مدال ریاضی', icon: Icon15, xpRequired: 200 }, { id: 2, name: 'مدال علوم', icon: Icon16, xpRequired: 300 }, { id: 3, name: 'مدال هنر', icon: Icon17, xpRequired: 400 }, { id: 4, name: 'مدال زبان', icon: Icon18, xpRequired: 500 }, { id: 5, name: 'مدال ورزش', icon: Icon11, xpRequired: 600 }, { id: 6, name: 'مدال موسیقی', icon: Icon12, xpRequired: 700 }, { id: 7, name: 'مدال برنامه‌نویسی', icon: Icon13, xpRequired: 800 }, { id: 8, name: 'مدال رهبری', icon: Icon14, xpRequired: 900 } ].map(medal => ({ ...medal, earned: coins >= medal.xpRequired }));
  const medals = backendBadges && backendBadges.length > 0 ? backendBadges.map((b, i) => ({ id: b.id, name: b.name_fa, icon: MEDAL_ICONS[i % MEDAL_ICONS.length], xpRequired: b.criteria_value, earned: !!b.earned })) : fallbackMedals;
  const purchasedItems = JSON.parse(localStorage.getItem('lukoClubPurchased') || '[]');

  const medalsEarned = medals.filter((m) => m.earned).length;
  const weekDoneCount = (streakWeekDays || weekDays).filter((d) => d.done || d.isPassed).length;

  const openVideoModal = (missionId, videoSrc, videoTitle, xpAmount) => { if (checkHasWatchedVideoToday(videoTitle)) { alert('شما امروز این ویدیو را قبلاً تماشا کرده‌اید'); return; } setVideoModal({ isOpen: true, src: videoSrc, title: videoTitle, xp: xpAmount, missionId }); };
  const closeVideoModal = () => setVideoModal({ isOpen: false, src: '', title: '', xp: 0, missionId: null });

  const handleVideoEnded = () => {
    const today = new Date().toDateString(); const watchData = JSON.parse(localStorage.getItem('luko_watched_videos') || '{}'); watchData[videoModal.title] = today; localStorage.setItem('luko_watched_videos', JSON.stringify(watchData));
    if (!localCompletedTasks.includes(videoModal.missionId)) { const newCompleted = [...localCompletedTasks, videoModal.missionId]; setLocalCompletedTasks(newCompleted); localStorage.setItem('luko_completed_tasks', JSON.stringify(newCompleted)); const currentHomeXP = parseInt(localStorage.getItem('luko_user_xp'), 10) || 0; localStorage.setItem('luko_user_xp', (currentHomeXP + videoModal.xp).toString()); if (newCompleted.length === todayMissionsList.length) setLocalMissionCompleted(true); }
    alert(`${videoModal.xp} XP دریافت کردی`); closeVideoModal();
  };

  const handleNonVideoMission = (missionId, xpAmount) => {
    if (localCompletedTasks.includes(missionId)) return; const newCompleted = [...localCompletedTasks, missionId]; setLocalCompletedTasks(newCompleted); localStorage.setItem('luko_completed_tasks', JSON.stringify(newCompleted)); const currentHomeXP = parseInt(localStorage.getItem('luko_user_xp'), 10) || 0; localStorage.setItem('luko_user_xp', (currentHomeXP + xpAmount).toString()); if (newCompleted.length === todayMissionsList.length) setLocalMissionCompleted(true);
  };

  const handleCompleteMainMission = () => { if (!localMissionCompleted && mainMissionData) { setLocalMissionCompleted(true); setTimeout(() => { setCurrentDay(prev => prev + 1); localStorage.setItem('luko_current_day', currentDay + 1); setLocalCompletedTasks([]); localStorage.setItem('luko_completed_tasks', JSON.stringify([])); }, 100); } };

  const handlePurchaseReward = async (rewardId, price) => { if (userXP < price) { alert(`سکه کافی نیست؛ به ${price} سکه نیاز داری`); return; } const success = await purchaseItem(rewardId, price); if (success) { const purchased = JSON.parse(localStorage.getItem('lukoClubPurchased') || '[]'); if (!purchased.includes(rewardId)) localStorage.setItem('lukoClubPurchased', JSON.stringify([...purchased, rewardId])); alert('جایزه با موفقیت دریافت شد'); } else { alert('خطا در دریافت جایزه'); } };

  const navItems = [ { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' }, { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' }, { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' }, { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' }, { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' } ];

  const heroStats = [
    { icon: '🪙', val: coins, label: 'سکه' },
    { icon: '🔥', val: weekDoneCount, label: 'روز فعال' },
    { icon: '🏅', val: medalsEarned, label: 'مدال' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Shoor', 'Shoor Rounded', sans-serif", direction: 'rtl', paddingBottom: '90px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 'min(600px, 100%)' }}>

        <Header
          title="لوکو کلاب"
          user={user}
          showGreeting={false}
          onProfileClick={() => navigate('/profile')}
          leftAction={
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(246,177,0,0.16)', padding: '8px 14px', borderRadius: 999, boxShadow: '0 2px 8px rgba(246,177,0,0.15)' }}>
              <span style={{ fontSize: 16 }} aria-hidden>🪙</span>
              <span style={{ fontWeight: 700, color: colors.text, fontSize: 14 }}>{coins}</span>
            </div>
          }
        />

        <div style={{ padding: '4px clamp(12px, 3vw, 16px) 20px' }}>

          {/* ===== HERO ===== */}
          <section
            className="loko-anim"
            style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: 'linear-gradient(135deg, #4DB6AC 0%, #3AA79C 55%, #2E9E93 100%)', padding: '20px 20px 22px', color: '#fff', boxShadow: '0 18px 40px rgba(46,158,147,0.30)', marginBottom: 20 }}
          >
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', top: -70, left: -50 }} />
            <div style={{ position: 'absolute', width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', bottom: -50, right: -30 }} />

            <div style={{ position: 'relative' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.18)', padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, backdropFilter: 'blur(6px)' }}>
                <HiOutlineSparkles size={14} /> {currentDayName} • باشگاه لوکو
              </span>
              <h1 style={{ margin: '12px 0 4px', color: '#fff' }}>مأموریت‌های امروزت</h1>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                {totalTasksCount > 0
                  ? `${tasksCompletedCount} از ${totalTasksCount} انجام شده — ادامه بده!`
                  : 'امروز مأموریت جدیدی در راهه!'}
              </p>

              {/* progress */}
              {totalTasksCount > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', borderRadius: 999, background: '#fff', transition: 'width .5s ease' }} />
                  </div>
                </div>
              )}

              {/* stats */}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                {heroStats.map((s, i) => (
                  <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.16)', borderRadius: 16, padding: '10px 8px', textAlign: 'center', backdropFilter: 'blur(6px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 17, fontWeight: 800 }}>
                      <span aria-hidden>{s.icon}</span>{s.val}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* بخش‌های عملکردی (تم سبزآبی از طریق colors؛ منطق بدون تغییر) */}
       
          <div className="loko-anim" style={{ animationDelay: '120ms' }}>
            <DailyMissions missions={todayMissionsList} completedTasks={localCompletedTasks} hasWatchedVideoToday={checkHasWatchedVideoToday} onVideoClick={openVideoModal} onNonVideoClick={handleNonVideoMission} colors={colors} isMobile={isMobile} pressedItem={pressedItem} setPressedItem={setPressedItem} />
          </div>
          <div className="loko-anim" style={{ animationDelay: '180ms' }}>
            <WeekStreak weekDays={streakWeekDays || weekDays} colors={colors} isMobile={isMobile} />
          </div>
          <div className="loko-anim" style={{ animationDelay: '240ms' }}>
            <MedalsSection medals={medals} colors={colors} isMobile={isMobile} />
          </div>
          <div className="loko-anim" style={{ animationDelay: '300ms' }}>
            <ShopSection rewards={rewards} purchasedItems={purchasedItems} onPurchase={handlePurchaseReward} colors={colors} isMobile={isMobile} pressedItem={pressedItem} setPressedItem={setPressedItem} />
          </div>
        </div>
      </div>

      <VideoModal isOpen={videoModal.isOpen} videoSrc={videoModal.src} videoTitle={videoModal.title} videoXp={videoModal.xp} colors={colors} onClose={closeVideoModal} onVideoEnded={handleVideoEnded} />
      <NavigationBar navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} isMobile={isMobile} colors={colors} onNavigate={navigate} setPressedItem={setPressedItem} pressedItem={pressedItem} />

      <style>{`
        @keyframes homeFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .loko-anim { animation: homeFadeUp .45s ease both; }
        ::-webkit-scrollbar { display: none; }
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; user-select: none; }
        button { font-family: inherit; cursor: pointer; } button:disabled { cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default LukoClub;

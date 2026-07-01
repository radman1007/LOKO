// src/pages/LukoClub.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { 
  HiOutlineHome, 
  HiOutlineUser,
  HiOutlineFire,
  HiOutlinePlay,
  HiOutlineHeart
} from 'react-icons/hi';

// کامپوننت‌ها
import Header from '../components/common/Header';
import NavigationBar from '../components/common/NavigationBar';
import DayCard from '../components/luko-club/DayCard';
import DailyMissions from '../components/luko-club/DailyMissions';
import WeekStreak from '../components/luko-club/WeekStreak';
import MedalsSection from '../components/luko-club/MedalsSection';
import ShopSection from '../components/luko-club/ShopSection';
import VideoModal from '../components/luko-club/VideoModal';

// ایمپورت آیکون‌ها
import Icon11 from '../icons/icon11.png';
import Icon12 from '../icons/icon12.png';
import Icon13 from '../icons/icon13.png';
import Icon14 from '../icons/icon14.png';
import Icon19 from '../icons/icon19.png';
import Icon20 from '../icons/icon20.png';
import Icon15 from '../icons/icon15.png';
import Icon16 from '../icons/icon16.png';
import Icon17 from '../icons/icon17.png';
import Icon18 from '../icons/icon18.png';
import Icon3 from '../icons/icon3.png';

// ایمپورت ویدیوها
import VideoCapitan from '../video/capitan.mp4';
import VideoShabihsaz from '../video/shabihsaz.mp4';
import VideoVadeakhar from '../video/vadeakhar.mp4';

// فقط برای گرفتن لیست base ماموریت‌ها
import { getTodayMissions } from '../data/dailyMissionsData';

// سرویس‌های باشگاه (سکه، جوایز، مدال، استریک)
import { clubService } from '../services/task.service';

const LukoClub = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // ─── اقتصاد باشگاه از بک‌اند ───
  const [coins, setCoins] = useState(0);
  const [backendRewards, setBackendRewards] = useState(null);
  const [backendBadges, setBackendBadges] = useState(null);
  const [backendStreak, setBackendStreak] = useState(null);

  const refreshClub = useCallback(async () => {
    try {
      const [summaryRes, rewardsRes, badgesRes, streakRes] = await Promise.allSettled([
        clubService.getSummary(),
        clubService.getRewards(),
        clubService.getBadges(),
        clubService.getStreak(),
      ]);
      if (summaryRes.status === 'fulfilled' && summaryRes.value?.success) setCoins(summaryRes.value.data?.coins ?? 0);
      if (rewardsRes.status === 'fulfilled' && rewardsRes.value?.success) setBackendRewards(rewardsRes.value.data || []);
      if (badgesRes.status === 'fulfilled' && badgesRes.value?.success) setBackendBadges(badgesRes.value.data || []);
      if (streakRes.status === 'fulfilled' && streakRes.value?.success) setBackendStreak(streakRes.value.data || null);
    } catch (e) {}
  }, []);

  useEffect(() => { refreshClub(); }, [refreshClub]);

  // نگاشت استریک بک‌اند به نوار هفتگی
  const [streakWeekDays, setStreakWeekDays] = useState(null);
  useEffect(() => {
    if (!backendStreak?.week) { setStreakWeekDays(null); return; }
    const persianDays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
    const todayStr = new Date().toISOString().split('T')[0];
    setStreakWeekDays(
      backendStreak.week.map((d, i) => ({
        id: i + 1,
        name: persianDays[new Date(d.date).getDay()],
        status: d.date === todayStr ? 'today' : (d.done ? 'passed' : 'future'),
        isToday: d.date === todayStr,
        isPassed: d.done,
      }))
    );
  }, [backendStreak]);

  const userXP = coins;
  
  const purchaseItem = useCallback(async (rewardId) => {
    try {
      const res = await clubService.redeemReward(rewardId);
      if (res?.success) { setCoins(res.data?.coinBalance ?? coins); return true; }
      return false;
    } catch (e) { return false; }
  }, [coins]);
  
  const [activeNav, setActiveNav] = useState('لوکو کلاب');
  const [pressedItem, setPressedItem] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [todayMissionsList, setTodayMissionsList] = useState([]);
  const [mainMissionData, setMainMissionData] = useState(null);
  const [weekDays, setWeekDays] = useState([]);
  
  // استیت‌های همگام شده با صفحه اصلی (حافظه مشترک)
  const [localCompletedTasks, setLocalCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('luko_completed_tasks')) || []);
  const [localMissionCompleted, setLocalMissionCompleted] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  
  const [videoModal, setVideoModal] = useState({ isOpen: false, src: '', title: '', xp: 0, missionId: null });

  const colors = {
    primary: '#EEBD3D', primaryDark: '#ECB735', primaryLight: '#FEF0CB',
    bg: '#FFFBFF', cardBg: '#FFFFFF', text: '#010101', textSecondary: '#666666',
    navBg: '#FFFFFF', iconBg: '#FEECC6', xpBg: '#F0C346', streakBg: '#FEECC6',
    streakBorder: '#C18E18', streakPassed: '#F0A500', streakTodayBg: '#FFFFFF',
    streakOtherBg: 'transparent', medalUnlockedBg: '#FEECC6', medalLockedBg: '#E8E8E8'
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedDay = localStorage.getItem('luko_current_day');
    if (savedDay) setCurrentDay(parseInt(savedDay));
  }, []);

  useEffect(() => { localStorage.setItem('luko_current_day', currentDay); }, [currentDay]);

  // تابع استاندارد چک کردن ویدیو (دقیقاً مشابه Home)
  const checkHasWatchedVideoToday = (title) => {
    const today = new Date().toDateString();
    const watchData = JSON.parse(localStorage.getItem('luko_watched_videos') || '{}');
    return watchData[title] === today;
  };

  // بارگذاری و فیلتر کردن فقط فیلم‌ها
  useEffect(() => {
    const todayData = getTodayMissions();
    
    const missionsWithIcons = todayData.missions.map(mission => {
      let iconSrc;
      switch(mission.icon) {
        case 'Icon11': iconSrc = Icon11; break; case 'Icon12': iconSrc = Icon12; break;
        case 'Icon13': iconSrc = Icon13; break; case 'Icon14': iconSrc = Icon14; break;
        case 'Icon15': iconSrc = Icon15; break; case 'Icon16': iconSrc = Icon16; break;
        case 'Icon17': iconSrc = Icon17; break; case 'Icon18': iconSrc = Icon18; break;
        case 'Icon19': iconSrc = Icon19; break; case 'Icon20': iconSrc = Icon20; break;
        default: iconSrc = Icon12;
      }
      
      let videoSrc = null;
      if (mission.videoTitle) {
        switch(mission.videoTitle) {
          case 'کاپیتان': videoSrc = VideoCapitan; break;
          case 'شبیه ساز': videoSrc = VideoShabihsaz; break;
          case 'واده آخر': videoSrc = VideoVadeakhar; break;
          default: videoSrc = VideoCapitan;
        }
      }
      return { ...mission, iconSrc, videoSrc };
    });
    
    // *** فیلتر کردن حرفه ای: فقط تسک‌های ویدیویی رو نگه می‌داره ***
    const videoOnlyMissions = missionsWithIcons.filter(m => m.type === 'video');
    
    setTodayMissionsList(videoOnlyMissions);
    setMainMissionData(todayData.mainMission);
    
    if (localCompletedTasks.length === videoOnlyMissions.length && videoOnlyMissions.length > 0) {
      setLocalMissionCompleted(true);
    }
    
    // ساخت روزهای هفته
    const persianDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
    const today = new Date();
    const jsDay = today.getDay(); 
    let persianTodayIndex;
    if (jsDay === 6) persianTodayIndex = 0;
    else if (jsDay === 0) persianTodayIndex = 1;
    else if (jsDay === 1) persianTodayIndex = 2;
    else if (jsDay === 2) persianTodayIndex = 3;
    else if (jsDay === 3) persianTodayIndex = 4;
    else if (jsDay === 4) persianTodayIndex = 5;
    else persianTodayIndex = 6;
    
    setWeekDays(persianDays.map((name, index) => {
      let status = 'future';
      if (index === persianTodayIndex) status = 'today';
      else if (index < persianTodayIndex) status = 'passed';
      return { id: index + 1, name, status, isToday: status === 'today', isPassed: status === 'passed' };
    }));
  }, [localCompletedTasks]);

  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;
  
  const currentDayName = currentDay === 1 ? 'روز اول' : currentDay === 2 ? 'روز دوم' : currentDay === 3 ? 'روز سوم' : currentDay === 4 ? 'روز چهارم' : currentDay === 5 ? 'روز پنجم' : currentDay === 6 ? 'روز ششم' : currentDay === 7 ? 'روز هفتم' : `روز ${currentDay}`;
  
  const tasksCompletedCount = localCompletedTasks.length;
  const totalTasksCount = todayMissionsList.length;
  const progressPercent = totalTasksCount > 0 ? (tasksCompletedCount / totalTasksCount) * 100 : 0;

  const REWARD_ICONS = [Icon3, Icon14, Icon19, Icon20];
  const fallbackRewards = [
    { id: 1, title: 'استیکر سکه', icon: Icon3, price: 50, description: 'استیکر مخصوص پروفایل' },
    { id: 2, title: 'پروفایل ویژه', icon: Icon14, price: 75, description: 'قاب پروفایل اختصاصی' },
    { id: 3, title: 'پس زمینه ویژه', icon: Icon19, price: 100, description: 'تم اختصاصی برنامه' },
    { id: 4, title: 'استیکر ویژه', icon: Icon20, price: 120, description: 'استیکر لوکو' }
  ];
  const rewards = backendRewards ? backendRewards.map((r, i) => ({ id: r.id, title: r.title, icon: REWARD_ICONS[i % REWARD_ICONS.length], price: r.cost_coins, description: r.description || '' })) : fallbackRewards;

  const MEDAL_ICONS = [Icon15, Icon16, Icon17, Icon18, Icon11, Icon12, Icon13, Icon14];
  // خواندن XP محلی برای همگام شدن با پروفایل
  const localXP = parseInt(localStorage.getItem('luko_user_xp')) || 0;

  const fallbackMedals = [
    { id: 1, name: 'مدال ریاضی', icon: Icon15, xpRequired: 200 },
    { id: 2, name: 'مدال علوم', icon: Icon16, xpRequired: 300 },
    { id: 3, name: 'مدال هنر', icon: Icon17, xpRequired: 400 },
    { id: 4, name: 'مدال زبان', icon: Icon18, xpRequired: 500 },
    { id: 5, name: 'مدال ورزش', icon: Icon11, xpRequired: 600 },
    { id: 6, name: 'مدال موسیقی', icon: Icon12, xpRequired: 700 },
    { id: 7, name: 'مدال برنامه‌نویسی', icon: Icon13, xpRequired: 800 },
    { id: 8, name: 'مدال رهبری', icon: Icon14, xpRequired: 900 }
  ].map(medal => ({ ...medal, earned: localXP >= medal.xpRequired }));

  const medals = backendBadges && backendBadges.length > 0 ? backendBadges.map((b, i) => ({ id: b.id, name: b.name_fa, icon: MEDAL_ICONS[i % MEDAL_ICONS.length], xpRequired: b.criteria_value, earned: !!b.earned })) : fallbackMedals;

  const purchasedItems = JSON.parse(localStorage.getItem('lukoClubPurchased') || '[]');

  const openVideoModal = (missionId, videoSrc, videoTitle, xpAmount) => {
    if (checkHasWatchedVideoToday(videoTitle)) {
      alert('شما امروز این ویدیو را قبلاً تماشا کرده‌اید');
      return;
    }
    setVideoModal({ isOpen: true, src: videoSrc, title: videoTitle, xp: xpAmount, missionId });
  };

  const closeVideoModal = () => setVideoModal({ isOpen: false, src: '', title: '', xp: 0, missionId: null });

  const handleVideoEnded = () => {
    const today = new Date().toDateString();
    const watchData = JSON.parse(localStorage.getItem('luko_watched_videos') || '{}');
    watchData[videoModal.title] = today;
    localStorage.setItem('luko_watched_videos', JSON.stringify(watchData));

    if (!localCompletedTasks.includes(videoModal.missionId)) {
      const newCompleted = [...localCompletedTasks, videoModal.missionId];
      setLocalCompletedTasks(newCompleted);
      localStorage.setItem('luko_completed_tasks', JSON.stringify(newCompleted));
      
      const currentHomeXP = parseInt(localStorage.getItem('luko_user_xp')) || 350;
      localStorage.setItem('luko_user_xp', (currentHomeXP + videoModal.xp).toString());

      if (newCompleted.length === todayMissionsList.length) setLocalMissionCompleted(true);
    }
    alert(`${videoModal.xp} XP دریافت کردی`);
    closeVideoModal();
  };

  const handleNonVideoMission = (missionId, xpAmount) => {
    if (localCompletedTasks.includes(missionId)) return;
    const newCompleted = [...localCompletedTasks, missionId];
    setLocalCompletedTasks(newCompleted);
    localStorage.setItem('luko_completed_tasks', JSON.stringify(newCompleted));
    
    const currentHomeXP = parseInt(localStorage.getItem('luko_user_xp')) || 350;
    localStorage.setItem('luko_user_xp', (currentHomeXP + xpAmount).toString());

    if (newCompleted.length === todayMissionsList.length) setLocalMissionCompleted(true);
  };

  const handleCompleteMainMission = () => {
    if (!localMissionCompleted && mainMissionData) {
      setLocalMissionCompleted(true);
      setTimeout(() => {
        setCurrentDay(prev => prev + 1);
        localStorage.setItem('luko_current_day', currentDay + 1);
        setLocalCompletedTasks([]);
        localStorage.setItem('luko_completed_tasks', JSON.stringify([]));
      }, 100);
    }
  };

  const handlePurchaseReward = async (rewardId, price) => {
    if (userXP < price) { alert(`سکه کافی نیست؛ به ${price} سکه نیاز داری`); return; }
    const success = await purchaseItem(rewardId, price);
    if (success) {
      const purchased = JSON.parse(localStorage.getItem('lukoClubPurchased') || '[]');
      if (!purchased.includes(rewardId)) localStorage.setItem('lukoClubPurchased', JSON.stringify([...purchased, rewardId]));
      alert('جایزه با موفقیت دریافت شد');
    } else { alert('خطا در دریافت جایزه'); }
  };

  const navItems = [
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Shoor', 'Shoor Rounded', sans-serif", direction: 'rtl', paddingBottom: '80px' }}>
      <Header title="لوکو کلاب" avatar={user?.avatar} isMobile={isMobile} colors={colors} pressedItem={pressedItem} setPressedItem={setPressedItem} onProfileClick={() => navigate('/profile')} />

      <div style={{ maxWidth: isDesktop ? '1200px' : '100%', margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 24px' }}>
        
        <div style={{ backgroundColor: colors.primaryLight, width: isMobile ? '90%' : '50%', display: 'flex', alignItems: 'center', margin: '0 0 20px 0', padding: '8px 16px', borderRadius: '24px', boxShadow: '0 6px 15px rgba(0,0,0,0.12)' }}>
          <div style={{ backgroundColor: colors.primaryDark, borderRadius: '50%', padding: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '12px' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{currentDay}</span>
          </div>
          <div><p style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>{currentDayName}</p></div>
        </div>

        <DayCard currentDay={currentDay} currentDayName={currentDayName} tasksCompletedCount={tasksCompletedCount} totalTasksCount={totalTasksCount} progressPercent={progressPercent} localMissionCompleted={localMissionCompleted} mainMissionData={mainMissionData} onCompleteMainMission={handleCompleteMainMission} colors={colors} isMobile={isMobile} />

        <DailyMissions
          missions={todayMissionsList}
          completedTasks={localCompletedTasks}
          hasWatchedVideoToday={checkHasWatchedVideoToday}
          onVideoClick={openVideoModal}
          onNonVideoClick={handleNonVideoMission}
          colors={colors}
          isMobile={isMobile}
          pressedItem={pressedItem}
          setPressedItem={setPressedItem}
        />

        <WeekStreak weekDays={streakWeekDays || weekDays} colors={colors} isMobile={isMobile} />
        <MedalsSection medals={medals} colors={colors} isMobile={isMobile} />
        <ShopSection rewards={rewards} purchasedItems={purchasedItems} onPurchase={handlePurchaseReward} colors={colors} isMobile={isMobile} pressedItem={pressedItem} setPressedItem={setPressedItem} />
      </div>

      <VideoModal isOpen={videoModal.isOpen} videoSrc={videoModal.src} videoTitle={videoModal.title} videoXp={videoModal.xp} colors={colors} onClose={closeVideoModal} onVideoEnded={handleVideoEnded} />

      <NavigationBar navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} isMobile={isMobile} colors={colors} onNavigate={navigate} setPressedItem={setPressedItem} pressedItem={pressedItem} />

      <style>{`
        ::-webkit-scrollbar { display: none; }
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; user-select: none; }
        button { font-family: inherit; cursor: pointer; }
        button:disabled { cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default LukoClub;
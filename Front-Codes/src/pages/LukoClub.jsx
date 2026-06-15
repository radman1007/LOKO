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

// ایمپورت دیتا ماموریت‌ها
import { 
  getTodayMissions, 
  shouldResetMissions, 
  saveCompletedMissions, 
  getCompletedMissions,
  registerVideoWatch,
  hasWatchedVideoToday
} from '../data/dailyMissionsData';

const LukoClub = () => {
  const navigate = useNavigate();
  const { user, userXP, completeTask, completeMission, purchaseItem } = useUser();
  
  const [activeNav, setActiveNav] = useState('لوکو کلاب');
  const [pressedItem, setPressedItem] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [todayMissionsList, setTodayMissionsList] = useState([]);
  const [mainMissionData, setMainMissionData] = useState(null);
  const [weekDays, setWeekDays] = useState([]);
  const [localCompletedTasks, setLocalCompletedTasks] = useState([]);
  const [localMissionCompleted, setLocalMissionCompleted] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  
  // State مودال ویدیو
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    src: '',
    title: '',
    xp: 0,
    missionId: null
  });

  const colors = {
    primary: '#EEBD3D',
    primaryDark: '#ECB735',
    primaryLight: '#FEF0CB',
    bg: '#FFFBFF',
    cardBg: '#FFFFFF',
    text: '#010101',
    textSecondary: '#666666',
    navBg: '#FFFFFF',
    iconBg: '#FEECC6',
    xpBg: '#F0C346',
    streakBg: '#FEECC6',
    streakBorder: '#C18E18',
    streakPassed: '#F0A500',
    streakTodayBg: '#FFFFFF',
    streakOtherBg: 'transparent',
    medalUnlockedBg: '#FEECC6',
    medalLockedBg: '#E8E8E8'
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // بارگذاری روز جاری
  useEffect(() => {
    const savedDay = localStorage.getItem('luko_current_day');
    if (savedDay) {
      setCurrentDay(parseInt(savedDay));
    } else {
      setCurrentDay(1);
      localStorage.setItem('luko_current_day', '1');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('luko_current_day', currentDay);
  }, [currentDay]);

  // بارگذاری ماموریت‌های امروز
  useEffect(() => {
    if (shouldResetMissions()) {
      setLocalCompletedTasks([]);
      setLocalMissionCompleted(false);
      saveCompletedMissions([]);
    } else {
      const savedCompleted = getCompletedMissions();
      setLocalCompletedTasks(savedCompleted);
      const todayData = getTodayMissions();
      if (savedCompleted.length === todayData.missions.length) {
        setLocalMissionCompleted(true);
      }
    }
    
    const todayData = getTodayMissions();
    
    const missionsWithIcons = todayData.missions.map(mission => {
      let iconSrc;
      switch(mission.icon) {
        case 'Icon11': iconSrc = Icon11; break;
        case 'Icon12': iconSrc = Icon12; break;
        case 'Icon13': iconSrc = Icon13; break;
        case 'Icon14': iconSrc = Icon14; break;
        case 'Icon15': iconSrc = Icon15; break;
        case 'Icon16': iconSrc = Icon16; break;
        case 'Icon17': iconSrc = Icon17; break;
        case 'Icon18': iconSrc = Icon18; break;
        case 'Icon19': iconSrc = Icon19; break;
        case 'Icon20': iconSrc = Icon20; break;
        default: iconSrc = Icon12;
      }
      
      let videoSrc = null;
      if (mission.type === 'video' && mission.videoTitle) {
        switch(mission.videoTitle) {
          case 'کاپیتان': videoSrc = VideoCapitan; break;
          case 'شبیه ساز': videoSrc = VideoShabihsaz; break;
          case 'واده آخر': videoSrc = VideoVadeakhar; break;
          default: videoSrc = VideoCapitan;
        }
      }
      
      return { ...mission, iconSrc, videoSrc };
    });
    
    setTodayMissionsList(missionsWithIcons);
    setMainMissionData(todayData.mainMission);
    
    // ساخت روزهای هفته با رنگ‌بندی درست بر اساس تاریخ امروز
    const persianDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
    
    // محاسبه روز جاری به شمسی
    const today = new Date();
    const jsDay = today.getDay(); // 0=یکشنبه, 1=دوشنبه, 2=سه‌شنبه, 3=چهارشنبه, 4=پنجشنبه, 5=جمعه, 6=شنبه
    
    let persianTodayIndex;
    if (jsDay === 6) {
      persianTodayIndex = 0; // شنبه
    } else if (jsDay === 0) {
      persianTodayIndex = 1; // یکشنبه
    } else if (jsDay === 1) {
      persianTodayIndex = 2; // دوشنبه
    } else if (jsDay === 2) {
      persianTodayIndex = 3; // سه‌شنبه
    } else if (jsDay === 3) {
      persianTodayIndex = 4; // چهارشنبه
    } else if (jsDay === 4) {
      persianTodayIndex = 5; // پنجشنبه
    } else {
      persianTodayIndex = 6; // جمعه
    }
    
    setWeekDays(persianDays.map((name, index) => {
      let status = 'future';
      if (index === persianTodayIndex) {
        status = 'today';
      } else if (index < persianTodayIndex) {
        status = 'passed';
      }
      
      return {
        id: index + 1,
        name,
        status,
        isToday: status === 'today',
        isPassed: status === 'passed'
      };
    }));
  }, []);

  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;
  
  // نام نمایشی بدون @
  const displayName = user?.username?.replace('@', '') || user?.name || 'کاربر';
  
  const currentDayName = 
    currentDay === 1 ? 'روز اول' :
    currentDay === 2 ? 'روز دوم' :
    currentDay === 3 ? 'روز سوم' :
    currentDay === 4 ? 'روز چهارم' :
    currentDay === 5 ? 'روز پنجم' :
    currentDay === 6 ? 'روز ششم' :
    currentDay === 7 ? 'روز هفتم' : `روز ${currentDay}`;
  
  // پیشرفت بر اساس تعداد تسک‌های انجام شده
  const tasksCompletedCount = localCompletedTasks.length;
  const totalTasksCount = todayMissionsList.length;
  const progressPercent = totalTasksCount > 0 ? (tasksCompletedCount / totalTasksCount) * 100 : 0;

  const rewards = [
    { id: 1, title: 'استیکر سکه', icon: Icon3, price: 50, description: 'استیکر مخصوص پروفایل' },
    { id: 2, title: 'پروفایل ویژه', icon: Icon14, price: 75, description: 'قاب پروفایل اختصاصی' },
    { id: 3, title: 'پس زمینه ویژه', icon: Icon19, price: 100, description: 'تم اختصاصی برنامه' },
    { id: 4, title: 'استیکر ویژه', icon: Icon20, price: 120, description: 'استیکر لوکو' }
  ];

  // مدال‌ها - دستاوردهای دائمی
  const medals = [
    { id: 1, name: 'مدال ریاضی', icon: Icon15, xpRequired: 200 },
    { id: 2, name: 'مدال علوم', icon: Icon16, xpRequired: 300 },
    { id: 3, name: 'مدال هنر', icon: Icon17, xpRequired: 400 },
    { id: 4, name: 'مدال زبان', icon: Icon18, xpRequired: 500 },
    { id: 5, name: 'مدال ورزش', icon: Icon11, xpRequired: 600 },
    { id: 6, name: 'مدال موسیقی', icon: Icon12, xpRequired: 700 },
    { id: 7, name: 'مدال برنامه‌نویسی', icon: Icon13, xpRequired: 800 },
    { id: 8, name: 'مدال رهبری', icon: Icon14, xpRequired: 900 }
  ].map(medal => ({
    ...medal,
    earned: userXP >= medal.xpRequired
  }));

  const purchasedItems = JSON.parse(localStorage.getItem('lukoClubPurchased') || '[]');

  const openVideoModal = (missionId, videoSrc, videoTitle, xpAmount) => {
    if (hasWatchedVideoToday(videoTitle)) {
      alert('شما امروز این ویدیو را قبلاً تماشا کرده‌اید');
      return;
    }
    setVideoModal({ isOpen: true, src: videoSrc, title: videoTitle, xp: xpAmount, missionId });
  };

  const closeVideoModal = () => {
    setVideoModal({ isOpen: false, src: '', title: '', xp: 0, missionId: null });
  };

  const handleVideoEnded = () => {
    const success = registerVideoWatch(videoModal.title, videoModal.xp);
    
    if (success) {
      completeTask(videoModal.missionId, videoModal.xp);
      const newCompleted = [...localCompletedTasks, videoModal.missionId];
      setLocalCompletedTasks(newCompleted);
      saveCompletedMissions(newCompleted);
      
      if (newCompleted.length === todayMissionsList.length) {
        setLocalMissionCompleted(true);
      }
      
      alert(`${videoModal.xp} XP دریافت کردی`);
      closeVideoModal();
    } else {
      alert('شما قبلاً این ویدیو را امروز تماشا کرده‌اید');
      closeVideoModal();
    }
  };

  const handleNonVideoMission = (missionId, xpAmount) => {
    if (localCompletedTasks.includes(missionId)) return;
    
    completeTask(missionId, xpAmount);
    const newCompleted = [...localCompletedTasks, missionId];
    setLocalCompletedTasks(newCompleted);
    saveCompletedMissions(newCompleted);
    
    if (newCompleted.length === todayMissionsList.length) {
      setLocalMissionCompleted(true);
    }
  };

  const handleCompleteMainMission = () => {
    if (!localMissionCompleted && mainMissionData) {
      completeMission();
      setLocalMissionCompleted(true);
      
      setTimeout(() => {
        setCurrentDay(prev => prev + 1);
        localStorage.setItem('luko_current_day', currentDay + 1);
      }, 100);
    }
  };

  const handlePurchaseReward = (rewardId, price) => {
    if (userXP >= price) {
      const success = purchaseItem(rewardId, price);
      if (success) {
        alert('جایزه خریداری شد');
      } else {
        alert('خطا در خرید');
      }
    } else {
      alert(`امتیاز کافی نیست نیاز به ${price} XP دارید`);
    }
  };

  const navItems = [
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      fontFamily: "'Shoor', 'Shoor Rounded', sans-serif",
      direction: 'rtl',
      paddingBottom: '80px'
    }}>
<Header
  title="لوکو کلاب"
  avatar={user?.avatar}
  isMobile={isMobile}
  colors={colors}
  pressedItem={pressedItem}
  setPressedItem={setPressedItem}
  onProfileClick={() => navigate('/profile')}
/>

      <div style={{
        maxWidth: isDesktop ? '1200px' : '100%',
        margin: '0 auto',
        padding: isMobile ? '20px 16px' : '32px 24px'
      }}>
        
        {/* بخش روز */}
        <div style={{
          backgroundColor: colors.primaryLight,
          width: isMobile ? '90%' : '50%',
          display: 'flex',
          alignItems: 'center',
          margin: '0 0 20px 0',
          padding: '8px 16px',
          borderRadius: '24px',
          boxShadow: '0 6px 15px rgba(0,0,0,0.12)'
        }}>
          <div style={{
            backgroundColor: colors.primaryDark,
            borderRadius: '50%',
            padding: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '12px'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{currentDay}</span>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>
              {currentDayName}
            </p>
          </div>
        </div>

        <DayCard
          currentDay={currentDay}
          currentDayName={currentDayName}
          tasksCompletedCount={tasksCompletedCount}
          totalTasksCount={totalTasksCount}
          progressPercent={progressPercent}
          localMissionCompleted={localMissionCompleted}
          mainMissionData={mainMissionData}
          onCompleteMainMission={handleCompleteMainMission}
          colors={colors}
          isMobile={isMobile}
        />

        <DailyMissions
          missions={todayMissionsList}
          completedTasks={localCompletedTasks}
          hasWatchedVideoToday={hasWatchedVideoToday}
          onVideoClick={openVideoModal}
          onNonVideoClick={handleNonVideoMission}
          colors={colors}
          isMobile={isMobile}
          pressedItem={pressedItem}
          setPressedItem={setPressedItem}
        />

        <WeekStreak weekDays={weekDays} colors={colors} isMobile={isMobile} />

        <MedalsSection medals={medals} colors={colors} isMobile={isMobile} />

        <ShopSection
          rewards={rewards}
          purchasedItems={purchasedItems}
          onPurchase={handlePurchaseReward}
          colors={colors}
          isMobile={isMobile}
          pressedItem={pressedItem}
          setPressedItem={setPressedItem}
        />
      </div>

      <VideoModal
        isOpen={videoModal.isOpen}
        videoSrc={videoModal.src}
        videoTitle={videoModal.title}
        videoXp={videoModal.xp}
        colors={colors}
        onClose={closeVideoModal}
        onVideoEnded={handleVideoEnded}
      />

      <NavigationBar
        navItems={navItems}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        isMobile={isMobile}
        colors={colors}
        onNavigate={navigate}
        setPressedItem={setPressedItem}
        pressedItem={pressedItem}
      />

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
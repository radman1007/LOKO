// LukoTV.jsx - نسخه نهایی با ذخیره پیشرفت ویدیو
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { 
  HiOutlineUser,
  HiOutlinePlay,
  HiOutlineClock,
  HiOutlineHome,
  HiOutlineFire,
  HiOutlineHeart,
  HiOutlineSearch,
  HiOutlineX
} from 'react-icons/hi';

// ایمپورت بنرهای تصویری
import Banner36 from '../icons/icon36.png';
import Banner37 from '../icons/icon37.png';
import Banner38 from '../icons/icon38.png';
import Banner39 from '../icons/icon39.png';
import Banner40 from '../icons/icon40.png';
import Banner41 from '../icons/icon41.png';
import Icon3 from '../icons/icon3.png';

// ایمپورت ویدیوها
import VideoCapitan from '../video/capitan.mp4';
import VideoShabihsaz from '../video/shabihsaz.mp4';
import VideoVadeakhar from '../video/vadeakhar.mp4';

// ایمپورت توابع ماموریت‌ها
import { 
  getTodayVideoMission, 
  hasWatchedVideoToday as checkVideoWatchedToday, 
  registerVideoWatch 
} from '../data/dailyMissionsData';

const LukoTV = () => {
  const navigate = useNavigate();
  const { user, addXP, completeTask, userXP } = useUser();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [activeTab, setActiveTab] = useState('لوکو تلویزیون');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeFilters, setActiveFilters] = useState(['تماشا شده', 'ریاضی', 'فارسی', 'پیشنهادی']);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoSrc, setSelectedVideoSrc] = useState('');
  const [selectedVideoTitle, setSelectedVideoTitle] = useState('');
  const [selectedVideoXp, setSelectedVideoXp] = useState(0);
  const [todayVideoMission, setTodayVideoMission] = useState(null);
  const [videoRef, setVideoRef] = useState(null);
  
  const bannerRef = useRef(null);
  const autoScrollInterval = useRef(null);
  const preloadedImages = useRef({});

  const colors = {
    bg: '#110A2C',
    cardBg: 'rgba(255,255,255,0.08)',
    primary: '#4DB6AC',
    secondary: '#BA68C8',
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.7)',
    pink: '#FF6B8A',
    orange: '#FFA726',
    purple: '#9C27B0',
    yellow: '#FFC107',
    red: '#F44336',
    navBg: '#1A1236'
  };

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // دریافت ماموریت ویدیوی امروز
  useEffect(() => {
    const videoMission = getTodayVideoMission();
    setTodayVideoMission(videoMission);
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // تابع ذخیره پیشرفت ویدیو
  const saveVideoProgress = (videoTitle, currentTime, duration) => {
    const progressPercent = (currentTime / duration) * 100;
    localStorage.setItem(`video_progress_${videoTitle}`, Math.floor(progressPercent));
    localStorage.setItem(`video_time_${videoTitle}`, currentTime);
  };

  // تابع دریافت پیشرفت ویدیو
  const getVideoProgress = (videoTitle) => {
    const savedTime = localStorage.getItem(`video_time_${videoTitle}`);
    return savedTime ? parseFloat(savedTime) : 0;
  };

  // داده‌های استاتیک
  const banners = useMemo(() => [
    { id: 1, src: Banner36, title: 'سفر به اعماق کهکشان', subject: 'علوم پایه چهارم', duration: '15:30', xp: 50, videoTitle: 'سفر به اعماق کهکشان' },
    { id: 2, src: Banner37, title: 'ماجراجویی‌های ریاضی', subject: 'ریاضی پایه سوم', duration: '12:15', xp: 45, videoTitle: 'ماجراجویی‌های ریاضی' },
    { id: 3, src: Banner38, title: 'قصه‌های شنیدنی فارسی', subject: 'فارسی پایه چهارم', duration: '18:45', xp: 40, videoTitle: 'قصه‌های شنیدنی فارسی' },
    { id: 4, src: Banner39, title: 'ورزش و مهارت', subject: 'ورزش پایه دوم', duration: '10:00', xp: 35, videoTitle: 'ورزش و مهارت' },
    { id: 5, src: Banner40, title: 'داستان و سرگرمی', subject: 'داستان پایه اول', duration: '14:20', xp: 30, videoTitle: 'داستان و سرگرمی' }
  ], []);

  const scrollBanners = useMemo(() => [
    { id: 1, src: Banner41, title: 'بنر ویژه ۱' },
    { id: 2, src: Banner41, title: 'بنر ویژه ۲' },
    { id: 3, src: Banner41, title: 'بنر ویژه ۳' }
  ], []);

  const videoItems = useMemo(() => [
    { id: 1, title: 'کاپیتان', src: VideoCapitan, duration: '05:30', xp: 30, videoTitle: 'کاپیتان', isVideo: true, video: VideoCapitan },
    { id: 2, title: 'شبیه ساز', src: VideoShabihsaz, duration: '07:15', xp: 35, videoTitle: 'شبیه ساز', isVideo: true, video: VideoShabihsaz },
    { id: 3, title: 'واده آخر', src: VideoVadeakhar, duration: '06:45', xp: 32, videoTitle: 'واده آخر', isVideo: true, video: VideoVadeakhar }
  ], []);

  const continueWatching = useMemo(() => {
    // ویدیوهایی که پیشرفت دارند
    const allVideos = [...videoItems];
    return allVideos.filter(video => {
      const progress = localStorage.getItem(`video_progress_${video.videoTitle}`);
      return progress && parseInt(progress) > 0 && parseInt(progress) < 100;
    }).map(video => ({
      ...video,
      progress: parseInt(localStorage.getItem(`video_progress_${video.videoTitle}`) || '0'),
      isVideo: true
    }));
  }, [videoItems]);

  const mathAdventures = useMemo(() => [
    { id: 1, title: 'ریاضی پایه سوم', image: Banner37, duration: '12:15', xp: 45, videoTitle: 'ریاضی پایه سوم' },
    { id: 2, title: 'ریاضی پایه چهارم', image: Banner36, duration: '15:30', xp: 50, videoTitle: 'ریاضی پایه چهارم' },
    { id: 3, title: 'ریاضی پایه پنجم', image: Banner38, duration: '18:45', xp: 55, videoTitle: 'ریاضی پایه پنجم' }
  ], []);

  const persianStories = useMemo(() => [
    { id: 1, title: 'کاپیتان', video: VideoCapitan, duration: '05:30', xp: 30, isVideo: true, videoTitle: 'کاپیتان', video: VideoCapitan },
    { id: 2, title: 'شبیه ساز', video: VideoShabihsaz, duration: '07:15', xp: 35, isVideo: true, videoTitle: 'شبیه ساز', video: VideoShabihsaz },
    { id: 3, title: 'واده آخر', video: VideoVadeakhar, duration: '06:45', xp: 32, isVideo: true, videoTitle: 'واده آخر', video: VideoVadeakhar },
    { id: 4, title: 'شیر و موش', image: Banner38, duration: '8:30', xp: 30, videoTitle: 'شیر و موش' }
  ], []);

  const smartSuggestions = useMemo(() => [
    { id: 1, title: 'کاپیتان', video: VideoCapitan, duration: '05:30', xp: 50, isVideo: true, videoTitle: 'کاپیتان', video: VideoCapitan },
    { id: 2, title: 'شبیه ساز', video: VideoShabihsaz, duration: '07:15', xp: 55, isVideo: true, videoTitle: 'شبیه ساز', video: VideoShabihsaz },
    { id: 3, title: 'واده آخر', video: VideoVadeakhar, duration: '06:45', xp: 52, isVideo: true, videoTitle: 'واده آخر', video: VideoVadeakhar },
    { id: 4, title: 'ریاضی پیشرفته', image: Banner37, duration: '18:30', xp: 80, videoTitle: 'ریاضی پیشرفته' }
  ], []);

  const allSections = useMemo(() => [
    { id: 'تماشا شده', title: 'ادامه تماشا', data: continueWatching, color: colors.purple, showProgress: true },
    { id: 'ریاضی', title: 'ماجراجویی‌های ریاضی', data: mathAdventures, color: colors.yellow, showProgress: false },
    { id: 'فارسی', title: 'قصه‌های فارسی', data: persianStories, color: colors.red, showProgress: false },
    { id: 'پیشنهادی', title: 'پیشنهاد هوشمند لوکو', data: smartSuggestions, color: colors.primary, showProgress: false }
  ], [continueWatching, mathAdventures, persianStories, smartSuggestions]);

  const filteredSections = allSections.filter(section => activeFilters.includes(section.id));

  const filterButtons = useMemo(() => [
    { id: 'تماشا شده', title: 'ادامه تماشا', color: colors.purple },
    { id: 'ریاضی', title: 'ماجراجویی‌های ریاضی', color: colors.yellow },
    { id: 'فارسی', title: 'قصه‌های فارسی', color: colors.red },
    { id: 'پیشنهادی', title: 'پیشنهاد هوشمند لوکو', color: colors.primary }
  ], []);

  const navItems = useMemo(() => [
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' }
  ], []);

  const displayUsername = user?.username?.replace('@', '') || 'کاربر';

  const closeVideoModal = useCallback(() => {
    // ذخیره موقعیت فعلی ویدیو قبل از بستن
    if (videoRef) {
      const currentTime = videoRef.currentTime;
      const duration = videoRef.duration;
      if (duration && currentTime < duration - 1) {
        saveVideoProgress(selectedVideoTitle, currentTime, duration);
      }
    }
    setIsVideoModalOpen(false);
    setSelectedVideoSrc('');
    setSelectedVideoTitle('');
    setSelectedVideoXp(0);
  }, [videoRef, selectedVideoTitle]);

  const handleVideoEnded = useCallback(() => {
    const success = registerVideoWatch(selectedVideoTitle, selectedVideoXp);
    
    if (success) {
      addXP(selectedVideoXp);
      
      // پاک کردن پیشرفت ویدیو چون کامل دیده شده
      localStorage.removeItem(`video_progress_${selectedVideoTitle}`);
      localStorage.removeItem(`video_time_${selectedVideoTitle}`);
      
      if (todayVideoMission && todayVideoMission.videoTitle === selectedVideoTitle) {
        const taskCompleted = completeTask(todayVideoMission.id, todayVideoMission.xp);
        if (taskCompleted) {
          alert(`${selectedVideoXp} XP دریافت کردی و ماموریت "${todayVideoMission.title}" رو کامل کردی!`);
        } else {
          alert(`${selectedVideoXp} XP دریافت کردی!`);
        }
      } else {
        alert(`${selectedVideoXp} XP دریافت کردی!`);
      }
      
      closeVideoModal();
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      alert('شما قبلاً این ویدیو را امروز تماشا کرده‌اید!');
      closeVideoModal();
    }
  }, [selectedVideoTitle, selectedVideoXp, addXP, completeTask, todayVideoMission, closeVideoModal]);

  const handlePlayVideo = useCallback((videoSrc, videoTitle, xpReward = 30) => {
    setSelectedVideoSrc(videoSrc);
    setSelectedVideoTitle(videoTitle);
    setSelectedVideoXp(xpReward);
    setIsVideoModalOpen(true);
  }, []);

  // پیش‌لود تصاویر
  useEffect(() => {
    banners.forEach(banner => {
      const img = new Image();
      img.src = banner.src;
      preloadedImages.current[banner.src] = img;
    });
    
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [banners]);

  // اتواسکرول بنرها
  useEffect(() => {
    if (!isFirstLoad) {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
    }
    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, [isFirstLoad, banners.length]);

  // جستجو
  useEffect(() => {
    if (!isFirstLoad && searchQuery.length > 0) {
      const allVideos = [...continueWatching, ...mathAdventures, ...persianStories, ...smartSuggestions];
      const results = allVideos.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(results);
    } else if (!isFirstLoad) {
      setFilteredData(null);
    }
  }, [searchQuery, isFirstLoad, continueWatching, mathAdventures, persianStories, smartSuggestions]);

  const toggleFilter = useCallback((filterId) => {
    setActiveFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(f => f !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(null);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return;
    }
    
    const diff = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      } else {
        setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
      }
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    
    if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    autoScrollInterval.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
  }, [touchStart, touchEnd, banners.length]);

  const currentBannerData = banners[currentBanner];

  // کامپوننت ویدیو کارت
  const VideoCard = useCallback(({ item, showProgress = false, isVideo = false }) => {
    const savedProgress = localStorage.getItem(`video_progress_${item.videoTitle || item.title}`);
    const displayProgress = showProgress ? (item.progress || parseInt(savedProgress) || 0) : 0;
    const alreadyWatched = checkVideoWatchedToday(item.videoTitle || item.title);
    
    const handleCardClick = () => {
      if (isVideo && item.video) {
        handlePlayVideo(item.video, item.videoTitle || item.title, item.xp);
      } else if (item.image) {
        alert(`این آیتم ویدیو نیست: ${item.title}`);
      }
    };
    
    return (
      <div 
        onClick={handleCardClick}
        style={{
          minWidth: isMobile ? '140px' : '180px',
          width: isMobile ? '140px' : '180px',
          cursor: isVideo && item.video ? 'pointer' : 'default',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          opacity: alreadyWatched ? 0.6 : 1,
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (isVideo && item.video && !alreadyWatched) {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.3)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '100px' : '130px',
          backgroundColor: '#1a1a3a',
          overflow: 'hidden',
          borderRadius: '16px'
        }}>
          {isVideo && item.video ? (
            <video
              src={item.video}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              preload="metadata"
            />
          ) : (
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          )}
          
          {isVideo && item.video && !alreadyWatched && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isMobile ? '40px' : '50px',
              height: isMobile ? '40px' : '50px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HiOutlinePlay size={isMobile ? 24 : 30} color="white" />
            </div>
          )}

          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            borderRadius: '12px',
            padding: '2px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <HiOutlineClock size={10} color="white" />
            <span style={{ fontSize: '10px', color: 'white' }}>{item.duration}</span>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            borderRadius: '12px',
            padding: '2px 6px'
          }}>
            <span style={{
              fontSize: '9px',
              color: alreadyWatched ? colors.textSecondary : colors.primary,
              fontWeight: 'bold'
            }}>
              {alreadyWatched ? `+${item.xp} XP` : `+${item.xp} XP`}
            </span>
          </div>

          {/* نوار پیشرفت - به جای نوشته دیده شد */}
          {showProgress && displayProgress > 0 && displayProgress < 100 && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'rgba(255,255,255,0.3)'
            }}>
              <div style={{
                width: `${displayProgress}%`,
                height: '100%',
                background: colors.primary,
                borderRadius: '2px'
              }} />
            </div>
          )}
          
          {/* اگر ویدیو کامل دیده شده باشد، نوار سبز کامل */}
          {alreadyWatched && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'rgba(255,255,255,0.3)'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: '#4CAF50',
                borderRadius: '2px'
              }} />
            </div>
          )}
        </div>

        <div style={{
          padding: '8px 4px',
          textAlign: 'right'
        }}>
          <p style={{
            fontSize: isMobile ? '12px' : '13px',
            fontWeight: '600',
            color: colors.text,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {item.title}
          </p>
        </div>
      </div>
    );
  }, [isMobile, handlePlayVideo, colors]);

  // صفحه لودینگ اولیه
  if (isFirstLoad) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: `3px solid ${colors.primary}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <p style={{ color: colors.text, marginTop: '16px' }}>در حال بارگذاری...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
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
      
      {/* هدر */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: `${colors.bg}cc`,
        backdropFilter: 'blur(10px)',
        padding: isMobile ? '12px 16px' : '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: '700',
              color: colors.text,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.pink})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              لوکو تلویزیون
            </h1>
            <p style={{
              fontSize: '10px',
              color: colors.textSecondary,
              marginTop: '2px'
            }}>
              {userXP} XP
            </p>
          </div>

          <div style={{
            flex: 1,
            maxWidth: isMobile ? '200px' : '300px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: colors.cardBg,
              borderRadius: '40px',
              border: `1px solid rgba(255,255,255,0.2)`
            }}>
              <HiOutlineSearch style={{ margin: '0 8px', color: colors.textSecondary }} size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: isMobile ? '8px 0' : '10px 0',
                  paddingLeft: '16px',
                  color: colors.text,
                  fontSize: isMobile ? '13px' : '14px',
                  outline: 'none',
                  direction: 'rtl'
                }}
              />
            </div>
          </div>

          <div
            onClick={() => navigate('/profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              background: colors.cardBg,
              padding: isMobile ? '6px 12px' : '8px 16px',
              borderRadius: '60px 60px 60px 20px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{
              width: isMobile ? '32px' : '38px',
              height: isMobile ? '32px' : '38px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.purple})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <HiOutlineUser size={isMobile ? 18 : 20} color={colors.text} />
              )}
            </div>
            {!isMobile && (
              <span style={{ fontSize: '13px', fontWeight: '500', color: colors.text }}>
                {displayUsername}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div style={{
        maxWidth: isDesktop ? '1200px' : '100%',
        margin: '0 auto',
        padding: isMobile ? '20px 16px' : '32px 24px'
      }}>
        
        {/* نتایج جستجو */}
        {filteredData && filteredData.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: '700',
              color: colors.text,
              marginBottom: '16px'
            }}>
              نتایج جستجو برای "{searchQuery}"
            </h2>
            <div style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '16px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingBottom: '8px'
            }}>
              {filteredData.map((video, idx) => (
                <VideoCard 
                  key={idx} 
                  item={video} 
                  isVideo={video.video ? true : false}
                />
              ))}
            </div>
          </div>
        )}

        {/* بنر اسلایدر اصلی */}
        <div style={{
          marginBottom: '28px',
          position: 'relative',
          maxWidth: isMobile ? '100%' : '700px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <div 
            ref={bannerRef}
            style={{ 
              borderRadius: '20px', 
              overflow: 'hidden', 
              cursor: 'grab',
              maxWidth: '100%'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={currentBannerData.src}
              alt={currentBannerData.title}
              style={{
                width: '100%',
                height: isMobile ? '180px' : (isTablet ? '220px' : '260px'),
                objectFit: 'cover',
                display: 'block',
                pointerEvents: 'none'
              }}
            />
            
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '30px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 2
            }}>
              <img src={Icon3} alt="coin" style={{ width: '16px', height: '16px' }} />
              <span style={{ color: colors.orange, fontSize: '12px', fontWeight: 'bold' }}>+{currentBannerData.xp}</span>
              <span style={{ color: 'white', fontSize: '10px' }}>XP</span>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '20px',
                background: colors.primary,
                borderRadius: '30px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                zIndex: 10
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePlayVideo(currentBannerData.src, currentBannerData.videoTitle, currentBannerData.xp);
              }}
            >
              <HiOutlinePlay size={16} color={colors.bg} />
              <span style={{ color: colors.bg, fontSize: '13px', fontWeight: '600' }}>بزن بریم تماشا کنیم</span>
            </div>

            <div style={{
              position: 'absolute',
              bottom: '30px',
              right: '20px',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '30px',
              padding: '6px 14px',
              zIndex: 2,
              textAlign: 'center'
            }}>
              <h3 style={{
                color: 'white',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}>
                {currentBannerData.title}
              </h3>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '12px'
          }}>
            {banners.map((_, index) => (
              <div
                key={index}
                style={{
                  width: currentBanner === index ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: currentBanner === index ? colors.primary : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => setCurrentBanner(index)}
              />
            ))}
          </div>
        </div>

        {/* دکمه‌های فیلتر */}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '12px',
          marginBottom: '24px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: '8px'
        }}>
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => toggleFilter(btn.id)}
              style={{
                padding: isMobile ? '8px 16px' : '10px 24px',
                borderRadius: '40px',
                border: 'none',
                background: activeFilters.includes(btn.id) ? btn.color : 'rgba(255,255,255,0.15)',
                color: activeFilters.includes(btn.id) ? '#110A2C' : colors.text,
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {btn.title}
            </button>
          ))}
        </div>

        {/* بخش‌های ویدیو */}
        {!filteredData && filteredSections.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: '700',
              color: colors.text,
              marginBottom: '16px'
            }}>
              {section.title}
            </h2>
            <div style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '16px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingBottom: '8px'
            }}>
              {section.data.map((item) => (
                <VideoCard 
                  key={item.id} 
                  item={item} 
                  showProgress={section.showProgress && (item.progress > 0 || item.isVideo)}
                  isVideo={item.isVideo || false}
                />
              ))}
            </div>
          </div>
        ))}

        {/* بخش ویدیوهای ویژه */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: isMobile ? '16px' : '20px',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '16px'
          }}>
            ویدیوهای ویژه
          </h2>
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '16px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: '8px'
          }}>
            {videoItems.map((video) => (
              <VideoCard 
                key={video.id} 
                item={video} 
                isVideo={true}
              />
            ))}
          </div>
        </div>

        {/* بنرهای اسکرول */}
        <div style={{ marginTop: '32px', marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '16px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: '8px',
            paddingLeft: '16px',
            paddingRight: '16px',
            marginLeft: '-16px',
            marginRight: '-16px'
          }}>
            {scrollBanners.map((banner, index) => (
              <div
                key={banner.id}
                onClick={() => alert(`باز کردن: ${banner.title}`)}
                style={{
                  minWidth: isMobile ? '320px' : '400px',
                  width: isMobile ? '320px' : '400px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  opacity: index === 1 ? 1 : 0.85,
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <img 
                  src={banner.src} 
                  alt={banner.title} 
                  style={{ 
                    width: '100%', 
                    height: isMobile ? '130px' : '160px', 
                    objectFit: 'cover' 
                  }} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* مودال پخش ویدیو */}
      {isVideoModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
        onClick={closeVideoModal}
        >
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 1001,
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={closeVideoModal}>
            <HiOutlineX size={24} color="white" />
          </div>
          
          <div style={{
            width: '90%',
            maxWidth: '1000px',
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <video
              ref={(ref) => setVideoRef(ref)}
              src={selectedVideoSrc}
              controls
              autoPlay
              onEnded={handleVideoEnded}
              onTimeUpdate={() => {
                if (videoRef && videoRef.duration) {
                  saveVideoProgress(selectedVideoTitle, videoRef.currentTime, videoRef.duration);
                }
              }}
              style={{
                width: '100%',
                display: 'block'
              }}
            />
          </div>
          
          <p style={{
            color: 'white',
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            {selectedVideoTitle}
          </p>
        </div>
      )}

      {/* نویگیشن بار */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        left: 0,
        background: colors.navBg,
        boxShadow: '0 -2px 20px rgba(0,0,0,0.3)',
        borderRadius: '28px 28px 0 0',
        padding: isMobile ? '10px 12px' : '12px 20px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
        maxWidth: isDesktop ? '1200px' : '100%',
        margin: '0 auto'
      }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                navigate(item.path);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <IconComponent 
                size={isMobile ? 20 : 22} 
                color={isActive ? colors.primary : 'rgba(255,255,255,0.5)'}
              />
              <span style={{
                fontSize: isMobile ? '9px' : '10px',
                color: isActive ? colors.primary : 'rgba(255,255,255,0.5)',
                fontWeight: isActive ? '600' : '400'
              }}>
                {item.name}
              </span>
              {isActive && (
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '2px',
                  background: colors.primary,
                  marginTop: '2px'
                }} />
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        ::-webkit-scrollbar { display: none; }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        button, div[onClick] {
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        input { user-select: text; }
        video {
          outline: none;
          width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
};

export default LukoTV;
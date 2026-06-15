// src/pages/LukoPodcast.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  HiOutlineX,
  HiOutlinePause
} from 'react-icons/hi';

// ایمپورت تصاویر پادکست
import OwlIcon from '../icons/icon45.png';
import PodcastCover1 from '../icons/icon50.png';
import PodcastCover2 from '../icons/icon51.png';
import PodcastCover3 from '../icons/icon52.png';
import PodcastCover4 from '../icons/icon53.png';
import Icon3 from '../icons/icon3.png';

const LukoPodcast = () => {
  const navigate = useNavigate();
  const { user, userXP, addXP } = useUser();
  const [activeTab, setActiveTab] = useState('لوکو پادکست');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeFilters, setActiveFilters] = useState(['داستانی', 'آموزشی', 'انگیزشی']);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentPodcast, setCurrentPodcast] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [pressedItem, setPressedItem] = useState(null);
  const audioRef = React.useRef(null);

  // پالت رنگی مخصوص پادکست (نارنجی/قهوه‌ای - مثل جغد)
  const colors = {
    primary: '#C57948',
    primaryDark: '#A86238',
    primaryLight: '#FBE7CC',
    bg: '#FDF8F0',
    cardBg: '#FFFFFF',
    text: '#5D4037',
    textSecondary: '#8D6E63',
    navBg: '#FFFFFF',
    iconBg: '#FBE7CC',
    xpBg: '#FFE0B2',
    playerBg: '#5D4037',
    border: '#E8D5B7'
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;

  // داده‌های پادکست
  const podcastItems = useMemo(() => [
    { id: 1, title: 'داستان شب بخیر', category: 'داستانی', duration: '12:30', xp: 25, audioUrl: '/audio/story1.mp3', cover: PodcastCover1, description: 'داستانی آرامش‌بخش برای قبل از خواب' },
    { id: 2, title: 'ماجراجویی در جنگل', category: 'داستانی', duration: '15:45', xp: 30, audioUrl: '/audio/story2.mp3', cover: PodcastCover2, description: 'قصه‌ای درباره کشف طبیعت' },
    { id: 3, title: 'ریاضی شیرین', category: 'آموزشی', duration: '10:20', xp: 35, audioUrl: '/audio/edu1.mp3', cover: PodcastCover3, description: 'یادگیری ریاضی با داستان' },
    { id: 4, title: 'انگیزه برای فردا', category: 'انگیزشی', duration: '08:15', xp: 20, audioUrl: '/audio/motivation1.mp3', cover: PodcastCover4, description: 'افزایش انگیزه برای موفقیت' },
    { id: 5, title: 'علوم جذاب', category: 'آموزشی', duration: '18:00', xp: 40, audioUrl: '/audio/science1.mp3', cover: PodcastCover2, description: 'کشف دنیای علم' },
    { id: 6, title: 'قصه‌های کهن', category: 'داستانی', duration: '20:15', xp: 35, audioUrl: '/audio/story3.mp3', cover: PodcastCover1, description: 'قصه‌های قدیمی ایرانی' }
  ], []);

  const filterButtons = useMemo(() => [
    { id: 'داستانی', title: 'داستانی', color: colors.primary },
    { id: 'آموزشی', title: 'آموزشی', color: colors.primaryLight },
    { id: 'انگیزشی', title: 'انگیزشی', color: colors.primaryDark }
  ], []);

  const filteredPodcasts = useMemo(() => {
    if (searchQuery) {
      return podcastItems.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.includes(searchQuery)
      );
    }
    return podcastItems.filter(p => activeFilters.includes(p.category));
  }, [podcastItems, searchQuery, activeFilters]);

  const toggleFilter = useCallback((filterId) => {
    setActiveFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(f => f !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  }, []);

  const handlePlayPodcast = (podcast) => {
    setCurrentPodcast(podcast);
    setIsPlayerOpen(true);
    setIsPlaying(true);
    setAudioProgress(0);
    setAudioDuration(0);
  };

  const handleClosePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlayerOpen(false);
    setCurrentPodcast(null);
    setIsPlaying(false);
    setAudioProgress(0);
  };

  const handleAudioEnded = () => {
    if (currentPodcast && !currentPodcast.played) {
      addXP(currentPodcast.xp);
      currentPodcast.played = true;
      alert(`🎉 ${currentPodcast.xp} XP دریافت کردی!`);
    }
    setIsPlaying(false);
    setAudioProgress(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleClick = (path, id) => {
    setPressedItem(id);
    setTimeout(() => {
      setPressedItem(null);
      navigate(path);
    }, 100);
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
      
      {/* هدر مثل لوکو تلویزیون - مرتب */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: colors.cardBg,
        padding: isMobile ? '12px 16px' : '16px 24px',
        borderBottom: `1px solid ${colors.primaryLight}`,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: isDesktop ? '1200px' : '100%',
          margin: '0 auto'
        }}>
          <div
            onClick={() => handleClick('/profile', 'profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'transform 0.05s linear',
              transform: pressedItem === 'profile' ? 'scale(0.97)' : 'scale(1)'
            }}
            onMouseDown={() => setPressedItem('profile')}
            onMouseUp={() => setTimeout(() => setPressedItem(null), 100)}
            onMouseLeave={() => setPressedItem(null)}
          >
            <div style={{
              width: isMobile ? '44px' : '50px',
              height: isMobile ? '44px' : '50px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <HiOutlineUser size={isMobile ? 24 : 28} color="white" />
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: '600', color: colors.text }}>{displayUsername}</p>
              <p style={{ fontSize: '10px', color: colors.primary, fontWeight: '500' }}>{userXP} XP</p>
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: colors.text }}>
              لوکو پادکست
            </h1>
            <p style={{ fontSize: '9px', color: colors.textSecondary, textAlign: 'center' }}>
              {new Date().toLocaleDateString('fa-IR')}
            </p>
          </div>

          {/* <div
            onClick={() => handleClick('/profile', 'profile-icon')}
            style={{
              width: isMobile ? '44px' : '50px',
              height: isMobile ? '44px' : '50px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden'
            }}
          >
            <img src={OwlIcon} alt="podcast" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
          </div> */}
        </div>
      </div>

      {/* محتوای اصلی */}
      <div style={{
        maxWidth: isDesktop ? '1200px' : '100%',
        margin: '0 auto',
        padding: isMobile ? '20px 16px' : '32px 24px'
      }}>
        
        {/* نوار جستجو - زیر هدر، بالای فیلترها */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: colors.iconBg,
            borderRadius: '40px',
            padding: '8px 16px',
            width: isMobile ? '100%' : '350px',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}>
            <HiOutlineSearch size={18} color={colors.textSecondary} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی پادکست..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                padding: '8px 12px',
                fontSize: '14px',
                outline: 'none',
                color: colors.text,
                direction: 'rtl'
              }}
            />
          </div>
        </div>

        {/* دکمه‌های فیلتر */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => toggleFilter(btn.id)}
              style={{
                padding: isMobile ? '8px 20px' : '10px 28px',
                borderRadius: '30px',
                border: 'none',
                background: activeFilters.includes(btn.id) ? btn.color : '#E8E0D5',
                color: activeFilters.includes(btn.id) ? 'white' : colors.textSecondary,
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {btn.title}
            </button>
          ))}
        </div>

        {/* نتایج جستجو */}
        {searchQuery && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: colors.textSecondary }}>
              {filteredPodcasts.length} نتیجه برای "{searchQuery}"
            </p>
          </div>
        )}

        {/* لیست پادکست‌ها */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {filteredPodcasts.map((podcast) => (
            <div
              key={podcast.id}
              onClick={() => handlePlayPodcast(podcast)}
              style={{
                backgroundColor: colors.cardBg,
                borderRadius: '20px',
                padding: '16px',
                display: 'flex',
                gap: '16px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: `1px solid ${colors.border}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}
            >
              <img 
                src={podcast.cover} 
                alt={podcast.title}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '16px',
                  objectFit: 'cover'
                }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: colors.text, marginBottom: '4px' }}>
                  {podcast.title}
                </h3>
                <p style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '6px' }}>
                  {podcast.category}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HiOutlineClock size={12} color={colors.textSecondary} />
                    <span style={{ fontSize: '11px', color: colors.textSecondary }}>{podcast.duration}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <img src={Icon3} alt="xp" style={{ width: '14px', height: '14px' }} />
                    <span style={{ fontSize: '11px', fontWeight: '600', color: colors.primary }}>+{podcast.xp}</span>
                  </div>
                </div>
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HiOutlinePlay size={20} color="white" />
              </div>
            </div>
          ))}
        </div>

        {filteredPodcasts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: colors.textSecondary
          }}>
            <img src={OwlIcon} alt="owl" style={{ width: '80px', opacity: 0.5 }} />
            <p style={{ marginTop: '16px' }}>پادکستی با این دسته‌بندی پیدا نشد</p>
          </div>
        )}
      </div>

      {/* پلیر پادکست */}
      {isPlayerOpen && currentPodcast && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.playerBg,
          borderRadius: '28px 28px 0 0',
          padding: '20px',
          zIndex: 200,
          animation: 'slideUp 0.3s ease',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.2)'
        }}>
          <button
            onClick={handleClosePlayer}
            style={{
              position: 'absolute',
              top: '16px',
              left: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <HiOutlineX size={18} color="white" />
          </button>

          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img 
              src={OwlIcon} 
              alt="owl"
              style={{
                width: '50px',
                height: '50px',
                marginBottom: '8px'
              }}
            />
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>
              {currentPodcast.title}
            </h4>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
              {currentPodcast.category}
            </p>
          </div>

          {/* نوار پیشرفت */}
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: '2px',
            marginBottom: '8px',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            if (audioRef.current) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              audioRef.current.currentTime = percentage * audioDuration;
            }
          }}>
            <div style={{
              width: `${audioProgress}%`,
              height: '100%',
              backgroundColor: colors.primaryLight,
              borderRadius: '2px',
              transition: 'width 0.1s linear'
            }} />
          </div>

          {/* زمان */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '10px',
            marginBottom: '16px'
          }}>
            <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>

          {/* دکمه‌های کنترل */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                opacity: 0.8
              }}
            >
              -10
            </button>
            <button
              onClick={() => {
                if (audioRef.current) {
                  if (isPlaying) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  } else {
                    audioRef.current.play();
                    setIsPlaying(true);
                  }
                }
              }}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              {isPlaying ? (
                <HiOutlinePause size={24} color={colors.playerBg} />
              ) : (
                <HiOutlinePlay size={24} color={colors.playerBg} />
              )}
            </button>
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                opacity: 0.8
              }}
            >
              +10
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <img src={Icon3} alt="xp" style={{ width: '14px', height: '14px' }} />
            <span style={{ fontSize: '10px', color: colors.primaryLight }}>
              پس از اتمام +{currentPodcast.xp} XP
            </span>
          </div>

          <audio
            ref={audioRef}
            src={currentPodcast.audioUrl}
            onEnded={handleAudioEnded}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
      )}

      {/* نویگیشن بار */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        left: 0,
        background: colors.navBg,
        boxShadow: '0 -2px 20px rgba(0,0,0,0.08)',
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
              <IconComponent size={isMobile ? 20 : 22} color={isActive ? colors.primary : '#999'} />
              <span style={{ fontSize: isMobile ? '9px' : '10px', color: isActive ? colors.primary : '#999', fontWeight: isActive ? '600' : '400' }}>
                {item.name}
              </span>
              {isActive && <div style={{ width: '4px', height: '4px', borderRadius: '2px', background: colors.primary, marginTop: '2px' }} />}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        ::-webkit-scrollbar { display: none; }
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        button, div[onClick] { cursor: pointer; }
        input { user-select: text; }
      `}</style>
    </div>
  );
};

export default LukoPodcast;
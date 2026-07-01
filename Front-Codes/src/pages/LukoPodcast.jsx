// LukoPodcast.jsx — نسخه‌ی بازطراحی‌شده (ظاهر تمیز و یکدست)
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import {
  HiOutlineUser, HiOutlinePlay, HiOutlineClock, HiOutlineHome, HiOutlineFire,
  HiOutlineHeart, HiOutlineSearch, HiOutlineX, HiOutlinePause,
} from 'react-icons/hi';

import Header from '../components/common/Header';
import OwlIcon from '../icons/icon45.png';
import PodcastCover1 from '../icons/icon50.png';
import PodcastCover2 from '../icons/icon51.png';
import PodcastCover3 from '../icons/icon52.png';
import PodcastCover4 from '../icons/icon53.png';
import Icon3 from '../icons/icon3.png';

const colors = {
  primary: '#C57948', primaryDark: '#A86238', primaryLight: '#FBE7CC',
  bg: '#FDF8F0', cardBg: '#FFFFFF', text: '#5D4037', textSecondary: '#8D6E63',
  navBg: '#FFFFFF', iconBg: '#FBE7CC', xpBg: '#FFE0B2', playerBg: '#5D4037', border: '#EFE2CD',
};

const LukoPodcast = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [activeTab] = useState('لوکو پادکست');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState(['داستانی', 'آموزشی', 'انگیزشی']);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentPodcast, setCurrentPodcast] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [userXP, setUserXP] = useState(() => parseInt(localStorage.getItem('luko_user_xp'), 10) || 0);
  const audioRef = useRef(null);

  const isMobile = windowWidth < 768;

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // افزودن امتیاز به‌صورت امن (بدون وابستگی به context)
  const addXP = useCallback((amount) => {
    setUserXP((prev) => {
      const next = prev + (amount || 0);
      localStorage.setItem('luko_user_xp', String(next));
      return next;
    });
  }, []);

  const podcastItems = useMemo(() => [
    { id: 1, title: 'داستان شب بخیر', category: 'داستانی', duration: '12:30', xp: 25, audioUrl: '/audio/story1.mp3', cover: PodcastCover1, description: 'داستانی آرامش‌بخش برای قبل از خواب' },
    { id: 2, title: 'ماجراجویی در جنگل', category: 'داستانی', duration: '15:45', xp: 30, audioUrl: '/audio/story2.mp3', cover: PodcastCover2, description: 'قصه‌ای درباره کشف طبیعت' },
    { id: 3, title: 'ریاضی شیرین', category: 'آموزشی', duration: '10:20', xp: 35, audioUrl: '/audio/edu1.mp3', cover: PodcastCover3, description: 'یادگیری ریاضی با داستان' },
    { id: 4, title: 'انگیزه برای فردا', category: 'انگیزشی', duration: '08:15', xp: 20, audioUrl: '/audio/motivation1.mp3', cover: PodcastCover4, description: 'افزایش انگیزه برای موفقیت' },
    { id: 5, title: 'علوم جذاب', category: 'آموزشی', duration: '18:00', xp: 40, audioUrl: '/audio/science1.mp3', cover: PodcastCover2, description: 'کشف دنیای علم' },
    { id: 6, title: 'قصه‌های کهن', category: 'داستانی', duration: '20:15', xp: 35, audioUrl: '/audio/story3.mp3', cover: PodcastCover1, description: 'قصه‌های قدیمی ایرانی' },
  ], []);

  const filterButtons = useMemo(() => [
    { id: 'داستانی', title: 'داستانی' },
    { id: 'آموزشی', title: 'آموزشی' },
    { id: 'انگیزشی', title: 'انگیزشی' },
  ], []);

  const filteredPodcasts = useMemo(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return podcastItems.filter((p) => p.title.toLowerCase().includes(q) || p.category.includes(searchQuery));
    }
    return podcastItems.filter((p) => activeFilters.includes(p.category));
  }, [podcastItems, searchQuery, activeFilters]);

  const toggleFilter = useCallback((filterId) => {
    setActiveFilters((prev) => (prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]));
  }, []);

  const handlePlayPodcast = (podcast) => { setCurrentPodcast(podcast); setIsPlayerOpen(true); setIsPlaying(true); setAudioProgress(0); setAudioDuration(0); };
  const handleClosePlayer = () => { if (audioRef.current) audioRef.current.pause(); setIsPlayerOpen(false); setCurrentPodcast(null); setIsPlaying(false); setAudioProgress(0); };
  const handleAudioEnded = () => { if (currentPodcast && !currentPodcast.played) { addXP(currentPodcast.xp); currentPodcast.played = true; } setIsPlaying(false); setAudioProgress(0); };
  const handleTimeUpdate = () => { if (audioRef.current?.duration) setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100); };
  const handleLoadedMetadata = () => { if (audioRef.current) setAudioDuration(audioRef.current.duration); };
  const formatTime = (seconds) => { if (!seconds || isNaN(seconds)) return '0:00'; const m = Math.floor(seconds / 60); const s = Math.floor(seconds % 60); return `${m}:${s < 10 ? '0' + s : s}`; };

  const navItems = [
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Shoor', 'Shoor Rounded', sans-serif", direction: 'rtl', paddingBottom: '90px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 'min(600px, 100%)' }}>

        {/* هدر یکپارچه با بج XP */}
        <Header
          title="لوکو پادکست"
          user={user}
          showGreeting={false}
          onProfileClick={() => navigate('/profile')}
          rightAction={
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: colors.xpBg, padding: '7px 13px', borderRadius: '999px' }}>
              <img src={Icon3} alt="xp" style={{ width: '15px', height: '15px' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: colors.text }}>{userXP} XP</span>
            </div>
          }
        />

        <div style={{ padding: '4px clamp(14px, 4vw, 20px) 0' }}>

          {/* سرچ‌بار اختصاصی و تمام‌عرض */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: colors.cardBg, borderRadius: '16px', padding: '12px 16px', border: `1px solid ${colors.border}`, boxShadow: '0 3px 10px rgba(0,0,0,0.04)', marginBottom: '18px' }}>
            <HiOutlineSearch size={20} color={colors.textSecondary} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی پادکست..."
              style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '14px', outline: 'none', color: colors.text, direction: 'rtl', fontFamily: 'inherit' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: colors.textSecondary }}>
                <HiOutlineX size={18} />
              </button>
            )}
          </div>

          {/* فیلترهای دسته‌بندی */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
            {filterButtons.map((btn) => {
              const active = activeFilters.includes(btn.id);
              return (
                <button
                  key={btn.id}
                  onClick={() => toggleFilter(btn.id)}
                  style={{
                    flexShrink: 0,
                    padding: '9px 22px',
                    borderRadius: '999px',
                    border: `1.5px solid ${active ? colors.primary : colors.border}`,
                    background: active ? colors.primary : colors.cardBg,
                    color: active ? '#fff' : colors.textSecondary,
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  {btn.title}
                </button>
              );
            })}
          </div>

          {/* عنوان بخش */}
          <h2 style={{ color: colors.text, marginBottom: '14px' }}>جدیدترین پادکست‌ها</h2>

          {/* لیست پادکست‌ها */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {filteredPodcasts.map((podcast) => (
              <div
                key={podcast.id}
                onClick={() => handlePlayPodcast(podcast)}
                style={{
                  background: colors.cardBg,
                  borderRadius: '20px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: '0 3px 12px rgba(0,0,0,0.05)',
                  border: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(197,121,72,0.14)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.05)'; }}
              >
                <img src={podcast.cover} alt={podcast.title} style={{ width: 'clamp(60px, 17vw, 72px)', height: 'clamp(60px, 17vw, 72px)', borderRadius: '16px', objectFit: 'cover', flexShrink: 0 }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ color: colors.text, marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{podcast.title}</h3>
                  <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, color: colors.primary, background: colors.primaryLight, padding: '3px 10px', borderRadius: '999px', marginBottom: '8px' }}>{podcast.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: colors.textSecondary }}>
                      <HiOutlineClock size={13} /> {podcast.duration}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: colors.primary }}>
                      <img src={Icon3} alt="xp" style={{ width: '13px', height: '13px' }} /> +{podcast.xp}
                    </span>
                  </div>
                </div>

                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(197,121,72,0.35)' }}>
                  <HiOutlinePlay size={20} color="#fff" style={{ marginRight: '-2px' }} />
                </div>
              </div>
            ))}
          </div>

          {filteredPodcasts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textSecondary }}>
              <img src={OwlIcon} alt="owl" style={{ width: '80px', opacity: 0.5 }} />
              <p style={{ marginTop: '16px', fontSize: '14px' }}>پادکستی با این دسته‌بندی پیدا نشد</p>
            </div>
          )}
        </div>
      </div>

      {/* پلیر پایین‌صفحه */}
      {isPlayerOpen && currentPodcast && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 'min(600px, 100%)', background: colors.playerBg, borderRadius: '28px 28px 0 0', padding: '22px 20px 24px', zIndex: 200, animation: 'slideUp 0.3s ease', boxShadow: '0 -10px 30px rgba(0,0,0,0.25)' }}>
          <button onClick={handleClosePlayer} style={{ position: 'absolute', top: '16px', left: '18px', background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <HiOutlineX size={18} color="#fff" />
          </button>

          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <img src={currentPodcast.cover} alt={currentPodcast.title} style={{ width: '72px', height: '72px', borderRadius: '18px', objectFit: 'cover', marginBottom: '10px', boxShadow: '0 6px 16px rgba(0,0,0,0.3)' }} />
            <h4 style={{ color: '#fff', marginBottom: '4px' }}>{currentPodcast.title}</h4>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{currentPodcast.category}</p>
          </div>

          <div
            style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.25)', borderRadius: '3px', marginBottom: '8px', cursor: 'pointer' }}
            onClick={(e) => { if (audioRef.current && audioDuration) { const rect = e.currentTarget.getBoundingClientRect(); audioRef.current.currentTime = ((rect.right - e.clientX) / rect.width) * audioDuration; } }}
          >
            <div style={{ width: `${audioProgress}%`, height: '100%', background: colors.primaryLight, borderRadius: '3px', transition: 'width 0.1s linear' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '18px' }}>
            <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px' }}>
            <button onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10); }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 700, opacity: 0.85 }}>۱۰− </button>
            <button
              onClick={() => { if (audioRef.current) { if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } else { audioRef.current.play().catch(() => {}); setIsPlaying(true); } } }}
              style={{ width: '58px', height: '58px', borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}
            >
              {isPlaying ? <HiOutlinePause size={26} color={colors.playerBg} /> : <HiOutlinePlay size={26} color={colors.playerBg} style={{ marginRight: '-2px' }} />}
            </button>
            <button onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10); }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 700, opacity: 0.85 }}>۱۰+</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <img src={Icon3} alt="xp" style={{ width: '14px', height: '14px' }} />
            <span style={{ fontSize: '11px', color: colors.primaryLight }}>پس از اتمام +{currentPodcast.xp} XP</span>
          </div>

          <audio ref={audioRef} src={currentPodcast.audioUrl} onEnded={handleAudioEnded} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
        </div>
      )}

      {/* منوی پایین استاندارد (هماهنگ با بقیه‌ی صفحات) */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 'min(600px, 100%)', background: colors.navBg, boxShadow: '0 -2px 20px rgba(0,0,0,0.08)', borderRadius: '28px 28px 0 0', padding: isMobile ? '10px 12px' : '12px 20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: isPlayerOpen ? 150 : 100 }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} onClick={() => navigate(item.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <IconComponent size={isMobile ? 20 : 22} color={isActive ? colors.primary : '#999'} />
              <span style={{ fontSize: isMobile ? '9px' : '10px', color: isActive ? colors.primary : '#999', fontWeight: isActive ? '600' : '400' }}>{item.name}</span>
              {isActive && <div style={{ width: '4px', height: '4px', borderRadius: '2px', background: colors.primary, marginTop: '2px' }} />}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default LukoPodcast;

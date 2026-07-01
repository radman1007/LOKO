// LukoTV.jsx — بازطراحی هماهنگ با صفحه اصلی (تم روشن سبزآبی پریمیوم)
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import {
  HiOutlineUser, HiOutlinePlay, HiOutlineClock, HiOutlineHome, HiOutlineFire,
  HiOutlineHeart, HiOutlineSearch, HiOutlineX, HiOutlineChevronLeft, HiOutlineCheckCircle,
} from 'react-icons/hi';

import Header from '../components/common/Header';
import Banner36 from '../icons/icon36.png'; import Banner37 from '../icons/icon37.png';
import Banner38 from '../icons/icon38.png'; import Banner39 from '../icons/icon39.png';
import Banner40 from '../icons/icon40.png'; import Banner41 from '../icons/icon41.png';
import Icon3 from '../icons/icon3.png';

import VideoCapitan from '../video/capitan.mp4';
import VideoShabihsaz from '../video/shabihsaz.mp4';
import VideoVadeakhar from '../video/vadeakhar.mp4';

import { getTodayVideoMission, hasWatchedVideoToday as checkVideoWatchedToday, registerVideoWatch } from '../data/dailyMissionsData';

const colors = {
  bg: '#EEF4F3', cardBg: '#FFFFFF', primary: '#4DB6AC', primaryDark: '#2E9E93', primaryLight: '#E0F2F1',
  text: '#37474F', textSecondary: '#78909C', textSoft: '#78909C', navBg: '#FFFFFF',
  coin: '#F6B100', border: '#E5EBEA',
  purple: '#BA68C8', yellow: '#F6B100', red: '#EC6E8A', orange: '#FB8C00',
};

const LukoTV = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const isMobile = true;

  const [currentXP, setCurrentXP] = useState(() => parseInt(localStorage.getItem('luko_user_xp'), 10) || 0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [activeTab, setActiveTab] = useState('لوکو تلویزیون');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const [activeFilters, setActiveFilters] = useState(['تماشا شده', 'ریاضی', 'فارسی', 'پیشنهادی']);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoSrc, setSelectedVideoSrc] = useState('');
  const [selectedVideoTitle, setSelectedVideoTitle] = useState('');
  const [selectedVideoXp, setSelectedVideoXp] = useState(0);
  const [todayVideoMission, setTodayVideoMission] = useState(null);
  const [videoRef, setVideoRef] = useState(null);

  const autoScrollInterval = useRef(null);

  useEffect(() => { const videoMission = getTodayVideoMission(); setTodayVideoMission(videoMission); }, []);

  const saveVideoProgress = (videoTitle, currentTime, duration) => { if (!duration) return; const progressPercent = (currentTime / duration) * 100; localStorage.setItem(`video_progress_${videoTitle}`, Math.floor(progressPercent)); localStorage.setItem(`video_time_${videoTitle}`, currentTime); };

  const banners = useMemo(() => [ { id: 1, src: Banner36, title: 'سفر به اعماق کهکشان', subject: 'علوم پایه چهارم', duration: '15:30', xp: 50, videoTitle: 'سفر به اعماق کهکشان' }, { id: 2, src: Banner37, title: 'ماجراجویی‌های ریاضی', subject: 'ریاضی پایه سوم', duration: '12:15', xp: 45, videoTitle: 'ماجراجویی‌های ریاضی' }, { id: 3, src: Banner38, title: 'قصه‌های شنیدنی فارسی', subject: 'فارسی پایه چهارم', duration: '18:45', xp: 40, videoTitle: 'قصه‌های شنیدنی فارسی' }, { id: 4, src: Banner39, title: 'ورزش و مهارت', subject: 'ورزش پایه دوم', duration: '10:00', xp: 35, videoTitle: 'ورزش و مهارت' }, { id: 5, src: Banner40, title: 'داستان و سرگرمی', subject: 'داستان پایه اول', duration: '14:20', xp: 30, videoTitle: 'داستان و سرگرمی' } ], []);
  const scrollBanners = useMemo(() => [ { id: 1, src: Banner41, title: 'بنر ویژه ۱' }, { id: 2, src: Banner41, title: 'بنر ویژه ۲' }, { id: 3, src: Banner41, title: 'بنر ویژه ۳' } ], []);

  const videoItems = useMemo(() => [ { id: 1, title: 'کاپیتان', image: Banner36, duration: '05:30', xp: 30, videoTitle: 'کاپیتان', isVideo: true, video: VideoCapitan }, { id: 2, title: 'شبیه ساز', image: Banner37, duration: '07:15', xp: 35, videoTitle: 'شبیه ساز', isVideo: true, video: VideoShabihsaz }, { id: 3, title: 'واده آخر', image: Banner38, duration: '06:45', xp: 32, videoTitle: 'واده آخر', isVideo: true, video: VideoVadeakhar } ], []);

  const continueWatching = useMemo(() => { return videoItems.filter(video => { const progress = localStorage.getItem(`video_progress_${video.videoTitle}`); return progress && parseInt(progress, 10) > 0 && parseInt(progress, 10) < 100; }).map(video => ({ ...video, progress: parseInt(localStorage.getItem(`video_progress_${video.videoTitle}`) || '0', 10), isVideo: true })); }, [videoItems, refreshKey]);
  const mathAdventures = useMemo(() => [ { id: 1, title: 'ریاضی پایه سوم', image: Banner37, duration: '12:15', xp: 45, videoTitle: 'ریاضی پایه سوم' }, { id: 2, title: 'ریاضی پایه چهارم', image: Banner36, duration: '15:30', xp: 50, videoTitle: 'ریاضی پایه چهارم' }, { id: 3, title: 'ریاضی پایه پنجم', image: Banner38, duration: '18:45', xp: 55, videoTitle: 'ریاضی پایه پنجم' } ], []);
  const persianStories = useMemo(() => [ { id: 1, title: 'کاپیتان', image: Banner36, duration: '05:30', xp: 30, isVideo: true, videoTitle: 'کاپیتان', video: VideoCapitan }, { id: 2, title: 'شبیه ساز', image: Banner37, duration: '07:15', xp: 35, isVideo: true, videoTitle: 'شبیه ساز', video: VideoShabihsaz }, { id: 3, title: 'واده آخر', image: Banner38, duration: '06:45', xp: 32, isVideo: true, videoTitle: 'واده آخر', video: VideoVadeakhar }, { id: 4, title: 'شیر و موش', image: Banner38, duration: '8:30', xp: 30, videoTitle: 'شیر و موش' } ], []);
  const smartSuggestions = useMemo(() => [ { id: 1, title: 'کاپیتان', image: Banner36, duration: '05:30', xp: 50, isVideo: true, videoTitle: 'کاپیتان', video: VideoCapitan }, { id: 2, title: 'شبیه ساز', image: Banner37, duration: '07:15', xp: 55, isVideo: true, videoTitle: 'شبیه ساز', video: VideoShabihsaz }, { id: 3, title: 'واده آخر', image: Banner38, duration: '06:45', xp: 52, isVideo: true, videoTitle: 'واده آخر', video: VideoVadeakhar }, { id: 4, title: 'ریاضی پیشرفته', image: Banner37, duration: '18:30', xp: 80, videoTitle: 'ریاضی پیشرفته' } ], []);

  const allSections = useMemo(() => [ { id: 'تماشا شده', title: 'ادامه تماشا', data: continueWatching, color: colors.purple, showProgress: true }, { id: 'ریاضی', title: 'ماجراجویی‌های ریاضی', data: mathAdventures, color: colors.yellow, showProgress: false }, { id: 'فارسی', title: 'قصه‌های فارسی', data: persianStories, color: colors.red, showProgress: false }, { id: 'پیشنهادی', title: 'پیشنهاد هوشمند لوکو', data: smartSuggestions, color: colors.primary, showProgress: false } ], [continueWatching, mathAdventures, persianStories, smartSuggestions]);
  const filteredSections = allSections.filter(section => activeFilters.includes(section.id));
  const filterButtons = useMemo(() => [ { id: 'تماشا شده', title: 'ادامه تماشا', color: colors.purple }, { id: 'ریاضی', title: 'ماجراجویی‌های ریاضی', color: colors.yellow }, { id: 'فارسی', title: 'قصه‌های فارسی', color: colors.red }, { id: 'پیشنهادی', title: 'پیشنهاد هوشمند لوکو', color: colors.primary } ], []);

  const navItems = useMemo(() => [ { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' }, { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' }, { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' }, { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' }, { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' } ], []);

  const closeVideoModal = useCallback(() => { if (videoRef) { const currentTime = videoRef.currentTime; const duration = videoRef.duration; if (duration && currentTime < duration - 1) { saveVideoProgress(selectedVideoTitle, currentTime, duration); } } setIsVideoModalOpen(false); setSelectedVideoSrc(''); setSelectedVideoTitle(''); setSelectedVideoXp(0); setVideoRef(null); }, [videoRef, selectedVideoTitle]);

  const handleVideoEnded = useCallback(() => { const success = registerVideoWatch(selectedVideoTitle, selectedVideoXp); if (success) { const newXP = (parseInt(localStorage.getItem('luko_user_xp'), 10) || 0) + selectedVideoXp; localStorage.setItem('luko_user_xp', newXP.toString()); setCurrentXP(newXP); localStorage.removeItem(`video_progress_${selectedVideoTitle}`); localStorage.removeItem(`video_time_${selectedVideoTitle}`); alert(`${selectedVideoXp} XP دریافت کردی!`); closeVideoModal(); setTimeout(() => { setRefreshKey(prev => prev + 1); }, 300); } else { alert('شما قبلاً این ویدیو را امروز تماشا کرده‌اید!'); closeVideoModal(); } }, [selectedVideoTitle, selectedVideoXp, closeVideoModal]);

  const handlePlayVideo = useCallback((videoSrc, videoTitle, xpReward = 30) => { setSelectedVideoSrc(videoSrc); setSelectedVideoTitle(videoTitle); setSelectedVideoXp(xpReward); setIsVideoModalOpen(true); }, []);

  useEffect(() => { const timer = setTimeout(() => setIsFirstLoad(false), 500); return () => clearTimeout(timer); }, []);
  useEffect(() => { if (!isFirstLoad) { if (autoScrollInterval.current) clearInterval(autoScrollInterval.current); autoScrollInterval.current = setInterval(() => { setCurrentBanner((prev) => (prev + 1) % banners.length); }, 5000); } return () => { if (autoScrollInterval.current) clearInterval(autoScrollInterval.current); }; }, [isFirstLoad, banners.length]);

  useEffect(() => { if (!isFirstLoad && searchQuery.length > 0) { const allVideos = [...continueWatching, ...mathAdventures, ...persianStories, ...smartSuggestions]; const results = allVideos.filter(video => video.title.toLowerCase().includes(searchQuery.toLowerCase())); setFilteredData(results); } else if (!isFirstLoad) { setFilteredData(null); } }, [searchQuery, isFirstLoad, continueWatching, mathAdventures, persianStories, smartSuggestions]);

  const toggleFilter = useCallback((filterId) => { setActiveFilters(prev => prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]); }, []);
  const handleTouchStart = useCallback((e) => { if (autoScrollInterval.current) clearInterval(autoScrollInterval.current); setTouchStart(e.touches[0].clientX); setTouchEnd(null); }, []);
  const handleTouchMove = useCallback((e) => setTouchEnd(e.touches[0].clientX), []);
  const handleTouchEnd = useCallback(() => { if (!touchStart || !touchEnd) return; const diff = touchStart - touchEnd; if (Math.abs(diff) > 50) { setCurrentBanner((prev) => (diff > 0 ? (prev + 1) : (prev - 1 + banners.length)) % banners.length); } setTouchStart(null); setTouchEnd(null); if (autoScrollInterval.current) clearInterval(autoScrollInterval.current); autoScrollInterval.current = setInterval(() => setCurrentBanner((prev) => (prev + 1) % banners.length), 5000); }, [touchStart, touchEnd, banners.length]);

  const currentBannerData = banners[currentBanner];

  // ─── کارت ویدیو (تم روشن) ───
  const VideoCard = useCallback(({ item, showProgress = false, isVideo = false }) => {
    const savedProgress = localStorage.getItem(`video_progress_${item.videoTitle || item.title}`);
    const displayProgress = showProgress ? (item.progress || parseInt(savedProgress, 10) || 0) : 0;
    const alreadyWatched = checkVideoWatchedToday(item.videoTitle || item.title);
    const playable = isVideo && item.video;
    const handleCardClick = () => { if (playable) { handlePlayVideo(item.video, item.videoTitle || item.title, item.xp); } };
    return (
      <div
        onClick={handleCardClick}
        role={playable ? 'button' : undefined}
        tabIndex={playable ? 0 : undefined}
        onKeyDown={playable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } } : undefined}
        style={{ minWidth: 'clamp(150px, 42vw, 190px)', width: 'clamp(150px, 42vw, 190px)', cursor: playable ? 'pointer' : 'default', transition: 'transform 0.18s ease, box-shadow 0.18s ease', borderRadius: 18, overflow: 'hidden', background: colors.cardBg, boxShadow: '0 6px 16px rgba(0,0,0,0.06)', border: `1px solid ${colors.border}`, opacity: alreadyWatched ? 0.72 : 1, flexShrink: 0, outline: 'none' }}
        onMouseEnter={(e) => { if (playable && !alreadyWatched) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.10)'; } }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; }}
      >
        <div style={{ position: 'relative', width: '100%', height: 'clamp(104px, 29vw, 132px)', background: colors.primaryLight, overflow: 'hidden' }}>
          {item.image
            ? <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HiOutlinePlay size={40} color="rgba(0,0,0,0.2)" /></div>}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.32) 100%)' }} />

          {playable && !alreadyWatched && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'clamp(38px, 11vw, 48px)', height: 'clamp(38px, 11vw, 48px)', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
              <HiOutlinePlay size={22} color={colors.primary} style={{ marginRight: -2 }} />
            </div>
          )}

          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', borderRadius: 999, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <HiOutlineClock size={11} color="#fff" /><span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{item.duration}</span>
          </div>

          {alreadyWatched && (
            <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(76,175,80,0.92)', borderRadius: 999, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
              <HiOutlineCheckCircle size={12} color="#fff" /><span style={{ fontSize: 9.5, color: '#fff', fontWeight: 700 }}>دیده شد</span>
            </div>
          )}

          {showProgress && displayProgress > 0 && displayProgress < 100 && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.4)' }}>
              <div style={{ width: `${displayProgress}%`, height: '100%', background: colors.primary }} />
            </div>
          )}
        </div>

        <div style={{ padding: '10px 12px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{item.title}</p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11, fontWeight: 700, color: colors.primaryDark, background: colors.primaryLight, padding: '3px 9px', borderRadius: 999 }}>⭐ +{item.xp} XP</span>
        </div>
      </div>
    );
  }, [handlePlayVideo]);

  const sectionHead = (title, color) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 2px 12px' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}66` }} />
      <h2 style={{ color: colors.text, margin: 0 }}>{title}</h2>
    </div>
  );

  if (isFirstLoad) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Shoor', 'Shoor Rounded', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: `3px solid ${colors.primaryLight}`, borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto' }} />
          <p style={{ color: colors.textSecondary, marginTop: 16, fontWeight: 600 }}>در حال بارگذاری...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Shoor', 'Shoor Rounded', sans-serif", direction: 'rtl', paddingBottom: '90px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 'min(600px, 100%)' }}>

        <Header
          title="لوکو تلویزیون"
          user={user}
          showGreeting={false}
          onProfileClick={() => navigate('/profile')}
          rightAction={
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(246,177,0,0.16)', padding: '8px 14px', borderRadius: 999, boxShadow: '0 2px 8px rgba(246,177,0,0.15)' }}>
              <span style={{ fontSize: 15 }} aria-hidden>⭐</span>
              <span style={{ fontWeight: 700, color: colors.text, fontSize: 14 }}>{currentXP}</span>
            </div>
          }
        />

        <div style={{ padding: '4px clamp(12px, 3vw, 16px) 20px' }}>

          {/* سرچ‌بار */}
          <div className="loko-anim" style={{ display: 'flex', alignItems: 'center', gap: 8, background: colors.cardBg, borderRadius: 16, padding: '12px 16px', border: `1px solid ${colors.border}`, boxShadow: '0 3px 10px rgba(0,0,0,0.04)', marginBottom: 18 }}>
            <HiOutlineSearch size={20} color={colors.textSecondary} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="جستجوی ویدیو..." style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 14, outline: 'none', color: colors.text, direction: 'rtl', fontFamily: 'inherit' }} />
            {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: colors.textSecondary }}><HiOutlineX size={18} /></button>}
          </div>

          {/* نتایج جستجو */}
          {filteredData && (
            <div style={{ marginBottom: 26 }}>
              {sectionHead(`نتایج «${searchQuery}»`, colors.primary)}
              {filteredData.length > 0 ? (
                <div style={{ display: 'flex', overflowX: 'auto', gap: 14, paddingBottom: 6 }}>
                  {filteredData.map((video, idx) => <VideoCard key={idx} item={video} isVideo={!!video.video} />)}
                </div>
              ) : (
                <p style={{ color: colors.textSecondary, fontSize: 13, padding: '10px 2px' }}>ویدیویی پیدا نشد.</p>
              )}
            </div>
          )}

          {!filteredData && (
            <>
              {/* بنر چرخشی */}
              <div className="loko-anim" style={{ position: 'relative', marginBottom: 22 }}>
                <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', boxShadow: '0 14px 32px rgba(0,0,0,0.12)', cursor: 'grab' }} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                  <img src={currentBannerData.src} alt={currentBannerData.title} style={{ width: '100%', height: 'clamp(170px, 42vw, 240px)', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 35%, rgba(0,0,0,0.55) 100%)' }} />

                  {/* XP badge */}
                  <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderRadius: 999, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, zIndex: 2 }}>
                    <img src={Icon3} alt="" aria-hidden style={{ width: 15, height: 15 }} />
                    <span style={{ color: colors.coin, fontSize: 12, fontWeight: 800 }}>+{currentBannerData.xp}</span>
                    <span style={{ color: '#fff', fontSize: 10 }}>XP</span>
                  </div>

                  {/* title */}
                  <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 2, textAlign: 'right' }}>
                    <h3 style={{ color: '#fff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{currentBannerData.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11.5, fontWeight: 600, margin: '4px 0 0' }}>{currentBannerData.subject}</p>
                  </div>

                  {/* CTA */}
                  <div style={{ position: 'absolute', bottom: 16, left: 16, background: colors.primary, borderRadius: 999, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 6, zIndex: 3, boxShadow: '0 6px 16px rgba(77,182,172,0.45)' }}>
                    <HiOutlinePlay size={15} color="#fff" style={{ marginRight: -2 }} />
                    <span style={{ color: '#fff', fontSize: 12.5, fontWeight: 700 }}>بزن بریم تماشا</span>
                  </div>
                </div>

                {/* dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                  {banners.map((_, index) => (
                    <div key={index} onClick={() => setCurrentBanner(index)} style={{ width: currentBanner === index ? 24 : 8, height: 8, borderRadius: 4, background: currentBanner === index ? colors.primary : 'rgba(0,0,0,0.15)', transition: 'all 0.3s ease', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>

              {/* فیلترها */}
              <div style={{ display: 'flex', overflowX: 'auto', gap: 10, marginBottom: 22, paddingBottom: 4 }}>
                {filterButtons.map((btn) => {
                  const active = activeFilters.includes(btn.id);
                  return (
                    <button
                      key={btn.id}
                      onClick={() => toggleFilter(btn.id)}
                      style={{ flexShrink: 0, padding: '9px 18px', borderRadius: 999, border: `1.5px solid ${active ? btn.color : colors.border}`, background: active ? btn.color : colors.cardBg, color: active ? '#fff' : colors.textSoft, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
                    >
                      {btn.title}
                    </button>
                  );
                })}
              </div>

              {/* بخش‌های فیلترشده */}
              {filteredSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="loko-anim" style={{ marginBottom: 26 }}>
                  {sectionHead(section.title, section.color)}
                  {section.data.length > 0 ? (
                    <div style={{ display: 'flex', overflowX: 'auto', gap: 14, paddingBottom: 6 }}>
                      {section.data.map((item) => <VideoCard key={item.id} item={item} showProgress={section.showProgress && (item.progress > 0 || item.isVideo)} isVideo={item.isVideo || false} />)}
                    </div>
                  ) : (
                    <p style={{ color: colors.textSecondary, fontSize: 12.5, padding: '6px 2px' }}>فعلاً موردی اینجا نیست.</p>
                  )}
                </div>
              ))}

              {/* ویدیوهای ویژه */}
              <div className="loko-anim" style={{ marginBottom: 26 }}>
                {sectionHead('ویدیوهای ویژه', colors.orange)}
                <div style={{ display: 'flex', overflowX: 'auto', gap: 14, paddingBottom: 6 }}>
                  {videoItems.map((video) => <VideoCard key={video.id} item={video} isVideo={true} />)}
                </div>
              </div>

              {/* بنرهای اسکرولی */}
              <div className="loko-anim" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', overflowX: 'auto', gap: 14, paddingBottom: 6 }}>
                  {scrollBanners.map((banner) => (
                    <div key={banner.id} style={{ minWidth: 'clamp(260px, 72vw, 400px)', width: 'clamp(260px, 72vw, 400px)', cursor: 'pointer', transition: 'transform 0.2s ease', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', flexShrink: 0 }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                      <img src={banner.src} alt={banner.title} style={{ width: '100%', height: 'clamp(120px, 30vw, 160px)', objectFit: 'cover', display: 'block' }} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* مودال پخش ویدیو */}
      {isVideoModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }} onClick={closeVideoModal}>
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1001, cursor: 'pointer', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={closeVideoModal}>
            <HiOutlineX size={24} color="white" />
          </div>
          <div style={{ width: '92%', maxWidth: 1000, position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
            <video ref={(ref) => setVideoRef(ref)} src={selectedVideoSrc} controls autoPlay onEnded={handleVideoEnded} onTimeUpdate={() => { if (videoRef && videoRef.duration) { saveVideoProgress(selectedVideoTitle, videoRef.currentTime, videoRef.duration); } }} style={{ width: '100%', display: 'block' }} />
          </div>
          <p style={{ color: 'white', textAlign: 'center', marginTop: 20, fontSize: 17, fontWeight: 700 }}>{selectedVideoTitle}</p>
        </div>
      )}

      {/* منوی پایین — استاندارد و هماهنگ با بقیه صفحات */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 'min(600px, 100%)', background: colors.navBg, boxShadow: '0 -2px 20px rgba(0,0,0,0.08)', borderRadius: '28px 28px 0 0', padding: isMobile ? '10px 12px' : '12px 20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100 }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} onClick={() => { setActiveTab(item.id); navigate(item.path); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <IconComponent size={isMobile ? 20 : 22} color={isActive ? colors.primary : '#999'} />
              <span style={{ fontSize: isMobile ? '9px' : '10px', color: isActive ? colors.primary : '#999', fontWeight: isActive ? '600' : '400' }}>{item.name}</span>
              {isActive && <div style={{ width: '4px', height: '4px', borderRadius: '2px', background: colors.primary, marginTop: '2px' }} />}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes homeFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .loko-anim { animation: homeFadeUp .45s ease both; }
        ::-webkit-scrollbar { display: none; }
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        div { user-select: none; } button { font-family: inherit; } input { user-select: text; }
        video { outline: none; width: 100%; height: auto; }
      `}</style>
    </div>
  );
};

export default LukoTV;

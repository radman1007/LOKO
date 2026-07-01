// LukoPodcast.jsx - Responsive Version
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { HiOutlineUser, HiOutlinePlay, HiOutlineClock, HiOutlineHome, HiOutlineFire, HiOutlineHeart, HiOutlineSearch, HiOutlineX, HiOutlinePause } from 'react-icons/hi';

import Header from '../components/common/Header';
import OwlIcon from '../icons/icon45.png'; import PodcastCover1 from '../icons/icon50.png';
import PodcastCover2 from '../icons/icon51.png'; import PodcastCover3 from '../icons/icon52.png';
import PodcastCover4 from '../icons/icon53.png'; import Icon3 from '../icons/icon3.png';

const LukoPodcast = () => {
  const navigate = useNavigate();
  const { user, userXP, addXP } = useUser();
  const [activeTab, setActiveTab] = useState('لوکو پادکست');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState(['داستانی', 'آموزشی', 'انگیزشی']);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentPodcast, setCurrentPodcast] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = React.useRef(null);

  const colors = { primary: '#C57948', primaryDark: '#A86238', primaryLight: '#FBE7CC', bg: '#FDF8F0', cardBg: '#FFFFFF', text: '#5D4037', textSecondary: '#8D6E63', navBg: '#FFFFFF', iconBg: '#FBE7CC', xpBg: '#FFE0B2', playerBg: '#5D4037', border: '#E8D5B7' };

  const podcastItems = useMemo(() => [ { id: 1, title: 'داستان شب بخیر', category: 'داستانی', duration: '12:30', xp: 25, audioUrl: '/audio/story1.mp3', cover: PodcastCover1, description: 'داستانی آرامش‌بخش برای قبل از خواب' }, { id: 2, title: 'ماجراجویی در جنگل', category: 'داستانی', duration: '15:45', xp: 30, audioUrl: '/audio/story2.mp3', cover: PodcastCover2, description: 'قصه‌ای درباره کشف طبیعت' }, { id: 3, title: 'ریاضی شیرین', category: 'آموزشی', duration: '10:20', xp: 35, audioUrl: '/audio/edu1.mp3', cover: PodcastCover3, description: 'یادگیری ریاضی با داستان' }, { id: 4, title: 'انگیزه برای فردا', category: 'انگیزشی', duration: '08:15', xp: 20, audioUrl: '/audio/motivation1.mp3', cover: PodcastCover4, description: 'افزایش انگیزه برای موفقیت' }, { id: 5, title: 'علوم جذاب', category: 'آموزشی', duration: '18:00', xp: 40, audioUrl: '/audio/science1.mp3', cover: PodcastCover2, description: 'کشف دنیای علم' }, { id: 6, title: 'قصه‌های کهن', category: 'داستانی', duration: '20:15', xp: 35, audioUrl: '/audio/story3.mp3', cover: PodcastCover1, description: 'قصه‌های قدیمی ایرانی' } ], []);

  const filterButtons = useMemo(() => [ { id: 'داستانی', title: 'داستانی', color: colors.primary }, { id: 'آموزشی', title: 'آموزشی', color: colors.primaryLight }, { id: 'انگیزشی', title: 'انگیزشی', color: colors.primaryDark } ], []);

  const filteredPodcasts = useMemo(() => { if (searchQuery) return podcastItems.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.includes(searchQuery)); return podcastItems.filter(p => activeFilters.includes(p.category)); }, [podcastItems, searchQuery, activeFilters]);

  const toggleFilter = useCallback((filterId) => { setActiveFilters(prev => prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]); }, []);
  const handlePlayPodcast = (podcast) => { setCurrentPodcast(podcast); setIsPlayerOpen(true); setIsPlaying(true); setAudioProgress(0); setAudioDuration(0); };
  const handleClosePlayer = () => { if (audioRef.current) audioRef.current.pause(); setIsPlayerOpen(false); setCurrentPodcast(null); setIsPlaying(false); setAudioProgress(0); };
  const handleAudioEnded = () => { if (currentPodcast && !currentPodcast.played) { addXP(currentPodcast.xp); currentPodcast.played = true; alert(`🎉 ${currentPodcast.xp} XP دریافت کردی!`); } setIsPlaying(false); setAudioProgress(0); };
  const handleTimeUpdate = () => { if (audioRef.current) setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100); };
  const handleLoadedMetadata = () => { if (audioRef.current) setAudioDuration(audioRef.current.duration); };
  const formatTime = (seconds) => { if (!seconds || isNaN(seconds)) return '0:00'; const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${mins}:${secs < 10 ? '0' + secs : secs}`; };

  const navItems = [ { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' }, { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' }, { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' }, { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' }, { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' } ];

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Shoor', 'Shoor Rounded', sans-serif", direction: 'rtl', paddingBottom: '80px', display: 'flex', justifyContent: 'center' }}>
      
      <div style={{ width: '100%', maxWidth: 'min(600px, 100%)' }}>
        <Header title="لوکو پادکست" user={user} showGreeting={false} colors={colors} rightAction={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ display: 'flex', alignItems: 'center', background: colors.iconBg, borderRadius: '40px', padding: '6px 12px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}><HiOutlineSearch size={16} color={colors.textSecondary} /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="جستجو..." style={{ flex: 1, background: 'transparent', border: 'none', padding: '0 8px', fontSize: '13px', outline: 'none', color: colors.text, direction: 'rtl', width: 'clamp(100px, 30vw, 180px)' }} /></div><div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: colors.xpBg, padding: '6px 12px', borderRadius: '20px' }}><img src={Icon3} alt="xp" style={{ width: '14px', height: '14px' }} /><span style={{ fontSize: '12px', fontWeight: '700', color: colors.text }}>{userXP} XP</span></div></div>} />

        <div style={{ padding: 'clamp(16px, 4vw, 24px) clamp(12px, 3vw, 16px)' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {filterButtons.map((btn) => (<button key={btn.id} onClick={() => toggleFilter(btn.id)} style={{ padding: 'clamp(6px, 1.5vw, 10px) clamp(16px, 4vw, 28px)', borderRadius: '30px', border: 'none', background: activeFilters.includes(btn.id) ? btn.color : '#E8E0D5', color: activeFilters.includes(btn.id) ? 'white' : colors.textSecondary, fontSize: 'clamp(11px, 3vw, 14px)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}>{btn.title}</button>))}
          </div>

          {/* Changed to 1fr grid for better mobile app feel inside 600px */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {filteredPodcasts.map((podcast) => (
              <div key={podcast.id} onClick={() => handlePlayPodcast(podcast)} style={{ backgroundColor: colors.cardBg, borderRadius: '20px', padding: 'clamp(12px, 3vw, 16px)', display: 'flex', gap: '14px', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: `1px solid ${colors.border}` }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}>
                <img src={podcast.cover} alt={podcast.title} style={{ width: 'clamp(55px, 16vw, 70px)', height: 'clamp(55px, 16vw, 70px)', borderRadius: '16px', objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 'clamp(13px, 3.5vw, 15px)', fontWeight: '700', color: colors.text, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{podcast.title}</h3>
                  <p style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '8px' }}>{podcast.category}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HiOutlineClock size={12} color={colors.textSecondary} /><span style={{ fontSize: '11px', color: colors.textSecondary }}>{podcast.duration}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><img src={Icon3} alt="xp" style={{ width: '14px', height: '14px' }} /><span style={{ fontSize: '11px', fontWeight: '600', color: colors.primary }}>+{podcast.xp}</span></div>
                  </div>
                </div>
                <div style={{ width: 'clamp(36px, 10vw, 40px)', height: 'clamp(36px, 10vw, 40px)', borderRadius: '50%', backgroundColor: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><HiOutlinePlay size={18} color="white" /></div>
              </div>
            ))}
          </div>

          {filteredPodcasts.length === 0 && (<div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textSecondary }}><img src={OwlIcon} alt="owl" style={{ width: '80px', opacity: 0.5 }} /><p style={{ marginTop: '16px' }}>پادکستی با این دسته‌بندی پیدا نشد</p></div>)}
        </div>
      </div>

      {isPlayerOpen && currentPodcast && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 'min(600px, 100%)', backgroundColor: colors.playerBg, borderRadius: '28px 28px 0 0', padding: '20px', zIndex: 200, animation: 'slideUp 0.3s ease', boxShadow: '0 -10px 30px rgba(0,0,0,0.2)' }}>
          <button onClick={handleClosePlayer} style={{ position: 'absolute', top: '16px', left: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><HiOutlineX size={18} color="white" /></button>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}><img src={OwlIcon} alt="owl" style={{ width: '50px', height: '50px', marginBottom: '8px' }} /><h4 style={{ fontSize: '15px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>{currentPodcast.title}</h4><p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{currentPodcast.category}</p></div>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px', marginBottom: '8px', cursor: 'pointer' }} onClick={(e) => { if (audioRef.current) { const rect = e.currentTarget.getBoundingClientRect(); audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioDuration; } }}><div style={{ width: `${audioProgress}%`, height: '100%', backgroundColor: colors.primaryLight, borderRadius: '2px', transition: 'width 0.1s linear' }} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginBottom: '16px' }}><span>{formatTime(audioRef.current?.currentTime || 0)}</span><span>{formatTime(audioDuration)}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            <button onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10); }} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '13px', opacity: 0.8 }}>-10</button>
            <button onClick={() => { if (audioRef.current) { if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } else { audioRef.current.play(); setIsPlaying(true); } } }} style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>{isPlaying ? <HiOutlinePause size={24} color={colors.playerBg} /> : <HiOutlinePlay size={24} color={colors.playerBg} />}</button>
            <button onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10); }} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '13px', opacity: 0.8 }}>+10</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}><img src={Icon3} alt="xp" style={{ width: '14px', height: '14px' }} /><span style={{ fontSize: '10px', color: colors.primaryLight }}>پس از اتمام +{currentPodcast.xp} XP</span></div>
          <audio ref={audioRef} src={currentPodcast.audioUrl} onEnded={handleAudioEnded} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
        </div>
      )}

      {/* Strict 600px Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 'min(600px, 100%)', background: colors.navBg, boxShadow: '0 -2px 20px rgba(0,0,0,0.08)', borderRadius: '24px 24px 0 0', padding: 'clamp(8px, 2vw, 12px) 0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: isPlayerOpen ? 150 : 100 }}>
        {navItems.map((item) => { const IconComponent = item.icon; const isActive = activeTab === item.id; return (<div key={item.id} onClick={() => { setActiveTab(item.id); navigate(item.path); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}><IconComponent size={20} color={isActive ? colors.primary : '#999'} /><span style={{ fontSize: 'clamp(8px, 2.5vw, 10px)', color: isActive ? colors.primary : '#999', fontWeight: isActive ? '600' : '400' }}>{item.name}</span>{isActive && <div style={{ width: '4px', height: '4px', borderRadius: '2px', background: colors.primary, marginTop: '1px' }} />}</div>); })}
      </div>

      <style>{` @keyframes slideUp { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } } ::-webkit-scrollbar { display: none; } * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; } button, div[onClick] { cursor: pointer; } input { user-select: text; } `}</style>
    </div>
  );
};
export default LukoPodcast;
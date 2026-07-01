// Home.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useHealth } from '../contexts/HealthContext';
import { HiOutlineHome, HiOutlineUser, HiOutlineFire, HiOutlinePlay, HiOutlineHeart, HiOutlineBell } from 'react-icons/hi';

import NavigationBar from '../components/common/NavigationBar';
import Header from '../components/common/Header';
import UserInfoCard from '../components/home/UserInfoCard';
import ActionButtons from '../components/home/ActionButtons';
import LukoClubCard from '../components/home/LukoClubCard';
import LukoTVSection from '../components/home/LukoTVSection';
import LukoPadkast from '../components/home/LukoPadkast';
import AchievementsSection from '../components/home/AchievementsSection';
import BooksSection from '../components/home/BooksSection';
import MoodModal from '../components/home/MoodModal';

import BookIcon from '../icons/icon7.png'; import Icon11 from '../icons/icon11.png'; import Icon21 from '../icons/icon21.png'; import Icon22 from '../icons/icon22.png';
import Icon1 from '../icons/icon1.png'; import Icon4 from '../icons/icon4.png'; import Icon5 from '../icons/icon5.png';
import Icon15 from '../icons/icon15.png'; import Icon16 from '../icons/icon16.png'; import Icon17 from '../icons/icon17.png'; import Icon18 from '../icons/icon18.png';
import BookCover1 from '../icons/icon30.png'; import BookCover2 from '../icons/icon31.png'; import BookCover3 from '../icons/icon32.png';
import BookCover4 from '../icons/icon33.png'; import BookCover5 from '../icons/icon34.png'; import BookCover6 from '../icons/icon35.png';
import TvBanner1 from '../icons/icon36.png'; import TvBanner2 from '../icons/icon37.png'; import TvBanner3 from '../icons/icon38.png';
import TvBanner4 from '../icons/icon39.png'; import TvBanner5 from '../icons/icon40.png';

import { getTodayMissions } from '../data/dailyMissionsData';
import VideoCapitan from '../video/capitan.mp4'; import VideoShabihsaz from '../video/shabihsaz.mp4'; import VideoVadeakhar from '../video/vadeakhar.mp4';
import Icon12 from '../icons/icon12.png'; import Icon13 from '../icons/icon13.png'; import Icon14 from '../icons/icon14.png';
import Icon19 from '../icons/icon19.png'; import Icon20 from '../icons/icon20.png';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { showMoodReminder, showSuggestion, recordMood, dismissReminder, dismissSuggestion } = useHealth();
  const isMobile = true;
  
  const [userXP, setUserXP] = useState(() => parseInt(localStorage.getItem('luko_user_xp')) || 350);
  const [activeNav, setActiveNav] = useState('خانه');
  const [pressedItem, setPressedItem] = useState(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('luko_completed_tasks')) || []);

  const colors = { primary: '#4DB6AC', primaryLight: '#E0F2F1', primaryDark: '#80CBC4', purple: '#BA68C8', purpleLight: '#F3E5F5', bg: '#E8F5E9', cardBg: '#FFFFFF', text: '#455A64', navBg: '#FFFFFF', black: '#1A1A1A', brownLight: '#FBEEDE' };

  useEffect(() => { localStorage.setItem('luko_user_xp', userXP.toString()); }, [userXP]);
  useEffect(() => { localStorage.setItem('luko_completed_tasks', JSON.stringify(completedTasks)); }, [completedTasks]);
  useEffect(() => { setShowMoodModal(showMoodReminder); }, [showMoodReminder]);

  const lukoVideos = [ { id: 1, title: 'لوکو ریاضی', image: TvBanner1 }, { id: 2, title: 'لوکو علوم', image: TvBanner2 }, { id: 3, title: 'لوکو فارسی', image: TvBanner3 }, { id: 4, title: 'لوکو هنر', image: TvBanner4 }, { id: 5, title: 'لوکو زبان', image: TvBanner5 } ];

  const todayVideoMissions = useMemo(() => {
    const todayData = getTodayMissions();
    return todayData.missions.filter(mission => mission.type === 'video').map(mission => {
      let iconSrc; switch(mission.icon) { case 'Icon11': iconSrc = Icon11; break; case 'Icon12': iconSrc = Icon12; break; case 'Icon13': iconSrc = Icon13; break; case 'Icon14': iconSrc = Icon14; break; case 'Icon15': iconSrc = Icon15; break; case 'Icon16': iconSrc = Icon16; break; case 'Icon17': iconSrc = Icon17; break; case 'Icon18': iconSrc = Icon18; break; case 'Icon19': iconSrc = Icon19; break; case 'Icon20': iconSrc = Icon20; break; default: iconSrc = Icon12; }
      let videoSrc = null; if (mission.videoTitle) { switch(mission.videoTitle) { case 'کاپیتان': videoSrc = VideoCapitan; break; case 'شبیه ساز': videoSrc = VideoShabihsaz; break; case 'واده آخر': videoSrc = VideoVadeakhar; break; default: videoSrc = VideoCapitan; } }
      return { ...mission, iconSrc, videoSrc, bgColor: '#E3F2FD' };
    });
  }, []);

  const hasWatchedVideoToday = (title) => { const today = new Date().toDateString(); const watchData = JSON.parse(localStorage.getItem('luko_watched_videos') || '{}'); return watchData[title] === today; };
  const moodOptions = [ { id: 'good', icon: Icon1, label: 'خوب' }, { id: 'bad', icon: Icon4, label: 'بد' }, { id: 'normal', icon: Icon5, label: 'عادی' } ];
  const achievements = [ { id: 1, title: 'مدال ریاضی', icon: Icon15, earned: true }, { id: 2, title: 'مدال علوم', icon: Icon16, earned: true }, { id: 3, title: 'مدال هنر', icon: Icon17, earned: false }, { id: 4, title: 'مدال زبان', icon: Icon18, earned: false } ];
  const books = [ { id: 1, cover: BookCover1 }, { id: 2, cover: BookCover2 }, { id: 3, cover: BookCover3 }, { id: 4, cover: BookCover4 }, { id: 5, cover: BookCover5 }, { id: 6, cover: BookCover6 } ];
  const actionButtons = [ { id: 'books', name: 'کتاب‌های من', icon: BookIcon, bgColor: '#F3E5F5', path: '/books' }, { id: 'club', name: 'لوکو کلاب', icon: Icon11, bgColor: '#E0F2F1', path: '/luko-club' }, { id: 'tv', name: 'لوکو تلویزیون', icon: Icon22, bgColor: '#E0F2F1', path: '/entertainment' }, { id: 'health', name: 'لوکو سلامت', icon: Icon21, bgColor: '#F3E5F5', path: '/luko-health' } ];
  const navItems = [ { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' }, { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' }, { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' }, { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' }, { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' } ];

  const handleMoodSelect = (mood) => { recordMood(mood.id); setShowMoodModal(false); setTimeout(() => navigate('/luko-health'), 300); };
  const handleSuggestion = () => { dismissSuggestion(); navigate('/luko-health'); };
  const handleClick = (path, id) => { setPressedItem(id); setTimeout(() => { setPressedItem(null); navigate(path); }, 100); };

  return (
    <div style={{ minHeight: '100vh', background: "#f2f2f2fb", fontFamily: "'Shoor', 'Shoor Rounded', sans-serif", direction: 'rtl', paddingBottom: '80px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 'min(600px, 100%)', padding: 'clamp(12px, 3vw, 20px) clamp(12px, 3vw, 16px) 80px clamp(12px, 3vw, 16px)' }}>
        <Header
          user={user}
          showGreeting
          onProfileClick={() => navigate('/profile')}
          rightAction={
            <div style={{ width: 52, height: 52, borderRadius: 18, background: 'linear-gradient(180deg,#FFFFFF 0%,#F8FAFF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 10px 20px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
              <HiOutlineBell size={26} color="#202540" />
              <div style={{ position: 'absolute', top: 12, right: 13, width: 9, height: 9, borderRadius: '50%', background: '#FF912F', border: '2px solid #fff' }} />
            </div>
          }
        />
        <UserInfoCard user={user} colors={colors} onPress={handleClick} pressedItem={pressedItem} />
        <LukoTVSection videos={lukoVideos} onPress={handleClick} pressedItem={pressedItem} colors={colors} />
        <LukoPadkast onPress={handleClick} pressedItem={pressedItem} />
        <LukoClubCard missions={todayVideoMissions} completedTasks={completedTasks} hasWatchedVideoToday={hasWatchedVideoToday} onCardClick={() => navigate('/luko-club')} />
        <BooksSection books={books} onPress={handleClick} pressedItem={pressedItem} colors={colors} />
      </div>

      <MoodModal isOpen={showMoodModal} moodOptions={moodOptions} onSelectMood={handleMoodSelect} onDismiss={dismissReminder} />

      {showSuggestion && !showMoodModal && (
        <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 'min(600px, 100%)', padding: '0 16px', zIndex: 99 }}>
          <div style={{ backgroundColor: colors.primary, borderRadius: '20px', padding: 'clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 20px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'slideUp 0.3s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
            <div>
              <p style={{ fontSize: 'clamp(11px, 3vw, 13px)', fontWeight: '600', color: 'white', marginBottom: '2px' }}>🌬️ وقت یه نفس عمیقه!</p>
              <p style={{ fontSize: 'clamp(9px, 2.5vw, 11px)', color: 'rgba(255,255,255,0.9)' }}>بیا با هم یه نفس عمیق بکشیم</p>
            </div>
            <button onClick={handleSuggestion} style={{ backgroundColor: 'white', border: 'none', borderRadius: '30px', padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 16px)', fontSize: 'clamp(10px, 2.8vw, 12px)', fontWeight: '600', color: colors.primary, cursor: 'pointer' }}>بریم</button>
          </div>
        </div>
      )}

      <NavigationBar navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} isMobile={isMobile} colors={colors} onNavigate={navigate} setPressedItem={setPressedItem} pressedItem={pressedItem} />
      <style>{` @keyframes slideUp { from { transform: translate(-50%, 100px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } } ::-webkit-scrollbar { display: none; } * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; } div { user-select: none; } input { user-select: text; } `}</style>
    </div>
  );
};
export default Home;
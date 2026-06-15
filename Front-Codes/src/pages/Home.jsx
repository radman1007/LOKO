// Home.jsx - نسخه نهایی با کامپوننت‌های جدا شده
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useHealth } from '../contexts/HealthContext';
import { 
  HiOutlineHome, 
  HiOutlineUser,
  HiOutlineFire,
  HiOutlinePlay,
  HiOutlineHeart
} from 'react-icons/hi';
// کامپوننت‌ها
import BannerSlider from '../components/common/BannerSlider';
import NavigationBar from '../components/common/NavigationBar';
import UserInfoCard from '../components/home/UserInfoCard';
import ActionButtons from '../components/home/ActionButtons';
import LukoClubCard from '../components/home/LukoClubCard';
import LukoTVSection from '../components/home/LukoTVSection';
import LukoPadkast from '../components/home/LukoPadkast';
import AchievementsSection from '../components/home/AchievementsSection';
import BooksSection from '../components/home/BooksSection';
import MoodModal from '../components/home/MoodModal';
// ایمپورت آیکون‌ها
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
import Banner1 from '../icons/icon27.png';
import Banner2 from '../icons/icon28.png';
import Banner3 from '../icons/icon29.png';
import TvBanner1 from '../icons/icon36.png';
import TvBanner2 from '../icons/icon37.png';
import TvBanner3 from '../icons/icon38.png';
import TvBanner4 from '../icons/icon39.png';
import TvBanner5 from '../icons/icon40.png';
const Home = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { showMoodReminder, showSuggestion, recordMood, dismissReminder, dismissSuggestion } = useHealth();
  const [userXP, setUserXP] = useState(350);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeNav, setActiveNav] = useState('خانه');
  const [pressedItem, setPressedItem] = useState(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const colors = {
    primary: '#4DB6AC',
    primaryLight: '#E0F2F1',
    primaryDark: '#80CBC4',
    purple: '#BA68C8',
    purpleLight: '#F3E5F5',
    bg: '#E8F5E9',
    cardBg: '#FFFFFF',
    text: '#455A64',
    navBg: '#FFFFFF',
    black: '#1A1A1A',
    brownLight: '#FBEEDE'
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setShowMoodModal(showMoodReminder);
  }, [showMoodReminder]);

  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;

  const banners = [
    { id: 1, src: Banner1, title: 'تخفیف ویژه دوره‌ها' },
    { id: 2, src: Banner2, title: 'مسابقه نقاشی' },
    { id: 3, src: Banner3, title: 'کتاب جدید رسید' }
  ];

  const lukoVideos = [
    { id: 1, title: 'لوکو ریاضی', image: TvBanner1 },
    { id: 2, title: 'لوکو علوم', image: TvBanner2 },
    { id: 3, title: 'لوکو فارسی', image: TvBanner3 },
    { id: 4, title: 'لوکو هنر', image: TvBanner4 },
    { id: 5, title: 'لوکو زبان', image: TvBanner5 }
  ];

  const moodOptions = [
    { id: 'good', icon: Icon1, label: 'خوب' },
    { id: 'bad', icon: Icon4, label: 'بد' },
    { id: 'normal', icon: Icon5, label: 'عادی' }
  ];

  const healthButtons = [
    { id: 1, title: 'بازی‌های آرامش', color: '#E6E4F2', link: '/calm-games' },
    { id: 2, title: 'تست احساسات', color: '#C3E2F4', link: '/emotion-test' },
    { id: 3, title: 'تمرین تنفس', color: '#E6E4F2', link: '/calm-games' }
  ];

  const achievements = [
    { id: 1, title: 'مدال ریاضی', icon: Icon15, earned: true },
    { id: 2, title: 'مدال علوم', icon: Icon16, earned: true },
    { id: 3, title: 'مدال هنر', icon: Icon17, earned: false },
    { id: 4, title: 'مدال زبان', icon: Icon18, earned: false }
  ];

  const books = [
    { id: 1, cover: BookCover1 },
    { id: 2, cover: BookCover2 },
    { id: 3, cover: BookCover3 },
    { id: 4, cover: BookCover4 },
    { id: 5, cover: BookCover5 },
    { id: 6, cover: BookCover6 }
  ];

  const actionButtons = [
    { id: 'books', name: 'کتاب‌های من', icon: BookIcon, bgColor: '#F3E5F5', path: '/books' },
    { id: 'club', name: 'لوکو کلاب', icon: Icon11, bgColor: '#E0F2F1', path: '/luko-club' },
    { id: 'tv', name: 'لوکو تلویزیون', icon: Icon22, bgColor: '#E0F2F1', path: '/entertainment' },
    { id: 'health', name: 'لوکو سلامت', icon: Icon21, bgColor: '#F3E5F5', path: '/luko-health' }
  ];

  const navItems = [
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' }
  ];

  const handleCompleteMission = () => {
    if (!missionCompleted) {
      setUserXP(userXP + 50);
      setMissionCompleted(true);
    }
  };

  const handleMoodSelect = (mood) => {
    recordMood(mood.id);
    setShowMoodModal(false);
    setTimeout(() => {
      navigate('/luko-health');
    }, 300);
  };

  const handleSuggestion = () => {
    dismissSuggestion();
    navigate('/luko-health');
  };

  const handleClick = (path, id) => {
    setPressedItem(id);
    setTimeout(() => {
      setPressedItem(null);
      navigate(path);
    }, 100);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: "#f2f2f2fb",
      padding: '20px 16px 80px 16px',
      fontFamily: "'Shoor', 'Shoor Rounded', sans-serif",
      direction: 'rtl',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: isDesktop ? '1200px' : '100%',
        margin: '0 auto',
        width: '100%'
      }}>
        
        <UserInfoCard user={user} colors={colors} />
 <LukoTVSection 
          videos={lukoVideos} 
          onPress={handleClick} 
          pressedItem={pressedItem} 
          colors={colors} 
        />
      
         <LukoPadkast 
          user={user}
          healthButtons={healthButtons}
          moodOptions={moodOptions}
          onPress={handleClick}
          pressedItem={pressedItem}
          colors={colors}
        />

       

        <LukoClubCard 
          userXP={userXP} 
          missionCompleted={missionCompleted} 
          onCompleteMission={handleCompleteMission} 
          colors={colors} 
        />



   <BooksSection 
          books={books} 
          onPress={handleClick} 
          pressedItem={pressedItem} 
          colors={colors} 
        />

     

       

      </div>

      <MoodModal 
        isOpen={showMoodModal} 
        moodOptions={moodOptions} 
        onSelectMood={handleMoodSelect} 
        onDismiss={dismissReminder} 
      />

      {/* Breathing Suggestion */}
      {showSuggestion && !showMoodModal && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '16px',
          right: '16px',
          backgroundColor: colors.primary,
          borderRadius: '20px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 99,
          animation: 'slideUp 0.3s ease',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'white', marginBottom: '2px' }}>🌬️ وقت یه نفس عمیقه!</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>بیا با هم یه نفس عمیق بکشیم و آرامش رو به خودمون هدیه بدیم</p>
          </div>
          <button
            onClick={handleSuggestion}
            style={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '30px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              color: colors.primary,
              cursor: 'pointer'
            }}
          >
            بریم
          </button>
        </div>
      )}

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
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        ::-webkit-scrollbar { display: none; }
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        div { user-select: none; }
        input { user-select: text; }
      `}</style>
    </div>
  );
};

export default Home;
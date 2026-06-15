// src/pages/ParentPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { 
  HiOutlineHome, 
  HiOutlineUser,
  HiOutlineFire,
  HiOutlinePlay,
  HiOutlineHeart,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineBookOpen,
  HiOutlineStar,
  HiOutlineCalendar,
  HiOutlineEmojiHappy
} from 'react-icons/hi';
import TicketList from '../components/common/TicketList';

const ParentPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const [student, setStudent] = useState(null);
  const [studentStats, setStudentStats] = useState({
    xp: 0,
    streak: 0,
    completedTasks: 0,
    medals: [],
    recentActivities: []
  });
  const [classInfo, setClassInfo] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = () => {
    const savedStudents = localStorage.getItem('luko_students');
    const savedSchools = localStorage.getItem('luko_schools');
    
    if (savedStudents) {
      const allStudents = JSON.parse(savedStudents);
      const foundStudent = allStudents.find(s => s.name === user?.child || s.username === user?.child);
      if (foundStudent) {
        setStudent(foundStudent);
        setStudentStats({
          xp: foundStudent.xp || 0,
          streak: foundStudent.streak || 1,
          completedTasks: foundStudent.completedTasks || 0,
          medals: foundStudent.medals || [],
          recentActivities: foundStudent.recentActivities || []
        });
        
        if (savedSchools && foundStudent.schoolId) {
          const allSchools = JSON.parse(savedSchools);
          const studentSchool = allSchools.find(s => s.id === foundStudent.schoolId);
          if (studentSchool) {
            setSchoolInfo(studentSchool);
            const studentClass = studentSchool.classes.find(c => c.id === foundStudent.classId);
            if (studentClass) {
              setClassInfo(studentClass);
            }
          }
        }
      }
    }
  };

  const colors = {
    primary: '#4DB6AC',
    primaryDark: '#80CBC4',
    bg: '#E8F5E9',
    cardBg: '#FFFFFF',
    text: '#455A64',
    textSecondary: '#78909C',
    sidebarBg: '#1A237E',
    navBg: '#FFFFFF'
  };

  const sidebarTabs = [
    { id: 'dashboard', label: 'داشبورد', icon: HiOutlineChartBar },
    { id: 'progress', label: 'پیشرفت تحصیلی', icon: HiOutlineStar },
    { id: 'tickets', label: 'تیکت‌ها', icon: HiOutlineBookOpen }
  ];

  const mobileNavItems = [
    { id: 'dashboard', label: 'داشبورد', icon: HiOutlineChartBar },
    { id: 'progress', label: 'پیشرفت', icon: HiOutlineStar },
    { id: 'tickets', label: 'تیکت‌ها', icon: HiOutlineBookOpen }
  ];

  const navItems = [
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' }
  ];

  const currentLevel = Math.floor(studentStats.xp / 100) + 1;
  const xpInCurrentLevel = studentStats.xp % 100;
  const progressPercent = (xpInCurrentLevel / 100) * 100;
  const nextLevelXP = 100 - xpInCurrentLevel;

  const medals = [
    { id: 1, name: 'مدال ریاضی', icon: '🔢', xpRequired: 200, earned: studentStats.xp >= 200 },
    { id: 2, name: 'مدال علوم', icon: '🔬', xpRequired: 300, earned: studentStats.xp >= 300 },
    { id: 3, name: 'مدال هنر', icon: '🎨', xpRequired: 400, earned: studentStats.xp >= 400 },
    { id: 4, name: 'مدال زبان', icon: '📖', xpRequired: 500, earned: studentStats.xp >= 500 }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      fontFamily: "'Shoor', 'Shoor Rounded', sans-serif",
      direction: 'rtl',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row'
    }}>
      
      {!isMobile && (
        <div style={{
          width: '260px',
          background: colors.sidebarBg,
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100
        }}>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>لوکو</h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>پنل والدین</p>
          </div>
          
          <div style={{ flex: 1, padding: '16px 0' }}>
            {sidebarTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 24px',
                    margin: '4px 12px',
                    borderRadius: '12px',
                    background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={20} color={isActive ? colors.primary : 'rgba(255,255,255,0.6)'} />
                  <span style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                    {tab.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HiOutlineUser size={20} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{user?.name || 'والدین'}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>فرزند: {student?.name || user?.child}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              خروج
            </button>
          </div>
        </div>
      )}

      <div style={{
        flex: 1,
        marginRight: !isMobile ? '260px' : '0',
        padding: isMobile ? '16px' : '24px',
        paddingBottom: isMobile ? '70px' : '24px'
      }}>
        
        {isMobile && (
          <div style={{
            background: colors.cardBg,
            padding: '12px 16px',
            borderRadius: '16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HiOutlineUser size={20} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>{user?.name || 'والدین'}</p>
                <p style={{ fontSize: '10px', color: colors.textSecondary }}>فرزند: {student?.name || user?.child}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              style={{
                background: '#F44336',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 16px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              خروج
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>داشبورد والدین</h2>
            
            <div style={{
              background: colors.cardBg,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              flexWrap: 'wrap'
            }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: colors.primaryLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HiOutlineEmojiHappy size={36} color={colors.primary} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{student?.name || user?.child}</h3>
                <p style={{ fontSize: '13px', color: colors.textSecondary }}>{classInfo?.name || 'کلاس'} | {schoolInfo?.name || 'مدرسه'}</p>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <span style={{ fontSize: '12px', color: colors.primary }}>⭐ {studentStats.xp} XP</span>
                  <span style={{ fontSize: '12px', color: colors.primary }}>🔥 {studentStats.streak} روز</span>
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ background: colors.cardBg, borderRadius: '12px', padding: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineStar size={22} color={colors.primary} />
                <p style={{ fontSize: '20px', fontWeight: '700', marginTop: '4px' }}>{currentLevel}</p>
                <p style={{ fontSize: '10px', color: colors.textSecondary }}>سطح</p>
              </div>
              <div style={{ background: colors.cardBg, borderRadius: '12px', padding: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineCalendar size={22} color={colors.primary} />
                <p style={{ fontSize: '20px', fontWeight: '700', marginTop: '4px' }}>{studentStats.completedTasks}</p>
                <p style={{ fontSize: '10px', color: colors.textSecondary }}>تسک انجام شده</p>
              </div>
              <div style={{ background: colors.cardBg, borderRadius: '12px', padding: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineUsers size={22} color={colors.primary} />
                <p style={{ fontSize: '20px', fontWeight: '700', marginTop: '4px' }}>{classInfo?.students?.length || 0}</p>
                <p style={{ fontSize: '10px', color: colors.textSecondary }}>همکلاسی</p>
              </div>
            </div>

            <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <p style={{ fontSize: '13px', fontWeight: '500' }}>پیشرفت به سطح {currentLevel + 1}</p>
                <p style={{ fontSize: '13px', fontWeight: '600', color: colors.primary }}>{Math.round(progressPercent)}%</p>
              </div>
              <div style={{ background: colors.primaryLight, borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, background: colors.primary, height: '100%', borderRadius: '10px', transition: 'width 0.3s ease' }} />
              </div>
              <p style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '8px' }}>
                برای رفتن به سطح بعد به {nextLevelXP} XP دیگر نیاز است
              </p>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>پیشرفت تحصیلی</h2>
            
            <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>مدال‌های کسب شده</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {medals.map(medal => (
                  <div key={medal.id} style={{ textAlign: 'center', opacity: medal.earned ? 1 : 0.4 }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: medal.earned ? colors.primaryLight : '#E0E0E0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px auto'
                    }}>
                      <span style={{ fontSize: '24px' }}>{medal.icon}</span>
                    </div>
                    <p style={{ fontSize: '11px', fontWeight: '500' }}>{medal.name}</p>
                    {!medal.earned && <p style={{ fontSize: '9px', color: colors.textSecondary }}>{medal.xpRequired} XP</p>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>آمار کلی</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: colors.textSecondary }}>مجموع امتیاز</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: colors.primary }}>{studentStats.xp} XP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: colors.textSecondary }}>رکورد حضور متوالی</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: colors.primary }}>{studentStats.streak} روز</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: colors.textSecondary }}>تسک‌های انجام شده</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: colors.primary }}>{studentStats.completedTasks}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: colors.textSecondary }}>سطح فعلی</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: colors.primary }}>{currentLevel}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <TicketList user={user} colors={colors} isMobile={isMobile} />
        )}
      </div>

      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          left: 0,
          background: colors.navBg,
          boxShadow: '0 -2px 20px rgba(0,0,0,0.08)',
          borderRadius: '28px 28px 0 0',
          padding: '10px 12px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 100
        }}>
          {mobileNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  cursor: 'pointer'
                }}
              >
                <IconComponent size={20} color={isActive ? colors.primary : '#999'} />
                <span style={{ fontSize: '10px', color: isActive ? colors.primary : '#999', fontWeight: isActive ? '600' : '400' }}>
                  {item.label}
                </span>
                {isActive && <div style={{ width: '4px', height: '3px', borderRadius: '2px', background: colors.primary, marginTop: '2px' }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParentPanel;
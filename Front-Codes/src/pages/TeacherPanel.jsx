// src/pages/TeacherPanel.jsx
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
  HiOutlineUserGroup,
  HiOutlineBookOpen,
  HiOutlineClipboardList,
  HiOutlineStar,
  HiOutlineCalendar
} from 'react-icons/hi';
import TicketList from '../components/common/TicketList';

const TeacherPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = () => {
    const savedSchools = localStorage.getItem('luko_schools');
    const savedStudents = localStorage.getItem('luko_students');
    
    if (savedSchools) {
      const allSchools = JSON.parse(savedSchools);
      const teacherSchool = allSchools.find(s => s.id === user?.schoolId);
      if (teacherSchool) {
        setSchoolInfo(teacherSchool);
        const teacherClass = teacherSchool.classes.find(c => c.id === user?.classId);
        if (teacherClass) {
          setClassInfo(teacherClass);
        }
      }
    }
    
    if (savedStudents) {
      const allStudents = JSON.parse(savedStudents);
      setStudents(allStudents.filter(s => s.classId === user?.classId));
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
    { id: 'students', label: 'دانش‌آموزان', icon: HiOutlineUsers },
    { id: 'class', label: 'اطلاعات کلاس', icon: HiOutlineBookOpen },
    { id: 'tickets', label: 'تیکت‌ها', icon: HiOutlineClipboardList }
  ];

  const mobileNavItems = [
    { id: 'dashboard', label: 'داشبورد', icon: HiOutlineChartBar },
    { id: 'students', label: 'دانش‌آموزان', icon: HiOutlineUsers },
    { id: 'class', label: 'کلاس', icon: HiOutlineBookOpen },
    { id: 'tickets', label: 'تیکت‌ها', icon: HiOutlineClipboardList }
  ];

  const navItems = [
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' }
  ];

  const totalStudents = students.length;
  const avgXP = students.length > 0 ? Math.round(students.reduce((sum, s) => sum + (s.xp || 0), 0) / students.length) : 0;
  const topStudent = students.length > 0 ? students.reduce((max, s) => (s.xp > (max.xp || 0) ? s : max), students[0]) : null;

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
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>پنل معلم</p>
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
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{user?.name || 'معلم'}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>{classInfo?.name || 'کلاس'}</p>
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
                <p style={{ fontSize: '14px', fontWeight: '600' }}>{user?.name || 'معلم'}</p>
                <p style={{ fontSize: '10px', color: colors.textSecondary }}>{classInfo?.name || 'کلاس'}</p>
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
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>داشبورد معلم</h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineUsers size={24} color={colors.primary} />
                <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px' }}>{totalStudents}</p>
                <p style={{ fontSize: '12px', color: colors.textSecondary }}>دانش‌آموزان</p>
              </div>
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineStar size={24} color={colors.primary} />
                <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px' }}>{avgXP}</p>
                <p style={{ fontSize: '12px', color: colors.textSecondary }}>میانگین XP</p>
              </div>
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineCalendar size={24} color={colors.primary} />
                <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px' }}>{classInfo?.name || '-'}</p>
                <p style={{ fontSize: '12px', color: colors.textSecondary }}>کلاس</p>
              </div>
            </div>
            
            {topStudent && (
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>برترین دانش‌آموز کلاس</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: colors.primaryLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <HiOutlineUser size={24} color={colors.primary} />
                  </div>
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: '600' }}>{topStudent.name}</p>
                    <p style={{ fontSize: '13px', color: colors.primary }}>{topStudent.xp} XP</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>لیست دانش‌آموزان کلاس {classInfo?.name}</h2>
            {students.length === 0 ? (
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineUsers size={40} color={colors.textSecondary} opacity={0.5} />
                <p style={{ marginTop: '12px', color: colors.textSecondary }}>هیچ دانش‌آموزی در این کلاس ثبت نشده است</p>
              </div>
            ) : (
              students.map(student => (
                <div key={student.id} style={{
                  background: colors.cardBg,
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: colors.primaryLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <HiOutlineUser size={24} color={colors.primary} />
                    </div>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: '600' }}>{student.name}</p>
                      <p style={{ fontSize: '12px', color: colors.textSecondary }}>{student.username}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: colors.primary }}>{student.xp || 0} XP</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'class' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>اطلاعات کلاس</h2>
            <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: `1px solid ${colors.primaryLight}` }}>
                  <span style={{ fontSize: '14px', color: colors.textSecondary }}>نام کلاس</span>
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>{classInfo?.name || 'نامشخص'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: `1px solid ${colors.primaryLight}` }}>
                  <span style={{ fontSize: '14px', color: colors.textSecondary }}>مدرسه</span>
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>{schoolInfo?.name || 'نامشخص'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: `1px solid ${colors.primaryLight}` }}>
                  <span style={{ fontSize: '14px', color: colors.textSecondary }}>تعداد دانش‌آموزان</span>
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>{totalStudents}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: colors.textSecondary }}>میانگین XP کلاس</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: colors.primary }}>{avgXP}</span>
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

export default TeacherPanel;
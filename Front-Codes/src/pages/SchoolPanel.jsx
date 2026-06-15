// src/pages/SchoolPanel.jsx
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
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineBookOpen,
  HiOutlineClipboardList,
  HiOutlineStar
} from 'react-icons/hi';
import TicketList from '../components/common/TicketList';

const SchoolPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  useEffect(() => {
    loadSchoolData();
  }, []);

  const loadSchoolData = () => {
    const savedSchools = localStorage.getItem('luko_schools');
    const savedTeachers = localStorage.getItem('luko_teachers');
    const savedStudents = localStorage.getItem('luko_students');
    
    if (savedSchools) {
      const allSchools = JSON.parse(savedSchools);
      const userSchool = allSchools.find(s => s.name === user?.school || s.id === user?.schoolId);
      if (userSchool) {
        setSchoolInfo(userSchool);
        
        if (savedTeachers) {
          const allTeachers = JSON.parse(savedTeachers);
          setTeachers(allTeachers.filter(t => t.schoolId === userSchool.id));
        }
        
        if (savedStudents) {
          const allStudents = JSON.parse(savedStudents);
          setStudents(allStudents.filter(s => s.schoolId === userSchool.id));
        }
        
        setClasses(userSchool.classes || []);
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
    { id: 'teachers', label: 'معلمان', icon: HiOutlineUserGroup },
    { id: 'students', label: 'دانش‌آموزان', icon: HiOutlineUsers },
    { id: 'classes', label: 'کلاس‌ها', icon: HiOutlineBookOpen },
    { id: 'tickets', label: 'تیکت‌ها', icon: HiOutlineClipboardList }
  ];

  const mobileNavItems = [
    { id: 'dashboard', label: 'داشبورد', icon: HiOutlineChartBar },
    { id: 'teachers', label: 'معلمان', icon: HiOutlineUserGroup },
    { id: 'students', label: 'دانش‌آموزان', icon: HiOutlineUsers },
    { id: 'classes', label: 'کلاس‌ها', icon: HiOutlineBookOpen },
    { id: 'tickets', label: 'تیکت‌ها', icon: HiOutlineClipboardList }
  ];

  const navItems = [
    { id: 'لوکو کلاب', name: 'کلاب', icon: HiOutlineFire, path: '/luko-club' },
    { id: 'لوکو تلویزیون', name: 'تلویزیون', icon: HiOutlinePlay, path: '/entertainment' },
    { id: 'خانه', name: 'خانه', icon: HiOutlineHome, path: '/' },
    { id: 'لوکو سلامت', name: 'سلامت', icon: HiOutlineHeart, path: '/luko-health' },
    { id: 'پروفایل', name: 'پروفایل', icon: HiOutlineUser, path: '/profile' }
  ];

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'تعیین نشده';
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'نامشخص';
  };

  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const avgXP = students.length > 0 ? Math.round(students.reduce((sum, s) => sum + (s.xp || 0), 0) / students.length) : 0;

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
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>پنل مدیریت مدرسه</p>
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
                <HiOutlineOfficeBuilding size={20} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{user?.name || 'مدیر مدرسه'}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>{schoolInfo?.name || 'مدرسه'}</p>
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
                <HiOutlineOfficeBuilding size={20} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>{user?.name || 'مدیر مدرسه'}</p>
                <p style={{ fontSize: '10px', color: colors.textSecondary }}>{schoolInfo?.name || 'مدرسه'}</p>
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
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>داشبورد</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineUserGroup size={24} color={colors.primary} />
                <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px' }}>{totalTeachers}</p>
                <p style={{ fontSize: '12px', color: colors.textSecondary }}>معلمان</p>
              </div>
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineUsers size={24} color={colors.primary} />
                <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px' }}>{totalStudents}</p>
                <p style={{ fontSize: '12px', color: colors.textSecondary }}>دانش‌آموزان</p>
              </div>
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineBookOpen size={24} color={colors.primary} />
                <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px' }}>{totalClasses}</p>
                <p style={{ fontSize: '12px', color: colors.textSecondary }}>کلاس‌ها</p>
              </div>
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineStar size={24} color={colors.primary} />
                <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px' }}>{avgXP}</p>
                <p style={{ fontSize: '12px', color: colors.textSecondary }}>میانگین XP</p>
              </div>
            </div>
            
            <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>اطلاعات مدرسه</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${colors.primaryLight}` }}>
                  <span style={{ fontSize: '13px', color: colors.textSecondary }}>نام مدرسه</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{schoolInfo?.name || 'نامشخص'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${colors.primaryLight}` }}>
                  <span style={{ fontSize: '13px', color: colors.textSecondary }}>شهر</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{schoolInfo?.city || 'نامشخص'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                  <span style={{ fontSize: '13px', color: colors.textSecondary }}>تعداد کلاس‌ها</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{totalClasses}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>لیست معلمان</h2>
            {teachers.length === 0 ? (
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineUserGroup size={40} color={colors.textSecondary} opacity={0.5} />
                <p style={{ marginTop: '12px', color: colors.textSecondary }}>هیچ معلمی ثبت نشده است</p>
              </div>
            ) : (
              teachers.map(teacher => (
                <div key={teacher.id} style={{
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
                      <p style={{ fontSize: '15px', fontWeight: '600' }}>{teacher.name}</p>
                      <p style={{ fontSize: '12px', color: colors.textSecondary }}>{teacher.username}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '12px', color: colors.primary }}>{classes.find(c => c.id === teacher.classId)?.name || 'بدون کلاس'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>لیست دانش‌آموزان</h2>
            {students.length === 0 ? (
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineUsers size={40} color={colors.textSecondary} opacity={0.5} />
                <p style={{ marginTop: '12px', color: colors.textSecondary }}>هیچ دانش‌آموزی ثبت نشده است</p>
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
                    <p style={{ fontSize: '12px', color: colors.primary }}>XP: {student.xp || 0}</p>
                    <p style={{ fontSize: '11px', color: colors.textSecondary }}>{classes.find(c => c.id === student.classId)?.name || 'بدون کلاس'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'classes' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>لیست کلاس‌ها</h2>
            {classes.length === 0 ? (
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineBookOpen size={40} color={colors.textSecondary} opacity={0.5} />
                <p style={{ marginTop: '12px', color: colors.textSecondary }}>هیچ کلاسی تعریف نشده است</p>
              </div>
            ) : (
              classes.map(cls => (
                <div key={cls.id} style={{
                  background: colors.cardBg,
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: `1px solid ${colors.primaryLight}`
                  }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{cls.name}</h3>
                    <span style={{ fontSize: '12px', color: colors.primary }}>{cls.students?.length || 0} دانش‌آموز</span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '13px', color: colors.textSecondary }}>معلم: {getTeacherName(cls.teacherId)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>لیست دانش‌آموزان:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {cls.students?.length > 0 ? (
                        cls.students.map(studentId => (
                          <div key={studentId} style={{
                            background: colors.primaryLight,
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            color: colors.primaryDark
                          }}>
                            {getStudentName(studentId)}
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '12px', color: colors.textSecondary }}>هیچ دانش‌آموزی در این کلاس ثبت نشده است</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
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

export default SchoolPanel;
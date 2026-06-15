// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import TicketList from '../components/common/TicketList';
import { 
  HiOutlineHome, 
  HiOutlineUser,
  HiOutlineFire,
  HiOutlinePlay,
  HiOutlineHeart,
  HiOutlineChartBar,
  HiOutlineOfficeBuilding,
  HiOutlineVideoCamera,
  HiOutlineMicrophone,
  HiOutlineTicket,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineUserAdd,
  HiOutlineUsers
} from 'react-icons/hi';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [activeAdminTab, setActiveAdminTab] = useState('schools');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // داده‌ها
  const [schools, setSchools] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [videos, setVideos] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  
  // انتخاب‌ها
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // مدال‌ها
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPodcastModal, setShowPodcastModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCity, setNewSchoolCity] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherUsername, setNewTeacherUsername] = useState('');

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // بارگذاری دیتاهای پیش‌فرض
  useEffect(() => {
    loadDefaultData();
  }, []);

  const loadDefaultData = () => {
    // مدارس پیش‌فرض
    const defaultSchools = [
      { id: 1, name: 'مدرسه الف', city: 'تهران', classes: [
        { id: 101, name: 'پایه چهارم', teacherId: 201, students: [301, 302] },
        { id: 102, name: 'پایه پنجم', teacherId: null, students: [] }
      ]},
      { id: 2, name: 'مدرسه ب', city: 'اصفهان', classes: [
        { id: 103, name: 'پایه سوم', teacherId: 202, students: [303] }
      ]},
      { id: 3, name: 'مدرسه ج', city: 'شیراز', classes: [] }
    ];
    
    // معلمان پیش‌فرض
    const defaultTeachers = [
      { id: 201, name: 'خانم معلمی', username: 'teacher1', schoolId: 1, classId: 101 },
      { id: 202, name: 'آقای رضایی', username: 'teacher2', schoolId: 2, classId: 103 },
      { id: 203, name: 'خانم کریمی', username: 'teacher3', schoolId: null, classId: null },
      { id: 204, name: 'آقای محمدی', username: 'teacher4', schoolId: null, classId: null },
      { id: 205, name: 'خانم حسینی', username: 'teacher5', schoolId: null, classId: null }
    ];
    
    // دانش‌آموزان پیش‌فرض
    const defaultStudents = [
      { id: 301, name: 'علی حسینی', username: 'student1', schoolId: 1, classId: 101, xp: 45 },
      { id: 302, name: 'سارا محمدی', username: 'student2', schoolId: 1, classId: 101, xp: 78 },
      { id: 303, name: 'رضا کریمی', username: 'student3', schoolId: 2, classId: 103, xp: 32 },
      { id: 304, name: 'زهرا احمدی', username: 'student4', schoolId: null, classId: null, xp: 0 },
      { id: 305, name: 'محمد رضایی', username: 'student5', schoolId: null, classId: null, xp: 0 },
      { id: 306, name: 'فاطمه کاظمی', username: 'student6', schoolId: null, classId: null, xp: 0 },
      { id: 307, name: 'حسین مرادی', username: 'student7', schoolId: null, classId: null, xp: 0 }
    ];
    
    // ویدیوهای پیش‌فرض
    const defaultVideos = [
      { id: 1, title: 'کاپیتان', category: 'داستانی', duration: '05:30', xp: 30 },
      { id: 2, title: 'شبیه ساز', category: 'آموزشی', duration: '07:15', xp: 35 },
      { id: 3, title: 'واده آخر', category: 'داستانی', duration: '06:45', xp: 32 },
      { id: 4, title: 'ریاضی پایه چهارم', category: 'آموزشی', duration: '12:30', xp: 45 },
      { id: 5, title: 'علوم تجربی', category: 'علمی', duration: '15:00', xp: 50 }
    ];
    
    // پادکست‌های پیش‌فرض
    const defaultPodcasts = [
      { id: 1, title: 'داستان شب بخیر', category: 'داستانی', duration: '12:30', xp: 25 },
      { id: 2, title: 'ریاضی شیرین', category: 'آموزشی', duration: '10:20', xp: 35 },
      { id: 3, title: 'قصه‌های کهن', category: 'داستانی', duration: '15:00', xp: 30 },
      { id: 4, title: 'انگیزشی برای دانش‌آموزان', category: 'انگیزشی', duration: '08:45', xp: 40 }
    ];

    const savedSchools = localStorage.getItem('luko_schools');
    if (savedSchools) {
      setSchools(JSON.parse(savedSchools));
    } else {
      setSchools(defaultSchools);
      localStorage.setItem('luko_schools', JSON.stringify(defaultSchools));
    }

    const savedTeachers = localStorage.getItem('luko_teachers');
    if (savedTeachers) {
      setTeachersList(JSON.parse(savedTeachers));
    } else {
      setTeachersList(defaultTeachers);
      localStorage.setItem('luko_teachers', JSON.stringify(defaultTeachers));
    }

    const savedStudents = localStorage.getItem('luko_students');
    if (savedStudents) {
      setStudentsList(JSON.parse(savedStudents));
    } else {
      setStudentsList(defaultStudents);
      localStorage.setItem('luko_students', JSON.stringify(defaultStudents));
    }

    const savedVideos = localStorage.getItem('luko_videos');
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    } else {
      setVideos(defaultVideos);
      localStorage.setItem('luko_videos', JSON.stringify(defaultVideos));
    }

    const savedPodcasts = localStorage.getItem('luko_podcasts');
    if (savedPodcasts) {
      setPodcasts(JSON.parse(savedPodcasts));
    } else {
      setPodcasts(defaultPodcasts);
      localStorage.setItem('luko_podcasts', JSON.stringify(defaultPodcasts));
    }
  };

  const saveSchools = (newSchools) => {
    setSchools(newSchools);
    localStorage.setItem('luko_schools', JSON.stringify(newSchools));
  };

  const saveTeachers = (newTeachers) => {
    setTeachersList(newTeachers);
    localStorage.setItem('luko_teachers', JSON.stringify(newTeachers));
  };

  const saveStudents = (newStudents) => {
    setStudentsList(newStudents);
    localStorage.setItem('luko_students', JSON.stringify(newStudents));
  };

  const saveVideos = (newVideos) => {
    setVideos(newVideos);
    localStorage.setItem('luko_videos', JSON.stringify(newVideos));
  };

  const savePodcasts = (newPodcasts) => {
    setPodcasts(newPodcasts);
    localStorage.setItem('luko_podcasts', JSON.stringify(newPodcasts));
  };

  // ========== مدیریت مدارس ==========
  const addSchool = () => {
    if (!newSchoolName.trim()) {
      alert('لطفاً نام مدرسه را وارد کنید');
      return;
    }
    const newSchool = { 
      id: Date.now(), 
      name: newSchoolName, 
      city: newSchoolCity || 'نامشخص', 
      classes: [] 
    };
    saveSchools([...schools, newSchool]);
    setNewSchoolName('');
    setNewSchoolCity('');
    setShowAddSchoolModal(false);
  };

  const deleteSchool = (id) => {
    if (window.confirm('آیا از حذف این مدرسه مطمئن هستید؟')) {
      saveSchools(schools.filter(s => s.id !== id));
    }
  };

  // ========== مدیریت کلاس‌ها ==========
  const addClass = () => {
    if (!selectedSchool) {
      alert('لطفاً ابتدا مدرسه را انتخاب کنید');
      return;
    }
    if (!newClassName.trim()) {
      alert('لطفاً نام کلاس را وارد کنید');
      return;
    }
    
    const newClass = { id: Date.now(), name: newClassName, teacherId: null, students: [] };
    const updatedSchools = schools.map(s => {
      if (s.id === parseInt(selectedSchool)) {
        return { ...s, classes: [...s.classes, newClass] };
      }
      return s;
    });
    saveSchools(updatedSchools);
    setNewClassName('');
    setShowAddClassModal(false);
  };

  const deleteClass = (schoolId, classId) => {
    const updatedSchools = schools.map(s => {
      if (s.id === schoolId) {
        return { ...s, classes: s.classes.filter(c => c.id !== classId) };
      }
      return s;
    });
    saveSchools(updatedSchools);
  };

  // ========== مدیریت معلمان ==========
  const addTeacher = () => {
    if (!newTeacherName.trim()) {
      alert('لطفاً نام معلم را وارد کنید');
      return;
    }
    if (!newTeacherUsername.trim()) {
      alert('لطفاً نام کاربری معلم را وارد کنید');
      return;
    }
    
    const newTeacher = { 
      id: Date.now(), 
      name: newTeacherName, 
      username: newTeacherUsername,
      schoolId: selectedSchool ? parseInt(selectedSchool) : null,
      classId: selectedClass ? parseInt(selectedClass) : null
    };
    saveTeachers([...teachersList, newTeacher]);
    setNewTeacherName('');
    setNewTeacherUsername('');
    setShowAddTeacherModal(false);
  };

  const assignTeacherToClass = (teacherId, schoolId, classId) => {
    const updatedTeachers = teachersList.map(t => {
      if (t.id === teacherId) {
        return { ...t, schoolId, classId };
      }
      return t;
    });
    saveTeachers(updatedTeachers);
    
    const updatedSchools = schools.map(s => {
      if (s.id === schoolId) {
        return {
          ...s,
          classes: s.classes.map(c => 
            c.id === classId ? { ...c, teacherId } : c
          )
        };
      }
      return s;
    });
    saveSchools(updatedSchools);
  };

  const removeTeacher = (teacherId) => {
    if (window.confirm('آیا از حذف این معلم مطمئن هستید؟')) {
      saveTeachers(teachersList.filter(t => t.id !== teacherId));
    }
  };

  // ========== مدیریت دانش‌آموزان ==========
  const addStudentsToClass = () => {
    if (!selectedSchool || !selectedClass) {
      alert('لطفاً مدرسه و کلاس را انتخاب کنید');
      return;
    }
    if (selectedStudents.length === 0) {
      alert('لطفاً حداقل یک دانش‌آموز انتخاب کنید');
      return;
    }

    const updatedSchools = schools.map(s => {
      if (s.id === parseInt(selectedSchool)) {
        return {
          ...s,
          classes: s.classes.map(c => {
            if (c.id === parseInt(selectedClass)) {
              return { ...c, students: [...new Set([...c.students, ...selectedStudents])] };
            }
            return c;
          })
        };
      }
      return s;
    });
    saveSchools(updatedSchools);

    const updatedStudents = studentsList.map(s => {
      if (selectedStudents.includes(s.id)) {
        return { ...s, schoolId: parseInt(selectedSchool), classId: parseInt(selectedClass) };
      }
      return s;
    });
    saveStudents(updatedStudents);

    setSelectedStudents([]);
    setShowAddStudentModal(false);
  };

  const removeStudentFromClass = (studentId, schoolId, classId) => {
    const updatedSchools = schools.map(s => {
      if (s.id === schoolId) {
        return {
          ...s,
          classes: s.classes.map(c => {
            if (c.id === classId) {
              return { ...c, students: c.students.filter(sId => sId !== studentId) };
            }
            return c;
          })
        };
      }
      return s;
    });
    saveSchools(updatedSchools);
  };

  // ========== مدیریت ویدیوها ==========
  const addVideo = (videoData) => {
    if (editingItem) {
      const updated = videos.map(v => v.id === editingItem.id ? { ...videoData, id: editingItem.id } : v);
      saveVideos(updated);
      setEditingItem(null);
    } else {
      const newVideo = { id: Date.now(), ...videoData };
      saveVideos([...videos, newVideo]);
    }
    setShowVideoModal(false);
  };

  const deleteVideo = (id) => {
    if (window.confirm('آیا از حذف این ویدیو مطمئن هستید؟')) {
      saveVideos(videos.filter(v => v.id !== id));
    }
  };

  // ========== مدیریت پادکست‌ها ==========
  const addPodcast = (podcastData) => {
    if (editingItem) {
      const updated = podcasts.map(p => p.id === editingItem.id ? { ...podcastData, id: editingItem.id } : p);
      savePodcasts(updated);
      setEditingItem(null);
    } else {
      const newPodcast = { id: Date.now(), ...podcastData };
      savePodcasts([...podcasts, newPodcast]);
    }
    setShowPodcastModal(false);
  };

  const deletePodcast = (id) => {
    if (window.confirm('آیا از حذف این پادکست مطمئن هستید؟')) {
      savePodcasts(podcasts.filter(p => p.id !== id));
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
    sidebarText: '#FFFFFF'
  };

  // تب‌های سایدبار
  const sidebarTabs = [
    { id: 'dashboard', label: 'داشبورد', icon: HiOutlineChartBar },
    { id: 'schools', label: 'مدارس', icon: HiOutlineOfficeBuilding },
    { id: 'videos', label: 'ویدیوها', icon: HiOutlineVideoCamera },
    { id: 'podcasts', label: 'پادکست‌ها', icon: HiOutlineMicrophone },
    { id: 'tickets', label: 'تیکت‌ها', icon: HiOutlineTicket }
  ];

  // نویگیشن موبایل
  const mobileNavItems = [
    { id: 'schools', label: 'مدارس', icon: HiOutlineOfficeBuilding },
    { id: 'dashboard', label: 'داشبورد', icon: HiOutlineChartBar },
    { id: 'videos', label: 'ویدیوها', icon: HiOutlineVideoCamera },
    { id: 'tickets', label: 'تیکت‌ها', icon: HiOutlineTicket },
    { id: 'podcasts', label: 'پادکست‌ها', icon: HiOutlineMicrophone }
  ];

  const getTeacherName = (teacherId) => {
    const teacher = teachersList.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'تعیین نشده';
  };

  const getStudentName = (studentId) => {
    const student = studentsList.find(s => s.id === studentId);
    return student ? student.name : 'نامشخص';
  };

  const schoolOptions = schools.map(s => ({ value: s.id, label: `${s.name} - ${s.city}` }));
  const selectedSchoolData = schools.find(s => s.id === parseInt(selectedSchool));
  const classOptions = selectedSchoolData?.classes.map(c => ({ value: c.id, label: c.name })) || [];
  const availableStudents = studentsList.filter(s => !s.classId);

  const totalStudents = studentsList.length;
  const totalTeachers = teachersList.length;
  const totalSchools = schools.length;
  const totalContent = videos.length + podcasts.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      fontFamily: "'Shoor', 'Shoor Rounded', sans-serif",
      direction: 'rtl',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row'
    }}>
      
      {/* سایدبار دسکتاپ */}
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
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>پنل مدیریت</p>
          </div>
          
          <div style={{ flex: 1, padding: '16px 0' }}>
            {sidebarTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeAdminTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveAdminTab(tab.id)}
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
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{user?.name || user?.username || 'مدیر'}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>مدیر تیم</p>
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

      {/* محتوای اصلی */}
      <div style={{
        flex: 1,
        marginRight: !isMobile ? '260px' : '0',
        padding: isMobile ? '16px' : '24px',
        paddingBottom: isMobile ? '70px' : '24px'
      }}>
        
        {/* هدر موبایل */}
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
                <p style={{ fontSize: '14px', fontWeight: '600' }}>{user?.name || user?.username || 'مدیر'}</p>
                <p style={{ fontSize: '10px', color: colors.textSecondary }}>پنل مدیریت</p>
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

        {/* داشبورد */}
        {activeAdminTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>داشبورد</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineOfficeBuilding size={24} color={colors.primary} />
                <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px' }}>{totalSchools}</p>
                <p style={{ fontSize: '12px', color: colors.textSecondary }}>مدارس</p>
              </div>
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineUser size={24} color={colors.primary} />
                <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px' }}>{totalTeachers}</p>
                <p style={{ fontSize: '12px', color: colors.textSecondary }}>معلمان</p>
              </div>
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineUsers size={24} color={colors.primary} />
                <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px' }}>{totalStudents}</p>
                <p style={{ fontSize: '12px', color: colors.textSecondary }}>دانش‌آموزان</p>
              </div>
              <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <HiOutlineVideoCamera size={24} color={colors.primary} />
                <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px' }}>{totalContent}</p>
                <p style={{ fontSize: '12px', color: colors.textSecondary }}>محتوای آموزشی</p>
              </div>
            </div>
            
            <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>راهنمای سریع</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: colors.bg, borderRadius: '12px' }}>
                  <HiOutlineOfficeBuilding size={18} color={colors.primary} />
                  <div><p style={{ fontWeight: '600', fontSize: '13px' }}>مدیریت مدارس</p><p style={{ fontSize: '11px', color: colors.textSecondary }}>مدارس، کلاس‌ها، معلمان و دانش‌آموزان</p></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: colors.bg, borderRadius: '12px' }}>
                  <HiOutlineVideoCamera size={18} color={colors.primary} />
                  <div><p style={{ fontWeight: '600', fontSize: '13px' }}>مدیریت ویدیوها</p><p style={{ fontSize: '11px', color: colors.textSecondary }}>ویدیوهای جدید اضافه یا حذف کنید</p></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: colors.bg, borderRadius: '12px' }}>
                  <HiOutlineMicrophone size={18} color={colors.primary} />
                  <div><p style={{ fontWeight: '600', fontSize: '13px' }}>مدیریت پادکست‌ها</p><p style={{ fontSize: '11px', color: colors.textSecondary }}>پادکست‌های جدید اضافه یا حذف کنید</p></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* مدارس */}
        {activeAdminTab === 'schools' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>لیست مدارس</h2>
              <button onClick={() => setShowAddSchoolModal(true)} style={{ background: colors.primary, border: 'none', borderRadius: '10px', padding: '8px 16px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <HiOutlinePlus size={14} /> مدرسه جدید
              </button>
            </div>

            {schools.map(school => (
              <div key={school.id} style={{ background: colors.cardBg, borderRadius: '16px', marginBottom: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '14px 16px', background: colors.primary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{school.name}</h3><p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>{school.city}</p></div>
                  <button onClick={() => deleteSchool(school.id)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', color: 'white' }}><HiOutlineTrash size={14} /></button>
                </div>
                
                <div style={{ padding: '16px' }}>
                  {/* کلاس‌ها */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600' }}>کلاس‌ها</h4>
                      <button onClick={() => { setSelectedSchool(school.id); setShowAddClassModal(true); }} style={{ background: 'transparent', border: 'none', color: colors.primary, cursor: 'pointer', fontSize: '12px' }}>+ اضافه کردن کلاس</button>
                    </div>
                    
                    {school.classes.length === 0 ? (
                      <p style={{ fontSize: '12px', color: colors.textSecondary, textAlign: 'center', padding: '12px' }}>هیچ کلاسی تعریف نشده است</p>
                    ) : (
                      school.classes.map(cls => (
                        <div key={cls.id} style={{ background: colors.bg, borderRadius: '12px', padding: '12px', marginBottom: '12px', borderRight: `3px solid ${colors.primary}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h5 style={{ fontSize: '14px', fontWeight: '600' }}>{cls.name}</h5>
                            <button onClick={() => deleteClass(school.id, cls.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F44336' }}><HiOutlineX size={14} /></button>
                          </div>
                          <p style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '8px' }}>معلم: {cls.teacherId ? getTeacherName(cls.teacherId) : 'تعیین نشده'}</p>
                          
                          <select value={cls.teacherId || ''} onChange={(e) => { const teacherId = e.target.value ? parseInt(e.target.value) : null; assignTeacherToClass(teacherId, school.id, cls.id); }} style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: `1px solid ${colors.primary}`, fontSize: '12px', marginBottom: '12px', background: 'white' }}>
                            <option value="">انتخاب معلم</option>
                            {teachersList.filter(t => !t.schoolId || t.schoolId === school.id).map(teacher => (<option key={teacher.id} value={teacher.id}>{teacher.name}</option>))}
                          </select>
                          
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <p style={{ fontSize: '12px', fontWeight: '500' }}>دانش‌آموزان ({cls.students.length})</p>
                              <button onClick={() => { setSelectedSchool(school.id); setSelectedClass(cls.id); setShowAddStudentModal(true); }} style={{ background: 'transparent', border: 'none', color: colors.primary, cursor: 'pointer', fontSize: '11px' }}>+ افزودن دانش‌آموز</button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {cls.students.map(studentId => (
                                <div key={studentId} style={{ background: colors.cardBg, padding: '4px 10px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                  {getStudentName(studentId)}
                                  <button onClick={() => removeStudentFromClass(studentId, school.id, cls.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F44336' }}><HiOutlineX size={10} /></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* معلمان */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600' }}>معلمان</h4>
                      <button onClick={() => setShowAddTeacherModal(true)} style={{ background: 'transparent', border: 'none', color: colors.primary, cursor: 'pointer', fontSize: '12px' }}>+ اضافه کردن معلم</button>
                    </div>
                    {teachersList.filter(t => t.schoolId === school.id).map(teacher => (
                      <div key={teacher.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: colors.bg, padding: '8px 12px', borderRadius: '10px', marginBottom: '8px' }}>
                        <div><p style={{ fontSize: '13px', fontWeight: '500' }}>{teacher.name}</p><p style={{ fontSize: '10px', color: colors.textSecondary }}>{teacher.username}</p></div>
                        <button onClick={() => removeTeacher(teacher.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F44336' }}><HiOutlineTrash size={14} /></button>
                      </div>
                    ))}
                    {teachersList.filter(t => t.schoolId === school.id).length === 0 && <p style={{ fontSize: '12px', color: colors.textSecondary, textAlign: 'center', padding: '12px' }}>هیچ معلمی ثبت نشده است</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ویدیوها */}
        {activeAdminTab === 'videos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>لیست ویدیوها</h2>
              <button onClick={() => { setEditingItem(null); setShowVideoModal(true); }} style={{ background: colors.primary, border: 'none', borderRadius: '10px', padding: '8px 16px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}><HiOutlinePlus size={14} /> ویدیو جدید</button>
            </div>
            {videos.map(video => (
              <div key={video.id} style={{ background: colors.cardBg, borderRadius: '12px', padding: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div><h3 style={{ fontSize: '14px', fontWeight: '600' }}>{video.title}</h3><div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '11px', color: colors.textSecondary }}><span>{video.category}</span><span>{video.duration}</span><span style={{ color: colors.primary }}>+{video.xp} XP</span></div></div>
                <div style={{ display: 'flex', gap: '8px' }}><button onClick={() => { setEditingItem(video); setShowVideoModal(true); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.primary }}><HiOutlinePencil size={16} /></button><button onClick={() => deleteVideo(video.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F44336' }}><HiOutlineTrash size={16} /></button></div>
              </div>
            ))}
          </div>
        )}

        {/* پادکست‌ها */}
        {activeAdminTab === 'podcasts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>لیست پادکست‌ها</h2>
              <button onClick={() => { setEditingItem(null); setShowPodcastModal(true); }} style={{ background: colors.primary, border: 'none', borderRadius: '10px', padding: '8px 16px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}><HiOutlinePlus size={14} /> پادکست جدید</button>
            </div>
            {podcasts.map(podcast => (
              <div key={podcast.id} style={{ background: colors.cardBg, borderRadius: '12px', padding: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div><h3 style={{ fontSize: '14px', fontWeight: '600' }}>{podcast.title}</h3><div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '11px', color: colors.textSecondary }}><span>{podcast.category}</span><span>{podcast.duration}</span><span style={{ color: colors.primary }}>+{podcast.xp} XP</span></div></div>
                <div style={{ display: 'flex', gap: '8px' }}><button onClick={() => { setEditingItem(podcast); setShowPodcastModal(true); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.primary }}><HiOutlinePencil size={16} /></button><button onClick={() => deletePodcast(podcast.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F44336' }}><HiOutlineTrash size={16} /></button></div>
              </div>
            ))}
          </div>
        )}

        {/* تیکت‌ها */}
        {activeAdminTab === 'tickets' && (
          <TicketList user={user} colors={colors} isMobile={isMobile} />
        )}
      </div>

      {/* مودال‌ها */}
      {showAddSchoolModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowAddSchoolModal(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '20px', width: '90%', maxWidth: '350px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>مدرسه جدید</h3>
            <input type="text" placeholder="نام مدرسه" value={newSchoolName} onChange={(e) => setNewSchoolName(e.target.value)} style={{ width: '100%', padding: '10px', border: `1px solid ${colors.primary}`, borderRadius: '10px', marginBottom: '10px', fontSize: '14px' }} />
            <input type="text" placeholder="شهر" value={newSchoolCity} onChange={(e) => setNewSchoolCity(e.target.value)} style={{ width: '100%', padding: '10px', border: `1px solid ${colors.primary}`, borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }} />
            <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setShowAddSchoolModal(false)} style={{ flex: 1, padding: '10px', background: '#E0E0E0', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>انصراف</button><button onClick={addSchool} style={{ flex: 1, padding: '10px', background: colors.primary, border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>ثبت</button></div>
          </div>
        </div>
      )}

      {showAddClassModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowAddClassModal(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '20px', width: '90%', maxWidth: '350px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>کلاس جدید</h3>
            <p style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '12px' }}>مدرسه: {schools.find(s => s.id === parseInt(selectedSchool))?.name}</p>
            <input type="text" placeholder="نام کلاس" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} style={{ width: '100%', padding: '10px', border: `1px solid ${colors.primary}`, borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }} />
            <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setShowAddClassModal(false)} style={{ flex: 1, padding: '10px', background: '#E0E0E0', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>انصراف</button><button onClick={addClass} style={{ flex: 1, padding: '10px', background: colors.primary, border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>ثبت</button></div>
          </div>
        </div>
      )}

      {showAddTeacherModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowAddTeacherModal(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '20px', width: '90%', maxWidth: '350px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>معلم جدید</h3>
            <input type="text" placeholder="نام معلم" value={newTeacherName} onChange={(e) => setNewTeacherName(e.target.value)} style={{ width: '100%', padding: '10px', border: `1px solid ${colors.primary}`, borderRadius: '10px', marginBottom: '10px', fontSize: '14px' }} />
            <input type="text" placeholder="نام کاربری" value={newTeacherUsername} onChange={(e) => setNewTeacherUsername(e.target.value)} style={{ width: '100%', padding: '10px', border: `1px solid ${colors.primary}`, borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }} />
            <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setShowAddTeacherModal(false)} style={{ flex: 1, padding: '10px', background: '#E0E0E0', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>انصراف</button><button onClick={addTeacher} style={{ flex: 1, padding: '10px', background: colors.primary, border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>ثبت</button></div>
          </div>
        </div>
      )}

      {showAddStudentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowAddStudentModal(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '20px', width: '90%', maxWidth: '400px', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>افزودن دانش‌آموز</h3>
            <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '16px' }}>{schools.find(s => s.id === parseInt(selectedSchool))?.name} - {selectedSchoolData?.classes.find(c => c.id === parseInt(selectedClass))?.name}</p>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
              {availableStudents.length === 0 ? <p style={{ textAlign: 'center', padding: '30px', color: '#999' }}>هیچ دانش‌آموزی برای اضافه کردن وجود ندارد</p> : availableStudents.map(student => (
                <div key={student.id} onClick={() => { if (selectedStudents.includes(student.id)) { setSelectedStudents(selectedStudents.filter(id => id !== student.id)); } else { setSelectedStudents([...selectedStudents, student.id]); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', marginBottom: '8px', background: selectedStudents.includes(student.id) ? `${colors.primary}10` : colors.bg, borderRadius: '10px', cursor: 'pointer', border: selectedStudents.includes(student.id) ? `1px solid ${colors.primary}` : '1px solid transparent' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${colors.primary}`, background: selectedStudents.includes(student.id) ? colors.primary : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{selectedStudents.includes(student.id) && <HiOutlineCheck size={10} color="white" />}</div>
                  <div><p style={{ fontSize: '13px', fontWeight: '500' }}>{student.name}</p><p style={{ fontSize: '10px', color: colors.textSecondary }}>{student.username}</p></div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => { setShowAddStudentModal(false); setSelectedStudents([]); }} style={{ flex: 1, padding: '10px', background: '#E0E0E0', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>انصراف</button><button onClick={addStudentsToClass} style={{ flex: 1, padding: '10px', background: colors.primary, border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>افزودن</button></div>
          </div>
        </div>
      )}

      {(showVideoModal || editingItem) && (
        <MediaModal type="video" item={editingItem} onClose={() => { setShowVideoModal(false); setEditingItem(null); }} onSave={addVideo} colors={colors} />
      )}

      {(showPodcastModal || editingItem) && (
        <MediaModal type="podcast" item={editingItem} onClose={() => { setShowPodcastModal(false); setEditingItem(null); }} onSave={addPodcast} colors={colors} />
      )}

      {/* نویگیشن بار موبایل */}
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
            const isActive = activeAdminTab === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveAdminTab(item.id)}
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

// مودال ویدیو/پادکست
const MediaModal = ({ type, item, onClose, onSave, colors }) => {
  const [title, setTitle] = useState(item?.title || '');
  const [category, setCategory] = useState(item?.category || '');
  const [duration, setDuration] = useState(item?.duration || '');
  const [xp, setXp] = useState(item?.xp || 0);
  const categories = type === 'video' ? ['داستانی', 'آموزشی', 'علمی', 'سرگرمی'] : ['داستانی', 'آموزشی', 'انگیزشی', 'کودک'];

  const handleSubmit = () => {
    if (!title.trim() || !category || !duration || xp <= 0) { alert('لطفاً همه فیلدها را کامل کنید'); return; }
    onSave({ title, category, duration, xp });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '20px', width: '90%', maxWidth: '350px' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>{item ? 'ویرایش' : 'جدید'} {type === 'video' ? 'ویدیو' : 'پادکست'}</h3>
        <input type="text" placeholder="عنوان" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '10px', border: `1px solid ${colors.primary}`, borderRadius: '10px', marginBottom: '10px', fontSize: '14px' }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', border: `1px solid ${colors.primary}`, borderRadius: '10px', marginBottom: '10px', fontSize: '14px' }}><option value="">دسته‌بندی</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
        <input type="text" placeholder="مدت زمان" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: '100%', padding: '10px', border: `1px solid ${colors.primary}`, borderRadius: '10px', marginBottom: '10px', fontSize: '14px' }} />
        <input type="number" placeholder="امتیاز XP" value={xp} onChange={(e) => setXp(parseInt(e.target.value))} style={{ width: '100%', padding: '10px', border: `1px solid ${colors.primary}`, borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }} />
        <div style={{ display: 'flex', gap: '10px' }}><button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#E0E0E0', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>انصراف</button><button onClick={handleSubmit} style={{ flex: 1, padding: '10px', background: colors.primary, border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>ثبت</button></div>
      </div>
    </div>
  );
};

export default AdminPanel;
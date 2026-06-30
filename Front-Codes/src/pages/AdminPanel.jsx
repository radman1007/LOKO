// src/pages/AdminPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import apiClient from '../services/api.client';
import TicketList from './TicketList'
import {
  HiOutlineUser,
  HiOutlineChartBar,
  HiOutlineOfficeBuilding,
  HiOutlineVideoCamera,
  HiOutlineMicrophone,
  HiOutlineTicket,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineUpload,
  HiOutlineUsers,
  HiOutlineUserAdd,
  HiOutlineAcademicCap,
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineEye,
  HiOutlineEyeOff
} from 'react-icons/hi';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(false);

  // ========== داده‌ها ==========
  const [schools, setSchools] = useState([]);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState({});
  const [videos, setVideos] = useState([]);
  const [podcasts, setPodcasts] = useState([]);

  // ========== وضعیت‌های UI ==========
  const [expandedSchools, setExpandedSchools] = useState({});
  const [expandedClasses, setExpandedClasses] = useState({});
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showPassword, setShowPassword] = useState({});

  // ========== مودال‌ها ==========
  const [modals, setModals] = useState({
    school: false,
    class: false,
    teacher: false,
    student: false,
    admin: false,
    addStudentToClass: false,
    addTeacherToClass: false,
    video: false,
    podcast: false,
    userPassword: false
  });

  // ========== فرم‌ها ==========
  const [form, setForm] = useState({
    schoolName: '',
    schoolCode: '',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    className: '',
    classGrade: '',
    classAcademicYear: '',
    teacherName: '',
    teacherUsername: '',
    teacherPassword: '',
    studentName: '',
    studentLastName: '',
    studentUsername: '',
    studentPassword: '',
    adminName: '',
    adminLastName: '',
    adminUsername: '',
    adminPassword: ''
  });

  const [selectedStudentsForClass, setSelectedStudentsForClass] = useState([]);
  const [selectedTeachersForClass, setSelectedTeachersForClass] = useState([]);
  const [currentClassId, setCurrentClassId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const isMobile = windowWidth < 768;

  // ========== بارگذاری ==========
  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (schools.length > 0) loadAllUsers();
  }, [schools]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await loadSchools();
      await loadVideos();
      await loadPodcasts();
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  // ========== API Calls ==========
  
  // ----- Schools -----
  const loadSchools = async () => {
    try {
      const res = await apiClient.get('v1/schools');
      if (res.data.success) {
        const data = res.data.data || [];
        setSchools(data);
        for (const school of data) {
          await loadClassesForSchool(school.id);
        }
      }
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  const loadClassesForSchool = async (schoolId) => {
    try {
      const res = await apiClient.get(`v1/schools/${schoolId}/classes`);
      if (res.data.success) {
        const data = res.data.data?.classes || [];
        setClasses(prev => ({ ...prev, [schoolId]: data }));
      }
    } catch (error) {
      setClasses(prev => ({ ...prev, [schoolId]: [] }));
    }
  };

  const createSchool = async (data) => {
    try {
      const res = await apiClient.post('v1/schools', data);
      if (res.data.success) {
        await loadSchools();
        return true;
      }
      return false;
    } catch (error) {
      alert(error.response?.data?.message || 'خطا در ایجاد مدرسه');
      return false;
    }
  };

  const deleteSchool = async (id) => {
    if (!window.confirm('آیا از حذف این مدرسه مطمئن هستید؟')) return;
    try {
      await apiClient.delete(`v1/schools/${id}`);
      await loadSchools();
    } catch (error) {
      alert(error.response?.data?.message || 'خطا در حذف مدرسه');
    }
  };

  // ----- Users -----
  const loadAllUsers = async () => {
    try {
      let allUsers = [];
      for (const school of schools) {
        try {
          const res = await apiClient.get(`v1/schools/${school.id}/users`);
          if (res.data.success) {
            const data = res.data.data?.users || res.data.data || [];
            const usersWithSchool = data.map(u => ({
              ...u,
              schoolId: school.id,
              firstName: u.first_name || u.firstName || '',
              lastName: u.last_name || u.lastName || '',
              role: u.role || '',
              username: u.username || '',
              classId: u.class_id || u.classId || null,
              plainPassword: u.plain_password || u.plainPassword || '********'
            }));
            allUsers = [...allUsers, ...usersWithSchool];
          }
        } catch (e) {}
      }
      const unique = allUsers.filter((u, i, self) => i === self.findIndex(t => t.id === u.id));
      setUsers(unique);
      return unique;
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  };

  // ====== دریافت پسورد کاربر ======
  const getUserPassword = async (userId) => {
    try {
      const res = await apiClient.get(`v1/users/${userId}/password`);
      if (res.data.success) {
        const data = res.data.data || {};
        setSelectedUser({
          ...data,
          username: data.username || '',
          password: data.password || '********'
        });
        setModals(prev => ({ ...prev, userPassword: true }));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'خطا در دریافت پسورد');
    }
  };

  const createUser = async (data) => {
    try {
      const schoolId = data.schoolId || schools[0]?.id || 1;
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role
      };
      
      if (data.username) {
        payload.username = data.username;
      } else {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        payload.username = `${data.firstName.toLowerCase()}_${randomNum}`;
      }
      
      if (data.password) {
        payload.password = data.password;
      } else {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        payload.password = password;
      }
      
      if (data.role === 'student') {
        if (!data.classId) {
          alert('برای دانش‌آموز، انتخاب کلاس الزامی است');
          return false;
        }
        payload.classId = data.classId;
      } else if (data.classId) {
        payload.classId = data.classId;
      }

      const res = await apiClient.post(`v1/schools/${schoolId}/users`, payload);
      if (res.data.success) {
        await loadAllUsers();
        alert(`✅ کاربر با موفقیت ایجاد شد!\n\nنام کاربری: ${payload.username}\nرمز عبور: ${payload.password}`);
        return true;
      }
      return false;
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'خطا در ایجاد کاربر');
      return false;
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('آیا از حذف این کاربر مطمئن هستید؟')) return;
    try {
      await apiClient.delete(`v1/users/${id}`);
      await loadAllUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'خطا در حذف کاربر');
    }
  };

  // ----- Classes -----
  const createClass = async (data) => {
    try {
      const res = await apiClient.post(`v1/schools/${data.schoolId}/classes`, {
        name: data.name,
        grade: data.grade,
        academicYear: data.academicYear
      });
      if (res.data.success) {
        await loadClassesForSchool(data.schoolId);
        return true;
      }
      return false;
    } catch (error) {
      alert(error.response?.data?.message || 'خطا در ایجاد کلاس');
      return false;
    }
  };

  const deleteClass = async (classId, schoolId) => {
    if (!window.confirm('آیا از حذف این کلاس مطمئن هستید؟')) return;
    try {
      await apiClient.delete(`v1/classes/${classId}`);
      await loadClassesForSchool(schoolId);
    } catch (error) {
      alert(error.response?.data?.message || 'خطا در حذف کلاس');
    }
  };

  // ========== افزودن دانش‌آموز به کلاس ==========
  const addStudentsToClass = async () => {
    if (!currentClassId || selectedStudentsForClass.length === 0) {
      alert('لطفاً حداقل یک دانش‌آموز انتخاب کنید');
      return;
    }

    try {
      for (const studentId of selectedStudentsForClass) {
        await apiClient.post(`v1/classes/${currentClassId}/students`, {
          studentId: studentId
        });
      }
      alert('دانش‌آموزان با موفقیت به کلاس اضافه شدند');
      setSelectedStudentsForClass([]);
      setModals(prev => ({ ...prev, addStudentToClass: false }));
      
      setLoading(true);
      await loadAllUsers();
      await loadClassesForSchool(selectedSchool);
      setLoading(false);
      
    } catch (error) {
      console.error('Error adding students to class:', error);
      alert(error.response?.data?.message || 'خطا در افزودن دانش‌آموزان به کلاس');
    }
  };

  // ========== افزودن معلم به کلاس ==========
  const addTeachersToClass = async () => {
    if (!currentClassId || selectedTeachersForClass.length === 0) {
      alert('لطفاً حداقل یک معلم انتخاب کنید');
      return;
    }

    try {
      for (const teacherId of selectedTeachersForClass) {
        await apiClient.post(`v1/classes/${currentClassId}/teachers`, {
          teacherId: teacherId
        });
      }
      alert('معلمان با موفقیت به کلاس اضافه شدند');
      setSelectedTeachersForClass([]);
      setModals(prev => ({ ...prev, addTeacherToClass: false }));
      
      setLoading(true);
      await loadAllUsers();
      await loadClassesForSchool(selectedSchool);
      setLoading(false);
      
    } catch (error) {
      console.error('Error adding teachers to class:', error);
      alert(error.response?.data?.message || 'خطا در افزودن معلمان به کلاس');
    }
  };

  // ----- Videos -----
  const loadVideos = async () => {
    try {
      const res = await apiClient.get('v1/videos');
      setVideos(res.data.success ? res.data.data || [] : []);
    } catch (error) {
      setVideos([]);
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm('آیا از حذف این ویدیو مطمئن هستید؟')) return;
    try {
      await apiClient.delete(`v1/videos/${id}`);
      await loadVideos();
    } catch (error) {
      alert(error.response?.data?.message || 'خطا در حذف ویدیو');
    }
  };

  // ----- Podcasts -----
  const loadPodcasts = async () => {
    try {
      const res = await apiClient.get('v1/podcasts');
      setPodcasts(res.data.success ? res.data.data || [] : []);
    } catch (error) {
      setPodcasts([]);
    }
  };

  const deletePodcast = async (id) => {
    if (!window.confirm('آیا از حذف این پادکست مطمئن هستید؟')) return;
    try {
      await apiClient.delete(`v1/podcasts/${id}`);
      await loadPodcasts();
    } catch (error) {
      alert(error.response?.data?.message || 'خطا در حذف پادکست');
    }
  };

  // ========== مدیریت فرم‌ها ==========

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      schoolName: '', schoolCode: '', schoolAddress: '', schoolPhone: '', schoolEmail: '',
      className: '', classGrade: '', classAcademicYear: '',
      teacherName: '', teacherUsername: '', teacherPassword: '',
      studentName: '', studentLastName: '', studentUsername: '', studentPassword: '',
      adminName: '', adminLastName: '', adminUsername: '', adminPassword: ''
    });
  };

  const addSchool = async () => {
    if (!form.schoolName.trim() || !form.schoolCode.trim()) {
      alert('لطفاً نام و کد مدرسه را وارد کنید');
      return;
    }
    const success = await createSchool({
      name: form.schoolName,
      code: form.schoolCode,
      address: form.schoolAddress || '',
      phone: form.schoolPhone || '',
      email: form.schoolEmail || ''
    });
    if (success) {
      resetForm();
      setModals(prev => ({ ...prev, school: false }));
    }
  };

  const addClass = async () => {
    if (!selectedSchool || !form.className.trim() || !form.classGrade.trim() || !form.classAcademicYear.trim()) {
      alert('لطفاً همه فیلدها را کامل کنید');
      return;
    }
    const success = await createClass({
      schoolId: selectedSchool,
      name: form.className,
      grade: form.classGrade,
      academicYear: form.classAcademicYear
    });
    if (success) {
      resetForm();
      setModals(prev => ({ ...prev, class: false }));
    }
  };

  const addTeacher = async () => {
    if (!form.teacherName.trim()) {
      alert('لطفاً نام معلم را وارد کنید');
      return;
    }
    const nameParts = form.teacherName.trim().split(' ');
    const success = await createUser({
      firstName: nameParts[0] || form.teacherName,
      lastName: nameParts.slice(1).join(' ') || 'معلم',
      role: 'teacher',
      username: form.teacherUsername.trim() || '',
      password: form.teacherPassword.trim() || '',
      schoolId: selectedSchool || schools[0]?.id || 1
    });
    if (success) {
      resetForm();
      setModals(prev => ({ ...prev, teacher: false }));
    }
  };

  const addStudent = async () => {
    if (!form.studentName.trim() || !form.studentLastName.trim()) {
      alert('لطفاً نام و نام خانوادگی را وارد کنید');
      return;
    }
    if (!selectedClass) {
      alert('لطفاً کلاس را انتخاب کنید');
      return;
    }
    const success = await createUser({
      firstName: form.studentName.trim(),
      lastName: form.studentLastName.trim(),
      role: 'student',
      username: form.studentUsername.trim() || '',
      password: form.studentPassword.trim() || '',
      schoolId: selectedSchool || schools[0]?.id || 1,
      classId: selectedClass
    });
    if (success) {
      resetForm();
      setModals(prev => ({ ...prev, student: false }));
      setSelectedClass(null);
    }
  };

  const addAdmin = async () => {
    if (!form.adminName.trim() || !form.adminLastName.trim()) {
      alert('لطفاً نام و نام خانوادگی را وارد کنید');
      return;
    }
    const success = await createUser({
      firstName: form.adminName.trim(),
      lastName: form.adminLastName.trim(),
      role: 'school_admin',
      username: form.adminUsername.trim() || '',
      password: form.adminPassword.trim() || '',
      schoolId: selectedSchool || schools[0]?.id || 1
    });
    if (success) {
      resetForm();
      setModals(prev => ({ ...prev, admin: false }));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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

  const tabs = [
    { id: 'dashboard', label: 'داشبورد', icon: HiOutlineChartBar },
    { id: 'schools', label: 'مدارس', icon: HiOutlineOfficeBuilding },
    { id: 'users', label: 'کاربران', icon: HiOutlineUsers },
    { id: 'videos', label: 'ویدیوها', icon: HiOutlineVideoCamera },
    { id: 'podcasts', label: 'پادکست‌ها', icon: HiOutlineMicrophone },
    { id: 'tickets', label: 'تیکت‌ها', icon: HiOutlineTicket }
  ];

  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalTeachers = users.filter(u => u.role === 'teacher').length;
  const totalAdmins = users.filter(u => u.role === 'school_admin' || u.role === 'admin' || u.role === 'team_admin').length;
  const totalSchools = schools.length;
  const totalContent = videos.length + podcasts.length;
  const totalClasses = Object.values(classes).reduce((acc, curr) => acc + (curr?.length || 0), 0);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}>
        <div style={{ width: '40px', height: '40px', border: `3px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, direction: 'rtl', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>

      {/* ========== سایدبار ========== */}
      {!isMobile && (
        <div style={{ width: '260px', background: colors.sidebarBg, position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>لوکو</h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>پنل مدیریت</p>
          </div>
          <div style={{ flex: 1, padding: '16px 0' }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '12px 24px', margin: '4px 12px', borderRadius: '12px', background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={20} color={isActive ? colors.primary : 'rgba(255,255,255,0.6)'} />
                  <span style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{tab.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HiOutlineUser size={20} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{user?.firstName || user?.username || 'مدیر'}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>مدیر تیم</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '13px' }}>خروج</button>
          </div>
        </div>
      )}

      {/* ========== محتوای اصلی ========== */}
      <div style={{ flex: 1, marginRight: !isMobile ? '260px' : '0', padding: isMobile ? '16px' : '24px', paddingBottom: isMobile ? '70px' : '24px' }}>

        {/* هدر موبایل */}
        {isMobile && (
          <div style={{ background: colors.cardBg, padding: '12px 16px', borderRadius: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HiOutlineUser size={20} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>{user?.firstName || user?.username || 'مدیر'}</p>
                <p style={{ fontSize: '10px', color: colors.textSecondary }}>پنل مدیریت</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{ background: '#F44336', border: 'none', borderRadius: '20px', padding: '6px 16px', color: 'white', cursor: 'pointer', fontSize: '12px' }}>خروج</button>
          </div>
        )}

        {/* ====== داشبورد ====== */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>داشبورد</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <DashboardCard icon={<HiOutlineOfficeBuilding size={24} />} count={totalSchools} label="مدارس" colors={colors} />
              <DashboardCard icon={<HiOutlineAcademicCap size={24} />} count={totalTeachers} label="معلمان" colors={colors} />
              <DashboardCard icon={<HiOutlineUsers size={24} />} count={totalStudents} label="دانش‌آموزان" colors={colors} />
              <DashboardCard icon={<HiOutlineVideoCamera size={24} />} count={totalContent} label="محتوای آموزشی" colors={colors} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
              <DashboardCard icon={<HiOutlineUserAdd size={20} />} count={totalAdmins} label="مدیران مدرسه" colors={colors} />
              <DashboardCard icon={<HiOutlineAcademicCap size={20} />} count={totalClasses} label="کلاس‌ها" colors={colors} />
              <DashboardCard icon={<HiOutlineUsers size={20} />} count={users.length} label="کل کاربران" colors={colors} />
            </div>
          </div>
        )}

        {/* ====== مدارس ====== */}
        {activeTab === 'schools' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>لیست مدارس</h2>
              <button onClick={() => setModals(prev => ({ ...prev, school: true }))} style={buttonStyle(colors.primary)}>
                <HiOutlinePlus size={14} /> مدرسه جدید
              </button>
            </div>

            {schools.length === 0 ? (
              <EmptyState message="هیچ مدرسه‌ای ثبت نشده است" />
            ) : (
              schools.map(school => {
                const isExpanded = expandedSchools[school.id] || false;
                const schoolClasses = Array.isArray(classes[school.id]) ? classes[school.id] : [];
                const schoolTeachers = users.filter(u => u.schoolId === school.id && u.role === 'teacher');
                const schoolStudents = users.filter(u => u.schoolId === school.id && u.role === 'student');

                return (
                  <div key={school.id} style={cardStyle(isExpanded, colors)}>
                    <div onClick={() => setExpandedSchools(prev => ({ ...prev, [school.id]: !prev[school.id] }))} style={headerStyle(isExpanded, colors)}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: isExpanded ? 'white' : colors.text }}>{school.name}</h3>
                        <p style={{ fontSize: '11px', color: isExpanded ? 'rgba(255,255,255,0.9)' : colors.textSecondary }}>کد: {school.code} | {school.address || 'آدرس ثبت نشده'}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: isExpanded ? 'white' : colors.textSecondary }}>{schoolClasses.length} کلاس | {schoolStudents.length} دانش‌آموز</span>
                        <button onClick={(e) => { e.stopPropagation(); deleteSchool(school.id); }} style={deleteButtonStyle(isExpanded)}>
                          <HiOutlineTrash size={14} />
                        </button>
                        {isExpanded ? <HiOutlineChevronDown size={20} color="white" /> : <HiOutlineChevronLeft size={20} color={colors.text} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '16px' }}>
                        {/* کلاس‌ها */}
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>کلاس‌ها ({schoolClasses.length})</h4>
                            <button onClick={() => { setSelectedSchool(school.id); setModals(prev => ({ ...prev, class: true })); }} style={smallButtonStyle(colors)}>
                              <HiOutlinePlus size={14} /> کلاس جدید
                            </button>
                          </div>

                          {schoolClasses.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: colors.textSecondary }}>هیچ کلاسی تعریف نشده است</p>
                          ) : (
                            schoolClasses.map(cls => {
                              const isClassExpanded = expandedClasses[cls.id] || false;
                              const classStudents = users.filter(u => u.classId === cls.id && u.role === 'student');
                              const classTeachers = users.filter(u => u.classId === cls.id && u.role === 'teacher');

                              return (
                                <div key={cls.id} style={classCardStyle(isClassExpanded, colors)}>
                                  <div onClick={() => setExpandedClasses(prev => ({ ...prev, [cls.id]: !prev[cls.id] }))} style={classHeaderStyle(isClassExpanded, colors)}>
                                    <div>
                                      <p style={{ fontSize: '14px', fontWeight: '600', color: isClassExpanded ? 'white' : colors.text }}>{cls.name}</p>
                                      <p style={{ fontSize: '11px', color: isClassExpanded ? 'rgba(255,255,255,0.9)' : colors.textSecondary }}>پایه: {cls.grade || 'نامشخص'} | سال: {cls.academicYear || 'نامشخص'}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <button onClick={(e) => { e.stopPropagation(); deleteClass(cls.id, school.id); }} style={smallDeleteButton(isClassExpanded)}>
                                        <HiOutlineTrash size={12} />
                                      </button>
                                      {isClassExpanded ? <HiOutlineChevronDown size={16} color="white" /> : <HiOutlineChevronLeft size={16} color={colors.text} />}
                                    </div>
                                  </div>

                                  {isClassExpanded && (
                                    <div style={{ padding: '12px' }}>
                                      {/* دانش‌آموزان */}
                                      <div style={{ marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                          <h5 style={{ fontSize: '13px', fontWeight: '600', color: colors.primary }}>دانش‌آموزان ({classStudents.length})</h5>
                                          <button onClick={() => { setCurrentClassId(cls.id); setSelectedSchool(school.id); setSelectedStudentsForClass([]); setModals(prev => ({ ...prev, addStudentToClass: true })); }} style={smallTextButton(colors)}>
                                            + اضافه کردن
                                          </button>
                                        </div>
                                        {classStudents.length === 0 ? (
                                          <p style={{ fontSize: '11px', color: colors.textSecondary, textAlign: 'center', padding: '4px' }}>هیچ دانش‌آموزی ثبت نشده است</p>
                                        ) : (
                                          classStudents.map(s => (
                                            <UserItem key={s.id} user={s} onDelete={() => deleteUser(s.id)} onShowPassword={() => getUserPassword(s.id)} colors={colors} />
                                          ))
                                        )}
                                      </div>

                                      {/* معلمان */}
                                      <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                          <h5 style={{ fontSize: '13px', fontWeight: '600', color: colors.primary }}>معلمان ({classTeachers.length})</h5>
                                          <button onClick={() => { setCurrentClassId(cls.id); setSelectedSchool(school.id); setSelectedTeachersForClass([]); setModals(prev => ({ ...prev, addTeacherToClass: true })); }} style={smallTextButton(colors)}>
                                            + اضافه کردن
                                          </button>
                                        </div>
                                        {classTeachers.length === 0 ? (
                                          <p style={{ fontSize: '11px', color: colors.textSecondary, textAlign: 'center', padding: '4px' }}>هیچ معلمی ثبت نشده است</p>
                                        ) : (
                                          classTeachers.map(t => (
                                            <UserItem key={t.id} user={t} onDelete={() => deleteUser(t.id)} onShowPassword={() => getUserPassword(t.id)} colors={colors} />
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ====== کاربران ====== */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>مدیریت کاربران</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <UserTypeButton label="مدیر" color="#FF9800" onClick={() => { setSelectedSchool(schools[0]?.id || null); setModals(prev => ({ ...prev, admin: true })); }} />
                <UserTypeButton label="معلم" color="#2196F3" onClick={() => { setSelectedSchool(schools[0]?.id || null); setModals(prev => ({ ...prev, teacher: true })); }} />
                <UserTypeButton label="دانش‌آموز" color="#4CAF50" onClick={() => { setSelectedSchool(schools[0]?.id || null); setSelectedClass(null); setModals(prev => ({ ...prev, student: true })); }} />
              </div>
            </div>

            <select onChange={(e) => setSelectedSchool(e.target.value ? parseInt(e.target.value) : null)} value={selectedSchool || ''} style={{ padding: '8px 12px', borderRadius: '10px', border: `1px solid ${colors.primary}`, fontSize: '13px', background: 'white', marginBottom: '16px' }}>
              <option value="">همه مدارس</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <div style={{ background: colors.cardBg, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {users.length === 0 ? (
                <EmptyState message="هیچ کاربری یافت نشد" />
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead style={{ background: colors.bg }}>
                    <tr>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>نام</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>نام کاربری</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>نقش</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>مدرسه</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center' }}>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(u => !selectedSchool || u.schoolId === selectedSchool)
                      .map(u => {
                        const school = schools.find(s => s.id === u.schoolId);
                        const roleColors = { 'team_admin': '#9C27B0', 'school_admin': '#FF9800', 'teacher': '#2196F3', 'student': '#4CAF50', 'parent': '#795548' };
                        return (
                          <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '12px 16px' }}>{u.firstName} {u.lastName}</td>
                            <td style={{ padding: '12px 16px', color: colors.textSecondary }}>{u.username}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ background: roleColors[u.role] || '#999', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '11px' }}>
                                {u.role === 'team_admin' ? 'مدیر کل' : u.role === 'school_admin' ? 'مدیر مدرسه' : u.role === 'teacher' ? 'معلم' : u.role === 'student' ? 'دانش‌آموز' : u.role}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', color: colors.textSecondary }}>{school?.name || '-'}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                {u.role !== 'team_admin' && (
                                  <>
                                    <button onClick={() => getUserPassword(u.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.primary }}>
                                      <HiOutlineEye size={16} />
                                    </button>
                                    <button onClick={() => deleteUser(u.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F44336' }}>
                                      <HiOutlineTrash size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ====== ویدیوها ====== */}
        {activeTab === 'videos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>لیست ویدیوها</h2>
              <button onClick={() => setModals(prev => ({ ...prev, video: true }))} style={buttonStyle(colors.primary)}>
                <HiOutlinePlus size={14} /> ویدیو جدید
              </button>
            </div>
            {videos.length === 0 ? (
              <EmptyState message="هیچ ویدیویی ثبت نشده است" />
            ) : (
              videos.map(v => (
                <div key={v.id} style={{ background: colors.cardBg, borderRadius: '12px', padding: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '600' }}>{v.title}</h3>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: colors.textSecondary }}>
                      <span>{v.category}</span>
                      <span>{v.duration}</span>
                      {v.xp && <span style={{ color: colors.primary }}>+{v.xp} XP</span>}
                    </div>
                  </div>
                  <button onClick={() => deleteVideo(v.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F44336' }}>
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ====== پادکست‌ها ====== */}
        {activeTab === 'podcasts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>لیست پادکست‌ها</h2>
              <button onClick={() => setModals(prev => ({ ...prev, podcast: true }))} style={buttonStyle(colors.primary)}>
                <HiOutlinePlus size={14} /> پادکست جدید
              </button>
            </div>
            {podcasts.length === 0 ? (
              <EmptyState message="هیچ پادکستی ثبت نشده است" />
            ) : (
              podcasts.map(p => (
                <div key={p.id} style={{ background: colors.cardBg, borderRadius: '12px', padding: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '600' }}>{p.title}</h3>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: colors.textSecondary }}>
                      <span>{p.category}</span>
                      <span>{p.duration}</span>
                      {p.xp && <span style={{ color: colors.primary }}>+{p.xp} XP</span>}
                    </div>
                  </div>
                  <button onClick={() => deletePodcast(p.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F44336' }}>
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ====== تیکت‌ها ====== */}
    {/* ====== تیکت‌ها ====== */}
{activeTab === 'tickets' && (
  <TicketList 
    user={user} 
    colors={colors} 
    isMobile={isMobile}
  />
)}
      </div>

      {/* ====== مودال‌ها ====== */}

      {/* مودال مدرسه */}
      {modals.school && (
        <Modal title="مدرسه جدید" onClose={() => { setModals(prev => ({ ...prev, school: false })); resetForm(); }} onSave={addSchool} colors={colors}>
          <Input placeholder="نام مدرسه *" value={form.schoolName} onChange={(e) => handleFormChange('schoolName', e.target.value)} />
          <Input placeholder="کد مدرسه *" value={form.schoolCode} onChange={(e) => handleFormChange('schoolCode', e.target.value)} />
          <Input placeholder="آدرس" value={form.schoolAddress} onChange={(e) => handleFormChange('schoolAddress', e.target.value)} />
          <Input placeholder="تلفن" value={form.schoolPhone} onChange={(e) => handleFormChange('schoolPhone', e.target.value)} />
          <Input placeholder="ایمیل" value={form.schoolEmail} onChange={(e) => handleFormChange('schoolEmail', e.target.value)} />
        </Modal>
      )}

      {/* مودال کلاس */}
      {modals.class && (
        <Modal title="کلاس جدید" onClose={() => { setModals(prev => ({ ...prev, class: false })); resetForm(); }} onSave={addClass} colors={colors}>
          <p style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '12px' }}>مدرسه: {schools.find(s => s.id === selectedSchool)?.name}</p>
          <Input placeholder="نام کلاس *" value={form.className} onChange={(e) => handleFormChange('className', e.target.value)} />
          <Input placeholder="پایه *" value={form.classGrade} onChange={(e) => handleFormChange('classGrade', e.target.value)} />
          <Input placeholder="سال تحصیلی *" value={form.classAcademicYear} onChange={(e) => handleFormChange('classAcademicYear', e.target.value)} />
        </Modal>
      )}

      {/* مودال معلم */}
      {modals.teacher && (
        <Modal title="معلم جدید" onClose={() => { setModals(prev => ({ ...prev, teacher: false })); resetForm(); }} onSave={addTeacher} colors={colors}>
          <p style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '12px' }}>مدرسه: {selectedSchool ? schools.find(s => s.id === selectedSchool)?.name : schools[0]?.name || 'انتخاب نشده'}</p>
          <Input placeholder="نام کامل *" value={form.teacherName} onChange={(e) => handleFormChange('teacherName', e.target.value)} />
          <Input placeholder="نام کاربری (اختیاری)" value={form.teacherUsername} onChange={(e) => handleFormChange('teacherUsername', e.target.value)} />
          <Input placeholder="رمز عبور (اختیاری)" type="password" value={form.teacherPassword} onChange={(e) => handleFormChange('teacherPassword', e.target.value)} />
          <p style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '-5px', marginBottom: '10px' }}>در صورت خالی بودن، به صورت خودکار ساخته می‌شود</p>
        </Modal>
      )}

      {/* مودال دانش‌آموز */}
      {modals.student && (
        <Modal title="دانش‌آموز جدید" onClose={() => { setModals(prev => ({ ...prev, student: false })); resetForm(); }} onSave={addStudent} colors={colors}>
          <p style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '12px' }}>مدرسه: {selectedSchool ? schools.find(s => s.id === selectedSchool)?.name : schools[0]?.name || 'انتخاب نشده'}</p>
          <select 
            value={selectedClass || ''} 
            onChange={(e) => setSelectedClass(e.target.value ? parseInt(e.target.value) : null)} 
            style={{ width: '100%', padding: '10px', border: `1px solid ${colors.primary}`, borderRadius: '10px', marginBottom: '10px', fontSize: '14px' }}
            required
          >
            <option value="">انتخاب کلاس *</option>
            {selectedSchool && classes[selectedSchool] && Array.isArray(classes[selectedSchool]) && classes[selectedSchool].length > 0 ? (
              classes[selectedSchool].map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))
            ) : (
              <option value="" disabled>هیچ کلاسی موجود نیست</option>
            )}
          </select>
          <Input placeholder="نام *" value={form.studentName} onChange={(e) => handleFormChange('studentName', e.target.value)} />
          <Input placeholder="نام خانوادگی *" value={form.studentLastName} onChange={(e) => handleFormChange('studentLastName', e.target.value)} />
          <Input placeholder="نام کاربری (اختیاری)" value={form.studentUsername} onChange={(e) => handleFormChange('studentUsername', e.target.value)} />
          <Input placeholder="رمز عبور (اختیاری)" type="password" value={form.studentPassword} onChange={(e) => handleFormChange('studentPassword', e.target.value)} />
          <p style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '-5px', marginBottom: '10px' }}>در صورت خالی بودن، به صورت خودکار ساخته می‌شود</p>
        </Modal>
      )}

      {/* مودال مدیر */}
      {modals.admin && (
        <Modal title="مدیر مدرسه جدید" onClose={() => { setModals(prev => ({ ...prev, admin: false })); resetForm(); }} onSave={addAdmin} colors={colors}>
          <p style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '12px' }}>مدرسه: {selectedSchool ? schools.find(s => s.id === selectedSchool)?.name : schools[0]?.name || 'انتخاب نشده'}</p>
          <Input placeholder="نام *" value={form.adminName} onChange={(e) => handleFormChange('adminName', e.target.value)} />
          <Input placeholder="نام خانوادگی *" value={form.adminLastName} onChange={(e) => handleFormChange('adminLastName', e.target.value)} />
          <Input placeholder="نام کاربری (اختیاری)" value={form.adminUsername} onChange={(e) => handleFormChange('adminUsername', e.target.value)} />
          <Input placeholder="رمز عبور (اختیاری)" type="password" value={form.adminPassword} onChange={(e) => handleFormChange('adminPassword', e.target.value)} />
          <p style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '-5px', marginBottom: '10px' }}>در صورت خالی بودن، به صورت خودکار ساخته می‌شود</p>
        </Modal>
      )}

      {/* مودال نمایش پسورد */}
      {modals.userPassword && selectedUser && (
        <Modal 
          title="اطلاعات کاربر" 
          onClose={() => { setModals(prev => ({ ...prev, userPassword: false })); setSelectedUser(null); }} 
          onSave={() => { setModals(prev => ({ ...prev, userPassword: false })); setSelectedUser(null); }}
          colors={colors}
          saveText="بستن"
        >
          <div style={{ padding: '10px 0' }}>
            <p style={{ fontSize: '14px', marginBottom: '8px' }}>
              <strong>نام کاربری:</strong> {selectedUser.username}
            </p>
            <p style={{ fontSize: '14px', marginBottom: '8px' }}>
              <strong>رمز عبور:</strong> {selectedUser.password}
            </p>
            <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '12px' }}>
              ⚠️ این اطلاعات را در جای امن نگهداری کنید
            </p>
          </div>
        </Modal>
      )}

      {/* مودال افزودن دانش‌آموز به کلاس */}
      {modals.addStudentToClass && (
        <Modal title="افزودن دانش‌آموز به کلاس" onClose={() => { setModals(prev => ({ ...prev, addStudentToClass: false })); setSelectedStudentsForClass([]); }} onSave={addStudentsToClass} colors={colors}>
          <p style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '12px' }}>دانش‌آموزان مدرسه {schools.find(s => s.id === selectedSchool)?.name}</p>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {users.filter(u => u.schoolId === selectedSchool && u.role === 'student').map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '4px', background: selectedStudentsForClass.includes(s.id) ? `${colors.primary}20` : 'transparent', borderRadius: '8px', cursor: 'pointer' }} onClick={() => {
                if (selectedStudentsForClass.includes(s.id)) {
                  setSelectedStudentsForClass(selectedStudentsForClass.filter(id => id !== s.id));
                } else {
                  setSelectedStudentsForClass([...selectedStudentsForClass, s.id]);
                }
              }}>
                <input type="checkbox" checked={selectedStudentsForClass.includes(s.id)} onChange={() => {}} />
                <p style={{ fontSize: '13px' }}>{s.firstName} {s.lastName}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* مودال افزودن معلم به کلاس */}
      {modals.addTeacherToClass && (
        <Modal title="افزودن معلم به کلاس" onClose={() => { setModals(prev => ({ ...prev, addTeacherToClass: false })); setSelectedTeachersForClass([]); }} onSave={addTeachersToClass} colors={colors}>
          <p style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '12px' }}>معلمان مدرسه {schools.find(s => s.id === selectedSchool)?.name}</p>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {users.filter(u => u.schoolId === selectedSchool && u.role === 'teacher').map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '4px', background: selectedTeachersForClass.includes(t.id) ? `${colors.primary}20` : 'transparent', borderRadius: '8px', cursor: 'pointer' }} onClick={() => {
                if (selectedTeachersForClass.includes(t.id)) {
                  setSelectedTeachersForClass(selectedTeachersForClass.filter(id => id !== t.id));
                } else {
                  setSelectedTeachersForClass([...selectedTeachersForClass, t.id]);
                }
              }}>
                <input type="checkbox" checked={selectedTeachersForClass.includes(t.id)} onChange={() => {}} />
                <p style={{ fontSize: '13px' }}>{t.firstName} {t.lastName}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* مودال ویدیو */}
      {modals.video && (
        <MediaModal type="video" onClose={() => setModals(prev => ({ ...prev, video: false }))} colors={colors} />
      )}

      {/* مودال پادکست */}
      {modals.podcast && (
        <MediaModal type="podcast" onClose={() => setModals(prev => ({ ...prev, podcast: false }))} colors={colors} />
      )}

      {/* ====== نویگیشن موبایل ====== */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, right: 0, left: 0, background: 'white', boxShadow: '0 -2px 20px rgba(0,0,0,0.08)', borderRadius: '28px 28px 0 0', padding: '10px 12px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100 }}>
          {tabs.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                <Icon size={20} color={isActive ? colors.primary : '#999'} />
                <span style={{ fontSize: '10px', color: isActive ? colors.primary : '#999', fontWeight: isActive ? '600' : '400' }}>{item.label}</span>
                {isActive && <div style={{ width: '4px', height: '3px', borderRadius: '2px', background: colors.primary }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ========== کامپوننت‌های کمکی ==========

const DashboardCard = ({ icon, count, label, colors }) => (
  <div style={{ background: colors.cardBg, borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
    <div style={{ color: colors.primary }}>{icon}</div>
    <p style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px' }}>{count}</p>
    <p style={{ fontSize: '12px', color: colors.textSecondary }}>{label}</p>
  </div>
);

const EmptyState = ({ message }) => (
  <div style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
    <p style={{ color: '#78909C' }}>{message}</p>
  </div>
);

const UserItem = ({ user, onDelete, onShowPassword, colors }) => (
  <div style={{ background: 'white', borderRadius: '8px', padding: '8px 12px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <p style={{ fontSize: '12px', fontWeight: '500' }}>{user.firstName} {user.lastName}</p>
      <p style={{ fontSize: '10px', color: colors.textSecondary }}>{user.username}</p>
    </div>
    <div style={{ display: 'flex', gap: '8px' }}>
      <button onClick={onShowPassword} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.primary }}>
        <HiOutlineEye size={14} />
      </button>
      <button onClick={onDelete} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F44336' }}>
        <HiOutlineTrash size={14} />
      </button>
    </div>
  </div>
);

const UserTypeButton = ({ label, color, onClick }) => (
  <button onClick={onClick} style={{ background: color, border: 'none', borderRadius: '10px', padding: '8px 16px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
    <HiOutlineUserAdd size={14} /> {label}
  </button>
);

const Input = ({ placeholder, value, onChange, type = 'text' }) => (
  <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{ width: '100%', padding: '10px', border: `1px solid #4DB6AC`, borderRadius: '10px', marginBottom: '10px', fontSize: '14px' }} />
);

// ========== استایل‌ها ==========

const buttonStyle = (color) => ({
  background: color,
  border: 'none',
  borderRadius: '10px',
  padding: '8px 16px',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontSize: '13px'
});

const smallButtonStyle = (colors) => ({
  background: 'transparent',
  border: 'none',
  color: colors.primary,
  cursor: 'pointer',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
});

const smallTextButton = (colors) => ({
  background: 'transparent',
  border: 'none',
  color: colors.primary,
  cursor: 'pointer',
  fontSize: '11px'
});

const cardStyle = (isExpanded, colors) => ({
  background: colors.cardBg,
  borderRadius: '16px',
  marginBottom: '16px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  border: isExpanded ? `2px solid ${colors.primary}` : '1px solid #eee'
});

const headerStyle = (isExpanded, colors) => ({
  padding: '14px 16px',
  background: isExpanded ? colors.primary : '#f5f5f5',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
});

const deleteButtonStyle = (isExpanded) => ({
  background: isExpanded ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
  border: 'none',
  borderRadius: '8px',
  padding: '5px 10px',
  cursor: 'pointer',
  color: isExpanded ? 'white' : '#F44336'
});

const classCardStyle = (isExpanded, colors) => ({
  background: colors.bg,
  borderRadius: '12px',
  marginBottom: '10px',
  overflow: 'hidden',
  border: isExpanded ? `2px solid ${colors.primary}` : '1px solid #eee'
});

const classHeaderStyle = (isExpanded, colors) => ({
  padding: '12px 16px',
  background: isExpanded ? colors.primary : 'white',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
});

const smallDeleteButton = (isExpanded) => ({
  background: isExpanded ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
  border: 'none',
  borderRadius: '6px',
  padding: '4px 8px',
  cursor: 'pointer',
  color: isExpanded ? 'white' : '#F44336'
});

// ========== مودال ==========

const Modal = ({ title, onClose, onSave, colors, children, saveText = 'ثبت' }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
    <div style={{ background: 'white', borderRadius: '24px', padding: '20px', width: '90%', maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>{title}</h3>
      {children}
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#E0E0E0', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>انصراف</button>
        <button onClick={onSave} style={{ flex: 1, padding: '10px', background: colors.primary, border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>{saveText}</button>
      </div>
    </div>
  </div>
);

// ========== مودال ویدیو/پادکست ==========

const MediaModal = ({ type, onClose, colors }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [xp, setXp] = useState(0);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const categories = type === 'video' ? ['داستانی', 'آموزشی', 'علمی', 'سرگرمی'] : ['داستانی', 'آموزشی', 'انگیزشی', 'کودک'];

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setFileName(f.name); }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !category || !duration || xp <= 0 || !file) {
      alert('لطفاً همه فیلدها را کامل کنید');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('duration', duration);
      formData.append('duration_seconds', parseInt(durationSeconds) || 0);
      formData.append('xp', Number(xp));
      formData.append('description', description.trim() || '');
      formData.append('file', file);
      await apiClient.post(`v1/${type}s`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('با موفقیت ثبت شد');
      onClose();
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || 'خطا در آپلود');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '20px', width: '90%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>{type === 'video' ? 'ویدیو جدید' : 'پادکست جدید'}</h3>
        <Input placeholder="عنوان *" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', border: `1px solid ${colors.primary}`, borderRadius: '10px', marginBottom: '10px', fontSize: '14px' }}>
          <option value="">دسته‌بندی *</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Input placeholder="مدت زمان (مثال: 05:30) *" value={duration} onChange={(e) => setDuration(e.target.value)} />
        <Input placeholder="مدت زمان به ثانیه" value={durationSeconds} onChange={(e) => setDurationSeconds(e.target.value)} type="number" />
        <Input placeholder="امتیاز XP *" value={xp} onChange={(e) => setXp(parseInt(e.target.value) || 0)} type="number" />
        <Input placeholder="توضیحات" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div onClick={() => fileInputRef.current.click()} style={{ width: '100%', padding: '16px', border: `2px dashed ${colors.primary}`, borderRadius: '12px', textAlign: 'center', cursor: 'pointer', marginBottom: '16px', background: fileName ? `${colors.primary}10` : 'transparent' }}>
          <HiOutlineUpload size={24} color={colors.primary} style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: '13px', color: fileName ? colors.primary : colors.textSecondary }}>{fileName || `فایل ${type === 'video' ? 'ویدیو' : 'صوتی'} را انتخاب کنید *`}</p>
          <input ref={fileInputRef} type="file" accept={type === 'video' ? 'video/*' : 'audio/*'} onChange={handleFileChange} style={{ display: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} disabled={uploading} style={{ flex: 1, padding: '10px', background: '#E0E0E0', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>انصراف</button>
          <button onClick={handleSubmit} disabled={uploading} style={{ flex: 1, padding: '10px', background: colors.primary, border: 'none', borderRadius: '10px', color: 'white', cursor: uploading ? 'not-allowed' : 'pointer' }}>
            {uploading ? 'در حال آپلود...' : 'ثبت'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
// src/App.js
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { HealthProvider } from './contexts/HealthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import LocoLogo from './icons/icon26.png';
import Game1 from './game/Game1';

const Home = lazy(() => import('./pages/Home'));
const LukoTV = lazy(() => import('./pages/LukoTV'));
const LukoClub = lazy(() => import('./pages/LukoClub'));
const LukoHealth = lazy(() => import('./pages/LukoHealth'));
const Profile = lazy(() => import('./pages/Profile'));
const Books = lazy(() => import('./pages/Books'));
const LukoPodcast = lazy(() => import('./pages/LukoPodcast'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const SchoolPanel = lazy(() => import('./pages/SchoolPanel'));
const TeacherPanel = lazy(() => import('./pages/TeacherPanel'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));

const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E8F5E9' }}>
    <div style={{ textAlign: 'center' }}>
      <img src={LocoLogo} alt="LocoLearn" style={{ width: '60px', height: '60px', marginBottom: '16px' }} />
      <div style={{ width: '40px', height: '40px', border: '3px solid #4DB6AC', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

// ✅ استفاده از Redirector به جای Navigate
const Redirector = ({ to }) => {
  React.useEffect(() => {
    window.location.href = to;
  }, [to]);
  return <PageLoader />;
};

// ✅ ProtectedRoute با Redirector
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useUser();
  
  if (loading) return <PageLoader />;
  if (!user) return <Redirector to="/login" />;
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const routes = {
      'admin': '/admin-panel',
      'team_admin': '/admin-panel',
      'school_manager': '/school-panel',
      'teacher': '/teacher-panel',
      'parent': `/student-profile/${user.child}`,
      'student': '/'
    };
    return <Redirector to={routes[user.role] || '/'} />;
  }
  
  return children;
};

function AppContent() {
  const { loading } = useUser();
  
  if (loading) return <PageLoader />;
  
  return (
    <HealthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          
          <Route path="/" element={<ProtectedRoute allowedRoles={['student']}><Home /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute allowedRoles={['student']}><Books /></ProtectedRoute>} />
          <Route path="/luko-club" element={<ProtectedRoute allowedRoles={['student']}><LukoClub /></ProtectedRoute>} />
          <Route path="/entertainment" element={<ProtectedRoute allowedRoles={['student']}><LukoTV /></ProtectedRoute>} />
          <Route path="/luko-health" element={<ProtectedRoute allowedRoles={['student']}><LukoHealth /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['student']}><Profile /></ProtectedRoute>} />
          <Route path="/luko-podcast" element={<ProtectedRoute allowedRoles={['student']}><LukoPodcast /></ProtectedRoute>} />
          
          <Route path="/student-profile/:studentName" element={<ProtectedRoute allowedRoles={['parent']}><StudentProfile /></ProtectedRoute>} />
          
          <Route path="/admin-panel" element={<ProtectedRoute allowedRoles={['admin', 'team_admin']}><AdminPanel /></ProtectedRoute>} />
          <Route path="/school-panel" element={<ProtectedRoute allowedRoles={['school_manager']}><SchoolPanel /></ProtectedRoute>} />
          <Route path="/teacher-panel" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherPanel /></ProtectedRoute>} />
          
          <Route path="/Game1" element={<Game1 />} />
          <Route path="*" element={<Redirector to="/" />} />
        </Routes>
      </Suspense>
    </HealthProvider>
  );
}

function App() {
  return (
    <Router>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Router>
  );
}

export default App;
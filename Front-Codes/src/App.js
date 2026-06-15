// src/App.js
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { HealthProvider } from './contexts/HealthContext';
import Login from './pages/Login';
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
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#E8F5E9'
  }}>
    <div style={{ textAlign: 'center' }}>
      <img src={LocoLogo} alt="LocoLearn" style={{ width: '60px', height: '60px', marginBottom: '16px' }} />
      <div style={{
        width: '40px',
        height: '40px',
        border: `3px solid #4DB6AC`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useUser();
  
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (window.location.pathname === '/complete-profile') return children;
  
  if (user.role === 'student' && !user.isProfileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    switch(user.role) {
      case 'admin': return <Navigate to="/admin-panel" replace />;
      case 'school_manager': return <Navigate to="/school-panel" replace />;
      case 'teacher': return <Navigate to="/teacher-panel" replace />;
      case 'parent': return <Navigate to={`/student-profile/${user.child}`} replace />;
      default: return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

function AppContent() {
  const { user, loading } = useUser();
  if (loading) return <PageLoader />;
  
  return (
    <HealthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/" element={<ProtectedRoute allowedRoles={['student']}><Home /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute allowedRoles={['student']}><Books /></ProtectedRoute>} />
          <Route path="/luko-club" element={<ProtectedRoute allowedRoles={['student']}><LukoClub /></ProtectedRoute>} />
          <Route path="/entertainment" element={<ProtectedRoute allowedRoles={['student']}><LukoTV /></ProtectedRoute>} />
          <Route path="/luko-health" element={<ProtectedRoute allowedRoles={['student']}><LukoHealth /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['student']}><Profile /></ProtectedRoute>} />
          <Route path="/luko-podcast" element={<ProtectedRoute allowedRoles={['student']}><LukoPodcast /></ProtectedRoute>} />
          <Route path="/student-profile/:studentName" element={<ProtectedRoute allowedRoles={['parent']}><StudentProfile /></ProtectedRoute>} />
          <Route path="/admin-panel" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
          <Route path="/school-panel" element={<ProtectedRoute allowedRoles={['school_manager']}><SchoolPanel /></ProtectedRoute>} />
          <Route path="/teacher-panel" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherPanel /></ProtectedRoute>} />
       
          <Route path="/Game1" element={<Game1 />} />
          <Route path="*" element={<Navigate to="/" replace />} />
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
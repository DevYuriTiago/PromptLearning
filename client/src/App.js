import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './App.css';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Components
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

// Student Components
import HomePage from './components/home/HomePage';
import ModuleDetails from './components/modules/ModuleDetails';
import ModuleViewer from './components/modules/ModuleViewer';
import ProfilePage from './components/profile/ProfilePage';
import AchievementsPage from './components/achievements/AchievementsPage';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import ContentManager from './components/admin/ContentManager';
import PDFViewer from './components/admin/PDFViewer';
import AnalyticsDashboard from './components/admin/AnalyticsDashboard';
import UserManager from './components/admin/UserManager';

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {session ? (
        <>
          <Navbar />
          <div className="main-content">
            <Sidebar />
            <div className="content-area">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/register" element={<Navigate to="/" replace />} />

                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
                <Route path="/module/:id" element={<ProtectedRoute><ModuleDetails /></ProtectedRoute>} />
                <Route path="/module/:id/view" element={<ProtectedRoute><ModuleViewer /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/notes" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/category/:category" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/completed" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/in-progress" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/content" element={<ProtectedRoute adminOnly><ContentManager /></ProtectedRoute>} />
                <Route path="/admin/pdf/:id" element={<ProtectedRoute adminOnly><PDFViewer /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AnalyticsDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute adminOnly><UserManager /></ProtectedRoute>} />
              </Routes>
            </div>
          </div>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;

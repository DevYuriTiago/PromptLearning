import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authService } from './services/supabaseService';
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await authService.supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (session?.user) {
          const currentUser = await authService.getCurrentUser();
          if (mounted) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = authService.supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {user && <Navbar user={user} />}
        
        <div className="main-content">
          {user && <Sidebar user={user} />}
          
          <div className="content-area">
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/login" element={
                !user ? <LoginPage /> : <Navigate to="/" />
              } />
              <Route path="/register" element={
                !user ? <RegisterPage /> : <Navigate to="/" />
              } />

              {/* Rotas Protegidas - Estudante */}
              <Route path="/" element={
                <ProtectedRoute user={user}>
                  <HomePage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute user={user}>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/achievements" element={
                <ProtectedRoute user={user}>
                  <AchievementsPage />
                </ProtectedRoute>
              } />
              <Route path="/module/:moduleId" element={
                <ProtectedRoute user={user}>
                  <ModuleViewer />
                </ProtectedRoute>
              } />
              <Route path="/module/:moduleId/details" element={
                <ProtectedRoute user={user}>
                  <ModuleDetails />
                </ProtectedRoute>
              } />

              {/* Rotas Protegidas - Admin */}
              <Route path="/admin" element={
                <ProtectedRoute user={user} requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/content" element={
                <ProtectedRoute user={user} requiredRole="admin">
                  <ContentManager />
                </ProtectedRoute>
              } />
              <Route path="/admin/pdf-viewer" element={
                <ProtectedRoute user={user} requiredRole="admin">
                  <PDFViewer />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute user={user} requiredRole="admin">
                  <AnalyticsDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute user={user} requiredRole="admin">
                  <UserManager />
                </ProtectedRoute>
              } />

              {/* Rota 404 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

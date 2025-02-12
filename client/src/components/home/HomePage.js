import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { moduleService } from '../../services/moduleService';
import { progressService } from '../../services/progressService';
import { gamificationService } from '../../services/gamificationService';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';
import FeaturedModule from './FeaturedModule';
import ModuleRow from './ModuleRow';
import SearchBar from '../common/SearchBar';
import UserProgress from '../common/UserProgress';
import ModuleCard from '../modules/ModuleCard';
import './HomePage.css';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState({
    featured: [],
    inProgress: [],
    recommended: [],
    popular: [],
    newReleases: []
  });
  const [userStats, setUserStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user) {
      loadContent();
      loadUserStats();
      loadNotifications();
      setupNotificationSubscription();
    } else {
      navigate('/login');
    }
  }, [session, navigate]);

  const setupNotificationSubscription = () => {
    if (session?.user) {
      const subscription = notificationService.subscribeToNotifications(
        session.user.id,
        (notification) => {
          setNotifications(prev => [notification, ...prev]);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await gamificationService.getUserProfile(session.user.id);
      setUserStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do usuário:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const recentNotifications = await notificationService.getNotifications(
        session.user.id,
        { unreadOnly: true, limit: 5 }
      );
      setNotifications(recentNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const loadContent = async () => {
    try {
      setLoading(true);

      // Carregar todos os módulos
      const allModules = await moduleService.getModules();

      // Carregar progresso do usuário
      const progress = await progressService.getUserProgress(session.user.id);

      // Atualizar streak do usuário
      await gamificationService.updateStreak(session.user.id);

      // Filtrar módulos
      const featured = allModules?.filter(m => m.featured) || [];

      const inProgress = progress?.filter(p => p.status === 'in_progress').map(p => {
        const module = allModules.find(m => m.id === p.module_id);
        return module ? {
          ...module,
          progress: p.progress
        } : null;
      }).filter(Boolean) || [];
      
      // Recomendações baseadas no nível e progresso do usuário
      const userLevel = userStats?.level || 1;
      const recommended = allModules?.filter(m => 
        m.recommended_level <= userLevel && 
        !inProgress.some(p => p.id === m.id)
      ).slice(0, 5) || [];

      // Módulos populares baseados em estatísticas
      const popular = allModules?.sort((a, b) => 
        (b.total_ratings || 0) - (a.total_ratings || 0)
      ).slice(0, 5) || [];

      // Lançamentos recentes
      const newReleases = allModules?.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 5) || [];

      setModules({
        featured,
        inProgress,
        recommended,
        popular,
        newReleases
      });

    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const results = Object.values(modules)
        .flat()
        .filter(module => 
          module?.title?.toLowerCase().includes(query.toLowerCase()) ||
          module?.description?.toLowerCase().includes(query.toLowerCase())
        );

      setSearchResults(results);
    } catch (error) {
      console.error('Erro na busca:', error);
      setSearchResults([]);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Bem-vindo ao PromptLearning</h1>
        <SearchBar onSearch={handleSearch} />
        
        {userStats && (
          <div className="user-stats">
            <div className="level-info">
              <span>Nível {userStats.level}</span>
              <div className="xp-bar">
                <div 
                  className="xp-progress" 
                  style={{ width: `${(userStats.xp / userStats.xpForNextLevel) * 100}%` }}
                />
              </div>
              <span>{userStats.xp} / {userStats.xpForNextLevel} XP</span>
            </div>
            <div className="streak-info">
              <span>🔥 {userStats.streak_days} dias seguidos</span>
            </div>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="notifications-preview">
            {notifications.map(notification => (
              <div key={notification.id} className="notification-item">
                <span className="notification-title">{notification.title}</span>
                <p className="notification-message">{notification.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="content-container">
        {searchResults ? (
          <div className="search-results">
            <h2>Resultados da Busca</h2>
            <div className="modules-grid">
              {searchResults.map(module => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <UserProgress progress={userStats} />

            {modules.featured.length > 0 && (
              <section className="featured-section">
                <h2>Módulos em Destaque</h2>
                <FeaturedModule module={modules.featured[0]} />
              </section>
            )}

            {modules.inProgress.length > 0 && (
              <ModuleRow
                title="Continue Aprendendo"
                modules={modules.inProgress}
                showProgress
              />
            )}

            {modules.recommended.length > 0 && (
              <ModuleRow
                title="Recomendados para Você"
                modules={modules.recommended}
              />
            )}

            {modules.popular.length > 0 && (
              <ModuleRow
                title="Mais Populares"
                modules={modules.popular}
              />
            )}

            {modules.newReleases.length > 0 && (
              <ModuleRow
                title="Lançamentos"
                modules={modules.newReleases}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;

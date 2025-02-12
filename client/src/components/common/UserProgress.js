import React from 'react';
import { CircularProgress, LinearProgress } from '@mui/material';
import { progressService } from '../../services/supabaseService';
import { useAuth } from '../../hooks/useAuth';
import './UserProgress.css';

const UserProgress = () => {
  const [progress, setProgress] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const { session } = useAuth();

  React.useEffect(() => {
    if (session?.user?.id) {
      loadProgress();
    }
  }, [session]);

  const loadProgress = async () => {
    try {
      if (!session?.user?.id) {
        console.error('UserId não fornecido para UserProgress');
        setLoading(false);
        return;
      }

      const { data, error } = await progressService.getStudentProgress(session.user.id);
      if (error) throw error;

      const processedProgress = data || {};

      setProgress(processedProgress);
    } catch (err) {
      console.error('Erro ao carregar progresso:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-progress-loading">
        <div className="loader"></div>
      </div>
    );
  }

  if (!progress) return null;

  const {
    level,
    xp,
    xpForNextLevel,
    points,
    streak_days,
    badges = [],
    achievements = []
  } = progress;

  const xpProgress = (xp / xpForNextLevel) * 100;

  const recentBadges = badges.slice(0, 3);
  const recentAchievements = achievements.slice(0, 3);

  return (
    <div className="user-progress">
      <div className="progress-section level-section">
        <div className="level-display">
          <CircularProgress
            variant="determinate"
            value={xpProgress}
            size={80}
            thickness={4}
            sx={{
              color: '#00ff00',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <div className="level-number">
            <span>{level}</span>
          </div>
        </div>
        <div className="level-info">
          <h3>Nível {level}</h3>
          <div className="xp-bar">
            <LinearProgress
              variant="determinate"
              value={xpProgress}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  background: 'linear-gradient(90deg, #00ff00, #00cc00)',
                },
              }}
            />
            <span className="xp-text">
              {xp} / {xpForNextLevel} XP
            </span>
          </div>
        </div>
      </div>

      <div className="progress-section stats-section">
        <div className="stat-item">
          <span className="stat-label">Pontos</span>
          <span className="stat-value">{points}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Sequência</span>
          <span className="stat-value">🔥 {streak_days} dias</span>
        </div>
      </div>

      {recentBadges.length > 0 && (
        <div className="progress-section badges-section">
          <h3>Medalhas Recentes</h3>
          <div className="badges-grid">
            {recentBadges.map(badge => (
              <div key={badge.id} className="badge-item" title={badge.description}>
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentAchievements.length > 0 && (
        <div className="progress-section achievements-section">
          <h3>Conquistas Recentes</h3>
          <div className="achievements-grid">
            {recentAchievements.map(achievement => (
              <div 
                key={achievement.id} 
                className="achievement-item"
                title={achievement.description}
              >
                <span className="achievement-icon">{achievement.icon}</span>
                <div className="achievement-info">
                  <span className="achievement-name">{achievement.name}</span>
                  <span className="achievement-points">+{achievement.points} pontos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProgress;

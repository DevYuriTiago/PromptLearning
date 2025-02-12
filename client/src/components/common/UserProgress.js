import React, { useState, useEffect } from 'react';
import { progressService } from '../../services/supabaseService';
import './UserProgress.css';

const UserProgress = ({ userId }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [userId]);

  const loadProgress = async () => {
    try {
      if (!userId) {
        console.error('UserId não fornecido para UserProgress');
        setLoading(false);
        return;
      }

      const { data, error } = await progressService.getStudentProgress(userId);
      if (error) throw error;

      const processedProgress = data?.map(item => ({
        moduleId: item.module?.id,
        moduleTitle: item.module?.title,
        sectionId: item.section?.id,
        sectionTitle: item.section?.title,
        progress: item.progress || 0,
        status: item.status || 'not_started',
        pointsEarned: item.points_earned || 0
      })) || [];

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

  if (!progress) {
    return null;
  }

  return (
    <div className="user-progress">
      <div className="progress-header">
        <h2>Seu Progresso</h2>
        <div className="overall-progress">
          <div className="progress-circle">
            <svg viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e50914"
                strokeWidth="3"
                strokeDasharray={`${progress.overallProgress}, 100`}
              />
            </svg>
            <span>{progress.overallProgress}%</span>
          </div>
          <div className="progress-stats">
            <div className="stat">
              <span>{progress.completedModules}</span>
              <label>Módulos Concluídos</label>
            </div>
            <div className="stat">
              <span>{progress.totalHours}h</span>
              <label>Horas de Estudo</label>
            </div>
          </div>
        </div>
      </div>

      <div className="current-modules">
        <h3>Módulos em Andamento</h3>
        {progress.currentModules?.length > 0 ? (
          <div className="modules-list">
            {progress.currentModules.map(module => (
              <div key={module.id} className="module-progress-item">
                <div className="module-info">
                  <h4>{module.title}</h4>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${module.progress}%` }}
                    ></div>
                  </div>
                </div>
                <span className="progress-percentage">{module.progress}%</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-modules">
            Você ainda não começou nenhum módulo.
            <br />
            <a href="/modules">Explorar módulos</a>
          </p>
        )}
      </div>

      {progress.achievements?.length > 0 && (
        <div className="recent-achievements">
          <h3>Conquistas Recentes</h3>
          <div className="achievements-list">
            {progress.achievements.map(achievement => (
              <div key={achievement.id} className="achievement-item">
                <div className="achievement-icon">
                  <i className={achievement.icon}></i>
                </div>
                <div className="achievement-info">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
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

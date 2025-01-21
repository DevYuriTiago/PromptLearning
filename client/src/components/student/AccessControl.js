import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService, progressService } from '../../services/supabaseService';
import './accessControl.css';

const AccessControl = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { moduleId } = useParams();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Verificar se o usuário está autenticado
        const { data: { user } } = await authService.getCurrentUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Verificar progresso do módulo
        const progress = await progressService.getStudentProgress(user.id);
        const moduleAccess = progress.find(p => p.module_id === moduleId);
        
        if (!moduleAccess) {
          // Registrar primeiro acesso
          await progressService.updateProgress(user.id, moduleId, {
            currentPage: 1,
            completed: false
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Erro ao verificar acesso:', err);
        setError('Erro ao verificar acesso ao módulo');
        setLoading(false);
      }
    };

    checkAccess();
  }, [moduleId, navigate]);

  if (loading) {
    return (
      <div className="access-control-loading">
        <div className="spinner"></div>
        <p>Verificando acesso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="access-control-error">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle error-icon"></i>
          <h2>Erro ao Verificar Acesso</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </button>
            <button 
              className="back-button"
              onClick={() => navigate(-1)}
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="access-control-wrapper">
      {/* Adiciona uma camada extra de proteção */}
      <div 
        className="protection-layer"
        onContextMenu={(e) => e.preventDefault()}
      >
        {children}
      </div>

      {/* Overlay de proteção contra capturas de tela */}
      <div className="screen-capture-protection">
        <div className="watermark">
          Documento Protegido - ID: {moduleId}
        </div>
      </div>
    </div>
  );
};

export default AccessControl;

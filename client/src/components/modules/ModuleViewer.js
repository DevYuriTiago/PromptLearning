import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentService, progressService } from '../../services/supabaseService';
import './ModuleViewer.css';

const ModuleViewer = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    try {
      const data = await contentService.getModuleContent(moduleId);
      setModule(data);
      setTotalPages(data.pages.length);
      
      // Carregar progresso salvo
      const savedProgress = await progressService.getModuleProgress(moduleId);
      if (savedProgress) {
        setCurrentPage(savedProgress.currentPage);
        setProgress(savedProgress.progress);
      }
    } catch (err) {
      setError('Erro ao carregar o módulo');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    setCurrentPage(newPage);
    const newProgress = Math.round((newPage / totalPages) * 100);
    setProgress(newProgress);

    try {
      await progressService.updateProgress(moduleId, {
        currentPage: newPage,
        progress: newProgress
      });
    } catch (err) {
      console.error('Erro ao salvar progresso:', err);
    }
  };

  if (loading) {
    return (
      <div className="module-viewer-loading">
        <div className="loader"></div>
        <p>Carregando módulo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="module-viewer-error">
        <h2>Erro</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Voltar para Home</button>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="module-viewer-not-found">
        <h2>Módulo não encontrado</h2>
        <button onClick={() => navigate('/')}>Voltar para Home</button>
      </div>
    );
  }

  return (
    <div className="module-viewer">
      <div className="module-viewer-header">
        <button 
          className="back-button"
          onClick={() => navigate(`/module/${moduleId}`)}
        >
          <i className="fas fa-arrow-left"></i>
          Voltar
        </button>

        <div className="module-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span>{progress}% concluído</span>
        </div>

        <div className="page-info">
          Página {currentPage} de {totalPages}
        </div>
      </div>

      <div className="module-viewer-content">
        <div className="content-wrapper">
          {module.pages[currentPage - 1]?.content}
        </div>

        <div className="module-viewer-navigation">
          <button
            className="nav-button prev"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left"></i>
            Anterior
          </button>

          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-number ${page === currentPage ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="nav-button next"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próxima
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleViewer;

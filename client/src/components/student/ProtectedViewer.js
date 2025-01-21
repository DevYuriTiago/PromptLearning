import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page } from 'react-pdf';
import { authService, contentService, progressService, achievementService } from '../../services/supabaseService';
import './protectedViewer.css';

const ProtectedViewer = () => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { moduleId } = useParams();

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    try {
      setLoading(true);
      
      // Obter usuário atual
      const { data: { user } } = await authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Carregar dados do módulo
      const modules = await contentService.getModules();
      const module = modules.find(m => m.id === moduleId);
      if (!module) {
        throw new Error('Módulo não encontrado');
      }
      setModuleData(module);

      // Carregar progresso do usuário
      const progress = await progressService.getStudentProgress(user.id);
      const userProgress = progress.find(p => p.module_id === moduleId);
      
      if (userProgress) {
        setCurrentPage(userProgress.current_page || 1);
      }

      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar módulo:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePageChange = async (newPage) => {
    try {
      const { data: { user } } = await authService.getCurrentUser();
      if (!user) return;

      setCurrentPage(newPage);

      // Atualizar progresso
      await progressService.updateProgress(user.id, moduleId, {
        currentPage: newPage,
        completed: newPage === numPages
      });

      // Se chegou na última página, marcar como completo
      if (newPage === numPages) {
        await achievementService.checkAndAwardAchievements(user.id);
      }
    } catch (err) {
      console.error('Erro ao atualizar progresso:', err);
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="protected-viewer">
      <div className="pdf-controls">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {numPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= numPages}
        >
          Próxima
        </button>
      </div>

      <div className="pdf-container">
        <Document
          file={moduleData?.pdf_url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div>Carregando PDF...</div>}
        >
          <Page
            pageNumber={currentPage}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );
};

export default ProtectedViewer;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentService } from '../../services/supabaseService';
import './ModuleDetails.css';

const ModuleDetails = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadModuleDetails();
  }, [moduleId]);

  const loadModuleDetails = async () => {
    try {
      const data = await contentService.getModuleDetails(moduleId);
      setModule(data);
    } catch (err) {
      setError('Erro ao carregar detalhes do módulo');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="module-details-loading">
        <div className="loader"></div>
        <p>Carregando detalhes do módulo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="module-details-error">
        <h2>Erro</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Voltar para Home</button>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="module-details-not-found">
        <h2>Módulo não encontrado</h2>
        <button onClick={() => navigate('/')}>Voltar para Home</button>
      </div>
    );
  }

  return (
    <div className="module-details">
      <div className="module-header">
        <div className="module-info">
          <h1>{module.title}</h1>
          <div className="module-meta">
            <span className="category">{module.category}</span>
            <span className="difficulty">
              <i className="fas fa-signal"></i>
              {module.difficulty_level}
            </span>
            <span className="duration">
              <i className="fas fa-clock"></i>
              {module.estimated_time} min
            </span>
            {module.rating && (
              <span className="rating">
                <i className="fas fa-star"></i>
                {module.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        
        <button 
          className="start-button"
          onClick={() => navigate(`/module/${moduleId}/view`)}
        >
          <i className="fas fa-play"></i>
          Começar Agora
        </button>
      </div>

      <div className="module-content">
        <div className="module-description">
          <h2>Sobre este módulo</h2>
          <p>{module.description}</p>
        </div>

        <div className="module-objectives">
          <h2>Objetivos de Aprendizagem</h2>
          <ul>
            {module.learning_objectives?.map((objective, index) => (
              <li key={index}>
                <i className="fas fa-check"></i>
                {objective}
              </li>
            ))}
          </ul>
        </div>

        {module.requirements && (
          <div className="module-requirements">
            <h2>Pré-requisitos</h2>
            <ul>
              {module.requirements.map((req, index) => (
                <li key={index}>
                  <i className="fas fa-arrow-right"></i>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {module.materials && (
          <div className="module-materials">
            <h2>Material Complementar</h2>
            <div className="materials-grid">
              {module.materials.map((material, index) => (
                <div key={index} className="material-card">
                  <div className="material-icon">
                    <i className={`fas fa-${material.type === 'pdf' ? 'file-pdf' : 
                      material.type === 'video' ? 'video' : 
                      material.type === 'audio' ? 'headphones' : 'file-alt'}`}></i>
                  </div>
                  <div className="material-info">
                    <h3>{material.title}</h3>
                    <p>{material.description}</p>
                  </div>
                  <button onClick={() => window.open(material.url, '_blank')}>
                    <i className="fas fa-download"></i>
                    Baixar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleDetails;

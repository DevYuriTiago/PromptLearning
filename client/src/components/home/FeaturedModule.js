import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FeaturedModule.css';

const FeaturedModule = ({ module }) => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(`/module/${module.id}`);
  };

  const handleMoreInfo = () => {
    navigate(`/module/${module.id}/details`);
  };

  return (
    <div className="featured-module">
      <div className="featured-background">
        <img 
          src={module.thumbnail_url} 
          alt={module.title}
          className="featured-image"
        />
        <div className="vignette"></div>
      </div>

      <div className="featured-content">
        <div className="featured-category">
          <span className="category-tag">{module.category}</span>
          {module.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        <h1 className="featured-title">{module.title}</h1>
        
        <div className="featured-meta">
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

        <p className="featured-description">{module.description}</p>

        <div className="featured-objectives">
          <h3>Objetivos de Aprendizagem:</h3>
          <ul>
            {module.learning_objectives?.slice(0, 3).map((objective, index) => (
              <li key={index}>
                <i className="fas fa-check"></i>
                {objective}
              </li>
            ))}
          </ul>
        </div>

        <div className="featured-buttons">
          <button 
            className="start-button"
            onClick={handleStart}
          >
            <i className="fas fa-play"></i>
            Começar Agora
          </button>
          
          <button 
            className="info-button"
            onClick={handleMoreInfo}
          >
            <i className="fas fa-info-circle"></i>
            Mais Informações
          </button>
        </div>

        {module.requirements && (
          <div className="featured-requirements">
            <p>Pré-requisitos:</p>
            <ul>
              {module.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedModule;

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ModuleRow.css';

const ModuleRow = ({ title, modules, showProgress = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const rowRef = useRef(null);
  const navigate = useNavigate();

  const handlePrevious = () => {
    setStartIndex(Math.max(0, startIndex - 4));
  };

  const handleNext = () => {
    setStartIndex(Math.min(modules.length - 4, startIndex + 4));
  };

  const handleModuleClick = (moduleId) => {
    navigate(`/module/${moduleId}`);
  };

  return (
    <div 
      className="module-row"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 className="row-title">{title}</h2>
      
      <div className="row-content" ref={rowRef}>
        {isHovered && startIndex > 0 && (
          <button 
            className="nav-button prev"
            onClick={handlePrevious}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        )}

        <div className="modules-slider" style={{
          transform: `translateX(-${startIndex * 280}px)`
        }}>
          {modules.map(module => (
            <div 
              key={module.id}
              className="module-card"
              onClick={() => handleModuleClick(module.id)}
            >
              <div className="module-thumbnail">
                <img 
                  src={module.thumbnail_url} 
                  alt={module.title}
                  loading="lazy"
                />
                {showProgress && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${module.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>

              <div className="module-info">
                <h3>{module.title}</h3>
                <div className="module-meta">
                  <span className="difficulty">
                    {module.difficulty_level}
                  </span>
                  <span className="duration">
                    {module.estimated_time} min
                  </span>
                  {module.rating && (
                    <span className="rating">
                      <i className="fas fa-star"></i>
                      {module.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="description">{module.description}</p>
                
                <div className="module-tags">
                  {module.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="hover-info">
                <div className="hover-content">
                  <h4>{module.title}</h4>
                  <p>{module.description}</p>
                  <div className="hover-meta">
                    <span>{module.estimated_time} min</span>
                    <span>{module.difficulty_level}</span>
                    {module.rating && (
                      <span>
                        <i className="fas fa-star"></i>
                        {module.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="hover-objectives">
                    <h5>Você vai aprender:</h5>
                    <ul>
                      {module.learning_objectives?.slice(0, 3).map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                  <button className="start-button">
                    Começar Agora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isHovered && startIndex < modules.length - 4 && (
          <button 
            className="nav-button next"
            onClick={handleNext}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default ModuleRow;

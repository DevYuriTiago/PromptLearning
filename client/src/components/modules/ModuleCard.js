import React from 'react';
import './ModuleCard.css';

const ModuleCard = ({ module, onClick }) => {
  return (
    <div className="module-card" onClick={onClick}>
      <div className="module-card-content">
        <h3 className="module-title">{module.title}</h3>
        <p className="module-description">{module.description}</p>
      </div>
      <div className="module-card-footer">
        <button className="start-button">Start Module</button>
      </div>
    </div>
  );
};

export default ModuleCard;

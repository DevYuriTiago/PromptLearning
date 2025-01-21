import React, { useState, useEffect } from 'react';

const StudentDashboard = () => {
  const [progress, setProgress] = useState(0);
  const [coins, setCoins] = useState(0);
  const [badges, setBadges] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);

  // Anti-copy functionality
  useEffect(() => {
    const preventCopy = (e) => {
      e.preventDefault();
      alert('Content copying is disabled for security reasons.');
    };

    const preventInspect = (e) => {
      if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73)) {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', preventCopy);
    document.addEventListener('keydown', preventInspect);
    document.addEventListener('contextmenu', e => e.preventDefault());

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('keydown', preventInspect);
      document.removeEventListener('contextmenu', e => e.preventDefault());
    };
  }, []);

  return (
    <div className="student-dashboard">
      <div className="progress-header">
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="stats">
          <span>🪙 {coins} coins</span>
          <span>📚 Level {Math.floor(progress / 10) + 1}</span>
        </div>
      </div>

      <div className="learning-map">
        {/* Interactive map showing course progression */}
        <div className="map-nodes">
          {[1, 2, 3, 4, 5].map((node) => (
            <div 
              key={node}
              className={`map-node ${progress >= node * 20 ? 'completed' : 'locked'}`}
              onClick={() => setCurrentModule(node)}
            >
              Level {node}
            </div>
          ))}
        </div>
      </div>

      {currentModule && (
        <div className="content-viewer">
          <h2>Module {currentModule}</h2>
          <div className="protected-content" 
               style={{
                 userSelect: 'none',
                 WebkitUserSelect: 'none'
               }}>
            {/* Module content will be loaded here */}
            <p>Protected content for Module {currentModule}</p>
          </div>
        </div>
      )}

      <div className="achievements">
        <h3>Your Achievements</h3>
        <div className="badges-container">
          {badges.map((badge, index) => (
            <div key={index} className="badge">
              {badge.icon} {badge.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

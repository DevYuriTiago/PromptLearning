import React, { useEffect, useRef } from 'react';

const ProtectedContent = ({ content, watermark }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    // Add invisible watermark
    const addWatermark = () => {
      if (contentRef.current) {
        const text = contentRef.current.innerText;
        const watermarkedText = text.split('').map(char => 
          char + String.fromCharCode(8203) + watermark
        ).join('');
        contentRef.current.innerHTML = watermarkedText;
      }
    };

    // Disable developer tools (basic protection)
    const disableDevTools = () => {
      if (window.devtools.isOpen) {
        window.location.href = '/access-denied';
      }
    };

    // Prevent screenshots (where supported)
    document.addEventListener('keyup', (e) => {
      if ((e.key === 'PrintScreen' || 
          (e.ctrlKey && e.key === 'p') || 
          (e.ctrlKey && e.key === 'P'))) {
        e.preventDefault();
        alert('Screenshots are not allowed!');
      }
    });

    // Add protection layers
    addWatermark();
    const interval = setInterval(disableDevTools, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [watermark]);

  return (
    <div 
      ref={contentRef}
      className="protected-content"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        position: 'relative',
        background: '#fff'
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {content}
      
      {/* Overlay to prevent screen capture */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: 'transparent',
          zIndex: 1000
        }}
      />
    </div>
  );
};

export default ProtectedContent;

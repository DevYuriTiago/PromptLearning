import React, { useEffect } from 'react';
import { contentProtectionService } from '../../services/contentProtectionService';

const ContentProtection = ({ children }) => {
  useEffect(() => {
    // Inicializa as proteções quando o componente monta
    contentProtectionService.initProtection();

    // Limpa as proteções quando o componente desmonta
    return () => {
      document.removeEventListener('contextmenu', (e) => e.preventDefault());
      document.removeEventListener('keydown', contentProtectionService.disableKeyboardShortcuts);
      document.removeEventListener('selectstart', (e) => e.preventDefault());
    };
  }, []);

  return (
    <div className="protected-content">
      {children}
    </div>
  );
};

export default ContentProtection;

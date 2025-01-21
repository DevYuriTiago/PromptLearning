import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { contentService } from '../../services/supabaseService';
import PDFViewer from './PDFViewer';

const ContentManager = () => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const modulesList = await contentService.getModules();
      setModules(modulesList);
    } catch (err) {
      setError('Erro ao carregar módulos: ' + err.message);
    }
  };

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      setError('Por favor, envie apenas arquivos PDF.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const moduleInfo = {
        title: file.name.replace('.pdf', ''),
        description: 'Novo módulo de conteúdo',
        type: 'pdf'
      };

      await contentService.uploadPDF(file, moduleInfo);
      await loadModules();
      
    } catch (err) {
      setError('Erro ao processar PDF: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Tem certeza que deseja excluir este módulo?')) {
      try {
        await contentService.deleteModule(moduleId);
        await loadModules();
        setSelectedModule(null);
        setShowPdfViewer(false);
      } catch (err) {
        setError('Erro ao excluir módulo: ' + err.message);
      }
    }
  };

  const handleEditModule = async (moduleId, updates) => {
    try {
      await contentService.updateModule(moduleId, updates);
      await loadModules();
    } catch (err) {
      setError('Erro ao atualizar módulo: ' + err.message);
    }
  };

  return (
    <div className="content-manager">
      <div className="content-header">
        <h2>Gerenciador de Conteúdo</h2>
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          <p>Arraste um arquivo PDF aqui ou clique para selecionar</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {processing && <div className="processing-message">Processando arquivo...</div>}

      <div className="modules-list">
        {modules.map(module => (
          <div key={module.id} className="module-item">
            <h3>{module.title}</h3>
            <p>{module.description}</p>
            <div className="module-actions">
              <button onClick={() => {
                setSelectedModule(module);
                setShowPdfViewer(true);
              }}>
                Visualizar
              </button>
              <button onClick={() => handleDeleteModule(module.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedModule && showPdfViewer && (
        <PDFViewer
          moduleId={selectedModule.id}
          onClose={() => setShowPdfViewer(false)}
          onEdit={handleEditModule}
        />
      )}
    </div>
  );
};

export default ContentManager;

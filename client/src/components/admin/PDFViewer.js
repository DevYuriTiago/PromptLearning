import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { contentService } from '../../services/supabaseService';
import contentProtection from '../../services/contentProtection';

// Configuração necessária para o react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ moduleId, onClose, onEdit }) => {
  const [module, setModule] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [sections, setSections] = useState([]);
  const [editingSection, setEditingSection] = useState(null);

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    try {
      const moduleData = await contentService.getModuleById(moduleId);
      setModule(moduleData);
      setSections(moduleData.sections || []);
    } catch (err) {
      console.error('Erro ao carregar módulo:', err);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage => Math.max(currentPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage => Math.min(currentPage + 1, numPages));
  };

  const handleZoomIn = () => {
    setScale(scale => Math.min(scale + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setScale(scale => Math.max(scale - 0.1, 0.5));
  };

  const handleAddSection = () => {
    setSections([...sections, {
      title: 'Nova Seção',
      page: currentPage,
      content: ''
    }]);
  };

  const handleSaveSection = async (section, index) => {
    const updatedSections = [...sections];
    updatedSections[index] = section;
    setSections(updatedSections);
    setEditingSection(null);

    try {
      await contentService.updateModule(moduleId, { sections: updatedSections });
      onEdit && onEdit(moduleId, { sections: updatedSections });
    } catch (err) {
      console.error('Erro ao salvar seção:', err);
    }
  };

  const handleDeleteSection = async (index) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    setSections(updatedSections);

    try {
      await contentService.updateModule(moduleId, { sections: updatedSections });
      onEdit && onEdit(moduleId, { sections: updatedSections });
    } catch (err) {
      console.error('Erro ao excluir seção:', err);
    }
  };

  if (!module) return <div>Carregando...</div>;

  return (
    <div className="pdf-viewer">
      <div className="pdf-controls">
        <button onClick={handlePrevPage} disabled={currentPage <= 1}>Anterior</button>
        <span>Página {currentPage} de {numPages}</span>
        <button onClick={handleNextPage} disabled={currentPage >= numPages}>Próxima</button>
        <button onClick={handleZoomIn}>+</button>
        <button onClick={handleZoomOut}>-</button>
        <button onClick={onClose}>Fechar</button>
      </div>

      <div className="pdf-container">
        <Document
          file={module.pdf_url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div>Carregando PDF...</div>}
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>

        <div className="sections-panel">
          <div className="sections-header">
            <h3>Seções</h3>
            <button onClick={handleAddSection}>Adicionar Seção</button>
          </div>

          <div className="sections-list">
            {sections.map((section, index) => (
              <div key={index} className="section-item">
                {editingSection === index ? (
                  <div className="section-edit">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const updatedSection = { ...section, title: e.target.value };
                        handleSaveSection(updatedSection, index);
                      }}
                    />
                    <button onClick={() => setEditingSection(null)}>Salvar</button>
                  </div>
                ) : (
                  <div className="section-view">
                    <span>{section.title} (Página {section.page})</span>
                    <div className="section-actions">
                      <button onClick={() => setEditingSection(index)}>Editar</button>
                      <button onClick={() => handleDeleteSection(index)}>Excluir</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;

import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { Box, IconButton, Typography, LinearProgress } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import ContentProtection from '../common/ContentProtection';

const ProtectedPDFViewer = ({ url, onProgress }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    if (onProgress) {
      onProgress({
        lastPosition: pageNumber,
        status: pageNumber === numPages ? 'completed' : 'in_progress'
      });
    }
  };

  const changePage = (offset) => {
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
      if (onProgress) {
        onProgress({
          lastPosition: newPage,
          status: newPage === numPages ? 'completed' : 'in_progress'
        });
      }
    }
  };

  return (
    <ContentProtection>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {loading && <LinearProgress sx={{ width: '100%', mb: 2 }} />}
        
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<LinearProgress />}
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>

        <Box sx={{ 
          mt: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          width: '100%',
          justifyContent: 'center'
        }}>
          <IconButton 
            onClick={() => changePage(-1)} 
            disabled={pageNumber <= 1}
          >
            <ChevronLeft />
          </IconButton>

          <Typography>
            Página {pageNumber} de {numPages}
          </Typography>

          <IconButton 
            onClick={() => changePage(1)} 
            disabled={pageNumber >= numPages}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Barra de progresso */}
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={(pageNumber / numPages) * 100} 
          />
          <Typography variant="caption" sx={{ mt: 1 }}>
            Progresso: {Math.round((pageNumber / numPages) * 100)}%
          </Typography>
        </Box>
      </Box>
    </ContentProtection>
  );
};

export default ProtectedPDFViewer;

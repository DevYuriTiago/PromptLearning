import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Slider,
  Button,
  useTheme,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import { useSnackbar } from 'notistack';

// Configuração do worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ pdfUrl, onClose }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPageNumber(1);
  }, [pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Erro ao carregar o PDF. Por favor, tente novamente.');
    setLoading(false);
    enqueueSnackbar('Erro ao carregar o PDF', { variant: 'error' });
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  const handlePageChange = (newPage) => {
    setPageNumber(newPage);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      enqueueSnackbar('Erro ao baixar o PDF', { variant: 'error' });
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(45deg, rgba(0,255,0,0.05) 0%, rgba(0,255,0,0.02) 100%)',
        border: '1px solid rgba(0,255,0,0.2)',
      }}
    >
      {/* Controles */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          px: 2,
        }}
      >
        <Typography variant="h6" color="primary">
          Visualizador de PDF
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={handleZoomOut} disabled={scale <= 0.5}>
            <ZoomOutIcon />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>
          <IconButton onClick={handleZoomIn} disabled={scale >= 3}>
            <ZoomInIcon />
          </IconButton>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            variant="contained"
            size="small"
            sx={{
              ml: 2,
              background: 'linear-gradient(45deg, #00ff00 30%, #39ff14 90%)',
            }}
          >
            Download
          </Button>
        </Box>
      </Box>

      {/* Navegação de Páginas */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          px: 2,
        }}
      >
        <IconButton
          onClick={() => handlePageChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
        >
          <PrevIcon />
        </IconButton>
        <Slider
          value={pageNumber}
          onChange={(_, value) => handlePageChange(value)}
          min={1}
          max={numPages || 1}
          step={1}
          sx={{
            '& .MuiSlider-thumb': {
              bgcolor: theme.palette.primary.main,
            },
            '& .MuiSlider-track': {
              background: 'linear-gradient(45deg, #00ff00 30%, #39ff14 90%)',
            },
          }}
        />
        <IconButton
          onClick={() => handlePageChange(pageNumber + 1)}
          disabled={pageNumber >= (numPages || 1)}
        >
          <NextIcon />
        </IconButton>
        <Typography variant="body2">
          Página {pageNumber} de {numPages || '-'}
        </Typography>
      </Box>

      {/* Visualizador PDF */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          borderRadius: 1,
          p: 2,
        }}
      >
        {error ? (
          <Typography color="error" sx={{ p: 3 }}>
            {error}
          </Typography>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <Typography sx={{ p: 3 }}>Carregando PDF...</Typography>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={
                <Typography sx={{ p: 3 }}>Carregando página...</Typography>
              }
            />
          </Document>
        )}
      </Box>
    </Paper>
  );
};

export default PDFViewer;

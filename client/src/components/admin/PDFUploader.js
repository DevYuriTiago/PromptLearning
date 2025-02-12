import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { contentService } from '../../services/contentService';

const PDFUploader = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [openSettings, setOpenSettings] = useState(false);
  const [settings, setSettings] = useState({
    splitPages: true,
    pagesPerSection: 10,
    addWatermark: true,
    watermarkText: 'Confidencial',
  });

  const handleSettingsChange = (e) => {
    const { name, value, checked, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      if (file.type !== 'application/pdf') {
        enqueueSnackbar('Por favor, selecione apenas arquivos PDF', { variant: 'error' });
        continue;
      }

      setUploading(true);
      setProgress(0);

      try {
        // Simular progresso de upload
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 95) {
              clearInterval(interval);
              return prev;
            }
            return prev + 5;
          });
        }, 200);

        const url = await contentService.uploadPDF(file);
        
        clearInterval(interval);
        setProgress(100);

        setUploadedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            url,
            size: file.size,
            uploadedAt: new Date(),
          },
        ]);

        enqueueSnackbar('PDF enviado com sucesso!', { variant: 'success' });
      } catch (error) {
        console.error('Erro ao enviar PDF:', error);
        enqueueSnackbar('Erro ao enviar PDF', { variant: 'error' });
      } finally {
        setUploading(false);
        setProgress(0);
      }
    }
  };

  const handleDelete = async (index) => {
    try {
      // Implementar lógica de deleção no storage
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
      enqueueSnackbar('Arquivo removido com sucesso', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao remover arquivo:', error);
      enqueueSnackbar('Erro ao remover arquivo', { variant: 'error' });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          background: 'linear-gradient(45deg, rgba(0,255,0,0.05) 0%, rgba(0,255,0,0.02) 100%)',
          border: '1px solid rgba(0,255,0,0.2)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" color="primary">
            Upload de PDFs
          </Typography>
          <IconButton
            onClick={() => setOpenSettings(true)}
            sx={{ color: theme.palette.primary.main }}
          >
            <SettingsIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 3,
            border: '2px dashed rgba(0,255,0,0.2)',
            borderRadius: 2,
            bgcolor: 'rgba(0,255,0,0.02)',
            '&:hover': {
              bgcolor: 'rgba(0,255,0,0.05)',
            },
          }}
        >
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              disabled={uploading}
              sx={{
                background: 'linear-gradient(45deg, #00ff00 30%, #39ff14 90%)',
                boxShadow: '0 0 10px rgba(0,255,0,0.3)',
              }}
            >
              Selecionar PDFs
            </Button>
          </label>
          <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
            Arraste os arquivos aqui ou clique para selecionar
          </Typography>
        </Box>

        {uploading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #00ff00 30%, #39ff14 90%)',
                },
              }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
              Enviando... {progress}%
            </Typography>
          </Box>
        )}

        {uploadedFiles.length > 0 && (
          <List sx={{ mt: 2 }}>
            {uploadedFiles.map((file, index) => (
              <ListItem
                key={index}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'rgba(0,255,0,0.05)',
                  },
                }}
              >
                <ListItemText
                  primary={file.name}
                  secondary={`${formatFileSize(file.size)} • ${new Date(
                    file.uploadedAt
                  ).toLocaleString()}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(index)}
                    sx={{ color: theme.palette.error.main }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Dialog de Configurações */}
      <Dialog open={openSettings} onClose={() => setOpenSettings(false)}>
        <DialogTitle>Configurações de Upload</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Páginas por Seção"
              type="number"
              name="pagesPerSection"
              value={settings.pagesPerSection}
              onChange={handleSettingsChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Texto da Marca d'água"
              name="watermarkText"
              value={settings.watermarkText}
              onChange={handleSettingsChange}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>Cancelar</Button>
          <Button
            onClick={() => setOpenSettings(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #00ff00 30%, #39ff14 90%)',
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PDFUploader;

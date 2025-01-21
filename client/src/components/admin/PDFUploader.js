import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { Upload, Delete, Edit } from '@mui/icons-material';
import { contentService } from '../../services/supabaseService';

const PDFUploader = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [sections, setSections] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      
      // Extrai título do nome do arquivo
      const fileName = selectedFile.name.replace('.pdf', '');
      setTitle(fileName);
    } else {
      setError('Por favor, selecione um arquivo PDF válido.');
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Simula progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Upload e processamento do PDF
      const moduleInfo = {
        title,
        description,
        order_index: 0 // Você pode implementar uma lógica para determinar a ordem
      };

      const result = await contentService.uploadPDF(file, moduleInfo);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (onUploadComplete) {
        onUploadComplete(result);
      }

      // Limpa o formulário
      setFile(null);
      setTitle('');
      setDescription('');
      setSections([]);
      setUploadProgress(0);
    } catch (error) {
      console.error('Erro no upload:', error);
      setError('Ocorreu um erro ao fazer upload do arquivo. Por favor, tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleSectionUpdate = (index, newTitle) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], title: newTitle };
    setSections(newSections);
  };

  const handleSectionDelete = (index) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Upload de PDF
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<Upload />}
          disabled={uploading}
          fullWidth
        >
          Selecionar PDF
          <input
            type="file"
            hidden
            accept="application/pdf"
            onChange={handleFileSelect}
          />
        </Button>
        {file && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Arquivo selecionado: {file.name}
          </Typography>
        )}
      </Box>

      <TextField
        label="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        required
        disabled={uploading}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={3}
        disabled={uploading}
        sx={{ mb: 2 }}
      />

      {sections.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Seções Identificadas
          </Typography>
          <List>
            {sections.map((section, index) => (
              <ListItem key={index}>
                <ListItemText>
                  <TextField
                    value={section.title}
                    onChange={(e) => handleSectionUpdate(index, e.target.value)}
                    fullWidth
                    size="small"
                  />
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleSectionDelete(index)}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {uploading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" sx={{ mt: 1 }}>
            {uploadProgress < 100
              ? 'Processando PDF e criando módulos...'
              : 'Upload concluído!'}
          </Typography>
        </Box>
      )}

      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!file || uploading}
        fullWidth
      >
        {uploading ? 'Processando...' : 'Fazer Upload'}
      </Button>
    </Paper>
  );
};

export default PDFUploader;

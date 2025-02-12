import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { contentService } from '../../services/contentService';

const ContentManager = ({ onPDFSelect }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [modules, setModules] = useState([]);
  const [sections, setSections] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'module',
    moduleId: '',
    order: 0,
    tags: [],
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [modulesData, sectionsData] = await Promise.all([
        contentService.getModules(),
        contentService.getSections(),
      ]);
      setModules(modulesData);
      setSections(sectionsData);
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      enqueueSnackbar('Erro ao carregar conteúdo', { variant: 'error' });
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description,
        type: item.moduleId ? 'section' : 'module',
        moduleId: item.moduleId || '',
        order: item.order_index || 0,
        tags: item.tags || [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        description: '',
        type: 'module',
        moduleId: '',
        order: 0,
        tags: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      type: 'module',
      moduleId: '',
      order: 0,
      tags: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      e.target.value = '';
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await contentService.updateContent(editingItem.id, formData);
        enqueueSnackbar('Conteúdo atualizado com sucesso', { variant: 'success' });
      } else {
        await contentService.createContent(formData);
        enqueueSnackbar('Conteúdo criado com sucesso', { variant: 'success' });
      }
      handleCloseDialog();
      loadContent();
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
      enqueueSnackbar('Erro ao salvar conteúdo', { variant: 'error' });
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await contentService.deleteContent(item.id);
        enqueueSnackbar('Conteúdo excluído com sucesso', { variant: 'success' });
        loadContent();
      } catch (error) {
        console.error('Erro ao excluir conteúdo:', error);
        enqueueSnackbar('Erro ao excluir conteúdo', { variant: 'error' });
      }
    }
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 2,
          mb: 2,
          background: 'linear-gradient(45deg, rgba(0,255,0,0.05) 0%, rgba(0,255,0,0.02) 100%)',
          border: '1px solid rgba(0,255,0,0.2)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" color="primary">
            Gerenciador de Conteúdo
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(45deg, #00ff00 30%, #39ff14 90%)',
              boxShadow: '0 0 10px rgba(0,255,0,0.3)',
            }}
          >
            Novo Conteúdo
          </Button>
        </Box>

        <List>
          {modules.map((module) => (
            <React.Fragment key={module.id}>
              <ListItem
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
                  primary={module.title}
                  secondary={module.description}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleOpenDialog(module)}
                    sx={{ color: theme.palette.primary.main }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(module)}
                    sx={{ color: theme.palette.error.main }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              
              {/* Seções do módulo */}
              <List sx={{ pl: 4 }}>
                {sections
                  .filter((section) => section.moduleId === module.id)
                  .map((section) => (
                    <ListItem
                      key={section.id}
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
                        primary={section.title}
                        secondary={section.description}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="view"
                          onClick={() => onPDFSelect(section)}
                          sx={{ color: theme.palette.info.main }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleOpenDialog(section)}
                          sx={{ color: theme.palette.primary.main }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDelete(section)}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
              </List>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Dialog para criar/editar conteúdo */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Editar Conteúdo' : 'Novo Conteúdo'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Tipo"
                >
                  <MenuItem value="module">Módulo</MenuItem>
                  <MenuItem value="section">Seção</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.type === 'section' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Módulo</InputLabel>
                  <Select
                    name="moduleId"
                    value={formData.moduleId}
                    onChange={handleInputChange}
                    label="Módulo"
                  >
                    {modules.map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ordem"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (pressione Enter para adicionar)"
                onKeyPress={handleTagInput}
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    sx={{
                      bgcolor: 'rgba(0,255,0,0.1)',
                      '& .MuiChip-deleteIcon': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #00ff00 30%, #39ff14 90%)',
            }}
          >
            {editingItem ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentManager;

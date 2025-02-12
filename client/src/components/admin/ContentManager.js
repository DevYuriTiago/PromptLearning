import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Button, TextField, IconButton, Tab, Tabs, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { supabase } from '../../services/supabaseService';
import { useSnackbar } from 'notistack';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
}));

const ContentManager = () => {
  const [tabValue, setTabValue] = useState(0);
  const [modules, setModules] = useState([]);
  const [sections, setSections] = useState([]);
  const [resources, setResources] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const { enqueueSnackbar } = useSnackbar();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDialogOpen = (item = null) => {
    setSelectedItem(item);
    setFormData(item || {});
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setFormData({});
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}${Date.now()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(process.env.REACT_APP_STORAGE_BUCKET)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(process.env.REACT_APP_STORAGE_BUCKET)
        .getPublicUrl(filePath);

      setFormData({ ...formData, file_url: publicUrl });
      enqueueSnackbar('Arquivo enviado com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      enqueueSnackbar('Erro ao enviar arquivo', { variant: 'error' });
    }
  };

  const handleSave = async () => {
    try {
      const table = getTableName();
      const { error } = selectedItem
        ? await supabase
            .from(table)
            .update(formData)
            .eq('id', selectedItem.id)
        : await supabase
            .from(table)
            .insert([formData]);

      if (error) throw error;

      enqueueSnackbar('Salvo com sucesso!', { variant: 'success' });
      handleDialogClose();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      enqueueSnackbar('Erro ao salvar', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const { error } = await supabase
        .from(getTableName())
        .delete()
        .eq('id', id);

      if (error) throw error;

      enqueueSnackbar('Excluído com sucesso!', { variant: 'success' });
      loadData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      enqueueSnackbar('Erro ao excluir', { variant: 'error' });
    }
  };

  const getTableName = () => {
    switch (tabValue) {
      case 0: return 'modules';
      case 1: return 'sections';
      case 2: return 'resources';
      default: return 'modules';
    }
  };

  const loadData = async () => {
    try {
      const table = getTableName();
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      switch (table) {
        case 'modules':
          setModules(data);
          break;
        case 'sections':
          setSections(data);
          break;
        case 'resources':
          setResources(data);
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      enqueueSnackbar('Erro ao carregar dados', { variant: 'error' });
    }
  };

  useEffect(() => {
    loadData();
  }, [tabValue]);

  const moduleColumns = [
    { field: 'title', headerName: 'Título', flex: 1 },
    { field: 'description', headerName: 'Descrição', flex: 2 },
    { field: 'order_index', headerName: 'Ordem', width: 100 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleDialogOpen(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const sectionColumns = [
    { field: 'title', headerName: 'Título', flex: 1 },
    { field: 'module_id', headerName: 'Módulo ID', width: 130 },
    { field: 'order_index', headerName: 'Ordem', width: 100 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleDialogOpen(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const resourceColumns = [
    { field: 'title', headerName: 'Título', flex: 1 },
    { field: 'type', headerName: 'Tipo', width: 120 },
    { field: 'section_id', headerName: 'Seção ID', width: 130 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleDialogOpen(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl">
      <StyledPaper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Módulos" />
            <Tab label="Seções" />
            <Tab label="Recursos" />
          </Tabs>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleDialogOpen()}
          >
            Adicionar {tabValue === 0 ? 'Módulo' : tabValue === 1 ? 'Seção' : 'Recurso'}
          </Button>
        </Box>

        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={tabValue === 0 ? modules : tabValue === 1 ? sections : resources}
            columns={tabValue === 0 ? moduleColumns : tabValue === 1 ? sectionColumns : resourceColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
          />
        </Box>

        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedItem ? 'Editar' : 'Adicionar'} {tabValue === 0 ? 'Módulo' : tabValue === 1 ? 'Seção' : 'Recurso'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleFormChange}
                />
              </Grid>
              {tabValue === 0 && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Descrição"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleFormChange}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Ordem"
                  name="order_index"
                  value={formData.order_index || ''}
                  onChange={handleFormChange}
                />
              </Grid>
              {tabValue === 1 && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ID do Módulo"
                    name="module_id"
                    value={formData.module_id || ''}
                    onChange={handleFormChange}
                  />
                </Grid>
              )}
              {tabValue === 2 && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Tipo"
                      name="type"
                      value={formData.type || ''}
                      onChange={handleFormChange}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="">Selecione...</option>
                      <option value="pdf">PDF</option>
                      <option value="ebook">E-book</option>
                      <option value="video">Vídeo</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="ID da Seção"
                      name="section_id"
                      value={formData.section_id || ''}
                      onChange={handleFormChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                    >
                      Upload Arquivo
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleFileUpload(e, formData.type)}
                        accept={formData.type === 'pdf' ? '.pdf' : formData.type === 'ebook' ? '.epub,.pdf' : '.mp4'}
                      />
                    </Button>
                    {formData.file_url && (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Arquivo atual: {formData.file_url}
                      </Typography>
                    )}
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </StyledPaper>
    </Container>
  );
};

export default ContentManager;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
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
  useTheme,
  TablePagination,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { userService } from '../../services/userService';

const UserManager = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    email: '',
    role: 'student',
    name: '',
    status: 'active',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      enqueueSnackbar('Erro ao carregar usuários', { variant: 'error' });
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        role: user.role,
        name: user.name,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        role: 'student',
        name: '',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      email: '',
      role: 'student',
      name: '',
      status: 'active',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
        enqueueSnackbar('Usuário atualizado com sucesso', { variant: 'success' });
      } else {
        await userService.createUser(formData);
        enqueueSnackbar('Usuário criado com sucesso', { variant: 'success' });
      }
      handleCloseDialog();
      loadUsers();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      enqueueSnackbar('Erro ao salvar usuário', { variant: 'error' });
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await userService.deleteUser(user.id);
        enqueueSnackbar('Usuário excluído com sucesso', { variant: 'success' });
        loadUsers();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        enqueueSnackbar('Erro ao excluir usuário', { variant: 'error' });
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await userService.updateUser(user.id, { ...user, status: newStatus });
      enqueueSnackbar('Status do usuário atualizado com sucesso', { variant: 'success' });
      loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      enqueueSnackbar('Erro ao atualizar status do usuário', { variant: 'error' });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return theme.palette.error.main;
      case 'teacher':
        return theme.palette.warning.main;
      default:
        return theme.palette.success.main;
    }
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 2,
          background: 'linear-gradient(45deg, rgba(0,255,0,0.05) 0%, rgba(0,255,0,0.02) 100%)',
          border: '1px solid rgba(0,255,0,0.2)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" color="primary">
            Gerenciador de Usuários
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
            Novo Usuário
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Função</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        sx={{
                          bgcolor: `${getRoleColor(user.role)}20`,
                          color: getRoleColor(user.role),
                          border: `1px solid ${getRoleColor(user.role)}40`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        sx={{
                          bgcolor:
                            user.status === 'active'
                              ? 'rgba(0,255,0,0.1)'
                              : 'rgba(255,0,0,0.1)',
                          color:
                            user.status === 'active'
                              ? theme.palette.success.main
                              : theme.palette.error.main,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpenDialog(user)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleToggleStatus(user)}
                        sx={{
                          color:
                            user.status === 'active'
                              ? theme.palette.error.main
                              : theme.palette.success.main,
                        }}
                      >
                        {user.status === 'active' ? <LockIcon /> : <LockOpenIcon />}
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(user)}
                        sx={{ color: theme.palette.error.main }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Dialog para criar/editar usuário */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Nome"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <FormControl fullWidth>
              <InputLabel>Função</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                label="Função"
              >
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="teacher">Professor</MenuItem>
                <MenuItem value="student">Estudante</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="inactive">Inativo</MenuItem>
              </Select>
            </FormControl>
          </Box>
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
            {editingUser ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManager;

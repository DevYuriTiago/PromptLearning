import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/supabaseService';
import './UserManager.css';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'student'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersList = await adminService.getAllUsers();
      setUsers(usersList);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.createUser(newUser);
      setShowAddUser(false);
      setNewUser({ email: '', name: '', role: 'student' });
      loadUsers();
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar função:', error);
    }
  };

  const handleDeleteUsers = async () => {
    if (window.confirm('Tem certeza que deseja excluir os usuários selecionados?')) {
      try {
        await Promise.all(selectedUsers.map(id => adminService.deleteUser(id)));
        setSelectedUsers([]);
        loadUsers();
      } catch (error) {
        console.error('Erro ao excluir usuários:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="user-manager">
      <header className="manager-header">
        <h1>Gerenciamento de Usuários</h1>
        <div className="header-actions">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button 
            className="add-user-button"
            onClick={() => setShowAddUser(true)}
          >
            <i className="fas fa-user-plus"></i>
            Adicionar Usuário
          </button>
        </div>
      </header>

      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedUsers.length} usuários selecionados</span>
          <button 
            className="delete-button"
            onClick={handleDeleteUsers}
          >
            <i className="fas fa-trash"></i>
            Excluir Selecionados
          </button>
        </div>
      )}

      <div className="users-table">
        <div className="table-header">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={selectedUsers.length === filteredUsers.length}
              onChange={handleSelectAll}
            />
            <span className="checkmark"></span>
          </label>
          <span className="header-name">Nome</span>
          <span className="header-email">Email</span>
          <span className="header-role">Função</span>
          <span className="header-status">Status</span>
          <span className="header-actions">Ações</span>
        </div>

        <div className="table-body">
          {filteredUsers.map(user => (
            <div key={user.id} className="table-row">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                />
                <span className="checkmark"></span>
              </label>
              
              <span className="user-name">
                <img 
                  src={user.avatar_url || '/default-avatar.png'} 
                  alt={user.name} 
                  className="user-avatar"
                />
                {user.name}
              </span>
              
              <span className="user-email">{user.email}</span>
              
              <span className="user-role">
                <select
                  value={user.role}
                  onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                >
                  <option value="student">Estudante</option>
                  <option value="instructor">Instrutor</option>
                  <option value="admin">Administrador</option>
                </select>
              </span>
              
              <span className={`user-status ${user.status}`}>
                {user.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
              
              <div className="row-actions">
                <button className="action-button">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="action-button">
                  <i className="fas fa-key"></i>
                </button>
                <button className="action-button delete">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddUser && (
        <div className="modal-overlay">
          <div className="add-user-modal">
            <h2>Adicionar Novo Usuário</h2>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Função</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({
                    ...prev,
                    role: e.target.value
                  }))}
                >
                  <option value="student">Estudante</option>
                  <option value="instructor">Instrutor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-button">
                  Adicionar Usuário
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowAddUser(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;

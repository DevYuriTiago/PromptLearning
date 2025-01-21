import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/supabaseService';
import './Navbar.css';

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Logo" />
        </Link>
        <div className="navbar-links">
          <Link to="/">Início</Link>
          <Link to="/modules">Módulos</Link>
          <Link to="/achievements">Conquistas</Link>
          {user?.user_metadata?.isAdmin && (
            <Link to="/admin" className="admin-link">Admin</Link>
          )}
        </div>
      </div>

      <div className="navbar-center">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="search"
            placeholder="Buscar módulos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <i className="fas fa-search"></i>
          </button>
        </form>
      </div>

      <div className="navbar-right">
        <div className="notifications">
          <button className="notification-btn">
            <i className="fas fa-bell"></i>
            <span className="notification-badge">3</span>
          </button>
        </div>

        <div className="profile-menu">
          <button 
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <img 
              src={user.user_metadata?.avatar_url || '/default-avatar.png'} 
              alt="Avatar" 
              className="profile-avatar"
            />
            <span className="profile-name">{user.user_metadata?.full_name || 'Usuário'}</span>
            <i className={`fas fa-chevron-${showProfileMenu ? 'up' : 'down'}`}></i>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
                <i className="fas fa-user"></i>
                Meu Perfil
              </Link>
              <Link to="/settings" onClick={() => setShowProfileMenu(false)}>
                <i className="fas fa-cog"></i>
                Configurações
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <i className="fas fa-sign-out-alt"></i>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

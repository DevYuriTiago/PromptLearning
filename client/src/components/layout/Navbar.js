import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await signOut();
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

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const userName = session?.user?.user_metadata?.name || session?.user?.email || 'Usuário';

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
          {session?.user?.user_metadata?.isAdmin && (
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
            onClick={toggleProfileMenu}
          >
            <img 
              src={session?.user?.user_metadata?.avatar_url || '/default-avatar.png'} 
              alt="Avatar" 
              className="profile-avatar"
            />
            <span className="profile-name">{userName}</span>
            <i className={`fas fa-chevron-${showProfileMenu ? 'up' : 'down'}`}></i>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <Link to="/profile" className="dropdown-item">
                <i className="fas fa-user"></i>
                Perfil
              </Link>
              <button onClick={handleLogout} className="dropdown-item">
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

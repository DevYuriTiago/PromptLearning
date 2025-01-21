import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ user }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="collapse-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
      </button>

      <div className="sidebar-content">
        <div className="sidebar-section">
          <h3>Meu Aprendizado</h3>
          <nav>
            <Link to="/in-progress" className={isActive('/in-progress') ? 'active' : ''}>
              <i className="fas fa-clock"></i>
              <span>Em Andamento</span>
            </Link>
            <Link to="/favorites" className={isActive('/favorites') ? 'active' : ''}>
              <i className="fas fa-heart"></i>
              <span>Favoritos</span>
            </Link>
            <Link to="/completed" className={isActive('/completed') ? 'active' : ''}>
              <i className="fas fa-check-circle"></i>
              <span>Concluídos</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar-section">
          <h3>Categorias</h3>
          <nav>
            <Link to="/category/programming" className={isActive('/category/programming') ? 'active' : ''}>
              <i className="fas fa-code"></i>
              <span>Programação</span>
            </Link>
            <Link to="/category/design" className={isActive('/category/design') ? 'active' : ''}>
              <i className="fas fa-paint-brush"></i>
              <span>Design</span>
            </Link>
            <Link to="/category/business" className={isActive('/category/business') ? 'active' : ''}>
              <i className="fas fa-briefcase"></i>
              <span>Negócios</span>
            </Link>
            <Link to="/category/marketing" className={isActive('/category/marketing') ? 'active' : ''}>
              <i className="fas fa-bullhorn"></i>
              <span>Marketing</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar-section">
          <h3>Minha Conta</h3>
          <nav>
            <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
              <i className="fas fa-user"></i>
              <span>Perfil</span>
            </Link>
            <Link to="/achievements" className={isActive('/achievements') ? 'active' : ''}>
              <i className="fas fa-trophy"></i>
              <span>Conquistas</span>
            </Link>
            <Link to="/notes" className={isActive('/notes') ? 'active' : ''}>
              <i className="fas fa-sticky-note"></i>
              <span>Anotações</span>
            </Link>
            <Link to="/settings" className={isActive('/settings') ? 'active' : ''}>
              <i className="fas fa-cog"></i>
              <span>Configurações</span>
            </Link>
          </nav>
        </div>

        {user?.user_metadata?.isAdmin && (
          <div className="sidebar-section admin-section">
            <h3>Administração</h3>
            <nav>
              <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </Link>
              <Link to="/admin/content" className={isActive('/admin/content') ? 'active' : ''}>
                <i className="fas fa-file-alt"></i>
                <span>Conteúdo</span>
              </Link>
              <Link to="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>
                <i className="fas fa-users"></i>
                <span>Usuários</span>
              </Link>
              <Link to="/admin/analytics" className={isActive('/admin/analytics') ? 'active' : ''}>
                <i className="fas fa-chart-bar"></i>
                <span>Análises</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/supabaseService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalModules: 0,
    completionRate: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Dashboard Administrativo</h1>
        <div className="admin-actions">
          <Link to="/admin/users" className="admin-button">
            <i className="fas fa-users"></i>
            Gerenciar Usuários
          </Link>
          <Link to="/admin/modules" className="admin-button">
            <i className="fas fa-book"></i>
            Gerenciar Módulos
          </Link>
          <Link to="/admin/reports" className="admin-button">
            <i className="fas fa-chart-bar"></i>
            Relatórios
          </Link>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>Total de Usuários</h3>
            <span className="stat-value">{stats.totalUsers}</span>
            <span className="stat-label">usuários registrados</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-user-clock"></i>
          </div>
          <div className="stat-info">
            <h3>Usuários Ativos</h3>
            <span className="stat-value">{stats.activeUsers}</span>
            <span className="stat-label">ativos nos últimos 30 dias</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-book"></i>
          </div>
          <div className="stat-info">
            <h3>Total de Módulos</h3>
            <span className="stat-value">{stats.totalModules}</span>
            <span className="stat-label">módulos disponíveis</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div className="stat-info">
            <h3>Taxa de Conclusão</h3>
            <span className="stat-value">{stats.completionRate}%</span>
            <span className="stat-label">média de conclusão</span>
          </div>
        </div>
      </div>

      <section className="recent-activities">
        <h2>Atividades Recentes</h2>
        <div className="activities-list">
          {stats.recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                <i className={`fas fa-${activity.icon}`}></i>
              </div>
              <div className="activity-info">
                <p>{activity.description}</p>
                <span className="activity-time">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
              {activity.actionable && (
                <button 
                  className="activity-action"
                  onClick={() => {/* Implementar ação */}}
                >
                  <i className="fas fa-arrow-right"></i>
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="quick-actions">
        <h2>Ações Rápidas</h2>
        <div className="actions-grid">
          <button className="quick-action-card">
            <i className="fas fa-plus-circle"></i>
            <span>Adicionar Novo Módulo</span>
          </button>
          <button className="quick-action-card">
            <i className="fas fa-user-plus"></i>
            <span>Convidar Usuário</span>
          </button>
          <button className="quick-action-card">
            <i className="fas fa-cog"></i>
            <span>Configurações</span>
          </button>
          <button className="quick-action-card">
            <i className="fas fa-download"></i>
            <span>Exportar Relatórios</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

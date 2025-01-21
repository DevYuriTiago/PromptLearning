import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import analyticsService from '../../services/analyticsService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDashboard = ({ classId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('completion');

  useEffect(() => {
    loadAnalytics();
  }, [classId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getClassProgress(classId);
      setAnalytics(data);
    } catch (err) {
      setError('Erro ao carregar análises: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Carregando análises...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button onClick={loadAnalytics}>Tentar novamente</button>
      </div>
    );
  }

  const formatPerformanceData = () => {
    return Object.entries(analytics.performance).map(([key, value]) => ({
      name: key,
      value: value.count
    }));
  };

  const formatCompletionTrendData = () => {
    return Object.entries(analytics.engagement.completionTrend).map(([date, count]) => ({
      date,
      completions: count
    }));
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Dashboard de Análises</h2>
        <div className="analytics-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7days">Últimos 7 dias</option>
            <option value="30days">Últimos 30 dias</option>
            <option value="90days">Últimos 90 dias</option>
          </select>
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="completion">Taxa de Conclusão</option>
            <option value="engagement">Engajamento</option>
            <option value="performance">Desempenho</option>
          </select>
        </div>
      </div>

      <div className="analytics-overview">
        <div className="metric-card">
          <h3>Alunos Ativos</h3>
          <p className="metric-value">{analytics.overview.studentCount}</p>
          <span className="metric-label">Total de alunos</span>
        </div>
        <div className="metric-card">
          <h3>Taxa de Conclusão</h3>
          <p className="metric-value">
            {analytics.overview.averageCompletionRate.toFixed(1)}%
          </p>
          <span className="metric-label">Média da turma</span>
        </div>
        <div className="metric-card">
          <h3>Pontuação Média</h3>
          <p className="metric-value">
            {analytics.overview.averageScore.toFixed(1)}
          </p>
          <span className="metric-label">De 100 pontos</span>
        </div>
        <div className="metric-card">
          <h3>Tempo Médio</h3>
          <p className="metric-value">
            {Math.round(analytics.overview.averageTimeSpent / 60)} min
          </p>
          <span className="metric-label">Por módulo</span>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-container">
          <h3>Distribuição de Desempenho</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formatPerformanceData()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {formatPerformanceData().map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Tendência de Conclusão</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatCompletionTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="completions"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Progresso por Módulo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(analytics.modules).map(([key, value]) => ({
              name: key,
              value: value
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-details">
        <div className="engagement-metrics">
          <h3>Métricas de Engajamento</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Usuários Ativos</span>
              <span className="metric-value">
                {analytics.engagement.activeUsers}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Média de Sessões</span>
              <span className="metric-value">
                {analytics.engagement.averageSessionsPerUser.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

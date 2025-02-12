import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  People,
  School,
  Assessment,
  DateRange,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';

const AnalyticsDashboard = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    completionRate: 0,
    averageScore: 0,
    userProgress: [],
    moduleCompletion: [],
    userEngagement: [],
    usersByRole: [],
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const data = await analyticsService.getAnalytics(timeRange);
      setAnalytics(data);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    }
  };

  const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

  const StatCard = ({ title, value, icon, color }) => (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(45deg, rgba(0,255,0,0.05) 0%, rgba(0,255,0,0.02) 100%)',
        border: '1px solid rgba(0,255,0,0.2)',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: color,
                textShadow: `0 0 10px ${color}40`,
              }}
            >
              {value}
            </Typography>
          </Box>
          <IconButton
            sx={{
              backgroundColor: `${color}20`,
              '&:hover': {
                backgroundColor: `${color}30`,
              },
            }}
          >
            {icon}
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" color="primary">
          Dashboard de Analytics
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Período</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Período"
          >
            <MenuItem value="day">Último Dia</MenuItem>
            <MenuItem value="week">Última Semana</MenuItem>
            <MenuItem value="month">Último Mês</MenuItem>
            <MenuItem value="year">Último Ano</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Cards de Estatísticas */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Usuários"
            value={analytics.totalUsers}
            icon={<People />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Usuários Ativos"
            value={analytics.activeUsers}
            icon={<TrendingUp />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Taxa de Conclusão"
            value={`${analytics.completionRate}%`}
            icon={<Assessment />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Média de Notas"
            value={analytics.averageScore}
            icon={<School />}
            color={theme.palette.info.main}
          />
        </Grid>

        {/* Gráfico de Progresso dos Usuários */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              height: 400,
              background: 'linear-gradient(45deg, rgba(0,255,0,0.05) 0%, rgba(0,255,0,0.02) 100%)',
              border: '1px solid rgba(0,255,0,0.2)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Progresso dos Usuários
            </Typography>
            <ResponsiveContainer>
              <LineChart data={analytics.userProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de Pizza - Distribuição de Usuários */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              height: 400,
              background: 'linear-gradient(45deg, rgba(0,255,0,0.05) 0%, rgba(0,255,0,0.02) 100%)',
              border: '1px solid rgba(0,255,0,0.2)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Distribuição de Usuários
            </Typography>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={analytics.usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {analytics.usersByRole.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de Conclusão de Módulos */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              height: 400,
              background: 'linear-gradient(45deg, rgba(0,255,0,0.05) 0%, rgba(0,255,0,0.02) 100%)',
              border: '1px solid rgba(0,255,0,0.2)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Conclusão de Módulos
            </Typography>
            <ResponsiveContainer>
              <LineChart data={analytics.moduleCompletion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="module" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Concluídos"
                  stroke={theme.palette.success.main}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  name="Em Progresso"
                  stroke={theme.palette.warning.main}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;

import { supabase } from './supabaseService';

class AnalyticsService {
  async getAnalytics(timeRange) {
    try {
      // Obter período de datas baseado no timeRange
      const { startDate, endDate } = this.getDateRange(timeRange);

      // Obter dados dos usuários
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      // Obter dados de progresso
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .gte('updated_at', startDate)
        .lte('updated_at', endDate);

      // Obter dados de módulos
      const { data: modules } = await supabase
        .from('modules')
        .select('*');

      // Calcular métricas
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.status === 'active').length;
      
      const completedModules = progress.filter(p => p.status === 'completed').length;
      const totalModules = modules.length * users.length;
      const completionRate = totalModules > 0 
        ? ((completedModules / totalModules) * 100).toFixed(1)
        : 0;

      const scores = progress
        .filter(p => p.score !== null)
        .map(p => p.score);
      const averageScore = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 0;

      // Preparar dados para gráficos
      const userProgress = this.formatUserProgress(progress, startDate, endDate);
      const moduleCompletion = this.formatModuleCompletion(progress, modules);
      const usersByRole = this.formatUsersByRole(users);

      return {
        totalUsers,
        activeUsers,
        completionRate,
        averageScore,
        userProgress,
        moduleCompletion,
        usersByRole,
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  getDateRange(timeRange) {
    const endDate = new Date().toISOString();
    const startDate = new Date();

    switch (timeRange) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    return {
      startDate: startDate.toISOString(),
      endDate,
    };
  }

  formatUserProgress(progress, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayProgress = progress.filter(p => 
        p.updated_at.split('T')[0] === dateStr
      );

      days.push({
        date: dateStr,
        progress: dayProgress.length,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }

  formatModuleCompletion(progress, modules) {
    return modules.map(module => {
      const moduleProgress = progress.filter(p => p.module_id === module.id);
      
      return {
        module: module.title,
        completed: moduleProgress.filter(p => p.status === 'completed').length,
        inProgress: moduleProgress.filter(p => p.status === 'in_progress').length,
      };
    });
  }

  formatUsersByRole(users) {
    const roleCount = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(roleCount).map(([role, count]) => ({
      name: role,
      value: count,
    }));
  }

  async getUserAnalytics(userId) {
    try {
      const { data: progress, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const totalModules = progress.length;
      const completedModules = progress.filter(p => p.status === 'completed').length;
      const completionRate = totalModules > 0 
        ? ((completedModules / totalModules) * 100).toFixed(1)
        : 0;

      const scores = progress
        .filter(p => p.score !== null)
        .map(p => p.score);
      const averageScore = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 0;

      return {
        totalModules,
        completedModules,
        completionRate,
        averageScore,
        progress,
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  async getModuleAnalytics(moduleId) {
    try {
      const { data: progress, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('module_id', moduleId);

      if (error) throw error;

      const totalAttempts = progress.length;
      const completedAttempts = progress.filter(p => p.status === 'completed').length;
      const completionRate = totalAttempts > 0 
        ? ((completedAttempts / totalAttempts) * 100).toFixed(1)
        : 0;

      const scores = progress
        .filter(p => p.score !== null)
        .map(p => p.score);
      const averageScore = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 0;

      return {
        totalAttempts,
        completedAttempts,
        completionRate,
        averageScore,
        progress,
      };
    } catch (error) {
      console.error('Error fetching module analytics:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();

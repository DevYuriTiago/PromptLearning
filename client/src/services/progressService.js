import { supabase } from './supabaseService';

class ProgressService {
  async getUserProgress(userId) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select(`
          *,
          module:modules (
            id,
            title
          ),
          section:sections (
            id,
            title
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  async getModuleProgress(userId, moduleId) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select(`
          *,
          section:sections (
            id,
            title,
            order
          )
        `)
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching module progress:', error);
      throw error;
    }
  }

  async updateProgress(userId, moduleId, sectionId, progressData) {
    try {
      const { data: existing } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .eq('section_id', sectionId)
        .single();

      if (existing) {
        // Atualiza o progresso existente
        const { data, error } = await supabase
          .from('user_progress')
          .update({
            ...progressData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select();

        if (error) throw error;
        return data[0];
      } else {
        // Cria um novo registro de progresso
        const { data, error } = await supabase
          .from('user_progress')
          .insert([{
            user_id: userId,
            module_id: moduleId,
            section_id: sectionId,
            ...progressData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
          .select();

        if (error) throw error;
        return data[0];
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  async completeSection(userId, moduleId, sectionId, score = null) {
    try {
      return await this.updateProgress(userId, moduleId, sectionId, {
        status: 'completed',
        score,
        completed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error completing section:', error);
      throw error;
    }
  }

  async startSection(userId, moduleId, sectionId) {
    try {
      return await this.updateProgress(userId, moduleId, sectionId, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error starting section:', error);
      throw error;
    }
  }

  async resetProgress(userId, moduleId = null, sectionId = null) {
    try {
      let query = supabase
        .from('user_progress')
        .delete()
        .eq('user_id', userId);

      if (moduleId) {
        query = query.eq('module_id', moduleId);
      }

      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }

      const { error } = await query;
      if (error) throw error;
    } catch (error) {
      console.error('Error resetting progress:', error);
      throw error;
    }
  }

  async getModuleCompletion(userId, moduleId) {
    try {
      const { data: sections } = await supabase
        .from('sections')
        .select('id')
        .eq('module_id', moduleId);

      const { data: completedSections } = await supabase
        .from('user_progress')
        .select('section_id')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .eq('status', 'completed');

      const totalSections = sections.length;
      const completedCount = completedSections.length;

      return {
        total: totalSections,
        completed: completedCount,
        percentage: totalSections > 0 
          ? Math.round((completedCount / totalSections) * 100)
          : 0,
      };
    } catch (error) {
      console.error('Error getting module completion:', error);
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      // Obter todos os módulos
      const { data: modules } = await supabase
        .from('modules')
        .select('id');

      // Obter todo o progresso do usuário
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      const totalModules = modules.length;
      const completedModules = new Set(
        progress
          .filter(p => p.status === 'completed')
          .map(p => p.module_id)
      ).size;

      const scores = progress
        .filter(p => p.score !== null)
        .map(p => p.score);
      
      const averageScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;

      const lastActivity = progress.length > 0
        ? Math.max(...progress.map(p => new Date(p.updated_at).getTime()))
        : null;

      return {
        totalModules,
        completedModules,
        completionPercentage: totalModules > 0
          ? Math.round((completedModules / totalModules) * 100)
          : 0,
        averageScore: Math.round(averageScore),
        lastActivity: lastActivity ? new Date(lastActivity) : null,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  async getLeaderboard(limit = 10) {
    try {
      const { data: users } = await supabase
        .from('users')
        .select(`
          id,
          name,
          avatar_url,
          user_progress (
            score,
            status
          )
        `)
        .eq('role', 'student');

      const leaderboard = users.map(user => {
        const completedSections = user.user_progress.filter(p => p.status === 'completed');
        const scores = completedSections.map(p => p.score || 0);
        const averageScore = scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;

        return {
          userId: user.id,
          name: user.name,
          avatarUrl: user.avatar_url,
          completedSections: completedSections.length,
          averageScore: Math.round(averageScore),
        };
      });

      // Ordena por pontuação média e número de seções completadas
      return leaderboard
        .sort((a, b) => {
          if (b.averageScore === a.averageScore) {
            return b.completedSections - a.completedSections;
          }
          return b.averageScore - a.averageScore;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  async getAchievements(userId) {
    try {
      const stats = await this.getUserStats(userId);
      const achievements = [];

      // Exemplo de conquistas baseadas no progresso
      if (stats.completedModules >= 1) {
        achievements.push({
          id: 'first_module',
          title: 'Primeiro Módulo',
          description: 'Completou seu primeiro módulo',
          icon: '🎯',
        });
      }

      if (stats.completionPercentage >= 50) {
        achievements.push({
          id: 'halfway',
          title: 'Meio Caminho',
          description: 'Completou 50% do curso',
          icon: '🏃',
        });
      }

      if (stats.completionPercentage === 100) {
        achievements.push({
          id: 'course_complete',
          title: 'Curso Completo',
          description: 'Completou todo o curso',
          icon: '🎓',
        });
      }

      if (stats.averageScore >= 90) {
        achievements.push({
          id: 'excellence',
          title: 'Excelência',
          description: 'Manteve uma média acima de 90',
          icon: '🏆',
        });
      }

      return achievements;
    } catch (error) {
      console.error('Error getting achievements:', error);
      throw error;
    }
  }
}

export const progressService = new ProgressService();

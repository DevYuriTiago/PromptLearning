import { supabase } from './supabaseService';

export const gamificationService = {
  // Calcula nível baseado nos pontos
  calculateLevel(points) {
    return Math.floor(Math.sqrt(points) / 10) + 1;
  },

  // Verifica e atribui conquistas
  async checkAchievements(userId) {
    try {
      // Busca progresso do usuário
      const { data: progress } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId);

      // Busca conquistas existentes do usuário
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);

      const earnedAchievementIds = userAchievements?.map(ua => ua.achievement_id) || [];

      // Busca todas as conquistas disponíveis
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${earnedAchievementIds.join(',')})`);

      if (!achievements) return;

      for (const achievement of achievements) {
        const earned = await this.checkAchievementCondition(achievement, progress, userId);
        
        if (earned) {
          await this.awardAchievement(userId, achievement.id);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
    }
  },

  // Verifica se uma conquista específica foi alcançada
  async checkAchievementCondition(achievement, progress, userId) {
    const { type, requirement_data } = achievement;

    switch (type) {
      case 'completion':
        // Verifica conclusão de módulos
        const completedCount = progress?.filter(p => p.status === 'completed').length || 0;
        return completedCount >= requirement_data.modules_required;

      case 'score':
        // Verifica pontuação total
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', userId)
          .single();
        return profile?.points >= requirement_data.points_required;

      case 'streak':
        // Verifica sequência de dias de estudo
        const streakDays = await this.calculateStreak(userId);
        return streakDays >= requirement_data.days_required;

      case 'special':
        // Conquistas especiais (implementação específica)
        return this.checkSpecialAchievement(requirement_data, userId);

      default:
        return false;
    }
  },

  // Calcula sequência de dias de estudo
  async calculateStreak(userId) {
    const { data: progress } = await supabase
      .from('progress')
      .select('completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (!progress?.length) return 0;

    let streak = 1;
    let currentDate = new Date(progress[0].completed_at);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < progress.length; i++) {
      const progressDate = new Date(progress[i].completed_at);
      progressDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate - progressDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        currentDate = progressDate;
      } else {
        break;
      }
    }

    return streak;
  },

  // Verifica conquistas especiais
  async checkSpecialAchievement(requirementData, userId) {
    switch (requirementData.type) {
      case 'first_forum_post':
        const { count: postCount } = await supabase
          .from('forum_topics')
          .select('id', { count: 'exact' })
          .eq('user_id', userId);
        return postCount > 0;

      case 'help_others':
        const { count: replyCount } = await supabase
          .from('forum_replies')
          .select('id', { count: 'exact' })
          .eq('user_id', userId);
        return replyCount >= requirementData.replies_required;

      default:
        return false;
    }
  },

  // Atribui uma conquista ao usuário
  async awardAchievement(userId, achievementId) {
    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId
        });

      if (error) throw error;

      // Atualiza pontos do usuário (trigger handle_achievement_earned cuida disso)
      await this.showAchievementNotification(achievementId);
    } catch (error) {
      console.error('Erro ao atribuir conquista:', error);
    }
  },

  // Mostra notificação de conquista
  async showAchievementNotification(achievementId) {
    const { data: achievement } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single();

    if (achievement) {
      // Você pode implementar sua própria lógica de notificação aqui
      // Por exemplo, usando react-toastify ou um componente customizado
      console.log('Nova conquista!', achievement.title);
    }
  },

  // Atualiza pontos do usuário
  async updatePoints(userId, points) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ points: points })
        .eq('id', userId);

      if (error) throw error;

      // Verifica novas conquistas após atualizar pontos
      await this.checkAchievements(userId);

      return data;
    } catch (error) {
      console.error('Erro ao atualizar pontos:', error);
    }
  },

  // Retorna ranking dos usuários
  async getLeaderboard() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, points, level')
        .order('points', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      return [];
    }
  },

  // Retorna estatísticas do usuário
  async getUserStats(userId) {
    try {
      // Busca perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single();

      // Busca progresso do usuário
      const { data: progress } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId);

      // Busca total de módulos
      const { count: totalModules } = await supabase
        .from('modules')
        .select('*', { count: 'exact' });

      const points = profile?.points || 0;
      const level = this.calculateLevel(points);
      const nextLevelPoints = Math.pow((level + 1) * 10, 2);
      const completedModules = progress?.filter(p => p.status === 'completed').length || 0;

      return {
        points,
        level,
        nextLevelPoints,
        completedModules,
        totalModules: totalModules || 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        points: 0,
        level: 1,
        nextLevelPoints: 100,
        completedModules: 0,
        totalModules: 0
      };
    }
  },

  // Retorna conquistas do usuário
  async getUserAchievements(userId) {
    try {
      const { data } = await supabase
        .from('user_achievements')
        .select(`
          achievement:achievements (
            id,
            title,
            description,
            icon,
            points,
            type
          ),
          unlocked_at
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      return data?.map(ua => ({
        ...ua.achievement,
        unlockedAt: ua.unlocked_at
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error);
      return [];
    }
  }
};

import { supabase } from './supabaseService';
import { notificationService } from './notificationService';

class GamificationService {
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('gamification_profiles')
        .select(`
          *,
          badges (
            id,
            name,
            description,
            icon,
            rarity
          ),
          achievements (
            id,
            name,
            description,
            icon,
            points
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Perfil não encontrado, criar um novo
        return this.createProfile(userId);
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching gamification profile:', error);
      throw error;
    }
  }

  async createProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('gamification_profiles')
        .insert([{
          user_id: userId,
          level: 1,
          xp: 0,
          points: 0,
          streak_days: 0,
          last_activity: new Date().toISOString(),
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating gamification profile:', error);
      throw error;
    }
  }

  async addXP(userId, amount, reason) {
    try {
      const { data: profile } = await supabase
        .from('gamification_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const newXP = profile.xp + amount;
      const { newLevel, xpForNextLevel } = this.calculateLevel(newXP);

      const updates = {
        xp: newXP,
        level: newLevel,
      };

      const { data, error } = await supabase
        .from('gamification_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      // Se subiu de nível, notifica o usuário
      if (newLevel > profile.level) {
        await notificationService.createNotification({
          user_id: userId,
          type: 'level_up',
          title: 'Novo Nível!',
          message: `Parabéns! Você alcançou o nível ${newLevel}!`,
          priority: 'high',
        });
      }

      // Registra a atividade
      await this.logActivity(userId, 'xp_gain', {
        amount,
        reason,
        new_level: newLevel,
      });

      return {
        ...data[0],
        xpForNextLevel,
      };
    } catch (error) {
      console.error('Error adding XP:', error);
      throw error;
    }
  }

  calculateLevel(xp) {
    // Fórmula: level = 1 + floor(sqrt(xp/100))
    const level = Math.floor(1 + Math.sqrt(xp / 100));
    const xpForNextLevel = Math.pow((level - 1 + 1), 2) * 100;
    return { newLevel: level, xpForNextLevel };
  }

  async addPoints(userId, amount, reason) {
    try {
      const { data, error } = await supabase
        .from('gamification_profiles')
        .update({
          points: supabase.rpc('increment', { amount }),
        })
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      // Registra a atividade
      await this.logActivity(userId, 'points_gain', {
        amount,
        reason,
      });

      return data[0];
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }

  async updateStreak(userId) {
    try {
      const { data: profile } = await supabase
        .from('gamification_profiles')
        .select('streak_days, last_activity')
        .eq('user_id', userId)
        .single();

      const lastActivity = new Date(profile.last_activity);
      const now = new Date();
      const diffDays = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));

      let newStreak = profile.streak_days;
      if (diffDays === 1) {
        // Mantém a sequência
        newStreak += 1;
      } else if (diffDays > 1) {
        // Quebrou a sequência
        newStreak = 1;
      }

      const { data, error } = await supabase
        .from('gamification_profiles')
        .update({
          streak_days: newStreak,
          last_activity: now.toISOString(),
        })
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      // Bonificação por sequência
      if (newStreak > profile.streak_days) {
        const streakBonus = Math.min(newStreak * 10, 100); // Máximo de 100 XP por dia
        await this.addXP(userId, streakBonus, 'daily_streak');
      }

      return data[0];
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  async awardBadge(userId, badgeId) {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .insert([{
          user_id: userId,
          badge_id: badgeId,
          awarded_at: new Date().toISOString(),
        }])
        .select(`
          *,
          badge:badges (*)
        `);

      if (error) throw error;

      // Notifica o usuário
      await notificationService.createNotification({
        user_id: userId,
        type: 'badge',
        title: 'Nova Medalha!',
        message: `Você ganhou a medalha: ${data[0].badge.name}!`,
        priority: 'high',
      });

      // Registra a atividade
      await this.logActivity(userId, 'badge_earned', {
        badge_id: badgeId,
        badge_name: data[0].badge.name,
      });

      return data[0];
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  }

  async unlockAchievement(userId, achievementId) {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert([{
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString(),
        }])
        .select(`
          *,
          achievement:achievements (*)
        `);

      if (error) throw error;

      // Adiciona pontos pela conquista
      await this.addPoints(
        userId,
        data[0].achievement.points,
        `achievement_${data[0].achievement.name}`
      );

      // Notifica o usuário
      await notificationService.createNotification({
        user_id: userId,
        type: 'achievement',
        title: 'Nova Conquista!',
        message: `Você desbloqueou: ${data[0].achievement.name}!`,
        priority: 'high',
      });

      // Registra a atividade
      await this.logActivity(userId, 'achievement_unlocked', {
        achievement_id: achievementId,
        achievement_name: data[0].achievement.name,
      });

      return data[0];
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  async getLeaderboard(timeRange = 'all_time', limit = 10) {
    try {
      let query = supabase
        .from('gamification_profiles')
        .select(`
          *,
          user:users (
            id,
            name,
            avatar_url
          )
        `)
        .order('points', { ascending: false })
        .limit(limit);

      if (timeRange !== 'all_time') {
        const startDate = new Date();
        switch (timeRange) {
          case 'daily':
            startDate.setDate(startDate.getDate() - 1);
            break;
          case 'weekly':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'monthly':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        }

        query = query.gte('last_activity', startDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  async logActivity(userId, type, metadata = {}) {
    try {
      const { error } = await supabase
        .from('activity_log')
        .insert([{
          user_id: userId,
          type,
          metadata,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  async getActivityLog(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching activity log:', error);
      throw error;
    }
  }

  // Eventos que geram XP e pontos
  async onModuleComplete(userId, moduleId) {
    try {
      // Adiciona XP e pontos base
      await this.addXP(userId, 100, 'module_complete');
      await this.addPoints(userId, 50, 'module_complete');

      // Verifica conquistas relacionadas
      await this.checkModuleAchievements(userId);
    } catch (error) {
      console.error('Error processing module completion:', error);
      throw error;
    }
  }

  async onSectionComplete(userId, sectionId, score) {
    try {
      // XP base + bônus baseado na pontuação
      const baseXP = 50;
      const scoreBonus = Math.floor(score / 10) * 5; // 5 XP extra para cada 10% de score
      await this.addXP(userId, baseXP + scoreBonus, 'section_complete');

      // Pontos base + bônus de precisão
      const basePoints = 25;
      const precisionBonus = Math.floor(score / 20) * 5; // 5 pontos extra para cada 20% de score
      await this.addPoints(userId, basePoints + precisionBonus, 'section_complete');

      // Verifica conquistas relacionadas
      await this.checkSectionAchievements(userId, score);
    } catch (error) {
      console.error('Error processing section completion:', error);
      throw error;
    }
  }

  async onQuizComplete(userId, quizId, score) {
    try {
      // XP e pontos baseados na pontuação
      const xp = Math.floor(score / 10) * 10; // 10 XP para cada 10% de score
      const points = Math.floor(score / 20) * 5; // 5 pontos para cada 20% de score

      await this.addXP(userId, xp, 'quiz_complete');
      await this.addPoints(userId, points, 'quiz_complete');

      // Verifica conquistas relacionadas
      await this.checkQuizAchievements(userId, score);
    } catch (error) {
      console.error('Error processing quiz completion:', error);
      throw error;
    }
  }

  // Verificações de conquistas
  async checkModuleAchievements(userId) {
    try {
      const { data: completedModules } = await supabase
        .from('user_progress')
        .select('module_id')
        .eq('user_id', userId)
        .eq('status', 'completed');

      const count = completedModules.length;

      // Exemplos de conquistas
      if (count === 1) {
        await this.unlockAchievement(userId, 'first_module');
      }
      if (count === 5) {
        await this.unlockAchievement(userId, 'five_modules');
      }
      if (count === 10) {
        await this.unlockAchievement(userId, 'ten_modules');
      }
    } catch (error) {
      console.error('Error checking module achievements:', error);
      throw error;
    }
  }

  async checkSectionAchievements(userId, score) {
    try {
      if (score === 100) {
        await this.unlockAchievement(userId, 'perfect_section');
      }

      const { data: sections } = await supabase
        .from('user_progress')
        .select('score')
        .eq('user_id', userId)
        .gte('score', 90);

      if (sections.length >= 5) {
        await this.unlockAchievement(userId, 'five_excellent_sections');
      }
    } catch (error) {
      console.error('Error checking section achievements:', error);
      throw error;
    }
  }

  async checkQuizAchievements(userId, score) {
    try {
      if (score === 100) {
        await this.unlockAchievement(userId, 'perfect_quiz');
      }

      const { data: quizzes } = await supabase
        .from('quiz_attempts')
        .select('score')
        .eq('user_id', userId);

      const averageScore = quizzes.reduce((acc, curr) => acc + curr.score, 0) / quizzes.length;

      if (averageScore >= 90 && quizzes.length >= 5) {
        await this.unlockAchievement(userId, 'quiz_master');
      }
    } catch (error) {
      console.error('Error checking quiz achievements:', error);
      throw error;
    }
  }
}

export const gamificationService = new GamificationService();

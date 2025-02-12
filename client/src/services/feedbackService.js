import { supabase } from './supabaseService';
import { notificationService } from './notificationService';

class FeedbackService {
  async getFeedback(userId, options = {}) {
    try {
      let query = supabase
        .from('feedback')
        .select(`
          *,
          user:users (
            id,
            name,
            avatar_url
          ),
          module:modules (
            id,
            title
          ),
          section:sections (
            id,
            title
          )
        `)
        .eq('user_id', userId);

      if (options.moduleId) {
        query = query.eq('module_id', options.moduleId);
      }

      if (options.sectionId) {
        query = query.eq('section_id', options.sectionId);
      }

      if (options.type) {
        query = query.eq('type', options.type);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  }

  async createFeedback(feedbackData) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          ...feedbackData,
          created_at: new Date().toISOString(),
        }])
        .select();

      if (error) throw error;

      // Notifica o usuário sobre o feedback criado
      if (feedbackData.user_id) {
        await notificationService.createNotification({
          user_id: feedbackData.user_id,
          type: 'feedback',
          title: 'Novo Feedback',
          message: 'Um novo feedback foi registrado para você.',
          priority: 'normal',
        });
      }

      return data[0];
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  }

  async updateFeedback(feedbackId, updates) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', feedbackId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  }

  async deleteFeedback(feedbackId) {
    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }

  async submitModuleFeedback(userId, moduleId, feedbackData) {
    try {
      const feedback = await this.createFeedback({
        user_id: userId,
        module_id: moduleId,
        type: 'module',
        ...feedbackData,
      });

      // Se houver uma pontuação, atualiza as estatísticas do módulo
      if (feedbackData.rating) {
        await this.updateModuleStats(moduleId, feedbackData.rating);
      }

      return feedback;
    } catch (error) {
      console.error('Error submitting module feedback:', error);
      throw error;
    }
  }

  async submitSectionFeedback(userId, sectionId, moduleId, feedbackData) {
    try {
      const feedback = await this.createFeedback({
        user_id: userId,
        section_id: sectionId,
        module_id: moduleId,
        type: 'section',
        ...feedbackData,
      });

      // Se houver uma pontuação, atualiza as estatísticas da seção
      if (feedbackData.rating) {
        await this.updateSectionStats(sectionId, feedbackData.rating);
      }

      return feedback;
    } catch (error) {
      console.error('Error submitting section feedback:', error);
      throw error;
    }
  }

  async submitQuizFeedback(userId, quizId, moduleId, feedbackData) {
    try {
      return await this.createFeedback({
        user_id: userId,
        quiz_id: quizId,
        module_id: moduleId,
        type: 'quiz',
        ...feedbackData,
      });
    } catch (error) {
      console.error('Error submitting quiz feedback:', error);
      throw error;
    }
  }

  async updateModuleStats(moduleId, rating) {
    try {
      const { data: currentStats } = await supabase
        .from('module_stats')
        .select('*')
        .eq('module_id', moduleId)
        .single();

      if (currentStats) {
        const totalRatings = currentStats.total_ratings + 1;
        const newAverageRating = (
          (currentStats.average_rating * currentStats.total_ratings + rating) /
          totalRatings
        ).toFixed(1);

        await supabase
          .from('module_stats')
          .update({
            average_rating: newAverageRating,
            total_ratings: totalRatings,
            updated_at: new Date().toISOString(),
          })
          .eq('module_id', moduleId);
      } else {
        await supabase
          .from('module_stats')
          .insert([{
            module_id: moduleId,
            average_rating: rating,
            total_ratings: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);
      }
    } catch (error) {
      console.error('Error updating module stats:', error);
      throw error;
    }
  }

  async updateSectionStats(sectionId, rating) {
    try {
      const { data: currentStats } = await supabase
        .from('section_stats')
        .select('*')
        .eq('section_id', sectionId)
        .single();

      if (currentStats) {
        const totalRatings = currentStats.total_ratings + 1;
        const newAverageRating = (
          (currentStats.average_rating * currentStats.total_ratings + rating) /
          totalRatings
        ).toFixed(1);

        await supabase
          .from('section_stats')
          .update({
            average_rating: newAverageRating,
            total_ratings: totalRatings,
            updated_at: new Date().toISOString(),
          })
          .eq('section_id', sectionId);
      } else {
        await supabase
          .from('section_stats')
          .insert([{
            section_id: sectionId,
            average_rating: rating,
            total_ratings: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);
      }
    } catch (error) {
      console.error('Error updating section stats:', error);
      throw error;
    }
  }

  async getModuleStats(moduleId) {
    try {
      const { data, error } = await supabase
        .from('module_stats')
        .select('*')
        .eq('module_id', moduleId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || {
        average_rating: 0,
        total_ratings: 0,
      };
    } catch (error) {
      console.error('Error fetching module stats:', error);
      throw error;
    }
  }

  async getSectionStats(sectionId) {
    try {
      const { data, error } = await supabase
        .from('section_stats')
        .select('*')
        .eq('section_id', sectionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || {
        average_rating: 0,
        total_ratings: 0,
      };
    } catch (error) {
      console.error('Error fetching section stats:', error);
      throw error;
    }
  }

  async getFeedbackSummary(moduleId = null) {
    try {
      let query = supabase
        .from('feedback')
        .select('rating, type');

      if (moduleId) {
        query = query.eq('module_id', moduleId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const summary = {
        average_rating: 0,
        total_ratings: 0,
        rating_distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
        by_type: {
          module: { count: 0, average: 0 },
          section: { count: 0, average: 0 },
          quiz: { count: 0, average: 0 },
        },
      };

      if (data.length > 0) {
        // Calcula distribuição de avaliações e médias por tipo
        data.forEach(item => {
          if (item.rating) {
            summary.total_ratings++;
            summary.rating_distribution[item.rating]++;
            
            if (item.type) {
              summary.by_type[item.type].count++;
              summary.by_type[item.type].average += item.rating;
            }
          }
        });

        // Calcula média geral
        const totalScore = Object.entries(summary.rating_distribution)
          .reduce((acc, [rating, count]) => acc + (Number(rating) * count), 0);
        summary.average_rating = (totalScore / summary.total_ratings).toFixed(1);

        // Calcula médias por tipo
        Object.keys(summary.by_type).forEach(type => {
          if (summary.by_type[type].count > 0) {
            summary.by_type[type].average = (
              summary.by_type[type].average / summary.by_type[type].count
            ).toFixed(1);
          }
        });
      }

      return summary;
    } catch (error) {
      console.error('Error getting feedback summary:', error);
      throw error;
    }
  }

  async getRecentFeedback(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          user:users (
            id,
            name,
            avatar_url
          ),
          module:modules (
            id,
            title
          ),
          section:sections (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching recent feedback:', error);
      throw error;
    }
  }

  async getFeedbackTrends(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('feedback')
        .select('rating, created_at')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const trends = {};
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        trends[dateStr] = {
          count: 0,
          average: 0,
          total: 0,
        };
      }

      data.forEach(item => {
        const dateStr = item.created_at.split('T')[0];
        if (trends[dateStr]) {
          trends[dateStr].count++;
          trends[dateStr].total += item.rating || 0;
          trends[dateStr].average = (
            trends[dateStr].total / trends[dateStr].count
          ).toFixed(1);
        }
      });

      return Object.entries(trends)
        .map(([date, stats]) => ({
          date,
          ...stats,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error getting feedback trends:', error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService();

import { supabase } from './supabaseService';

class NotificationService {
  async getNotifications(userId, options = { unreadOnly: false, limit: 50 }) {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options.unreadOnly) {
        query = query.eq('read', false);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async createNotification(notification) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notification,
          created_at: new Date().toISOString(),
          read: false,
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async clearAllNotifications(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Métodos para criar diferentes tipos de notificações
  async notifyNewContent(userId, moduleTitle, sectionTitle) {
    return this.createNotification({
      user_id: userId,
      type: 'new_content',
      title: 'Novo Conteúdo Disponível',
      message: `Novo conteúdo adicionado em ${moduleTitle} - ${sectionTitle}`,
      priority: 'normal',
    });
  }

  async notifyAchievement(userId, achievementTitle) {
    return this.createNotification({
      user_id: userId,
      type: 'achievement',
      title: 'Nova Conquista!',
      message: `Parabéns! Você desbloqueou a conquista: ${achievementTitle}`,
      priority: 'high',
    });
  }

  async notifyModuleCompletion(userId, moduleTitle) {
    return this.createNotification({
      user_id: userId,
      type: 'completion',
      title: 'Módulo Concluído',
      message: `Parabéns! Você completou o módulo: ${moduleTitle}`,
      priority: 'high',
    });
  }

  async notifyFeedback(userId, moduleTitle, score) {
    return this.createNotification({
      user_id: userId,
      type: 'feedback',
      title: 'Feedback Disponível',
      message: `Seu resultado para ${moduleTitle}: ${score}%`,
      priority: 'normal',
    });
  }

  async notifyReminder(userId, moduleTitle) {
    return this.createNotification({
      user_id: userId,
      type: 'reminder',
      title: 'Lembrete de Estudo',
      message: `Não se esqueça de continuar seus estudos em: ${moduleTitle}`,
      priority: 'low',
    });
  }

  async notifySystemUpdate(userId, updateInfo) {
    return this.createNotification({
      user_id: userId,
      type: 'system',
      title: 'Atualização do Sistema',
      message: updateInfo,
      priority: 'normal',
    });
  }

  // Configurações de notificação
  async updateNotificationPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert([{
          user_id: userId,
          ...preferences,
        }], {
          onConflict: 'user_id',
        })
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  async getNotificationPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Retorna preferências padrão se não encontrar configurações
      return data || {
        email_notifications: true,
        push_notifications: true,
        notification_types: {
          new_content: true,
          achievement: true,
          completion: true,
          feedback: true,
          reminder: true,
          system: true,
        },
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  // Subscrição para notificações em tempo real
  subscribeToNotifications(userId, callback) {
    return supabase
      .channel('notification_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  }
}

export const notificationService = new NotificationService();

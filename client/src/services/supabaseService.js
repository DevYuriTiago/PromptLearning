import { createClient } from '@supabase/supabase-js';
import { pdfProcessingService } from './pdfProcessingService';
import { contentProtectionService } from './contentProtectionService';
import { gamificationService } from './gamificationService';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Supabase Config:', {
  url: supabaseUrl ? 'Configurada' : 'Não configurada',
  key: supabaseAnonKey ? 'Configurada' : 'Não configurada'
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verificar conexão com Supabase
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase Auth State Change:', event, 'Session:', session ? {
    id: session.user?.id,
    email: session.user?.email,
    role: session.user?.user_metadata?.role
  } : 'No session');
});

const authService = {
  supabase,

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        return { ...user, profile };
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async login(email, password) {
    console.log('Attempting login for:', email);
    try {
      // Verificar se o usuário existe
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (checkError) {
        console.log('User not found in profiles:', email);
      } else {
        console.log('User found in profiles:', existingUser);
      }

      // Tentar login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        throw error;
      }

      console.log('Login successful:', {
        user: data.user?.id,
        email: data.user?.email,
        metadata: data.user?.user_metadata
      });

      return data;
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      throw error;
    }
  },

  async register(email, password, userData = {}) {
    console.log('Attempting registration for:', email, 'with data:', userData);
    try {
      // Verificar se o usuário já existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        console.log('User already exists in profiles:', existingUser);
        throw new Error('User already exists');
      }

      // Criar novo usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            isAdmin: email === 'yuritiagotf@gmail.com'
          }
        }
      });

      if (authError) {
        console.error('Registration auth error:', authError);
        throw authError;
      }

      console.log('User registered successfully:', {
        id: authData.user?.id,
        email: authData.user?.email,
        metadata: authData.user?.user_metadata
      });

      // Criar perfil do usuário
      if (authData?.user) {
        const profileData = {
          id: authData.user.id,
          email: email,
          name: userData.name || email.split('@')[0],
          role: email === 'yuritiagotf@gmail.com' ? 'admin' : 'student',
          created_at: new Date().toISOString(),
        };

        console.log('Creating user profile:', profileData);

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Se houver erro ao criar o perfil, deleta o usuário
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw profileError;
        }

        console.log('Profile created successfully');
      }

      return authData;
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      throw error;
    }
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      console.log('Password updated successfully');
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export { authService };

const contentService = {
  async getModules() {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*, sections(id, title, content, order_index)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
      return { data: null, error };
    }
  },

  async getModuleById(moduleId) {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select(`
          *,
          sections (
            id,
            title,
            content,
            order
          )
        `)
        .eq('id', moduleId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar módulo:', error);
      return { data: null, error };
    }
  },

  async createModule(moduleData) {
    try {
      const { data, error } = await supabase
        .from('modules')
        .insert([moduleData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
      return { data: null, error };
    }
  },

  async updateModule(moduleId, moduleData) {
    try {
      const { data, error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', moduleId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error);
      return { data: null, error };
    }
  },

  async deleteModule(moduleId) {
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Erro ao deletar módulo:', error);
      return { error };
    }
  },

  async uploadPDF(file, moduleInfo) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `pdfs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      const moduleData = {
        ...moduleInfo,
        pdf_url: publicUrl,
        type: 'pdf'
      };

      const { data, error } = await this.createModule(moduleData);
      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao fazer upload do PDF:', error);
      return { data: null, error };
    }
  },

  async getStudentProgress(userId) {
    try {
      if (!userId) {
        throw new Error('UserId é obrigatório');
      }

      const { data, error } = await supabase
        .from('progress')
        .select(`
          *,
          module:modules (
            id,
            title,
            points_reward
          ),
          section:sections (
            id,
            title
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      return { data: null, error };
    }
  }
};

const progressService = {
  async getStudentProgress(userId) {
    try {
      if (!userId) {
        throw new Error('UserId é obrigatório');
      }

      const { data, error } = await supabase
        .from('progress')
        .select(`
          *,
          module:modules (
            id,
            title,
            points_reward
          ),
          section:sections (
            id,
            title
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      return { data: null, error };
    }
  },

  async updateProgress(userId, moduleId, sectionId, progressData) {
    try {
      if (!userId || !moduleId) {
        throw new Error('UserId e moduleId são obrigatórios');
      }

      const { data: existingProgress, error: fetchError } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = Not Found
        throw fetchError;
      }

      let result;
      if (existingProgress) {
        // Atualizar progresso existente
        const { data, error } = await supabase
          .from('progress')
          .update({
            ...progressData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) throw error;
        result = { data, error: null };
      } else {
        // Criar novo progresso
        const { data, error } = await supabase
          .from('progress')
          .insert([{
            user_id: userId,
            module_id: moduleId,
            section_id: sectionId,
            ...progressData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        result = { data, error: null };
      }

      // Atualizar pontos do usuário se necessário
      if (progressData.points_earned) {
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({
            total_points: supabase.raw(`total_points + ${progressData.points_earned}`)
          })
          .eq('id', userId);

        if (pointsError) throw pointsError;
      }

      return result;
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      return { data: null, error };
    }
  },

  async getModuleProgress(userId, moduleId) {
    try {
      if (!userId || !moduleId) {
        throw new Error('UserId e moduleId são obrigatórios');
      }

      const { data, error } = await supabase
        .from('progress')
        .select(`
          *,
          module:modules (
            id,
            title,
            points_reward
          ),
          section:sections (
            id,
            title
          )
        `)
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar progresso do módulo:', error);
      return { data: null, error };
    }
  }
};

const forumService = {
  async createTopic(moduleId, userId, title, content) {
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          module_id: moduleId,
          user_id: userId,
          title,
          content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar tópico:', error);
      throw error;
    }
  },

  async getTopics(moduleId) {
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          user:profiles (
            name,
            avatar_url
          ),
          replies:forum_replies (
            count
          )
        `)
        .eq('module_id', moduleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar tópicos:', error);
      throw error;
    }
  },

  async createReply(topicId, userId, content) {
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .insert({
          topic_id: topicId,
          user_id: userId,
          content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar resposta:', error);
      throw error;
    }
  }
};

const adminService = {
  async getDashboardStats() {
    try {
      const { data: users } = await supabase
        .from('profiles')
        .select('role', { count: 'exact' });

      const { data: modules } = await supabase
        .from('modules')
        .select('id', { count: 'exact' });

      const { data: completions } = await supabase
        .from('progress')
        .select('id')
        .eq('status', 'completed');

      return {
        totalUsers: users?.length || 0,
        totalModules: modules?.length || 0,
        totalCompletions: completions?.length || 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }
};

export { contentService, progressService, adminService, forumService };
export default {
  authService,
  contentService,
  progressService,
  adminService,
  forumService
};

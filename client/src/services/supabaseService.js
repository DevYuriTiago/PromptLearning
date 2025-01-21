import { createClient } from '@supabase/supabase-js';
import { pdfProcessingService } from './pdfProcessingService';
import { contentProtectionService } from './contentProtectionService';
import { gamificationService } from './gamificationService';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Serviço de Autenticação
export const authService = {
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      return { ...user, profile };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }
};

// Serviço de Gerenciamento de Conteúdo
export const contentService = {
  async uploadPDF(file, moduleInfo) {
    try {
      // Processa o PDF para proteção
      const processedPDF = await contentProtectionService.processPDF(file);
      
      // Upload do arquivo processado
      const filename = `${Date.now()}-${file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(filename, processedPDF);

      if (uploadError) throw uploadError;

      // Extrai texto e identifica seções
      const arrayBuffer = await file.arrayBuffer();
      const text = await pdfProcessingService.extractTextFromPDF(arrayBuffer);
      const sections = pdfProcessingService.identifySections(text);
      
      // Cria módulo
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .insert({
          ...moduleInfo,
          pdf_url: fileData.path,
          order_index: moduleInfo.order_index || 0
        })
        .select()
        .single();

      if (moduleError) throw moduleError;

      // Cria seções e quizzes
      for (const section of sections) {
        const { data: sectionData, error: sectionError } = await supabase
          .from('sections')
          .insert({
            module_id: module.id,
            title: section.title,
            content: section.content,
            order_index: section.startLine
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        // Gera e salva quizzes para a seção
        const quizzes = pdfProcessingService.generateQuizzes(section.content);
        if (quizzes.length > 0) {
          const { error: quizzesError } = await supabase
            .from('quizzes')
            .insert(quizzes.map(quiz => ({
              ...quiz,
              section_id: sectionData.id
            })));

          if (quizzesError) throw quizzesError;
        }
      }

      return module;
    } catch (error) {
      console.error('Erro ao fazer upload do PDF:', error);
      throw error;
    }
  },

  async getModules() {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select(`
          *,
          sections (
            *,
            quizzes (*)
          )
        `)
        .order('order_index');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
      throw error;
    }
  },

  async deleteModule(moduleId) {
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar módulo:', error);
      throw error;
    }
  }
};

// Serviço de Progresso do Estudante
export const progressService = {
  async updateProgress(userId, moduleId, sectionId, progress) {
    try {
      const { data, error } = await supabase
        .from('progress')
        .upsert({
          user_id: userId,
          module_id: moduleId,
          section_id: sectionId,
          status: progress.status,
          score: progress.score || 0,
          last_position: progress.last_position || 0,
          completed_at: progress.status === 'completed' ? new Date() : null
        })
        .select()
        .single();

      if (error) throw error;

      // Atualiza pontos se completou
      if (progress.status === 'completed') {
        const { data: module } = await supabase
          .from('modules')
          .select('points_reward')
          .eq('id', moduleId)
          .single();

        if (module) {
          await gamificationService.updatePoints(userId, module.points_reward);
        }
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      throw error;
    }
  },

  async getStudentProgress(userId) {
    try {
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
      return data;
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      throw error;
    }
  }
};

// Serviço de Fórum
export const forumService = {
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

// Serviço de Administração
export const adminService = {
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

export default {
  supabase,
  authService,
  contentService,
  progressService,
  forumService,
  adminService,
  gamificationService
};

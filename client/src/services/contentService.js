import { supabase } from './supabaseService';

class ContentService {
  async getModules() {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  }

  async getSections() {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw error;
    }
  }

  async createContent(content) {
    try {
      const table = content.type === 'module' ? 'modules' : 'sections';
      const { data, error } = await supabase
        .from(table)
        .insert([{
          title: content.title,
          description: content.description,
          order_index: content.order,
          ...(content.type === 'section' && { module_id: content.moduleId }),
          tags: content.tags,
        }]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  }

  async updateContent(id, content) {
    try {
      const table = content.type === 'module' ? 'modules' : 'sections';
      const { data, error } = await supabase
        .from(table)
        .update({
          title: content.title,
          description: content.description,
          order_index: content.order,
          ...(content.type === 'section' && { module_id: content.moduleId }),
          tags: content.tags,
        })
        .eq('id', id);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }

  async deleteContent(id, type) {
    try {
      const table = type === 'module' ? 'modules' : 'sections';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  }

  async uploadPDF(file, moduleId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}${Date.now()}.${fileExt}`;
      const filePath = `pdfs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  }
}

export const contentService = new ContentService();

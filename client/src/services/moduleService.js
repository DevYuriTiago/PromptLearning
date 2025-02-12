import { supabase } from './supabaseService';

class ModuleService {
  async getModules() {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select(`
          *,
          sections (
            *,
            content (*)
          )
        `)
        .order('order', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  }

  async getModuleById(moduleId) {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select(`
          *,
          sections (
            *,
            content (*)
          )
        `)
        .eq('id', moduleId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }

  async createModule(moduleData) {
    try {
      const { data: modules } = await supabase
        .from('modules')
        .select('order')
        .order('order', { ascending: false })
        .limit(1);

      const newOrder = modules.length > 0 ? modules[0].order + 1 : 1;

      const { data, error } = await supabase
        .from('modules')
        .insert([{ ...moduleData, order: newOrder }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  }

  async updateModule(moduleId, moduleData) {
    try {
      const { data, error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', moduleId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  }

  async deleteModule(moduleId) {
    try {
      // Primeiro, exclui todas as seções e conteúdos relacionados
      const { data: sections } = await supabase
        .from('sections')
        .select('id')
        .eq('module_id', moduleId);

      if (sections) {
        for (const section of sections) {
          await supabase
            .from('content')
            .delete()
            .eq('section_id', section.id);
        }

        await supabase
          .from('sections')
          .delete()
          .eq('module_id', moduleId);
      }

      // Depois, exclui o módulo
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;

      // Reordena os módulos restantes
      await this.reorderModules();
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  }

  async reorderModules() {
    try {
      const { data: modules } = await supabase
        .from('modules')
        .select('id')
        .order('order', { ascending: true });

      // Atualiza a ordem de cada módulo
      for (let i = 0; i < modules.length; i++) {
        await supabase
          .from('modules')
          .update({ order: i + 1 })
          .eq('id', modules[i].id);
      }
    } catch (error) {
      console.error('Error reordering modules:', error);
      throw error;
    }
  }

  async updateModuleOrder(moduleId, newOrder) {
    try {
      const { data: currentModule } = await supabase
        .from('modules')
        .select('order')
        .eq('id', moduleId)
        .single();

      const currentOrder = currentModule.order;

      if (newOrder > currentOrder) {
        // Movendo para baixo
        await supabase.rpc('update_module_order_down', {
          p_module_id: moduleId,
          p_current_order: currentOrder,
          p_new_order: newOrder,
        });
      } else {
        // Movendo para cima
        await supabase.rpc('update_module_order_up', {
          p_module_id: moduleId,
          p_current_order: currentOrder,
          p_new_order: newOrder,
        });
      }
    } catch (error) {
      console.error('Error updating module order:', error);
      throw error;
    }
  }

  async getSections(moduleId) {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select(`
          *,
          content (*)
        `)
        .eq('module_id', moduleId)
        .order('order', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw error;
    }
  }

  async createSection(sectionData) {
    try {
      const { data: sections } = await supabase
        .from('sections')
        .select('order')
        .eq('module_id', sectionData.module_id)
        .order('order', { ascending: false })
        .limit(1);

      const newOrder = sections.length > 0 ? sections[0].order + 1 : 1;

      const { data, error } = await supabase
        .from('sections')
        .insert([{ ...sectionData, order: newOrder }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating section:', error);
      throw error;
    }
  }

  async updateSection(sectionId, sectionData) {
    try {
      const { data, error } = await supabase
        .from('sections')
        .update(sectionData)
        .eq('id', sectionId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating section:', error);
      throw error;
    }
  }

  async deleteSection(sectionId) {
    try {
      // Primeiro, exclui todo o conteúdo relacionado
      await supabase
        .from('content')
        .delete()
        .eq('section_id', sectionId);

      // Depois, exclui a seção
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;

      // Reordena as seções restantes
      await this.reorderSections(sectionId);
    } catch (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  }

  async reorderSections(moduleId) {
    try {
      const { data: sections } = await supabase
        .from('sections')
        .select('id')
        .eq('module_id', moduleId)
        .order('order', { ascending: true });

      // Atualiza a ordem de cada seção
      for (let i = 0; i < sections.length; i++) {
        await supabase
          .from('sections')
          .update({ order: i + 1 })
          .eq('id', sections[i].id);
      }
    } catch (error) {
      console.error('Error reordering sections:', error);
      throw error;
    }
  }

  async updateSectionOrder(sectionId, newOrder) {
    try {
      const { data: currentSection } = await supabase
        .from('sections')
        .select('order, module_id')
        .eq('id', sectionId)
        .single();

      const currentOrder = currentSection.order;

      if (newOrder > currentOrder) {
        // Movendo para baixo
        await supabase.rpc('update_section_order_down', {
          p_section_id: sectionId,
          p_module_id: currentSection.module_id,
          p_current_order: currentOrder,
          p_new_order: newOrder,
        });
      } else {
        // Movendo para cima
        await supabase.rpc('update_section_order_up', {
          p_section_id: sectionId,
          p_module_id: currentSection.module_id,
          p_current_order: currentOrder,
          p_new_order: newOrder,
        });
      }
    } catch (error) {
      console.error('Error updating section order:', error);
      throw error;
    }
  }

  async getContent(sectionId) {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('section_id', sectionId)
        .order('order', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  }

  async createContent(contentData) {
    try {
      const { data: contents } = await supabase
        .from('content')
        .select('order')
        .eq('section_id', contentData.section_id)
        .order('order', { ascending: false })
        .limit(1);

      const newOrder = contents.length > 0 ? contents[0].order + 1 : 1;

      const { data, error } = await supabase
        .from('content')
        .insert([{ ...contentData, order: newOrder }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  }

  async updateContent(contentId, contentData) {
    try {
      const { data, error } = await supabase
        .from('content')
        .update(contentData)
        .eq('id', contentId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }

  async deleteContent(contentId) {
    try {
      const { data: content } = await supabase
        .from('content')
        .select('section_id')
        .eq('id', contentId)
        .single();

      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      // Reordena o conteúdo restante
      await this.reorderContent(content.section_id);
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  }

  async reorderContent(sectionId) {
    try {
      const { data: contents } = await supabase
        .from('content')
        .select('id')
        .eq('section_id', sectionId)
        .order('order', { ascending: true });

      // Atualiza a ordem de cada conteúdo
      for (let i = 0; i < contents.length; i++) {
        await supabase
          .from('content')
          .update({ order: i + 1 })
          .eq('id', contents[i].id);
      }
    } catch (error) {
      console.error('Error reordering content:', error);
      throw error;
    }
  }

  async updateContentOrder(contentId, newOrder) {
    try {
      const { data: currentContent } = await supabase
        .from('content')
        .select('order, section_id')
        .eq('id', contentId)
        .single();

      const currentOrder = currentContent.order;

      if (newOrder > currentOrder) {
        // Movendo para baixo
        await supabase.rpc('update_content_order_down', {
          p_content_id: contentId,
          p_section_id: currentContent.section_id,
          p_current_order: currentOrder,
          p_new_order: newOrder,
        });
      } else {
        // Movendo para cima
        await supabase.rpc('update_content_order_up', {
          p_content_id: contentId,
          p_section_id: currentContent.section_id,
          p_current_order: currentOrder,
          p_new_order: newOrder,
        });
      }
    } catch (error) {
      console.error('Error updating content order:', error);
      throw error;
    }
  }
}

export const moduleService = new ModuleService();

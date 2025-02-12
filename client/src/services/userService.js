import { supabase } from './supabaseService';

class UserService {
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      // Primeiro cria o usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: 'ChangeMe123!', // Senha temporária
        options: {
          data: {
            name: userData.name,
            role: userData.role,
          },
        },
      });

      if (authError) throw authError;

      // Depois adiciona os dados do usuário na tabela users
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            status: userData.status,
          },
        ]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      // Atualiza os dados do usuário na tabela users
      const { data, error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          role: userData.role,
          status: userData.status,
        })
        .eq('id', userId);

      if (error) throw error;

      // Se o email foi alterado, atualiza também na autenticação
      if (userData.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: userData.email,
        });

        if (authError) throw authError;
      }

      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      // Primeiro desativa o usuário na autenticação
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      // Depois remove os dados do usuário da tabela users
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  async updateUserRole(userId, role) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async uploadAvatar(userId, file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }
}

export const userService = new UserService();

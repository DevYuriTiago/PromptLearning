import { supabase } from './supabaseService';

class SecurityService {
  async getSecuritySettings() {
    try {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .single();

      if (error) throw error;

      // Se não existirem configurações, retorna as configurações padrão
      if (!data) {
        return {
          twoFactorAuth: false,
          passwordPolicy: {
            minLength: 8,
            requireNumbers: true,
            requireSymbols: true,
            requireUppercase: true,
          },
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          emailVerification: true,
        };
      }

      return data;
    } catch (error) {
      console.error('Error fetching security settings:', error);
      throw error;
    }
  }

  async updateSecuritySettings(settings) {
    try {
      const { data, error } = await supabase
        .from('security_settings')
        .upsert([settings], {
          onConflict: 'id',
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  }

  async checkPasswordStrength(password) {
    try {
      const settings = await this.getSecuritySettings();
      const { passwordPolicy } = settings;

      const errors = [];

      if (password.length < passwordPolicy.minLength) {
        errors.push(`A senha deve ter pelo menos ${passwordPolicy.minLength} caracteres`);
      }

      if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
        errors.push('A senha deve conter pelo menos um número');
      }

      if (passwordPolicy.requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('A senha deve conter pelo menos um símbolo');
      }

      if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('A senha deve conter pelo menos uma letra maiúscula');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      console.error('Error checking password strength:', error);
      throw error;
    }
  }

  async updateLoginAttempts(userId, success) {
    try {
      const settings = await this.getSecuritySettings();
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('login_attempts, locked_until')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (success) {
        // Reset login attempts on successful login
        const { error } = await supabase
          .from('users')
          .update({
            login_attempts: 0,
            locked_until: null,
          })
          .eq('id', userId);

        if (error) throw error;
      } else {
        const attempts = (user.login_attempts || 0) + 1;
        const updates = { login_attempts: attempts };

        if (attempts >= settings.maxLoginAttempts) {
          const lockoutEnd = new Date();
          lockoutEnd.setMinutes(lockoutEnd.getMinutes() + settings.lockoutDuration);
          updates.locked_until = lockoutEnd.toISOString();
        }

        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', userId);

        if (error) throw error;

        return {
          attempts,
          isLocked: attempts >= settings.maxLoginAttempts,
          lockoutEnd: updates.locked_until,
        };
      }
    } catch (error) {
      console.error('Error updating login attempts:', error);
      throw error;
    }
  }

  async checkAccountLockout(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('locked_until')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (!user.locked_until) return { isLocked: false };

      const lockoutEnd = new Date(user.locked_until);
      const now = new Date();

      if (lockoutEnd > now) {
        return {
          isLocked: true,
          remainingTime: Math.ceil((lockoutEnd - now) / 1000 / 60), // em minutos
        };
      }

      // Se o bloqueio já expirou, limpa o status
      await supabase
        .from('users')
        .update({
          locked_until: null,
          login_attempts: 0,
        })
        .eq('id', userId);

      return { isLocked: false };
    } catch (error) {
      console.error('Error checking account lockout:', error);
      throw error;
    }
  }

  async sendVerificationEmail(email) {
    try {
      const settings = await this.getSecuritySettings();
      
      if (!settings.emailVerification) {
        return { required: false };
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) throw error;

      return {
        required: true,
        message: 'Email de verificação enviado com sucesso',
      };
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  async setup2FA(userId) {
    try {
      const settings = await this.getSecuritySettings();
      
      if (!settings.twoFactorAuth) {
        return { required: false };
      }

      // Gera um segredo TOTP único para o usuário
      const secret = await this.generateTOTPSecret();

      // Salva o segredo no banco de dados
      const { error } = await supabase
        .from('users')
        .update({
          totp_secret: secret,
          totp_enabled: true,
        })
        .eq('id', userId);

      if (error) throw error;

      // Gera o QR code para o aplicativo autenticador
      const qrCode = await this.generateTOTPQRCode(secret);

      return {
        required: true,
        secret,
        qrCode,
        message: 'Configure a autenticação de dois fatores usando um aplicativo autenticador',
      };
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      throw error;
    }
  }

  async verify2FA(userId, token) {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('totp_secret')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Verifica se o token TOTP é válido
      const isValid = await this.verifyTOTPToken(user.totp_secret, token);

      if (!isValid) {
        throw new Error('Token 2FA inválido');
      }

      return { verified: true };
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      throw error;
    }
  }

  // Métodos auxiliares para TOTP (Time-based One-Time Password)
  async generateTOTPSecret() {
    // Implementação da geração de segredo TOTP
    const array = new Uint8Array(20);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async generateTOTPQRCode(secret) {
    // Implementação da geração do QR code
    // Você pode usar uma biblioteca como qrcode para gerar o QR code
    return `otpauth://totp/PromptLearning:${secret}?secret=${secret}&issuer=PromptLearning`;
  }

  async verifyTOTPToken(secret, token) {
    // Implementação da verificação do token TOTP
    // Você pode usar uma biblioteca como otplib para verificar o token
    return true; // Implementar a lógica real de verificação
  }
}

export const securityService = new SecurityService();

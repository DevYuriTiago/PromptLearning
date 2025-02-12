import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Security,
  Lock,
  VpnKey,
  Email,
  Timer,
  Password,
  Shield,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { securityService } from '../../services/securityService';

const SecuritySettings = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [settings, setSettings] = useState({
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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const data = await securityService.getSecuritySettings();
      setSettings(data);
    } catch (error) {
      console.error('Erro ao carregar configurações de segurança:', error);
      enqueueSnackbar('Erro ao carregar configurações', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handlePasswordPolicyChange = (policy, value) => {
    setSettings((prev) => ({
      ...prev,
      passwordPolicy: {
        ...prev.passwordPolicy,
        [policy]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await securityService.updateSecuritySettings(settings);
      enqueueSnackbar('Configurações atualizadas com sucesso', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      enqueueSnackbar('Erro ao salvar configurações', { variant: 'error' });
    }
  };

  const SecurityCard = ({ title, icon, children }) => (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(45deg, rgba(0,255,0,0.05) 0%, rgba(0,255,0,0.02) 100%)',
        border: '1px solid rgba(0,255,0,0.2)',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <IconButton
            sx={{
              backgroundColor: `${theme.palette.primary.main}20`,
              '&:hover': {
                backgroundColor: `${theme.palette.primary.main}30`,
              },
            }}
          >
            {icon}
          </IconButton>
          <Typography variant="h6" color="primary">
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Carregando configurações...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          background: 'linear-gradient(45deg, rgba(0,255,0,0.05) 0%, rgba(0,255,0,0.02) 100%)',
          border: '1px solid rgba(0,255,0,0.2)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" color="primary">
            Configurações de Segurança
          </Typography>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            startIcon={<Shield />}
            sx={{
              background: 'linear-gradient(45deg, #00ff00 30%, #39ff14 90%)',
              boxShadow: '0 0 10px rgba(0,255,0,0.3)',
            }}
          >
            Salvar Configurações
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Configure as políticas de segurança da plataforma para proteger os dados dos usuários.
        </Alert>

        <Grid container spacing={3}>
          {/* Autenticação */}
          <Grid item xs={12} md={6}>
            <SecurityCard title="Autenticação" icon={<Lock />}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.twoFactorAuth}
                    onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                  />
                }
                label="Autenticação de Dois Fatores (2FA)"
              />
              <Box mt={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Máximo de Tentativas de Login"
                  value={settings.maxLoginAttempts}
                  onChange={(e) =>
                    handleSettingChange('maxLoginAttempts', parseInt(e.target.value))
                  }
                  size="small"
                />
              </Box>
              <Box mt={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Duração do Bloqueio (minutos)"
                  value={settings.lockoutDuration}
                  onChange={(e) =>
                    handleSettingChange('lockoutDuration', parseInt(e.target.value))
                  }
                  size="small"
                />
              </Box>
            </SecurityCard>
          </Grid>

          {/* Política de Senha */}
          <Grid item xs={12} md={6}>
            <SecurityCard title="Política de Senha" icon={<VpnKey />}>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  type="number"
                  label="Comprimento Mínimo"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) =>
                    handlePasswordPolicyChange('minLength', parseInt(e.target.value))
                  }
                  size="small"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.passwordPolicy.requireNumbers}
                      onChange={(e) =>
                        handlePasswordPolicyChange('requireNumbers', e.target.checked)
                      }
                    />
                  }
                  label="Exigir Números"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.passwordPolicy.requireSymbols}
                      onChange={(e) =>
                        handlePasswordPolicyChange('requireSymbols', e.target.checked)
                      }
                    />
                  }
                  label="Exigir Símbolos"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.passwordPolicy.requireUppercase}
                      onChange={(e) =>
                        handlePasswordPolicyChange('requireUppercase', e.target.checked)
                      }
                    />
                  }
                  label="Exigir Letras Maiúsculas"
                />
              </Box>
            </SecurityCard>
          </Grid>

          {/* Sessão */}
          <Grid item xs={12} md={6}>
            <SecurityCard title="Configurações de Sessão" icon={<Timer />}>
              <TextField
                fullWidth
                type="number"
                label="Tempo Limite da Sessão (minutos)"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  handleSettingChange('sessionTimeout', parseInt(e.target.value))
                }
                size="small"
              />
            </SecurityCard>
          </Grid>

          {/* Verificação de Email */}
          <Grid item xs={12} md={6}>
            <SecurityCard title="Verificação de Email" icon={<Email />}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailVerification}
                    onChange={(e) =>
                      handleSettingChange('emailVerification', e.target.checked)
                    }
                  />
                }
                label="Exigir Verificação de Email"
              />
            </SecurityCard>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SecuritySettings;

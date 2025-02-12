import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Person,
  School,
  Timeline,
  EmojiEvents
} from '@mui/icons-material';
import { authService, progressService } from '../../services/supabaseService';
import { gamificationService } from '../../services/gamificationService';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [stats, setStats] = useState({
    completedModules: 0,
    totalModules: 0,
    points: 0,
    level: 1,
    nextLevelPoints: 100
  });
  const [recentProgress, setRecentProgress] = useState([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user found');
      }

      setUser(currentUser);
      setProfile({
        name: currentUser.profile?.name || '',
        email: currentUser.email || '',
        bio: currentUser.profile?.bio || ''
      });

      // Carregar progresso
      const { data: progress, error: progressError } = await progressService.getStudentProgress(currentUser.id);
      if (progressError) throw progressError;

      // Calcular estatísticas
      const completedModules = progress?.filter(p => p.status === 'completed').length || 0;
      const totalModules = progress?.length || 0;
      const points = progress?.reduce((acc, p) => acc + (p.points_earned || 0), 0) || 0;

      // Calcular nível baseado nos pontos
      const { level, nextLevelPoints } = gamificationService.calculateLevel(points);

      setStats({
        completedModules,
        totalModules,
        points,
        level,
        nextLevelPoints
      });

      // Definir progresso recente
      setRecentProgress(progress?.slice(0, 5) || []);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      await authService.updateProfile(user.id, {
        name: profile.name,
        bio: profile.bio
      });
      setEditing(false);
      await loadUserData();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Perfil Básico */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ width: 100, height: 100, mb: 2 }}
                  src={user?.profile?.avatar_url}
                >
                  <Person sx={{ fontSize: 40 }} />
                </Avatar>
                {editing ? (
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Nome"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={3}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={handleProfileUpdate}
                        disabled={loading}
                      >
                        Salvar
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditing(false)}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{profile.name}</Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {profile.email}
                    </Typography>
                    {profile.bio && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {profile.bio}
                      </Typography>
                    )}
                    <Button
                      variant="outlined"
                      onClick={() => setEditing(true)}
                      sx={{ mt: 2 }}
                    >
                      Editar Perfil
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Estatísticas */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <School sx={{ mr: 1 }} color="primary" />
                      <Typography variant="h6">
                        Progresso
                      </Typography>
                    </Box>
                    <Typography variant="h4" color="primary">
                      {stats.completedModules} / {stats.totalModules}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(stats.completedModules / stats.totalModules) * 100}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Timeline sx={{ mr: 1 }} color="primary" />
                      <Typography variant="h6">
                        Nível {stats.level}
                      </Typography>
                    </Box>
                    <Typography variant="h4" color="primary">
                      {stats.points} XP
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(stats.points / stats.nextLevelPoints) * 100}
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {stats.nextLevelPoints - stats.points} XP para o próximo nível
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Progresso Recente */}
            <Paper sx={{ mt: 2, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Progresso Recente
              </Typography>
              <List>
                {recentProgress.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: item.status === 'completed' ? 'success.main' : 'warning.main' }}>
                          <EmojiEvents />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.module.title}
                        secondary={
                          <React.Fragment>
                            <Typography variant="body2" component="span">
                              {item.status === 'completed' ? 'Completado' : 'Em progresso'}
                            </Typography>
                            {item.score > 0 && (
                              <Typography
                                variant="body2"
                                component="span"
                                color="primary"
                                sx={{ ml: 1 }}
                              >
                                • {item.score} pontos
                              </Typography>
                            )}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < recentProgress.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProfilePage;

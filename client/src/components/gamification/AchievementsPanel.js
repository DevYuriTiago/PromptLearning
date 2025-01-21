import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents,
  School,
  Star,
  Timeline,
  WorkspacePremium,
  Psychology
} from '@mui/icons-material';

const achievementIcons = {
  completion: EmojiEvents,
  score: Star,
  streak: Timeline,
  special: Psychology
};

const AchievementsPanel = ({ 
  achievements, 
  level, 
  points, 
  nextLevelPoints,
  completedModules,
  totalModules 
}) => {
  const progressToNextLevel = (points / nextLevelPoints) * 100;

  const getAchievementColor = (achievement) => {
    switch (achievement.status) {
      case 'locked':
        return 'text.disabled';
      case 'in_progress':
        return 'warning.main';
      case 'completed':
        return 'success.main';
      default:
        return 'primary.main';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Nível e Progresso */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: 'primary.main',
                fontSize: '1.5rem'
              }}
            >
              {level}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h6" gutterBottom>
              Nível {level}
            </Typography>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progressToNextLevel}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {points} / {nextLevelPoints} XP para o próximo nível
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Progresso Geral */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Seu Progresso
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <School sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6">
                    Módulos Completados
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {completedModules} / {totalModules}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(completedModules / totalModules) * 100}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WorkspacePremium sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6">
                    Pontuação Total
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {points} XP
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de Conquistas */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Conquistas
        </Typography>
        <List>
          {achievements.map((achievement, index) => {
            const Icon = achievementIcons[achievement.type] || EmojiEvents;
            return (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getAchievementColor(achievement) }}>
                    <Icon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Tooltip title={achievement.description}>
                      <Typography
                        variant="subtitle1"
                        color={getAchievementColor(achievement)}
                      >
                        {achievement.title}
                      </Typography>
                    </Tooltip>
                  }
                  secondary={
                    achievement.status === 'in_progress' ? (
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(achievement.current / achievement.required) * 100}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {achievement.current} / {achievement.required}
                        </Typography>
                      </Box>
                    ) : (
                      achievement.status === 'completed' && 'Concluído!'
                    )
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};

export default AchievementsPanel;

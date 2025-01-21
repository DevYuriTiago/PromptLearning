import React, { useState, useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { gamificationService } from '../../services/gamificationService';
import { authService } from '../../services/supabaseService';
import AchievementsPanel from '../gamification/AchievementsPanel';
import Leaderboard from '../gamification/Leaderboard';

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [userStats, setUserStats] = useState({
    level: 1,
    points: 0,
    nextLevelPoints: 100,
    completedModules: 0,
    totalModules: 0
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);

        if (user) {
          // Carregar conquistas do usuário
          const userAchievements = await gamificationService.getUserAchievements(user.id);
          setAchievements(userAchievements);

          // Carregar estatísticas do usuário
          const stats = await gamificationService.getUserStats(user.id);
          setUserStats(stats);

          // Carregar ranking
          const rankingData = await gamificationService.getLeaderboard();
          setLeaderboard(rankingData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Suas Conquistas
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Painel de Conquistas */}
          <Box sx={{ flex: 2 }}>
            <AchievementsPanel
              achievements={achievements}
              level={userStats.level}
              points={userStats.points}
              nextLevelPoints={userStats.nextLevelPoints}
              completedModules={userStats.completedModules}
              totalModules={userStats.totalModules}
            />
          </Box>

          {/* Ranking */}
          <Box sx={{ flex: 1 }}>
            <Leaderboard
              users={leaderboard}
              currentUserId={currentUser?.id}
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default AchievementsPage;

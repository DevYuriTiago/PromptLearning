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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          throw new Error('No user found');
        }

        // Carregar conquistas do usuário
        const { data: achievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', currentUser.id);

        if (achievementsError) throw achievementsError;

        // Carregar progresso do usuário
        const { data: progress, error: progressError } = await progressService.getStudentProgress(currentUser.id);
        if (progressError) throw progressError;

        // Calcular pontos totais
        const totalPoints = progress?.reduce((acc, p) => acc + (p.points_earned || 0), 0) || 0;

        // Calcular nível e próximo nível
        const { level, nextLevelPoints } = gamificationService.calculateLevel(totalPoints);

        setUserStats({
          points: totalPoints,
          level,
          nextLevelPoints,
          achievements: achievements?.length || 0,
          completedModules: progress?.filter(p => p.status === 'completed').length || 0
        });

        setAchievements(achievements || []);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
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

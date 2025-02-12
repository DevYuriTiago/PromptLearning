import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import './ModuleCard.css';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(10, 10, 10, 0.8)',
  border: '1px solid rgba(0, 255, 0, 0.2)',
  borderRadius: '15px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 0 20px rgba(0, 255, 0, 0.2)',
    border: '1px solid rgba(0, 255, 0, 0.4)',
  },
}));

const ModuleCard = ({ module, showProgress = false }) => {
  const navigate = useNavigate();
  const {
    id,
    title,
    description,
    thumbnail_url,
    xp_reward,
    difficulty,
    estimated_time,
    progress,
    total_ratings,
    average_rating,
    required_level
  } = module;

  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FFC107';
      case 'advanced':
        return '#F44336';
      default:
        return '#4CAF50';
    }
  };

  const handleClick = () => {
    navigate(`/module/${id}`);
  };

  return (
    <StyledCard onClick={handleClick} className="module-card">
      <CardMedia
        component="img"
        height="140"
        image={thumbnail_url || '/default-module-thumb.jpg'}
        alt={title}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent>
        <Typography variant="h6" component="h2" sx={{ 
          color: '#00ff00',
          marginBottom: 1,
          textShadow: '0 0 10px rgba(0, 255, 0, 0.3)'
        }}>
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ 
          marginBottom: 2,
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          {description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, marginBottom: 2 }}>
          <Chip
            label={`${xp_reward} XP`}
            size="small"
            sx={{
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              color: '#00ff00',
              border: '1px solid rgba(0, 255, 0, 0.3)'
            }}
          />
          <Chip
            label={difficulty}
            size="small"
            sx={{
              backgroundColor: `${getDifficultyColor(difficulty)}20`,
              color: getDifficultyColor(difficulty),
              border: `1px solid ${getDifficultyColor(difficulty)}40`
            }}
          />
          <Chip
            label={`${estimated_time} min`}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          />
        </Box>

        {required_level && (
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Nível Requerido: {required_level}
            </Typography>
          </Box>
        )}

        {showProgress && progress !== undefined && (
          <Box sx={{ width: '100%', marginBottom: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Progresso
              </Typography>
              <Typography variant="caption" sx={{ color: '#00ff00' }}>
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #00ff00, #00cc00)',
                },
              }}
            />
          </Box>
        )}

        {total_ratings > 0 && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            <Typography variant="caption">
              ⭐ {average_rating.toFixed(1)}
            </Typography>
            <Typography variant="caption">
              ({total_ratings} {total_ratings === 1 ? 'avaliação' : 'avaliações'})
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default ModuleCard;

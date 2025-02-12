import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import {
  EmojiEvents,
  Leaderboard as LeaderboardIcon,
  Star
} from '@mui/icons-material';

const getPositionColor = (position) => {
  switch (position) {
    case 1:
      return '#FFD700'; // Ouro
    case 2:
      return '#C0C0C0'; // Prata
    case 3:
      return '#CD7F32'; // Bronze
    default:
      return '#E0E0E0'; // Cinza para outras posições
  }
};

const getPositionIcon = (position) => {
  switch (position) {
    case 1:
      return <EmojiEvents sx={{ color: '#FFD700' }} />;
    case 2:
      return <EmojiEvents sx={{ color: '#C0C0C0' }} />;
    case 3:
      return <EmojiEvents sx={{ color: '#CD7F32' }} />;
    default:
      return <Star sx={{ color: '#E0E0E0' }} />;
  }
};

const Leaderboard = ({ users, currentUserId }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <LeaderboardIcon sx={{ mr: 1 }} color="primary" />
        <Typography variant="h5">
          Ranking de Alunos
        </Typography>
      </Box>

      <List>
        {users.map((user, index) => {
          const position = index + 1;
          const isCurrentUser = user.id === currentUserId;

          return (
            <React.Fragment key={user.id}>
              <ListItem
                sx={{
                  backgroundColor: isCurrentUser ? 'action.selected' : 'inherit',
                  borderRadius: 1
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: getPositionColor(position),
                      color: 'white'
                    }}
                  >
                    {getPositionIcon(position)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="subtitle1"
                        component="span"
                        sx={{ fontWeight: isCurrentUser ? 'bold' : 'regular' }}
                      >
                        {user.name}
                      </Typography>
                      {isCurrentUser && (
                        <Chip
                          label="Você"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        component="span"
                      >
                        Nível {user.level}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary"
                        component="span"
                        sx={{ ml: 2 }}
                      >
                        {user.points} XP
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {position < users.length && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};

export default Leaderboard;

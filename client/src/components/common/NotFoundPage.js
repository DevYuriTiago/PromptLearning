import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFoundPage = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 100,
            color: 'primary.main',
            mb: 2,
          }}
        />
        
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '4rem', sm: '6rem' },
            mb: 2,
            background: 'linear-gradient(45deg, #00ff00 30%, #39ff14 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
          }}
        >
          404
        </Typography>

        <Typography
          variant="h4"
          component="h2"
          sx={{
            mb: 3,
            color: 'primary.main',
            textShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
          }}
        >
          Página não encontrada
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: 'text.secondary',
            maxWidth: '600px',
          }}
        >
          A página que você está procurando não existe ou foi movida.
          Por favor, verifique o URL ou retorne à página inicial.
        </Typography>

        <Button
          component={Link}
          to="/"
          variant="contained"
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.1rem',
            background: 'linear-gradient(45deg, #00ff00 30%, #39ff14 90%)',
            boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
            '&:hover': {
              background: 'linear-gradient(45deg, #39ff14 30%, #00ff00 90%)',
              boxShadow: '0 0 20px rgba(0, 255, 0, 0.7)',
            },
          }}
        >
          Voltar para o início
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;

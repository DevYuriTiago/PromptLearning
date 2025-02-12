import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff00',
      light: '#80ff80',
      dark: '#008000',
      contrastText: '#000000',
    },
    secondary: {
      main: '#39ff14',
      light: '#83ff6b',
      dark: '#00c800',
      contrastText: '#000000',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          '&:hover': {
            boxShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #00ff00 30%, #39ff14 90%)',
          boxShadow: '0 0 10px #00ff00',
          '&:hover': {
            background: 'linear-gradient(45deg, #39ff14 30%, #00ff00 90%)',
          },
        },
        outlined: {
          borderColor: '#00ff00',
          '&:hover': {
            borderColor: '#39ff14',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderRadius: 12,
          border: '1px solid #00ff00',
          boxShadow: '0 0 10px rgba(0, 255, 0, 0.2)',
          '&:hover': {
            boxShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00',
            transform: 'translateY(-5px)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#00ff00',
              borderRadius: 8,
            },
            '&:hover fieldset': {
              borderColor: '#39ff14',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00ff00',
              boxShadow: '0 0 10px #00ff00',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '2px solid #00ff00',
          boxShadow: '0 0 20px #00ff00',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#00ff00',
      textShadow: '0 0 5px #00ff00, 0 0 10px #00ff00',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#00ff00',
      textShadow: '0 0 5px #00ff00',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#00ff00',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#00ff00',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#00ff00',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#00ff00',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;

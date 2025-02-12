import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
  const theme = useTheme();
  const { session, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      handleClose();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: 'none' } }}
          onClick={handleMobileMenuToggle}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          PromptLearning
        </Typography>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, alignItems: 'center' }}>
          {session ? (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/achievements"
                sx={{ textTransform: 'none' }}
              >
                Conquistas
              </Button>

              {user?.role === 'admin' && (
                <Button
                  color="inherit"
                  component={Link}
                  to="/admin"
                  sx={{ textTransform: 'none' }}
                >
                  Admin
                </Button>
              )}

              <IconButton color="inherit" onClick={handleMenu}>
                {user?.avatar_url ? (
                  <Avatar
                    src={user.avatar_url}
                    alt={user.email}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircleIcon />
                )}
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleClose}
                >
                  Perfil
                </MenuItem>
                <MenuItem onClick={handleSignOut}>Sair</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{ textTransform: 'none' }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/register"
                sx={{ textTransform: 'none' }}
              >
                Registrar
              </Button>
            </>
          )}
        </Box>

        {/* Mobile Menu */}
        <Box
          sx={{
            display: { xs: mobileMenuOpen ? 'flex' : 'none', sm: 'none' },
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            flexDirection: 'column',
            bgcolor: 'background.paper',
            boxShadow: 3,
            zIndex: 1
          }}
        >
          {session ? (
            <>
              <MenuItem
                component={Link}
                to="/achievements"
                onClick={handleMobileMenuToggle}
              >
                Conquistas
              </MenuItem>

              {user?.role === 'admin' && (
                <MenuItem
                  component={Link}
                  to="/admin"
                  onClick={handleMobileMenuToggle}
                >
                  Admin
                </MenuItem>
              )}

              <MenuItem
                component={Link}
                to="/profile"
                onClick={handleMobileMenuToggle}
              >
                Perfil
              </MenuItem>

              <MenuItem onClick={() => {
                handleSignOut();
                handleMobileMenuToggle();
              }}>
                Sair
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem
                component={Link}
                to="/login"
                onClick={handleMobileMenuToggle}
              >
                Login
              </MenuItem>
              <MenuItem
                component={Link}
                to="/register"
                onClick={handleMobileMenuToggle}
              >
                Registrar
              </MenuItem>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

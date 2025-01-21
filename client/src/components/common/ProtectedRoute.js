import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/supabaseService';

const ProtectedRoute = ({ user, requiredRole, children }) => {
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Se uma role específica é requerida, verifica se o usuário tem essa role
  if (requiredRole) {
    const userRole = user.role;
    if (userRole !== requiredRole) {
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute;

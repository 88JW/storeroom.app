import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Pokazuj loading podczas sprawdzania autoryzacji
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Sprawdzanie autoryzacji...
        </Typography>
      </Box>
    );
  }

  // Jeśli użytkownik nie jest zalogowany, przekieruj na login
  if (!user) {
    return <Navigate to="/logowanie" replace />;
  }

  // Jeśli użytkownik jest zalogowany, pokaż chroniony content
  return <>{children}</>;
};

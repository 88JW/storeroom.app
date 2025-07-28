import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper
} from '@mui/material';
import {
  Home,
  List,
  Settings,
  Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AppBottomNavigationProps {
  value?: number;
  onChange?: (event: React.SyntheticEvent, newValue: number) => void;
}

export const AppBottomNavigation: React.FC<AppBottomNavigationProps> = ({
  value = 0,
  onChange
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/welcome');
    } catch (error) {
      console.error('Błąd wylogowania:', error);
    }
  };

  // Auto-detect current page based on location
  const getCurrentValue = () => {
    if (location.pathname.includes('/spiżarnie')) return 0;
    if (location.pathname.includes('/lista')) return 1;
    if (location.pathname.includes('/ustawienia')) return 2;
    return value;
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        borderTop: '1px solid #e5e7eb'
      }}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={onChange}
        sx={{ bgcolor: '#f9f9f9' }}
      >
        <BottomNavigationAction 
          label="Dom" 
          icon={<Home />} 
          onClick={() => navigate('/spiżarnie')}
          sx={{ 
            color: location.pathname.includes('/spiżarnie') ? '#1993e5' : 'text.secondary' 
          }}
        />
        <BottomNavigationAction 
          label="Lista" 
          icon={<List />} 
          onClick={() => navigate('/lista')}
          sx={{ 
            color: location.pathname.includes('/lista') ? '#1993e5' : 'text.secondary' 
          }}
        />
        <BottomNavigationAction 
          label="Ustawienia" 
          icon={<Settings />} 
          onClick={() => navigate('/ustawienia')}
          sx={{ 
            color: location.pathname.includes('/ustawienia') ? '#1993e5' : 'text.secondary' 
          }}
        />
        <BottomNavigationAction 
          label="Wyjście" 
          icon={<Logout />} 
          onClick={handleLogout}
        />
      </BottomNavigation>
    </Paper>
  );
};

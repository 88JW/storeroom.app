import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge
} from '@mui/material';
import {
  Home,
  Warning,
  Settings,
  Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useExpiryAlerts } from '../../hooks/useExpiryAlerts';
import { designTokens } from '../../theme/appTheme';

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
  const alerts = useExpiryAlerts();

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
    if (location.pathname.includes('/spiżarnie') || location.pathname === '/') return 0;
    if (location.pathname.includes('/alerty')) return 1;
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
        borderTop: `1px solid ${designTokens.colors.secondary.light}`
      }}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={onChange}
        sx={{ bgcolor: designTokens.colors.background.default }}
      >
        <BottomNavigationAction 
          label="Home" 
          icon={<Home />} 
          onClick={() => navigate('/spiżarnie')}
          sx={{ 
            color: (location.pathname.includes('/spiżarnie') || location.pathname === '/') ? designTokens.colors.primary.main : 'text.secondary' 
          }}
        />
        <BottomNavigationAction 
          label="Alerty" 
          icon={
            <Badge 
              badgeContent={alerts.total > 0 ? alerts.total : (alerts.loading ? '...' : undefined)} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  top: -5,
                  right: -5,
                  fontSize: '0.7rem',
                  minWidth: '16px',
                  height: '16px'
                }
              }}
            >
              <Warning />
            </Badge>
          } 
          onClick={() => navigate('/alerty')}
          sx={{ 
            color: location.pathname.includes('/alerty') ? designTokens.colors.primary.main : 'text.secondary' 
          }}
        />
        <BottomNavigationAction 
          label="Ustawienia" 
          icon={<Settings />} 
          onClick={() => navigate('/ustawienia')}
          sx={{ 
            color: location.pathname.includes('/ustawienia') ? designTokens.colors.primary.main : 'text.secondary' 
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

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Info as InfoIcon,
  ExitToApp as LogoutIcon,
  Smartphone as PhoneIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { APP_VERSION, getAppInfo } from '../config/version';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const appInfo = getAppInfo();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/welcome');
    } catch (error) {
      console.error('Błąd wylogowania:', error);
    }
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      pb: 10 // Miejsce na dolny pasek nawigacji
    }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        p: 3,
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Przycisk powrotu */}
        <Button
          onClick={() => navigate('/spiżarnie')}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
            minWidth: 'auto',
            p: 1
          }}
        >
          <ArrowBackIcon />
        </Button>
        
        <Typography variant="h5" fontWeight="bold">
          Ustawienia
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Profil użytkownika */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Avatar
                sx={{ 
                  width: 64, 
                  height: 64, 
                  mr: 2,
                  bgcolor: 'primary.main',
                  fontSize: '1.5rem'
                }}
              >
                {user?.email ? getUserInitials(user.email) : 'U'}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {user?.displayName || 'Użytkownik'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || 'brak@email.com'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Informacje o koncie */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Informacje o koncie
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Nazwa użytkownika"
                  secondary={user?.displayName || 'Nie ustawiono'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Email"
                  secondary={user?.email || 'Nie ustawiono'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="ID użytkownika"
                  secondary={user?.uid || 'Brak'}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Informacje o aplikacji */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Informacje o aplikacji
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Wersja"
                  secondary={`${APP_VERSION.version} (${APP_VERSION.buildNumber})`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Platforma"
                  secondary={appInfo.platform}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Środowisko"
                  secondary={
                    <Chip 
                      label={APP_VERSION.environment} 
                      size="small" 
                      color={APP_VERSION.environment === 'production' ? 'success' : 'warning'}
                    />
                  }
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Akcje */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Akcje
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/spiżarnie')}
                sx={{ mt: 1 }}
              >
                Powrót do strony głównej
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Wyloguj się
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SettingsPage;

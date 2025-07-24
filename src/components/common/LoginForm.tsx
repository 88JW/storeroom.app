import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onInitializeDatabase: () => Promise<void>;
  error: string | null;
  loading: boolean;
  initLoading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onInitializeDatabase,
  error,
  loading,
  initLoading
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 3,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '400px',
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        {/* 🔒 Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <LockOutlinedIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 1,
            }}
          >
            Logowanie
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
            }}
          >
            Zaloguj się do swojego konta spiżarni
          </Typography>
        </Box>

        {/* ⚠️ Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 📝 Login Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Adres email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleEmailChange}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Hasło"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
            sx={{ mb: 3 }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              height: 48,
              mb: 2,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </Button>

          {/* 🔗 Links */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link href="#" variant="body2" sx={{ color: 'primary.main' }}>
              Zapomniałeś hasła?
            </Link>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Nie masz konta?{' '}
              <Link href="#" sx={{ color: 'primary.main' }}>
                Zarejestruj się
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* 🔧 Development Tools */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e5e7eb' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 2,
              textAlign: 'center',
            }}
          >
            🧪 Narzędzia deweloperskie
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            onClick={onInitializeDatabase}
            disabled={initLoading}
            sx={{
              height: 40,
              fontSize: '0.875rem',
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white',
              },
            }}
          >
            {initLoading ? 'Inicjalizacja...' : '🔄 Inicjalizuj bazę danych'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

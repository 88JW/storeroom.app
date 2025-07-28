import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert
} from '@mui/material';
import {
  LockReset as LockResetIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface ResetPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  error: string | null;
  success: boolean;
  loading: boolean;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  error,
  success,
  loading
}) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(email);
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
        px: 2,
        py: 4,
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '400px',
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          p: 4,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LockResetIcon 
            sx={{ 
              fontSize: 48, 
              color: 'primary.main', 
              mb: 2 
            }} 
          />
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Resetuj hasło
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Podaj swój adres email, a wyślemy Ci link do resetowania hasła
          </Typography>
        </Box>

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Email wysłany!</strong><br />
              Sprawdź swoją skrzynkę pocztową i kliknij w link resetujący hasło.
              Jeśli nie widzisz wiadomości, sprawdź folder spam.
            </Typography>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!success && (
          <>
            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Adres email"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 3 }}
                placeholder="twoj@email.com"
                helperText="Wpisz adres email powiązany z Twoim kontem"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !email.trim()}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  mb: 2,
                }}
              >
                {loading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
              </Button>
            </Box>
          </>
        )}

        {/* Back to Login Link */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link
            component={RouterLink}
            to="/logowanie"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 'bold',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <ArrowBackIcon fontSize="small" />
            {success ? 'Powrót do logowania' : 'Powrót do logowania'}
          </Link>
        </Box>

        {success && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Nie masz konta?{' '}
              <Link
                component={RouterLink}
                to="/rejestracja"
                sx={{
                  color: 'primary.main',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Zarejestruj się
              </Link>
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

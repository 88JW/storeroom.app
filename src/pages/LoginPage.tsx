import React from 'react';
import { Container, TextField, Button, Typography, Box, Link } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // Przykład ikony, którą możemy zastąpić

// Tymczasowa definicja prostego motywu Material UI
// Będziemy go rozbudowywać w miarę potrzeby, aby odzwierciedlić kolory ze Stichu
const theme = createTheme({
  palette: {
    primary: {
      main: '#1993e5', // primary-color ze Stichu
    },
    secondary: {
      main: '#f0f2f4', // secondary-color ze Stichu
    },
    background: {
      default: '#f9f9f9', // background-color ze Stichu
    },
    text: {
      primary: '#111418', // text-primary ze Stichu
      secondary: '#637488', // text-secondary ze Stichu
    },
  },
  typography: {
    h5: { // Odpowiednik typography_h1 ze Stichu (możemy dostosować rozmiar) 
      fontWeight: 700, // bold
      fontSize: '1.5rem', // text-3xl ze Stichu to 1.875rem, dostosujemy później
      color: '#111418', // text-primary
    },
    body2: { // Odpowiednik typography_body ze Stichu (mniejszy tekst)
      fontSize: '0.875rem', // text-sm
      color: '#637488', // text-secondary
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem', // rounded-lg
          fontWeight: 700, // font-bold
          textTransform: 'none', // Niech tekst przycisków nie będzie domyślnie UPPERCASE
        },
        containedPrimary: {
          backgroundColor: '#1993e5', // button_primary bg
          color: '#fff', // button_primary text
          '&:hover': {
            backgroundColor: '#1565c0', // Ciemniejszy odcień na hover, dopasujemy później
          },
        },
        containedSecondary: {
          backgroundColor: '#f0f2f4', // button_secondary bg
          color: '#111418', // button_secondary text
          '&:hover': {
            backgroundColor: '#e0e0e0', // Ciemniejszy odcień na hover, dopasujemy później
          },
        },
      },
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: '0.5rem', // rounded-lg
                    // Możemy tutaj dodać więcej stylów, np. cień
                },
            },
        },
    },
  },
});

const LoginPage: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            spacing: 8, // odpowiada space-y-8 ze Stichu
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            {/* Tutaj możemy dodać ikonę, np. z Material UI icons */}
            {/* Na razie użyjemy LockOutlinedIcon jako placeholder */}
            <LockOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography component="h1" variant="h5" sx={{ marginTop: 2 }}>
              Witaj z powrotem
            </Typography>
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              Zaloguj się, aby zarządzać swoją lodówką.
            </Typography>
          </Box>
          <Box component="form" noValidate sx={{ mt: 3, width: '100%', spacing: 6 }}> {/* spacing 6 odpowiada space-y-6 */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adres e-mail"
              name="email"
              autoComplete="email"
              autoFocus
              sx={{ marginBottom: 2 }} // odstęp między polami
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
              sx={{ marginBottom: 2 }} // odstęp między polami
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
              <Link href="#" variant="body2">
                Zapomniałeś hasła?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: '3rem' }} // mt i mb z Material UI, height z html
            >
              Zaloguj się
            </Button>
          </Box>
          <Box sx={{ mt: 5, textAlign: 'center' }}> {/* mt 5 odpowiada mt-10 (około) */}
            <Typography variant="body2">
              Nie masz konta?
              <Link href="#" variant="body2" sx={{ ml: 0.5 }}>
                Zarejestruj się
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default LoginPage;

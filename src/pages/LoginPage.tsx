import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Link, Alert } from '@mui/material'; // Dodajemy Alert
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom'; // Importujemy useNavigate
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importujemy metodę logowania z Firebase Auth
import { auth } from '../firebase'; // Importujemy instancję auth z naszej konfiguracji Firebase
import DatabaseInitializer from '../services/DatabaseInitializer'; // DODANE: Import inicjalizatora bazy
import { UserService } from '../services/UserService'; // DODANE: Import serwisu użytkowników

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // Stan do wyświetlania błędów
  const [initLoading, setInitLoading] = useState(false); // DODANE: Stan ładowania dla inicjalizacji
  const navigate = useNavigate(); // Hook do nawigacji

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  // DODANE: Funkcja inicjalizacji bazy danych
  const handleInitializeDatabase = async () => {
    setInitLoading(true);
    setError(null);
    
    try {
      await DatabaseInitializer.initializeUserDatabase(
        'Gh2ywl1BIAhib9yxK2XOox0WUBL2',
        'test@example.com',
        'Test User'
      );
      alert('✅ Baza danych została pomyślnie zainicjalizowana!');
    } catch (error) {
      console.error('Błąd inicjalizacji bazy:', error);
      setError('Błąd podczas inicjalizacji bazy danych');
    } finally {
      setInitLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => { // Zmieniamy na async
    event.preventDefault();
    setError(null); // Czyścimy poprzednie błędy

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Logowanie udane
      console.log('Zalogowano pomyślnie!', userCredential.user);
      console.log('🔑 USER ID (UID):', userCredential.user.uid); // DODANE: Wyświetlenie UID
      console.log('📧 EMAIL:', userCredential.user.email); // DODANE: Wyświetlenie email
      
      // 🔗 SYNCHRONIZACJA: Aktualizuj lastLoginAt w Firestore
      await UserService.updateLastLogin(userCredential.user.uid);
      
      // Przekieruj użytkownika na listę spiżarni
      navigate('/spiżarnie');
    } catch (error: Error | unknown) { // Obsługa błędów logowania
      console.error('Błąd logowania:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Wystąpił nieoczekiwany błąd podczas logowania');
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            spacing: 8,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <LockOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography component="h1" variant="h5" sx={{ marginTop: 2 }}>
              Witaj z powrotem
            </Typography>
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              Zaloguj się, aby zarządzać swoją lodówką.
            </Typography>
          </Box>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, width: '100%', spacing: 6 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adres e-mail"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
              sx={{ marginBottom: 2 }}
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
              sx={{ marginBottom: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
              <Link href="#" variant="body2">
                Zapomniałeś hasła?
              </Link>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>} {/* Wyświetlamy komunikat błędu */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: '3rem' }}
            >
              Zaloguj się
            </Button>
            
            {/* DODANE: Przycisk inicjalizacji bazy danych */}
            <Button
              fullWidth
              variant="outlined"
              onClick={handleInitializeDatabase}
              disabled={initLoading}
              sx={{ mb: 2, height: '3rem' }}
            >
              {initLoading ? 'Tworzenie bazy...' : '🏗️ Inicjalizuj bazę danych'}
            </Button>
          </Box>
          <Box sx={{ mt: 5, textAlign: 'center' }}>
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
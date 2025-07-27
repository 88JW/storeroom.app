// 🆕 Strona tworzenia nowej spiżarni

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { ArrowBack, Kitchen, Home, Group } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { appTheme } from '../theme/appTheme';
import SpizarniaService from '../services/SpizarniaService';

// 📝 Interfejs danych formularza
interface CreateSpizarniaFormData {
  nazwa: string;
  opis: string;
  typ: 'osobista' | 'wspólna';
  ikona: string;
}

// 🎨 Dostępne ikony dla spiżarni
const availableIcons = [
  { value: '🏠', label: 'Dom', icon: '🏠' },
  { value: '🥘', label: 'Kuchnia', icon: '🥘' },
  { value: '🍽️', label: 'Jadalnia', icon: '🍽️' },
  { value: '❄️', label: 'Zamrażarka', icon: '❄️' },
  { value: '🏢', label: 'Biuro', icon: '🏢' },
  { value: '🏪', label: 'Sklep', icon: '🏪' },
  { value: '👨‍👩‍👧‍👦', label: 'Rodzina', icon: '👨‍👩‍👧‍👦' },
  { value: '🎒', label: 'Podróż', icon: '🎒' }
];

const CreateSpizarniaPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 📋 Stan formularza
  const [formData, setFormData] = useState<CreateSpizarniaFormData>({
    nazwa: '',
    opis: '',
    typ: 'osobista',
    ikona: '🏠'
  });
  
  // 🔄 Stan aplikacji
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📝 Obsługa zmian w polach formularza
  const handleInputChange = (field: keyof CreateSpizarniaFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ Walidacja formularza
  const validateForm = (): boolean => {
    if (!formData.nazwa.trim()) {
      setError('Nazwa spiżarni jest wymagana');
      return false;
    }
    
    if (formData.nazwa.length < 2) {
      setError('Nazwa musi mieć co najmniej 2 znaki');
      return false;
    }
    
    if (formData.nazwa.length > 50) {
      setError('Nazwa nie może być dłuższa niż 50 znaków');
      return false;
    }

    return true;
  };

  // 💾 Obsługa zapisywania
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user?.uid) {
      setError('Użytkownik nie jest zalogowany');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Utwórz nową spiżarnię
      const spizarniaId = await SpizarniaService.createSpiżarnia(
        user.uid,
        formData.nazwa.trim(),
        formData.opis.trim() || undefined,
        formData.typ,
        formData.ikona
      );

      console.log('✅ Utworzono spiżarnię:', spizarniaId);
      
      // Przekieruj do listy spiżarni
      navigate('/spiżarnie');
      
    } catch (err) {
      console.error('❌ Błąd tworzenia spiżarni:', err);
      setError('Błąd podczas tworzenia spiżarni. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  // ❌ Anulowanie
  const handleCancel = () => {
    navigate('/spiżarnie');
  };

  return (
    <ThemeProvider theme={appTheme}>
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 📱 Nagłówek */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCancel}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Nowa spiżarnia
            </Typography>
          </Toolbar>
        </AppBar>

        {/* 📝 Formularz */}
        <Container sx={{ py: 3, flexGrow: 1 }}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              borderRadius: 3,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            {/* Komunikat błędu */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Formularz */}
            <Box component="form" onSubmit={handleSubmit}>
              {/* Nazwa spiżarni */}
              <TextField
                fullWidth
                label="Nazwa spiżarni"
                value={formData.nazwa}
                onChange={handleInputChange('nazwa')}
                required
                margin="normal"
                placeholder="np. Kuchnia, Piwnica, Biuro..."
                inputProps={{ maxLength: 50 }}
                helperText={`${formData.nazwa.length}/50 znaków`}
              />

              {/* Opis */}
              <TextField
                fullWidth
                label="Opis (opcjonalnie)"
                value={formData.opis}
                onChange={handleInputChange('opis')}
                margin="normal"
                multiline
                rows={3}
                placeholder="Krótki opis spiżarni..."
                inputProps={{ maxLength: 200 }}
                helperText={`${formData.opis.length}/200 znaków`}
              />

              {/* Typ spiżarni */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Typ spiżarni</InputLabel>
                <Select
                  value={formData.typ}
                  label="Typ spiżarni"
                  onChange={handleInputChange('typ')}
                >
                  <MenuItem value="osobista">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Home fontSize="small" />
                      Osobista - tylko Ty
                    </Box>
                  </MenuItem>
                  <MenuItem value="wspólna">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Group fontSize="small" />
                      Wspólna - możesz udostępnić
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Wybierz ikonę
                </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
                  gap: 1,
                  maxWidth: 400
                }}>
                  {availableIcons.map((iconOption) => (
                    <Paper
                      key={iconOption.value}
                      elevation={formData.ikona === iconOption.value ? 3 : 1}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: formData.ikona === iconOption.value ? 'primary.light' : 'background.paper',
                        color: formData.ikona === iconOption.value ? 'primary.contrastText' : 'text.primary',
                        transition: 'all 0.2s',
                        '&:hover': {
                          elevation: 3,
                          transform: 'scale(1.05)'
                        }
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, ikona: iconOption.value }))}
                    >
                      <Typography variant="h4" sx={{ mb: 0.5 }}>
                        {iconOption.icon}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {iconOption.label}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>

              {/* Przyciski akcji */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'flex-end',
                mt: 4 
              }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={loading}
                  sx={{ minWidth: 100 }}
                >
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !formData.nazwa.trim()}
                  sx={{ minWidth: 100 }}
                  startIcon={loading ? <CircularProgress size={20} /> : <Kitchen />}
                >
                  {loading ? 'Tworzenie...' : 'Utwórz'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default CreateSpizarniaPage;

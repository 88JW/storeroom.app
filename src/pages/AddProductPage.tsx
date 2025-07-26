import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  IconButton,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  QrCodeScanner,
  Add as AddIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { appTheme } from '../theme/appTheme';
import { ProduktService } from '../services/ProduktService';
import { SpizarniaService } from '../services/SpizarniaService';
import { useAuth } from '../hooks/useAuth';
import { Timestamp } from 'firebase/firestore';
import { KATEGORIE, JEDNOSTKI } from '../types';

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    nazwa: '',
    kategoria: 'Inne',
    ilość: 1,
    jednostka: 'szt' as const,
    dataWażności: '',
    lokalizacja: 'lodówka' as const,
    opis: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spizarniaId, setSpizarniaId] = useState<string | null>(null);
  const [spizarniaNazwa, setSpizarniaNazwa] = useState<string>('');

  // Pobierz ID spiżarni z URL lub wybierz pierwszą dostępną
  useEffect(() => {
    const loadSpizarnia = async () => {
      try {
        if (!user?.uid) return;

        const urlSpizarniaId = searchParams.get('spizarnia');
        
        if (urlSpizarniaId) {
          setSpizarniaId(urlSpizarniaId);
          
          // Pobierz nazwę spiżarni
          const userSpizarnie = await SpizarniaService.getUserSpiżarnie(user.uid);
          const spizarnia = userSpizarnie.find(s => s.id === urlSpizarniaId);
          if (spizarnia) {
            setSpizarniaNazwa(spizarnia.metadata.nazwa);
          }
        } else {
          // Jeśli brak ID w URL, przekieruj do pierwszej dostępnej spiżarni
          const userSpizarnie = await SpizarniaService.getUserSpiżarnie(user.uid);
          if (userSpizarnie.length > 0) {
            navigate(`/dodaj-produkt?spizarnia=${userSpizarnie[0].id}`);
          } else {
            setError('Nie znaleziono żadnych spiżarni');
          }
        }
      } catch (err) {
        console.error('Błąd ładowania spiżarni:', err);
        setError('Błąd podczas ładowania spiżarni');
      }
    };

    loadSpizarnia();
  }, [user?.uid, searchParams, navigate]);

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | 
           { target: { value: unknown } }
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!spizarniaId || !user?.uid) {
      setError(`Brak danych spiżarni lub użytkownika. SpizarniaId: ${spizarniaId}, UserId: ${user?.uid}`);
      return;
    }

    if (!formData.nazwa.trim()) {
      setError('Nazwa produktu jest wymagana');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Przygotuj dane produktu
      const dataWażności = formData.dataWażności ? new Date(formData.dataWażności) : null;
      
      const nowyProdukt: {
        nazwa: string;
        kategoria: string;
        ilość: number;
        jednostka: string;
        lokalizacja: string;
        status: string;
        dataWażności?: Timestamp;
        notatki?: string;
      } = {
        nazwa: formData.nazwa.trim(),
        kategoria: formData.kategoria,
        ilość: formData.ilość,
        jednostka: formData.jednostka,
        lokalizacja: formData.lokalizacja,
        status: 'dostępny'
      };

      // Dodaj opcjonalne pola tylko jeśli mają wartość
      if (dataWażności) {
        nowyProdukt.dataWażności = Timestamp.fromDate(dataWażności);
      }
      
      if (formData.opis.trim()) {
        nowyProdukt.notatki = formData.opis.trim();
      }

      // Dodaj produkt do Firestore
      console.log('AddProductPage: Dodawanie produktu do spiżarni:', spizarniaId);
      console.log('AddProductPage: Dane produktu:', nowyProdukt);
      await ProduktService.addProdukt(spizarniaId, user.uid, nowyProdukt as any);

      // Reset formularza
      setFormData({
        nazwa: '',
        kategoria: 'Inne',
        ilość: 1,
        jednostka: 'szt' as const,
        dataWażności: '',
        lokalizacja: 'lodówka' as const,
        opis: ''
      });

      // Przekieruj z powrotem do listy produktów  
      navigate(`/lista?spizarnia=${spizarniaId}`);

    } catch (err) {
      console.error('Błąd dodawania produktu:', err);
      if (err instanceof Error) {
        setError(`Błąd podczas dodawania produktu: ${err.message}`);
      } else {
        setError('Błąd podczas dodawania produktu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScanBarcode = () => {
    // TODO: Implementacja skanowania kodów kreskowych
    setError('Skanowanie kodów kreskowych będzie dostępne wkrótce');
  };

  const handleGoBack = () => {
    if (spizarniaId) {
      navigate(`/lista?spizarnia=${spizarniaId}`);
    } else {
      navigate('/spiżarnie');
    }
  };

  return (
    <ThemeProvider theme={appTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <Paper 
          elevation={1}
          sx={{ 
            position: 'sticky',
            top: 0,
            zIndex: 10,
            borderRadius: 0
          }}
        >
          <Container maxWidth="sm">
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              py: 2,
              minHeight: 64
            }}>
              <IconButton 
                onClick={handleGoBack}
                sx={{ mr: 2 }}
              >
                <ArrowBack />
              </IconButton>
              
              <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
                Dodaj produkt
              </Typography>
              
              <Box sx={{ width: 48 }} /> {/* Spacer dla wyrównania */}
            </Box>
          </Container>
        </Paper>

        {/* Main Content */}
        <Container maxWidth="sm" sx={{ flexGrow: 1, py: 3 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ space: 3 }}>
            
            {/* Barcode Scanner */}
            <Paper 
              sx={{ 
                p: 3, 
                mb: 3,
                border: '2px dashed',
                borderColor: 'primary.main',
                bgcolor: 'primary.light',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'primary.50'
                }
              }}
              onClick={handleScanBarcode}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 2 
              }}>
                <QrCodeScanner sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography 
                  variant="h6" 
                  sx={{ color: 'primary.main', fontWeight: 600 }}
                >
                  Skanuj kod kreskowy
                </Typography>
              </Box>
            </Paper>

            {/* Divider */}
            <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
              <Divider sx={{ flexGrow: 1 }} />
              <Typography 
                variant="body2" 
                sx={{ mx: 2, color: 'text.secondary' }}
              >
                LUB DODAJ RĘCZNIE
              </Typography>
              <Divider sx={{ flexGrow: 1 }} />
            </Box>

            {/* Form Fields */}
            <Box sx={{ space: 3 }}>
              
              {/* Nazwa produktu */}
              <TextField
                fullWidth
                label="Nazwa produktu"
                placeholder="np. Mleko"
                value={formData.nazwa}
                onChange={handleInputChange('nazwa')}
                required
                sx={{ mb: 3 }}
              />

              {/* Ilość + Jednostka */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={8}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Ilość"
                    placeholder="np. 1"
                    value={formData.ilość}
                    onChange={handleInputChange('ilość')}
                    inputProps={{ min: 0.1, step: 0.1 }}
                    required
                  />
                </Grid>
                <Grid size={4}>
                  <FormControl fullWidth>
                    <InputLabel>Jednostka</InputLabel>
                    <Select
                      value={formData.jednostka}
                      label="Jednostka"
                      onChange={handleInputChange('jednostka')}
                    >
                      {JEDNOSTKI.map(jednostka => (
                        <MenuItem key={jednostka.value} value={jednostka.value}>
                          {jednostka.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Data ważności */}
              <TextField
                fullWidth
                type="date"
                label="Data ważności"
                value={formData.dataWażności}
                onChange={handleInputChange('dataWażności')}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 3 }}
              />

              {/* Kategoria */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Kategoria</InputLabel>
                <Select
                  value={formData.kategoria}
                  label="Kategoria"
                  onChange={handleInputChange('kategoria')}
                >
                  {Object.values(KATEGORIE).map(kategoria => (
                    <MenuItem key={kategoria.nazwa} value={kategoria.nazwa}>
                      {kategoria.ikona} {kategoria.nazwa}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Lokalizacja */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Lokalizacja</InputLabel>
                <Select
                  value={formData.lokalizacja}
                  label="Lokalizacja"
                  onChange={handleInputChange('lokalizacja')}
                >
                  <MenuItem value="lodówka">🧊 Lodówka</MenuItem>
                  <MenuItem value="zamrażarka">❄️ Zamrażarka</MenuItem>
                  <MenuItem value="szafka">🗄️ Szafka</MenuItem>
                </Select>
              </FormControl>

              {/* Opis (opcjonalny) */}
              <TextField
                fullWidth
                label="Opis (opcjonalny)"
                placeholder="Dodatkowe informacje..."
                value={formData.opis}
                onChange={handleInputChange('opis')}
                multiline
                rows={2}
                sx={{ mb: 3 }}
              />

            </Box>

            {/* Error Display */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Informacja o spiżarni */}
            {spizarniaNazwa && (
              <Typography 
                variant="body2" 
                sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}
              >
                Dodajesz do: <strong>{spizarniaNazwa}</strong>
              </Typography>
            )}

          </Box>
        </Container>

        {/* Footer z przyciskiem */}
        <Paper 
          elevation={3}
          sx={{ 
            position: 'sticky',
            bottom: 0,
            borderRadius: 0,
            p: 2
          }}
        >
          <Container maxWidth="sm">
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || !formData.nazwa.trim()}
              startIcon={loading ? undefined : <AddIcon />}
              sx={{ 
                height: 56,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              {loading ? 'Dodawanie...' : 'Dodaj produkt'}
            </Button>
          </Container>
        </Paper>

      </Box>
    </ThemeProvider>
  );
};

export default AddProductPage;

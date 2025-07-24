import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Alert
} from '@mui/material';
import {
  Search,
  Add,
  Home,
  List,
  Settings,
  Kitchen
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { ProduktService } from '../services/ProduktService';
import { SpizarniaService } from '../services/SpizarniaService';
import type { Produkt, SpizarniaMetadata } from '../types';

// 🎨 Motyw zgodny z designem stich-ui
const theme = createTheme({
  palette: {
    primary: {
      main: '#1993e5', // --primary-color
    },
    secondary: {
      main: '#f0f2f4', // --secondary-color
    },
    background: {
      default: '#f9f9f9', // --background-color
      paper: '#ffffff',
    },
    text: {
      primary: '#111418', // --text-primary
      secondary: '#637488', // --text-secondary
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '1.25rem',
      color: '#111418',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#637488',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          marginBottom: '0.75rem',
          // 📱 Mobile-first design
          '@media (max-width: 600px)': {
            margin: '0 0 0.75rem 0',
            borderRadius: '0.75rem',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px', // rounded-full
          fontWeight: 700,
          textTransform: 'none',
        },
        containedPrimary: {
          backgroundColor: '#1993e5',
          '&:hover': {
            backgroundColor: '#1976d2',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '9999px', // rounded-full
            backgroundColor: '#f0f2f4',
            '& fieldset': {
              border: 'none',
            },
          },
        },
      },
    },
  },
});

const ProductListPage: React.FC = () => {
  const [produkty, setProdukty] = useState<Produkt[]>([]);
  const [filteredProdukty, setFilteredProdukty] = useState<Produkt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('wszystko');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSpizarnia, setActiveSpizarnia] = useState<SpizarniaMetadata | null>(null);
  const [bottomNavValue, setBottomNavValue] = useState(2); // Lista jest aktywna

  const navigate = useNavigate();

  // 🔗 Pobieranie produktów z pierwszej dostępnej spiżarni
  useEffect(() => {
    const loadProductsFromFirstSpizarnia = async () => {
      try {
        setLoading(true);
        setError(null);

        // Pobierz spiżarnie użytkownika (na razie na sztywno UID)
        const userSpizarnie = await SpizarniaService.getUserSpiżarnie('Gh2ywl1BIAhib9yxK2XOox0WUBL2');
        
        if (userSpizarnie.length === 0) {
          setError('Nie znaleziono żadnych spiżarni. Kliknij przycisk inicjalizacji bazy.');
          return;
        }

        // Weź pierwszą spiżarnię
        const firstSpizarnia = userSpizarnie[0];
        setActiveSpizarnia(firstSpizarnia.metadata);

        // Pobierz produkty z tej spiżarni
        const produktyData = await ProduktService.getProdukty(firstSpizarnia.id, 'Gh2ywl1BIAhib9yxK2XOox0WUBL2');
        setProdukty(produktyData);
        setFilteredProdukty(produktyData);

      } catch (err) {
        console.error('Błąd ładowania produktów:', err);
        setError('Błąd podczas ładowania produktów');
      } finally {
        setLoading(false);
      }
    };

    loadProductsFromFirstSpizarnia();
  }, []);

  // 🔍 Filtrowanie produktów
  useEffect(() => {
    let filtered = produkty;

    // Filtruj po wyszukiwanej frazie
    if (searchQuery) {
      filtered = filtered.filter(produkt =>
        produkt.nazwa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        produkt.kategoria.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtruj po lokalizacji
    if (selectedFilter !== 'wszystko') {
      filtered = filtered.filter(produkt => 
        produkt.lokalizacja?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    setFilteredProdukty(filtered);
  }, [searchQuery, selectedFilter, produkty]);

  // 📅 Funkcja do obliczania dni do wygaśnięcia
  const getDaysUntilExpiry = (dataWażności?: Date | { toDate: () => Date }): { days: number; color: string; text: string } => {
    if (!dataWażności) return { days: 999, color: '#10b981', text: 'Brak daty' };

    const today = new Date();
    const expiryDate = 'toDate' in dataWażności ? dataWażności.toDate() : dataWażności;
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { days: diffDays, color: '#ef4444', text: 'Przeterminowane' };
    if (diffDays <= 2) return { days: diffDays, color: '#ef4444', text: `${diffDays} dni` };
    if (diffDays <= 7) return { days: diffDays, color: '#f97316', text: `${diffDays} dni` };
    return { days: diffDays, color: '#10b981', text: `${diffDays} dni` };
  };

  // 🎨 Komponent karty produktu zgodny z designem
  const ProductCard: React.FC<{ produkt: Produkt }> = ({ produkt }) => {
    const expiryInfo = getDaysUntilExpiry(produkt.dataWażności);
    
    return (
      <Card>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
          {/* 🖼️ Obrazek produktu */}
          <Avatar
            sx={{ 
              width: 56, 
              height: 56, 
              bgcolor: '#e0e7ff',
              fontSize: '1.5rem'
            }}
          >
            {produkt.obrazek ? (
              <Box
                component="img"
                src={produkt.obrazek}
                alt={produkt.nazwa}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <Kitchen color="primary" />
            )}
          </Avatar>

          {/* 📝 Informacje o produkcie */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111418' }}>
              {produkt.nazwa}
            </Typography>
            <Typography variant="body2" sx={{ color: '#637488' }}>
              {produkt.ilość} {produkt.jednostka}
            </Typography>
          </Box>

          {/* 📅 Data ważności */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: '#637488', fontSize: '0.75rem' }}>
              Ważne do
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500, 
                color: expiryInfo.color 
              }}
            >
              {expiryInfo.text}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography>Ładowanie produktów...</Typography>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ pb: 8 }}> {/* Padding bottom for bottom navigation */}
        
        {/* 📱 Header */}
        <AppBar 
          position="sticky" 
          sx={{ 
            bgcolor: '#f9f9f9', 
            boxShadow: 'none',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ width: 40 }} />
            <Typography variant="h1" sx={{ color: '#111418' }}>
              {activeSpizarnia?.nazwa || 'Lista'}
            </Typography>
            <IconButton 
              sx={{ 
                bgcolor: '#e0e7ff', 
                color: '#1993e5',
                width: 40,
                height: 40
              }}
              onClick={() => navigate('/dodaj-produkt')}
            >
              <Add />
            </IconButton>
          </Toolbar>

          {/* 🔍 Wyszukiwarka */}
          <Box sx={{ px: 2, pb: 2 }}>
            <TextField
              fullWidth
              placeholder="Szukaj"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#637488' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* 🏷️ Filtry */}
          <Box sx={{ px: 2, pb: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
            {['wszystko', 'lodówka', 'zamrażarka'].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setSelectedFilter(filter)}
                sx={{ 
                  minWidth: 'auto',
                  whiteSpace: 'nowrap',
                  ...(selectedFilter !== filter && {
                    bgcolor: '#f0f2f4',
                    color: '#111418',
                    borderColor: 'transparent',
                    '&:hover': {
                      bgcolor: '#e5e7eb',
                      borderColor: 'transparent',
                    }
                  })
                }}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </Box>
        </AppBar>

        {/* 📋 Lista produktów */}
        <Container sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {filteredProdukty.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" sx={{ color: '#637488' }}>
                {produkty.length === 0 
                  ? 'Brak produktów w spiżarni. Dodaj pierwszy produkt!' 
                  : 'Nie znaleziono produktów spełniających kryteria.'
                }
              </Typography>
            </Box>
          ) : (
            <Box>
              {filteredProdukty.map((produkt) => (
                <ProductCard key={produkt.id} produkt={produkt} />
              ))}
            </Box>
          )}
        </Container>

        {/* 📱 Bottom Navigation */}
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
            value={bottomNavValue}
            onChange={(_, newValue) => setBottomNavValue(newValue)}
            sx={{ bgcolor: '#f9f9f9' }}
          >
            <BottomNavigationAction 
              label="Strona główna" 
              icon={<Home />} 
              onClick={() => navigate('/welcome')}
            />
            <BottomNavigationAction 
              label="Dodaj" 
              icon={<Add />} 
              onClick={() => navigate('/dodaj-produkt')}
            />
            <BottomNavigationAction 
              label="Lista" 
              icon={<List />} 
              sx={{ color: '#1993e5' }}
            />
            <BottomNavigationAction 
              label="Ustawienia" 
              icon={<Settings />} 
              onClick={() => navigate('/ustawienia')}
            />
          </BottomNavigation>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default ProductListPage;

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Alert,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MoreVert, LocationOn } from '@mui/icons-material';
import { ProduktService } from '../services/ProduktService';
import { SpizarniaService } from '../services/SpizarniaService';
import type { Produkt, SpizarniaMetadata } from '../types';
import { appTheme, designTokens } from '../theme/appTheme';
import { AppBottomNavigation } from '../components/common/AppBottomNavigation';
import { LoadingState } from '../components/common/LoadingState';
import { ProductCard } from '../components/spizarnia/ProductCard';
import { SearchBar } from '../components/common/SearchBar';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useSpizarniaLokalizacje } from '../hooks/useSpizarniaLokalizacje';

const ProductListPage: React.FC = () => {
  const [produkty, setProdukty] = useState<Produkt[]>([]);
  const [filteredProdukty, setFilteredProdukty] = useState<Produkt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('wszystko');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSpizarnia, setActiveSpizarnia] = useState<SpizarniaMetadata | null>(null);
  const [currentSpizarniaId, setCurrentSpizarniaId] = useState<string | null>(null);

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // 📍 Pobierz lokalizacje dla filtrów
  const { lokalizacje } = useSpizarniaLokalizacje(currentSpizarniaId);

  // 🏷️ Utwórz filtry z lokalizacji
  const filters = ['wszystko', ...lokalizacje.map(lok => lok.id)];
  const filterLabels = lokalizacje.reduce((acc, lok) => {
    acc[lok.id] = `${lok.ikona} ${lok.nazwa}`;
    return acc;
  }, { wszystko: 'Wszystko' } as Record<string, string>);

  // 🔗 Pobieranie produktów z wybranej spiżarni
  useEffect(() => {
    const loadProductsFromSpizarnia = async () => {
      try {
        setLoading(true);
        setError(null);

        // Pobierz ID spiżarni z URL parametrów
        const spizarniaId = searchParams.get('spizarnia');
        
        if (!spizarniaId) {
          // Jeśli brak ID, pobierz pierwszą dostępną spiżarnię
          if (!user?.uid) {
            throw new Error('Użytkownik nie jest zalogowany');
          }
          
          const userSpizarnie = await SpizarniaService.getUserSpiżarnie(user.uid);
          
          if (userSpizarnie.length === 0) {
            setError('Nie znaleziono żadnych spiżarni. Kliknij przycisk inicjalizacji bazy.');
            return;
          }

          // Przekieruj na pierwszą spiżarnię
          navigate(`/lista?spizarnia=${userSpizarnie[0].id}`);
          return;
        }

        // Ustaw ID spiżarni dla hooka lokalizacji
        setCurrentSpizarniaId(spizarniaId);

        // Pobierz metadane spiżarni poprzez getUserSpiżarnie
        if (!user?.uid) {
          throw new Error('Użytkownik nie jest zalogowany');
        }
        
        const userSpizarnie = await SpizarniaService.getUserSpiżarnie(user.uid);
        const currentSpizarnia = userSpizarnie.find(s => s.id === spizarniaId);
        
        if (!currentSpizarnia) {
          setError('Nie znaleziono spiżarni lub brak dostępu');
          return;
        }
        
        setActiveSpizarnia(currentSpizarnia.metadata);

        // Pobierz produkty z tej spiżarni
        const produktyData = await ProduktService.getProdukty(spizarniaId, user.uid);
        setProdukty(produktyData);
        setFilteredProdukty(produktyData);

      } catch (err) {
        console.error('Błąd ładowania produktów:', err);
        setError('Błąd podczas ładowania produktów');
      } finally {
        setLoading(false);
      }
    };

    loadProductsFromSpizarnia();
  }, [searchParams, navigate, user?.uid]);

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

  // � Handler functions
  const handleBack = () => {
    navigate('/spiżarnie');
  };

  const handleAddProduct = () => {
    const spizarniaId = searchParams.get('spizarnia');
    if (spizarniaId) {
      navigate(`/dodaj-produkt?spizarnia=${spizarniaId}`);
    } else {
      navigate('/dodaj-produkt');
    }
  };

  const handleManageLokalizacje = () => {
    const spizarniaId = searchParams.get('spizarnia');
    if (spizarniaId) {
      navigate(`/lokalizacje/${spizarniaId}`);
    }
    setMenuAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleProductClick = (produkt: Produkt) => {
    // Navigate to product details
    const spizarniaId = searchParams.get('spizarnia');
    console.log('Navigating to product details:', produkt);
    navigate(`/produkt/${produkt.id}?spizarnia=${spizarniaId}`);
  };

  const handleProductEdit = (produkt: Produkt) => {
    const spizarniaId = searchParams.get('spizarnia');
    if (spizarniaId) {
      navigate(`/edytuj-produkt?spizarnia=${spizarniaId}&id=${produkt.id}`);
    }
  };

  const handleProductDelete = async (produkt: Produkt) => {
    const spizarniaId = searchParams.get('spizarnia');
    if (!spizarniaId || !user?.uid) {
      console.error('Brak ID spiżarni lub użytkownika');
      return;
    }

    try {
      // Potwierdź usunięcie
      const confirmed = window.confirm(`Czy na pewno chcesz usunąć "${produkt.nazwa}"?`);
      if (!confirmed) return;

      console.log('🗑️ Usuwanie produktu:', produkt.nazwa);
      
      // Usuń produkt z bazy danych
      await ProduktService.deleteProdukt(spizarniaId, produkt.id!, user.uid);
      
      // Zaktualizuj lokalne listy
      const updatedProdukty = produkty.filter(p => p.id !== produkt.id);
      setProdukty(updatedProdukty);
      setFilteredProdukty(updatedProdukty.filter(p => {
        const matchesSearch = !searchQuery || 
          p.nazwa.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.kategoria.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === 'wszystko' || 
          p.lokalizacja?.toLowerCase() === selectedFilter.toLowerCase();
        return matchesSearch && matchesFilter;
      }));

      console.log('✅ Produkt usunięty pomyślnie');
    } catch (error) {
      console.error('❌ Błąd podczas usuwania produktu:', error);
      alert('Wystąpił błąd podczas usuwania produktu. Spróbuj ponownie.');
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={appTheme}>
        <Box sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          pb: 8 
        }}>
          <PageHeader 
            title="Lista produktów"
            onBack={handleBack}
            onAction={handleAddProduct}
          />
          <Container sx={{ mt: 2 }}>
            <LoadingState message="Ładowanie produktów..." type="cards" />
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={appTheme}>
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: 8 
      }}>
        
        {/* 📱 Header */}
        <PageHeader 
          title={activeSpizarnia?.nazwa || 'Lista produktów'}
          onBack={handleBack}
          onAction={handleAddProduct}
        />

        {/* 🔍 Search and Filters */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          filters={filters}
          filterLabels={filterLabels}
        />

        {/* 📋 Lista produktów */}
        <Container sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {filteredProdukty.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" sx={{ color: designTokens.colors.text.secondary }}>
                {produkty.length === 0 
                  ? 'Brak produktów w spiżarni. Dodaj pierwszy produkt!' 
                  : 'Nie znaleziono produktów spełniających kryteria.'
                }
              </Typography>
            </Box>
          ) : (
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(auto-fill, minmax(300px, 1fr))'
                },
                gap: { xs: 1.5, md: 3 },
                py: 2
              }}
            >
              {filteredProdukty.map((produkt) => (
                <ProductCard 
                  key={produkt.id} 
                  produkt={produkt}
                  onClick={handleProductClick}
                  onEdit={handleProductEdit}
                  onDelete={handleProductDelete}
                />
              ))}
            </Box>
          )}
        </Container>

        {/* � FAB Menu for additional actions */}
        <Fab
          color="secondary"
          aria-label="more options"
          onClick={handleMenuOpen}
          sx={{
            position: 'fixed',
            bottom: 90, // Above bottom navigation
            right: 16,
            zIndex: 1000
          }}
        >
          <MoreVert />
        </Fab>

        {/* 📝 Action Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <MenuItem onClick={handleManageLokalizacje}>
            <ListItemIcon>
              <LocationOn fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Zarządzaj lokalizacjami" />
          </MenuItem>
        </Menu>

        {/* �📱 Bottom Navigation */}
        <AppBottomNavigation />
      </Box>
    </ThemeProvider>
  );
};

export default ProductListPage;

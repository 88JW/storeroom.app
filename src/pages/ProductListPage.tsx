import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProduktService } from '../services/ProduktService';
import { SpizarniaService } from '../services/SpizarniaService';
import type { Produkt, SpizarniaMetadata } from '../types';
import { appTheme } from '../theme/appTheme';
import { AppBottomNavigation } from '../components/common/AppBottomNavigation';
import { LoadingState } from '../components/common/LoadingState';
import { ProductCard } from '../components/spizarnia/ProductCard';
import { SearchBar } from '../components/common/SearchBar';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../hooks/useAuth';

const ProductListPage: React.FC = () => {
  const [produkty, setProdukty] = useState<Produkt[]>([]);
  const [filteredProdukty, setFilteredProdukty] = useState<Produkt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('wszystko');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSpizarnia, setActiveSpizarnia] = useState<SpizarniaMetadata | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

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

  const handleProductClick = (produkt: Produkt) => {
    // TODO: Navigate to product details
    console.log('Clicked product:', produkt);
  };

  const handleProductEdit = (produkt: Produkt) => {
    const spizarniaId = searchParams.get('spizarnia');
    if (spizarniaId) {
      navigate(`/edytuj-produkt?spizarnia=${spizarniaId}&id=${produkt.id}`);
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
                <ProductCard 
                  key={produkt.id} 
                  produkt={produkt}
                  onClick={handleProductClick}
                  onEdit={handleProductEdit}
                />
              ))}
            </Box>
          )}
        </Container>

        {/* 📱 Bottom Navigation */}
        <AppBottomNavigation />
      </Box>
    </ThemeProvider>
  );
};

export default ProductListPage;

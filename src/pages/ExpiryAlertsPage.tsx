import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Fab
} from '@mui/material';
import {
  Warning,
  Error,
  Edit,
  Schedule,
  Refresh,
  ArrowBack
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { SpizarniaService } from '../services/SpizarniaService';
import { ProduktService } from '../services/ProduktService';
import type { Produkt } from '../types';
import { AppBottomNavigation } from '../components/common/AppBottomNavigation';
import { useNavigate } from 'react-router-dom';

interface ProductWithLocation extends Produkt {
  spizarniaName: string;
  spizarniaId: string;
  lokalizacjaNazwa?: string;
}

const ExpiryAlertsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Wszystkie produkty wymagające uwagi
  const [alertProducts, setAlertProducts] = useState<ProductWithLocation[]>([]);

  const getDaysUntilExpiry = (dataWażności?: { toDate: () => Date } | Date): number => {
    if (!dataWażności) return 999;

    const today = new Date();
    const expiryDate = 'toDate' in dataWażności ? dataWażności.toDate() : dataWażności;
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const loadExpiryData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Ładowanie danych alertów...');

      // Pobierz wszystkie spiżarnie użytkownika
      const spiżarnie = await SpizarniaService.getUserSpiżarnie(user.uid);
      console.log('📦 Znalezione spiżarnie:', spiżarnie.length);
      
      const allAlertProducts: ProductWithLocation[] = [];

      // Przejdź przez wszystkie spiżarnie i produkty
      for (const spizarnia of spiżarnie) {
        try {
          const produkty = await ProduktService.getProdukty(spizarnia.id, user.uid);
          console.log(`📋 Produkty w ${spizarnia.metadata.nazwa}:`, produkty.length);
          
          produkty.forEach((produkt: Produkt) => {
            const days = getDaysUntilExpiry(produkt.dataWażności);

            // Uwzględnij produkty przeterminowane lub wygasające w ciągu 7 dni
            if (days <= 7) {
              // Znajdź nazwę lokalizacji
              const lokalizacjaNazwa = spizarnia.metadata.lokalizacje?.find(
                lok => lok.id === produkt.lokalizacja
              )?.nazwa || 'Nieznana lokalizacja';

              const productWithLocation: ProductWithLocation = {
                ...produkt,
                spizarniaName: spizarnia.metadata.nazwa,
                spizarniaId: spizarnia.id,
                lokalizacjaNazwa
              };

              allAlertProducts.push(productWithLocation);
            }
          });
        } catch (spizarniaError) {
          console.warn(`⚠️ Błąd ładowania produktów z spiżarni ${spizarnia.id}:`, spizarniaError);
        }
      }

      // Sortuj produkty według daty ważności (najpierw przeterminowane)
      allAlertProducts.sort((a, b) => {
        const daysA = getDaysUntilExpiry(a.dataWażności);
        const daysB = getDaysUntilExpiry(b.dataWażności);
        return daysA - daysB;
      });

      console.log('🚨 Produkty z alertami:', allAlertProducts.length);
      setAlertProducts(allAlertProducts);

    } catch (err) {
      console.error('❌ Błąd ładowania alertów wygaśnięcia:', err);
      setError('Nie udało się załadować alertów o wygaśnięciu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpiryData();
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEditProduct = (produkt: ProductWithLocation) => {
    navigate('/edytuj-produkt', {
      state: {
        productId: produkt.id,
        spizarniaId: produkt.spizarniaId,
        productData: produkt
      }
    });
  };

  const formatExpiryDate = (dataWażności?: { toDate: () => Date } | Date): string => {
    if (!dataWażności) return 'Brak daty';
    
    const date = 'toDate' in dataWażności ? dataWażności.toDate() : dataWażności;
    return date.toLocaleDateString('pl-PL');
  };

  const getExpiryInfo = (days: number) => {
    if (days < 0) {
      return {
        chip: (
          <Chip 
            icon={<Error />} 
            label={`Przeterminowane ${Math.abs(days)} dni`}
            color="error"
            size="small"
          />
        ),
        priority: 'high',
        color: '#ffebee'
      };
    } else if (days === 0) {
      return {
        chip: (
          <Chip 
            icon={<Warning />} 
            label="Wygasa dziś"
            color="error"
            size="small"
          />
        ),
        priority: 'high',
        color: '#fff3e0'
      };
    } else if (days === 1) {
      return {
        chip: (
          <Chip 
            icon={<Warning />} 
            label="Wygasa jutro"
            color="warning"
            size="small"
          />
        ),
        priority: 'medium',
        color: '#fff3e0'
      };
    } else {
      return {
        chip: (
          <Chip 
            icon={<Schedule />} 
            label={`${days} dni`}
            color="warning"
            size="small"
          />
        ),
        priority: 'low',
        color: '#fffde7'
      };
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, pb: 10 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            Alerty wygaśnięcia
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Ładowanie alertów...
          </Typography>
        </Box>
        <AppBottomNavigation />
      </Container>
    );
  }

  const expiredCount = alertProducts.filter(p => getDaysUntilExpiry(p.dataWażności) < 0).length;
  const expiringCount = alertProducts.filter(p => {
    const days = getDaysUntilExpiry(p.dataWażności);
    return days >= 0 && days <= 2;
  }).length;
  const soonExpiringCount = alertProducts.filter(p => {
    const days = getDaysUntilExpiry(p.dataWażności);
    return days >= 3 && days <= 7;
  }).length;

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          Alerty wygaśnięcia
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Podsumowanie alertów */}
      <Card sx={{ mb: 3, bgcolor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Warning color="warning" />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Łącznie alertów: {alertProducts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {expiredCount} przeterminowanych • {expiringCount} wygasających w 0-2 dni • {soonExpiringCount} niedługo wygasających
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Lista produktów */}
      {alertProducts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Schedule sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Brak alertów!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Wszystkie produkty mają aktualne daty ważności 🎉
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Produkty wymagające uwagi
            </Typography>
            <List>
              {alertProducts.map((produkt, index) => {
                const days = getDaysUntilExpiry(produkt.dataWażności);
                const expiryInfo = getExpiryInfo(days);
                
                return (
                  <React.Fragment key={`${produkt.spizarniaId}-${produkt.id}-${index}`}>
                    <ListItem 
                      sx={{ 
                        bgcolor: expiryInfo.color,
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemText
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={
                          <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold" component="span">
                              {produkt.nazwa}
                            </Typography>
                            {expiryInfo.chip}
                          </Box>
                        }
                        secondary={
                          <Box component="div">
                            <Typography variant="body2" color="text.secondary" fontWeight="bold" component="div">
                              📍 {produkt.spizarniaName} • {produkt.lokalizacjaNazwa}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" component="div">
                              📅 Data ważności: {formatExpiryDate(produkt.dataWażności)}
                            </Typography>
                            {produkt.ilość && (
                              <Typography variant="body2" color="text.secondary" component="div">
                                📦 Ilość: {produkt.ilość} {produkt.jednostka || ''}
                              </Typography>
                            )}
                            {produkt.kategoria && (
                              <Typography variant="body2" color="text.secondary" component="div">
                                🏷️ Kategoria: {produkt.kategoria}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="edit" 
                          onClick={() => handleEditProduct(produkt)}
                          sx={{ 
                            bgcolor: 'white',
                            '&:hover': { bgcolor: '#f5f5f5' }
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < alertProducts.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                );
              })}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button do odświeżania */}
      <Fab
        color="primary"
        aria-label="refresh"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1000
        }}
        onClick={loadExpiryData}
        disabled={loading}
      >
        <Refresh />
      </Fab>

      <AppBottomNavigation />
    </Container>
  );
};

export default ExpiryAlertsPage;

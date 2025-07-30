// 📊 Dashboard ze statystykami spiżarni

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  CheckCircle,
  PieChart,
  Download,
  Refresh,
  Category,
  LocationOn,
  CalendarToday,
  Star
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme, designTokens } from '../../theme/appTheme';
import { PageHeader } from '../../components/common/PageHeader';
import { AppBottomNavigation } from '../../components/common/AppBottomNavigation';
import { useAuth } from '../../hooks/useAuth';
import AnalyticsService, { type SpizarniaStats } from '../../services/AnalyticsService';

const StatsPage: React.FC = () => {
  const { spizarniaId } = useParams<{ spizarniaId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stats, setStats] = useState<SpizarniaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, [spizarniaId, user]);

  const loadStats = async () => {
    if (!spizarniaId || !user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const statsData = await AnalyticsService.getSpizarniaStats(spizarniaId, user.uid);
      setStats(statsData);
    } catch (err) {
      console.error('Błąd ładowania statystyk:', err);
      setError('Nie udało się załadować statystyk');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleBack = () => {
    navigate(`/lista?spizarnia=${spizarniaId}`);
  };

  const getHealthColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getHealthLabel = (score: number): string => {
    if (score >= 80) return 'Doskonała';
    if (score >= 60) return 'Dobra';
    if (score >= 40) return 'Wymaga uwagi';
    return 'Krytyczna';
  };

  if (loading) {
    return (
      <ThemeProvider theme={appTheme}>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <PageHeader 
            title="Statystyki"
            onBack={handleBack}
            showActionButton={false}
          />
          <Container sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  if (error || !stats) {
    return (
      <ThemeProvider theme={appTheme}>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <PageHeader 
            title="Statystyki"
            onBack={handleBack}
            showActionButton={false}
          />
          <Container sx={{ mt: 3 }}>
            <Alert severity="error">{error || 'Brak danych statystycznych'}</Alert>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  const healthScore = Math.max(0, 100 - (stats.expiredProducts * 10) - (stats.expiringSoon * 5));

  return (
    <ThemeProvider theme={appTheme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
        
        {/* Header */}
        <PageHeader 
          title="Statystyki spiżarni"
          onBack={handleBack}
          onAction={handleRefresh}
          actionIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
        />

        <Container sx={{ mt: 2 }}>
          
          {/* Szybki przegląd */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {stats.totalProducts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Produktów
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="error" fontWeight="bold">
                    {stats.expiredProducts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Przeterminowane
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {stats.expiringSoon}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Wygasa wkrótce
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color={getHealthColor(healthScore)} fontWeight="bold">
                    {healthScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kondycja
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Kondycja spiżarni */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: getHealthColor(healthScore) }} />
                <Typography variant="h6">Kondycja spiżarni</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={healthScore} 
                  color={getHealthColor(healthScore)}
                  sx={{ flex: 1, mr: 2, height: 8, borderRadius: 4 }}
                />
                <Chip 
                  label={getHealthLabel(healthScore)}
                  color={getHealthColor(healthScore)}
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Kondycja oparta na ilości produktów przeterminowanych i wygasających
              </Typography>
            </CardContent>
          </Card>

          {/* Kategorie produktów */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Category sx={{ mr: 1 }} />
                <Typography variant="h6">Kategorie produktów</Typography>
              </Box>
              
              <List dense>
                {stats.categories.slice(0, 5).map((category, index) => (
                  <ListItem key={index} divider={index < 4}>
                    <ListItemIcon>
                      <Typography variant="h6">{category.icon}</Typography>
                    </ListItemIcon>
                    <ListItemText 
                      primary={category.category}
                      secondary={`${category.count} produktów (${category.percentage}%)`}
                    />
                    <LinearProgress 
                      variant="determinate" 
                      value={category.percentage} 
                      sx={{ width: 60, mr: 1 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Lokalizacje */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn sx={{ mr: 1 }} />
                <Typography variant="h6">Rozmieszczenie produktów</Typography>
              </Box>
              
              <List dense>
                {stats.locations.map((location, index) => (
                  <ListItem key={index} divider={index < stats.locations.length - 1}>
                    <ListItemIcon>
                      <Typography variant="h6">{location.icon}</Typography>
                    </ListItemIcon>
                    <ListItemText 
                      primary={location.location}
                      secondary={`${location.count} produktów (${location.percentage}%)`}
                    />
                    <LinearProgress 
                      variant="determinate" 
                      value={location.percentage} 
                      sx={{ width: 60, mr: 1 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Popularne produkty */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ mr: 1 }} />
                <Typography variant="h6">Najczęściej dodawane</Typography>
              </Box>
              
              <List dense>
                {stats.popularProducts.map((product, index) => (
                  <ListItem key={index} divider={index < stats.popularProducts.length - 1}>
                    <ListItemText 
                      primary={product.productName}
                      secondary={`Dodawany ${product.frequency} razy`}
                    />
                    <Chip 
                      label={`${product.frequency}x`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Trendy miesięczne */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday sx={{ mr: 1 }} />
                <Typography variant="h6">Trendy miesięczne</Typography>
              </Box>
              
              <List dense>
                {stats.monthlyTrends.slice(-3).map((month, index) => (
                  <ListItem key={index} divider={index < 2}>
                    <ListItemText 
                      primary={month.month}
                      secondary={`Dodano: ${month.added}, Zużyto: ${month.consumed}, Wygasło: ${month.expired}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Statystyki marnowania */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Marnowanie żywności</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Zmarnowane produkty
                  </Typography>
                  <Typography variant="h5" color="error">
                    {stats.wasteStats.totalWasted}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Wartość strat
                  </Typography>
                  <Typography variant="h5" color="error">
                    {stats.wasteStats.wasteValue.toFixed(2)} zł
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Najczęściej marnowana kategoria: <strong>{stats.wasteStats.mostWastedCategory}</strong>
                  </Typography>
                  {stats.wasteStats.wasteReduction > 0 && (
                    <Chip 
                      label={`${stats.wasteStats.wasteReduction}% mniej niż w ub. miesiącu`}
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Akcje */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Eksport danych
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<Download />}
                fullWidth
                onClick={() => {
                  // TODO: Implementacja eksportu
                  alert('Funkcja eksportu w przygotowaniu');
                }}
                sx={{ mb: 1 }}
              >
                Pobierz raport PDF
              </Button>
              
              <Typography variant="caption" color="text.secondary">
                Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
              </Typography>
            </CardContent>
          </Card>

        </Container>

        <AppBottomNavigation />
      </Box>
    </ThemeProvider>
  );
};

export default StatsPage;

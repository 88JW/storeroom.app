import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Schedule,
  LocationOn,
  Category,
  Description
} from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../hooks/useAuth';
import { ProduktService } from '../services/ProduktService';
import { appTheme } from '../theme/appTheme';
import { AppBottomNavigation } from '../components/common/AppBottomNavigation';
import { LoadingState } from '../components/common/LoadingState';
import type { Produkt } from '../types';
import { KATEGORIE } from '../types';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [produkt, setProdukt] = useState<Produkt | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const spizarniaId = searchParams.get('spizarnia');

  useEffect(() => {
    if (!id || !spizarniaId || !user) return;

    const loadProdukt = async () => {
      try {
        setLoading(true);
        const data = await ProduktService.getProduktById(spizarniaId, id, user.uid);
        setProdukt(data);
      } catch (error) {
        console.error('Błąd ładowania produktu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProdukt();
  }, [id, spizarniaId, user]);

  const handleBack = () => {
    navigate(`/lista?spizarnia=${spizarniaId}`);
  };

  const handleEdit = () => {
    navigate(`/edytuj-produkt?spizarnia=${spizarniaId}&id=${id}`);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!produkt || !spizarniaId || !user) return;

    try {
      setDeleting(true);
      await ProduktService.deleteProdukt(spizarniaId, produkt.id, user.uid);
      navigate(`/lista?spizarnia=${spizarniaId}`);
    } catch (error) {
      console.error('Błąd usuwania produktu:', error);
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const getExpiryStatus = (dataWażności?: { toDate: () => Date }) => {
    if (!dataWażności) return { label: 'Brak daty', color: 'default' as const };

    const teraz = new Date();
    const waznosc = dataWażności.toDate();
    const roznicaDni = Math.ceil((waznosc.getTime() - teraz.getTime()) / (1000 * 60 * 60 * 24));

    if (roznicaDni < 0) {
      return { label: `Przeterminowane ${Math.abs(roznicaDni)} dni temu`, color: 'error' as const };
    } else if (roznicaDni === 0) {
      return { label: 'Wygasa dziś', color: 'warning' as const };
    } else if (roznicaDni === 1) {
      return { label: 'Wygasa jutro', color: 'warning' as const };
    } else if (roznicaDni <= 3) {
      return { label: `Wygasa za ${roznicaDni} dni`, color: 'warning' as const };
    } else {
      return { label: `Ważne jeszcze ${roznicaDni} dni`, color: 'success' as const };
    }
  };

  const formatDate = (timestamp?: { toDate: () => Date }) => {
    if (!timestamp) return 'Brak daty';
    return timestamp.toDate().toLocaleDateString('pl-PL');
  };

  if (loading) {
    return (
      <ThemeProvider theme={appTheme}>
        <LoadingState type="spinner" message="Ładowanie szczegółów produktu..." />
        <AppBottomNavigation />
      </ThemeProvider>
    );
  }

  if (!produkt) {
    return (
      <ThemeProvider theme={appTheme}>
        <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              Produkt nie został znaleziony
            </Typography>
            <Button onClick={handleBack} sx={{ mt: 2 }}>
              Powrót do listy
            </Button>
          </Box>
        </Container>
        <AppBottomNavigation />
      </ThemeProvider>
    );
  }

  const expiryStatus = getExpiryStatus(produkt.dataWażności);
  const kategoriIkona = KATEGORIE[produkt.kategoria]?.ikona || '📦';

  return (
    <ThemeProvider theme={appTheme}>
      <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 3 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleBack} color="primary">
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" fontWeight="600">
              Szczegóły produktu
            </Typography>
          </Box>
        </Box>

        {/* Product Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            {/* Product Header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 3 
            }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                fontSize: '2rem',
                bgcolor: 'primary.light'
              }}>
                {kategoriIkona}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  {produkt.nazwa}
                </Typography>
                <Chip 
                  label={expiryStatus.label}
                  color={expiryStatus.color}
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Product Details */}
            <Stack spacing={2}>
              {/* Ilość */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                  Ilość:
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {produkt.ilość} {produkt.jednostka}
                </Typography>
              </Box>

              {/* Kategoria */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Category color="action" />
                <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                  Kategoria:
                </Typography>
                <Typography variant="body1">
                  {kategoriIkona} {produkt.kategoria}
                </Typography>
              </Box>

              {/* Lokalizacja */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationOn color="action" />
                <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                  Lokalizacja:
                </Typography>
                <Typography variant="body1">
                  {produkt.lokalizacja}
                </Typography>
              </Box>

              {/* Data ważności */}
              {produkt.dataWażności && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Schedule color="action" />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                    Data ważności:
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(produkt.dataWażności)}
                  </Typography>
                </Box>
              )}

              {/* Notatki */}
              {produkt.notatki && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Description color="action" />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                    Notatki:
                  </Typography>
                  <Typography variant="body1">
                    {produkt.notatki}
                  </Typography>
                </Box>
              )}

              {/* Data dodania */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                  Dodano:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(produkt.dataDodania)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleEdit}
            sx={{ flex: 1 }}
          >
            Edytuj
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDeleteClick}
            sx={{ flex: 1 }}
          >
            Usuń
          </Button>
        </Stack>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Usuń produkt</DialogTitle>
          <DialogContent>
            <Typography>
              Czy na pewno chcesz usunąć produkt "{produkt.nazwa}"? 
              Ta operacja jest nieodwracalna.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>
              Anuluj
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              color="error" 
              variant="contained"
              disabled={deleting}
            >
              {deleting ? <CircularProgress size={20} /> : 'Usuń'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      <AppBottomNavigation />
    </ThemeProvider>
  );
};

export default ProductDetailsPage;

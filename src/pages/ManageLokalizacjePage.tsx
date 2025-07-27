// 📍 Strona zarządzania lokalizacjami w spiżarni

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Fab,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { 
  ArrowBack, 
  Add, 
  Edit, 
  Delete, 
  LocationOn,
  Save,
  Cancel
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { appTheme } from '../theme/appTheme';
import LokalizacjaService from '../services/LokalizacjaService';
import type { SpizarniaLokalizacja } from '../types';
import { LoadingState } from '../components/common/LoadingState';

// 🎨 Dostępne ikony dla lokalizacji
const availableIcons = [
  { value: '❄️', label: 'Lodówka', color: '#3B82F6' },
  { value: '🧊', label: 'Zamrażarka', color: '#1E40AF' },
  { value: '🗄️', label: 'Szafka', color: '#8B5CF6' },
  { value: '🏠', label: 'Spiżarnia', color: '#F59E0B' },
  { value: '🌿', label: 'Balkon', color: '#10B981' },
  { value: '🥘', label: 'Kuchnia', color: '#EF4444' },
  { value: '🍽️', label: 'Jadalnia', color: '#F97316' },
  { value: '📦', label: 'Magazyn', color: '#6B7280' },
  { value: '🧰', label: 'Piwnica', color: '#78716C' },
  { value: '🏪', label: 'Garaż', color: '#0891B2' }
];

// 📝 Interfejs formularza lokalizacji
interface LokalizacjaFormData {
  nazwa: string;
  ikona: string;
  kolor: string;
  opis: string;
}

const ManageLokalizacjePage: React.FC = () => {
  const navigate = useNavigate();
  const { spizarniaId } = useParams<{ spizarniaId: string }>();
  const { user } = useAuth();
  
  // 📋 Stan komponentu
  const [lokalizacje, setLokalizacje] = useState<SpizarniaLokalizacja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  
  // 📝 Stan formularza
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LokalizacjaFormData>({
    nazwa: '',
    ikona: '❄️',
    kolor: '#3B82F6',
    opis: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // 📱 Ładowanie danych
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!spizarniaId || !user?.uid) {
          throw new Error('Brak wymaganych parametrów');
        }

        setLoading(true);
        setError(null);

        // Pobierz lokalizacje
        const lokalizacjeData = await LokalizacjaService.getLokalizacje(spizarniaId, user.uid);
        setLokalizacje(lokalizacjeData);

        // Pobierz statystyki
        const statsData = await LokalizacjaService.getLokalizacjeStatystyki(spizarniaId, user.uid);
        const statsCount: Record<string, number> = {};
        Object.entries(statsData).forEach(([id, data]) => {
          statsCount[id] = data.liczbaProduktow;
        });
        setStats(statsCount);

      } catch (err) {
        console.error('Błąd ładowania lokalizacji:', err);
        setError(err instanceof Error ? err.message : 'Błąd ładowania danych');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [spizarniaId, user?.uid]);

  // 🔙 Powrót do spiżarni
  const handleGoBack = () => {
    navigate(`/lista?spizarnia=${spizarniaId}`);
  };

  // ➕ Dodawanie nowej lokalizacji
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      nazwa: '',
      ikona: '❄️',
      kolor: '#3B82F6',
      opis: ''
    });
    setDialogOpen(true);
  };

  // ✏️ Edycja lokalizacji
  const handleEdit = (lokalizacja: SpizarniaLokalizacja) => {
    setEditingId(lokalizacja.id);
    setFormData({
      nazwa: lokalizacja.nazwa,
      ikona: lokalizacja.ikona,
      kolor: lokalizacja.kolor,
      opis: lokalizacja.opis || ''
    });
    setDialogOpen(true);
  };

  // 💾 Zapisywanie lokalizacji
  const handleSave = async () => {
    try {
      if (!spizarniaId || !user?.uid) return;
      
      setFormLoading(true);
      setError(null);

      if (!formData.nazwa.trim()) {
        setError('Nazwa lokalizacji jest wymagana');
        return;
      }

      if (editingId) {
        // Edycja istniejącej lokalizacji
        await LokalizacjaService.updateLokalizacja(spizarniaId, user.uid, editingId, {
          nazwa: formData.nazwa.trim(),
          ikona: formData.ikona,
          kolor: formData.kolor,
          opis: formData.opis.trim() || undefined
        });

        // Zaktualizuj lokalny stan
        setLokalizacje(prev => prev.map(lok => 
          lok.id === editingId 
            ? { ...lok, nazwa: formData.nazwa.trim(), ikona: formData.ikona, kolor: formData.kolor, opis: formData.opis.trim() }
            : lok
        ));
      } else {
        // Dodanie nowej lokalizacji
        const nowaLokalizacja = await LokalizacjaService.addLokalizacja(spizarniaId, user.uid, {
          nazwa: formData.nazwa.trim(),
          ikona: formData.ikona,
          kolor: formData.kolor,
          opis: formData.opis.trim() || undefined
        });

        // Dodaj do lokalnego stanu
        setLokalizacje(prev => [...prev, nowaLokalizacja]);
        setStats(prev => ({ ...prev, [nowaLokalizacja.id]: 0 }));
      }

      setDialogOpen(false);

    } catch (err) {
      console.error('Błąd zapisywania lokalizacji:', err);
      setError(err instanceof Error ? err.message : 'Błąd zapisywania lokalizacji');
    } finally {
      setFormLoading(false);
    }
  };

  // 🗑️ Usuwanie lokalizacji
  const handleDelete = async (lokalizacjaId: string) => {
    try {
      if (!spizarniaId || !user?.uid) return;

      const produktyCount = stats[lokalizacjaId] || 0;
      if (produktyCount > 0) {
        setError(`Nie można usunąć lokalizacji. Zawiera ${produktyCount} produktów.`);
        return;
      }

      if (!window.confirm('Czy na pewno chcesz usunąć tę lokalizację?')) {
        return;
      }

      await LokalizacjaService.deleteLokalizacja(spizarniaId, user.uid, lokalizacjaId);

      // Usuń z lokalnego stanu
      setLokalizacje(prev => prev.filter(lok => lok.id !== lokalizacjaId));
      setStats(prev => {
        const newStats = { ...prev };
        delete newStats[lokalizacjaId];
        return newStats;
      });

    } catch (err) {
      console.error('Błąd usuwania lokalizacji:', err);
      setError(err instanceof Error ? err.message : 'Błąd usuwania lokalizacji');
    }
  };

  // 📝 Obsługa zmian w formularzu
  const handleInputChange = (field: keyof LokalizacjaFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Automatycznie ustaw kolor na podstawie ikony
    if (field === 'ikona') {
      const selectedIcon = availableIcons.find(icon => icon.value === value);
      if (selectedIcon) {
        setFormData(prev => ({ ...prev, kolor: selectedIcon.color }));
      }
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={appTheme}>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 3 }}>
          <Container sx={{ maxWidth: 'sm' }}>
            <LoadingState message="Ładowanie lokalizacji..." />
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
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 📱 Nagłówek */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleGoBack}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Zarządzaj lokalizacjami
            </Typography>
          </Toolbar>
        </AppBar>

        {/* 📝 Zawartość */}
        <Container sx={{ py: 3, flexGrow: 1, maxWidth: 'sm' }}>
          {/* Komunikat błędu */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Lista lokalizacji */}
          <Paper elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="primary" />
                Lokalizacje w spiżarni ({lokalizacje.length})
              </Typography>
            </Box>
            
            {lokalizacje.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Brak lokalizacji. Dodaj pierwszą lokalizację!
                </Typography>
              </Box>
            ) : (
              <List>
                {lokalizacje.map((lokalizacja, index) => (
                  <ListItem
                    key={lokalizacja.id}
                    sx={{ 
                      borderBottom: index < lokalizacje.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}
                  >
                    <Box sx={{ mr: 2, fontSize: '2rem' }}>
                      {lokalizacja.ikona}
                    </Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {lokalizacja.nazwa}
                          </Typography>
                          <Chip 
                            label={`${stats[lokalizacja.id] || 0} produktów`}
                            size="small"
                            color={stats[lokalizacja.id] > 0 ? 'primary' : 'default'}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={lokalizacja.opis}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleEdit(lokalizacja)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(lokalizacja.id)}
                        color="error"
                        disabled={stats[lokalizacja.id] > 0}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          {/* Przycisk dodawania */}
          <Fab
            color="primary"
            onClick={handleAddNew}
            sx={{
              position: 'fixed',
              bottom: { xs: 20, sm: 24 },
              right: { xs: 20, sm: 24 },
              width: { xs: 56, sm: 64 },
              height: { xs: 56, sm: 64 }
            }}
          >
            <Add sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
          </Fab>
        </Container>

        {/* 📝 Dialog formularza */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle>
            {editingId ? 'Edytuj lokalizację' : 'Dodaj nową lokalizację'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {/* Nazwa */}
              <TextField
                fullWidth
                label="Nazwa lokalizacji"
                value={formData.nazwa}
                onChange={handleInputChange('nazwa')}
                required
                margin="normal"
                placeholder="np. Lodówka, Zamrażarka, Szafka..."
              />

              {/* Ikona */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Ikona</InputLabel>
                <Select
                  value={formData.ikona}
                  label="Ikona"
                  onChange={handleInputChange('ikona')}
                >
                  {availableIcons.map((icon) => (
                    <MenuItem key={icon.value} value={icon.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography sx={{ fontSize: '1.5rem' }}>{icon.value}</Typography>
                        <Typography>{icon.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Opis */}
              <TextField
                fullWidth
                label="Opis (opcjonalnie)"
                value={formData.opis}
                onChange={handleInputChange('opis')}
                margin="normal"
                multiline
                rows={2}
                placeholder="Krótki opis lokalizacji..."
              />

              {/* Podgląd */}
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                border: '2px dashed #e5e7eb',
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Podgląd:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '2rem' }}>{formData.ikona}</Typography>
                  <Typography variant="h6">{formData.nazwa || 'Nazwa lokalizacji'}</Typography>
                </Box>
                {formData.opis && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {formData.opis}
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setDialogOpen(false)}
              variant="outlined"
              startIcon={<Cancel />}
              disabled={formLoading}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              startIcon={<Save />}
              disabled={formLoading || !formData.nazwa.trim()}
            >
              {formLoading ? 'Zapisywanie...' : 'Zapisz'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default ManageLokalizacjePage;

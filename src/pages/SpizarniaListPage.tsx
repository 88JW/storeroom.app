import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Fab,
  Alert
} from '@mui/material';
import {
  Add,
  Kitchen
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { SpizarniaService } from '../services/SpizarniaService';
import type { SpizarniaMetadata, UserSpizarnia } from '../types';
import { appTheme } from '../theme/appTheme';
import { AppBottomNavigation } from '../components/common/AppBottomNavigation';
import { SpizarniaCard } from '../components/spizarnia/SpizarniaCard';
import { LoadingState } from '../components/common/LoadingState';

type SpizarniaWithMetadata = {
  id: string;
  data: UserSpizarnia;
  metadata: SpizarniaMetadata;
};

const SpizarniaListPage: React.FC = () => {
  const [spiżarnie, setSpiżarnie] = useState<SpizarniaWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 📱 Pobieranie spiżarni użytkownika
  useEffect(() => {
    const loadUserSpiżarnie = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Pobrać UID z Firebase Auth
        const userId = 'Gh2ywl1BIAhib9yxK2XOox0WUBL2'; // Tymczasowo hardcoded
        
        const userSpiżarnie = await SpizarniaService.getUserSpiżarnie(userId);
        setSpiżarnie(userSpiżarnie);

      } catch (err) {
        console.error('Błąd ładowania spiżarni:', err);
        setError('Błąd podczas ładowania spiżarni');
      } finally {
        setLoading(false);
      }
    };

    loadUserSpiżarnie();
  }, [navigate]);

  //  Tworzenie nowej spiżarni
  const handleCreateSpiżarnia = () => {
    navigate('/nowa-spizarnia');
  };

  // �️ Obsługa usuwania spiżarni
  const handleDeleteSpizarnia = async (spizarniaId: string) => {
    try {
      // TODO: Pobrać UID z Firebase Auth
      const userId = 'Gh2ywl1BIAhib9yxK2XOox0WUBL2';
      
      await SpizarniaService.deleteSpizarnia(spizarniaId, userId);
      
      // Usuń z lokalnego state
      setSpiżarnie(prev => prev.filter(s => s.id !== spizarniaId));
      
    } catch (error) {
      console.error('Błąd usuwania spiżarni:', error);
      setError('Błąd podczas usuwania spiżarni');
    }
  };

  // 🔗 Przejście do wybranej spiżarni
  const handleSpizarniaSelect = (spizarniaId: string) => {
    navigate(`/lista?spizarnia=${spizarniaId}`);
  };

  const handleEditSpizarnia = (spizarniaId: string) => {
    navigate(`/edytuj-spizarnia/${spizarniaId}`);
  };

  const handleShareSpizarnia = (spizarniaId: string) => {
    navigate(`/udostepnij-spizarnia/${spizarniaId}`);
  };

  if (loading) {
    return (
      <ThemeProvider theme={appTheme}>
        <Box 
          sx={{ 
            minHeight: '100vh',
            bgcolor: 'background.default',
            pt: 3
          }}
        >
          <Container sx={{ maxWidth: 'sm' }}>
            <LoadingState message="Ładowanie spiżarni..." />
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={appTheme}>
      <Box 
        sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          pt: 3
        }}
      >
        <Container sx={{ maxWidth: 'sm', pb: 8 }}>
          <Typography variant="h1" sx={{ mb: 4 }}>
            Twoje spiżarnie
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {spiżarnie.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: { xs: 6, sm: 8 },
              px: 2,
              maxWidth: '300px',
              mx: 'auto'
            }}>
              <Box sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 3,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Kitchen sx={{ fontSize: '3rem', color: 'white' }} />
              </Box>
              <Typography variant="h1" sx={{ mb: 2, fontSize: '1.5rem' }}>
                Brak spiżarni
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                Stwórz swoją pierwszą spiżarnię aby rozpocząć zarządzanie produktami
              </Typography>
              <Button
                variant="contained"
                onClick={handleCreateSpiżarnia}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  borderRadius: '12px'
                }}
              >
                Stwórz spiżarnię
              </Button>
            </Box>
          ) : (
            <>
              {/* Lista spiżarni */}
              <Box sx={{ mb: 4 }}>
                {spiżarnie.map((spizarnia) => (
                  <SpizarniaCard
                    key={spizarnia.id}
                    id={spizarnia.id}
                    nazwa={spizarnia.metadata.nazwa}
                    description={`${spizarnia.metadata.opis || 'Brak opisu'} • Rola: ${spizarnia.data.role}`}
                    isOwner={spizarnia.data.role === 'owner'}
                    onEdit={handleEditSpizarnia}
                    onShare={handleShareSpizarnia}
                    onDelete={handleDeleteSpizarnia}
                    onClick={handleSpizarniaSelect}
                  />
                ))}
              </Box>
            </>
          )}
        </Container>

        {/* ➕ Floating Action Button */}
        {spiżarnie.length > 0 && (
          <Fab
            color="primary"
            onClick={handleCreateSpiżarnia}
            sx={{
              position: 'fixed',
              bottom: { xs: 80, sm: 84 }, // Wyżej nad bottom navigation
              right: { xs: 20, sm: 24 },
              width: { xs: 56, sm: 64 },
              height: { xs: 56, sm: 64 },
            }}
          >
            <Add sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
          </Fab>
        )}

        {/* 📱 Bottom Navigation */}
        <AppBottomNavigation />
      </Box>
    </ThemeProvider>
  );
};

export default SpizarniaListPage;

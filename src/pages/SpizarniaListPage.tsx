import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Fab,
  Alert,
  CircularProgress,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add,
  Kitchen,
  Home,
  Work,
  Group,
  List,
  Settings,
  MoreVert,
  Delete
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { SpizarniaService } from '../services/SpizarniaService';
import type { SpizarniaMetadata, UserSpizarnia } from '../types';

// 🎨 Prosty motyw Material UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1993e5',
    },
    background: {
      default: '#f5f5f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#111418',
      secondary: '#8e8e93',
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'SF Pro Display', system-ui, sans-serif",
    h1: {
      fontWeight: 800,
      fontSize: '2rem',
      color: '#111418',
      textAlign: 'center',
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
      color: '#111418',
      lineHeight: 1.3,
    },
    body1: {
      fontSize: '1rem',
      color: '#8e8e93',
      textAlign: 'center',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.9rem',
      color: '#8e8e93',
      lineHeight: 1.4,
    },
    caption: {
      fontSize: '0.8rem',
      color: '#8e8e93',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          marginBottom: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontWeight: 600,
          textTransform: 'none',
          height: '56px',
          fontSize: '1rem',
          boxShadow: 'none',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1993e5 0%, #1976d2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            boxShadow: '0 4px 16px rgba(25, 147, 229, 0.3)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(25, 147, 229, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 24px rgba(25, 147, 229, 0.4)',
          },
        },
      },
    },
  },
});

type SpizarniaWithMetadata = {
  id: string;
  data: UserSpizarnia;
  metadata: SpizarniaMetadata;
};

const SpizarniaListPage: React.FC = () => {
  const [spiżarnie, setSpiżarnie] = useState<SpizarniaWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [spizarniaToDelete, setSpizarniaToDelete] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedSpizarniaId, setSelectedSpizarniaId] = useState<string | null>(null);
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

  // 🎨 Ikona dla typu spiżarni
  const getSpizarniaIcon = (nazwa: string) => {
    const nazwaLower = nazwa.toLowerCase();
    if (nazwaLower.includes('dom') || nazwaLower.includes('rodzin')) 
      return <Home sx={{ fontSize: '1.8rem', color: '#4caf50' }} />;
    if (nazwaLower.includes('prac') || nazwaLower.includes('biur')) 
      return <Work sx={{ fontSize: '1.8rem', color: '#ff9800' }} />;
    if (nazwaLower.includes('współ') || nazwaLower.includes('grupa')) 
      return <Group sx={{ fontSize: '1.8rem', color: '#9c27b0' }} />;
    return <Kitchen sx={{ fontSize: '1.8rem', color: '#1993e5' }} />;
  };

  // 🎨 Gradient background dla avatara
  const getAvatarStyle = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ];
    return {
      background: gradients[index % gradients.length],
      width: 56, 
      height: 56,
    };
  };

  // 🔗 Przejście do wybranej spiżarni
  const handleSpizarniaSelect = (spizarniaId: string) => {
    navigate(`/lista?spizarnia=${spizarniaId}`);
  };

  // 🏠 Tworzenie nowej spiżarni
  const handleCreateSpiżarnia = () => {
    navigate('/nowa-spizarnia');
  };

  // 📱 Obsługa menu opcji
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, spizarniaId: string) => {
    event.stopPropagation(); // Nie przechodzi do spiżarni
    setMenuAnchor(event.currentTarget);
    setSelectedSpizarniaId(spizarniaId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedSpizarniaId(null);
  };

  // 🗑️ Obsługa usuwania spiżarni
  const handleDeleteClick = () => {
    if (selectedSpizarniaId) {
      setSpizarniaToDelete(selectedSpizarniaId);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!spizarniaToDelete) return;

    try {
      // TODO: Pobrać UID z Firebase Auth
      const userId = 'Gh2ywl1BIAhib9yxK2XOox0WUBL2';
      
      await SpizarniaService.deleteSpizarnia(spizarniaToDelete, userId);
      
      // Usuń z lokalnego state
      setSpiżarnie(prev => prev.filter(s => s.id !== spizarniaToDelete));
      
      setDeleteDialogOpen(false);
      setSpizarniaToDelete(null);
      
    } catch (error) {
      console.error('Błąd usuwania spiżarni:', error);
      setError('Błąd podczas usuwania spiżarni');
      setDeleteDialogOpen(false);
      setSpizarniaToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSpizarniaToDelete(null);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box 
          sx={{ 
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default'
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1">
              Ładowanie spiżarni...
            </Typography>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
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
              {/*  Lista spiżarni */}
              <Box sx={{ mb: 4 }}>
                {spiżarnie.map((spizarnia, index) => (
                  <Card 
                    key={spizarnia.id}
                    onClick={() => handleSpizarniaSelect(spizarnia.id)}
                  >
                    <CardContent sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2.5, 
                      py: 2.5,
                      px: 2.5,
                      minHeight: '84px'
                    }}>
                      {/* 🎨 Avatar spiżarni z gradientem */}
                      <Avatar
                        sx={getAvatarStyle(index)}
                      >
                        {getSpizarniaIcon(spizarnia.metadata.nazwa)}
                      </Avatar>

                      {/* 📝 Informacje */}
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: 'text.primary',
                            mb: 0.5 
                          }}
                        >
                          {spizarnia.metadata.nazwa}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ color: 'text.secondary', mb: 1 }}
                        >
                          {spizarnia.metadata.opis || 'Brak opisu'}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            textTransform: 'capitalize'
                          }}
                        >
                          Twoja rola: {spizarnia.data.role}
                        </Typography>
                      </Box>

                      {/* 🔧 Menu opcji dla właścicieli lub wskaźnik dla pozostałych */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {spizarnia.data.role === 'owner' ? (
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, spizarnia.id)}
                            sx={{ 
                              color: 'text.secondary',
                              '&:hover': { color: 'primary.main' }
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        ) : (
                          <Box sx={{ 
                            color: 'text.secondary',
                            fontSize: '1.2rem',
                            transition: 'transform 0.2s ease',
                            '.MuiCard-root:hover &': {
                              transform: 'translateX(4px)',
                            }
                          }}>
                            →
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
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

        {/* 📱 Menu opcji spiżarni */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleDeleteClick}>
            <Delete sx={{ mr: 1, color: 'error.main' }} />
            <Typography color="error.main">Usuń spiżarnię</Typography>
          </MenuItem>
        </Menu>

        {/* 🗑️ Dialog potwierdzenia usunięcia */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">
            Usuń spiżarnię
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Czy na pewno chcesz usunąć spiżarnię <strong>"{spiżarnie.find(s => s.id === spizarniaToDelete)?.metadata.nazwa}"</strong>? 
              <br /><br />
              Ta akcja jest nieodwracalna i usunie wszystkie produkty oraz członków.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Anuluj
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              autoFocus
            >
              Usuń
            </Button>
          </DialogActions>
        </Dialog>

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
              label="Spiżarnie" 
              icon={<Home />} 
              sx={{ color: '#1993e5' }}
            />
            <BottomNavigationAction 
              label="Dodaj" 
              icon={<Add />} 
              onClick={() => navigate('/dodaj-produkt')}
            />
            <BottomNavigationAction 
              label="Lista" 
              icon={<List />} 
              onClick={() => navigate('/lista')}
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

export default SpizarniaListPage;

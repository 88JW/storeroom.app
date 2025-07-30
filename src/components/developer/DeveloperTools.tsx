import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  BugReport as BugReportIcon,
  Science as ScienceIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Storage as StorageIcon,
  Restore as RestoreIcon,
  CameraAlt as CameraIcon,
  QrCodeScanner as QrIcon,
  CleaningServices as CleanIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { TestDataService } from '../../services/TestDataService';
import { SpizarniaService } from '../../services/SpizarniaService';
import DatabaseInitializer from '../../services/DatabaseInitializer';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

const DeveloperTools: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Stan dla funkcji testowych
  const [testLoading, setTestLoading] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/welcome');
    } catch (error) {
      console.error('Błąd wylogowania:', error);
    }
  };

  // Funkcja dodawania testowych produktów z alertami
  const handleAddTestData = async () => {
    if (!user?.uid) return;

    const confirmed = window.confirm(
      '🧪 Dodawanie testowych produktów\n\n' +
      'Ta operacja doda 9 testowych produktów z różnymi datami wygaśnięcia:\n' +
      '• 3 przeterminowane\n' +
      '• 3 wygasające w 0-2 dni\n' +
      '• 3 wygasające w 3-7 dni\n\n' +
      'Czy chcesz kontynuować?'
    );

    if (!confirmed) return;

    try {
      setTestLoading(true);
      setTestError(null);
      setTestMessage(null);

      const spiżarnie = await SpizarniaService.getUserSpiżarnie(user.uid);
      
      if (spiżarnie.length === 0) {
        setTestError('Nie masz żadnej spiżarni. Utwórz najpierw spiżarnię.');
        return;
      }

      const firstSpizarnia = spiżarnie[0];
      const result = await TestDataService.createTestExpiryProducts(firstSpizarnia.id, user.uid);
      
      setTestMessage(`✅ Dodano ${result.total} testowych produktów! (${result.expired} przeterminowanych, ${result.expiring} wygasających, ${result.soonExpiring} niedługo wygasających)`);
      
    } catch (error) {
      console.error('Błąd dodawania testowych danych:', error);
      setTestError('Nie udało się dodać testowych produktów');
    } finally {
      setTestLoading(false);
    }
  };

  // Funkcja usuwania testowych produktów
  const handleClearTestData = async () => {
    if (!user?.uid) return;

    const confirmed = window.confirm(
      '🗑️ Usuwanie testowych produktów\n\n' +
      'Ta operacja usunie wszystkie testowe produkty z alertami wygaśnięcia.\n\n' +
      'Czy na pewno chcesz kontynuować?'
    );

    if (!confirmed) return;

    try {
      setTestLoading(true);
      setTestError(null);
      setTestMessage(null);

      const spiżarnie = await SpizarniaService.getUserSpiżarnie(user.uid);
      
      if (spiżarnie.length === 0) {
        setTestError('Nie masz żadnej spiżarni.');
        return;
      }

      const firstSpizarnia = spiżarnie[0];
      const deletedCount = await TestDataService.clearTestData(firstSpizarnia.id, user.uid);
      
      setTestMessage(`🗑️ Usunięto ${deletedCount} testowych produktów!`);
      
    } catch (error) {
      console.error('Błąd usuwania testowych danych:', error);
      setTestError('Nie udało się usunąć testowych produktów');
    } finally {
      setTestLoading(false);
    }
  };

  // Funkcja czyszczenia całej bazy danych użytkownika
  const handleClearDatabase = async () => {
    if (!user?.uid) return;

    const confirmed = window.confirm(
      '⚠️ UWAGA!\n\nTa operacja usunie WSZYSTKIE dane użytkownika:\n' +
      '• Wszystkie spiżarnie\n' +
      '• Wszystkie produkty\n' +
      '• Profil użytkownika\n\n' +
      'Czy na pewno chcesz kontynuować?'
    );

    if (!confirmed) return;

    try {
      setTestLoading(true);
      setTestError(null);
      setTestMessage(null);

      await DatabaseInitializer.clearUserDatabase(user.uid);
      
      setTestMessage('🧹 Baza danych została całkowicie wyczyszczona! Zostaniesz wylogowany.');
      
      // Wyloguj użytkownika po 3 sekundach
      setTimeout(() => {
        handleLogout();
      }, 3000);
      
    } catch (error) {
      console.error('Błąd czyszczenia bazy danych:', error);
      setTestError('Nie udało się wyczyścić bazy danych');
    } finally {
      setTestLoading(false);
    }
  };

  // Funkcja reinicjalizacji bazy danych z przykładowymi produktami
  const handleReinitializeDatabase = async () => {
    if (!user?.uid || !user.email) return;

    const confirmed = window.confirm(
      '🔄 Reinicjalizacja bazy danych\n\n' +
      'Ta operacja:\n' +
      '• Wyczyści wszystkie obecne dane\n' +
      '• Utworzy nową spiżarnię\n' +
      '• Doda przykładowe produkty\n\n' +
      'Czy chcesz kontynuować?'
    );

    if (!confirmed) return;

    try {
      setTestLoading(true);
      setTestError(null);
      setTestMessage(null);

      // Wyczyść obecne dane
      await DatabaseInitializer.clearUserDatabase(user.uid);
      
      // Reinicjalizuj z przykładowymi produktami
      await DatabaseInitializer.initializeUserDatabase(
        user.uid, 
        user.email, 
        user.displayName || 'Użytkownik'
      );
      
      setTestMessage('🎉 Baza danych została zresetowana z przykładowymi produktami!');
      
    } catch (error) {
      console.error('Błąd reinicjalizacji bazy danych:', error);
      setTestError('Nie udało się zresetować bazy danych');
    } finally {
      setTestLoading(false);
    }
  };

  // Funkcja testowa skanera kodów
  const handleTestBarcode = () => {
    const testCodes = [
      { name: 'Chusteczki kosmetyczne', code: '4305615418636', source: 'OpenBeautyFacts' },
      { name: 'CeraVe krem', code: '3337875598996', source: 'OpenBeautyFacts' },
      { name: 'Środek czyszczący', code: '8697713836068', source: 'OpenProductsFacts' },
      { name: 'Nutella', code: '3017620425035', source: 'OpenFoodFacts' }
    ];
    
    const choice = prompt(
      'Wybierz kod testowy:\\n' +
      testCodes.map((item, index) => 
        `${index + 1}. ${item.name} (${item.code}) - ${item.source}`
      ).join('\\n') +
      '\\n\\nWpisz numer (1-4):'
    );
    
    const choiceNum = parseInt(choice || '');
    if (choiceNum >= 1 && choiceNum <= testCodes.length) {
      const selectedCode = testCodes[choiceNum - 1];
      setTestMessage(`📱 Kod testowy: ${selectedCode.name} (${selectedCode.code})`);
      
      // Przejdź do strony dodawania produktu z kodem
      navigate('/dodaj-produkt', { 
        state: { 
          testBarcode: selectedCode.code 
        } 
      });
    }
  };

  // Test kamery
  const handleTestCamera = async () => {
    try {
      setTestMessage('📷 Testowanie dostępu do kamery...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      console.log('Camera test successful:', stream);
      stream.getTracks().forEach(track => track.stop());
      
      setTestMessage('✅ Kamera działa poprawnie!');
      
    } catch (err) {
      console.error('Camera test failed:', err);
      setTestError(`❌ Błąd kamery: ${err instanceof Error ? err.message : 'Nieznany błąd'}`);
    }
  };

  return (
    <Accordion sx={{ mb: 3 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="developer-tools-content"
        id="developer-tools-header"
        sx={{ 
          bgcolor: 'warning.light',
          '&.Mui-expanded': {
            bgcolor: 'warning.main'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BugReportIcon sx={{ mr: 1, color: 'warning.dark' }} />
          <Typography variant="h6" color="warning.dark" fontWeight="bold">
            Narzędzia deweloperskie
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {testMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setTestMessage(null)}>
            {testMessage}
          </Alert>
        )}
        
        {testError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setTestError(null)}>
            {testError}
          </Alert>
        )}
        
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <ScienceIcon sx={{ mr: 1 }} />
          Funkcje testowe alertów
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={testLoading ? <CircularProgress size={16} /> : <ScienceIcon />}
            onClick={handleAddTestData}
            disabled={testLoading}
            color="warning"
          >
            Dodaj testowe produkty z alertami
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={testLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
            onClick={handleClearTestData}
            disabled={testLoading}
            color="error"
          >
            Usuń testowe produkty
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <QrIcon sx={{ mr: 1 }} />
          Testy skanera kodów
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<QrIcon />}
            onClick={handleTestBarcode}
            color="info"
          >
            🧪 Wybierz kod testowy
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<CameraIcon />}
            onClick={handleTestCamera}
            color="info"
          >
            📱 Test aparatu i skanera
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<CameraIcon />}
            onClick={() => navigate('/demo-rozpoznawanie')}
            color="secondary"
            sx={{ borderColor: 'secondary.main' }}
          >
            📸 Demo rozpoznawania obrazów
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <StorageIcon sx={{ mr: 1 }} />
          Zarządzanie bazą danych
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={testLoading ? <CircularProgress size={16} /> : <RestoreIcon />}
            onClick={handleReinitializeDatabase}
            disabled={testLoading}
            color="warning"
          >
            🔄 Reset bazy z przykładowymi produktami
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={testLoading ? <CircularProgress size={16} /> : <CleanIcon />}
            onClick={handleClearDatabase}
            disabled={testLoading}
            color="error"
          >
            🧹 Wyczyść całą bazę danych
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          ⚠️ Funkcje zarządzania bazą danych są nieodwracalne!
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
};

export default DeveloperTools;

// 📱 Komponent skanera kodów kreskowych z użyciem ZXing - wersja zoptymalizowana

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Typography, 
  Alert,
  CircularProgress 
} from '@mui/material';
import { CameraAlt, Close } from '@mui/icons-material';
import styles from './BarcodeScanner.module.css';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  open,
  onClose,
  onScan
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeReader] = useState(() => {
    const reader = new BrowserMultiFormatReader();
    console.log('BarcodeScanner: Tworzenie nowego reader-a');
    reader.timeBetweenDecodingAttempts = 100; // Szybsze próby
    return reader;
  });
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  // ⏹️ Zatrzymanie skanera
  const stopScanning = useCallback(() => {
    try {
      console.log('BarcodeScanner: Zatrzymywanie skanera...');
      
      // Zatrzymaj ZXing
      codeReader.reset();
      
      // Zatrzymaj stream kamery
      if (streamRef.current) {
        console.log('BarcodeScanner: Zatrzymywanie stream kamery');
        streamRef.current.getTracks().forEach(track => {
          console.log('BarcodeScanner: Zatrzymywanie track:', track.label);
          track.stop();
        });
        streamRef.current = null;
      }

      // Wyczyść video element
      if (videoRef.current) {
        console.log('BarcodeScanner: Czyszczenie video element');
        videoRef.current.srcObject = null;
      }

      setIsScanning(false);
      console.log('✅ BarcodeScanner: Skaner zatrzymany');
    } catch (error) {
      console.error('❌ BarcodeScanner: Błąd podczas zatrzymywania:', error);
    }
  }, [codeReader]);

  // 🔄 Reset skanera
  const resetScanner = useCallback(() => {
    stopScanning();
    setLastScannedCode(null);
    setError(null);
    setIsScanning(false);
  }, [stopScanning]);

  // 🎥 Uruchomienie skanera
  const startScanning = useCallback(async () => {
    if (!videoRef.current) {
      console.error('BarcodeScanner: videoRef.current jest null');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      console.log('BarcodeScanner: Rozpoczynanie skanowania...');

      // Sprawdź czy navigator.mediaDevices jest dostępne
      if (!navigator.mediaDevices) {
        throw new Error('Twoja przeglądarka nie obsługuje dostępu do kamery. Spróbuj w Chrome lub Firefox.');
      }

      // Próbuj uzyskać dostęp do kamery z prostymi ustawieniami
      let stream: MediaStream;
      
      try {
        // Najpierw spróbuj z tylną kamerą
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
        console.log('BarcodeScanner: Otrzymano stream z tylną kamerą');
      } catch (error) {
        console.log('BarcodeScanner: Błąd z tylną kamerą, próbuję z przednią:', error);
        
        try {
          // Spróbuj z przednią kamerą
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 }
            }
          });
          console.log('BarcodeScanner: Otrzymano stream z przednią kamerą');
        } catch (error2) {
          console.log('BarcodeScanner: Błąd z przednią kamerą, próbuję podstawowe ustawienia:', error2);
          
          // Ostatnia szansa - najbardziej podstawowe ustawienia
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          console.log('BarcodeScanner: Otrzymano stream z podstawowymi ustawieniami');
        }
      }

      // Ustaw stream na video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Poczekaj na załadowanie video
        await new Promise<void>((resolve) => {
          if (!videoRef.current) {
            resolve();
            return;
          }
          
          videoRef.current.onloadedmetadata = () => {
            console.log('BarcodeScanner: Video metadata załadowane');
            resolve();
          };
          
          // Timeout dla bezpieczeństwa
          setTimeout(resolve, 2000);
        });
      }

      // Uruchom ZXing skanowanie
      console.log('BarcodeScanner: Uruchamianie ZXing decoder...');
      await codeReader.decodeFromStream(
        stream,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const barcode = result.getText();
            console.log('🎉 BarcodeScanner: ZESKANOWANO KOD:', barcode);
            
            // Sprawdź czy to nie jest ten sam kod co poprzednio
            if (barcode !== lastScannedCode) {
              console.log('✅ BarcodeScanner: Nowy kod - wywoływanie onScan');
              setLastScannedCode(barcode);
              onScan(barcode);
              stopScanning();
            }
          }
          
          // Ignoruj NotFoundException - to normalne podczas skanowania
          if (error && !(error instanceof NotFoundException)) {
            console.error('❌ BarcodeScanner: Błąd skanowania:', error);
          }
        }
      );
      
      console.log('BarcodeScanner: Skanowanie zostało uruchomione pomyślnie');

    } catch (err) {
      console.error('BarcodeScanner: Błąd uruchamiania kamery:', err);
      setError(
        err instanceof Error 
          ? `Błąd kamery: ${err.message}` 
          : 'Nie można uruchomić kamery. Sprawdź uprawnienia w przeglądarce.'
      );
      setIsScanning(false);
    }
  }, [codeReader, onScan, stopScanning, lastScannedCode]);

  // 🔄 Efekt dla dialogu
  useEffect(() => {
    if (open) {
      resetScanner();
      // Małe opóźnienie żeby dialog się w pełni otworzył
      const timer = setTimeout(() => {
        startScanning();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopScanning();
    }
  }, [open, startScanning, resetScanner, stopScanning]);

  // 🧹 Cleanup przy unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  // 🚪 Obsługa zamknięcia
  const handleClose = useCallback(() => {
    stopScanning();
    onClose();
  }, [stopScanning, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          minHeight: '500px'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <CameraAlt sx={{ mr: 1, color: 'primary.main' }} />
        Skanuj kod kreskowy
      </DialogTitle>

      <DialogContent sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 2,
        pb: 2
      }}>
        
        {/* 📹 Video element dla kamery */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '400px',
            height: '300px',
            bgcolor: '#000',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <video
            ref={videoRef}
            className={styles.videoElement}
            playsInline
            muted
          />
          
          {/* Overlay z ramką skanowania */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '70%',
              height: '30%',
              border: '2px solid',
              borderColor: isScanning ? 'primary.main' : 'grey.500',
              borderRadius: 1,
              pointerEvents: 'none',
              animation: isScanning ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 }
              }
            }}
          />
        </Box>

        {/* Status i instrukcje */}
        <Box sx={{ textAlign: 'center' }}>
          {isScanning ? (
            <>
              <CircularProgress size={24} sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Skieruj kamerę na kod kreskowy
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Trzymaj telefon stabilnie, kod powinien być dobrze oświetlony
              </Typography>
            </>
          ) : error ? (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Uruchamianie kamery...
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexDirection: 'column' }}>
        {/* Manual input button */}
        <Button
          onClick={() => {
            const manualCode = prompt('Wprowadź kod kreskowy ręcznie:');
            if (manualCode && manualCode.trim()) {
              console.log('BarcodeScanner: Ręczne wprowadzenie kodu:', manualCode.trim());
              onScan(manualCode.trim());
            }
          }}
          variant="contained"
          color="primary"
          size="small"
        >
          ✏️ Wprowadź kod ręcznie
        </Button>
        
        {/* Test buttons with known codes */}
        <Button
          onClick={() => {
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
              console.log(`BarcodeScanner: Test ${selectedCode.name}:`, selectedCode.code);
              onScan(selectedCode.code);
            }
          }}
          variant="contained"
          color="secondary"
          size="small"
        >
          🧪 Wybierz kod testowy
        </Button>

        {/* Camera test button */}
        <Button
          onClick={async () => {
            try {
              console.log('BarcodeScanner: Test kamery...');
              const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                  facingMode: 'environment',
                  width: { ideal: 640 },
                  height: { ideal: 480 }
                } 
              });
              console.log('BarcodeScanner: Kamera działa!', stream);
              stream.getTracks().forEach(track => track.stop());
              alert('✅ Kamera działa poprawnie!');
            } catch (err) {
              console.error('BarcodeScanner: Błąd dostępu do kamery:', err);
              alert(`❌ Błąd kamery: ${err instanceof Error ? err.message : 'Nieznany błąd'}`);
            }
          }}
          variant="outlined"
          color="info"
          size="small"
        >
          📷 Test kamery
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <Button
            onClick={() => {
              console.log('BarcodeScanner: Resetowanie skanera');
              stopScanning();
              startScanning();
            }}
            variant="outlined"
            color="primary"
            size="small"
            sx={{ flex: 1 }}
          >
            🔄 Reset
          </Button>
          
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            size="small"
            sx={{ flex: 1 }}
          >
            <Close sx={{ mr: 1 }} />
            Zamknij
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

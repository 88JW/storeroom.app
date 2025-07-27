// 📱 Komponent skanera kodów kreskowych z użyciem ZXing

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
    
    // Ustaw parametry skanowania dla lepszego rozpoznawania
    reader.timeBetweenDecodingAttempts = 300; // Wolniejsze ale stabilniejsze skanowanie
    
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
        videoRef.current.pause();
      }
      
      setIsScanning(false);
      setError(null);
      console.log('✅ BarcodeScanner: Skaner zatrzymany');
    } catch (err) {
      console.error('❌ BarcodeScanner: Błąd zatrzymywania skanera:', err);
    }
  }, [codeReader]);

  // 🔄 Reset skanera
  const resetScanner = useCallback(() => {
    setLastScannedCode(null);
    setError(null);
    setIsScanning(false);
  }, []);

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
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('Twoja przeglądarka nie obsługuje dostępu do kamery. Spróbuj w Chrome lub Firefox.');
      }

      // Sprawdź dostępność kamery
      console.log('BarcodeScanner: Sprawdzanie dostępnych urządzeń...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('BarcodeScanner: Znalezione urządzenia:', devices);
      
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('BarcodeScanner: Kamery:', videoDevices);

      if (videoDevices.length === 0) {
        throw new Error('Nie znaleziono kamery w urządzeniu. Upewnij się, że kamera jest podłączona i dostępna.');
      }

      // Preferuj tylną kamerę (głównie dla telefonów)
      const preferredDevice = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      ) || videoDevices[0];

      console.log('BarcodeScanner: Wybrana kamera:', preferredDevice.label || preferredDevice.deviceId);

      // Najpierw spróbuj z lepszymi ustawieniami kamery
      console.log('BarcodeScanner: Próba uruchomienia z getUserMedia dla lepszej jakości');
      
      // Pobierz stream z wysoką jakością
      const constraints = {
        video: {
          deviceId: preferredDevice.deviceId ? { exact: preferredDevice.deviceId } : undefined,
          facingMode: { ideal: 'environment' }, // Tylna kamera
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          focusMode: { ideal: 'continuous' } // Autofocus
        }
      };
      
      console.log('BarcodeScanner: Constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('BarcodeScanner: Otrzymano stream:', stream);
      
      // Ustaw stream na video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Poczekaj na załadowanie video
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element nie istnieje'));
            return;
          }
          
          videoRef.current.onloadedmetadata = () => {
            console.log('BarcodeScanner: Video metadata załadowane');
            resolve();
          };
          
          videoRef.current.onerror = (err) => {
            console.error('BarcodeScanner: Błąd video element:', err);
            reject(new Error('Błąd podczas ładowania video'));
          };
          
          // Timeout dla bezpieczeństwa
          setTimeout(() => {
            resolve(); // Kontynuuj nawet jeśli nie ma onloadedmetadata
          }, 2000);
        });
      }

      // Teraz użyj ZXing do skanowania
      console.log('BarcodeScanner: Uruchamianie ZXing decoder...');
      await codeReader.decodeFromStream(
        stream,
        videoRef.current!,
        (result, error) => {
          console.log('BarcodeScanner: Callback ZXing - result:', result, 'error:', error);
          
          if (result) {
            const barcode = result.getText();
            console.log('🎉 BarcodeScanner: ZESKANOWANO KOD:', barcode);
            console.log('BarcodeScanner: Format kodu:', result.getBarcodeFormat());
            console.log('BarcodeScanner: Ostatni kod:', lastScannedCode);
            
            // Sprawdź czy to nie jest ten sam kod co poprzednio
            if (barcode !== lastScannedCode) {
              console.log('✅ BarcodeScanner: Nowy kod - wywoływanie onScan');
              setLastScannedCode(barcode);
              onScan(barcode);
              stopScanning();
            } else {
              console.log('⚠️ BarcodeScanner: Ten sam kod - ignorowanie');
            }
          }
          
          if (error && !(error instanceof NotFoundException)) {
            console.error('❌ BarcodeScanner: Błąd skanowania (nie NotFoundException):', error);
            // Nie ustawiamy błędu dla problemów ze skanowaniem - to normalne
          }
          
          // Loguj co 10 prób dla debugowania
          if (error instanceof NotFoundException) {
            // Rzadsze logowanie
            if (Math.random() < 0.01) { // 1% szans na log
              console.log('🔍 BarcodeScanner: Szukanie kodu...');
            }
          }
        }
      );
      
      console.log('BarcodeScanner: decodeFromVideoDevice zostało uruchomione pomyślnie');

    } catch (err) {
      console.error('BarcodeScanner: Błąd uruchamiania kamery:', err);
      if (err instanceof Error) {
        console.error('BarcodeScanner: Szczegóły błędu:', err.message, err.stack);
      }
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
      // Reset stanu przy otwarciu
      resetScanner();
      // Małe opóźnienie żeby dialog się w pełni otworzył
      const timer = setTimeout(() => {
        startScanning();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopScanning();
    }
  }, [open, startScanning, stopScanning, resetScanner]);

  // 🧹 Cleanup przy unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  const handleClose = () => {
    stopScanning();
    onClose();
  };

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

        {/* Instrukcje i kontrolki */}
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

        {/* Instrukcja */}
        <Typography 
          variant="caption" 
          color="text.secondary" 
          textAlign="center"
          sx={{ maxWidth: '300px' }}
        >
          Trzymaj telefon stabilnie i upewnij się, że kod kreskowy jest dobrze oświetlony
        </Typography>
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
        
        {/* Test button */}
        <Button
          onClick={() => {
            console.log('BarcodeScanner: Test - symulacja skanowania');
            const testBarcode = '3017620425035'; // Nutella
            onScan(testBarcode);
          }}
          variant="contained"
          color="secondary"
          size="small"
        >
          🧪 Test Nutelli (3017620425035)
        </Button>

        {/* Camera test button */}
        <Button
          onClick={async () => {
            try {
              console.log('BarcodeScanner: Test kamery...');
              const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                  facingMode: 'environment',
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                } 
              });
              console.log('BarcodeScanner: Kamera działa!', stream);
              stream.getTracks().forEach(track => track.stop()); // Zatrzymaj test
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
              resetScanner();
              setTimeout(() => startScanning(), 500);
            }}
            variant="text"
            disabled={!isScanning}
          >
            Reset skanera
          </Button>
          <Button
            onClick={handleClose}
            variant="outlined"
            startIcon={<Close />}
          >
            Anuluj
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

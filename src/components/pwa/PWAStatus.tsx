// 📱 PWA Status Component - Wyświetla status i kontrolki PWA

import React from 'react';
import {
  Box,
  Button,
  Chip,
  Alert,
  Typography,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Download,
  WifiOff,
  Wifi,
  PhoneAndroid,
  Update,
  Close
} from '@mui/icons-material';
import { usePWA } from '../../hooks/usePWA';

interface PWAStatusProps {
  showDetails?: boolean;
  compact?: boolean;
  onClose?: () => void;
}

export const PWAStatus: React.FC<PWAStatusProps> = ({ 
  showDetails = false, 
  compact = false,
  onClose 
}) => {
  const {
    isOnline,
    isInstallable,
    isInstalled,
    isServiceWorkerReady,
    installApp,
    updateAvailable,
    updateApp
  } = usePWA();

  if (compact) {
    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {/* Status połączenia */}
        <Tooltip title={isOnline ? 'Online' : 'Offline'}>
          <Chip
            icon={isOnline ? <Wifi /> : <WifiOff />}
            label={isOnline ? 'Online' : 'Offline'}
            color={isOnline ? 'success' : 'warning'}
            size="small"
            variant="outlined"
          />
        </Tooltip>

        {/* Install button */}
        {isInstallable && (
          <Tooltip title="Zainstaluj aplikację">
            <IconButton
              onClick={installApp}
              color="primary"
              size="small"
            >
              <Download />
            </IconButton>
          </Tooltip>
        )}

        {/* Update button */}
        {updateAvailable && (
          <Tooltip title="Aktualizuj aplikację">
            <IconButton
              onClick={updateApp}
              color="secondary"
              size="small"
            >
              <Update />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 2, 
      border: 1, 
      borderColor: 'divider', 
      borderRadius: 2,
      position: 'relative'
    }}>
      {/* Close button */}
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
          size="small"
        >
          <Close />
        </IconButton>
      )}

      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PhoneAndroid color="primary" />
        Status PWA
      </Typography>

      <Stack spacing={2}>
        {/* Connection Status */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Połączenie:
          </Typography>
          <Chip
            icon={isOnline ? <Wifi /> : <WifiOff />}
            label={isOnline ? 'Online - pełna funkcjonalność' : 'Offline - tryb ograniczony'}
            color={isOnline ? 'success' : 'warning'}
            variant="outlined"
          />
        </Box>

        {/* Service Worker Status */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Service Worker:
          </Typography>
          <Chip
            label={isServiceWorkerReady ? 'Aktywny' : 'Nieaktywny'}
            color={isServiceWorkerReady ? 'success' : 'default'}
            variant="outlined"
          />
        </Box>

        {/* Installation Status */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Instalacja:
          </Typography>
          {isInstalled ? (
            <Chip
              icon={<PhoneAndroid />}
              label="Aplikacja zainstalowana"
              color="success"
              variant="outlined"
            />
          ) : isInstallable ? (
            <Stack spacing={1}>
              <Chip
                icon={<Download />}
                label="Gotowa do instalacji"
                color="info"
                variant="outlined"
              />
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={installApp}
                size="small"
              >
                Zainstaluj aplikację
              </Button>
            </Stack>
          ) : (
            <Chip
              label="Instalacja niedostępna"
              color="default"
              variant="outlined"
            />
          )}
        </Box>

        {/* Update Available */}
        {updateAvailable && (
          <Alert 
            severity="info" 
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<Update />}
                onClick={updateApp}
              >
                Aktualizuj
              </Button>
            }
          >
            Dostępna jest nowa wersja aplikacji!
          </Alert>
        )}

        {/* Offline Features */}
        {!isOnline && (
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Tryb offline:</strong><br />
              • Przeglądanie zapisanych produktów ✅<br />
              • Skanowanie kodów kreskowych ❌<br />
              • Dodawanie nowych produktów ❌<br />
              • Synchronizacja po powrocie online ✅
            </Typography>
          </Alert>
        )}

        {/* Details */}
        {showDetails && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Szczegóły techniczne:</strong><br />
              • SW Ready: {isServiceWorkerReady ? '✅' : '❌'}<br />
              • PWA Installed: {isInstalled ? '✅' : '❌'}<br />
              • Install Prompt: {isInstallable ? '✅' : '❌'}<br />
              • Update Available: {updateAvailable ? '✅' : '❌'}<br />
              • User Agent: {navigator.userAgent.substring(0, 50)}...
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

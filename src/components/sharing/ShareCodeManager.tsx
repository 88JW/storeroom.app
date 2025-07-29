// 🔗 Komponent do generowania kodów dostępu do spiżarni

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import ShareCodeService from '../../services/ShareCodeService';
import type { ShareCode } from '../../services/ShareCodeService';
import { useAuth } from '../../hooks/useAuth';

interface ShareCodeManagerProps {
  spizarniaId: string;
  spizarniaNazwa: string;
  onClose?: () => void;
  open?: boolean;
}

export const ShareCodeManager: React.FC<ShareCodeManagerProps> = ({
  spizarniaId,
  spizarniaNazwa,
  onClose,
  open = false
}) => {
  const { user } = useAuth();
  const [activeCode, setActiveCode] = useState<ShareCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 📥 Ładowanie aktywnego kodu
  const loadActiveCode = useCallback(async () => {
    if (!spizarniaId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const code = await ShareCodeService.getActiveCodeForSpizarnia(spizarniaId);
      setActiveCode(code);
      
    } catch (err) {
      console.error('Błąd ładowania kodu:', err);
      setError('Nie udało się załadować kodu dostępu');
    } finally {
      setLoading(false);
    }
  }, [spizarniaId]);

  // 🎲 Generowanie nowego kodu
  const handleGenerateCode = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const newCode = await ShareCodeService.createShareCode(spizarniaId, user.uid, 24);
      setActiveCode(newCode);
      setSuccess('✅ Kod dostępu został wygenerowany!');
      
    } catch (err) {
      console.error('Błąd generowania kodu:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Nie udało się wygenerować kodu');
      }
    } finally {
      setLoading(false);
    }
  };

  // 📋 Kopiowanie kodu do schowka
  const handleCopyCode = async () => {
    if (!activeCode) return;
    
    try {
      await navigator.clipboard.writeText(activeCode.code);
      setSuccess('📋 Kod skopiowany do schowka!');
      
      // Wyczyść komunikat po 3 sekundach
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Błąd kopiowania:', err);
      setError('Nie udało się skopiować kodu');
    }
  };

  // ❌ Dezaktywacja kodu
  const handleDeactivateCode = async () => {
    if (!activeCode || !user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await ShareCodeService.deactivateCode(activeCode.id, user.uid);
      setActiveCode(null);
      setSuccess('❌ Kod został dezaktywowany');
      
    } catch (err) {
      console.error('Błąd dezaktywacji kodu:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Nie udało się dezaktywować kodu');
      }
    } finally {
      setLoading(false);
    }
  };

  // 📅 Formatowanie czasu wygaśnięcia
  const formatExpiryTime = (expiresAt: Date | { toDate(): Date } | null): string => {
    if (!expiresAt) return 'Brak daty';
    
    const expiryDate = 'toDate' in expiresAt ? expiresAt.toDate() : expiresAt;
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffHours <= 0) {
      return 'Wygasł';
    } else if (diffHours === 1) {
      return '1 godzina';
    } else if (diffHours < 24) {
      return `${diffHours} godzin`;
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return diffDays === 1 ? '1 dzień' : `${diffDays} dni`;
    }
  };

  // 🔄 Efekt ładowania przy otwarciu
  useEffect(() => {
    if (open && spizarniaId) {
      loadActiveCode();
    }
  }, [open, spizarniaId, loadActiveCode]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShareIcon color="primary" />
            <Typography variant="h6">
              Udostępnij spiżarnię
            </Typography>
          </Box>
          {onClose && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {spizarniaNazwa}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* 🚨 Komunikaty */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* 📱 Instrukcje */}
        <Card sx={{ mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom>
              💡 Jak to działa?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              1. Wygeneruj 4-cyfrowy kod dostępu<br/>
              2. Przekaż kod drugiemu użytkownikowi<br/>
              3. Drugi użytkownik wpisuje kod w aplikacji<br/>
              4. Automatycznie otrzymuje dostęp do spiżarni
            </Typography>
          </CardContent>
        </Card>

        {/* 🔑 Aktywny kod lub generowanie */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : activeCode ? (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Aktywny kod dostępu:
                </Typography>
                <Typography 
                  variant="h3" 
                  fontWeight="bold" 
                  color="primary.main"
                  sx={{ 
                    letterSpacing: 4,
                    fontFamily: 'monospace',
                    mb: 1
                  }}
                >
                  {activeCode.code}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                  <Tooltip title="Skopiuj kod">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CopyIcon />}
                      onClick={handleCopyCode}
                    >
                      Kopiuj
                    </Button>
                  </Tooltip>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Wygasa za: 
                  </Typography>
                  <Chip 
                    label={formatExpiryTime(activeCode.expiresAt)}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                </Box>
                
                <Button
                  variant="text"
                  size="small"
                  color="error"
                  onClick={handleDeactivateCode}
                  disabled={loading}
                >
                  Dezaktywuj
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Brak aktywnego kodu dostępu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Wygeneruj nowy kod, który będzie ważny przez 24 godziny
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleGenerateCode}
              disabled={loading}
              size="large"
            >
              Generuj kod dostępu
            </Button>
          </Box>
        )}

        {/* ⚠️ Informacje o bezpieczeństwie */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Bezpieczeństwo:</strong> Kod jest ważny przez 24 godziny i może być użyty tylko raz. 
            Po użyciu kod zostanie automatycznie dezaktywowany.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Zamknij
        </Button>
        {activeCode && (
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleGenerateCode}
            disabled={loading}
          >
            Nowy kod
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ShareCodeManager;

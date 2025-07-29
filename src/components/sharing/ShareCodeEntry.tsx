import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  NumbersOutlined,
  GroupAddOutlined,
  CheckCircleOutlined
} from '@mui/icons-material';
import { ShareCodeService } from '../../services/ShareCodeService';
import { useAuth } from '../../hooks/useAuth';

interface ShareCodeEntryProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (spizarniaId: string, spizarniaNazwa: string) => void;
}

export const ShareCodeEntry: React.FC<ShareCodeEntryProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 🎯 Użycie kodu dostępu
  const handleUseCode = async () => {
    if (!user?.uid || !code.trim()) {
      setError('Proszę wprowadzić 4-cyfrowy kod');
      return;
    }

    const codeValue = code.trim();
    if (!/^\d{4}$/.test(codeValue)) {
      setError('Kod musi składać się z dokładnie 4 cyfr');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await ShareCodeService.redeemShareCode(codeValue, user.uid);
      
      if (result.success) {
        setSuccess(`Pomyślnie dołączyłeś do spiżarni "${result.spizarniaNazwa}"!`);
        setCode('');
        
        // Powiadomienie nadrzędnego komponentu
        if (onSuccess) {
          onSuccess(result.spizarniaId!, result.spizarniaNazwa!);
        }
        
        // Auto-zamknij po 2 sekundach
        setTimeout(() => {
          handleClose();
        }, 2000);
        
      } else {
        setError(result.error || 'Nie udało się dołączyć do spiżarni');
      }

    } catch (err) {
      console.error('Błąd użycia kodu:', err);
      setError('Wystąpił nieoczekiwany błąd');
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Reset stanu przy zamykaniu
  const handleClose = () => {
    setCode('');
    setError(null);
    setSuccess(null);
    setLoading(false);
    onClose();
  };

  // 📝 Obsługa zmiany kodu
  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(value);
    setError(null);
  };

  // ⌨️ Obsługa klawiatury
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && code.length === 4 && !loading) {
      handleUseCode();
    }
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
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
          <GroupAddOutlined color="primary" />
          <Typography variant="h6" component="span" fontWeight={600}>
            Dołącz do spiżarni
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Wprowadź 4-cyfrowy kod dostępu otrzymany od właściciela
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {/* 🎯 Pole wprowadzania kodu */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <TextField
            value={code}
            onChange={handleCodeChange}
            onKeyPress={handleKeyPress}
            placeholder="0000"
            variant="outlined"
            disabled={loading || !!success}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '2rem',
                fontWeight: 'bold',
                textAlign: 'center',
                letterSpacing: '0.5em',
                height: '80px',
                width: '200px',
                '& input': {
                  textAlign: 'center',
                  color: code.length === 4 ? 'primary.main' : 'text.primary'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <NumbersOutlined 
                  sx={{ 
                    mr: 1, 
                    color: code.length === 4 ? 'primary.main' : 'text.secondary' 
                  }} 
                />
              )
            }}
            helperText={`${code.length}/4 cyfr`}
          />
        </Box>

        {/* 💡 Wskazówki */}
        {!success && !error && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              💡 <strong>Wskazówka:</strong> Kod można znaleźć w ustawieniach udostępniania spiżarni
            </Typography>
          </Box>
        )}

        {/* ✅ Status powodzenia */}
        {success && (
          <Alert 
            severity="success" 
            icon={<CheckCircleOutlined />}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            <Typography variant="body2" fontWeight={600}>
              {success}
            </Typography>
          </Alert>
        )}

        {/* ❌ Komunikaty błędów */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
        )}

        {/* 📊 Status kodu */}
        <Box display="flex" justifyContent="center" gap={1} mb={2}>
          {[0, 1, 2, 3].map((index) => (
            <Chip
              key={index}
              label={code[index] || '_'}
              variant={code[index] ? 'filled' : 'outlined'}
              color={code[index] ? 'primary' : 'default'}
              sx={{
                width: 40,
                height: 40,
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            />
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={loading}
        >
          Anuluj
        </Button>

        <Button
          onClick={handleUseCode}
          variant="contained"
          disabled={code.length !== 4 || loading || !!success}
          startIcon={loading ? <CircularProgress size={16} /> : <GroupAddOutlined />}
          sx={{ minWidth: 140 }}
        >
          {loading ? 'Sprawdzam...' : success ? 'Dołączono!' : 'Dołącz'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

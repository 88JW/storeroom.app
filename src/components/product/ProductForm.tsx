import React, { useState } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
  Alert,
  Typography,
  IconButton
} from '@mui/material';
import { QrCodeScanner } from '@mui/icons-material';
import { KATEGORIE, JEDNOSTKI } from '../../types';
import { useSpizarniaLokalizacje } from '../../hooks/useSpizarniaLokalizacje';
import { BarcodeScanner } from '../barcode/BarcodeScanner';
import { BarcodeService } from '../../services/BarcodeService';

interface ProductFormData {
  nazwa: string;
  kategoria: string;
  ilość: number;
  jednostka: string;
  dataWażności: string;
  lokalizacja: string;
  opis: string;
  marka?: string;
}

interface ProductFormProps {
  formData: ProductFormData;
  error: string | null;
  onChange: (field: keyof ProductFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string | number } }) => void;
  onBarcodeData?: (data: Partial<ProductFormData>) => void;
  spizarniaNazwa?: string;
  spizarniaId?: string; // Dodane dla lokalizacji
}

export const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  error,
  onChange,
  onBarcodeData,
  spizarniaNazwa,
  spizarniaId
}) => {
  // 📍 Pobierz lokalizacje z spiżarni
  const { lokalizacje, loading: lokalizacjeLoading } = useSpizarniaLokalizacje(spizarniaId || null);
  
  // 📱 Stan skanera kodów kreskowych
  const [scannerOpen, setScannerOpen] = useState(false);

  // 📱 Obsługa danych ze skanera
  const handleBarcodeData = async (barcode: string) => {
    try {
      console.log('ProductForm: Otrzymano kod kreskowy:', barcode);
      
      // Pobierz dane produktu z nowego systemu wieloźródłowego
      console.log('ProductForm: Pobieranie danych z systemu wieloźródłowego...');
      const barcodeService = new BarcodeService();
      const productData = await barcodeService.getProductData(barcode);
      console.log('ProductForm: Otrzymane dane produktu:', productData);
      
      if (productData && productData.znaleziony && onBarcodeData) {
        // Mapuj dane na format formularza
        const formData: Partial<ProductFormData> = {
          nazwa: productData.nazwa,
          kategoria: productData.kategoria,
          marka: productData.marka
        };
        
        console.log('ProductForm: Wysyłanie rzeczywistych danych do rodzica:', formData);
        onBarcodeData(formData);
      } else {
        console.log('ProductForm: Brak danych produktu lub produkt nie znaleziony');
        // Jeśli nie znaleziono produktu, ustaw tylko kod jako nazwę z informacją
        if (onBarcodeData) {
          onBarcodeData({ 
            nazwa: `Nieznany produkt (${barcode})`,
            kategoria: 'INNE'
          });
        }
      }
    } catch (error) {
      console.error('ProductForm: Błąd podczas pobierania danych produktu:', error);
      // W przypadku błędu, ustaw kod jako nazwę
      if (onBarcodeData) {
        onBarcodeData({ nazwa: `Produkt ${barcode}` });
      }
    }
    
    setScannerOpen(false);
  };

  return (
    <Box sx={{ space: 3 }}>
      {/* Nazwa produktu z przyciskiem skanera */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          fullWidth
          label="Nazwa produktu"
          placeholder="np. Mleko"
          value={formData.nazwa}
          onChange={onChange('nazwa')}
          required
        />
        <IconButton
          onClick={() => {
            console.log('ProductForm: Kliknięto przycisk skanera');
            setScannerOpen(true);
          }}
          color="primary"
          sx={{ minWidth: 48 }}
          title="Skanuj kod kreskowy"
        >
          <QrCodeScanner />
        </IconButton>
      </Box>

      {/* Ilość + Jednostka */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={8}>
          <TextField
            fullWidth
            type="number"
            label="Ilość"
            placeholder="np. 1"
            value={formData.ilość}
            onChange={onChange('ilość')}
            inputProps={{ min: 0.1, step: 0.1 }}
            required
          />
        </Grid>
        <Grid size={4}>
          <FormControl fullWidth>
            <InputLabel>Jednostka</InputLabel>
            <Select
              value={formData.jednostka}
              label="Jednostka"
              onChange={onChange('jednostka')}
            >
              {JEDNOSTKI.map(jednostka => (
                <MenuItem key={jednostka.value} value={jednostka.value}>
                  {jednostka.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Data ważności */}
      <TextField
        fullWidth
        type="date"
        label="Data ważności"
        value={formData.dataWażności}
        onChange={onChange('dataWażności')}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 3 }}
      />

      {/* Kategoria */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Kategoria</InputLabel>
        <Select
          value={formData.kategoria}
          label="Kategoria"
          onChange={onChange('kategoria')}
        >
          {Object.values(KATEGORIE).map(kategoria => (
            <MenuItem key={kategoria.nazwa} value={kategoria.nazwa}>
              {kategoria.ikona} {kategoria.nazwa}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Lokalizacja */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Lokalizacja</InputLabel>
        <Select
          value={formData.lokalizacja}
          label="Lokalizacja"
          onChange={onChange('lokalizacja')}
          disabled={lokalizacjeLoading}
        >
          {lokalizacje.length === 0 ? (
            <MenuItem disabled>Brak lokalizacji</MenuItem>
          ) : (
            lokalizacje.map((lokalizacja) => (
              <MenuItem key={lokalizacja.id} value={lokalizacja.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>{lokalizacja.ikona}</Typography>
                  <Typography>{lokalizacja.nazwa}</Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {/* Opis (opcjonalny) */}
      <TextField
        fullWidth
        label="Opis (opcjonalny)"
        placeholder="Dodatkowe informacje..."
        value={formData.opis}
        onChange={onChange('opis')}
        multiline
        rows={2}
        sx={{ mb: 3 }}
      />

      {/* Marka produktu */}
      <TextField
        fullWidth
        label="Marka (opcjonalnie)"
        placeholder="np. Łaciate"
        value={formData.marka || ''}
        onChange={onChange('marka')}
        sx={{ mb: 3 }}
      />

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Informacja o spiżarni */}
      {spizarniaNazwa && (
        <Typography 
          variant="body2" 
          sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}
        >
          Dodajesz do: <strong>{spizarniaNazwa}</strong>
        </Typography>
      )}
      
      {/* Komponent skanera kodów kreskowych */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => {
          console.log('ProductForm: Zamykanie skanera');
          setScannerOpen(false);
        }}
        onScan={handleBarcodeData}
      />
    </Box>
  );
};

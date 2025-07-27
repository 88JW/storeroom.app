import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
  Alert,
  Typography
} from '@mui/material';
import { KATEGORIE, JEDNOSTKI } from '../../types';
import type { ProduktStatus } from '../../types';
import { useSpizarniaLokalizacje } from '../../hooks/useSpizarniaLokalizacje';

interface EditProductFormData {
  nazwa: string;
  kategoria: string;
  ilość: number;
  jednostka: string;
  dataWażności: string;
  lokalizacja: string;
  opis: string;
  status: ProduktStatus;
}

interface EditProductFormProps {
  formData: EditProductFormData;
  error: string | null;
  onChange: (field: keyof EditProductFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string | number } }) => void;
  spizarniaNazwa?: string;
  spizarniaId: string;
}

export const EditProductForm: React.FC<EditProductFormProps> = ({
  formData,
  error,
  onChange,
  spizarniaNazwa,
  spizarniaId
}) => {
  const { lokalizacje, loading: lokalizacjeLoading } = useSpizarniaLokalizacje(spizarniaId);
  return (
    <Box sx={{ space: 3 }}>
      {/* Nazwa produktu */}
      <TextField
        fullWidth
        label="Nazwa produktu"
        placeholder="np. Mleko"
        value={formData.nazwa}
        onChange={onChange('nazwa')}
        required
        sx={{ mb: 3 }}
      />

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
          {lokalizacje.map(lokalizacja => (
            <MenuItem key={lokalizacja.id} value={lokalizacja.id}>
              {lokalizacja.ikona} {lokalizacja.nazwa}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Status produktu - NOWE pole tylko w edycji */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={formData.status}
          label="Status"
          onChange={onChange('status')}
        >
          <MenuItem value="dostępny">✅ Dostępny</MenuItem>
          <MenuItem value="wykorzystany">✅ Wykorzystany</MenuItem>
          <MenuItem value="przeterminowany">❌ Przeterminowany</MenuItem>
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
          Edytujesz w: <strong>{spizarniaNazwa}</strong>
        </Typography>
      )}
    </Box>
  );
};

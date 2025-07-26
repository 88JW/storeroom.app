import React from 'react';
import {
  Paper,
  Container,
  Button
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface ProductFormFooterProps {
  onSubmit: (event: React.FormEvent) => void;
  loading: boolean;
  isFormValid: boolean;
}

export const ProductFormFooter: React.FC<ProductFormFooterProps> = ({
  onSubmit,
  loading,
  isFormValid
}) => {
  return (
    <Paper 
      elevation={3}
      sx={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'background.paper',
        borderTop: '1px solid #e5e7eb',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={onSubmit}
          disabled={loading || !isFormValid}
          startIcon={loading ? undefined : <AddIcon />}
          sx={{ 
            height: 56,
            fontSize: '1.1rem',
            fontWeight: 600
          }}
        >
          {loading ? 'Dodawanie...' : 'Dodaj produkt'}
        </Button>
      </Container>
    </Paper>
  );
};

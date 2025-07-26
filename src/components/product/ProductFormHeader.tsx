import React from 'react';
import {
  Paper,
  Container,
  Typography,
  IconButton,
  Button,
  Box,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  QrCodeScanner
} from '@mui/icons-material';

interface ProductFormHeaderProps {
  onGoBack: () => void;
  onScanBarcode: () => void;
}

export const ProductFormHeader: React.FC<ProductFormHeaderProps> = ({
  onGoBack,
  onScanBarcode
}) => {
  return (
    <Paper 
      elevation={1}
      sx={{ 
        position: 'sticky',
        top: 0,
        zIndex: 10,
        borderRadius: 0
      }}
    >
      <Container sx={{ maxWidth: 'sm', py: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <IconButton 
            onClick={onGoBack}
            sx={{ color: '#1993e5' }}
          >
            <ArrowBack />
          </IconButton>
          
          <Typography 
            variant="h1" 
            sx={{ 
              color: '#111418',
              fontWeight: 700,
              fontSize: '1.25rem'
            }}
          >
            Dodaj produkt
          </Typography>
          
          <div /> {/* Placeholder for spacing */}
        </Box>

        {/* Barcode Scanner Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<QrCodeScanner />}
          onClick={onScanBarcode}
          sx={{ 
            mb: 3,
            height: 48,
            borderColor: '#e5e7eb',
            color: '#637488',
            '&:hover': {
              borderColor: '#1993e5',
              color: '#1993e5'
            }
          }}
        >
          Zeskanuj kod kreskowy
        </Button>

        {/* Divider */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          color: '#8e8e93'
        }}>
          <Divider sx={{ flexGrow: 1 }} />
          <Typography 
            variant="caption" 
            sx={{ mx: 2, fontWeight: 500 }}
          >
            LUB DODAJ RĘCZNIE
          </Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Box>
      </Container>
    </Paper>
  );
};

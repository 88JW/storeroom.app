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
import { designTokens } from '../../theme/appTheme';

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
            sx={{ color: designTokens.colors.primary.main }}
          >
            <ArrowBack />
          </IconButton>
          
          <Typography 
            variant="h1" 
            sx={{ 
              color: designTokens.colors.text.primary,
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
            borderColor: designTokens.colors.secondary.light,
            color: designTokens.colors.text.secondary,
            '&:hover': {
              borderColor: designTokens.colors.primary.main,
              color: designTokens.colors.primary.main
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
          color: designTokens.colors.text.disabled
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

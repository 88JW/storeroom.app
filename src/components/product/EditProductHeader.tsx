import React from 'react';
import {
  Paper,
  Container,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import {
  ArrowBack
} from '@mui/icons-material';
import { designTokens } from '../../theme/appTheme';

interface EditProductHeaderProps {
  onGoBack: () => void;
  productName?: string;
}

export const EditProductHeader: React.FC<EditProductHeaderProps> = ({
  onGoBack,
  productName
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
          mb: 1
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
            Edytuj produkt
          </Typography>
          
          <div /> {/* Placeholder for spacing */}
        </Box>

        {/* Nazwa produktu */}
        {productName && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              textAlign: 'center',
              fontStyle: 'italic'
            }}
          >
            {productName}
          </Typography>
        )}
      </Container>
    </Paper>
  );
};

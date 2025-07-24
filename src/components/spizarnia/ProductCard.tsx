import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box
} from '@mui/material';
import { Kitchen } from '@mui/icons-material';
import type { Produkt } from '../../types';

interface ProductCardProps {
  produkt: Produkt;
  onClick?: (produkt: Produkt) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  produkt, 
  onClick 
}) => {
  // 📅 Funkcja do obliczania dni do wygaśnięcia
  const getDaysUntilExpiry = (dataWażności?: Date | { toDate: () => Date }): { 
    days: number; 
    color: string; 
    text: string 
  } => {
    if (!dataWażności) return { days: 999, color: '#10b981', text: 'Brak daty' };

    const today = new Date();
    const expiryDate = 'toDate' in dataWażności ? dataWażności.toDate() : dataWażności;
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { days: diffDays, color: '#ef4444', text: 'Przeterminowane' };
    if (diffDays <= 2) return { days: diffDays, color: '#ef4444', text: `${diffDays} dni` };
    if (diffDays <= 7) return { days: diffDays, color: '#f97316', text: `${diffDays} dni` };
    return { days: diffDays, color: '#10b981', text: `${diffDays} dni` };
  };

  const expiryInfo = getDaysUntilExpiry(produkt.dataWażności);

  const handleClick = () => {
    if (onClick) {
      onClick(produkt);
    }
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: onClick ? 'translateY(-1px)' : 'none',
          boxShadow: onClick ? '0 4px 20px rgba(0,0,0,0.1)' : 'inherit'
        }
      }}
    >
      <CardContent sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        py: 2 
      }}>
        {/* 🖼️ Obrazek produktu */}
        <Avatar
          sx={{ 
            width: 56, 
            height: 56, 
            bgcolor: '#e0e7ff',
            fontSize: '1.5rem'
          }}
        >
          {produkt.obrazek ? (
            <Box
              component="img"
              src={produkt.obrazek}
              alt={produkt.nazwa}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <Kitchen color="primary" />
          )}
        </Avatar>

        {/* 📝 Informacje o produkcie */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              color: '#111418',
              mb: 0.5
            }}
          >
            {produkt.nazwa}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ color: '#637488' }}
          >
            {produkt.ilość} {produkt.jednostka}
          </Typography>
        </Box>

        {/* 📅 Data ważności */}
        <Box sx={{ textAlign: 'right' }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#637488', 
              fontSize: '0.75rem',
              display: 'block',
              mb: 0.5
            }}
          >
            Ważne do
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500, 
              color: expiryInfo.color 
            }}
          >
            {expiryInfo.text}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

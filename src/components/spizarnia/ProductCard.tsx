import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { Kitchen, Edit } from '@mui/icons-material';
import { styleUtils, designTokens } from '../../theme/appTheme';
import type { Produkt } from '../../types';

interface ProductCardProps {
  produkt: Produkt;
  onClick?: (produkt: Produkt) => void;
  onEdit?: (produkt: Produkt) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  produkt, 
  onClick,
  onEdit 
}) => {
  // 📅 Funkcja do obliczania dni do wygaśnięcia
  const getDaysUntilExpiry = (dataWażności?: Date | { toDate: () => Date }): { 
    days: number; 
    color: string; 
    text: string 
  } => {
    if (!dataWażności) return { 
      days: 999, 
      color: designTokens.colors.expiry.fresh, 
      text: 'Brak daty' 
    };

    const today = new Date();
    const expiryDate = 'toDate' in dataWażności ? dataWażności.toDate() : dataWażności;
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      days: diffDays,
      color: styleUtils.getExpiryColor(diffDays),
      text: diffDays < 0 ? 'Przeterminowane' : `${diffDays} dni`
    };
  };

  const expiryInfo = getDaysUntilExpiry(produkt.dataWażności);

  const handleClick = () => {
    if (onClick) {
      onClick(produkt);
    }
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    if (onEdit) {
      onEdit(produkt);
    }
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: `all ${designTokens.transitions.normal}`,
        '&:hover': {
          transform: onClick ? 'translateY(-1px)' : 'none',
          boxShadow: onClick ? designTokens.shadows.cardHover : 'inherit'
        }
      }}
    >
      <CardContent sx={{ 
        ...styleUtils.flexBetween,
        gap: designTokens.spacing.md,
        py: designTokens.spacing.md
      }}>
        {/* 🖼️ Obrazek produktu */}
        <Avatar
          sx={{ 
            width: 56, 
            height: 56, 
            bgcolor: designTokens.colors.primary.light,
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
              color: designTokens.colors.text.primary,
              mb: 0.5
            }}
          >
            {produkt.nazwa}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ color: designTokens.colors.text.secondary }}
          >
            {produkt.ilość} {produkt.jednostka}
          </Typography>
        </Box>

        {/* 📅 Data ważności */}
        <Box sx={{ textAlign: 'right' }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: designTokens.colors.text.secondary, 
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

        {/* 🖊️ Edit Button */}
        {onEdit && (
          <IconButton
            onClick={handleEdit}
            size="small"
            sx={{ 
              ml: 1,
              color: designTokens.colors.primary.main,
              '&:hover': {
                bgcolor: `rgba(25, 147, 229, 0.1)`
              }
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
        )}
      </CardContent>
    </Card>
  );
};

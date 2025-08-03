import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import { Kitchen, Edit, Delete } from '@mui/icons-material';
import { styleUtils, designTokens } from '../../theme/appTheme';
import type { Produkt } from '../../types';

interface ProductCardProps {
  produkt: Produkt;
  onClick?: (produkt: Produkt) => void;
  onEdit?: (produkt: Produkt) => void;
  onDelete?: (produkt: Produkt) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  produkt, 
  onClick,
  onEdit,
  onDelete
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

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    if (onDelete) {
      onDelete(produkt);
    }
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: { xs: '12px', sm: '16px' },
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: onClick ? { xs: 'translateY(-2px)', sm: 'translateY(-4px)' } : 'none',
          boxShadow: onClick ? {
            xs: '0 4px 20px rgba(0,0,0,0.12)',
            sm: '0 8px 32px rgba(0,0,0,0.15)'
          } : 'inherit',
          borderColor: 'primary.main',
          '& .product-avatar': {
            transform: 'scale(1.05)',
          },
          '& .edit-button': {
            opacity: 1,
            transform: 'translateX(0)',
          },
          '& .delete-button': {
            opacity: 1,
            transform: 'translateX(0)',
          }
        },
        // Lepsze rozmiary na mobile
        minHeight: { xs: '80px', sm: '96px' },
      }}
    >
      <CardContent sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: { xs: designTokens.spacing.sm, sm: designTokens.spacing.md },
        p: { xs: 2, sm: designTokens.spacing.md },
        '&:last-child': { pb: { xs: 2, sm: designTokens.spacing.md } }
      }}>
        {/* 🖼️ Obrazek produktu */}
        <Avatar
          className="product-avatar"
          sx={{ 
            width: { xs: 48, sm: 56 }, 
            height: { xs: 48, sm: 56 },
            bgcolor: designTokens.colors.primary.light,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
        <Box sx={{ 
          flexGrow: 1, 
          minWidth: 0, // Pozwala na text overflow
          mr: { xs: 0.5, sm: 1 } // Mniej marginesu na mobile dla więcej miejsca na nazwę
        }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#000000', // Czarny kolor dla lepszej widoczności
              mb: 0.5,
              fontSize: { xs: '1rem', sm: '1.1rem' }, // Zwiększony rozmiar na mobile
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              // Zapewniamy widoczność tekstu na każdym tle
              textShadow: 'none'
            }}
          >
            {produkt.nazwa}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: designTokens.colors.text.secondary,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              lineHeight: 1.2
            }}
          >
            {produkt.ilość} {produkt.jednostka}
          </Typography>
        </Box>

        {/* 📅 Data ważności + lokalizacja */}
        <Box sx={{ 
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 0.5
        }}>
          {/* Status chip z lepszym wyglądem */}
          <Box
            sx={{
              px: { xs: 1, sm: 1.5 },
              py: 0.5,
              borderRadius: '12px',
              bgcolor: expiryInfo.color,
              color: 'white',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              fontWeight: 600,
              textAlign: 'center',
              minWidth: { xs: '60px', sm: '70px' },
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            {expiryInfo.text}
          </Box>
          
          {/*  Action Buttons Container - zawsze widoczne po status chipie */}
          <Box sx={{ 
            display: 'flex', 
            gap: 0.5,
            mt: 0.5,
            // Na desktop ukryte, na mobile widoczne, ale mniejsze
            opacity: { xs: 1, sm: 0 },
            transform: { xs: 'none', sm: 'translateX(8px)' },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            
            {/* 🗑️ Delete Button */}
            {onDelete && (
              <Tooltip title="Usuń produkt" placement="top">
                <IconButton
                  className="delete-button"
                  onClick={handleDelete}
                  size="small"
                  sx={{ 
                    color: designTokens.colors.status.error,
                    bgcolor: { xs: 'rgba(255,255,255,0.9)', sm: 'transparent' },
                    backdropFilter: { xs: 'blur(4px)', sm: 'none' },
                    width: { xs: 24, sm: 36 },
                    height: { xs: 24, sm: 36 },
                    '&:hover': {
                      bgcolor: { xs: 'rgba(255,255,255,1)', sm: 'rgba(239, 68, 68, 0.1)' },
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <Delete sx={{ fontSize: { xs: '16px', sm: '20px' } }} />
                </IconButton>
              </Tooltip>
            )}

            {/* 🖊️ Edit Button */}
            {onEdit && (
              <Tooltip title="Edytuj produkt" placement="top">
                <IconButton
                  className="edit-button"
                  onClick={handleEdit}
                  size="small"
                  sx={{ 
                    color: designTokens.colors.primary.main,
                    bgcolor: { xs: 'rgba(255,255,255,0.9)', sm: 'transparent' },
                    backdropFilter: { xs: 'blur(4px)', sm: 'none' },
                    width: { xs: 24, sm: 36 },
                    height: { xs: 24, sm: 36 },
                    '&:hover': {
                      bgcolor: { xs: 'rgba(255,255,255,1)', sm: 'rgba(25, 147, 229, 0.1)' },
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <Edit sx={{ fontSize: { xs: '16px', sm: '20px' } }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          {/* Lokalizacja - ukryta na mobile */}
          {produkt.lokalizacja && (
            <Box
              sx={{
                display: { xs: 'none', sm: 'block' }, // Ukryta na mobile
                px: 1,
                py: 0.25,
                borderRadius: '8px',
                bgcolor: designTokens.colors.secondary.main,
                color: designTokens.colors.text.secondary,
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                fontWeight: 500,
              }}
            >
              📍 {produkt.lokalizacja}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

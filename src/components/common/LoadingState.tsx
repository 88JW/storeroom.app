import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Stack
} from '@mui/material';
import { designTokens } from '../../theme/appTheme';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'cards';
  message?: string;
  cardCount?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  message = 'Ładowanie...',
  cardCount = 3
}) => {
  if (type === 'spinner') {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        py={8}
        gap={2}
      >
        <CircularProgress 
          size={40}
          sx={{ color: designTokens.colors.primary.main }}
        />
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {message}
        </Typography>
      </Box>
    );
  }

  if (type === 'cards') {
    return (
      <Stack spacing={2} sx={{ mt: 2 }}>
        {Array.from({ length: cardCount }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={80}
            sx={{
              borderRadius: 2,
              bgcolor: 'grey.100'
            }}
          />
        ))}
      </Stack>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Skeleton 
        variant="text" 
        height={40} 
        sx={{ mb: 1 }} 
      />
      <Skeleton 
        variant="text" 
        height={30} 
        width="60%" 
      />
    </Box>
  );
};

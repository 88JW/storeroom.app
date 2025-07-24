import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton
} from '@mui/material';
import {
  ArrowBack,
  Add
} from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  showBackButton?: boolean;
  showActionButton?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  onBack,
  onAction,
  actionIcon = <Add />,
  showBackButton = true,
  showActionButton = true
}) => {
  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: '#f9f9f9', 
        boxShadow: 'none',
        borderBottom: '1px solid #e5e7eb'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {showBackButton ? (
          <IconButton 
            onClick={onBack}
            sx={{ color: '#1993e5' }}
          >
            <ArrowBack />
          </IconButton>
        ) : (
          <div /> // Placeholder for spacing
        )}
        
        <Typography 
          variant="h1" 
          sx={{ 
            color: '#111418',
            fontWeight: 700,
            fontSize: '1.25rem'
          }}
        >
          {title}
        </Typography>
        
        {showActionButton ? (
          <IconButton 
            sx={{ 
              bgcolor: '#e0e7ff', 
              color: '#1993e5',
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: '#c7d2fe'
              }
            }}
            onClick={onAction}
          >
            {actionIcon}
          </IconButton>
        ) : (
          <div /> // Placeholder for spacing
        )}
      </Toolbar>
    </AppBar>
  );
};

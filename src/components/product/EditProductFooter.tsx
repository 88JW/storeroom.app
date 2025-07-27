import React from 'react';
import {
  Paper,
  Container,
  Button,
  Grid
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface EditProductFooterProps {
  onSubmit: (event: React.FormEvent) => void;
  onDelete?: () => void;
  loading: boolean;
  isFormValid: boolean;
  showDeleteButton?: boolean;
}

export const EditProductFooter: React.FC<EditProductFooterProps> = ({
  onSubmit,
  onDelete,
  loading,
  isFormValid,
  showDeleteButton = true
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
        <Grid container spacing={2}>
          {/* Przycisk Usuń */}
          {showDeleteButton && onDelete && (
            <Grid size={4}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="large"
                onClick={onDelete}
                disabled={loading}
                startIcon={<DeleteIcon />}
                sx={{ 
                  height: 56,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                Usuń
              </Button>
            </Grid>
          )}
          
          {/* Przycisk Zapisz */}
          <Grid size={showDeleteButton && onDelete ? 8 : 12}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={onSubmit}
              disabled={loading || !isFormValid}
              startIcon={loading ? undefined : <EditIcon />}
              sx={{ 
                height: 56,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Paper>
  );
};

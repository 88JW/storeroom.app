import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../theme/appTheme';
import { useEditProduct } from '../hooks/useEditProduct';
import { EditProductHeader } from '../components/product/EditProductHeader';
import { EditProductForm } from '../components/product/EditProductForm';
import { EditProductFooter } from '../components/product/EditProductFooter';
import { LoadingState } from '../components/common/LoadingState';

const EditProductPage: React.FC = () => {
  const {
    formData,
    originalProduct,
    loading,
    loadingProduct,
    error,
    spizarniaNazwa,
    isFormValid,
    handleInputChange,
    handleSubmit,
    handleGoBack,
    handleDelete
  } = useEditProduct();

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    await handleDelete();
  };

  // Loading state
  if (loadingProduct) {
    return (
      <ThemeProvider theme={appTheme}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <LoadingState message="Ładowanie produktu..." />
        </Box>
      </ThemeProvider>
    );
  }

  // Error state
  if (error && !originalProduct) {
    return (
      <ThemeProvider theme={appTheme}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Container sx={{ maxWidth: 'sm', mt: 4 }}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="error">
                {error}
              </Typography>
              <Button 
                variant="outlined" 
                onClick={handleGoBack}
                sx={{ mt: 2 }}
              >
                Powrót do listy
              </Button>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={appTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Header */}
        <EditProductHeader 
          onGoBack={handleGoBack}
          productName={originalProduct?.nazwa}
        />

        {/* Main Content */}
        <Container sx={{ maxWidth: 'sm', flex: 1, pb: 10 }}>
          <EditProductForm 
            formData={formData}
            error={error}
            onChange={handleInputChange}
            spizarniaNazwa={spizarniaNazwa}
          />
        </Container>

        {/* Footer */}
        <EditProductFooter 
          onSubmit={handleSubmit}
          onDelete={handleDeleteClick}
          loading={loading}
          isFormValid={isFormValid}
          showDeleteButton={true}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle>Usuń produkt</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Czy na pewno chcesz usunąć produkt "{originalProduct?.nazwa}"? 
              Ta operacja nie może zostać cofnięta.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={handleDeleteCancel}
              variant="outlined"
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Anuluj
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              disabled={loading}
            >
              {loading ? 'Usuwanie...' : 'Usuń'}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
};

export default EditProductPage;

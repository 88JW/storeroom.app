import React from 'react';
import { Box, Container } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../theme/appTheme';
import { useAddProduct } from '../hooks/useAddProduct';
import { ProductFormHeader } from '../components/product/ProductFormHeader';
import { ProductForm } from '../components/product/ProductForm';
import { ProductFormFooter } from '../components/product/ProductFormFooter';

const AddProductPage: React.FC = () => {
  const {
    formData,
    loading,
    error,
    spizarniaId,
    spizarniaNazwa,
    isFormValid,
    scannerOpen,
    setScannerOpen,
    handleInputChange,
    handleBarcodeData,
    handleSubmit,
    handleScanBarcode,
    handleGoBack
  } = useAddProduct();

  return (
    <ThemeProvider theme={appTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Header */}
        <ProductFormHeader 
          onGoBack={handleGoBack}
          onScanBarcode={handleScanBarcode}
        />

        {/* Main Content */}
        <Container sx={{ maxWidth: 'sm', flex: 1, pb: 10 }}>
          <ProductForm 
            formData={formData}
            error={error}
            onChange={handleInputChange}
            onBarcodeData={handleBarcodeData}
            scannerOpen={scannerOpen}
            setScannerOpen={setScannerOpen}
            spizarniaNazwa={spizarniaNazwa}
            spizarniaId={spizarniaId || undefined}
          />
        </Container>

        {/* Footer */}
        <ProductFormFooter 
          onSubmit={handleSubmit}
          loading={loading}
          isFormValid={isFormValid}
        />

      </Box>
    </ThemeProvider>
  );
};

export default AddProductPage;

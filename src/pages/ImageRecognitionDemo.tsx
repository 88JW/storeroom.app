// 📸 Strona demo rozpoznawania produktów z obrazów

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../theme/appTheme';
import ProductFromImage from '../components/ProductFromImage';
import type { ReceiptData } from '../services/ImageRecognitionService';

interface RecognizedProduct {
  name: string;
  category: string;
  brand?: string;
  expiryDate?: Date;
  timestamp: Date;
}

const ImageRecognitionDemo: React.FC = () => {
  const [recognizedProducts, setRecognizedProducts] = useState<RecognizedProduct[]>([]);
  const [scannedReceipts, setScannedReceipts] = useState<ReceiptData[]>([]);

  const handleProductRecognized = (productData: {
    name: string;
    category: string;
    brand?: string;
    expiryDate?: Date;
  }) => {
    const newProduct: RecognizedProduct = {
      ...productData,
      timestamp: new Date()
    };
    
    setRecognizedProducts(prev => [newProduct, ...prev]);
  };

  const handleReceiptScanned = (receiptData: ReceiptData) => {
    setScannedReceipts(prev => [receiptData, ...prev]);
    
    // Automatycznie dodaj produkty z paragonu
    receiptData.items.forEach(item => {
      const newProduct: RecognizedProduct = {
        name: item.name,
        category: item.category || 'Inne',
        timestamp: new Date()
      };
      setRecognizedProducts(prev => [newProduct, ...prev]);
    });
  };

  return (
    <ThemeProvider theme={appTheme}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          📸 Demo Rozpoznawania Produktów
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Funkcje demo:</strong>
            <br />
            🍎 <strong>Rozpoznawanie produktu</strong> - wykrywa nazwę, kategorię, markę i datę ważności
            <br />
            🧾 <strong>Skanowanie paragonu</strong> - wyciąga listę produktów z paragonu
            <br />
            📅 <strong>Data ważności</strong> - znajduje daty ważności na opakowaniach
          </Typography>
        </Alert>

        {/* Komponent rozpoznawania */}
        <ProductFromImage
          onProductRecognized={handleProductRecognized}
          onReceiptScanned={handleReceiptScanned}
        />

        {/* Rozpoznane produkty */}
        {recognizedProducts.length > 0 && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Rozpoznane produkty ({recognizedProducts.length})
              </Typography>
              <List>
                {recognizedProducts.map((product, index) => (
                  <ListItem key={index} divider={index < recognizedProducts.length - 1}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" component="span">
                            {product.name}
                          </Typography>
                          <Chip 
                            label={product.category} 
                            size="small" 
                            variant="outlined" 
                          />
                          {product.brand && (
                            <Chip 
                              label={product.brand} 
                              size="small" 
                              color="secondary" 
                              variant="outlined" 
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          {product.expiryDate && (
                            <Typography variant="body2" color="text.secondary">
                              📅 Data ważności: {product.expiryDate.toLocaleDateString('pl-PL')}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Rozpoznano: {product.timestamp.toLocaleString('pl-PL')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Zeskanowane paragony */}
        {scannedReceipts.length > 0 && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🧾 Zeskanowane paragony ({scannedReceipts.length})
              </Typography>
              {scannedReceipts.map((receipt, receiptIndex) => (
                <Card 
                  key={receiptIndex} 
                  variant="outlined" 
                  sx={{ mb: 2 }}
                >
                  <CardContent>
                    {receipt.storeName && (
                      <Typography variant="subtitle1" gutterBottom>
                        🏪 {receipt.storeName}
                      </Typography>
                    )}
                    
                    {receipt.date && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        📅 {receipt.date.toLocaleDateString('pl-PL')}
                      </Typography>
                    )}

                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Produkty ({receipt.items.length}):
                    </Typography>

                    <List dense>
                      {receipt.items.map((item, itemIndex) => (
                        <ListItem key={itemIndex} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2">
                                    {item.name}
                                  </Typography>
                                  {item.quantity > 1 && (
                                    <Chip 
                                      label={`x${item.quantity}`} 
                                      size="small" 
                                      variant="outlined" 
                                    />
                                  )}
                                  {item.category && (
                                    <Chip 
                                      label={item.category} 
                                      size="small" 
                                      color="primary" 
                                      variant="outlined" 
                                    />
                                  )}
                                </Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {item.price.toFixed(2)} zł
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>

                    {receipt.total && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">
                            💰 Suma:
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {receipt.total.toFixed(2)} zł
                          </Typography>
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Instrukcje */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Instrukcje użytkowania
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>1. Rozpoznawanie produktów:</strong>
              <br />
              • Wybierz tryb "🍎 Produkt"
              <br />
              • Zrób zdjęcie opakowania produktu z widoczną nazwą i etykietą
              <br />
              • System spróbuje rozpoznać nazwę, kategorię, markę i datę ważności
            </Typography>
            
            <Typography variant="body2" paragraph>
              <strong>2. Skanowanie paragonów:</strong>
              <br />
              • Wybierz tryb "🧾 Paragon"
              <br />
              • Zrób wyraźne zdjęcie całego paragonu
              <br />
              • System wyciągnie nazwę sklepu, datę i listę produktów z cenami
            </Typography>
            
            <Typography variant="body2" paragraph>
              <strong>3. Rozpoznawanie dat ważności:</strong>
              <br />
              • Wybierz tryb "📅 Data ważności"
              <br />
              • Sfotografuj etykietę z datą ważności
              <br />
              • System znajdzie i wyciągnie datę do formularza
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              <strong>Uwaga:</strong> To jest wersja demo z symulowanymi wynikami. 
              W pełnej wersji używana będzie Google Vision API dla prawdziwego rozpoznawania.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default ImageRecognitionDemo;

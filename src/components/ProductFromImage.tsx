// 📸 Komponent do rozpoznawania produktów z zdjęć

import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CameraAlt,
  Upload,
  Close,
  Check,
  CalendarToday,
  Category
} from '@mui/icons-material';
import { imageRecognitionService } from '../services/ImageRecognitionService';
import type { ProductRecognitionResult, ReceiptData, ReceiptItem } from '../services/ImageRecognitionService';

interface ProductFromImageProps {
  onProductRecognized: (productData: {
    name: string;
    category: string;
    brand?: string;
    expiryDate?: Date;
  }) => void;
  onReceiptScanned?: (receiptData: ReceiptData) => void;
}

const ProductFromImage: React.FC<ProductFromImageProps> = ({
  onProductRecognized,
  onReceiptScanned
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<ProductRecognitionResult | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'product' | 'receipt' | 'expiry'>('product');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    category: '',
    brand: '',
    expiryDate: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Nabiał', 'Mięso', 'Warzywa', 'Owoce', 'Pieczywo',
    'Napoje', 'Słodycze', 'Mrożonki', 'Konserwы', 'Inne'
  ];

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setRecognitionResult(null);
    setReceiptData(null);

    // Pokaż podgląd obrazu
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);

    try {
      if (mode === 'product') {
        // Rozpoznawanie produktu
        const result = await imageRecognitionService.recognizeProduct(file);
        setRecognitionResult(result);
        
        if (result.productName || result.category) {
          // Przygotuj dane do edycji
          setEditedProduct({
            name: result.productName || '',
            category: result.category || '',
            brand: result.brand || '',
            expiryDate: result.expiryDate ? 
              result.expiryDate.toISOString().split('T')[0] : ''
          });
          setShowConfirmDialog(true);
        }
      } else if (mode === 'receipt') {
        // Skanowanie paragonu
        const receipt = await imageRecognitionService.scanReceipt(file);
        setReceiptData(receipt);
        if (onReceiptScanned) {
          onReceiptScanned(receipt);
        }
      } else if (mode === 'expiry') {
        // Rozpoznawanie daty ważności
        // TO DO: Implementacja rozpoznawania daty ważności
        setError('Rozpoznawanie daty ważności nie jest jeszcze zaimplementowane');
      }
    } catch (error) {
      console.error('Błąd rozpoznawania:', error);
      setError('Wystąpił błąd podczas rozpoznawania obrazu');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleConfirmProduct = () => {
    const productData = {
      name: editedProduct.name,
      category: editedProduct.category,
      brand: editedProduct.brand || undefined,
      expiryDate: editedProduct.expiryDate ? new Date(editedProduct.expiryDate) : undefined
    };

    onProductRecognized(productData);
    setShowConfirmDialog(false);
    resetComponent();
  };

  const resetComponent = () => {
    setRecognitionResult(null);
    setReceiptData(null);
    setSelectedImage(null);
    setError(null);
    setEditedProduct({
      name: '',
      category: '',
      brand: '',
      expiryDate: ''
    });
    
    // Wyczyść inputy plików
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'success';
    if (confidence > 0.5) return 'warning';
    return 'error';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence > 0.8) return 'Wysoka pewność';
    if (confidence > 0.5) return 'Średnia pewność';
    return 'Niska pewność';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📸 Rozpoznawanie z obrazu
        </Typography>

        {/* Wybór trybu */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Wybierz tryb rozpoznawania:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="🍎 Produkt"
              onClick={() => setMode('product')}
              color={mode === 'product' ? 'primary' : 'default'}
              variant={mode === 'product' ? 'filled' : 'outlined'}
            />
            <Chip
              label="🧾 Paragon"
              onClick={() => setMode('receipt')}
              color={mode === 'receipt' ? 'primary' : 'default'}
              variant={mode === 'receipt' ? 'filled' : 'outlined'}
            />
            <Chip
              label="📅 Data ważności"
              onClick={() => setMode('expiry')}
              color={mode === 'expiry' ? 'primary' : 'default'}
              variant={mode === 'expiry' ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>

        {/* Przyciski uploadów */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<CameraAlt />}
            onClick={() => cameraInputRef.current?.click()}
            disabled={isProcessing}
          >
            Zrób zdjęcie
          </Button>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            Wybierz plik
          </Button>
        </Box>

        {/* Inputy plików - ukryte */}
        <Box
          component="input"
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          sx={{ display: 'none' }}
          onChange={handleFileSelect}
          aria-label="Zrób zdjęcie aparatem"
        />
        <Box
          component="input"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          sx={{ display: 'none' }}
          onChange={handleFileSelect}
          aria-label="Wybierz plik z galerii"
        />

        {/* Stan ładowania */}
        {isProcessing && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CircularProgress size={24} />
            <Typography>
              {mode === 'product' ? 'Rozpoznaję produkt...' :
               mode === 'receipt' ? 'Skanuję paragon...' :
               'Szukam daty ważności...'}
            </Typography>
          </Box>
        )}

        {/* Podgląd obrazu */}
        {selectedImage && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Przesłany obraz:
            </Typography>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Box
                component="img"
                src={selectedImage}
                alt="Przesłany obraz"
                sx={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}
              />
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                }}
                onClick={() => {
                  setSelectedImage(null);
                  resetComponent();
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Błąd */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Wyniki rozpoznawania produktu */}
        {recognitionResult && mode === 'product' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Wyniki rozpoznawania:
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {recognitionResult.productName || 'Nierozpoznany produkt'}
                  </Typography>
                  <Chip
                    label={getConfidenceText(recognitionResult.confidence)}
                    color={getConfidenceColor(recognitionResult.confidence)}
                    size="small"
                  />
                </Box>

                {recognitionResult.category && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Category fontSize="small" />
                    <Typography variant="body2">
                      Kategoria: {recognitionResult.category}
                    </Typography>
                  </Box>
                )}

                {recognitionResult.brand && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Marka: {recognitionResult.brand}
                  </Typography>
                )}

                {recognitionResult.expiryDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarToday fontSize="small" />
                    <Typography variant="body2">
                      Data ważności: {recognitionResult.expiryDate.toLocaleDateString('pl-PL')}
                    </Typography>
                  </Box>
                )}

                <Typography variant="caption" color="text.secondary">
                  Metoda: {
                    recognitionResult.recognitionMethod === 'text' ? 'Rozpoznawanie tekstu' :
                    recognitionResult.recognitionMethod === 'image' ? 'Rozpoznawanie obrazu' :
                    recognitionResult.recognitionMethod === 'barcode' ? 'Kod kreskowy' :
                    'Ręczne'
                  }
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Wyniki skanowania paragonu */}
        {receiptData && mode === 'receipt' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Zeskanowany paragon:
            </Typography>
            <Card variant="outlined">
              <CardContent>
                {receiptData.storeName && (
                  <Typography variant="h6" gutterBottom>
                    {receiptData.storeName}
                  </Typography>
                )}
                
                {receiptData.date && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Data: {receiptData.date.toLocaleDateString('pl-PL')}
                  </Typography>
                )}

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Produkty ({receiptData.items.length}):
                </Typography>

                {receiptData.items.map((item: ReceiptItem, index: number) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {item.name} {item.quantity && item.quantity > 1 && `x${item.quantity}`}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {item.price ? `${item.price.toFixed(2)} zł` : 'Brak ceny'}
                    </Typography>
                  </Box>
                ))}

                {receiptData.total && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2">Razem:</Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {receiptData.total.toFixed(2)} zł
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Przycisk resetowania */}
        {(recognitionResult || receiptData || selectedImage) && (
          <Button
            variant="text"
            onClick={resetComponent}
            startIcon={<Close />}
          >
            Wyczyść i spróbuj ponownie
          </Button>
        )}

        {/* Dialog potwierdzenia produktu */}
        <Dialog
          open={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Potwierdź dane produktu
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Nazwa produktu"
                value={editedProduct.name}
                onChange={(e) => setEditedProduct(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Kategoria</InputLabel>
                  <Select
                    value={editedProduct.category}
                    label="Kategoria"
                    onChange={(e) => setEditedProduct(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  sx={{ flex: 1 }}
                  label="Marka (opcjonalnie)"
                  value={editedProduct.brand}
                  onChange={(e) => setEditedProduct(prev => ({ ...prev, brand: e.target.value }))}
                />
              </Box>
              <TextField
                fullWidth
                label="Data ważności"
                type="date"
                value={editedProduct.expiryDate}
                onChange={(e) => setEditedProduct(prev => ({ ...prev, expiryDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirmDialog(false)}>
              Anuluj
            </Button>
            <Button
              onClick={handleConfirmProduct}
              variant="contained"
              disabled={!editedProduct.name.trim()}
              startIcon={<Check />}
            >
              Dodaj produkt
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProductFromImage;

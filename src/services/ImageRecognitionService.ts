// 📸 Serwis rozpoznawania produktów z zdjęć i OCR

// 🚀 Tesseract.js - darmowe OCR (działa offline!)
import Tesseract from 'tesseract.js';

// 🧠 TensorFlow.js - darmowe rozpoznawanie obiektów
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Firebase Storage (future implementation)
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { storage } from '../firebase';

export interface ProductRecognitionResult {
  productName?: string;
  category?: string;
  brand?: string;
  expiryDate?: Date;
  confidence: number;
  recognitionMethod: 'barcode' | 'text' | 'image' | 'manual';
  rawText?: string;
  detectedObjects?: DetectedObject[];
}

export interface GoogleVisionTextAnnotation {
  description: string;
  boundingPoly?: {
    vertices?: Array<{ x?: number; y?: number }>;
  };
}

export interface GoogleVisionObjectAnnotation {
  name: string;
  score: number;
  boundingPoly?: {
    normalizedVertices?: Array<{ x?: number; y?: number }>;
  };
}

export interface GoogleVisionLabelAnnotation {
  description: string;
  score: number;
}

export interface DetectedObject {
  name: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ReceiptData {
  storeName?: string;
  date?: Date;
  items: ReceiptItem[];
  total?: number;
  currency?: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  category?: string;
}

export class ImageRecognitionService {
  private static objectDetectionModel: cocoSsd.ObjectDetection | null = null;

  /**
   * 🧠 Inicjalizuje model TensorFlow.js (tylko raz)
   */
  private static async loadObjectDetectionModel(): Promise<void> {
    if (!this.objectDetectionModel) {
      console.log('🚀 Ładowanie modelu TensorFlow.js...');
      await tf.ready();
      this.objectDetectionModel = await cocoSsd.load();
      console.log('✅ Model TensorFlow.js załadowany!');
    }
  }

  /**
   * 📸 Rozpoznaje produkty z przesłanego obrazu - teraz używa prawdziwego AI!
   */
  static async recognizeProductFromImage(
    imageFile: File
  ): Promise<ProductRecognitionResult> {
    try {
      // 1. Upload obrazu do Firebase Storage (dla przyszłych potrzeb)
      // const imageUrl = await this.uploadImageToStorage(imageFile, userId);
      
      // 2. Rozpoznawanie tekstu (OCR) - bezpośrednio z pliku
      const ocrResults = await this.performOCR(imageFile);
      
      // 3. Analiza rozpoznanego tekstu
      const productInfo = this.analyzeTextForProduct(ocrResults);
      
      // 4. Rozpoznawanie obiektów - TensorFlow.js
      const objectResults = await this.detectObjects(imageFile);
      
      // 5. Połączenie wyników
      const result = this.combineRecognitionResults(productInfo, objectResults, ocrResults);
      
      return result;
    } catch (error) {
      console.error('Błąd rozpoznawania produktu:', error);
      return {
        confidence: 0,
        recognitionMethod: 'manual',
        rawText: 'Błąd rozpoznawania'
      };
    }
  }

  /**
   * 🧾 Skanuje paragon i wyciąga produkty
   */
  static async scanReceipt(imageFile: File): Promise<ReceiptData> {
    try {
      const ocrResults = await this.performOCR(imageFile);
      
      return this.parseReceiptFromText(ocrResults);
    } catch (error) {
      console.error('Błąd skanowania paragonu:', error);
      return {
        items: []
      };
    }
  }

  /**
   * 📅 Rozpoznaje datę ważności z opakowania
   */
  static async extractExpiryDate(imageFile: File): Promise<Date | null> {
    try {
      const ocrResults = await this.performOCR(imageFile);
      
      return this.findExpiryDateInText(ocrResults);
    } catch (error) {
      console.error('Błąd rozpoznawania daty:', error);
      return null;
    }
  }

  /**
   * 🔤 Wykonuje OCR na obrazie - używa Tesseract.js (darmowo!)
   */
  private static async performOCR(imageFile: File): Promise<OCRResult[]> {
    try {
      console.log('🔍 Rozpoczynam OCR z Tesseract.js...');
      
      // Tesseract.js obsługuje bezpośrednio pliki File
      const result = await Tesseract.recognize(imageFile, 'pol+eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      console.log('✅ OCR zakończone!', result.data.text);

      // Konwertuj wyniki Tesseract na nasz format - tylko główny tekst
      const ocrResults: OCRResult[] = [];
      
      // Główny tekst
      if (result.data.text.trim()) {
        ocrResults.push({
          text: result.data.text.trim(),
          confidence: result.data.confidence / 100, // Tesseract zwraca 0-100, my chcemy 0-1
          boundingBox: { x: 0, y: 0, width: 100, height: 100 }
        });
      }

      return ocrResults;
    } catch (error) {
      console.error('❌ Błąd OCR Tesseract:', error);
      return [];
    }
  }

  /**
   * 🎯 Rozpoznaje obiekty na obrazie - używa TensorFlow.js (darmowo!)
   */
  private static async detectObjects(imageFile: File): Promise<DetectedObject[]> {
    try {
      console.log('🧠 Rozpoczynam rozpoznawanie obiektów z TensorFlow.js...');
      
      // Załaduj model (jeśli jeszcze nie załadowany)
      await this.loadObjectDetectionModel();
      
      if (!this.objectDetectionModel) {
        console.error('❌ Model TensorFlow nie został załadowany');
        return [];
      }

      // Stwórz element img z pliku
      const imageElement = await this.createImageElement(imageFile);
      
      // Rozpoznaj obiekty
      const predictions = await this.objectDetectionModel.detect(imageElement);
      
      console.log('✅ Rozpoznano obiekty:', predictions);
      
      // Konwertuj wyniki TensorFlow na nasz format
      const detectedObjects: DetectedObject[] = predictions.map(prediction => ({
        name: prediction.class,
        confidence: prediction.score,
        boundingBox: {
          x: prediction.bbox[0],
          y: prediction.bbox[1],
          width: prediction.bbox[2],
          height: prediction.bbox[3]
        }
      }));

      return detectedObjects;
    } catch (error) {
      console.error('❌ Błąd rozpoznawania obiektów TensorFlow:', error);
      return [];
    }
  }

  /**
   * 🖼️ Tworzy element Image z pliku File
   */
  private static createImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url); // Zwolnij pamięć
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Nie można załadować obrazu'));
      };
      
      img.src = url;
    });
  }

  /**
   * 🔍 Analizuje tekst w poszukiwaniu informacji o produkcie
   */
  private static analyzeTextForProduct(ocrResults: OCRResult[]): Partial<ProductRecognitionResult> {
    const allText = ocrResults.map(r => r.text).join(' ').toLowerCase();
    
    // Słownik produktów z kategoriami
    const productCategories: Record<string, string> = {
      'mleko': 'Nabiał',
      'ser': 'Nabiał',
      'jogurt': 'Nabiał',
      'masło': 'Nabiał',
      'chleb': 'Pieczywo',
      'bułka': 'Pieczywo',
      'jabłko': 'Owoce',
      'banan': 'Owoce',
      'pomarańcza': 'Owoce',
      'pomidor': 'Warzywa',
      'ogórek': 'Warzywa',
      'marchew': 'Warzywa',
      'kurczak': 'Mięso',
      'szynka': 'Mięso',
      'woda': 'Napoje',
      'sok': 'Napoje'
    };

    // Znajdź najlepsze dopasowanie
    let bestMatch = '';
    let bestCategory = '';
    let maxMatches = 0;

    Object.entries(productCategories).forEach(([product, category]) => {
      if (allText.includes(product)) {
        const matches = (allText.match(new RegExp(product, 'g')) || []).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          bestMatch = product;
          bestCategory = category;
        }
      }
    });

    // Znajdź markę
    const brands = ['żywiec', 'mlekpol', 'bakoma', 'danone', 'jacobs', 'nestle'];
    const detectedBrand = brands.find(brand => allText.includes(brand));

    // Znajdź datę ważności
    const expiryDate = this.findExpiryDateInText(ocrResults);

    return {
      productName: bestMatch ? this.capitalizeFirst(bestMatch) : undefined,
      category: bestCategory || undefined,
      brand: detectedBrand ? this.capitalizeFirst(detectedBrand) : undefined,
      expiryDate: expiryDate || undefined,
      confidence: bestMatch ? 0.8 : 0.3,
      recognitionMethod: 'text'
    };
  }

  /**
   * 📅 Znajduje datę ważności w tekście
   */
  private static findExpiryDateInText(ocrResults: OCRResult[]): Date | null {
    const allText = ocrResults.map(r => r.text).join(' ');
    
    // Wzorce dat
    const datePatterns = [
      /(\d{2})[-./](\d{2})[-./](\d{4})/g,  // DD-MM-YYYY, DD.MM.YYYY, DD/MM/YYYY
      /(\d{2})[-./](\d{2})[-./](\d{2})/g,  // DD-MM-YY, DD.MM.YY
      /(\d{4})[-./](\d{2})[-./](\d{2})/g,  // YYYY-MM-DD
      /(\d{1,2})\s+(stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)\s+(\d{4})/gi
    ];

    // Słowa kluczowe wskazujące na datę ważności (na przyszłość)
    // const expiryKeywords = ['ważny do', 'data ważności', 'zużyć do', 'best before', 'exp', 'bb'];
    
    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.exec(allText)) !== null) {
        try {
          let date: Date;
          
          if (match.length === 4) { // DD-MM-YYYY lub YYYY-MM-DD
            const [, first, second, third] = match;
            
            if (third.length === 4) { // DD-MM-YYYY
              date = new Date(parseInt(third), parseInt(second) - 1, parseInt(first));
            } else { // YYYY-MM-DD
              date = new Date(parseInt(first), parseInt(second) - 1, parseInt(third));
            }
          } else { // Nazwa miesiąca
            const months: Record<string, number> = {
              'stycznia': 0, 'lutego': 1, 'marca': 2, 'kwietnia': 3,
              'maja': 4, 'czerwca': 5, 'lipca': 6, 'sierpnia': 7,
              'września': 8, 'października': 9, 'listopada': 10, 'grudnia': 11
            };
            date = new Date(parseInt(match[3]), months[match[2].toLowerCase()], parseInt(match[1]));
          }
          
          // Sprawdź czy data jest w przyszłości i rozsądna (max 5 lat)
          const now = new Date();
          const fiveYearsFromNow = new Date(now.getTime() + 5 * 365 * 24 * 60 * 60 * 1000);
          
          if (date > now && date < fiveYearsFromNow) {
            return date;
          }
        } catch {
          continue;
        }
      }
    }
    
    return null;
  }

  /**
   * 🧾 Parsuje paragon z rozpoznanego tekstu
   */
  private static parseReceiptFromText(ocrResults: OCRResult[]): ReceiptData {
    const allText = ocrResults.map(r => r.text).join('\n');
    const lines = allText.split('\n').filter(line => line.trim().length > 0);
    
    const receipt: ReceiptData = {
      items: []
    };

    // Znajdź nazwę sklepu (zazwyczaj w pierwszych liniach)
    const storePatterns = ['biedronka', 'żabka', 'carrefour', 'tesco', 'lidl', 'auchan'];
    for (const line of lines.slice(0, 5)) {
      const storeName = storePatterns.find(store => 
        line.toLowerCase().includes(store)
      );
      if (storeName) {
        receipt.storeName = this.capitalizeFirst(storeName);
        break;
      }
    }

    // Znajdź datę paragonu
    const dateMatch = allText.match(/(\d{2})[-./](\d{2})[-./](\d{4})/);
    if (dateMatch) {
      receipt.date = new Date(
        parseInt(dateMatch[3]), 
        parseInt(dateMatch[2]) - 1, 
        parseInt(dateMatch[1])
      );
    }

    // Znajdź produkty (linie z cenami)
    const pricePattern = /(\d+[,.]\d{2})/;
    const productLines = lines.filter(line => pricePattern.test(line));

    productLines.forEach(line => {
      const priceMatch = line.match(/(\d+[,.]\d{2})/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(',', '.'));
        const productName = line.replace(priceMatch[1], '').trim();
        
        if (productName.length > 2) {
          receipt.items.push({
            name: productName,
            quantity: 1,
            price: price,
            category: this.guessCategoryFromName(productName)
          });
        }
      }
    });

    // Znajdź sumę
    const totalMatch = allText.match(/suma:?\s*(\d+[,.]\d{2})/i) || 
                     allText.match(/razem:?\s*(\d+[,.]\d{2})/i);
    if (totalMatch) {
      receipt.total = parseFloat(totalMatch[1].replace(',', '.'));
    }

    return receipt;
  }

  /**
   * 🔗 Łączy wyniki różnych metod rozpoznawania
   */
  private static combineRecognitionResults(
    textResult: Partial<ProductRecognitionResult>,
    objectResults: DetectedObject[],
    ocrResults: OCRResult[]
  ): ProductRecognitionResult {
    let finalResult: ProductRecognitionResult = {
      confidence: 0,
      recognitionMethod: 'manual',
      rawText: ocrResults.map(r => r.text).join(' ')
    };

    // Priorytet: wyniki tekstowe
    if (textResult.productName) {
      finalResult = { ...finalResult, ...textResult };
    }

    // Uzupełnij informacjami z rozpoznawania obiektów
    if (objectResults.length > 0) {
      const bestObject = objectResults.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );

      if (bestObject.confidence > 0.7) {
        finalResult.detectedObjects = objectResults;
        if (!finalResult.productName) {
          finalResult.productName = this.capitalizeFirst(bestObject.name);
          finalResult.category = this.guessCategoryFromName(bestObject.name);
          finalResult.confidence = bestObject.confidence;
          finalResult.recognitionMethod = 'image';
        }
      }
    }

    return finalResult;
  }

  /**
   * 🎯 Zgaduje kategorię na podstawie nazwy
   */
  private static guessCategoryFromName(name: string): string {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('mleko') || lowerName.includes('ser') || lowerName.includes('jogurt')) {
      return 'Nabiał';
    }
    if (lowerName.includes('chleb') || lowerName.includes('bułka')) {
      return 'Pieczywo';
    }
    if (lowerName.includes('jabłko') || lowerName.includes('banan') || lowerName.includes('owoc')) {
      return 'Owoce';
    }
    if (lowerName.includes('pomidor') || lowerName.includes('ogórek') || lowerName.includes('warzywo')) {
      return 'Warzywa';
    }
    if (lowerName.includes('mięso') || lowerName.includes('szynka') || lowerName.includes('kurczak')) {
      return 'Mięso';
    }
    
    return 'Inne';
  }

  /**
   * 🔤 Kapitalizuje pierwszą literę
   */
  private static capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

}

export default ImageRecognitionService;

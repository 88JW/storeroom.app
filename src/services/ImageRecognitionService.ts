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

export interface ReceiptItem {
  name: string;
  price?: number;
  quantity?: number;
  category?: string;
}

export interface ReceiptData {
  storeName?: string;
  date?: Date;
  total?: number;
  items: ReceiptItem[];
  confidence: number;
}

// 🧩 Słownik produktów do rozpoznawania tekstu
const PRODUCT_DICTIONARY = {
  // Nabiał
  'mleko': { name: 'Mleko', category: 'Nabiał', keywords: ['mleko', 'milk', 'latte'] },
  'ser': { name: 'Ser', category: 'Nabiał', keywords: ['ser', 'cheese', 'gouda', 'cheddar', 'camembert'] },
  'jogurt': { name: 'Jogurt', category: 'Nabiał', keywords: ['jogurt', 'yogurt', 'greek'] },
  'masło': { name: 'Masło', category: 'Nabiał', keywords: ['masło', 'butter'] },
  
  // Mięso
  'kurczak': { name: 'Kurczak', category: 'Mięso i ryby', keywords: ['kurczak', 'chicken', 'pierś', 'udko'] },
  'wołowina': { name: 'Wołowina', category: 'Mięso i ryby', keywords: ['wołowina', 'beef', 'rostbef'] },
  'wieprzowina': { name: 'Wieprzowina', category: 'Mięso i ryby', keywords: ['wieprzowina', 'pork', 'schab'] },
  'ryba': { name: 'Ryba', category: 'Mięso i ryby', keywords: ['ryba', 'fish', 'łosoś', 'tuńczyk'] },
  
  // Warzywa
  'pomidor': { name: 'Pomidor', category: 'Warzywa', keywords: ['pomidor', 'tomato'] },
  'ogórek': { name: 'Ogórek', category: 'Warzywa', keywords: ['ogórek', 'cucumber'] },
  'cebula': { name: 'Cebula', category: 'Warzywa', keywords: ['cebula', 'onion'] },
  
  // Owoce
  'jabłko': { name: 'Jabłko', category: 'Owoce', keywords: ['jabłko', 'apple'] },
  'banan': { name: 'Banan', category: 'Owoce', keywords: ['banan', 'banana'] },
  'pomarańcza': { name: 'Pomarańcza', category: 'Owoce', keywords: ['pomarańcza', 'orange'] },
};

export class ImageRecognitionService {
  private model: cocoSsd.ObjectDetection | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * 🚀 Inicjalizacja TensorFlow.js i modelu COCO-SSD
   */
  private async initialize(): Promise<void> {
    try {
      console.log('🔧 Inicjalizacja TensorFlow.js...');
      
      // Ustaw backend (najlepszy dostępny)
      await tf.ready();
      console.log('✅ TensorFlow.js gotowy, backend:', tf.getBackend());
      
      // Załaduj model COCO-SSD do rozpoznawania obiektów
      console.log('📦 Ładowanie modelu COCO-SSD...');
      this.model = await cocoSsd.load();
      console.log('✅ Model COCO-SSD załadowany!');
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Błąd inicjalizacji:', error);
      throw new Error('Nie udało się zainicjalizować serwisu rozpoznawania');
    }
  }

  /**
   * 🔍 Główna metoda rozpoznawania produktu z obrazu
   */
  async recognizeProduct(imageFile: File): Promise<ProductRecognitionResult> {
    try {
      console.log('🔍 Rozpoczynam rozpoznawanie produktu...');
      
      if (!this.isInitialized || !this.model) {
        console.log('⏳ Czekam na inicjalizację...');
        await this.initialize();
      }

      // Konwertuj plik na HTML Image Element
      const imageElement = await this.fileToImageElement(imageFile);
      
      // 1️⃣ Rozpoznawanie tekstu (OCR)
      console.log('1️⃣ Rozpoczynam OCR...');
      const ocrResult = await this.performOCR(imageFile);
      console.log('📝 OCR znalazł tekst:', ocrResult.data.text);
      
      // 2️⃣ Rozpoznawanie obiektów 
      console.log('2️⃣ Rozpoczynam detekcję obiektów...');
      const detectedObjects = await this.detectObjects(imageElement);
      console.log('🎯 Znalezione obiekty:', detectedObjects);
      
      // 3️⃣ Analiza tekstu w poszukiwaniu produktów
      console.log('3️⃣ Analizuję tekst...');
      const textAnalysis = this.analyzeTextForProduct(ocrResult.data.text);
      console.log('🧩 Analiza tekstu:', textAnalysis);
      
      // 4️⃣ Kombinuj wyniki i wybierz najlepszy
      const finalResult = this.combineResults(textAnalysis, detectedObjects, ocrResult.data.text);
      console.log('🎉 Ostateczny wynik:', finalResult);
      
      return finalResult;
      
    } catch (error) {
      console.error('❌ Błąd rozpoznawania:', error);
      return {
        confidence: 0,
        recognitionMethod: 'manual',
        rawText: 'Błąd rozpoznawania'
      };
    }
  }

  /**
   * 📝 OCR - rozpoznawanie tekstu z obrazu
   */
  private async performOCR(imageFile: File): Promise<Tesseract.RecognizeResult> {
    try {
      console.log('🔤 Uruchamiam Tesseract OCR...');
      
      const result = await Tesseract.recognize(
        imageFile,
        'pol+eng', // Polski i angielski
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`📖 OCR postęp: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );
      
      console.log(`✅ OCR zakończony! Pewność: ${Math.round(result.data.confidence)}%`);
      return result;
      
    } catch (error) {
      console.error('❌ Błąd OCR:', error);
      throw error;
    }
  }

  /**
   * 🎯 Detekcja obiektów za pomocą TensorFlow.js
   */
  private async detectObjects(imageElement: HTMLImageElement): Promise<DetectedObject[]> {
    try {
      if (!this.model) {
        throw new Error('Model COCO-SSD nie jest załadowany');
      }
      
      console.log('🔍 Szukam obiektów...');
      const predictions = await this.model.detect(imageElement);
      
      const detectedObjects: DetectedObject[] = predictions.map(prediction => ({
        name: prediction.class,
        confidence: Math.round(prediction.score * 100),
        boundingBox: {
          x: prediction.bbox[0],
          y: prediction.bbox[1], 
          width: prediction.bbox[2],
          height: prediction.bbox[3]
        }
      }));
      
      console.log(`🎯 Znaleziono ${detectedObjects.length} obiektów:`, detectedObjects);
      return detectedObjects;
      
    } catch (error) {
      console.error('❌ Błąd detekcji obiektów:', error);
      return [];
    }
  }

  /**
   * 🧩 Analiza tekstu w poszukiwaniu nazw produktów
   */
  private analyzeTextForProduct(text: string): { productName?: string; category?: string; confidence: number } {
    const normalizedText = text.toLowerCase().trim();
    console.log('🔤 Analizuję tekst:', normalizedText);
    
    let bestMatch = { productName: undefined as string | undefined, category: undefined as string | undefined, confidence: 0 };
    
    // Przeszukaj słownik produktów
    for (const [, product] of Object.entries(PRODUCT_DICTIONARY)) {
      for (const keyword of product.keywords) {
        if (normalizedText.includes(keyword.toLowerCase())) {
          const confidence = Math.min(90, keyword.length * 10); // Dłuższe słowa = wyższa pewność
          console.log(`✅ Znaleziono: "${keyword}" -> ${product.name} (${confidence}%)`);
          
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              productName: product.name,
              category: product.category,
              confidence
            };
          }
        }
      }
    }
    
    return bestMatch;
  }

  /**
   * 🔄 Kombinowanie wyników z różnych źródeł
   */
  private combineResults(
    textAnalysis: { productName?: string; category?: string; confidence: number },
    detectedObjects: DetectedObject[],
    rawText: string
  ): ProductRecognitionResult {
    
    // Jeśli mamy dobry wynik z analizy tekstu, użyj go
    if (textAnalysis.confidence > 50 && textAnalysis.productName) {
      return {
        productName: textAnalysis.productName,
        category: textAnalysis.category,
        confidence: textAnalysis.confidence,
        recognitionMethod: 'text',
        rawText,
        detectedObjects
      };
    }
    
    // Sprawdź czy wykryte obiekty pasują do produktów spożywczych
    const foodObjects = detectedObjects.filter(obj => 
      ['banana', 'apple', 'orange', 'carrot', 'bottle', 'cup'].includes(obj.name.toLowerCase())
    );
    
    if (foodObjects.length > 0) {
      const bestObject = foodObjects.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      
      return {
        productName: this.mapObjectToProduct(bestObject.name),
        category: 'Inne',
        confidence: Math.min(bestObject.confidence, 75), // Obiekty mają niższą pewność
        recognitionMethod: 'image',
        rawText,
        detectedObjects
      };
    }
    
    // Jeśli nic nie znaleziono, zwróć pusty wynik
    return {
      confidence: 0,
      recognitionMethod: 'manual',
      rawText,
      detectedObjects
    };
  }

  /**
   * 🗺️ Mapowanie nazw obiektów COCO na polskie nazwy produktów
   */
  private mapObjectToProduct(objectName: string): string {
    const mapping: { [key: string]: string } = {
      'banana': 'Banan',
      'apple': 'Jabłko', 
      'orange': 'Pomarańcza',
      'carrot': 'Marchewka',
      'bottle': 'Butelka',
      'cup': 'Kubek'
    };
    
    return mapping[objectName.toLowerCase()] || objectName;
  }

  /**
   * 🖼️ Konwersja File na HTMLImageElement
   */
  private fileToImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Nie udało się załadować obrazu'));
      };
      
      img.src = url;
    });
  }

  /**
   * 📄 Skanowanie paragonu/faktury (mock implementation)
   */
  async scanReceipt(imageFile: File): Promise<ReceiptData> {
    // TO DO: Implementacja rzeczywistego skanowania paragonów
    // Na razie zwracamy przykładowe dane
    console.log('📄 Skanowanie paragonu...', imageFile.name);
    
    return {
      storeName: 'Przykładowy Sklep',
      date: new Date(),
      total: 25.50,
      items: [
        { name: 'Mleko', price: 3.50, quantity: 1, category: 'Nabiał' },
        { name: 'Chleb', price: 2.00, quantity: 2, category: 'Pieczywo' }
      ],
      confidence: 85
    };
  }
}

// Singleton instance
export const imageRecognitionService = new ImageRecognitionService();
export default imageRecognitionService;
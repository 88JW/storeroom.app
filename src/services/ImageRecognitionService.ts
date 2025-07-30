// 📸 Serwis rozpoznawania produktów z zdjęć i OCR

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
  private static readonly GOOGLE_VISION_API_KEY = process.env.VITE_GOOGLE_VISION_API_KEY;
  private static readonly OCR_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

  /**
   * 📸 Rozpoznaje produkty z przesłanego obrazu
   */
  static async recognizeProductFromImage(
    imageFile: File
  ): Promise<ProductRecognitionResult> {
    try {
      // 1. Upload obrazu do Firebase Storage (dla przyszłych potrzeb)
      // const imageUrl = await this.uploadImageToStorage(imageFile, userId);
      
      // 2. Konwertuj obraz do base64 dla API
      const base64Image = await this.fileToBase64(imageFile);
      
      // 3. Rozpoznawanie tekstu (OCR)
      const ocrResults = await this.performOCR(base64Image);
      
      // 4. Analiza rozpoznanego tekstu
      const productInfo = this.analyzeTextForProduct(ocrResults);
      
      // 5. Rozpoznawanie obiektów (jeśli dostępne)
      const objectResults = await this.detectObjects(base64Image);
      
      // 6. Połączenie wyników
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
      const base64Image = await this.fileToBase64(imageFile);
      const ocrResults = await this.performOCR(base64Image);
      
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
      const base64Image = await this.fileToBase64(imageFile);
      const ocrResults = await this.performOCR(base64Image);
      
      return this.findExpiryDateInText(ocrResults);
    } catch (error) {
      console.error('Błąd rozpoznawania daty:', error);
      return null;
    }
  }

  /**
   * 🔤 Wykonuje OCR na obrazie
   */
  private static async performOCR(base64Image: string): Promise<OCRResult[]> {
    if (!this.GOOGLE_VISION_API_KEY) {
      console.warn('Brak klucza Google Vision API - używam mock danych');
      return this.getMockOCRResults();
    }

    try {
      const response = await fetch(`${this.OCR_API_URL}?key=${this.GOOGLE_VISION_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: base64Image.split(',')[1] // Usuń prefix data:image/...
            },
            features: [
              { type: 'TEXT_DETECTION', maxResults: 50 },
              { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 50 }
            ]
          }]
        })
      });

      const data = await response.json();
      
      if (data.responses?.[0]?.textAnnotations) {
        return data.responses[0].textAnnotations.map((annotation: GoogleVisionTextAnnotation) => ({
          text: annotation.description,
          confidence: 0.9, // Google nie zawsze zwraca confidence
          boundingBox: {
            x: annotation.boundingPoly?.vertices?.[0]?.x || 0,
            y: annotation.boundingPoly?.vertices?.[0]?.y || 0,
            width: Math.abs((annotation.boundingPoly?.vertices?.[2]?.x || 0) - (annotation.boundingPoly?.vertices?.[0]?.x || 0)),
            height: Math.abs((annotation.boundingPoly?.vertices?.[2]?.y || 0) - (annotation.boundingPoly?.vertices?.[0]?.y || 0))
          }
        }));
      }

      return [];
    } catch (error) {
      console.error('Błąd OCR:', error);
      return this.getMockOCRResults();
    }
  }

  /**
   * 🎯 Rozpoznaje obiekty na obrazie
   */
  private static async detectObjects(base64Image: string): Promise<DetectedObject[]> {
    if (!this.GOOGLE_VISION_API_KEY) {
      return this.getMockObjectResults();
    }

    try {
      const response = await fetch(`${this.OCR_API_URL}?key=${this.GOOGLE_VISION_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: base64Image.split(',')[1]
            },
            features: [
              { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
              { type: 'LABEL_DETECTION', maxResults: 20 }
            ]
          }]
        })
      });

      const data = await response.json();
      const objects: DetectedObject[] = [];

      // Obiekty z lokalizacją
      if (data.responses?.[0]?.localizedObjectAnnotations) {
        data.responses[0].localizedObjectAnnotations.forEach((obj: GoogleVisionObjectAnnotation) => {
          objects.push({
            name: obj.name,
            confidence: obj.score,
            boundingBox: {
              x: (obj.boundingPoly?.normalizedVertices?.[0]?.x ?? 0) * 100,
              y: (obj.boundingPoly?.normalizedVertices?.[0]?.y ?? 0) * 100,
              width: ((obj.boundingPoly?.normalizedVertices?.[2]?.x ?? 0) - (obj.boundingPoly?.normalizedVertices?.[0]?.x ?? 0)) * 100,
              height: ((obj.boundingPoly?.normalizedVertices?.[2]?.y ?? 0) - (obj.boundingPoly?.normalizedVertices?.[0]?.y ?? 0)) * 100
            }
          });
        });
      }

      // Etykiety bez lokalizacji
      if (data.responses?.[0]?.labelAnnotations) {
        data.responses[0].labelAnnotations.forEach((label: GoogleVisionLabelAnnotation) => {
          objects.push({
            name: label.description,
            confidence: label.score,
            boundingBox: { x: 0, y: 0, width: 100, height: 100 }
          });
        });
      }

      return objects;
    } catch (error) {
      console.error('Błąd rozpoznawania obiektów:', error);
      return this.getMockObjectResults();
    }
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
   *  Konwertuje plik do base64
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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

  /**
   * 🎭 Mock dane OCR dla testów
   */
  private static getMockOCRResults(): OCRResult[] {
    return [
      {
        text: 'MLEKO UHT 3.2%',
        confidence: 0.95,
        boundingBox: { x: 10, y: 20, width: 200, height: 30 }
      },
      {
        text: 'Najlepsze przed: 15.08.2025',
        confidence: 0.88,
        boundingBox: { x: 10, y: 60, width: 180, height: 25 }
      },
      {
        text: 'MLEKPOL',
        confidence: 0.92,
        boundingBox: { x: 10, y: 100, width: 120, height: 35 }
      }
    ];
  }

  /**
   * 🎭 Mock dane rozpoznawania obiektów
   */
  private static getMockObjectResults(): DetectedObject[] {
    return [
      {
        name: 'Milk',
        confidence: 0.89,
        boundingBox: { x: 20, y: 30, width: 60, height: 80 }
      },
      {
        name: 'Food',
        confidence: 0.75,
        boundingBox: { x: 15, y: 25, width: 70, height: 90 }
      }
    ];
  }
}

export default ImageRecognitionService;

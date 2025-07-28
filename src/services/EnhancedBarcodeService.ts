// 📱 Rozszerzony service dla kodów kreskowych z wieloma źródłami

interface ProductFormData {
  nazwa: string;
  kategoria: string;
  marka?: string;
}

interface ProductData {
  nazwa: string;
  kategoria: string;
  marka?: string;
  znaleziony: boolean;
  źródło?: string;
}

class MultiSourceBarcodeService {
  private readonly OPENFOODFACTS_URL = 'https://world.openfoodfacts.org/api/v0/product';
  private readonly BARCODE_LOOKUP_URL = 'https://api.barcodelookup.com/v3/products';
  private readonly UPC_DATABASE_URL = 'https://api.upcitemdb.com/prod/trial/lookup';
  
  // API Keys (dodaj swoje klucze)
  private readonly BARCODE_LOOKUP_KEY = typeof process !== 'undefined' ? process.env.REACT_APP_BARCODE_LOOKUP_KEY : undefined;
  private readonly UPC_DATABASE_KEY = typeof process !== 'undefined' ? process.env.REACT_APP_UPC_DATABASE_KEY : undefined;

  // Lokalna baza produktów (może być w localStorage lub Firestore)
  private customDatabase: Map<string, ProductData> = new Map([
    // Przykładowe produkty z Rossmana/chemii
    ['4305615418636', { nazwa: 'Domestos Płyn do WC', kategoria: 'CHEMIA', marka: 'Domestos', znaleziony: true, źródło: 'custom' }],
    ['5900627041962', { nazwa: 'Ludwik Płyn do naczyń', kategoria: 'CHEMIA', marka: 'Ludwik', znaleziony: true, źródło: 'custom' }],
    ['5901234567890', { nazwa: 'Ariel Proszek do prania', kategoria: 'CHEMIA', marka: 'Ariel', znaleziony: true, źródło: 'custom' }],
  ]);

  /**
   * Główna metoda - próbuje różnych źródeł po kolei
   */
  async getProductData(barcode: string): Promise<ProductData> {
    console.log(`🔍 BarcodeService: Szukanie produktu dla kodu: ${barcode}`);

    try {
      // 1. Sprawdź lokalną bazę (najszybsze)
      const customResult = this.getFromCustomDatabase(barcode);
      if (customResult.znaleziony) {
        console.log('✅ Znaleziono w lokalnej bazie:', customResult);
        return customResult;
      }

      // 2. OpenFoodFacts (darmowe, głównie żywność)
      const openFoodResult = await this.getFromOpenFoodFacts(barcode);
      if (openFoodResult.znaleziony) {
        console.log('✅ Znaleziono w OpenFoodFacts:', openFoodResult);
        return openFoodResult;
      }

      // 3. Barcode Lookup (płatne, ale szeroka baza)
      if (this.BARCODE_LOOKUP_KEY) {
        const barcodeLookupResult = await this.getFromBarcodeLookup(barcode);
        if (barcodeLookupResult.znaleziony) {
          console.log('✅ Znaleziono w Barcode Lookup:', barcodeLookupResult);
          return barcodeLookupResult;
        }
      }

      // 4. UPC Database (darmowe z limitami)
      if (this.UPC_DATABASE_KEY) {
        const upcResult = await this.getFromUPCDatabase(barcode);
        if (upcResult.znaleziony) {
          console.log('✅ Znaleziono w UPC Database:', upcResult);
          return upcResult;
        }
      }

      // 5. Fallback - nie znaleziono nigdzie
      console.log('❌ Nie znaleziono produktu w żadnej bazie');
      return {
        nazwa: `Nieznany produkt (${barcode})`,
        kategoria: 'INNE',
        znaleziony: false,
        źródło: 'fallback'
      };

    } catch (error) {
      console.error('❌ Błąd podczas wyszukiwania produktu:', error);
      return {
        nazwa: `Produkt ${barcode}`,
        kategoria: 'INNE',
        znaleziony: false,
        źródło: 'error'
      };
    }
  }

  /**
   * Lokalna baza danych
   */
  private getFromCustomDatabase(barcode: string): ProductData {
    const product = this.customDatabase.get(barcode);
    if (product) {
      return { ...product, źródło: 'custom' };
    }
    return { nazwa: '', kategoria: '', znaleziony: false };
  }

  /**
   * OpenFoodFacts API (istniejące)
   */
  private async getFromOpenFoodFacts(barcode: string): Promise<ProductData> {
    try {
      const response = await fetch(`${this.OPENFOODFACTS_URL}/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        return {
          nazwa: product.product_name || `Produkt ${barcode}`,
          kategoria: this.mapCategory(product.categories || ''),
          marka: product.brands || undefined,
          znaleziony: true,
          źródło: 'openfoodfacts'
        };
      }
    } catch (error) {
      console.error('Błąd OpenFoodFacts:', error);
    }
    return { nazwa: '', kategoria: '', znaleziony: false };
  }

  /**
   * Barcode Lookup API
   */
  private async getFromBarcodeLookup(barcode: string): Promise<ProductData> {
    try {
      const response = await fetch(`${this.BARCODE_LOOKUP_URL}?barcode=${barcode}&formatted=y&key=${this.BARCODE_LOOKUP_KEY}`);
      const data = await response.json();

      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        return {
          nazwa: product.title || product.product_name || `Produkt ${barcode}`,
          kategoria: this.mapCategoryFromDescription(product.category || product.description || ''),
          marka: product.brand || product.manufacturer || undefined,
          znaleziony: true,
          źródło: 'barcode-lookup'
        };
      }
    } catch (error) {
      console.error('Błąd Barcode Lookup:', error);
    }
    return { nazwa: '', kategoria: '', znaleziony: false };
  }

  /**
   * UPC Database API
   */
  private async getFromUPCDatabase(barcode: string): Promise<ProductData> {
    try {
      const response = await fetch(`${this.UPC_DATABASE_URL}?upc=${barcode}&key=${this.UPC_DATABASE_KEY}`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const product = data.items[0];
        return {
          nazwa: product.title || `Produkt ${barcode}`,
          kategoria: this.mapCategoryFromDescription(product.category || ''),
          marka: product.brand || undefined,
          znaleziony: true,
          źródło: 'upc-database'
        };
      }
    } catch (error) {
      console.error('Błąd UPC Database:', error);
    }
    return { nazwa: '', kategoria: '', znaleziony: false };
  }

  /**
   * Mapowanie kategorii OpenFoodFacts
   */
  private mapCategory(categories: string): string {
    const lowerCategories = categories.toLowerCase();
    
    // Mapowanie kategorii z OpenFoodFacts na polskie klucze
    if (lowerCategories.includes('dairy') || lowerCategories.includes('milk') || lowerCategories.includes('cheese')) {
      return 'NABIAŁ';
    }
    if (lowerCategories.includes('meat') || lowerCategories.includes('fish') || lowerCategories.includes('poultry')) {
      return 'MIĘSO';
    }
    if (lowerCategories.includes('vegetable') || lowerCategories.includes('fruit')) {
      return 'WARZYWA_OWOCE';
    }
    if (lowerCategories.includes('bread') || lowerCategories.includes('cereal') || lowerCategories.includes('pasta')) {
      return 'PIECZYWO';
    }
    if (lowerCategories.includes('sweet') || lowerCategories.includes('chocolate') || lowerCategories.includes('candy')) {
      return 'SŁODYCZE';
    }
    if (lowerCategories.includes('beverage') || lowerCategories.includes('drink') || lowerCategories.includes('water')) {
      return 'NAPOJE';
    }
    
    return 'INNE';
  }

  /**
   * Mapowanie kategorii z opisów produktów (dla innych API)
   */
  private mapCategoryFromDescription(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    // Chemia domowa
    if (lowerDesc.includes('cleaning') || lowerDesc.includes('detergent') || 
        lowerDesc.includes('płyn') || lowerDesc.includes('proszek') ||
        lowerDesc.includes('soap') || lowerDesc.includes('sanitizer')) {
      return 'CHEMIA';
    }
    
    // Kosmetyki
    if (lowerDesc.includes('cosmetic') || lowerDesc.includes('shampoo') || 
        lowerDesc.includes('cream') || lowerDesc.includes('lotion')) {
      return 'KOSMETYKI';
    }
    
    // Żywność - używamy istniejącego mapowania
    return this.mapCategory(description);
  }

  /**
   * Dodanie produktu do lokalnej bazy (crowdsourcing)
   */
  async addToCustomDatabase(barcode: string, productData: Partial<ProductFormData>): Promise<void> {
    if (productData.nazwa && productData.kategoria) {
      const customProduct: ProductData = {
        nazwa: productData.nazwa,
        kategoria: productData.kategoria,
        marka: productData.marka,
        znaleziony: true,
        źródło: 'user-added'
      };
      
      this.customDatabase.set(barcode, customProduct);
      
      // TODO: Zapisz do localStorage lub Firestore
      localStorage.setItem('customBarcodeDatabase', JSON.stringify(Array.from(this.customDatabase.entries())));
      
      console.log(`✅ Dodano produkt ${barcode} do lokalnej bazy:`, customProduct);
    }
  }

  /**
   * Załaduj lokalną bazę z localStorage
   */
  loadCustomDatabase(): void {
    try {
      const stored = localStorage.getItem('customBarcodeDatabase');
      if (stored) {
        const entries = JSON.parse(stored);
        this.customDatabase = new Map(entries);
        console.log(`📦 Załadowano ${this.customDatabase.size} produktów z lokalnej bazy`);
      }
    } catch (error) {
      console.error('Błąd ładowania lokalnej bazy:', error);
    }
  }
}

// Eksportuj singleton
export const EnhancedBarcodeService = new MultiSourceBarcodeService();

// Załaduj lokalną bazę przy starcie
EnhancedBarcodeService.loadCustomDatabase();

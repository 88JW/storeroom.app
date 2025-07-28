// 📱 Serwis do obsługi kodów kreskowych z 4-źródłowym pobieraniem danych
// Kolejność: Barcode Lookup (komercyjna) → OpenFoodFacts (żywność) → 
// OpenBeautyFacts (kosmetyki) → OpenProductsFacts (chemia domowa)

export interface ProduktZKoduKreskowego {
  znaleziony: boolean;
  nazwa: string;
  kategoria: string;
  marka?: string;
  źródło?: string;
}

export class MultiSourceBarcodeService {
  
  // 🍎 OpenFoodFacts API - żywność
  private async getFromOpenFoodFacts(barcode: string): Promise<ProduktZKoduKreskowego | null> {
    try {
      const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
      console.log('🍎 Sprawdzanie OpenFoodFacts:', url);
      
      const response = await fetch(url);
      console.log('🍎 Response status:', response.status);
      
      if (!response.ok) {
        console.log('🍎 Response not ok:', response.statusText);
        return null;
      }
      
      const data = await response.json();
      console.log('🍎 Response data:', data);
      
      if (data && data.product && data.product.product_name) {
        const product = data.product;
        console.log('🍎 Found product:', product.product_name);
        
        // Mapowanie kategorii OpenFoodFacts na nasze kategorie
        let kategoria = 'INNE';
        const categories = product.categories?.toLowerCase() || '';
        
        if (categories.includes('dairy') || categories.includes('nabiał') || categories.includes('milk') || categories.includes('cheese')) {
          kategoria = 'NABIAŁ';
        } else if (categories.includes('meat') || categories.includes('mięso') || categories.includes('fish') || categories.includes('ryby')) {
          kategoria = 'MIĘSO';
        } else if (categories.includes('vegetable') || categories.includes('warzywa')) {
          kategoria = 'WARZYWA';
        } else if (categories.includes('fruit') || categories.includes('owoce')) {
          kategoria = 'OWOCE';
        } else if (categories.includes('beverage') || categories.includes('drink') || categories.includes('napoje')) {
          kategoria = 'NAPOJE';
        } else if (categories.includes('bread') || categories.includes('pieczywo') || categories.includes('bakery')) {
          kategoria = 'PIECZYWO';
        } else if (categories.includes('candy') || categories.includes('chocolate') || categories.includes('słodycze')) {
          kategoria = 'SŁODYCZE';
        } else if (categories.includes('spice') || categories.includes('przyprawy') || categories.includes('sauce')) {
          kategoria = 'PRZYPRAWY';
        }
        
        const result = {
          znaleziony: true,
          nazwa: product.product_name,
          kategoria,
          marka: product.brands?.split(',')[0]?.trim(),
          źródło: 'OpenFoodFacts'
        };
        console.log('🍎 Returning result:', result);
        return result;
      } else {
        console.log('🍎 No product found in response');
      }
      
      return null;
    } catch (error) {
      console.log('❌ Błąd OpenFoodFacts:', error);
      return null;
    }
  }

  // 💄 OpenBeautyFacts API - kosmetyki
  private async getFromOpenBeautyFacts(barcode: string): Promise<ProduktZKoduKreskowego | null> {
    try {
      const url = `https://world.openbeautyfacts.org/api/v2/product/${barcode}.json`;
      console.log('💄 Sprawdzanie OpenBeautyFacts:', url);
      
      const response = await fetch(url);
      console.log('💄 Response status:', response.status);
      
      if (!response.ok) {
        console.log('💄 Response not ok:', response.statusText);
        return null;
      }
      
      const data = await response.json();
      console.log('💄 Response data:', data);
      
      if (data && data.product && data.product.product_name) {
        const product = data.product;
        console.log('💄 Found product:', product.product_name);
        
        const result = {
          znaleziony: true,
          nazwa: product.product_name,
          kategoria: 'KOSMETYKI',
          marka: product.brands?.split(',')[0]?.trim(),
          źródło: 'OpenBeautyFacts'
        };
        console.log('💄 Returning result:', result);
        return result;
      } else {
        console.log('💄 No product found in response');
      }
      
      return null;
    } catch (error) {
      console.log('❌ Błąd OpenBeautyFacts:', error);
      return null;
    }
  }

  // 🧽 OpenProductsFacts API - chemia domowa
  private async getFromOpenProductsFacts(barcode: string): Promise<ProduktZKoduKreskowego | null> {
    try {
      const url = `https://world.openproductsfacts.org/api/v2/product/${barcode}.json`;
      console.log('🧽 Sprawdzanie OpenProductsFacts:', url);
      
      const response = await fetch(url);
      console.log('🧽 Response status:', response.status);
      
      if (!response.ok) {
        console.log('🧽 Response not ok:', response.statusText);
        return null;
      }
      
      const data = await response.json();
      console.log('🧽 Response data:', data);
      
      if (data && data.product && data.product.product_name) {
        const product = data.product;
        console.log('🧽 Found product:', product.product_name);
        
        const result = {
          znaleziony: true,
          nazwa: product.product_name,
          kategoria: 'CHEMIA',
          marka: product.brands?.split(',')[0]?.trim(),
          źródło: 'OpenProductsFacts'
        };
        console.log('🧽 Returning result:', result);
        return result;
      } else {
        console.log('🧽 No product found in response');
      }
      
      return null;
    } catch (error) {
      console.log('❌ Błąd OpenProductsFacts:', error);
      return null;
    }
  }

  // 🏪 Barcode Lookup API - komercyjna baza z szerokim pokryciem
  private async getFromBarcodeLookup(barcode: string): Promise<ProduktZKoduKreskowego | null> {
    try {
      // Używamy demo key - w produkcji należy uzyskać własny klucz API
      const url = `https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=demo`;
      console.log('🏪 Sprawdzanie Barcode Lookup:', url);
      
      const response = await fetch(url);
      console.log('🏪 Response status:', response.status);
      
      if (!response.ok) {
        console.log('🏪 Response not ok:', response.statusText);
        return null;
      }
      
      const data = await response.json();
      console.log('🏪 Response data:', data);
      
      if (data && data.products && data.products.length > 0) {
        const product = data.products[0];
        console.log('🏪 Found product:', product.product_name);
        
        // Mapowanie kategorii Barcode Lookup na nasze kategorie
        let kategoria = 'INNE';
        const category = product.category?.toLowerCase() || '';
        const title = product.title?.toLowerCase() || '';
        
        if (category.includes('food') || category.includes('grocery') || title.includes('food')) {
          // Dodatkowe mapowanie dla żywności
          if (title.includes('milk') || title.includes('cheese') || title.includes('dairy')) {
            kategoria = 'NABIAŁ';
          } else if (title.includes('meat') || title.includes('chicken') || title.includes('beef')) {
            kategoria = 'MIĘSO';
          } else if (title.includes('fruit') || title.includes('apple') || title.includes('banana')) {
            kategoria = 'OWOCE';
          } else if (title.includes('vegetable') || title.includes('carrot') || title.includes('potato')) {
            kategoria = 'WARZYWA';
          } else if (title.includes('bread') || title.includes('bakery')) {
            kategoria = 'PIECZYWO';
          } else if (title.includes('candy') || title.includes('chocolate') || title.includes('sweet')) {
            kategoria = 'SŁODYCZE';
          } else if (title.includes('drink') || title.includes('juice') || title.includes('soda')) {
            kategoria = 'NAPOJE';
          } else {
            kategoria = 'ŻYWNOŚĆ';
          }
        } else if (category.includes('beauty') || category.includes('cosmetic') || category.includes('personal care')) {
          kategoria = 'KOSMETYKI';
        } else if (category.includes('cleaning') || category.includes('household') || title.includes('detergent')) {
          kategoria = 'CHEMIA';
        } else if (category.includes('health') || category.includes('pharmacy')) {
          kategoria = 'ZDROWIE';
        }
        
        const result = {
          znaleziony: true,
          nazwa: product.title || product.product_name,
          kategoria,
          marka: product.brand || product.manufacturer,
          źródło: 'Barcode Lookup'
        };
        console.log('🏪 Returning result:', result);
        return result;
      } else {
        console.log('🏪 No product found in response');
      }
      
      return null;
    } catch (error) {
      console.log('❌ Błąd Barcode Lookup:', error);
      return null;
    }
  }

  // 🔍 Główna metoda - sprawdza wszystkie źródła w kolejności
  async getProductData(barcode: string): Promise<ProduktZKoduKreskowego> {
    console.log('🔍 MultiSourceBarcodeService: Szukanie produktu dla kodu:', barcode);
    console.log('🔍 Timestamp:', new Date().toISOString());
    
    // Próbujemy wszystkie źródła w kolejności (komercyjna baza pierwsza)
    const sources = [
      { name: 'Barcode Lookup', fn: () => this.getFromBarcodeLookup(barcode) },
      { name: 'OpenFoodFacts', fn: () => this.getFromOpenFoodFacts(barcode) },
      { name: 'OpenBeautyFacts', fn: () => this.getFromOpenBeautyFacts(barcode) },
      { name: 'OpenProductsFacts', fn: () => this.getFromOpenProductsFacts(barcode) }
    ];
    
    for (const source of sources) {
      console.log(`🔍 Próbuję ${source.name}...`);
      try {
        const result = await source.fn();
        if (result) {
          console.log('✅ Znaleziono produkt w:', result.źródło);
          console.log('✅ Dane produktu:', result);
          return result;
        } else {
          console.log(`❌ Nie znaleziono w ${source.name}`);
        }
      } catch (error) {
        console.error(`❌ Błąd w ${source.name}:`, error);
      }
    }
    
    console.log('❌ Nie znaleziono produktu w żadnym źródle');
    const fallbackResult = {
      znaleziony: false,
      nazwa: `Nieznany produkt (${barcode})`,
      kategoria: 'INNE'
    };
    console.log('❌ Zwracam fallback:', fallbackResult);
    return fallbackResult;
  }
}

// Eksportujemy też alias dla kompatybilności wstecznej
export const BarcodeService = MultiSourceBarcodeService;

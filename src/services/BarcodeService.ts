// 📱 Serwis do obsługi kodów kreskowych z wieloźródłowym pobieraniem danych
// Obsługuje OpenFoodFacts, OpenBeautyFacts i OpenProductsFacts

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

  // 🔍 Główna metoda - sprawdza wszystkie źródła w kolejności
  async getProductData(barcode: string): Promise<ProduktZKoduKreskowego> {
    console.log('🔍 MultiSourceBarcodeService: Szukanie produktu dla kodu:', barcode);
    console.log('🔍 Timestamp:', new Date().toISOString());
    
    // Próbujemy wszystkie źródła w kolejności
    const sources = [
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

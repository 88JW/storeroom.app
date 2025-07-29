// 🧪 Serwis do tworzenia testowych danych alertów

import { Timestamp } from 'firebase/firestore';
import { ProduktService } from './ProduktService';

export class TestDataService {
  
  // 🎯 Tworzy przykładowe produkty z różnymi datami ważności
  static async createTestExpiryProducts(spizarniaId: string, userId: string) {
    console.log('🧪 Tworzenie testowych produktów z alertami...');
    
    const today = new Date();
    
    // Produkty przeterminowane (2 produkty)
    const expiredProducts = [
      {
        nazwa: 'Przeterminowane mleko',
        kategoria: 'NABIAŁ',
        podkategoria: 'Mleko',
        ilość: 1,
        jednostka: 'l' as const,
        dataWażności: Timestamp.fromDate(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)), // 3 dni temu
        lokalizacja: 'default-0-' + Date.now(),
        status: 'dostępny' as const,
        notatki: 'Testowy produkt - przeterminowany'
      },
      {
        nazwa: 'Stary jogurt',
        kategoria: 'NABIAŁ',
        podkategoria: 'Jogurt',
        ilość: 2,
        jednostka: 'szt' as const,
        dataWażności: Timestamp.fromDate(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)), // 1 dzień temu
        lokalizacja: 'default-0-' + Date.now(),
        status: 'dostępny' as const,
        notatki: 'Testowy produkt - przeterminowany'
      }
    ];

    // Produkty wygasające w ciągu 0-2 dni (3 produkty)
    const expiringProducts = [
      {
        nazwa: 'Chleb wygasający dziś',
        kategoria: 'PIECZYWO',
        podkategoria: 'Chleb',
        ilość: 1,
        jednostka: 'szt' as const,
        dataWażności: Timestamp.fromDate(today), // dziś
        lokalizacja: 'default-2-' + Date.now(),
        status: 'dostępny' as const,
        notatki: 'Testowy produkt - wygasa dziś'
      },
      {
        nazwa: 'Ser wygasający jutro',
        kategoria: 'NABIAŁ',
        podkategoria: 'Ser',
        ilość: 200,
        jednostka: 'g' as const,
        dataWażności: Timestamp.fromDate(new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)), // jutro
        lokalizacja: 'default-0-' + Date.now(),
        status: 'dostępny' as const,
        notatki: 'Testowy produkt - wygasa jutro'
      },
      {
        nazwa: 'Masło za 2 dni',
        kategoria: 'NABIAŁ',
        podkategoria: 'Masło',
        ilość: 1,
        jednostka: 'szt' as const,
        dataWażności: Timestamp.fromDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)), // za 2 dni
        lokalizacja: 'default-0-' + Date.now(),
        status: 'dostępny' as const,
        notatki: 'Testowy produkt - wygasa za 2 dni'
      }
    ];

    // Produkty wygasające w ciągu 3-7 dni (4 produkty)
    const soonExpiringProducts = [
      {
        nazwa: 'Bułki za 3 dni',
        kategoria: 'PIECZYWO',
        podkategoria: 'Bułki',
        ilość: 6,
        jednostka: 'szt' as const,
        dataWażności: Timestamp.fromDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)), // za 3 dni
        lokalizacja: 'default-2-' + Date.now(),
        status: 'dostępny' as const,
        notatki: 'Testowy produkt - niedługo wygasa'
      },
      {
        nazwa: 'Śmietana za 5 dni',
        kategoria: 'NABIAŁ',
        podkategoria: 'Śmietana',
        ilość: 500,
        jednostka: 'ml' as const,
        dataWażności: Timestamp.fromDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)), // za 5 dni
        lokalizacja: 'default-0-' + Date.now(),
        status: 'dostępny' as const,
        notatki: 'Testowy produkt - niedługo wygasa'
      },
      {
        nazwa: 'Warzywa za 6 dni',
        kategoria: 'WARZYWA',
        podkategoria: 'Warzywa świeże',
        ilość: 1,
        jednostka: 'kg' as const,
        dataWażności: Timestamp.fromDate(new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)), // za 6 dni
        lokalizacja: 'default-0-' + Date.now(),
        status: 'dostępny' as const,
        notatki: 'Testowy produkt - niedługo wygasa'
      },
      {
        nazwa: 'Owoce za tydzień',
        kategoria: 'OWOCE',
        podkategoria: 'Owoce świeże',
        ilość: 2,
        jednostka: 'kg' as const,
        dataWażności: Timestamp.fromDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)), // za 7 dni
        lokalizacja: 'default-0-' + Date.now(),
        status: 'dostępny' as const,
        notatki: 'Testowy produkt - niedługo wygasa'
      }
    ];

    try {
      const allProducts = [...expiredProducts, ...expiringProducts, ...soonExpiringProducts];
      
      console.log(`🧪 Dodawanie ${allProducts.length} testowych produktów...`);
      
      for (const productData of allProducts) {
        await ProduktService.addProdukt(spizarniaId, userId, productData);
        console.log(`✅ Dodano: ${productData.nazwa}`);
      }
      
      console.log('🎉 Wszystkie testowe produkty zostały dodane!');
      
      return {
        expired: expiredProducts.length,
        expiring: expiringProducts.length,
        soonExpiring: soonExpiringProducts.length,
        total: allProducts.length
      };
      
    } catch (error) {
      console.error('❌ Błąd dodawania testowych produktów:', error);
      throw error;
    }
  }

  // 🧹 Usuwa wszystkie testowe produkty
  static async clearTestData(spizarniaId: string, userId: string) {
    console.log('🧹 Usuwanie testowych produktów...');
    
    try {
      // Pobierz wszystkie produkty
      const produkty = await ProduktService.getProdukty(spizarniaId, userId);
      
      // Znajdź produkty testowe (po notatce)
      const testProducts = produkty.filter(p => 
        p.notatki?.includes('Testowy produkt')
      );
      
      console.log(`🧹 Znaleziono ${testProducts.length} testowych produktów do usunięcia`);
      
      for (const product of testProducts) {
        await ProduktService.deleteProdukt(spizarniaId, userId, product.id);
        console.log(`🗑️ Usunięto: ${product.nazwa}`);
      }
      
      console.log('🎉 Wszystkie testowe produkty zostały usunięte!');
      return testProducts.length;
      
    } catch (error) {
      console.error('❌ Błąd usuwania testowych produktów:', error);
      throw error;
    }
  }
}

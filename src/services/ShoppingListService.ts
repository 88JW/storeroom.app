// 🛒 System inteligentnej listy zakupów

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface ShoppingListItem {
  id?: string;
  userId: string;
  spizarniaId: string;
  productName: string;
  quantity: number;
  unit: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  addedBy: 'user' | 'system' | 'suggestion';
  reason?: 'low_stock' | 'expired' | 'recipe' | 'manual';
  estimatedPrice?: number;
  notes?: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  store?: string;
  aisle?: string; // Alejka w sklepie
}

export interface ShoppingList {
  id?: string;
  userId: string;
  spizarniaId: string;
  name: string;
  items: ShoppingListItem[];
  totalEstimatedCost: number;
  completed: boolean;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  sharedWith?: string[]; // ID innych użytkowników
}

export interface ProductSuggestion {
  productName: string;
  confidence: number; // 0-1, jak pewna jest sugestia
  reason: 'purchase_history' | 'seasonal' | 'complementary' | 'popular';
  category: string;
  estimatedPrice: number;
  lastPurchased?: Date;
  frequency: number; // jak często kupowany
}

export class ShoppingListService {
  
  /**
   * 🛒 Tworzy nową listę zakupów
   */
  static async createShoppingList(
    userId: string, 
    spizarniaId: string, 
    name: string = 'Lista zakupów'
  ): Promise<string> {
    const newList: Omit<ShoppingList, 'id'> = {
      userId,
      spizarniaId,
      name,
      items: [],
      totalEstimatedCost: 0,
      completed: false,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'shopping_lists'), newList);
    return docRef.id;
  }

  /**
   * ➕ Dodaje element do listy zakupów
   */
  static async addItemToList(
    listId: string,
    item: Omit<ShoppingListItem, 'id' | 'createdAt'>
  ): Promise<string> {
    const newItem: Omit<ShoppingListItem, 'id'> = {
      ...item,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'shopping_list_items'), {
      ...newItem,
      listId
    });
    
    return docRef.id;
  }

  /**
   * 📋 Pobiera listę zakupów użytkownika
   */
  static async getUserShoppingLists(userId: string): Promise<ShoppingList[]> {
    const listsRef = collection(db, 'shopping_lists');
    const q = query(
      listsRef,
      where('userId', '==', userId),
      where('completed', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const lists: ShoppingList[] = [];
    
    for (const listDoc of snapshot.docs) {
      const listData = { id: listDoc.id, ...listDoc.data() } as ShoppingList;
      
      // Pobierz elementy listy
      const itemsRef = collection(db, 'shopping_list_items');
      const itemsQuery = query(itemsRef, where('listId', '==', listDoc.id));
      const itemsSnapshot = await getDocs(itemsQuery);
      
      listData.items = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ShoppingListItem[];
      
      // Oblicz całkowity koszt
      listData.totalEstimatedCost = listData.items.reduce(
        (sum, item) => sum + (item.estimatedPrice || 0) * item.quantity, 
        0
      );
      
      lists.push(listData);
    }
    
    return lists;
  }

  /**
   * ✅ Oznacza element jako kupiony
   */
  static async markItemCompleted(itemId: string): Promise<void> {
    const itemRef = doc(db, 'shopping_list_items', itemId);
    await updateDoc(itemRef, {
      completed: true,
      completedAt: Timestamp.now()
    });
  }

  /**
   * ❌ Usuwa element z listy
   */
  static async removeItem(itemId: string): Promise<void> {
    const itemRef = doc(db, 'shopping_list_items', itemId);
    await deleteDoc(itemRef);
  }

  /**
   * 🤖 Generuje inteligentne sugestie zakupów
   */
  static async generateSmartSuggestions(
    userId: string, 
    spizarniaId: string
  ): Promise<ProductSuggestion[]> {
    try {
      const suggestions: ProductSuggestion[] = [];
      
      // 1. Sugestie na podstawie historii zakupów
      const historyBasedSuggestions = await this.getHistoryBasedSuggestions(userId, spizarniaId);
      suggestions.push(...historyBasedSuggestions);
      
      // 2. Sugestie sezonowe
      const seasonalSuggestions = this.getSeasonalSuggestions();
      suggestions.push(...seasonalSuggestions);
      
      // 3. Sugestie komplementarne (do produktów w spiżarni)
      const complementarySuggestions = await this.getComplementarySuggestions(userId, spizarniaId);
      suggestions.push(...complementarySuggestions);
      
      // 4. Popularne produkty
      const popularSuggestions = this.getPopularSuggestions();
      suggestions.push(...popularSuggestions);
      
      // Sortuj po pewności sugestii
      return suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10); // Top 10 sugestii
        
    } catch (error) {
      console.error('Błąd generowania sugestii:', error);
      return [];
    }
  }

  /**
   * 📊 Sugestie na podstawie historii
   */
  private static async getHistoryBasedSuggestions(
    userId: string, 
    spizarniaId: string
  ): Promise<ProductSuggestion[]> {
    // TODO: Analiza historii dodawanych produktów
    // Sprawdź jakie produkty użytkownik najczęściej dodaje
    
    const mockHistory = [
      { name: 'Mleko', frequency: 15, lastPurchased: new Date('2025-01-20') },
      { name: 'Chleb', frequency: 12, lastPurchased: new Date('2025-01-25') },
      { name: 'Jajka', frequency: 10, lastPurchased: new Date('2025-01-22') },
      { name: 'Masło', frequency: 8, lastPurchased: new Date('2025-01-18') }
    ];

    return mockHistory.map(item => {
      const daysSinceLastPurchase = Math.floor(
        (Date.now() - item.lastPurchased.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        productName: item.name,
        confidence: Math.max(0.3, 1 - (daysSinceLastPurchase / 30)), // Mniejsza pewność po czasie
        reason: 'purchase_history' as const,
        category: this.getCategoryForProduct(item.name),
        estimatedPrice: this.getEstimatedPrice(item.name),
        lastPurchased: item.lastPurchased,
        frequency: item.frequency
      };
    });
  }

  /**
   * 🌸 Sugestie sezonowe
   */
  private static getSeasonalSuggestions(): ProductSuggestion[] {
    const currentMonth = new Date().getMonth();
    const seasonalProducts: Record<number, string[]> = {
      0: ['Mandarynki', 'Pomarańcze', 'Kapusta'],  // Styczeń
      1: ['Jabłka', 'Gruszki', 'Marchew'],         // Luty
      2: ['Szpinak', 'Sałata', 'Rzodkiewka'],      // Marzec
      3: ['Szparagi', 'Rabarbara', 'Szczypiorek'], // Kwiecień
      4: ['Truskawki', 'Młode ziemniaki'],         // Maj
      5: ['Czereśnie', 'Wiśnie', 'Ogórki'],        // Czerwiec
      6: ['Pomidory', 'Papryka', 'Cukinia'],       // Lipiec
      7: ['Brzoskwinie', 'Śliwki', 'Kukurydza'],   // Sierpień
      8: ['Jabłka', 'Gruszki', 'Dynia'],           // Wrzesień
      9: ['Dynia', 'Kapusta', 'Brukselka'],        // Październik
      10: ['Pomarańcze', 'Mandarynki', 'Kapusta'], // Listopad
      11: ['Mandarynki', 'Orzechy', 'Żurawina']    // Grudzień
    };

    const currentSeasonProducts = seasonalProducts[currentMonth] || [];
    
    return currentSeasonProducts.map(product => ({
      productName: product,
      confidence: 0.7,
      reason: 'seasonal' as const,
      category: this.getCategoryForProduct(product),
      estimatedPrice: this.getEstimatedPrice(product),
      frequency: 0
    }));
  }

  /**
   * 🔗 Sugestie komplementarne
   */
  private static async getComplementarySuggestions(
    userId: string, 
    spizarniaId: string
  ): Promise<ProductSuggestion[]> {
    // TODO: Sprawdź co jest w spiżarni i zasugeruj komplementarne produkty
    
    const complementaryPairs: Record<string, string[]> = {
      'Mleko': ['Płatki śniadaniowe', 'Kakao', 'Kawa'],
      'Jajka': ['Boczek', 'Ser', 'Masło'],
      'Chleb': ['Masło', 'Dżem', 'Szynka'],
      'Makaron': ['Sos pomidorowy', 'Parmezan', 'Bazylia'],
      'Ryż': ['Sos sojowy', 'Warzywa', 'Kurczak']
    };

    // Mock - sprawdź co jest w spiżarni
    const currentProducts = ['Mleko', 'Jajka']; // TODO: Pobierz z bazy
    
    const suggestions: ProductSuggestion[] = [];
    
    currentProducts.forEach(product => {
      const complements = complementaryPairs[product] || [];
      complements.forEach(complement => {
        suggestions.push({
          productName: complement,
          confidence: 0.6,
          reason: 'complementary',
          category: this.getCategoryForProduct(complement),
          estimatedPrice: this.getEstimatedPrice(complement),
          frequency: 0
        });
      });
    });

    return suggestions;
  }

  /**
   * ⭐ Sugestie popularnych produktów
   */
  private static getPopularSuggestions(): ProductSuggestion[] {
    const popularProducts = [
      'Banany', 'Jabłka', 'Pomidory', 'Ogórki', 'Cebula', 
      'Czosnek', 'Ziemniaki', 'Marchew', 'Papryka'
    ];

    return popularProducts.map(product => ({
      productName: product,
      confidence: 0.4,
      reason: 'popular' as const,
      category: this.getCategoryForProduct(product),
      estimatedPrice: this.getEstimatedPrice(product),
      frequency: 0
    }));
  }

  /**
   * 🏷️ Określa kategorię produktu
   */
  private static getCategoryForProduct(productName: string): string {
    const categoryMapping: Record<string, string> = {
      'Mleko': 'Nabiał',
      'Ser': 'Nabiał',
      'Jogurt': 'Nabiał',
      'Masło': 'Nabiał',
      'Jajka': 'Nabiał',
      'Chleb': 'Pieczywo',
      'Bułki': 'Pieczywo',
      'Jabłka': 'Owoce',
      'Banany': 'Owoce',
      'Pomarańcze': 'Owoce',
      'Pomidory': 'Warzywa',
      'Ogórki': 'Warzywa',
      'Cebula': 'Warzywa',
      'Marchew': 'Warzywa',
      'Kurczak': 'Mięso',
      'Szynka': 'Mięso',
      'Boczek': 'Mięso'
    };

    return categoryMapping[productName] || 'Inne';
  }

  /**
   * 💰 Szacuje cenę produktu
   */
  private static getEstimatedPrice(productName: string): number {
    const priceMapping: Record<string, number> = {
      'Mleko': 3.50,
      'Chleb': 2.80,
      'Jajka': 8.00,
      'Masło': 6.50,
      'Ser': 12.00,
      'Jabłka': 5.00,
      'Banany': 4.50,
      'Pomidory': 7.00,
      'Ogórki': 4.00,
      'Cebula': 2.50,
      'Kurczak': 18.00
    };

    return priceMapping[productName] || 5.00;
  }

  /**
   * 📊 Generuje statystyki zakupów
   */
  static async getShoppingStats(userId: string): Promise<{
    totalLists: number;
    completedLists: number;
    totalSpent: number;
    averageListValue: number;
    mostBoughtProducts: Array<{ name: string; count: number }>;
  }> {
    // TODO: Implementacja analizy historii zakupów
    
    return {
      totalLists: 25,
      completedLists: 22,
      totalSpent: 1240.50,
      averageListValue: 56.40,
      mostBoughtProducts: [
        { name: 'Mleko', count: 15 },
        { name: 'Chleb', count: 12 },
        { name: 'Jajka', count: 10 }
      ]
    };
  }

  /**
   * 🏪 Optymalizuje listę według sklepów/alejek
   */
  static optimizeListByStore(items: ShoppingListItem[]): Record<string, ShoppingListItem[]> {
    const storeMapping: Record<string, string> = {
      'Mleko': 'Chłodnicze',
      'Ser': 'Chłodnicze', 
      'Jogurt': 'Chłodnicze',
      'Chleb': 'Piekarnia',
      'Bułki': 'Piekarnia',
      'Jabłka': 'Owoce i warzywa',
      'Banany': 'Owoce i warzywa',
      'Pomidory': 'Owoce i warzywa',
      'Mięso': 'Rzeźnicze',
      'Kurczak': 'Rzeźnicze'
    };

    return items.reduce((acc, item) => {
      const aisle = storeMapping[item.productName] || 'Inne';
      if (!acc[aisle]) {
        acc[aisle] = [];
      }
      acc[aisle].push(item);
      return acc;
    }, {} as Record<string, ShoppingListItem[]>);
  }

  /**
   * 📤 Udostępnia listę zakupów
   */
  static async shareList(listId: string, userIds: string[]): Promise<void> {
    const listRef = doc(db, 'shopping_lists', listId);
    await updateDoc(listRef, {
      sharedWith: userIds
    });
  }
}

export default ShoppingListService;

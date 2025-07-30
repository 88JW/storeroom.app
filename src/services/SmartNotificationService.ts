// 🔔 System inteligentnych powiadomień dla Storeroom App

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Produkt } from '../types';

export interface SmartNotification {
  id?: string;
  userId: string;
  spizarniaId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Timestamp;
  scheduledFor?: Timestamp;
  relatedProductId?: string;
  metadata?: Record<string, any>;
}

export type NotificationType = 
  | 'expiry_warning'      // Produkt wkrótce się zepsuje
  | 'expired_product'     // Produkt przeterminowany
  | 'low_stock'          // Mało produktu
  | 'shopping_suggestion' // Sugestia zakupów
  | 'recipe_suggestion'   // Sugestia przepisu
  | 'waste_alert'        // Alert o marnowaniu
  | 'achievement'        // Osiągnięcie
  | 'weekly_summary'     // Tygodniowe podsumowanie
  | 'shared_pantry'      // Aktywność w udostępnionej spiżarni
  | 'system_update';     // Aktualizacja systemu

export interface NotificationSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  expiryReminders: {
    enabled: boolean;
    daysBefore: number; // Ile dni przed wygaśnięciem
    time: string; // Godzina powiadomienia (format HH:mm)
  };
  shoppingReminders: {
    enabled: boolean;
    lowStockThreshold: number; // Próg niskiego stanu
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  weeklySummary: {
    enabled: boolean;
    dayOfWeek: 'sunday' | 'monday' | 'saturday';
    time: string;
  };
  achievements: boolean;
  sharedPantryUpdates: boolean;
}

export class SmartNotificationService {
  
  /**
   * 🔍 Analizuje produkty i generuje inteligentne powiadomienia
   */
  static async generateSmartNotifications(spizarniaId: string, userId: string): Promise<SmartNotification[]> {
    try {
      const produkty = await this.getSpizarniaProdukty(spizarniaId, userId);
      const notifications: SmartNotification[] = [];
      const now = new Date();

      // 1. Powiadomienia o terminie ważności
      const expiryNotifications = this.generateExpiryNotifications(produkty, spizarniaId, userId);
      notifications.push(...expiryNotifications);

      // 2. Powiadomienia o niskim stanie
      const lowStockNotifications = this.generateLowStockNotifications(produkty, spizarniaId, userId);
      notifications.push(...lowStockNotifications);

      // 3. Sugestie zakupów na podstawie historii
      const shoppingNotifications = await this.generateShoppingSuggestions(spizarniaId, userId);
      notifications.push(...shoppingNotifications);

      // 4. Sugestie przepisów na podstawie dostępnych produktów
      const recipeNotifications = this.generateRecipeSuggestions(produkty, spizarniaId, userId);
      notifications.push(...recipeNotifications);

      // 5. Alerty o marnowaniu
      const wasteNotifications = this.generateWasteAlerts(produkty, spizarniaId, userId);
      notifications.push(...wasteNotifications);

      // Zapisz powiadomienia do bazy
      await this.saveNotifications(notifications);

      return notifications;
    } catch (error) {
      console.error('Błąd generowania powiadomień:', error);
      return [];
    }
  }

  /**
   * ⏰ Generuje powiadomienia o terminie ważności
   */
  private static generateExpiryNotifications(
    produkty: Produkt[], 
    spizarniaId: string, 
    userId: string
  ): SmartNotification[] {
    const notifications: SmartNotification[] = [];
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    const oneWeekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

    produkty.forEach(produkt => {
      if (!produkt.dataWażności) return;
      
      const expiryDate = new Date(produkt.dataWażności.toDate());
      
      // Przeterminowane
      if (expiryDate < now) {
        notifications.push({
          userId,
          spizarniaId,
          type: 'expired_product',
          title: '🚨 Produkt przeterminowany!',
          message: `${produkt.nazwa} przekroczył termin ważności. Rozważ usunięcie z spiżarni.`,
          priority: 'high',
          read: false,
          actionUrl: `/produkt/${produkt.id}?spizarnia=${spizarniaId}`,
          actionLabel: 'Zobacz szczegóły',
          createdAt: Timestamp.now(),
          relatedProductId: produkt.id
        });
      }
      // Wygasa w ciągu 3 dni
      else if (expiryDate <= threeDaysFromNow) {
        notifications.push({
          userId,
          spizarniaId,
          type: 'expiry_warning',
          title: '⚠️ Produkt wkrótce się zepsuje',
          message: `${produkt.nazwa} wygasa ${expiryDate.toLocaleDateString('pl-PL')}. Użyj go jak najszybciej!`,
          priority: 'medium',
          read: false,
          actionUrl: `/produkt/${produkt.id}?spizarnia=${spizarniaId}`,
          actionLabel: 'Zobacz przepisy',
          createdAt: Timestamp.now(),
          relatedProductId: produkt.id
        });
      }
      // Wygasa w ciągu tygodnia
      else if (expiryDate <= oneWeekFromNow) {
        notifications.push({
          userId,
          spizarniaId,
          type: 'expiry_warning',
          title: '📅 Nadchodzi termin ważności',
          message: `${produkt.nazwa} wygasa za ${Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))} dni.`,
          priority: 'low',
          read: false,
          actionUrl: `/lista?spizarnia=${spizarniaId}`,
          actionLabel: 'Zobacz listę',
          createdAt: Timestamp.now(),
          relatedProductId: produkt.id
        });
      }
    });

    return notifications;
  }

  /**
   * 📦 Generuje powiadomienia o niskim stanie magazynowym
   */
  private static generateLowStockNotifications(
    produkty: Produkt[], 
    spizarniaId: string, 
    userId: string
  ): SmartNotification[] {
    const notifications: SmartNotification[] = [];
    
    // Grupuj produkty po nazwie i analizuj ilości
    const productGroups = produkty.reduce((acc, produkt) => {
      const key = produkt.nazwa.toLowerCase();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(produkt);
      return acc;
    }, {} as Record<string, Produkt[]>);

    Object.entries(productGroups).forEach(([productName, products]) => {
      const totalQuantity = products.reduce((sum, p) => {
        const quantity = parseFloat(p.ilość?.toString() || '0');
        return sum + (isNaN(quantity) ? 0 : quantity);
      }, 0);

      // Jeśli mamy mało produktu (mniej niż 2 sztuki/jednostki)
      if (totalQuantity < 2 && totalQuantity > 0) {
        notifications.push({
          userId,
          spizarniaId,
          type: 'low_stock',
          title: '📦 Niski stan magazynowy',
          message: `Zostało tylko ${totalQuantity} ${products[0].jednostka || 'szt.'} produktu "${products[0].nazwa}". Może czas na zakupy?`,
          priority: 'low',
          read: false,
          actionUrl: `/lista?spizarnia=${spizarniaId}`,
          actionLabel: 'Dodaj do listy zakupów',
          createdAt: Timestamp.now(),
          metadata: {
            productName: products[0].nazwa,
            currentQuantity: totalQuantity,
            unit: products[0].jednostka
          }
        });
      }
    });

    return notifications;
  }

  /**
   * 🛒 Generuje sugestie zakupów na podstawie historii
   */
  private static async generateShoppingSuggestions(
    spizarniaId: string, 
    userId: string
  ): Promise<SmartNotification[]> {
    // TODO: Implementacja wymaga analizy historii zakupów
    // Analiza częstotliwości dodawania produktów i sugerowanie najczęściej kupowanych
    
    const commonProducts = [
      'Mleko', 'Chleb', 'Jajka', 'Masło', 'Jogurt', 'Banan', 'Jabłko'
    ];
    
    // Mock suggestion
    const suggestion = commonProducts[Math.floor(Math.random() * commonProducts.length)];
    
    return [{
      userId,
      spizarniaId,
      type: 'shopping_suggestion',
      title: '🛒 Sugestia zakupów',
      message: `Na podstawie Twoich nawyków zakupowych, może potrzebujesz: ${suggestion}`,
      priority: 'low',
      read: false,
      actionUrl: `/dodaj-produkt?spizarnia=${spizarniaId}&suggestion=${suggestion}`,
      actionLabel: 'Dodaj do spiżarni',
      createdAt: Timestamp.now(),
      metadata: {
        suggestedProduct: suggestion,
        reason: 'purchase_history'
      }
    }];
  }

  /**
   * 👩‍🍳 Generuje sugestie przepisów
   */
  private static generateRecipeSuggestions(
    produkty: Produkt[], 
    spizarniaId: string, 
    userId: string
  ): SmartNotification[] {
    const notifications: SmartNotification[] = [];
    
    // Sprawdź czy mamy składniki na popularne przepisy
    const availableProducts = produkty.map(p => p.nazwa.toLowerCase());
    
    const recipes = [
      {
        name: 'Jajecznica',
        ingredients: ['jajka', 'masło', 'mleko'],
        url: 'https://aniagotuje.pl/przepis/jajecznica'
      },
      {
        name: 'Omlet',
        ingredients: ['jajka', 'mleko', 'ser'],
        url: 'https://aniagotuje.pl/przepis/omlet'
      },
      {
        name: 'Smoothie bananowe',
        ingredients: ['banan', 'mleko', 'jogurt'],
        url: 'https://aniagotuje.pl/przepis/smoothie-bananowe'
      }
    ];

    recipes.forEach(recipe => {
      const hasIngredients = recipe.ingredients.filter(ingredient =>
        availableProducts.some(product => product.includes(ingredient))
      );

      if (hasIngredients.length >= 2) {
        notifications.push({
          userId,
          spizarniaId,
          type: 'recipe_suggestion',
          title: '👩‍🍳 Przepis na dziś',
          message: `Masz składniki na ${recipe.name}! Wykorzystaj produkty z spiżarni.`,
          priority: 'low',
          read: false,
          actionUrl: recipe.url,
          actionLabel: 'Zobacz przepis',
          createdAt: Timestamp.now(),
          metadata: {
            recipeName: recipe.name,
            availableIngredients: hasIngredients,
            missingIngredients: recipe.ingredients.filter(i => !hasIngredients.includes(i))
          }
        });
      }
    });

    return notifications;
  }

  /**
   * 🗑️ Generuje alerty o marnowaniu
   */
  private static generateWasteAlerts(
    produkty: Produkt[], 
    spizarniaId: string, 
    userId: string
  ): SmartNotification[] {
    const notifications: SmartNotification[] = [];
    const now = new Date();
    
    const expiredProducts = produkty.filter(p => 
      p.dataWażności && new Date(p.dataWażności.toDate()) < now
    );

    if (expiredProducts.length >= 3) {
      notifications.push({
        userId,
        spizarniaId,
        type: 'waste_alert',
        title: '🗑️ Alert o marnowaniu',
        message: `Masz ${expiredProducts.length} przeterminowanych produktów. Sprawdź spiżarnię i usuń niepotrzebne produkty.`,
        priority: 'medium',
        read: false,
        actionUrl: `/alerty?spizarnia=${spizarniaId}`,
        actionLabel: 'Zobacz alerty',
        createdAt: Timestamp.now(),
        metadata: {
          expiredCount: expiredProducts.length,
          categories: [...new Set(expiredProducts.map(p => p.kategoria))]
        }
      });
    }

    return notifications;
  }

  /**
   * 📥 Pobiera produkty ze spiżarni
   */
  private static async getSpizarniaProdukty(spizarniaId: string, userId: string): Promise<Produkt[]> {
    const produktyRef = collection(db, 'produkty');
    const q = query(
      produktyRef,
      where('spizarniaId', '==', spizarniaId),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Produkt[];
  }

  /**
   * 💾 Zapisuje powiadomienia do bazy
   */
  private static async saveNotifications(notifications: SmartNotification[]): Promise<void> {
    const batch = notifications.map(notification => 
      addDoc(collection(db, 'notifications'), notification)
    );
    
    await Promise.all(batch);
  }

  /**
   * 📖 Pobiera powiadomienia użytkownika
   */
  static async getUserNotifications(userId: string, limit: number = 20): Promise<SmartNotification[]> {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId)
      // orderBy('createdAt', 'desc'), // Dodaj po stworzeniu indeksu
      // limit(limit)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SmartNotification[];
  }

  /**
   * ✅ Oznacza powiadomienie jako przeczytane
   */
  static async markAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  }

  /**
   * 🔔 Pobiera nieprzeczytane powiadomienia
   */
  static async getUnreadNotifications(userId: string): Promise<SmartNotification[]> {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SmartNotification[];
  }

  /**
   * 📊 Generuje tygodniowe podsumowanie
   */
  static async generateWeeklySummary(userId: string): Promise<SmartNotification> {
    // TODO: Analiza aktywności z ostatniego tygodnia
    
    return {
      userId,
      spizarniaId: 'all',
      type: 'weekly_summary',
      title: '📊 Tygodniowe podsumowanie',
      message: 'W tym tygodniu dodałeś 12 produktów, zużyłeś 8 i 2 wygasły. Dobra robota!',
      priority: 'low',
      read: false,
      actionUrl: '/statystyki',
      actionLabel: 'Zobacz szczegóły',
      createdAt: Timestamp.now(),
      metadata: {
        weekStart: new Date().toISOString(),
        productsAdded: 12,
        productsConsumed: 8,
        productsExpired: 2
      }
    };
  }
}

export default SmartNotificationService;

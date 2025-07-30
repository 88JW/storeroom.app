// 📊 Serwis analityki i statystyk dla Storeroom App

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Produkt } from '../types';

export interface SpizarniaStats {
  totalProducts: number;
  expiredProducts: number;
  expiringSoon: number;
  categories: CategoryStats[];
  locations: LocationStats[];
  monthlyTrends: MonthlyStats[];
  wasteStats: WasteStats;
  popularProducts: ProductStats[];
}

interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
  icon: string;
}

interface LocationStats {
  location: string;
  count: number;
  percentage: number;
  icon: string;
}

interface MonthlyStats {
  month: string;
  added: number;
  consumed: number;
  expired: number;
}

interface WasteStats {
  totalWasted: number;
  wasteValue: number; // w zł
  mostWastedCategory: string;
  wasteReduction: number; // % w porównaniu do poprzedniego miesiąca
}

interface ProductStats {
  productName: string;
  frequency: number;
  lastAdded: Date;
  averageLifespan: number;
}

export class AnalyticsService {
  
  /**
   * 📊 Pobiera kompletne statystyki dla spiżarni
   */
  static async getSpizarniaStats(spizarniaId: string, userId: string): Promise<SpizarniaStats> {
    try {
      const produktyRef = collection(db, 'produkty');
      const q = query(
        produktyRef,
        where('spizarniaId', '==', spizarniaId),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const produkty = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Produkt[];

      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

      // Podstawowe statystyki
      const totalProducts = produkty.length;
      const expiredProducts = produkty.filter(p => 
        p.dataWażności && new Date(p.dataWażności.toDate()) < now
      ).length;
      
      const expiringSoon = produkty.filter(p => 
        p.dataWażności && 
        new Date(p.dataWażności.toDate()) >= now &&
        new Date(p.dataWażności.toDate()) <= threeDaysFromNow
      ).length;

      // Statystyki kategorii
      const categories = this.calculateCategoryStats(produkty);
      
      // Statystyki lokalizacji
      const locations = this.calculateLocationStats(produkty);
      
      // Trendy miesięczne
      const monthlyTrends = await this.calculateMonthlyTrends(spizarniaId, userId);
      
      // Statystyki marnowania
      const wasteStats = await this.calculateWasteStats(spizarniaId, userId);
      
      // Popularne produkty
      const popularProducts = this.calculatePopularProducts(produkty);

      return {
        totalProducts,
        expiredProducts,
        expiringSoon,
        categories,
        locations,
        monthlyTrends,
        wasteStats,
        popularProducts
      };

    } catch (error) {
      console.error('Błąd pobierania statystyk:', error);
      throw new Error('Nie udało się pobrać statystyk');
    }
  }

  /**
   * 🏷️ Oblicza statystyki kategorii
   */
  private static calculateCategoryStats(produkty: Produkt[]): CategoryStats[] {
    const categoryCount = produkty.reduce((acc, produkt) => {
      const category = produkt.kategoria || 'Inne';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = produkty.length;
    const categoryIcons: Record<string, string> = {
      'Nabiał': '🥛',
      'Mięso': '🥩',
      'Warzywa': '🥕',
      'Owoce': '🍎',
      'Pieczywo': '🍞',
      'Napoje': '🥤',
      'Słodycze': '🍫',
      'Konserwы': '🥫',
      'Inne': '📦'
    };

    return Object.entries(categoryCount)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
        icon: categoryIcons[category] || '📦'
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * 📍 Oblicza statystyki lokalizacji
   */
  private static calculateLocationStats(produkty: Produkt[]): LocationStats[] {
    const locationCount = produkty.reduce((acc, produkt) => {
      const location = produkt.lokalizacjaNazwa || 'Nie określono';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = produkty.length;
    const locationIcons: Record<string, string> = {
      'Lodówka': '🧊',
      'Zamrażarka': '❄️',
      'Szafka': '🗄️',
      'Spiżarnia': '🏠',
      'Nie określono': '❓'
    };

    return Object.entries(locationCount)
      .map(([location, count]) => ({
        location,
        count,
        percentage: Math.round((count / total) * 100),
        icon: locationIcons[location] || '📦'
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * 📈 Oblicza trendy miesięczne
   */
  private static async calculateMonthlyTrends(spizarniaId: string, userId: string): Promise<MonthlyStats[]> {
    // TODO: Implementacja wymaga dodatkowej kolekcji 'product_history'
    // która będzie śledząć dodawanie/usuwanie produktów
    
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('pl-PL', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      months.push({
        month: monthName,
        added: Math.floor(Math.random() * 20) + 5, // Mock data
        consumed: Math.floor(Math.random() * 15) + 3,
        expired: Math.floor(Math.random() * 5) + 1
      });
    }
    
    return months;
  }

  /**
   * 🗑️ Oblicza statystyki marnowania
   */
  private static async calculateWasteStats(spizarniaId: string, userId: string): Promise<WasteStats> {
    // TODO: Implementacja wymaga śledzenia usuniętych produktów z powodem
    
    return {
      totalWasted: 12, // Mock data
      wasteValue: 45.50,
      mostWastedCategory: 'Owoce',
      wasteReduction: 15
    };
  }

  /**
   * ⭐ Oblicza popularne produkty
   */
  private static calculatePopularProducts(produkty: Produkt[]): ProductStats[] {
    const productFrequency = produkty.reduce((acc, produkt) => {
      const name = produkt.nazwa.toLowerCase();
      if (!acc[name]) {
        acc[name] = {
          productName: produkt.nazwa,
          frequency: 0,
          lastAdded: produkt.dataDodania.toDate(),
          totalDays: 0,
          count: 0
        };
      }
      acc[name].frequency++;
      acc[name].count++;
      
      const addedDate = produkt.dataDodania.toDate();
      if (addedDate > acc[name].lastAdded) {
        acc[name].lastAdded = addedDate;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(productFrequency)
      .map((product: any) => ({
        productName: product.productName,
        frequency: product.frequency,
        lastAdded: product.lastAdded,
        averageLifespan: Math.floor(Math.random() * 14) + 7 // Mock calculation
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  }

  /**
   * 📊 Generuje raport PDF z statystykami
   */
  static async generateStatsReport(spizarniaId: string, userId: string): Promise<Blob> {
    // TODO: Implementacja generowania PDF
    throw new Error('Funkcja w przygotowaniu');
  }

  /**
   * 📱 Pobiera szybkie statystyki dla dashboard
   */
  static async getQuickStats(spizarniaId: string, userId: string) {
    const produktyRef = collection(db, 'produkty');
    const q = query(
      produktyRef,
      where('spizarniaId', '==', spizarniaId),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const produkty = snapshot.docs.map(doc => doc.data()) as Produkt[];
    
    const now = new Date();
    const expiredCount = produkty.filter(p => 
      p.dataWażności && new Date(p.dataWażności.toDate()) < now
    ).length;
    
    const expiringSoonCount = produkty.filter(p => {
      if (!p.dataWażności) return false;
      const expiryDate = new Date(p.dataWażności.toDate());
      const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
      return expiryDate >= now && expiryDate <= threeDaysFromNow;
    }).length;

    return {
      totalProducts: produkty.length,
      expiredProducts: expiredCount,
      expiringSoon: expiringSoonCount,
      healthScore: Math.max(0, 100 - (expiredCount * 10) - (expiringSoonCount * 5))
    };
  }
}

export default AnalyticsService;

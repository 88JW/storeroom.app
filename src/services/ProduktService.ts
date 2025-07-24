// 🛒 Serwis do zarządzania produktami w spiżarni

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import type { 
  Produkt, 
  ProduktFiltr, 
  ProduktSortowanie,
  Lokalizacja,
  ProduktStatus 
} from '../types';
import { SpizarniaService } from './SpizarniaService';

export class ProduktService {
  
  // 📋 Pobieranie produktów z spiżarni
  static async getProdukty(
    spizarniaId: string, 
    userId: string,
    filtr?: ProduktFiltr,
    sortowanie?: ProduktSortowanie
  ): Promise<Produkt[]> {
    try {
      console.log('ProduktService: Pobieranie produktów dla spiżarni:', spizarniaId);
      
      // Sprawdź uprawnienia
      const hasPermission = await SpizarniaService.checkPermission(spizarniaId, userId, 'view');
      if (!hasPermission) {
        throw new Error('Brak uprawnień do przeglądania tej spiżarni');
      }
      
      // Buduj zapytanie
      const produktyRef = collection(db, 'spiżarnie', spizarniaId, 'produkty');
      let queryConstraints: any[] = [];
      
      // Aplikuj filtry
      if (filtr) {
        if (filtr.kategoria) {
          queryConstraints.push(where('kategoria', '==', filtr.kategoria));
        }
        if (filtr.lokalizacja) {
          queryConstraints.push(where('lokalizacja', '==', filtr.lokalizacja));
        }
        if (filtr.status) {
          queryConstraints.push(where('status', '==', filtr.status));
        }
      }
      
      // Aplikuj sortowanie
      if (sortowanie) {
        queryConstraints.push(orderBy(sortowanie.pole, sortowanie.kierunek));
      } else {
        // Domyślne sortowanie po dacie ważności
        queryConstraints.push(orderBy('dataWażności', 'asc'));
      }
      
      const q = query(produktyRef, ...queryConstraints);
      const snapshot = await getDocs(q);
      
      let produkty = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Produkt[];
      
      // Filtruj po nazwie (nie można użyć where z partial match)
      if (filtr?.szukaj) {
        const searchTerm = filtr.szukaj.toLowerCase();
        produkty = produkty.filter(produkt => 
          produkt.nazwa.toLowerCase().includes(searchTerm) ||
          produkt.kategoria.toLowerCase().includes(searchTerm) ||
          produkt.notatki?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Filtruj po wygasających produktach
      if (filtr?.wygasaWDniach !== undefined) {
        const teraz = new Date();
        const granica = new Date(teraz.getTime() + (filtr.wygasaWDniach * 24 * 60 * 60 * 1000));
        
        produkty = produkty.filter(produkt => {
          if (!produkt.dataWażności) return false;
          const dataWażności = produkt.dataWażności.toDate();
          return dataWażności <= granica;
        });
      }
      
      console.log('ProduktService: Pobrano produkty:', produkty.length);
      return produkty;
      
    } catch (error) {
      console.error('ProduktService: Błąd pobierania produktów:', error);
      throw error;
    }
  }
  
  // ➕ Dodawanie nowego produktu
  static async addProdukt(
    spizarniaId: string,
    userId: string,
    produktData: Omit<Produkt, 'id' | 'dataDodania' | 'dataModyfikacji' | 'dodanePrzez'>
  ): Promise<string> {
    try {
      console.log('ProduktService: Dodawanie produktu:', produktData);
      
      // Sprawdź uprawnienia
      const hasPermission = await SpizarniaService.checkPermission(spizarniaId, userId, 'add');
      if (!hasPermission) {
        throw new Error('Brak uprawnień do dodawania produktów');
      }
      
      const produktyRef = collection(db, 'spiżarnie', spizarniaId, 'produkty');
      
      const nowyProdukt = {
        ...produktData,
        dataDodania: serverTimestamp(),
        dataModyfikacji: serverTimestamp(),
        dodanePrzez: userId,
        status: produktData.status || 'dostępny' as ProduktStatus
      };
      
      const docRef = await addDoc(produktyRef, nowyProdukt);
      
      console.log('ProduktService: Dodano produkt o ID:', docRef.id);
      return docRef.id;
      
    } catch (error) {
      console.error('ProduktService: Błąd dodawania produktu:', error);
      throw error;
    }
  }
  
  // 📝 Aktualizacja produktu
  static async updateProdukt(
    spizarniaId: string,
    produktId: string,
    userId: string,
    updates: Partial<Omit<Produkt, 'id' | 'dataDodania' | 'dodanePrzez'>>
  ): Promise<void> {
    try {
      console.log('ProduktService: Aktualizacja produktu:', produktId, updates);
      
      // Sprawdź uprawnienia
      const hasPermission = await SpizarniaService.checkPermission(spizarniaId, userId, 'edit');
      if (!hasPermission) {
        throw new Error('Brak uprawnień do edycji produktów');
      }
      
      const produktRef = doc(db, 'spiżarnie', spizarniaId, 'produkty', produktId);
      
      await updateDoc(produktRef, {
        ...updates,
        dataModyfikacji: serverTimestamp(),
        zmodyfikowanePrzez: userId
      });
      
      console.log('ProduktService: Zaktualizowano produkt');
      
    } catch (error) {
      console.error('ProduktService: Błąd aktualizacji produktu:', error);
      throw error;
    }
  }
  
  // 🗑️ Usuwanie produktu
  static async deleteProdukt(
    spizarniaId: string,
    produktId: string,
    userId: string
  ): Promise<void> {
    try {
      console.log('ProduktService: Usuwanie produktu:', produktId);
      
      // Sprawdź uprawnienia
      const hasPermission = await SpizarniaService.checkPermission(spizarniaId, userId, 'delete');
      if (!hasPermission) {
        throw new Error('Brak uprawnień do usuwania produktów');
      }
      
      const produktRef = doc(db, 'spiżarnie', spizarniaId, 'produkty', produktId);
      await deleteDoc(produktRef);
      
      console.log('ProduktService: Usunięto produkt');
      
    } catch (error) {
      console.error('ProduktService: Błąd usuwania produktu:', error);
      throw error;
    }
  }
  
  // 📊 Pobieranie statystyk produktów
  static async getProduktStatistyki(spizarniaId: string, userId: string) {
    try {
      // Sprawdź uprawnienia
      const hasPermission = await SpizarniaService.checkPermission(spizarniaId, userId, 'view');
      if (!hasPermission) {
        throw new Error('Brak uprawnień do przeglądania tej spiżarni');
      }
      
      const produkty = await this.getProdukty(spizarniaId, userId);
      
      const teraz = new Date();
      const za3Dni = new Date(teraz.getTime() + (3 * 24 * 60 * 60 * 1000));
      const za7Dni = new Date(teraz.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      const statystyki = {
        totalProducts: produkty.length,
        dostępne: produkty.filter(p => p.status === 'dostępny').length,
        wykorzystane: produkty.filter(p => p.status === 'wykorzystany').length,
        przeterminowane: produkty.filter(p => p.status === 'przeterminowany').length,
        wygasająceW3Dni: produkty.filter(p => {
          if (!p.dataWażności || p.status !== 'dostępny') return false;
          const dataWażności = p.dataWażności.toDate();
          return dataWażności <= za3Dni;
        }).length,
        wygasająceW7Dni: produkty.filter(p => {
          if (!p.dataWażności || p.status !== 'dostępny') return false;
          const dataWażności = p.dataWażności.toDate();
          return dataWażności <= za7Dni;
        }).length,
        kategorieCount: this.getKategorieCount(produkty),
        lokalizacjeCount: this.getLokalizacjeCount(produkty)
      };
      
      return statystyki;
      
    } catch (error) {
      console.error('ProduktService: Błąd pobierania statystyk:', error);
      throw error;
    }
  }
  
  // 🔍 Wyszukiwanie produktów
  static async searchProdukty(
    spizarniaId: string,
    userId: string,
    searchTerm: string,
    maxResults: number = 20
  ): Promise<Produkt[]> {
    try {
      const produkty = await this.getProdukty(spizarniaId, userId, {
        szukaj: searchTerm
      });
      
      return produkty.slice(0, maxResults);
      
    } catch (error) {
      console.error('ProduktService: Błąd wyszukiwania produktów:', error);
      throw error;
    }
  }
  
  // 📅 Produkty wygasające
  static async getWygasająceProdukty(
    spizarniaId: string,
    userId: string,
    dniDoWygaśnięcia: number = 7
  ): Promise<Produkt[]> {
    try {
      return await this.getProdukty(spizarniaId, userId, {
        wygasaWDniach: dniDoWygaśnięcia,
        status: 'dostępny'
      }, {
        pole: 'dataWażności',
        kierunek: 'asc'
      });
      
    } catch (error) {
      console.error('ProduktService: Błąd pobierania wygasających produktów:', error);
      throw error;
    }
  }
  
  // 🏷️ Pobieranie produktów według kategorii
  static async getProduktWedługKategorii(
    spizarniaId: string,
    userId: string,
    kategoria: string
  ): Promise<Produkt[]> {
    try {
      return await this.getProdukty(spizarniaId, userId, {
        kategoria
      });
      
    } catch (error) {
      console.error('ProduktService: Błąd pobierania produktów według kategorii:', error);
      throw error;
    }
  }
  
  // 📍 Pobieranie produktów według lokalizacji
  static async getProduktWedługLokalizacji(
    spizarniaId: string,
    userId: string,
    lokalizacja: Lokalizacja
  ): Promise<Produkt[]> {
    try {
      return await this.getProdukty(spizarniaId, userId, {
        lokalizacja
      });
      
    } catch (error) {
      console.error('ProduktService: Błąd pobierania produktów według lokalizacji:', error);
      throw error;
    }
  }
  
  // 📊 Pomocnicze metody dla statystyk
  private static getKategorieCount(produkty: Produkt[]): Record<string, number> {
    return produkty.reduce((acc, produkt) => {
      acc[produkt.kategoria] = (acc[produkt.kategoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
  
  private static getLokalizacjeCount(produkty: Produkt[]): Record<string, number> {
    return produkty.reduce((acc, produkt) => {
      const lokalizacja = produkt.lokalizacja || 'nieznana';
      acc[lokalizacja] = (acc[lokalizacja] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export default ProduktService;

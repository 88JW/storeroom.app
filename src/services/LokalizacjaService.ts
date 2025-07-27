// 📍 Serwis do zarządzania lokalizacjami w spiżarni

import {
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import type { SpizarniaLokalizacja } from '../types';
import { SpizarniaService } from './SpizarniaService';
import { ProduktService } from './ProduktService';

export class LokalizacjaService {
  
  // ➕ Dodawanie nowej lokalizacji do spiżarni
  static async addLokalizacja(
    spizarniaId: string,
    userId: string,
    lokalizacjaData: Omit<SpizarniaLokalizacja, 'id' | 'createdAt'>
  ): Promise<SpizarniaLokalizacja> {
    try {
      console.log('LokalizacjaService: Dodawanie lokalizacji:', lokalizacjaData);
      
      // Sprawdź uprawnienia
      const hasPermission = await SpizarniaService.checkPermission(spizarniaId, userId, 'edit');
      if (!hasPermission) {
        throw new Error('Brak uprawnień do edycji tej spiżarni');
      }
      
      // Walidacja wymaganych pól
      if (!lokalizacjaData.nazwa || lokalizacjaData.nazwa.trim() === '') {
        throw new Error('Nazwa lokalizacji jest wymagana');
      }
      
      // Walidacja i czyszczenie danych (usuń undefined values)
      const cleanedData = Object.fromEntries(
        Object.entries(lokalizacjaData).filter(([, value]) => value !== undefined)
      ) as Omit<SpizarniaLokalizacja, 'id' | 'createdAt'>;
      
      // Zapewnij domyślne wartości dla opcjonalnych pól
      const dataWithDefaults = {
        nazwa: cleanedData.nazwa,
        ikona: cleanedData.ikona || '📦',
        kolor: cleanedData.kolor || '#2196F3',
        opis: cleanedData.opis || ''
      };
      
      // Utwórz nową lokalizację z unikalnym ID
      const nowaLokalizacja: SpizarniaLokalizacja = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...dataWithDefaults,
        createdAt: Timestamp.fromDate(new Date())
      };
      
      // Dodaj do metadanych spiżarni
      const metadataRef = doc(db, 'spiżarnie', spizarniaId, 'metadata', 'info');
      await updateDoc(metadataRef, {
        lokalizacje: arrayUnion(nowaLokalizacja),
        updatedAt: serverTimestamp()
      });
      
      console.log('LokalizacjaService: Dodano lokalizację:', nowaLokalizacja.id);
      return nowaLokalizacja;
      
    } catch (error) {
      console.error('LokalizacjaService: Błąd dodawania lokalizacji:', error);
      throw error;
    }
  }
  
  // 📝 Aktualizacja lokalizacji
  static async updateLokalizacja(
    spizarniaId: string,
    userId: string,
    lokalizacjaId: string,
    updates: Partial<Omit<SpizarniaLokalizacja, 'id' | 'createdAt'>>
  ): Promise<void> {
    try {
      console.log('LokalizacjaService: Aktualizacja lokalizacji:', lokalizacjaId, updates);
      
      // Walidacja i czyszczenie danych (usuń undefined values)
      const cleanedUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== undefined)
      ) as Partial<Omit<SpizarniaLokalizacja, 'id' | 'createdAt'>>;
      
      // Sprawdź uprawnienia
      const hasPermission = await SpizarniaService.checkPermission(spizarniaId, userId, 'edit');
      if (!hasPermission) {
        throw new Error('Brak uprawnień do edycji tej spiżarni');
      }
      
      // Pobierz aktualne metadane
      const userSpizarnie = await SpizarniaService.getUserSpiżarnie(userId);
      const spizarnia = userSpizarnie.find(s => s.id === spizarniaId);
      
      if (!spizarnia || !spizarnia.metadata.lokalizacje) {
        throw new Error('Nie znaleziono spiżarni lub lokalizacji');
      }
      
      // Znajdź i zaktualizuj lokalizację
      const zaktualizowaneLokalizacje = spizarnia.metadata.lokalizacje.map(lok => {
        if (lok.id === lokalizacjaId) {
          return { ...lok, ...cleanedUpdates };
        }
        return lok;
      });
      
      // Zapisz zmiany
      const metadataRef = doc(db, 'spiżarnie', spizarniaId, 'metadata', 'info');
      await updateDoc(metadataRef, {
        lokalizacje: zaktualizowaneLokalizacje,
        updatedAt: serverTimestamp()
      });
      
      console.log('LokalizacjaService: Zaktualizowano lokalizację');
      
    } catch (error) {
      console.error('LokalizacjaService: Błąd aktualizacji lokalizacji:', error);
      throw error;
    }
  }
  
  // 🗑️ Usuwanie lokalizacji
  static async deleteLokalizacja(
    spizarniaId: string,
    userId: string,
    lokalizacjaId: string
  ): Promise<void> {
    try {
      console.log('LokalizacjaService: Usuwanie lokalizacji:', lokalizacjaId);
      
      // Sprawdź uprawnienia
      const hasPermission = await SpizarniaService.checkPermission(spizarniaId, userId, 'edit');
      if (!hasPermission) {
        throw new Error('Brak uprawnień do edycji tej spiżarni');
      }
      
      // Sprawdź czy są produkty w tej lokalizacji
      const produkty = await ProduktService.getProdukty(spizarniaId, userId, {
        lokalizacja: lokalizacjaId
      });
      
      if (produkty.length > 0) {
        throw new Error(`Nie można usunąć lokalizacji. Znajduje się w niej ${produkty.length} produktów. Najpierw przenieś lub usuń produkty.`);
      }
      
      // Pobierz aktualne metadane
      const userSpizarnie = await SpizarniaService.getUserSpiżarnie(userId);
      const spizarnia = userSpizarnie.find(s => s.id === spizarniaId);
      
      if (!spizarnia || !spizarnia.metadata.lokalizacje) {
        throw new Error('Nie znaleziono spiżarni lub lokalizacji');
      }
      
      // Znajdź lokalizację do usunięcia
      const lokalizacjaDoUsuniecia = spizarnia.metadata.lokalizacje.find(lok => lok.id === lokalizacjaId);
      if (!lokalizacjaDoUsuniecia) {
        throw new Error('Nie znaleziono lokalizacji');
      }
      
      // Usuń lokalizację
      const metadataRef = doc(db, 'spiżarnie', spizarniaId, 'metadata', 'info');
      await updateDoc(metadataRef, {
        lokalizacje: arrayRemove(lokalizacjaDoUsuniecia),
        updatedAt: serverTimestamp()
      });
      
      console.log('LokalizacjaService: Usunięto lokalizację');
      
    } catch (error) {
      console.error('LokalizacjaService: Błąd usuwania lokalizacji:', error);
      throw error;
    }
  }
  
  // 📋 Pobieranie lokalizacji spiżarni
  static async getLokalizacje(
    spizarniaId: string,
    userId: string
  ): Promise<SpizarniaLokalizacja[]> {
    try {
      // Sprawdź uprawnienia
      const hasPermission = await SpizarniaService.checkPermission(spizarniaId, userId, 'view');
      if (!hasPermission) {
        throw new Error('Brak uprawnień do przeglądania tej spiżarni');
      }
      
      // Pobierz metadane spiżarni
      const userSpizarnie = await SpizarniaService.getUserSpiżarnie(userId);
      const spizarnia = userSpizarnie.find(s => s.id === spizarniaId);
      
      if (!spizarnia) {
        throw new Error('Nie znaleziono spiżarni');
      }
      
      return spizarnia.metadata.lokalizacje || [];
      
    } catch (error) {
      console.error('LokalizacjaService: Błąd pobierania lokalizacji:', error);
      throw error;
    }
  }
  
  // 🔍 Znajdź lokalizację po ID
  static async findLokalizacjaById(
    spizarniaId: string,
    userId: string,
    lokalizacjaId: string
  ): Promise<SpizarniaLokalizacja | null> {
    try {
      const lokalizacje = await this.getLokalizacje(spizarniaId, userId);
      return lokalizacje.find(lok => lok.id === lokalizacjaId) || null;
      
    } catch (error) {
      console.error('LokalizacjaService: Błąd znajdowania lokalizacji:', error);
      return null;
    }
  }
  
  // 📊 Statystyki lokalizacji (liczba produktów w każdej)
  static async getLokalizacjeStatystyki(
    spizarniaId: string,
    userId: string
  ): Promise<Record<string, { lokalizacja: SpizarniaLokalizacja; liczbaProduktow: number }>> {
    try {
      const lokalizacje = await this.getLokalizacje(spizarniaId, userId);
      const statystyki: Record<string, { lokalizacja: SpizarniaLokalizacja; liczbaProduktow: number }> = {};
      
      // Dla każdej lokalizacji policz produkty
      for (const lokalizacja of lokalizacje) {
        const produkty = await ProduktService.getProdukty(spizarniaId, userId, {
          lokalizacja: lokalizacja.id
        });
        
        statystyki[lokalizacja.id] = {
          lokalizacja,
          liczbaProduktow: produkty.length
        };
      }
      
      return statystyki;
      
    } catch (error) {
      console.error('LokalizacjaService: Błąd pobierania statystyk lokalizacji:', error);
      throw error;
    }
  }
}

export default LokalizacjaService;

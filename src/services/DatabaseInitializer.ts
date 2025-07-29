// 🔥 Narzędzie do inicjalizacji bazy danych Firebase

import { 
  doc, 
  setDoc, 
  collection, 
  addDoc,
  serverTimestamp,
  writeBatch,
  Timestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import type { 
  SpizarniaMetadata, 
  SpizarniaCzłonek, 
  UserSpizarnia, 
  UserProfile
} from '../types';

export class DatabaseInitializer {
  
  // 🏗️ Główna funkcja inicjalizacji bazy dla użytkownika
  static async initializeUserDatabase(userId: string, userEmail: string, userName: string = 'Użytkownik'): Promise<void> {
    try {
      console.log('🔥 DatabaseInitializer: Inicjalizacja bazy dla użytkownika:', userId);
      
      // 1. Utwórz profil użytkownika
      await this.createUserProfile(userId, userEmail, userName);
      
      // 2. Utwórz pierwszą spiżarnię
      const spizarniaId = await this.createFirstSpizarnia(userId);
      
      // 3. Dodaj przykładowe produkty
      await this.addSampleProducts(spizarniaId, userId);
      
      console.log('✅ DatabaseInitializer: Baza danych została zainicjalizowana!');
      
    } catch (error) {
      console.error('❌ DatabaseInitializer: Błąd inicjalizacji bazy:', error);
      throw error;
    }
  }
  
  // 👤 Tworzenie profilu użytkownika
  private static async createUserProfile(userId: string, email: string, displayName: string): Promise<void> {
    try {
      console.log('👤 Tworzenie profilu użytkownika...');
      
      const userProfile: UserProfile = {
        email,
        displayName,
        createdAt: serverTimestamp() as any,
        lastLoginAt: serverTimestamp() as any
      };
      
      await setDoc(doc(db, 'users', userId, 'profile', 'info'), userProfile);
      console.log('✅ Profil użytkownika utworzony');
      
    } catch (error) {
      console.error('❌ Błąd tworzenia profilu:', error);
      throw error;
    }
  }
  
  // 🏠 Tworzenie pierwszej spiżarni
  private static async createFirstSpizarnia(userId: string): Promise<string> {
    try {
      console.log('🏠 Tworzenie pierwszej spiżarni...');
      
      const batch = writeBatch(db);
      
      // Generuj ID dla spiżarni
      const spizarniaRef = doc(collection(db, 'spiżarnie'));
      const spizarniaId = spizarniaRef.id;
      
      // 1. Metadane spiżarni
      const metadataRef = doc(db, 'spiżarnie', spizarniaId, 'metadata', 'info');
      const metadataData: SpizarniaMetadata = {
        nazwa: 'Moja pierwsza spiżarnia',
        opis: 'Domowa spiżarnia utworzona automatycznie',
        typ: 'osobista',
        właściciel: userId,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        ikona: '🏠',
        ustawienia: {
          powiadomieniaOWażności: true,
          dziPrzedWażnością: 3,
          publicznaWidoczność: false
        }
      };
      batch.set(metadataRef, metadataData);
      
      // 2. Właściciel jako członek
      const członekRef = doc(db, 'spiżarnie', spizarniaId, 'członkowie', userId);
      const członekData: SpizarniaCzłonek = {
        role: 'owner',
        joinedAt: serverTimestamp() as any,
        invitedBy: userId,
        permissions: {
          canAdd: true,
          canEdit: true,
          canDelete: true,
          canInvite: true
        }
      };
      batch.set(członekRef, członekData);
      
      // 3. Spiżarnia w profilu użytkownika
      const userSpizarniaRef = doc(db, 'users', userId, 'spiżarnie', spizarniaId);
      const userSpizarniaData: UserSpizarnia = {
        role: 'owner',
        joinedAt: serverTimestamp() as any
      };
      batch.set(userSpizarniaRef, userSpizarniaData);
      
      await batch.commit();
      
      console.log('✅ Pierwsza spiżarnia utworzona, ID:', spizarniaId);
      return spizarniaId;
      
    } catch (error) {
      console.error('❌ Błąd tworzenia spiżarni:', error);
      throw error;
    }
  }
  
  // 🛒 Dodawanie przykładowych produktów
  private static async addSampleProducts(spizarniaId: string, userId: string): Promise<void> {
    try {
      console.log('🛒 Dodawanie przykładowych produktów...');
      
      const produktyRef = collection(db, 'spiżarnie', spizarniaId, 'produkty');
      
      // Przykładowe produkty
      const sampleProdukty: Array<{
        nazwa: string;
        kategoria: string;
        podkategoria: string;
        ilość: number;
        jednostka: 'szt' | 'kg' | 'l' | 'g' | 'ml';
        dataWażności: Date;
        lokalizacja: 'lodówka' | 'zamrażarka' | 'szafka';
        status: 'dostępny' | 'wykorzystany' | 'przeterminowany';
        notatki: string;
      }> = [
        {
          nazwa: 'Mleko',
          kategoria: 'Nabiał',
          podkategoria: 'Mleko',
          ilość: 2,
          jednostka: 'l',
          dataWażności: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Za 3 dni
          lokalizacja: 'lodówka',
          status: 'dostępny',
          notatki: 'Mleko pełnotłuste 3,2%'
        },
        {
          nazwa: 'Chleb',
          kategoria: 'Pieczywo',
          podkategoria: 'Chleb',
          ilość: 1,
          jednostka: 'szt',
          dataWażności: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Za 2 dni
          lokalizacja: 'szafka',
          status: 'dostępny',
          notatki: 'Chleb żytni'
        },
        {
          nazwa: 'Jajka',
          kategoria: 'Nabiał',
          podkategoria: 'Jajka',
          ilość: 12,
          jednostka: 'szt',
          dataWażności: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Za 10 dni
          lokalizacja: 'lodówka',
          status: 'dostępny',
          notatki: 'Jajka kurze, rozmiar L'
        },
        {
          nazwa: 'Ser żółty',
          kategoria: 'Nabiał',
          podkategoria: 'Ser',
          ilość: 250,
          jednostka: 'g',
          dataWażności: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Za 14 dni
          lokalizacja: 'lodówka',
          status: 'dostępny',
          notatki: 'Ser gouda'
        },
        {
          nazwa: 'Masło',
          kategoria: 'Nabiał',
          podkategoria: 'Masło',
          ilość: 1,
          jednostka: 'szt',
          dataWażności: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Za 30 dni
          lokalizacja: 'lodówka',
          status: 'dostępny',
          notatki: 'Masło ekstra'
        }
      ];
      
      // Dodaj wszystkie produkty
      for (const produktData of sampleProdukty) {
        const produkt: any = {
          ...produktData,
          dataDodania: serverTimestamp(),
          dataModyfikacji: serverTimestamp(),
          dodanePrzez: userId
        };
        
        // Dodaj dataWażności tylko jeśli istnieje
        if (produktData.dataWażności) {
          produkt.dataWażności = Timestamp.fromDate(produktData.dataWażności);
        }
        
        await addDoc(produktyRef, produkt);
      }
      
      console.log('✅ Dodano', sampleProdukty.length, 'przykładowych produktów');
      
    } catch (error) {
      console.error('❌ Błąd dodawania produktów:', error);
      throw error;
    }
  }
  
  // 🔍 Sprawdzenie czy użytkownik ma już zainicjalizowaną bazę
  static async isDatabaseInitialized(userId: string): Promise<boolean> {
    try {
      const profileRef = doc(db, 'users', userId, 'profile', 'info');
      const profileDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(profileRef));
      
      return profileDoc.exists();
      
    } catch (error) {
      console.error('❌ Błąd sprawdzania inicjalizacji:', error);
      return false;
    }
  }
  
  // 🧹 Czyszczenie bazy dla użytkownika (do testów)
  static async clearUserDatabase(userId: string): Promise<void> {
    try {
      console.log('🧹 Czyszczenie bazy danych użytkownika...');
      
      // Usuń wszystkie spiżarnie użytkownika
      const spizarnieRef = collection(db, 'spiżarnie');
      const userSpizarnieQuery = query(spizarnieRef, where('userId', '==', userId));
      const spizarnieSnapshot = await getDocs(userSpizarnieQuery);
      
      const batch = writeBatch(db);
      
      // Usuń wszystkie produkty z każdej spiżarni
      for (const spizarniaDoc of spizarnieSnapshot.docs) {
        const produktyRef = collection(db, 'spiżarnie', spizarniaDoc.id, 'produkty');
        const produktySnapshot = await getDocs(produktyRef);
        
        produktySnapshot.docs.forEach(produktDoc => {
          batch.delete(produktDoc.ref);
        });
        
        // Usuń spiżarnię
        batch.delete(spizarniaDoc.ref);
      }
      
      // Usuń dane użytkownika
      batch.delete(doc(db, 'users', userId));
      
      // Wykonaj wszystkie operacje
      await batch.commit();
      
      console.log('✅ Baza danych użytkownika została wyczyszczona');
      
    } catch (error) {
      console.error('❌ Błąd czyszczenia bazy:', error);
      throw error;
    }
  }
}

export default DatabaseInitializer;

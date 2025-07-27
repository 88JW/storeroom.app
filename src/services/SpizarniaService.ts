// 🔥 Serwis do zarządzania spiżarniami w Firebase

import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import type { 
  SpizarniaMetadata, 
  SpizarniaCzłonek, 
  UserSpizarnia,
  SpizarniaLokalizacja
} from '../types';
import { DOMYSLNE_LOKALIZACJE } from '../types';

export class SpizarniaService {
  
  // 📋 Pobieranie listy spiżarni użytkownika
  static async getUserSpiżarnie(userId: string): Promise<{ id: string; data: UserSpizarnia; metadata: SpizarniaMetadata }[]> {
    try {
      console.log('SpizarniaService: Pobieranie spiżarni dla użytkownika:', userId);
      
      // Pobierz wszystkie spiżarnie użytkownika
      const userSpizarnieRef = collection(db, 'users', userId, 'spiżarnie');
      const userSpizarnieSnapshot = await getDocs(userSpizarnieRef);
      
      const spiżarnie = [];
      
      // Dla każdej spiżarni pobierz metadane
      for (const userSpizarniaDoc of userSpizarnieSnapshot.docs) {
        const spizarniaId = userSpizarniaDoc.id;
        const userData = userSpizarniaDoc.data() as UserSpizarnia;
        
        // Pobierz metadane spiżarni
        const spizarniaMetadataRef = doc(db, 'spiżarnie', spizarniaId, 'metadata', 'info');
        const metadataDoc = await getDoc(spizarniaMetadataRef);
        
        if (metadataDoc.exists()) {
          spiżarnie.push({
            id: spizarniaId,
            data: userData,
            metadata: metadataDoc.data() as SpizarniaMetadata
          });
        }
      }
      
      console.log('SpizarniaService: Pobrano spiżarnie:', spiżarnie);
      return spiżarnie;
      
    } catch (error) {
      console.error('SpizarniaService: Błąd pobierania spiżarni:', error);
      throw error;
    }
  }
  
  // ➕ Tworzenie nowej spiżarni
  static async createSpiżarnia(
    userId: string, 
    nazwa: string, 
    opis?: string,
    typ: 'osobista' | 'wspólna' = 'osobista',
    ikona?: string
  ): Promise<string> {
    try {
      console.log('SpizarniaService: Tworzenie nowej spiżarni:', { nazwa, typ });
      
      const batch = writeBatch(db);
      
      // 1. Utwórz nową spiżarnię
      const spizarniaRef = doc(collection(db, 'spiżarnie'));
      const spizarniaId = spizarniaRef.id;
      
      // 2. Metadane spiżarni z domyślnymi lokalizacjami
      const metadataRef = doc(db, 'spiżarnie', spizarniaId, 'metadata', 'info');
      
      // Przygotuj domyślne lokalizacje z ID i timestampami
      const domyslneLokalizacje: SpizarniaLokalizacja[] = DOMYSLNE_LOKALIZACJE.map((lok, index) => ({
        id: `default-${index}-${Date.now()}`,
        ...lok,
        createdAt: Timestamp.fromDate(new Date())
      }));
      
      const metadataData: SpizarniaMetadata = {
        nazwa,
        opis,
        typ,
        właściciel: userId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        ikona: ikona || '🏠',
        lokalizacje: domyslneLokalizacje, // Dodaj domyślne lokalizacje
        ustawienia: {
          powiadomieniaOWażności: true,
          dziPrzedWażnością: 3,
          publicznaWidoczność: false
        }
      };
      batch.set(metadataRef, metadataData);
      
      // 3. Dodaj właściciela jako członka
      const czlonekRef = doc(db, 'spiżarnie', spizarniaId, 'członkowie', userId);
      const członekData: SpizarniaCzłonek = {
        role: 'owner',
        joinedAt: serverTimestamp() as Timestamp,
        invitedBy: userId,
        permissions: {
          canAdd: true,
          canEdit: true,
          canDelete: true,
          canInvite: true
        }
      };
      batch.set(czlonekRef, członekData);
      
      // 4. Dodaj spiżarnię do listy użytkownika
      const userSpizarniaRef = doc(db, 'users', userId, 'spiżarnie', spizarniaId);
      const userSpizarniaData: UserSpizarnia = {
        role: 'owner',
        joinedAt: serverTimestamp() as Timestamp
      };
      batch.set(userSpizarniaRef, userSpizarniaData);
      
      // Wykonaj wszystkie operacje atomowo
      await batch.commit();
      
      console.log('SpizarniaService: Utworzono spiżarnię o ID:', spizarniaId);
      return spizarniaId;
      
    } catch (error) {
      console.error('SpizarniaService: Błąd tworzenia spiżarni:', error);
      throw error;
    }
  }
  
  // 📝 Aktualizacja metadanych spiżarni
  static async updateSpizarniaMetadata(
    spizarniaId: string, 
    userId: string,
    updates: Partial<SpizarniaMetadata>
  ): Promise<void> {
    try {
      console.log('SpizarniaService: Aktualizacja spiżarni:', spizarniaId, updates);
      
      // Sprawdź uprawnienia użytkownika
      const hasPermission = await this.checkPermission(spizarniaId, userId, 'edit');
      if (!hasPermission) {
        throw new Error('Brak uprawnień do edycji spiżarni');
      }
      
      const metadataRef = doc(db, 'spiżarnie', spizarniaId, 'metadata', 'info');
      await updateDoc(metadataRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('SpizarniaService: Zaktualizowano spiżarnię');
      
    } catch (error) {
      console.error('SpizarniaService: Błąd aktualizacji spiżarni:', error);
      throw error;
    }
  }
  
  // 🗑️ Usuwanie spiżarni
  static async deleteSpizarnia(spizarniaId: string, userId: string): Promise<void> {
    try {
      console.log('SpizarniaService: Usuwanie spiżarni:', spizarniaId);
      
      // Sprawdź czy użytkownik jest właścicielem
      const członekRef = doc(db, 'spiżarnie', spizarniaId, 'członkowie', userId);
      const członekDoc = await getDoc(członekRef);
      
      if (!członekDoc.exists() || członekDoc.data().role !== 'owner') {
        throw new Error('Tylko właściciel może usunąć spiżarnię');
      }

      // Użyj batch do atomowego usuwania wszystkich dokumentów
      const batch = writeBatch(db);

      // 1. Usuń spiżarnię z kolekcji użytkownika
      const userSpizarniaRef = doc(db, 'users', userId, 'spiżarnie', spizarniaId);
      batch.delete(userSpizarniaRef);

      // 2. Pobierz wszystkich członków i usuń spiżarnię z ich kolekcji
      const członkowieRef = collection(db, 'spiżarnie', spizarniaId, 'członkowie');
      const członkowieSnapshot = await getDocs(członkowieRef);
      
      for (const członekDoc of członkowieSnapshot.docs) {
        const członekId = członekDoc.id;
        const memberSpizarniaRef = doc(db, 'users', członekId, 'spiżarnie', spizarniaId);
        batch.delete(memberSpizarniaRef);
      }

      // 3. Usuń metadane spiżarni
      const metadataRef = doc(db, 'spiżarnie', spizarniaId, 'metadata', 'info');
      batch.delete(metadataRef);

      // 4. Usuń wszystkich członków
      for (const członekDoc of członkowieSnapshot.docs) {
        batch.delete(członekDoc.ref);
      }

      // 5. Pobierz i usuń wszystkie produkty
      const produktyRef = collection(db, 'spiżarnie', spizarniaId, 'produkty');
      const produktySnapshot = await getDocs(produktyRef);
      
      for (const produktDoc of produktySnapshot.docs) {
        batch.delete(produktDoc.ref);
      }

      // 6. Usuń główny dokument spiżarni (folder)
      // Firestore automatycznie usuwa puste kolekcje

      // Wykonaj wszystkie operacje atomowo
      await batch.commit();
      
      console.log('SpizarniaService: Pomyślnie usunięto spiżarnię:', spizarniaId);
      
    } catch (error) {
      console.error('SpizarniaService: Błąd usuwania spiżarni:', error);
      throw error;
    }
  }
  
  // 👥 Pobieranie członków spiżarni
  static async getSpizarniaCzłonkowie(spizarniaId: string): Promise<{ id: string; data: SpizarniaCzłonek }[]> {
    try {
      const członkowieRef = collection(db, 'spiżarnie', spizarniaId, 'członkowie');
      const snapshot = await getDocs(członkowieRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data() as SpizarniaCzłonek
      }));
      
    } catch (error) {
      console.error('SpizarniaService: Błąd pobierania członków:', error);
      throw error;
    }
  }
  
  // 🔒 Sprawdzanie uprawnień
  static async checkPermission(
    spizarniaId: string, 
    userId: string, 
    action: 'view' | 'add' | 'edit' | 'delete' | 'invite'
  ): Promise<boolean> {
    try {
      const członekRef = doc(db, 'spiżarnie', spizarniaId, 'członkowie', userId);
      const członekDoc = await getDoc(członekRef);
      
      if (!członekDoc.exists()) {
        return false;
      }
      
      const członekData = członekDoc.data() as SpizarniaCzłonek;
      
      // Właściciel ma wszystkie uprawnienia
      if (członekData.role === 'owner') {
        return true;
      }
      
      // Sprawdź konkretne uprawnienia
      switch (action) {
        case 'view':
          return true; // Wszyscy członkowie mogą przeglądać
        case 'add':
          return członekData.permissions.canAdd;
        case 'edit':
          return członekData.permissions.canEdit;
        case 'delete':
          return członekData.permissions.canDelete;
        case 'invite':
          return członekData.permissions.canInvite;
        default:
          return false;
      }
      
    } catch (error) {
      console.error('SpizarniaService: Błąd sprawdzania uprawnień:', error);
      return false;
    }
  }
  
  // 📊 Pobieranie statystyk spiżarni
  static async getSpizarniaStats() {
    try {
      // TODO: Implementacja statystyk
      // - liczba produktów
      // - produkty wygasające
      // - ostatnia aktywność
      // - wartość spiżarni
      
      return {
        totalProducts: 0,
        expiringProducts: 0,
        overdueProducts: 0,
        totalValue: 0
      };
      
    } catch (error) {
      console.error('SpizarniaService: Błąd pobierania statystyk:', error);
      throw error;
    }
  }
}

export default SpizarniaService;

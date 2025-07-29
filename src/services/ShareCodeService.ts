// 🔗 Serwis do zarządzania kodami dostępu do spiżarni

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import SpizarniaService from './SpizarniaService';
import type { SpizarniaCzłonek, UserSpizarnia } from '../types';

// 📱 Interface dla kodu dostępu
export interface ShareCode {
  id: string;
  code: string; // 4-cyfrowy kod
  spizarniaId: string;
  createdBy: string; // userId właściciela
  createdAt: Timestamp;
  expiresAt: Timestamp;
  isActive: boolean;
  usedBy?: string; // userId użytkownika który użył kod
  usedAt?: Timestamp;
}

export class ShareCodeService {
  
  // 🎲 Generowanie unikalnego 4-cyfrowego kodu
  private static generateCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // ➕ Tworzenie nowego kodu dostępu (właściciel)
  static async createShareCode(
    spizarniaId: string,
    userId: string,
    expiryHours: number = 24
  ): Promise<ShareCode> {
    try {
      console.log('ShareCodeService: Tworzenie kodu dostępu dla spiżarni:', spizarniaId);
      
      // Sprawdź czy użytkownik jest właścicielem
      const hasPermission = await SpizarniaService.checkPermission(spizarniaId, userId, 'invite');
      if (!hasPermission) {
        throw new Error('Brak uprawnień do tworzenia kodów dostępu');
      }

      // Dezaktywuj istniejące kody dla tej spiżarni
      await this.deactivateExistingCodes(spizarniaId);

      // Generuj unikalny kod
      let code: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        code = this.generateCode();
        const existingCode = await this.findActiveCodeByCode(code);
        isUnique = !existingCode;
        attempts++;
      } while (!isUnique && attempts < maxAttempts);

      if (!isUnique) {
        throw new Error('Nie udało się wygenerować unikalnego kodu');
      }

      // Stwórz kod dostępu
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiryHours);

      const shareCodeData = {
        code,
        spizarniaId,
        createdBy: userId,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
        isActive: true
      };

      const docRef = await addDoc(collection(db, 'shareCodes'), shareCodeData);
      
      console.log('ShareCodeService: Utworzono kod dostępu:', code);
      
      return {
        id: docRef.id,
        ...shareCodeData,
        createdAt: Timestamp.fromDate(new Date())
      } as ShareCode;

    } catch (error) {
      console.error('ShareCodeService: Błąd tworzenia kodu:', error);
      throw error;
    }
  }

  // 🔍 Sprawdzanie czy kod istnieje i jest aktywny
  private static async findActiveCodeByCode(code: string): Promise<ShareCode | null> {
    try {
      const q = query(
        collection(db, 'shareCodes'),
        where('code', '==', code),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as ShareCode;

    } catch (error) {
      console.error('ShareCodeService: Błąd wyszukiwania kodu:', error);
      return null;
    }
  }

  // ❌ Dezaktywacja istniejących kodów dla spiżarni
  private static async deactivateExistingCodes(spizarniaId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'shareCodes'),
        where('spizarniaId', '==', spizarniaId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isActive: false });
      });

      if (snapshot.docs.length > 0) {
        await batch.commit();
        console.log('ShareCodeService: Dezaktywowano', snapshot.docs.length, 'istniejących kodów');
      }

    } catch (error) {
      console.error('ShareCodeService: Błąd dezaktywacji kodów:', error);
    }
  }

  // 🎯 Użycie kodu dostępu (nowy użytkownik)
  static async redeemShareCode(code: string, userId: string): Promise<{
    success: boolean;
    spizarniaId?: string;
    spizarniaNazwa?: string;
    error?: string;
  }> {
    try {
      console.log('ShareCodeService: Próba użycia kodu:', code);
      
      // Znajdź aktywny kod
      const shareCode = await this.findActiveCodeByCode(code);
      
      if (!shareCode) {
        return { success: false, error: 'Kod nie istnieje lub wygasł' };
      }

      // Sprawdź ważność czasową
      const now = new Date();
      const expiryDate = shareCode.expiresAt.toDate();
      
      if (now > expiryDate) {
        return { success: false, error: 'Kod wygasł' };
      }

      // Sprawdź czy kod już został użyty
      if (shareCode.usedBy) {
        return { success: false, error: 'Kod został już użyty' };
      }

      // Sprawdź czy użytkownik już nie jest członkiem
      const existingMember = await this.checkIfUserIsMember(shareCode.spizarniaId, userId);
      if (existingMember) {
        return { success: false, error: 'Jesteś już członkiem tej spiżarni' };
      }

      // Pobierz informacje o spiżarni
      const spizarniaDoc = await getDoc(doc(db, 'spiżarnie', shareCode.spizarniaId));
      const spizarniaNazwa = spizarniaDoc.exists() ? spizarniaDoc.data().nazwa : 'Nieznana spiżarnia';

      // Dodaj użytkownika do spiżarni
      await this.addUserToSpizarnia(shareCode.spizarniaId, userId, shareCode.createdBy);

      // Oznacz kod jako użyty
      const codeRef = doc(db, 'shareCodes', shareCode.id);
      await updateDoc(codeRef, {
        usedBy: userId,
        usedAt: serverTimestamp(),
        isActive: false
      });

      console.log('ShareCodeService: Kod użyty pomyślnie, dodano do spiżarni:', shareCode.spizarniaId);
      
      return {
        success: true,
        spizarniaId: shareCode.spizarniaId,
        spizarniaNazwa
      };

    } catch (error) {
      console.error('ShareCodeService: Błąd użycia kodu:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd' 
      };
    }
  }

  // 👤 Sprawdzenie czy użytkownik jest już członkiem
  private static async checkIfUserIsMember(spizarniaId: string, userId: string): Promise<boolean> {
    try {
      const memberRef = doc(db, 'spiżarnie', spizarniaId, 'członkowie', userId);
      const memberDoc = await getDoc(memberRef);
      return memberDoc.exists();
    } catch (error) {
      console.error('ShareCodeService: Błąd sprawdzania członkostwa:', error);
      return false;
    }
  }

  // ➕ Dodanie użytkownika do spiżarni
  private static async addUserToSpizarnia(
    spizarniaId: string, 
    userId: string, 
    invitedBy: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      // 1. Dodaj jako członka spiżarni
      const memberRef = doc(db, 'spiżarnie', spizarniaId, 'członkowie', userId);
      const memberData: SpizarniaCzłonek = {
        role: 'member',
        joinedAt: serverTimestamp() as Timestamp,
        invitedBy,
        permissions: {
          canAdd: true,
          canEdit: true,
          canDelete: false, // Członkowie nie mogą usuwać
          canInvite: false  // Członkowie nie mogą zapraszać
        }
      };
      batch.set(memberRef, memberData);

      // 2. Dodaj spiżarnię do listy użytkownika
      const userSpizarniaRef = doc(db, 'users', userId, 'spiżarnie', spizarniaId);
      const userSpizarniaData: UserSpizarnia = {
        role: 'member',
        joinedAt: serverTimestamp() as Timestamp
      };
      batch.set(userSpizarniaRef, userSpizarniaData);

      await batch.commit();
      console.log('ShareCodeService: Dodano użytkownika do spiżarni');

    } catch (error) {
      console.error('ShareCodeService: Błąd dodawania użytkownika:', error);
      throw error;
    }
  }

  // 📋 Pobieranie aktywnego kodu dla spiżarni
  static async getActiveCodeForSpizarnia(spizarniaId: string): Promise<ShareCode | null> {
    try {
      const q = query(
        collection(db, 'shareCodes'),
        where('spizarniaId', '==', spizarniaId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const shareCode = {
        id: doc.id,
        ...doc.data()
      } as ShareCode;

      // Sprawdź czy nie wygasł
      const now = new Date();
      const expiryDate = shareCode.expiresAt.toDate();
      
      if (now > expiryDate) {
        // Dezaktywuj wygasły kod
        await updateDoc(doc.ref, { isActive: false });
        return null;
      }

      return shareCode;

    } catch (error) {
      console.error('ShareCodeService: Błąd pobierania kodu:', error);
      return null;
    }
  }

  // 🗑️ Usuwanie/dezaktywacja kodu
  static async deactivateCode(codeId: string, userId: string): Promise<void> {
    try {
      const codeRef = doc(db, 'shareCodes', codeId);
      const codeDoc = await getDoc(codeRef);
      
      if (!codeDoc.exists()) {
        throw new Error('Kod nie istnieje');
      }

      const codeData = codeDoc.data() as ShareCode;
      
      // Sprawdź uprawnienia
      if (codeData.createdBy !== userId) {
        const hasPermission = await SpizarniaService.checkPermission(
          codeData.spizarniaId, 
          userId, 
          'invite'
        );
        if (!hasPermission) {
          throw new Error('Brak uprawnień do usuwania tego kodu');
        }
      }

      await updateDoc(codeRef, { isActive: false });
      console.log('ShareCodeService: Dezaktywowano kod:', codeData.code);

    } catch (error) {
      console.error('ShareCodeService: Błąd dezaktywacji kodu:', error);
      throw error;
    }
  }
}

export default ShareCodeService;

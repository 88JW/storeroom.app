import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Zaproszenie, SpizarniaCzłonek, UserSpizarnia } from '../types';
import { SpizarniaService } from './SpizarniaService';
import { UserService } from './UserService';

export class InvitationService {
  
  // 📧 Wysłanie zaproszenia do spiżarni
  static async sendInvitation(
    spizarniaId: string,
    zapraszającyId: string,
    email: string,
    role: 'admin' | 'member' | 'viewer' = 'member'
  ): Promise<string> {
    try {
      console.log('InvitationService: Wysyłanie zaproszenia do:', email);
      
      // Sprawdź uprawnienia zapraszającego
      const hasPermission = await SpizarniaService.checkPermission(spizarniaId, zapraszającyId, 'invite');
      if (!hasPermission) {
        throw new Error('Brak uprawnień do zapraszania użytkowników');
      }
      
      // Sprawdź czy użytkownik nie jest już członkiem
      const existingMembers = await SpizarniaService.getSpizarniaCzłonkowie(spizarniaId);
      const existingMember = existingMembers.find(member => member.id === email);
      if (existingMember) {
        throw new Error('Użytkownik już jest członkiem tej spiżarni');
      }
      
      // Sprawdź czy nie ma już aktywnego zaproszenia
      const existingInvitations = await this.getPendingInvitations(spizarniaId);
      const existingInvitation = existingInvitations.find(inv => inv.email === email);
      if (existingInvitation) {
        throw new Error('Zaproszenie dla tego adresu email już zostało wysłane');
      }
      
      // Wygeneruj unikalny token
      const token = this.generateInvitationToken();
      
      // Data wygaśnięcia (7 dni od teraz)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Stwórz zaproszenie
      const zaproszenieData: Omit<Zaproszenie, 'id'> = {
        spiżarniaId: spizarniaId,
        zapraszający: zapraszającyId,
        email: email.toLowerCase().trim(),
        role,
        status: 'pending',
        createdAt: serverTimestamp() as Timestamp,
        expiresAt: Timestamp.fromDate(expiresAt),
        token
      };
      
      const zaproszeniaRef = collection(db, 'zaproszenia');
      const docRef = await addDoc(zaproszeniaRef, zaproszenieData);
      
      console.log('InvitationService: Zaproszenie wysłane z ID:', docRef.id);
      return docRef.id;
      
    } catch (error) {
      console.error('InvitationService: Błąd wysyłania zaproszenia:', error);
      throw error;
    }
  }
  
  // 📝 Akceptacja zaproszenia
  static async acceptInvitation(
    invitationId: string,
    userId: string
  ): Promise<void> {
    try {
      console.log('InvitationService: Akceptacja zaproszenia:', invitationId);
      
      // Pobierz zaproszenie
      const invitationRef = doc(db, 'zaproszenia', invitationId);
      const invitationDoc = await getDoc(invitationRef);
      
      if (!invitationDoc.exists()) {
        throw new Error('Zaproszenie nie istnieje');
      }
      
      const invitation = { id: invitationDoc.id, ...invitationDoc.data() } as Zaproszenie;
      
      // Sprawdź status i ważność
      if (invitation.status !== 'pending') {
        throw new Error('Zaproszenie już zostało przetworzone');
      }
      
      if (invitation.expiresAt.toDate() < new Date()) {
        throw new Error('Zaproszenie wygasło');
      }
      
      // Pobierz email użytkownika
      const userProfile = await UserService.getUserProfile(userId);
      if (!userProfile || userProfile.email.toLowerCase() !== invitation.email.toLowerCase()) {
        throw new Error('Zaproszenie nie należy do tego użytkownika');
      }
      
      // Sprawdź czy użytkownik nie jest już członkiem
      const existingMembers = await SpizarniaService.getSpizarniaCzłonkowie(invitation.spiżarniaId);
      const existingMember = existingMembers.find(member => member.id === userId);
      if (existingMember) {
        throw new Error('Już jesteś członkiem tej spiżarni');
      }
      
      // Użyj batch do atomowej operacji
      const batch = writeBatch(db);
      
      // 1. Dodaj użytkownika jako członka spiżarni
      const członekRef = doc(db, 'spiżarnie', invitation.spiżarniaId, 'członkowie', userId);
      const członekData: SpizarniaCzłonek = {
        role: invitation.role,
        joinedAt: serverTimestamp() as Timestamp,
        invitedBy: invitation.zapraszający,
        permissions: this.getRolePermissions(invitation.role)
      };
      batch.set(członekRef, członekData);
      
      // 2. Dodaj spiżarnię do listy użytkownika
      const userSpizarniaRef = doc(db, 'users', userId, 'spiżarnie', invitation.spiżarniaId);
      const userSpizarniaData: UserSpizarnia = {
        role: invitation.role === 'admin' ? 'member' : invitation.role,
        joinedAt: serverTimestamp() as Timestamp
      };
      batch.set(userSpizarniaRef, userSpizarniaData);
      
      // 3. Zaktualizuj status zaproszenia
      batch.update(invitationRef, {
        status: 'accepted'
      });
      
      await batch.commit();
      
      console.log('InvitationService: Zaproszenie zaakceptowane');
      
    } catch (error) {
      console.error('InvitationService: Błąd akceptacji zaproszenia:', error);
      throw error;
    }
  }
  
  // ❌ Odrzucenie zaproszenia
  static async rejectInvitation(invitationId: string): Promise<void> {
    try {
      const invitationRef = doc(db, 'zaproszenia', invitationId);
      await updateDoc(invitationRef, {
        status: 'rejected'
      });
      
      console.log('InvitationService: Zaproszenie odrzucone');
      
    } catch (error) {
      console.error('InvitationService: Błąd odrzucania zaproszenia:', error);
      throw error;
    }
  }
  
  // 🗑️ Anulowanie zaproszenia (przez zapraszającego)
  static async cancelInvitation(
    invitationId: string,
    userId: string
  ): Promise<void> {
    try {
      const invitationRef = doc(db, 'zaproszenia', invitationId);
      const invitationDoc = await getDoc(invitationRef);
      
      if (!invitationDoc.exists()) {
        throw new Error('Zaproszenie nie istnieje');
      }
      
      const invitation = invitationDoc.data() as Zaproszenie;
      
      // Sprawdź uprawnienia
      if (invitation.zapraszający !== userId) {
        const hasPermission = await SpizarniaService.checkPermission(invitation.spiżarniaId, userId, 'invite');
        if (!hasPermission) {
          throw new Error('Brak uprawnień do anulowania zaproszenia');
        }
      }
      
      await deleteDoc(invitationRef);
      
      console.log('InvitationService: Zaproszenie anulowane');
      
    } catch (error) {
      console.error('InvitationService: Błąd anulowania zaproszenia:', error);
      throw error;
    }
  }
  
  // 📋 Pobieranie zaproszeń oczekujących dla spiżarni
  static async getPendingInvitations(spizarniaId: string): Promise<Zaproszenie[]> {
    try {
      const zaproszeniaRef = collection(db, 'zaproszenia');
      const q = query(
        zaproszeniaRef,
        where('spiżarniaId', '==', spizarniaId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Zaproszenie[];
      
    } catch (error) {
      console.error('InvitationService: Błąd pobierania zaproszeń:', error);
      throw error;
    }
  }
  
  // 📧 Pobieranie zaproszeń dla użytkownika (po email)
  static async getUserInvitations(email: string): Promise<Zaproszenie[]> {
    try {
      const zaproszeniaRef = collection(db, 'zaproszenia');
      const q = query(
        zaproszeniaRef,
        where('email', '==', email.toLowerCase().trim()),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      const invitations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Zaproszenie[];
      
      // Filtruj wygasłe zaproszenia
      const now = new Date();
      return invitations.filter(inv => inv.expiresAt.toDate() > now);
      
    } catch (error) {
      console.error('InvitationService: Błąd pobierania zaproszeń użytkownika:', error);
      throw error;
    }
  }
  
  // 🔑 Pobieranie zaproszenia po tokenie
  static async getInvitationByToken(token: string): Promise<Zaproszenie | null> {
    try {
      const zaproszeniaRef = collection(db, 'zaproszenia');
      const q = query(
        zaproszeniaRef,
        where('token', '==', token),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      const invitation = { id: doc.id, ...doc.data() } as Zaproszenie;
      
      // Sprawdź czy nie wygasło
      if (invitation.expiresAt.toDate() < new Date()) {
        return null;
      }
      
      return invitation;
      
    } catch (error) {
      console.error('InvitationService: Błąd pobierania zaproszenia po tokenie:', error);
      return null;
    }
  }
  
  // 🔧 Funkcje pomocnicze
  private static generateInvitationToken(): string {
    // Generuj bezpieczny token (16 znaków hex)
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  private static getRolePermissions(role: 'admin' | 'member' | 'viewer') {
    switch (role) {
      case 'admin':
        return {
          canAdd: true,
          canEdit: true,
          canDelete: true,
          canInvite: true
        };
      case 'member':
        return {
          canAdd: true,
          canEdit: true,
          canDelete: false,
          canInvite: false
        };
      case 'viewer':
        return {
          canAdd: false,
          canEdit: false,
          canDelete: false,
          canInvite: false
        };
      default:
        return {
          canAdd: false,
          canEdit: false,
          canDelete: false,
          canInvite: false
        };
    }
  }
  
  // 🧹 Czyszczenie wygasłych zaproszeń (funkcja utrzymaniowa)
  static async cleanupExpiredInvitations(): Promise<void> {
    try {
      const zaproszeniaRef = collection(db, 'zaproszenia');
      const q = query(
        zaproszeniaRef,
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(q);
      const now = new Date();
      const batch = writeBatch(db);
      
      snapshot.docs.forEach(doc => {
        const invitation = doc.data() as Zaproszenie;
        if (invitation.expiresAt.toDate() < now) {
          batch.update(doc.ref, { status: 'expired' });
        }
      });
      
      await batch.commit();
      
      console.log('InvitationService: Wygasłe zaproszenia oznaczone');
      
    } catch (error) {
      console.error('InvitationService: Błąd czyszczenia zaproszeń:', error);
    }
  }
}

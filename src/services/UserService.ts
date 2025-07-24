// 👤 Serwis do zarządzania użytkownikami

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth, db } from '../firebase';
import type { UserProfile } from '../types';

export class UserService {
  
  // 📝 Rejestracja nowego użytkownika
  static async registerUser(
    email: string, 
    password: string, 
    displayName: string
  ): Promise<User> {
    try {
      console.log('UserService: Rejestracja użytkownika:', email);
      
      // Utwórz konto w Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Zaktualizuj profil w Auth
      await updateProfile(user, { displayName });
      
      // Utwórz dokument profilu w Firestore
      const userProfile: UserProfile = {
        email,
        displayName,
        createdAt: serverTimestamp() as Timestamp,
        lastLoginAt: serverTimestamp() as Timestamp
      };
      
      await setDoc(doc(db, 'users', user.uid, 'profile', 'info'), userProfile);
      
      console.log('UserService: Użytkownik zarejestrowany:', user.uid);
      return user;
      
    } catch (error) {
      console.error('UserService: Błąd rejestracji:', error);
      throw error;
    }
  }
  
  // 🔐 Logowanie użytkownika
  static async loginUser(email: string, password: string): Promise<User> {
    try {
      console.log('UserService: Logowanie użytkownika:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Zaktualizuj ostatnie logowanie
      await this.updateLastLogin(user.uid);
      
      console.log('UserService: Użytkownik zalogowany:', user.uid);
      return user;
      
    } catch (error) {
      console.error('UserService: Błąd logowania:', error);
      throw error;
    }
  }
  
  // 🚪 Wylogowanie użytkownika
  static async logoutUser(): Promise<void> {
    try {
      console.log('UserService: Wylogowanie użytkownika');
      await signOut(auth);
      console.log('UserService: Użytkownik wylogowany');
      
    } catch (error) {
      console.error('UserService: Błąd wylogowania:', error);
      throw error;
    }
  }
  
  // 📋 Pobieranie profilu użytkownika
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('UserService: Pobieranie profilu użytkownika:', userId);
      
      const profileRef = doc(db, 'users', userId, 'profile', 'info');
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        return profileDoc.data() as UserProfile;
      }
      
      return null;
      
    } catch (error) {
      console.error('UserService: Błąd pobierania profilu:', error);
      throw error;
    }
  }
  
  // 📝 Aktualizacja profilu użytkownika
  static async updateUserProfile(
    userId: string, 
    updates: Partial<UserProfile>
  ): Promise<void> {
    try {
      console.log('UserService: Aktualizacja profilu:', userId, updates);
      
      const profileRef = doc(db, 'users', userId, 'profile', 'info');
      await updateDoc(profileRef, updates);
      
      // Jeśli aktualizujemy displayName, zaktualizuj też w Auth
      if (updates.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, { 
          displayName: updates.displayName 
        });
      }
      
      console.log('UserService: Profil zaktualizowany');
      
    } catch (error) {
      console.error('UserService: Błąd aktualizacji profilu:', error);
      throw error;
    }
  }
  
  // ⏰ Aktualizacja czasu ostatniego logowania
  static async updateLastLogin(userId: string): Promise<void> {
    try {
      const profileRef = doc(db, 'users', userId, 'profile', 'info');
      await updateDoc(profileRef, {
        lastLoginAt: serverTimestamp()
      });
      
    } catch (error) {
      console.error('UserService: Błąd aktualizacji ostatniego logowania:', error);
      // Nie rzucamy błędu, bo to nie jest krytyczne
    }
  }
  
  // 🔧 Tworzenie profilu dla istniejącego użytkownika (migracja)
  static async createProfileForExistingUser(user: User): Promise<void> {
    try {
      console.log('UserService: Tworzenie profilu dla istniejącego użytkownika:', user.uid);
      
      // Sprawdź czy profil już istnieje
      const existingProfile = await this.getUserProfile(user.uid);
      if (existingProfile) {
        console.log('UserService: Profil już istnieje');
        return;
      }
      
      // Utwórz nowy profil
      const userProfile: UserProfile = {
        email: user.email || '',
        displayName: user.displayName || 'Użytkownik',
        createdAt: serverTimestamp() as Timestamp,
        lastLoginAt: serverTimestamp() as Timestamp
      };
      
      await setDoc(doc(db, 'users', user.uid, 'profile', 'info'), userProfile);
      
      console.log('UserService: Profil utworzony dla istniejącego użytkownika');
      
    } catch (error) {
      console.error('UserService: Błąd tworzenia profilu:', error);
      throw error;
    }
  }
  
  // 🔍 Sprawdzenie czy użytkownik istnieje
  static async userExists(userId: string): Promise<boolean> {
    try {
      const profileRef = doc(db, 'users', userId, 'profile', 'info');
      const profileDoc = await getDoc(profileRef);
      return profileDoc.exists();
      
    } catch (error) {
      console.error('UserService: Błąd sprawdzania istnienia użytkownika:', error);
      return false;
    }
  }
  
  // 📊 Pobieranie podstawowych statystyk użytkownika
  static async getUserStats(userId: string) {
    try {
      // TODO: Implementacja statystyk użytkownika
      // - liczba spiżarni
      // - liczba produktów
      // - ostatnia aktywność
      
      return {
        totalSpizarnie: 0,
        totalProducts: 0,
        lastActivity: null
      };
      
    } catch (error) {
      console.error('UserService: Błąd pobierania statystyk użytkownika:', error);
      throw error;
    }
  }
}

export default UserService;

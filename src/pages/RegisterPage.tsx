import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import DatabaseInitializer from '../services/DatabaseInitializer';
import { UserService } from '../services/UserService';
import { appTheme } from '../theme/appTheme';
import { RegisterForm } from '../components/common/RegisterForm';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validatePasswords = (password: string, confirmPassword: string): string | null => {
    if (password.length < 6) {
      return 'Hasło musi mieć co najmniej 6 znaków';
    }
    if (password !== confirmPassword) {
      return 'Hasła nie są identyczne';
    }
    return null;
  };

  const handleSubmit = async (
    email: string, 
    password: string, 
    confirmPassword: string, 
    displayName: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Walidacja haseł
      const passwordError = validatePasswords(password, confirmPassword);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      // Walidacja nazwy użytkownika
      if (displayName.trim().length < 2) {
        setError('Nazwa użytkownika musi mieć co najmniej 2 znaki');
        return;
      }

      console.log('🔄 Tworzenie nowego konta użytkownika...');
      
      // Tworzenie konta w Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Konto utworzone pomyślnie!', userCredential.user);

      // Aktualizacja profilu użytkownika z nazwą
      await updateProfile(userCredential.user, {
        displayName: displayName.trim()
      });
      console.log('✅ Profil użytkownika zaktualizowany');

      // Inicjalizacja bazy danych dla nowego użytkownika
      console.log('🔄 Inicjalizacja bazy danych...');
      await DatabaseInitializer.initializeUserDatabase(
        userCredential.user.uid,
        email,
        displayName.trim()
      );
      console.log('✅ Baza danych zainicjalizowana');

      // Aktualizacja ostatniego logowania
      await UserService.updateLastLogin(userCredential.user.uid);
      
      console.log('🎉 Rejestracja zakończona pomyślnie!');
      navigate('/spiżarnie');

    } catch (error: Error | unknown) {
      console.error('❌ Błąd rejestracji:', error);
      
      if (error instanceof Error) {
        // Tłumaczenie błędów Firebase na polski
        switch (error.message) {
          case 'Firebase: Error (auth/email-already-in-use).':
            setError('Ten adres email jest już używany przez inne konto');
            break;
          case 'Firebase: Error (auth/invalid-email).':
            setError('Nieprawidłowy adres email');
            break;
          case 'Firebase: Error (auth/weak-password).':
            setError('Hasło jest zbyt słabe');
            break;
          case 'Firebase: Error (auth/operation-not-allowed).':
            setError('Rejestracja jest obecnie wyłączona');
            break;
          default:
            setError(`Błąd rejestracji: ${error.message}`);
        }
      } else {
        setError('Wystąpił nieoczekiwany błąd podczas rejestracji');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={appTheme}>
      <RegisterForm 
        onSubmit={handleSubmit}
        error={error}
        loading={loading}
      />
    </ThemeProvider>
  );
};

export default RegisterPage;

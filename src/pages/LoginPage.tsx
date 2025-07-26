import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import DatabaseInitializer from '../services/DatabaseInitializer';
import { UserService } from '../services/UserService';
import { appTheme } from '../theme/appTheme';
import { LoginForm } from '../components/common/LoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);

  const handleSubmit = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Zalogowano pomyślnie!', userCredential.user);
      console.log('🔑 USER ID (UID):', userCredential.user.uid);
      console.log('📧 EMAIL:', userCredential.user.email);
      
      // Sprawdź czy użytkownik ma zainicjalizowaną bazę
      const isInitialized = await DatabaseInitializer.isDatabaseInitialized(userCredential.user.uid);
      
      if (!isInitialized) {
        console.log('🔄 Inicjalizacja bazy danych dla nowego użytkownika...');
        await DatabaseInitializer.initializeUserDatabase(
          userCredential.user.uid,
          userCredential.user.email || 'user@example.com',
          userCredential.user.displayName || 'Użytkownik'
        );
        console.log('✅ Baza danych zainicjalizowana automatycznie');
      }
      
      await UserService.updateLastLogin(userCredential.user.uid);
      navigate('/spiżarnie');
    } catch (error: Error | unknown) {
      console.error('Błąd logowania:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Wystąpił nieoczekiwany błąd podczas logowania');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDatabase = async () => {
    setInitLoading(true);
    setError(null);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Brak zalogowanego użytkownika');
      }
      
      await DatabaseInitializer.initializeUserDatabase(
        user.uid,
        user.email || 'user@example.com',
        user.displayName || 'Użytkownik'
      );
      alert('✅ Baza danych została pomyślnie zainicjalizowana!');
    } catch (error) {
      console.error('Błąd inicjalizacji bazy:', error);
      setError('Błąd podczas inicjalizacji bazy danych');
    } finally {
      setInitLoading(false);
    }
  };

  return (
    <ThemeProvider theme={appTheme}>
      <LoginForm 
        onSubmit={handleSubmit}
        onInitializeDatabase={handleInitializeDatabase}
        error={error}
        loading={loading}
        initLoading={initLoading}
      />
    </ThemeProvider>
  );
};

export default LoginPage;
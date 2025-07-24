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
      await DatabaseInitializer.initializeUserDatabase(
        'Gh2ywl1BIAhib9yxK2XOox0WUBL2',
        'test@example.com',
        'Test User'
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
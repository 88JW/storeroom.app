import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { appTheme } from '../theme/appTheme';
import { ResetPasswordForm } from '../components/common/ResetPasswordForm';

const ResetPasswordPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Walidacja email
      if (!email.trim()) {
        setError('Proszę podać adres email');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Proszę podać prawidłowy adres email');
        return;
      }

      console.log('🔄 Wysyłanie email resetujący hasło...');
      
      // Wysłanie email resetującego hasło
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/logowanie`, // URL do przekierowania po kliknięciu w link
        handleCodeInApp: false
      });

      console.log('✅ Email resetujący hasło został wysłany');
      setSuccess(true);

    } catch (error: Error | unknown) {
      console.error('❌ Błąd wysyłania email resetującego:', error);
      
      if (error instanceof Error) {
        // Tłumaczenie błędów Firebase na polski
        switch (error.message) {
          case 'Firebase: Error (auth/user-not-found).':
            setError('Nie znaleziono konta z tym adresem email');
            break;
          case 'Firebase: Error (auth/invalid-email).':
            setError('Nieprawidłowy adres email');
            break;
          case 'Firebase: Error (auth/too-many-requests).':
            setError('Zbyt wiele prób. Spróbuj ponownie za chwilę');
            break;
          case 'Firebase: Error (auth/network-request-failed).':
            setError('Błąd połączenia z internetem. Sprawdź połączenie i spróbuj ponownie');
            break;
          default:
            // Sprawdź czy to błąd z komunikatem o zbyt wielu próbach
            if (error.message.includes('too-many-requests')) {
              setError('Wysłano zbyt wiele próśb resetowania hasła. Spróbuj ponownie za kilka minut');
            } else {
              setError(`Błąd podczas wysyłania email: ${error.message}`);
            }
        }
      } else {
        setError('Wystąpił nieoczekiwany błąd. Spróbuj ponownie');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={appTheme}>
      <ResetPasswordForm 
        onSubmit={handleSubmit}
        error={error}
        success={success}
        loading={loading}
      />
    </ThemeProvider>
  );
};

export default ResetPasswordPage;

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../theme/appTheme';
import { WelcomeHero } from '../components/common/WelcomeHero';

const WelcomePageNew: React.FC = () => {
  const handleGetStarted = () => {
    console.log('🚀 Użytkownik rozpoczyna korzystanie z aplikacji');
  };

  return (
    <ThemeProvider theme={appTheme}>
      <WelcomeHero onGetStarted={handleGetStarted} />
    </ThemeProvider>
  );
};

export default WelcomePageNew;

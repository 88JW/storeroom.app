import React from 'react';
import { Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

interface WelcomeHeroProps {
  onGetStarted?: () => void;
}

const WELCOME_IMAGE_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuAMdXf00L-_BoLZCxbVQ9KnerB4XAT3cUbm6U-a1MIalk3frrXo-V0eKvlB0bWimIP7be1Ah-QCqpyDwHX23GxLzitB7GLp9KUhYuTUMBGn_roRTd1mPFSjSeMtdHkU9fmSCuizru8w7Rvv2f99aqZALSl4LAkf775PTDPzoZGhN822gz2ioPiJl2tqAtcJZMvFxinlNPFZhPMpA8OykLqvY6dMFtzEAXxMv3eBjcIL2KnvGtu4v1ZlvXOutnHLu8GFCQafrsACHNFe";

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ onGetStarted }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh', // Dokładna wysokość viewport
        width: '100vw',
        maxWidth: '100vw',
        bgcolor: 'background.default',
        fontFamily: 'typography.fontFamily',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 3,
          py: 2,
          textAlign: 'center',
          width: '100%',
          maxWidth: '100%',
          minHeight: 0, // Pozwala na zmniejszenie gdy potrzeba
        }}
      >
        <Box sx={{ maxWidth: 400, width: '100%', px: 2 }}>
          {/* Hero Image */}
          <Box
            component="img"
            src={WELCOME_IMAGE_URL}
            alt="Ilustracja przedstawiająca dobrze zaopatrzoną lodówkę z różnymi produktami spożywczymi."
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              maxHeight: '30vh', // Zmniejszone z 35vh
              mb: 2, // Zmniejszone z 3
            }}
          />
          
          {/* Title */}
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              letterSpacing: '-0.025em',
              mb: 1.5, // Zmniejszone z 2
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }, // Zmniejszone rozmiary
            }}
          >
            Storeroom
          </Typography>
          
          {/* Subtitle */}
          <Typography
            variant="body1"
            paragraph
            sx={{
              color: 'text.secondary',
              lineHeight: 1.4, // Zmniejszone z 1.5
              mb: 2, // Zmniejszone z 4
              fontSize: { xs: '0.95rem', sm: '1rem' }, // Zmniejszone rozmiary
            }}
          >
            Zarządzaj zawartością swojej spiżarni. Koniec z marnowaniem jedzenia!
          </Typography>
        </Box>
      </Box>

      {/* Footer with CTA Button - Fixed position */}
      <Box 
        component="footer" 
        sx={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%', 
          px: 3, 
          pb: { xs: 3, sm: 4 }, // Zmniejszone z 4,6
          pt: 2,
          maxWidth: '100%',
          bgcolor: 'background.default', // Upewnij się że ma tło
        }}
      >
        <Box sx={{ maxWidth: 400, mx: 'auto', width: '100%' }}>
          <Button
            variant="contained"
            component={Link}
            to="/logowanie"
            onClick={onGetStarted}
            sx={{
              width: '100%',
              height: 48, // Zmniejszone z 56
              fontSize: '1rem', // Zmniejszone z 1.125rem
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Rozpocznij
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

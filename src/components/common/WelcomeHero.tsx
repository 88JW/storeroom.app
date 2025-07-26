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
        minHeight: '100vh',
        bgcolor: 'background.default',
        fontFamily: 'typography.fontFamily',
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
          textAlign: 'center',
        }}
      >
        <Box sx={{ maxWidth: 384, width: '100%' }}>
          {/* Hero Image */}
          <Box
            component="img"
            src={WELCOME_IMAGE_URL}
            alt="Ilustracja przedstawiająca dobrze zaopatrzoną lodówkę z różnymi produktami spożywczymi."
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              maxHeight: '40vh',
              mb: 4,
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
              mb: 2,
            }}
          >
            Lodówkomat
          </Typography>
          
          {/* Subtitle */}
          <Typography
            variant="body1"
            paragraph
            sx={{
              color: 'text.secondary',
              lineHeight: 1.5,
              mb: 5,
            }}
          >
            Zarządzaj zawartością swojej lodówki i zamrażarki. Koniec z marnowaniem jedzenia!
          </Typography>
        </Box>
      </Box>

      {/* Footer with CTA Button */}
      <Box component="footer" sx={{ width: '100%', px: 3, pb: 8, pt: 4 }}>
        <Button
          variant="contained"
          component={Link}
          to="/logowanie"
          onClick={onGetStarted}
          sx={{
            width: '100%',
            height: 56,
            fontSize: '1.125rem',
            fontWeight: 'bold',
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          Rozpocznij
        </Button>
      </Box>
    </Box>
  );
};

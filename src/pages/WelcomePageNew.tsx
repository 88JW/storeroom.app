import React from 'react';
import { Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const WelcomePageNew: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'var(--background-color)', // Tło z kolorem ze Stichu
        fontFamily: "'Plus Jakarta Sans', sans-serif", // Czcionka ze Stichu
      }}
    >
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
          <Box
            component="img"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMdXf00L-_BoLZCxbVQ9KnerB4XAT3cUbm6U-a1MIalk3frrXo-V0eKvlB0bWimIP7be1Ah-QCqpyDwHX23GxLzitB7GLp9KUhYuTUMBGn_roRTd1mPFSjSeMtdHkU9fmSCuizru8w7Rvv2f99aqZALSl4LAkf775PTDPzoZGhN822gz2ioPiJl2tqAtcJZMvFxinlNPFZhPMpA8OykLqvY6dMFtzEAXxMv3eBjcIL2KnvGtu4v1ZlvXOutnHLu8GFCQafrsACHNFe" // Obrazek z HTML
            alt="Ilustracja przedstawiająca dobrze zaopatrzoną lodówkę z różnymi produktami spożywczymi."
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              maxHeight: '40vh',
              mb: 4,
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
                fontWeight: 'bold',
                color: 'var(--text-primary)', // Kolor tekstu ze Stichu
                letterSpacing: '-0.025em',
                mb: 2,
            }}
          >
            Lodówkomat
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{
                color: 'var(--text-secondary)', // Kolor tekstu ze Stichu
                lineHeight: '1.5',
                mb: 5,
            }}
          >
            Zarządzaj zawartością swojej lodówki i zamrażarki. Koniec z marnowaniem jedzenia!
          </Typography>
        </Box>
      </Box>

      <Box component="footer" sx={{ width: '100%', px: 3, pb: 8, pt: 4 }}>
        <Button
          variant="contained"
          component={Link}
          to="/logowanie"
          sx={{
            width: '100%',
            height: 56,
            fontSize: '1.125rem',
            fontWeight: 'bold',
            bgcolor: 'var(--primary-color)', // Kolor tła przycisku ze Stichu
            color: 'white', // Kolor tekstu przycisku (biały)
            borderRadius: '0.75rem',
            '&:hover': {
                bgcolor: '#1565c0',
            },
          }}
        >
          <Box component="span" sx={{ truncate: '' }}>Rozpocznij</Box>
        </Button>
      </Box>
    </Box>
  );
};

export default WelcomePageNew;

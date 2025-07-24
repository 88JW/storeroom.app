import { createTheme } from '@mui/material/styles';

// 🎨 Główny motyw aplikacji - używany we wszystkich komponentach
export const appTheme = createTheme({
  palette: {
    primary: {
      main: '#1993e5',
    },
    background: {
      default: '#f5f5f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#111418',
      secondary: '#8e8e93',
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'SF Pro Display', system-ui, sans-serif",
    h1: {
      fontWeight: 800,
      fontSize: '2rem',
      color: '#111418',
      textAlign: 'center',
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
      color: '#111418',
      lineHeight: 1.3,
    },
    body1: {
      fontSize: '1rem',
      color: '#8e8e93',
      textAlign: 'center',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.9rem',
      color: '#8e8e93',
      lineHeight: 1.4,
    },
    caption: {
      fontSize: '0.8rem',
      color: '#8e8e93',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          marginBottom: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontWeight: 600,
          textTransform: 'none',
          height: '56px',
          fontSize: '1rem',
          boxShadow: 'none',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1993e5 0%, #1976d2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            boxShadow: '0 4px 16px rgba(25, 147, 229, 0.3)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(25, 147, 229, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 24px rgba(25, 147, 229, 0.4)',
          },
        },
      },
    },
  },
});

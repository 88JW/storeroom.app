import { createTheme } from '@mui/material/styles';

// 🎨 Design System - Centralized colors and styles
export const designTokens = {
  colors: {
    primary: {
      main: '#1993e5',
      light: '#e0e7ff',
      dark: '#1976d2',
      gradient: 'linear-gradient(135deg, #1993e5 0%, #1976d2 100%)',
    },
    secondary: {
      main: '#f0f2f4',
      light: '#f8f9ff',
      dark: '#e5e7eb',
    },
    text: {
      primary: '#111418',
      secondary: '#637488',
      disabled: '#8e8e93',
      hover: '#f5f5f5',
    },
    background: {
      default: '#f5f5f7',
      paper: '#ffffff',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    status: {
      success: '#10b981',
      warning: '#f97316',
      error: '#ef4444',
      info: '#3b82f6',
    },
    expiry: {
      fresh: '#10b981',
      warning: '#f97316',
      expired: '#ef4444',
      backgrounds: {
        fresh: '#f0fdf4',
        warning: '#fff3e0',
        expired: '#ffebee',
        soon: '#fffde7', // dla produktów wygasających w ciągu 3-7 dni
      },
    },
    locations: {
      lodowka: '#3B82F6',
      zamrazarka: '#1E40AF',
      szafka: '#8B5CF6',
      spizarnia: '#F59E0B',
      balkon: '#10B981',
      kuchnia: '#EF4444',
      jadalnia: '#F97316',
      magazyn: '#6B7280',
      piwnica: '#78716C',
      garaz: '#0891B2',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
  },
  shadows: {
    card: '0 2px 12px rgba(0, 0, 0, 0.08)',
    cardHover: '0 8px 24px rgba(0, 0, 0, 0.12)',
    fab: '0 4px 20px rgba(25, 147, 229, 0.3)',
    fabHover: '0 6px 24px rgba(25, 147, 229, 0.4)',
  },
  transitions: {
    fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// 🎨 Główny motyw aplikacji - używany we wszystkich komponentach
export const appTheme = createTheme({
  palette: {
    primary: {
      main: designTokens.colors.primary.main,
      light: designTokens.colors.primary.light,
      dark: designTokens.colors.primary.dark,
    },
    secondary: {
      main: designTokens.colors.secondary.main,
      light: designTokens.colors.secondary.light,
      dark: designTokens.colors.secondary.dark,
    },
    background: {
      default: designTokens.colors.background.default,
      paper: designTokens.colors.background.paper,
    },
    text: {
      primary: designTokens.colors.text.primary,
      secondary: designTokens.colors.text.secondary,
      disabled: designTokens.colors.text.disabled,
    },
    success: {
      main: designTokens.colors.status.success,
    },
    warning: {
      main: designTokens.colors.status.warning,
    },
    error: {
      main: designTokens.colors.status.error,
    },
    info: {
      main: designTokens.colors.status.info,
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
          borderRadius: designTokens.borderRadius.lg,
          boxShadow: designTokens.shadows.card,
          marginBottom: designTokens.spacing.md,
          cursor: 'pointer',
          transition: `all ${designTokens.transitions.normal}`,
          border: '1px solid rgba(0, 0, 0, 0.06)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: designTokens.shadows.cardHover,
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
          borderRadius: designTokens.borderRadius.md,
          fontWeight: 600,
          textTransform: 'none',
          height: '56px',
          fontSize: '1rem',
          boxShadow: 'none',
          transition: `all ${designTokens.transitions.normal}`,
        },
        containedPrimary: {
          background: designTokens.colors.primary.gradient,
          '&:hover': {
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            boxShadow: designTokens.shadows.fab,
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: designTokens.shadows.fab,
          '&:hover': {
            boxShadow: designTokens.shadows.fabHover,
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: designTokens.spacing.md,
          paddingRight: designTokens.spacing.md,
        },
      },
    },
  },
});

// 🎨 Utility functions for consistent styling
export const styleUtils = {
  // Expiry status colors
  getExpiryColor: (days: number) => {
    if (days < 0) return designTokens.colors.expiry.expired;
    if (days <= 2) return designTokens.colors.expiry.expired;
    if (days <= 7) return designTokens.colors.expiry.warning;
    return designTokens.colors.expiry.fresh;
  },
  
  // Location colors
  getLocationColor: (location: string) => {
    const normalizedLocation = location.toLowerCase().replace(/[^a-z]/g, '');
    const locationColors = designTokens.colors.locations as Record<string, string>;
    return locationColors[normalizedLocation] || designTokens.colors.primary.main;
  },

  // Common card styles
  cardStyle: {
    borderRadius: designTokens.borderRadius.lg,
    boxShadow: designTokens.shadows.card,
    transition: `all ${designTokens.transitions.normal}`,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: designTokens.shadows.cardHover,
    },
  },

  // Common flex layouts
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },

  // Common spacing
  spacing: designTokens.spacing,
  
  // Gradients
  gradients: {
    primary: designTokens.colors.primary.gradient,
    background: designTokens.colors.background.gradient,
    card: `linear-gradient(145deg, ${designTokens.colors.background.paper} 0%, ${designTokens.colors.secondary.light} 100%)`,
  },
};

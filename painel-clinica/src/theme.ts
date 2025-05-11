import { createTheme, PaletteOptions } from '@mui/material/styles';

// Definindo cores primárias e secundárias da aplicação
const palette: PaletteOptions = {
  primary: {
    main: '#4F46E5', // Indigo moderno
    light: '#818CF8',
    dark: '#3730A3',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#06B6D4', // Cyan moderno
    light: '#67E8F9',
    dark: '#0891B2',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#EF4444',
    light: '#FCA5A5',
    dark: '#B91C1C',
  },
  warning: {
    main: '#F59E0B',
    light: '#FCD34D',
    dark: '#D97706',
  },
  info: {
    main: '#3B82F6',
    light: '#93C5FD',
    dark: '#1D4ED8',
  },
  success: {
    main: '#10B981',
    light: '#6EE7B7',
    dark: '#047857',
  },
  grey: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  background: {
    default: '#F9FAFB',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    disabled: '#9CA3AF',
  },
};

// Configuração do tema com tipografia, sombras e arredondamentos
export const theme = createTheme({
  palette,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
    '0px 2px 4px rgba(0, 0, 0, 0.06), 0px 4px 6px rgba(0, 0, 0, 0.1)',
    '0px 4px 8px rgba(0, 0, 0, 0.12)',
    '0px 5px 10px rgba(0, 0, 0, 0.14)',
    '0px 6px 12px rgba(0, 0, 0, 0.16)',
    '0px 7px 14px rgba(0, 0, 0, 0.18)',
    '0px 8px 16px rgba(0, 0, 0, 0.20)',
    '0px 9px 18px rgba(0, 0, 0, 0.22)',
    '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
    '0px 11px 22px rgba(0, 0, 0, 0.25)',
    '0px 12px 24px rgba(0, 0, 0, 0.26)',
    '0px 13px 26px rgba(0, 0, 0, 0.28)',
    '0px 14px 28px rgba(0, 0, 0, 0.30)',
    '0px 15px 30px rgba(0, 0, 0, 0.32)',
    '0px 16px 32px rgba(0, 0, 0, 0.34)',
    '0px 17px 34px rgba(0, 0, 0, 0.36)',
    '0px 18px 36px rgba(0, 0, 0, 0.38)',
    '0px 19px 38px rgba(0, 0, 0, 0.40)',
    '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
    '0px 21px 42px rgba(0, 0, 0, 0.44)',
    '0px 22px 44px rgba(0, 0, 0, 0.46)',
    '0px 23px 46px rgba(0, 0, 0, 0.48)',
    '0px 24px 48px rgba(0, 0, 0, 0.50)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          fontWeight: 500,
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;
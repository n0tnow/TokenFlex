import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00e5ff', // Turkuaz
      light: '#5effff',
      dark: '#00b2cc',
      contrastText: '#000',
    },
    secondary: {
      main: '#f50057', // Pembe
      light: '#ff5983',
      dark: '#bb002f',
      contrastText: '#fff',
    },
    background: {
      default: '#0a0a19', // Koyu lacivert
      paper: '#111128',   // Biraz daha açık lacivert
      gradient: 'linear-gradient(135deg, #0f0f2d 0%, #1a1a3a 100%)',
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#b0b0b0',
      disabled: '#6c6c6c',
    },
    error: {
      main: '#ff3d00',
      light: '#ff7539',
      dark: '#c30000',
    },
    warning: {
      main: '#ffab00',
      light: '#ffdd4b',
      dark: '#c67c00',
    },
    info: {
      main: '#2979ff',
      light: '#75a7ff',
      dark: '#004ecb',
    },
    success: {
      main: '#00e676',
      light: '#66ffa6',
      dark: '#00b248',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      letterSpacing: '0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.75rem',
      letterSpacing: '0.02em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2.2rem',
      letterSpacing: '0.01em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.4rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.1rem',
      letterSpacing: '0.05em',
    },
    button: {
      fontWeight: 500,
      letterSpacing: '0.1em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0f0f2d 0%, #1a1a3a 100%)',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#0a0a19',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#2979ff',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 24px',
          boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 8px 20px 0 rgba(0, 0, 0, 0.4)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #00b2cc 0%, #00e5ff 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #00e5ff 0%, #5effff 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #bb002f 0%, #f50057 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #f50057 0%, #ff5983 100%)',
          },
        },
        outlinedPrimary: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
          overflow: 'visible',
          position: 'relative',
          backdropFilter: 'blur(10px)',
          background: 'rgba(17, 17, 40, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.3s',
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(0, 229, 255, 0.3)',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
          backgroundColor: 'rgba(0, 229, 255, 0.1)',
        },
        bar: {
          borderRadius: 4,
          background: 'linear-gradient(90deg, #00b2cc, #00e5ff)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          background: 'rgba(0, 229, 255, 0.1)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          transition: 'all 0.3s',
          '&:hover': {
            background: 'rgba(0, 229, 255, 0.2)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10, 10, 25, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
  },
});

export default theme;
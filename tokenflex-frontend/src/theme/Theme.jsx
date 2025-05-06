// src/theme/Theme.jsx
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00e5ff',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#0a0a19',
      paper: '#111128',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
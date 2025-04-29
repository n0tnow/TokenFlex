import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

// Context Provider
import { WalletProvider } from './contexts/WalletContext';

// Sayfa Bileşenleri (şimdilik sadece Dashboard kullanacağız)
import Dashboard from './pages/Dashboard';

// Basit tema oluştur
const theme = createTheme({
  palette: {
    primary: {
      main: '#0284c7',
    },
    secondary: {
      main: '#f59e0b', 
    },
  },
});

// Basit Header Bileşeni
const SimpleHeader = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          TokenFlex
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WalletProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <SimpleHeader />
          <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
            <Dashboard />
          </Container>
        </Box>
      </WalletProvider>
    </ThemeProvider>
  );
}


export default App;
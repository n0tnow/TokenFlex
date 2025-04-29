import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Tema importu
import theme from './theme/Theme';

// Context Provider
import { WalletProvider } from './contexts/WalletContext';

// Sayfa Bileşenleri
import Dashboard from './pages/Dashboard';
import Vesting from './pages/Vesting';
import BatchOps from './pages/BatchOps';
import Admin from './pages/Admin';

// Layout Bileşeni
import Layout from './components/Layout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WalletProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vesting" element={<Vesting />} />
              <Route path="/batch" element={<BatchOps />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Layout>
        </Router>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;
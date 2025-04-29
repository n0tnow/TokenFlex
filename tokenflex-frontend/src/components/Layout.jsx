import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import Header from './Header';
import { useWalletContext } from '../contexts/WalletContext';

function Layout({ children }) {
  const { connected, publicKey, balance, tokenSymbol, connectWallet, disconnectWallet } = useWalletContext();
  const theme = useTheme();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f0f2d 0%, #1a1a3a 100%)',
    }}>
      {/* Üst Overlay Gradyan Efekt */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '150px',
        background: 'linear-gradient(to bottom, rgba(10, 10, 25, 0.8) 0%, rgba(10, 10, 25, 0) 100%)',
        zIndex: 0,
      }} />
      
      {/* Header Bileşeni */}
      <Header 
        connected={connected}
        publicKey={publicKey}
        balance={balance}
        tokenSymbol={tokenSymbol}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />
      
      {/* Ana İçerik */}
      <Container 
        component="main"
        maxWidth="lg" 
        sx={{ 
          mt: 4, 
          mb: 4, 
          flexGrow: 1,
          position: 'relative',
          zIndex: 1,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '20%',
            left: '-20%',
            width: '40%',
            height: '60%',
            background: `radial-gradient(circle, ${theme.palette.primary.main}22 0%, transparent 70%)`,
            filter: 'blur(60px)',
            zIndex: -1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '10%',
            right: '-10%',
            width: '30%',
            height: '40%',
            background: `radial-gradient(circle, ${theme.palette.secondary.main}22 0%, transparent 70%)`,
            filter: 'blur(60px)',
            zIndex: -1,
          },
        }}
      >
        {children}
      </Container>
      
      {/* Alt Overlay Gradyan Efekt */}
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '150px',
        background: 'linear-gradient(to top, rgba(10, 10, 25, 0.8) 0%, rgba(10, 10, 25, 0) 100%)',
        zIndex: 0,
      }} />
    </Box>
  );
}

export default Layout;
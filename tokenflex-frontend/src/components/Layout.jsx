import { Box, Container } from '@mui/material';
import Header from './Header';
import { useWalletContext } from '../contexts/WalletContext';

function Layout({ children }) {
  const { connected, publicKey, balance, tokenSymbol, connectWallet, disconnectWallet } = useWalletContext();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        connected={connected}
        publicKey={publicKey}
        balance={balance}
        tokenSymbol={tokenSymbol}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />
      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {children}
      </Container>
    </Box>
  );
}

export default Layout;
import { useState } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useWalletContext } from '../contexts/WalletContext';

function Dashboard() {
  const { 
    connected, 
    publicKey, 
    balance, 
    tokenName,
    tokenSymbol,
    loading, 
    error,
    connectWallet,
    transfer
  } = useWalletContext();
  
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [transferStatus, setTransferStatus] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);

  const handleTransfer = async () => {
    if (!amount || !recipientAddress) {
      setTransferStatus({
        success: false,
        message: 'Please enter recipient address and amount'
      });
      return;
    }
    
    setTransferLoading(true);
    try {
      const result = await transfer(recipientAddress, parseInt(amount));
      setTransferStatus({
        success: result.success,
        message: result.success ? 'Transfer successful!' : `Transfer failed: ${result.error}`
      });
      
      if (result.success) {
        // Başarılı transferden sonra formu temizle
        setRecipientAddress('');
        setAmount('');
      }
    } catch (err) {
      setTransferStatus({
        success: false,
        message: `Error: ${err.message}`
      });
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {!connected ? (
        <Paper sx={{ p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" gutterBottom>
            Welcome to TokenFlex
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please connect your Freighter wallet to use the TokenFlex features.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<AccountBalanceWalletIcon />}
            onClick={connectWallet}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Connect Wallet'}
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          
          {/* Bakiye ve Token Bilgileri Kartı */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ pb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Token Balance
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Typography variant="h3" color="primary" gutterBottom>
                      {balance} {tokenSymbol}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Token Details
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">Name:</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" fontWeight="medium">{tokenName}</Typography>
                        </Grid>
                        
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">Symbol:</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="body2" fontWeight="medium">{tokenSymbol}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Wallet
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalanceWalletIcon color="action" sx={{ mr: 1 }} />
                        <Chip 
                          size="small" 
                          label={publicKey ? `${publicKey.substring(0, 6)}...${publicKey.substring(publicKey.length - 4)}` : ''} 
                        />
                      </Box>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Transfer Kartı */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transfer Tokens
                </Typography>
                
                {transferStatus && (
                  <Alert 
                    severity={transferStatus.success ? "success" : "error"}
                    sx={{ mb: 2 }}
                    onClose={() => setTransferStatus(null)}
                  >
                    {transferStatus.message}
                  </Alert>
                )}
                
                <Box component="form" noValidate>
                  <TextField
                    label="Recipient Address"
                    placeholder="G..."
                    fullWidth
                    margin="normal"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    disabled={transferLoading}
                  />
                  
                  <TextField
                    label="Amount"
                    fullWidth
                    margin="normal"
                    type="number"
                    InputProps={{
                      endAdornment: <Typography color="text.secondary">{tokenSymbol}</Typography>
                    }}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={transferLoading}
                  />
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Available: {balance} {tokenSymbol}
                    </Typography>
                    
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={transferLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      onClick={handleTransfer}
                      disabled={transferLoading || !recipientAddress || !amount || parseInt(amount) <= 0 || parseInt(amount) > balance}
                    >
                      {transferLoading ? 'Sending...' : 'Send'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            
            {/* Hızlı Transfer Kartı */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Send
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setAmount(Math.floor(balance * 0.25).toString())}
                    disabled={loading || transferLoading}
                  >
                    25%
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => setAmount(Math.floor(balance * 0.5).toString())}
                    disabled={loading || transferLoading}
                  >
                    50%
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => setAmount(Math.floor(balance * 0.75).toString())}
                    disabled={loading || transferLoading}
                  >
                    75%
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => setAmount(balance.toString())}
                    disabled={loading || transferLoading}
                  >
                    Max
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default Dashboard;
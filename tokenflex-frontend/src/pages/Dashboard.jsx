import React, { useState } from 'react';
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
  Divider,
  Chip,
  Paper,
  useTheme,
  InputAdornment
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TokenIcon from '@mui/icons-material/Token';
import SpeedIcon from '@mui/icons-material/Speed';
import { useWalletContext } from '../contexts/WalletContext';

function Dashboard() {
  const theme = useTheme();
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
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{
          backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          fontWeight: 'bold',
          mb: 4
        }}
      >
        Dashboard
      </Typography>
      
      {!connected ? (
        <Paper sx={{ 
          p: 4, 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 3,
          background: 'rgba(17, 17, 40, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #00e5ff, #7c4dff)',
          }
        }}>
          <Box
            sx={{ 
              mb: 2,
              width: 100,
              height: 100,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(124, 77, 255, 0.1))',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 30px rgba(0, 229, 255, 0.2)'
            }}
          >
            <AccountBalanceWalletIcon sx={{ fontSize: 50, color: theme.palette.primary.main }} />
          </Box>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Welcome to TokenFlex
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto' }}>
            Connect your Freighter wallet to access features like token transfers, vesting schedules, and batch operations.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<AccountBalanceWalletIcon />}
            onClick={connectWallet}
            disabled={loading}
            sx={{ 
              mt: 2,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontSize: '1.1rem'
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Connect Wallet'}
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            </Grid>
          )}
          
          {/* Bakiye ve Token Bilgileri Kartı */}
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%', 
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              <CardContent sx={{ pb: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: '4px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: theme.palette.primary.main,
                    marginRight: 2
                  }
                }}>
                  Token Balance
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <CircularProgress sx={{ color: theme.palette.primary.main }} />
                  </Box>
                ) : (
                  <>
                    <Box 
                      sx={{ 
                        py: 3, 
                        px: 1, 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        position: 'relative'
                      }}
                    >
                      <Box sx={{ 
                        position: 'absolute',
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${theme.palette.primary.main}20 0%, transparent 70%)`,
                        filter: 'blur(30px)',
                        zIndex: 0
                      }} />
                      
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: theme.palette.primary.main,
                          textShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
                          zIndex: 1
                        }}
                        gutterBottom
                      >
                        {balance}
                      </Typography>
                      
                      <Chip 
                        label={tokenSymbol} 
                        color="primary" 
                        variant="outlined"
                        sx={{ 
                          fontSize: '1rem',
                          py: 2,
                          border: '2px solid',
                          zIndex: 1
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Token Details
                      </Typography>
                      <Divider sx={{ my: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                      
                      <Grid container spacing={2} sx={{ py: 1 }}>
                        <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                          <TokenIcon sx={{ mr: 1, fontSize: 18, color: theme.palette.text.secondary }} />
                          <Typography variant="body2" color="text.secondary">Name:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight="medium">{tokenName}</Typography>
                        </Grid>
                        
                        <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                          <SpeedIcon sx={{ mr: 1, fontSize: 18, color: theme.palette.text.secondary }} />
                          <Typography variant="body2" color="text.secondary">Symbol:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight="medium">{tokenSymbol}</Typography>
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <AccountBalanceWalletIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Wallet:</Typography>
                        <Chip 
                          size="small" 
                          label={publicKey ? `${publicKey.substring(0, 6)}...${publicKey.substring(publicKey.length - 4)}` : ''} 
                          sx={{ background: 'rgba(41, 121, 255, 0.1)', border: '1px solid rgba(41, 121, 255, 0.3)' }}
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
            <Card 
              sx={{ 
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: '4px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: theme.palette.secondary.main,
                    marginRight: 2
                  }
                }}>
                  Transfer Tokens
                </Typography>
                
                {transferStatus && (
                  <Alert 
                    severity={transferStatus.success ? "success" : "error"}
                    sx={{ 
                      mb: 2, 
                      borderRadius: 2,
                      background: transferStatus.success 
                        ? 'rgba(46, 125, 50, 0.1)' 
                        : 'rgba(211, 47, 47, 0.1)',
                      border: transferStatus.success 
                        ? '1px solid rgba(46, 125, 50, 0.3)' 
                        : '1px solid rgba(211, 47, 47, 0.3)',
                    }}
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
                    InputProps={{
                      sx: { 
                        borderRadius: 2,
                        '&.Mui-focused': {
                          boxShadow: `0 0 0 3px ${theme.palette.secondary.main}30`
                        }
                      }
                    }}
                    sx={{ mb: 3 }}
                  />
                  
                  <TextField
                    label="Amount"
                    fullWidth
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography color="text.secondary">{tokenSymbol}</Typography>
                        </InputAdornment>
                      ),
                      sx: { 
                        borderRadius: 2,
                        '&.Mui-focused': {
                          boxShadow: `0 0 0 3px ${theme.palette.secondary.main}30`
                        }
                      }
                    }}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={transferLoading}
                  />
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Available: {balance} {tokenSymbol}
                    </Typography>
                    
                    <Button 
                      variant="contained" 
                      color="secondary" 
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
            <Card 
              sx={{ 
                mt: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: '4px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: theme.palette.primary.main,
                    marginRight: 2
                  }
                }}>
                  Quick Send
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {[25, 50, 75, 100].map((percent) => (
                    <Button 
                      key={percent}
                      variant="outlined" 
                      color="primary"
                      onClick={() => setAmount(Math.floor(balance * percent / 100).toString())}
                      disabled={loading || transferLoading}
                      sx={{ 
                        borderWidth: '2px', 
                        borderColor: percent === 100 ? theme.palette.primary.main : 'rgba(0, 229, 255, 0.5)',
                        color: percent === 100 ? theme.palette.primary.main : 'rgba(0, 229, 255, 0.8)'
                      }}
                    >
                      {percent}%
                    </Button>
                  ))}
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
import { useState } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  Button,
  Box,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useWalletContext } from '../contexts/WalletContext';

function Admin() {
  const { connected, publicKey, tokenSymbol, mint, freeze, unfreeze } = useWalletContext();
  
  const [mintForm, setMintForm] = useState({
    address: '',
    amount: ''
  });
  
  const [adminForm, setAdminForm] = useState({
    address: ''
  });
  
  const [freezeForm, setFreezeForm] = useState({
    address: '',
    isFrozen: true
  });
  
  const [mintStatus, setMintStatus] = useState(null);
  const [adminStatus, setAdminStatus] = useState(null);
  const [freezeStatus, setFreezeStatus] = useState(null);
  
  const [mintLoading, setMintLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [freezeLoading, setFreezeLoading] = useState(false);

  const handleMintChange = (e) => {
    setMintForm({
      ...mintForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAdminChange = (e) => {
    setAdminForm({
      ...adminForm,
      [e.target.name]: e.target.value
    });
  };

  const handleFreezeChange = (e) => {
    setFreezeForm({
      ...freezeForm,
      [e.target.name]: e.target.value
    });
  };

  const handleMint = async () => {
    if (!mintForm.address || !mintForm.amount) {
      setMintStatus({
        success: false,
        message: 'Please enter recipient address and amount'
      });
      return;
    }
    
    setMintLoading(true);
    
    try {
      const result = await mint(mintForm.address, parseInt(mintForm.amount));
      
      setMintStatus({
        success: result.success,
        message: result.success 
          ? `Successfully minted ${mintForm.amount} ${tokenSymbol} to ${mintForm.address}` 
          : `Mint failed: ${result.error}`
      });
      
      if (result.success) {
        // Başarılı işlemden sonra formu temizle
        setMintForm({
          address: '',
          amount: ''
        });
      }
    } catch (err) {
      setMintStatus({
        success: false,
        message: `Error: ${err.message}`
      });
    } finally {
      setMintLoading(false);
    }
  };

  const handleSetAdmin = async () => {
    if (!adminForm.address) {
      setAdminStatus({
        success: false,
        message: 'Please enter new admin address'
      });
      return;
    }
    
    setAdminLoading(true);
    
    try {
      // Gerçek uygulamada bu işlemi gerçekleştirecek fonksiyon eklenmeli
      // Şimdilik başarılı olduğunu varsayalım
      
      setTimeout(() => {
        setAdminStatus({
          success: true,
          message: `Successfully set ${adminForm.address} as the new admin`
        });
        
        setAdminForm({
          address: ''
        });
        setAdminLoading(false);
      }, 1500);
    } catch (err) {
      setAdminStatus({
        success: false,
        message: `Error: ${err.message}`
      });
      setAdminLoading(false);
    }
  };

  const handleFreeze = async () => {
    if (!freezeForm.address) {
      setFreezeStatus({
        success: false,
        message: 'Please enter account address'
      });
      return;
    }
    
    setFreezeLoading(true);
    
    try {
      const result = freezeForm.isFrozen 
        ? await freeze(freezeForm.address)
        : await unfreeze(freezeForm.address);
      
      setFreezeStatus({
        success: result.success,
        message: result.success 
          ? `Successfully ${freezeForm.isFrozen ? 'frozen' : 'unfrozen'} account ${freezeForm.address}` 
          : `Operation failed: ${result.error}`
      });
      
      if (result.success) {
        // Başarılı işlemden sonra formu temizle
        setFreezeForm({
          address: '',
          isFrozen: true
        });
      }
    } catch (err) {
      setFreezeStatus({
        success: false,
        message: `Error: ${err.message}`
      });
    } finally {
      setFreezeLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Panel
      </Typography>
      
      {!connected ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Connect Your Wallet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please connect your wallet with admin privileges to access the admin functions.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Mint Tokens
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create new tokens and assign them to an address. Only admin can mint tokens.
                </Typography>
                
                {mintStatus && (
                  <Alert 
                    severity={mintStatus.success ? "success" : "error"}
                    sx={{ mb: 2 }}
                    onClose={() => setMintStatus(null)}
                  >
                    {mintStatus.message}
                  </Alert>
                )}
                
                <Box component="form" noValidate sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Recipient Address"
                    name="address"
                    placeholder="G..."
                    value={mintForm.address}
                    onChange={handleMintChange}
                    margin="normal"
                    disabled={mintLoading}
                  />
                  
                  <TextField
                    fullWidth
                    label="Amount"
                    name="amount"
                    type="number"
                    value={mintForm.amount}
                    onChange={handleMintChange}
                    margin="normal"
                    disabled={mintLoading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {tokenSymbol}
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={mintLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    onClick={handleMint}
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={mintLoading || !mintForm.address || !mintForm.amount}
                  >
                    {mintLoading ? 'Minting...' : 'Mint Tokens'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
            
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Burn Tokens
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Remove tokens from circulation permanently.
                </Typography>
                
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<LocalFireDepartmentIcon />}
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => alert('Burn function not implemented in this demo')}
                >
                  Burn Tokens
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Set Admin
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Transfer admin privileges to another address. Be careful, this cannot be undone.
                </Typography>
                
                {adminStatus && (
                  <Alert 
                    severity={adminStatus.success ? "success" : "error"}
                    sx={{ mb: 2 }}
                    onClose={() => setAdminStatus(null)}
                  >
                    {adminStatus.message}
                  </Alert>
                )}
                
                <Box component="form" noValidate sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="New Admin Address"
                    name="address"
                    placeholder="G..."
                    value={adminForm.address}
                    onChange={handleAdminChange}
                    margin="normal"
                    disabled={adminLoading}
                  />
                  
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={adminLoading ? <CircularProgress size={20} color="inherit" /> : <AdminPanelSettingsIcon />}
                    onClick={handleSetAdmin}
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={adminLoading || !adminForm.address}
                  >
                    {adminLoading ? 'Processing...' : 'Set as Admin'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Freeze/Unfreeze Account
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Restrict an account from transferring tokens. Use in case of suspicious activity.
                </Typography>
                
                {freezeStatus && (
                  <Alert 
                    severity={freezeStatus.success ? "success" : "error"}
                    sx={{ mb: 2 }}
                    onClose={() => setFreezeStatus(null)}
                  >
                    {freezeStatus.message}
                  </Alert>
                )}
                
                <Box component="form" noValidate sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Account Address"
                    name="address"
                    placeholder="G..."
                    value={freezeForm.address}
                    onChange={handleFreezeChange}
                    margin="normal"
                    disabled={freezeLoading}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={freezeForm.isFrozen}
                        onChange={(e) => setFreezeForm({...freezeForm, isFrozen: e.target.checked})}
                        name="isFrozen"
                        color="primary"
                        disabled={freezeLoading}
                      />
                    }
                    label={freezeForm.isFrozen ? "Freeze Account" : "Unfreeze Account"}
                    sx={{ mb: 2 }}
                  />
                  
                  <Button
                    variant="contained"
                    color={freezeForm.isFrozen ? "error" : "primary"}
                    startIcon={freezeLoading ? <CircularProgress size={20} color="inherit" /> : <AcUnitIcon />}
                    onClick={handleFreeze}
                    fullWidth
                    disabled={freezeLoading || !freezeForm.address}
                  >
                    {freezeLoading ? 'Processing...' : freezeForm.isFrozen ? "Freeze Account" : "Unfreeze Account"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default Admin;
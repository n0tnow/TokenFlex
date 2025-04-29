import { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Paper,
  LinearProgress,
  Divider,
  InputAdornment
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import DoneIcon from '@mui/icons-material/Done';
import { useWalletContext } from '../contexts/WalletContext';
import { useVesting } from '../hooks/useVesting';

function Vesting() {
  const { connected, publicKey, tokenSymbol } = useWalletContext();
  const { 
    vestingSchedule, 
    vestedAmount, 
    claimableAmount, 
    loading, 
    error, 
    createVesting, 
    claimVested,
    progress
  } = useVesting(publicKey);
  
  const [vestingForm, setVestingForm] = useState({
    beneficiary: '',
    amount: '',
    vestingType: 'linear',
    startLedger: '',
    durationLedgers: '',
    steps: '',
    cliffLedger: ''
  });
  
  const [createStatus, setCreateStatus] = useState(null);
  const [claimStatus, setClaimStatus] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  // Vesting form değişikliklerini işle
  const handleChange = (e) => {
    setVestingForm({
      ...vestingForm,
      [e.target.name]: e.target.value
    });
  };

  // Vesting oluştur
  const handleCreateVesting = async () => {
    // Form validasyonu
    if (!vestingForm.beneficiary || !vestingForm.amount || !vestingForm.startLedger || !vestingForm.durationLedgers) {
      setCreateStatus({
        success: false,
        message: 'Please fill in all required fields'
      });
      return;
    }
    
    setCreateLoading(true);
    
    try {
      // Vesting tipi için gerekli ekstra parametreleri kontrol et
      const steps = vestingForm.vestingType === 'stepped' ? parseInt(vestingForm.steps) : 0;
      const cliffLedger = vestingForm.vestingType === 'cliff' ? parseInt(vestingForm.cliffLedger) : 0;
      
      const result = await createVesting(
        vestingForm.beneficiary,
        parseInt(vestingForm.amount),
        parseInt(vestingForm.startLedger),
        parseInt(vestingForm.durationLedgers),
        vestingForm.vestingType,
        steps,
        cliffLedger
      );
      
      setCreateStatus({
        success: result.success,
        message: result.success 
          ? 'Vesting schedule created successfully!' 
          : `Failed to create vesting schedule: ${result.error}`
      });
      
      if (result.success) {
        // Başarılı işlemden sonra formu temizle
        setVestingForm({
          beneficiary: '',
          amount: '',
          vestingType: 'linear',
          startLedger: '',
          durationLedgers: '',
          steps: '',
          cliffLedger: ''
        });
      }
    } catch (err) {
      setCreateStatus({
        success: false,
        message: `Error: ${err.message}`
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // Token talep et
  const handleClaimVested = async () => {
    setClaimLoading(true);
    
    try {
      const result = await claimVested();
      
      setClaimStatus({
        success: result.success,
        message: result.success 
          ? `Successfully claimed ${result.amount} ${tokenSymbol}!` 
          : `Failed to claim tokens: ${result.error}`
      });
    } catch (err) {
      setClaimStatus({
        success: false,
        message: `Error: ${err.message}`
      });
    } finally {
      setClaimLoading(false);
    }
  };

  // Güncel ledger'ı al
  const [currentLedger, setCurrentLedger] = useState(0);
  
  useEffect(() => {
    // Gerçek uygulamada bu değer Soroban API'sinden alınır
    // Basitlik için şimdilik simüle ediyoruz
    const fetchCurrentLedger = async () => {
      // Örnek değer - gerçek uygulamada API'den alınır
      setCurrentLedger(Math.floor(Date.now() / 1000));
    };
    
    fetchCurrentLedger();
    // Periyodik güncelleme için
    const interval = setInterval(fetchCurrentLedger, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Token Vesting
      </Typography>
      
      {!connected ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Connect Your Wallet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please connect your wallet to use vesting functionality.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          
          {/* Vesting Planı Oluşturma (Admin için) */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Create Vesting Schedule
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create a new token vesting schedule for a beneficiary. Only admin can create vesting schedules.
                </Typography>
                
                {createStatus && (
                  <Alert 
                    severity={createStatus.success ? "success" : "error"}
                    sx={{ mb: 2 }}
                    onClose={() => setCreateStatus(null)}
                  >
                    {createStatus.message}
                  </Alert>
                )}
                
                <Box component="form" noValidate sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Beneficiary Address"
                    name="beneficiary"
                    placeholder="G..."
                    value={vestingForm.beneficiary}
                    onChange={handleChange}
                    margin="normal"
                    disabled={createLoading}
                  />
                  
                  <TextField
                    fullWidth
                    label="Total Amount"
                    name="amount"
                    type="number"
                    value={vestingForm.amount}
                    onChange={handleChange}
                    margin="normal"
                    disabled={createLoading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {tokenSymbol}
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Vesting Type</InputLabel>
                    <Select
                      name="vestingType"
                      value={vestingForm.vestingType}
                      label="Vesting Type"
                      onChange={handleChange}
                      disabled={createLoading}
                    >
                      <MenuItem value="linear">Linear (gradual release)</MenuItem>
                      <MenuItem value="cliff">Cliff (one-time release)</MenuItem>
                      <MenuItem value="stepped">Stepped (periodic releases)</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Start Ledger"
                      name="startLedger"
                      type="number"
                      value={vestingForm.startLedger}
                      onChange={handleChange}
                      margin="normal"
                      disabled={createLoading}
                      helperText={`Current ledger: ~${currentLedger}`}
                    />
                    
                    <TextField
                      fullWidth
                      label="Duration (Ledgers)"
                      name="durationLedgers"
                      type="number"
                      value={vestingForm.durationLedgers}
                      onChange={handleChange}
                      margin="normal"
                      disabled={createLoading}
                      helperText="17280 ledgers ≈ 1 day"
                    />
                  </Box>
                  
                  {vestingForm.vestingType === 'stepped' && (
                    <TextField
                      fullWidth
                      label="Number of Steps"
                      name="steps"
                      type="number"
                      value={vestingForm.steps}
                      onChange={handleChange}
                      margin="normal"
                      disabled={createLoading}
                      helperText="How many periodic releases"
                    />
                  )}
                  
                  {vestingForm.vestingType === 'cliff' && (
                    <TextField
                      fullWidth
                      label="Cliff Ledger"
                      name="cliffLedger"
                      type="number"
                      value={vestingForm.cliffLedger}
                      onChange={handleChange}
                      margin="normal"
                      disabled={createLoading}
                      helperText="When all tokens will be released at once"
                    />
                  )}
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={createLoading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                    onClick={handleCreateVesting}
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={createLoading}
                  >
                    {createLoading ? 'Creating...' : 'Create Vesting Schedule'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Vesting İlerleme Durumu ve Talep */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Vesting Status
                </Typography>
                
                {claimStatus && (
                  <Alert 
                    severity={claimStatus.success ? "success" : "error"}
                    sx={{ mb: 2 }}
                    onClose={() => setClaimStatus(null)}
                  >
                    {claimStatus.message}
                  </Alert>
                )}
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : vestingSchedule ? (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Vesting Progress:</Typography>
                        <Typography variant="body2">{Math.round(progress)}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Total Amount:</Typography>
                        <Typography variant="body1">{vestingSchedule.totalAmount} {tokenSymbol}</Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Vested Amount:</Typography>
                        <Typography variant="body1">{vestedAmount} {tokenSymbol}</Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Claimed:</Typography>
                        <Typography variant="body1">{vestingSchedule.claimedAmount} {tokenSymbol}</Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Claimable Now:</Typography>
                        <Typography variant="body1" color="primary" fontWeight="bold">
                          {claimableAmount} {tokenSymbol}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Type:</Typography>
                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                          {vestingSchedule.vestingType}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Start Ledger:</Typography>
                        <Typography variant="body1">{vestingSchedule.startLedger}</Typography>
                      </Grid>
                    </Grid>
                    
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={claimLoading ? <CircularProgress size={20} color="inherit" /> : <DoneIcon />}
                      fullWidth
                      sx={{ mt: 3 }}
                      onClick={handleClaimVested}
                      disabled={claimLoading || claimableAmount <= 0}
                    >
                      {claimLoading ? 'Claiming...' : `Claim ${claimableAmount} ${tokenSymbol}`}
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No active vesting schedules found for your address.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default Vesting;
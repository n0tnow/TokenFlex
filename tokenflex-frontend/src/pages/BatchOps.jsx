import { useState } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  Button,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  InputAdornment
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useWalletContext } from '../contexts/WalletContext';

function BatchOps() {
  const { connected, balance, tokenSymbol, batchTransferTokens, loading } = useWalletContext();
  
  const [recipients, setRecipients] = useState([{ address: '', amount: '' }]);
  const [batchStatus, setBatchStatus] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);

  const handleAddRecipient = () => {
    setRecipients([...recipients, { address: '', amount: '' }]);
  };

  const handleRemoveRecipient = (index) => {
    if (recipients.length <= 1) return;
    
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
  };

  const handleRecipientChange = (index, field, value) => {
    const newRecipients = [...recipients];
    newRecipients[index] = {
      ...newRecipients[index],
      [field]: value
    };
    setRecipients(newRecipients);
  };

  const handleBatchTransfer = async () => {
    // Formun validasyonunu yap
    const isValid = recipients.every(r => r.address && r.amount && parseInt(r.amount) > 0);
    
    if (!isValid) {
      setBatchStatus({
        success: false,
        message: 'Please fill in all recipient addresses and amounts'
      });
      return;
    }
    
    setBatchLoading(true);
    
    try {
      // Adresleri ve miktarları ayrı dizilerde topla
      const addresses = recipients.map(r => r.address);
      const amounts = recipients.map(r => parseInt(r.amount));
      
      // Toplu transfer işlemini gerçekleştir
      const result = await batchTransferTokens(addresses, amounts);
      
      setBatchStatus({
        success: result.success,
        message: result.success 
          ? 'Batch transfer completed successfully!' 
          : `Batch transfer failed: ${result.error}`
      });
      
      if (result.success) {
        // Başarılı transferden sonra formu temizle
        setRecipients([{ address: '', amount: '' }]);
      }
    } catch (err) {
      setBatchStatus({
        success: false,
        message: `Error: ${err.message}`
      });
    } finally {
      setBatchLoading(false);
    }
  };

  // Toplam gönderim miktarını hesapla
  const calculateTotal = () => {
    return recipients.reduce((sum, r) => sum + (parseInt(r.amount) || 0), 0);
  };

  // CSV veya metin formatındaki birden çok adres/miktarı otomatik olarak dolduran yardımcı fonksiyon
  const handleBulkPaste = (e) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData.getData('Text');
    const lines = clipboardData.split(/[\n,]/).filter(line => line.trim());
    
    // Her satırı adres ve miktar olarak ayır
    const newRecipients = [];
    
    for (let i = 0; i < lines.length; i += 2) {
      if (i + 1 < lines.length) {
        const address = lines[i].trim();
        const amount = lines[i + 1].trim();
        
        if (address && amount) {
          newRecipients.push({ address, amount });
        }
      }
    }
    
    if (newRecipients.length > 0) {
      setRecipients(newRecipients);
    }
  };

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Batch Operations
      </Typography>
      
      {!connected ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Connect Your Wallet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please connect your wallet to use batch transfer functionality.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Batch Transfer
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Send tokens to multiple recipients in a single transaction. This saves on transaction fees and is more efficient.
                </Typography>
                
                {batchStatus && (
                  <Alert 
                    severity={batchStatus.success ? "success" : "error"}
                    sx={{ mb: 2 }}
                    onClose={() => setBatchStatus(null)}
                  >
                    {batchStatus.message}
                  </Alert>
                )}
                
                <Box 
                  component="form" 
                  noValidate 
                  sx={{ mt: 2 }}
                  onPaste={handleBulkPaste}
                >
                  <Box sx={{ mb: 3, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tip: You can bulk paste addresses and amounts from CSV or text (format: address, amount, address, amount, ...)
                    </Typography>
                    <Typography variant="body2" color="primary">
                      Click here and paste your data
                    </Typography>
                  </Box>
                  
                  {recipients.map((recipient, index) => (
                    <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label={`Recipient Address ${index + 1}`}
                          placeholder="G..."
                          value={recipient.address}
                          onChange={(e) => handleRecipientChange(index, 'address', e.target.value)}
                          disabled={batchLoading}
                        />
                      </Grid>
                      <Grid item xs={10} sm={5}>
                        <TextField
                          fullWidth
                          label="Amount"
                          type="number"
                          value={recipient.amount}
                          onChange={(e) => handleRecipientChange(index, 'amount', e.target.value)}
                          disabled={batchLoading}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {tokenSymbol}
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={2} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveRecipient(index)}
                          disabled={recipients.length <= 1 || batchLoading}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddRecipient}
                    sx={{ mb: 3 }}
                    disabled={batchLoading}
                  >
                    Add Recipient
                  </Button>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2">
                        Total: {calculateTotal()} {tokenSymbol}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Available: {balance} {tokenSymbol}
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={batchLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      onClick={handleBatchTransfer}
                      disabled={
                        batchLoading || 
                        loading || 
                        calculateTotal() <= 0 || 
                        calculateTotal() > balance ||
                        !recipients.every(r => r.address && r.amount)
                      }
                    >
                      {batchLoading ? 'Processing...' : 'Send to All Recipients'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default BatchOps;
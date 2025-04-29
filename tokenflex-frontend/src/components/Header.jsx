import { AppBar, Toolbar, Typography, Button, Box, Chip, Menu, MenuItem, IconButton } from '@mui/material';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';

function Header({ connected, publicKey, balance, tokenSymbol, onConnect, onDisconnect }) {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    onDisconnect();
    handleClose();
  };

  // Aktif menü öğesini belirle
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ 
          flexGrow: 1, 
          color: 'white', 
          textDecoration: 'none',
          fontWeight: 'bold' 
        }}>
          TokenFlex
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/" 
            sx={{ 
              fontWeight: isActive('/') ? 'bold' : 'normal',
              borderBottom: isActive('/') ? '2px solid white' : 'none'
            }}
          >
            Dashboard
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/vesting" 
            sx={{ 
              fontWeight: isActive('/vesting') ? 'bold' : 'normal',
              borderBottom: isActive('/vesting') ? '2px solid white' : 'none'
            }}
          >
            Vesting
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/batch" 
            sx={{ 
              fontWeight: isActive('/batch') ? 'bold' : 'normal',
              borderBottom: isActive('/batch') ? '2px solid white' : 'none'
            }}
          >
            Batch
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/admin" 
            sx={{ 
              fontWeight: isActive('/admin') ? 'bold' : 'normal',
              borderBottom: isActive('/admin') ? '2px solid white' : 'none'
            }}
          >
            Admin
          </Button>
        </Box>
        
        {connected ? (
          <>
            <Chip
              icon={<AccountBalanceWalletIcon />}
              label={`${balance} ${tokenSymbol}`}
              color="secondary"
              sx={{ mx: 2 }}
            />
            
            <IconButton
              color="inherit"
              onClick={handleMenu}
              sx={{ border: '1px solid white' }}
            >
              <PersonIcon />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'wallet-button',
              }}
            >
              <MenuItem disabled>
                {publicKey ? `${publicKey.substring(0, 6)}...${publicKey.substring(publicKey.length - 4)}` : ''}
              </MenuItem>
              <MenuItem onClick={handleDisconnect}>Disconnect</MenuItem>
            </Menu>
          </>
        ) : (
          <Button 
            color="inherit" 
            variant="outlined" 
            onClick={onConnect}
            startIcon={<AccountBalanceWalletIcon />}
            sx={{ ml: 2 }}
          >
            Connect Wallet
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
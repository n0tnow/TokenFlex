import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Chip, 
  Menu, 
  MenuItem, 
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  alpha
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuIcon from '@mui/icons-material/Menu';
import { useWalletContext } from '../contexts/WalletContext'; // WalletContext eklendi

function Header() {
  // Props'ları kaldırıp, WalletContext kullanımı ekledik
  const { 
    connected, 
    publicKey, 
    balance, 
    tokenSymbol, 
    connectWallet, 
    disconnectWallet, 
    loading 
  } = useWalletContext();
  
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    disconnectWallet(); // useWalletContext'ten gelen fonksiyon
    handleClose();
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Aktif menü öğesini belirle
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Menu items array for both desktop and mobile
  const menuItems = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { text: 'Vesting', path: '/vesting', icon: <CalendarTodayIcon /> },
    { text: 'Batch', path: '/batch', icon: <SwapHorizIcon /> },
    { text: 'Admin', path: '/admin', icon: <AdminPanelSettingsIcon /> }
  ];

  // Menu item style with gradient color
  const getMenuItemStyle = (path) => {
    const active = isActive(path);
    return {
      color: active ? 'transparent' : theme.palette.common.white,
      backgroundImage: active 
        ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.light})` 
        : 'none',
      backgroundClip: active ? 'text' : 'none',
      WebkitBackgroundClip: active ? 'text' : 'none',
      fontWeight: active ? 700 : 500,
      position: 'relative',
      mx: 1,
      transition: 'all 0.3s ease',
      '&:hover': {
        color: active ? 'transparent' : alpha(theme.palette.primary.main, 0.9),
        backgroundImage: active 
          ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.light})` 
          : 'none',
        transform: 'translateY(-2px)',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '0px',
        left: active ? '0%' : '50%',
        width: active ? '100%' : '0%',
        height: '2px',
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        transition: 'all 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6)',
        borderRadius: '2px',
        opacity: active ? 1 : 0,
      },
      '&:hover::after': {
        width: '100%',
        left: '0%',
        opacity: 1,
      }
    };
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backdropFilter: 'blur(8px)',
        background: 'rgba(10, 10, 25, 0.85)',
        borderBottom: '1px solid rgba(0, 229, 255, 0.15)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Toolbar>
        {/* Logo */}
        <Box 
          component={Link} 
          to="/" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexGrow: 1, 
            textDecoration: 'none',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            }
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #00e5ff, #f50057)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mr: 1,
              textShadow: '0 0 15px rgba(0, 229, 255, 0.2)'
            }}
          >
            TokenFlex
          </Typography>
        </Box>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            padding: '3px 8px',
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.1)'
          }}>
            {menuItems.map((item) => (
              <Button 
                key={item.path}
                component={Link} 
                to={item.path} 
                sx={getMenuItemStyle(item.path)}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        )}
        
        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu" 
            onClick={toggleDrawer}
            sx={{ 
              mr: 2,
              color: theme.palette.primary.main,
              background: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        {/* Wallet Connection */}
        {connected ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              icon={<AccountBalanceWalletIcon />}
              label={`${balance} ${tokenSymbol}`}
              sx={{ 
                mx: 2, 
                background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                color: theme.palette.primary.light,
                fontWeight: 'bold',
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.secondary.main, 0.3)})`,
                }
              }}
            />
            
            <IconButton
              onClick={handleMenu}
              sx={{ 
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                borderRadius: '50%',
                p: 1,
                background: alpha(theme.palette.primary.main, 0.1),
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.2),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                }
              }}
            >
              <PersonIcon sx={{ color: theme.palette.primary.main }} />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              sx={{
                '& .MuiPaper-root': {
                  backgroundColor: 'rgba(10, 10, 25, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
                  mt: 1.5,
                  borderRadius: 2
                }
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem disabled sx={{ opacity: 0.7 }}>
                {publicKey ? `${publicKey.substring(0, 6)}...${publicKey.substring(publicKey.length - 4)}` : ''}
              </MenuItem>
              <Divider sx={{ backgroundColor: alpha(theme.palette.common.white, 0.1) }} />
              <MenuItem 
                onClick={handleDisconnect} 
                sx={{ 
                  color: theme.palette.error.main,
                  '&:hover': {
                    background: alpha(theme.palette.error.main, 0.1)
                  }
                }}
              >
                Disconnect
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button 
            color="primary" 
            variant="contained" 
            onClick={connectWallet} // useWalletContext'ten gelen fonksiyon
            disabled={loading} // Yükleme durumunu ekledik
            startIcon={loading ? null : <AccountBalanceWalletIcon />} // Yükleme durumunda icon'u kaldırdık
            sx={{ 
              ml: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`
              }
            }}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        )}
      </Toolbar>
      
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: 'rgba(10, 10, 25, 0.95)',
            backdropFilter: 'blur(10px)',
            width: 260,
            borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            boxShadow: '5px 0 15px rgba(0, 0, 0, 0.3)'
          }
        }}
      >
        <Box sx={{ 
          p: 3, 
          background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.dark, 0.3)}, transparent)` 
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #00e5ff, #f50057)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              py: 1
            }}
          >
            TokenFlex
          </Typography>
        </Box>
        <Divider sx={{ backgroundColor: alpha(theme.palette.common.white, 0.1) }} />
        <List sx={{ 
          p: 1, 
          '& .MuiListItem-root': { 
            my: 0.5, 
            borderRadius: 2 
          } 
        }}>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.path} 
              component={Link} 
              to={item.path}
              onClick={toggleDrawer}
              sx={{ 
                backgroundColor: isActive(item.path) 
                  ? `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})` 
                  : 'transparent',
                borderLeft: isActive(item.path) 
                  ? `3px solid ${theme.palette.primary.main}` 
                  : '3px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateX(5px)'
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: isActive(item.path) 
                  ? theme.palette.primary.main 
                  : theme.palette.common.white,
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiTypography-root': {
                    color: isActive(item.path) 
                      ? theme.palette.primary.main 
                      : theme.palette.common.white,
                    fontWeight: isActive(item.path) ? 700 : 400
                  }
                }}
              />
            </ListItem>
          ))}
        </List>

        {connected && (
          <>
            <Divider sx={{ 
              backgroundColor: alpha(theme.palette.common.white, 0.1),
              my: 2 
            }} />
            <Box sx={{ px: 3, py: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Connected Wallet
              </Typography>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                background: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}>
                <Typography variant="body2" color={theme.palette.primary.light} sx={{ mb: 1 }}>
                  {publicKey ? `${publicKey.substring(0, 10)}...${publicKey.substring(publicKey.length - 6)}` : ''}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Chip 
                    size="small"
                    icon={<AccountBalanceWalletIcon fontSize="small" />}
                    label={`${balance} ${tokenSymbol}`}
                    sx={{ 
                      background: alpha(theme.palette.primary.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      color: theme.palette.primary.light
                    }}
                  />
                  <Button 
                    size="small" 
                    color="error" 
                    variant="text" 
                    onClick={() => {
                      handleDisconnect();
                      toggleDrawer();
                    }}
                    sx={{ ml: 'auto', fontSize: '0.75rem' }}
                  >
                    Disconnect
                  </Button>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Drawer>
    </AppBar>
  );
}

export default Header;
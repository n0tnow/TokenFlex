// src/contexts/WalletContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  isConnected, 
  getPublicKey, 
  isAllowed,
  getNetworkDetails,
  getUserInfo
} from '@stellar/freighter-api';
import { 
  getBalance, 
  getTokenName, 
  getTokenSymbol, 
  transferTokens, 
  mintTokens, 
  burnTokens,
  freezeAccount, 
  unfreezeAccount, 
  batchTransfer,
  createConditionalTransfer,
  executeConditionalTransfer,
  createVestingSchedule,
  claimVestedTokens,
  getVestingInfo,
  getVestedAmount
} from '../services/soroban';
import { NETWORK_PASSPHRASE } from '../config';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState(0);
  const [tokenName, setTokenName] = useState("TokenFlex");
  const [tokenSymbol, setTokenSymbol] = useState("TFX");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Admin kontrolü için
  const [networkName, setNetworkName] = useState(null);

  // Bağlantı durumunu kontrol et
  const checkConnection = async () => {
    try {
      const connected = await isConnected();
      setConnected(connected);
      
      if (connected) {
        // Freighter izinlerini kontrol et
        const allowed = await isAllowed();
        if (!allowed) {
          console.warn("Freighter wallet not allowed for this site");
          return;
        }
        
        // Ağ bilgilerini kontrol et
        const networkDetails = await getNetworkDetails();
        if (networkDetails.networkPassphrase !== NETWORK_PASSPHRASE) {
          setError(`Please switch network to Stellar Testnet in Freighter wallet. Current: ${networkDetails.networkName}`);
          return;
        }
        setNetworkName(networkDetails.networkName);
        
        // Adresi al
        const key = await getPublicKey();
        setPublicKey(key);
        
        // Kullanıcı bilgilerini al
        const userInfo = await getUserInfo();
        console.log("User info:", userInfo);
        
        // Bakiye ve token bilgilerini al
        fetchTokenInfo(key);
        
        // Admin kontrolü (mockup, gerçek uygulamada kontrat sorgusu yapılmalı)
        checkAdminStatus(key);
      }
    } catch (err) {
      console.error("Wallet connection check failed:", err);
      setError("Wallet connection check failed");
    }
  };

  // Admin durumunu kontrol et (örnek)
  const checkAdminStatus = async (address) => {
    // Gerçek uygulamada, kontratınızdan admin okuyan bir işlev ekleyebilirsiniz
    // Şimdilik sabit bir değer kullanıyoruz
    setIsAdmin(true);
  };

  // Bakiye ve token bilgilerini al
  const fetchTokenInfo = async (address) => {
    if (!address) return;
    
    setLoading(true);
    try {
      // Bakiyeyi al
      const balanceResult = await getBalance(address);
      setBalance(balanceResult ? balanceResult : 0);
      
      // Token adını al
      const nameResult = await getTokenName();
      if (nameResult) setTokenName(nameResult);
      
      // Token sembolünü al
      const symbolResult = await getTokenSymbol();
      if (symbolResult) setTokenSymbol(symbolResult);
    } catch (err) {
      console.error("Failed to fetch token info:", err);
      setError("Failed to load token information");
    } finally {
      setLoading(false);
    }
  };

  // Cüzdanı bağla
  const connectWallet = async () => {
    setLoading(true);
    try {
      console.log("Connecting wallet (test mode)...");
      
      // Test için cüzdan bağlantısı
      setTimeout(() => {
        setConnected(true);
        setPublicKey("GBZXP4PWGMIYJKGNNWI3YVBPQIOVZOLNXL7OJMI3WFQLHA4NABOTZXCX");
        setBalance("1000.00");
        setLoading(false);
      }, 1000); // 1 saniye gecikme ekledik, bağlantı hissini vermek için
      
      return { success: true };
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      setError("Failed to connect wallet");
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Bağlantıyı kes
  const disconnectWallet = () => {
    setConnected(false);
    setPublicKey(null);
    setBalance(0);
    setIsAdmin(false);
  };

  // Token transfer et
  const transfer = async (toAddress, amount) => {
    if (!connected || !publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }
    
    setLoading(true);
    
    try {
      const result = await transferTokens(publicKey, toAddress, amount);
      
      // Başarılı ise bakiyeyi güncelle
      if (result.success) {
        // Bekle ve bakiyeyi güncel durum için yeniden yükle
        setTimeout(() => fetchTokenInfo(publicKey), 2000);
      }
      
      return { success: result.success };
    } catch (err) {
      console.error('Error transferring tokens:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Toplu transfer
  const batchTransferTokens = async (recipients, amounts) => {
    if (!connected || !publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }
    
    setLoading(true);
    
    try {
      const result = await batchTransfer(publicKey, recipients, amounts);
      
      // Başarılı ise bakiyeyi güncelle
      if (result.success) {
        // Bekle ve bakiyeyi güncel durum için yeniden yükle
        setTimeout(() => fetchTokenInfo(publicKey), 2000);
      }
      
      return { success: result.success };
    } catch (err) {
      console.error('Error batch transferring tokens:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Token mint et (admin)
  const mint = async (toAddress, amount) => {
    if (!connected || !publicKey || !isAdmin) {
      return { success: false, error: 'Not authorized' };
    }
    
    setLoading(true);
    
    try {
      const result = await mintTokens(publicKey, toAddress, amount);
      
      // Başarılı ise bakiyeyi güncelle
      if (result.success) {
        // Hedef bizimse bakiyeyi yenile
        if (toAddress === publicKey) {
          setTimeout(() => fetchTokenInfo(publicKey), 2000);
        }
      }
      
      return { success: result.success };
    } catch (err) {
      console.error('Error minting tokens:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Token yak
  const burn = async (amount) => {
    if (!connected || !publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }
    
    setLoading(true);
    
    try {
      const result = await burnTokens(publicKey, amount);
      
      // Başarılı ise bakiyeyi güncelle
      if (result.success) {
        setTimeout(() => fetchTokenInfo(publicKey), 2000);
      }
      
      return { success: result.success };
    } catch (err) {
      console.error('Error burning tokens:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Hesap dondur
  const freeze = async (accountToFreeze) => {
    if (!connected || !publicKey || !isAdmin) {
      return { success: false, error: 'Not authorized' };
    }
    
    setLoading(true);
    
    try {
      const result = await freezeAccount(publicKey, accountToFreeze);
      
      return { success: result.success };
    } catch (err) {
      console.error('Error freezing account:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Hesap çöz
  const unfreeze = async (accountToUnfreeze) => {
    if (!connected || !publicKey || !isAdmin) {
      return { success: false, error: 'Not authorized' };
    }
    
    setLoading(true);
    
    try {
      const result = await unfreezeAccount(publicKey, accountToUnfreeze);
      
      return { success: result.success };
    } catch (err) {
      console.error('Error unfreezing account:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Koşullu transfer oluştur
  const createConditional = async (toAddress, amount, conditionType, expirationLedger) => {
    if (!connected || !publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }
    
    setLoading(true);
    
    try {
      const result = await createConditionalTransfer(
        publicKey, 
        toAddress, 
        amount, 
        conditionType, 
        expirationLedger
      );
      
      // Başarılı ise bakiyeyi güncelle
      if (result.success) {
        setTimeout(() => fetchTokenInfo(publicKey), 2000);
      }
      
      return { success: result.success };
    } catch (err) {
      console.error('Error creating conditional transfer:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Koşullu transferi yürüt
  const executeConditional = async (transferId, approver) => {
    if (!connected || !publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }
    
    setLoading(true);
    
    try {
      const result = await executeConditionalTransfer(
        publicKey, 
        transferId, 
        approver
      );
      
      // Başarılı ise bakiyeyi güncelle
      if (result.success) {
        setTimeout(() => fetchTokenInfo(publicKey), 2000);
      }
      
      return { success: result.success };
    } catch (err) {
      console.error('Error executing conditional transfer:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Vesting planı oluştur
  const createVesting = async (
    beneficiary, 
    totalAmount, 
    startLedger, 
    durationLedgers, 
    vestingType,
    steps = 0,
    cliffLedger = 0
  ) => {
    if (!connected || !publicKey || !isAdmin) {
      return { success: false, error: 'Not authorized' };
    }
    
    setLoading(true);
    
    try {
      const result = await createVestingSchedule(
        publicKey,
        beneficiary,
        totalAmount,
        startLedger,
        durationLedgers,
        vestingType,
        steps,
        cliffLedger
      );
      
      return { success: result.success };
    } catch (err) {
      console.error('Error creating vesting schedule:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Vested tokenleri talep et
  const claimVested = async () => {
    if (!connected || !publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }
    
    setLoading(true);
    
    try {
      const result = await claimVestedTokens(publicKey);
      
      // Başarılı ise bakiyeyi güncelle
      if (result.success) {
        setTimeout(() => fetchTokenInfo(publicKey), 2000);
      }
      
      return { success: result.success };
    } catch (err) {
      console.error('Error claiming vested tokens:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Vesting bilgisi alma
  const getVesting = async () => {
    if (!connected || !publicKey) {
      return null;
    }
    
    try {
      return await getVestingInfo(publicKey);
    } catch (err) {
      console.error('Error getting vesting info:', err);
      return null;
    }
  };

  // İlk yüklenmede bağlantı durumunu kontrol et
  useEffect(() => {
    checkConnection();
  }, []);

  // Veri yenileme fonksiyonu
  const refreshData = () => {
    if (connected && publicKey) {
      fetchTokenInfo(publicKey);
    }
  };

  return (
    <WalletContext.Provider value={{ 
      connected,
      publicKey,
      balance,
      tokenName,
      tokenSymbol,
      loading,
      error,
      isAdmin,
      networkName,
      connectWallet,
      disconnectWallet,
      transfer,
      batchTransferTokens,
      mint,
      burn,
      freeze,
      unfreeze,
      createConditional,
      executeConditional,
      createVesting,
      claimVested,
      getVesting,
      refreshData
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => useContext(WalletContext);
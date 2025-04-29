import React, { createContext, useContext, useState } from 'react';

// Wallet bağlantı durumunu yöneten context
const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState(1000);
  const [tokenName, setTokenName] = useState("TokenFlex Coin");
  const [tokenSymbol, setTokenSymbol] = useState("TFX");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cüzdanı bağla (mock fonksiyon)
  const connectWallet = () => {
    setLoading(true);
    setTimeout(() => {
      setConnected(true);
      setPublicKey("G123456789ABCDEFGHIJKLMNOPQRST");
      setLoading(false);
    }, 1000);
  };

  // Cüzdan bağlantısını kes
  const disconnectWallet = () => {
    setConnected(false);
    setPublicKey(null);
  };

  // Token transferi (mock)
  const transfer = (toAddress, amount) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setBalance(prev => prev - amount);
        setLoading(false);
        resolve({ success: true });
      }, 1500);
    });
  };

  // Toplu transfer (mock)
  const batchTransferTokens = (recipients, amounts) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
        setBalance(prev => prev - totalAmount);
        setLoading(false);
        resolve({ success: true });
      }, 1500);
    });
  };

  // Token mint (mock)
  const mint = (toAddress, amount) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setLoading(false);
        resolve({ success: true });
      }, 1500);
    });
  };

  // Context değerlerini sağla
  return (
    <WalletContext.Provider value={{ 
      connected,
      publicKey,
      balance,
      tokenName,
      tokenSymbol,
      loading,
      error,
      connectWallet,
      disconnectWallet,
      transfer,
      batchTransferTokens,
      mint,
      // Diğer fonksiyonlar (basitlik için eklenmedi)
      freeze: () => Promise.resolve({ success: true }),
      unfreeze: () => Promise.resolve({ success: true })
    }}>
      {children}
    </WalletContext.Provider>
  );
};

// WalletContext'e kolay erişim için hook
export const useWalletContext = () => useContext(WalletContext);
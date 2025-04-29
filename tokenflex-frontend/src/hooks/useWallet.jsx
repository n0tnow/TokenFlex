import { useState, useEffect, useCallback } from 'react';

// Mock sürüm - gerçek uygulamada Freighter entegrasyonu olacak
export const useWallet = () => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cüzdan bağlantısını kontrol et (mock)
  const checkConnection = useCallback(() => {
    // Gerçek uygulamada lokalde kaydedilmiş bağlantı durumunu kontrol edebilirsiniz
    return connected;
  }, [connected]);

  // Cüzdanı bağla (mock)
  const connectWallet = useCallback(async () => {
    setLoading(true);
    
    try {
      // Mock bağlantı - 1 saniye bekle ve bağlan
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConnected(true);
      setPublicKey("GAKONCKYJ7PRRKBZSWVPG3MURUNX7KIWMTBZBNBHBCPJKWL47AO4WSS");
      return { success: true, publicKey: "GAKONCKYJ7PRRKBZSWVPG3MURUNX7KIWMTBZBNBHBCPJKWL47AO4WSS" };
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet');
      return { success: false, error: 'Failed to connect wallet' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cüzdan bağlantısını kes (mock)
  const disconnectWallet = useCallback(() => {
    setConnected(false);
    setPublicKey(null);
  }, []);

  // Component ilk yüklendiğinde çalışır
  useEffect(() => {
    // Gerçek uygulamada mevcut bağlantıyı kontrol eder
    // Şimdilik boş bırakıyoruz
  }, []);

  return {
    connected,
    publicKey,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    checkConnection
  };
};
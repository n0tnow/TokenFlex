import { useState, useEffect, useCallback } from 'react';
import { 
  getVestingInfo, 
  getVestedAmount, 
  claimVestedTokens,
  createVestingSchedule 
} from '../services/soroban';

export const useVesting = (walletAddress) => {
  const [vestingSchedule, setVestingSchedule] = useState(null);
  const [vestedAmount, setVestedAmount] = useState(0);
  const [claimableAmount, setClaimableAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Vesting verilerini yenile
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Vesting bilgilerini getir
  const fetchVestingInfo = useCallback(async () => {
    if (!walletAddress) {
      setVestingSchedule(null);
      setVestedAmount(0);
      setClaimableAmount(0);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Vesting planı bilgilerini al
      const vestingInfo = await getVestingInfo(walletAddress);
      setVestingSchedule(vestingInfo);
      
      if (vestingInfo) {
        // Toplam serbest bırakılmış miktarı al
        const vested = await getVestedAmount(walletAddress);
        setVestedAmount(vested);
        
        // Talep edilebilir miktarı hesapla (serbest bırakılmış - şimdiye kadar talep edilmiş)
        const claimable = vested - vestingInfo.claimedAmount;
        setClaimableAmount(claimable > 0 ? claimable : 0);
      } else {
        setVestedAmount(0);
        setClaimableAmount(0);
      }
    } catch (err) {
      console.error('Error fetching vesting info:', err);
      setError('Failed to load vesting information');
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  // Vesting planı oluştur (basitleştirilmiş)
  const createVesting = async (
    beneficiary, 
    totalAmount, 
    startLedger, 
    durationLedgers, 
    vestingType,
    steps = 0,
    cliffLedger = 0
  ) => {
    if (!walletAddress) {
      return { success: false, error: 'Wallet not connected' };
    }
    
    setLoading(true);
    
    try {
      await createVestingSchedule(
        walletAddress,
        beneficiary,
        totalAmount,
        startLedger,
        durationLedgers,
        vestingType,
        steps,
        cliffLedger
      );
      
      // Başarılı varsayıyoruz (mock)
      refreshData();
      return { success: true };
    } catch (err) {
      console.error('Error creating vesting schedule:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Vested tokenleri talep et (basitleştirilmiş)
  const claimVested = async () => {
    if (!walletAddress) {
      return { success: false, error: 'Wallet not connected' };
    }
    
    if (claimableAmount <= 0) {
      return { success: false, error: 'No tokens available to claim' };
    }
    
    setLoading(true);
    
    try {
      await claimVestedTokens(walletAddress);
      
      // Başarılı varsayıyoruz (mock)
      const claimedAmount = claimableAmount;
      refreshData();
      return { success: true, amount: claimedAmount };
    } catch (err) {
      console.error('Error claiming tokens:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Vesting ilerlemesini hesapla (%)
  const calculateProgress = () => {
    if (!vestingSchedule) return 0;
    
    const { totalAmount } = vestingSchedule;
    if (totalAmount <= 0) return 0;
    
    return (vestedAmount / totalAmount) * 100;
  };

  // Cüzdan adresi veya refresh trigger değiştiğinde vesting bilgilerini yeniden yükle
  useEffect(() => {
    fetchVestingInfo();
  }, [walletAddress, refreshTrigger, fetchVestingInfo]);

  return {
    vestingSchedule,
    vestedAmount,
    claimableAmount,
    loading,
    error,
    fetchVestingInfo,
    createVesting,
    claimVested,
    progress: calculateProgress(),
    refreshData
  };
};
// Mock servis fonksiyonları
// Gerçek uygulamada bu fonksiyonlar Soroban API ile etkileşime geçecek

// Wallet bağlantısını kontrol et
export const checkWalletConnection = async () => {
  // Mock bağlantı kontrolü
  return { connected: false, publicKey: null };
};

// Bakiyeyi sorgula
export const getBalance = async (address) => {
  // Mock bakiye - gerçek uygulamada API'den gelecek
  return 1000;
};

// Token adını al
export const getTokenName = async () => {
  // Mock token adı
  return "TokenFlex Coin";
};

// Token sembolünü al
export const getTokenSymbol = async () => {
  // Mock token sembolü
  return "TFX";
};

// Token transferi yap
export const transferTokens = async (fromAddress, toAddress, amount) => {
  // Mock transfer işlemi
  console.log(`Transfer: ${amount} tokens from ${fromAddress} to ${toAddress}`);
  return "success";
};

// Toplu transfer yap
export const batchTransfer = async (fromAddress, recipients, amounts) => {
  // Mock toplu transfer
  console.log(`Batch transfer from ${fromAddress} to ${recipients.length} recipients`);
  return "success";
};

// Token mint et
export const mintTokens = async (adminAddress, toAddress, amount) => {
  // Mock mint işlemi
  console.log(`Mint: ${amount} tokens to ${toAddress} by admin ${adminAddress}`);
  return "success";
};

// Hesap dondurma
export const freezeAccount = async (adminAddress, accountToFreeze) => {
  // Mock hesap dondurma
  console.log(`Freeze account: ${accountToFreeze} by admin ${adminAddress}`);
  return "success";
};

// Hesap çözme
export const unfreezeAccount = async (adminAddress, accountToUnfreeze) => {
  // Mock hesap çözme
  console.log(`Unfreeze account: ${accountToUnfreeze} by admin ${adminAddress}`);
  return "success";
};

// Vesting bilgilerini al
export const getVestingInfo = async (beneficiaryAddress) => {
  // Mock vesting bilgileri
  return {
    beneficiary: beneficiaryAddress,
    totalAmount: 10000,
    startLedger: 12345678,
    durationLedgers: 17280, // ~1 gün
    vestingType: "linear",
    claimedAmount: 2500,
    steps: 0,
    cliffLedger: 0
  };
};

// Talep edilebilir vesting miktarını al
export const getVestedAmount = async (beneficiaryAddress) => {
  // Mock vested miktar
  return 5000;
};

// Vested tokenleri talep et
export const claimVestedTokens = async (beneficiaryAddress) => {
  // Mock talep işlemi
  console.log(`Claiming vested tokens for ${beneficiaryAddress}`);
  return "success";
};

// Vesting planı oluştur
export const createVestingSchedule = async (
  adminAddress,
  beneficiary,
  totalAmount,
  startLedger,
  durationLedgers,
  vestingType,
  steps,
  cliffLedger
) => {
  // Mock vesting oluşturma
  console.log(`Create vesting for ${beneficiary} with ${totalAmount} tokens`);
  return "success";
};
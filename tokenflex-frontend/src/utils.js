// src/utils.js
export function formatTokenAmount(amount) {
    if (!amount) return "0.00";
    
    // Büyük sayılar için güvenli dönüşüm
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    return numAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  
  export function truncateAddress(address) {
    if (!address) return "";
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  }
  
  export function formatDate(date) {
    return date.toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  }
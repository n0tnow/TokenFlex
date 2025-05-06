// src/services/soroban.js
import { 
  Contract, 
  SorobanRpc, 
  TransactionBuilder, 
  Networks, 
  BASE_FEE, 
  TimeoutInfinite, 
  Asset, 
  nativeToScVal, 
  xdr, 
  Account,
  Operation, 
  Memo
} from "stellar-sdk";
import { 
  signTransaction, 
  isConnected, 
  getPublicKey,
  getNetworkDetails
} from '@stellar/freighter-api';
import { CONTRACT_ID, NETWORK_PASSPHRASE, NETWORK_URL } from "../config";

// Soroban RPC sunucusu
const server = new SorobanRpc.Server(NETWORK_URL);

// Kontrat nesnesi oluştur
export const getContract = () => {
  return new Contract(CONTRACT_ID);
};

// İşlem oluştur ve imzala
async function prepareTransaction(sourceAccount, operation) {
  try {
    // Hesap bilgisini al
    const account = await server.getAccount(sourceAccount);
    
    // İşlem oluştur
    let transaction = new TransactionBuilder(account, { 
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(TimeoutInfinite)
      .build();
    
    // Simulate transaction to get fee and auth info
    const simulationResponse = await server.simulateTransaction(transaction);
    if (simulationResponse.error) {
      throw new Error(`Simulation Error: ${simulationResponse.error}`);
    }
    
    // Apply auth from simulation
    if (simulationResponse.results && simulationResponse.results[0].auth) {
      transaction = SorobanRpc.assembleTransaction(transaction, simulationResponse).build();
    }
    
    // İşlemi imzala (Freighter ile)
    const signedXDR = await signTransaction(
      transaction.toXDR(),
      {
        networkPassphrase: NETWORK_PASSPHRASE
      }
    );
    
    // İmzalı işlemi gönder
    const response = await server.sendTransaction(signedXDR);
    
    // İşlem sonucunu bekle
    let status = response.status;
    let resultXDR;
    
    // İşlem tamamlanana kadar durumu kontrol et
    while (status === "PENDING" || status === "NOT_FOUND") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const txResponse = await server.getTransaction(response.hash);
      status = txResponse.status;
      if (txResponse.resultXdr) {
        resultXDR = txResponse.resultXdr;
      }
    }
    
    if (status === "SUCCESS") {
      return { success: true, result: resultXDR };
    } else {
      throw new Error(`Transaction failed with status: ${status}`);
    }
  } catch (error) {
    console.error("Transaction preparation error:", error);
    throw error;
  }
}

// Bakiye sorgulama
export const getBalance = async (address) => {
  try {
    if (!address) return "0";
    
    const contract = getContract();
    const result = await server.simulateTransaction(
      new TransactionBuilder(new Account(address, "0"), {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE
      })
      .addOperation(
        Operation.invokeContractFunction({
          contract: CONTRACT_ID,
          function: "balance",
          args: [xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(xdr.PublicKey.publicKeyTypeEd25519(Buffer.from(address.substring(1), 'hex'))))]
        })
      )
      .setTimeout(TimeoutInfinite)
      .build()
    );
    
    if (result.result) {
      // Decode u128 value from XDR
      const value = result.result.retval;
      let amount = 0;
      
      if (value && value.switch().name === 'scvI128') {
        amount = value.i128().toString();
      }
      
      return amount;
    }
    
    return "0";
  } catch (error) {
    console.error("Balance check failed:", error);
    return "0";
  }
};

// Token adını al
export const getTokenName = async () => {
  try {
    const contract = getContract();
    const result = await server.simulateTransaction(
      new TransactionBuilder(new Account("GBZXP4PWGMIYJKGNNWI3YVBPQIOVZOLNXL7OJMI3WFQLHA4NABOTZXCX", "0"), {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE
      })
      .addOperation(
        Operation.invokeContractFunction({
          contract: CONTRACT_ID,
          function: "name",
          args: []
        })
      )
      .setTimeout(TimeoutInfinite)
      .build()
    );
    
    if (result.result) {
      // Decode string value from XDR
      const value = result.result.retval;
      if (value && value.switch().name === 'scvString') {
        return value.string().toString();
      }
    }
    
    return "TokenFlex";
  } catch (error) {
    console.error("Name check failed:", error);
    return "TokenFlex";
  }
};

// Token sembolünü al
export const getTokenSymbol = async () => {
  try {
    const contract = getContract();
    const result = await server.simulateTransaction(
      new TransactionBuilder(new Account("GBZXP4PWGMIYJKGNNWI3YVBPQIOVZOLNXL7OJMI3WFQLHA4NABOTZXCX", "0"), {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE
      })
      .addOperation(
        Operation.invokeContractFunction({
          contract: CONTRACT_ID,
          function: "symbol",
          args: []
        })
      )
      .setTimeout(TimeoutInfinite)
      .build()
    );
    
    if (result.result) {
      // Decode string value from XDR
      const value = result.result.retval;
      if (value && value.switch().name === 'scvString') {
        return value.string().toString();
      }
    }
    
    return "TFX";
  } catch (error) {
    console.error("Symbol check failed:", error);
    return "TFX";
  }
};

// Token transferi yap
export const transferTokens = async (fromAddress, toAddress, amount) => {
  try {
    if (!fromAddress || !toAddress || !amount) {
      throw new Error("Missing required parameters");
    }
    
    // Adres formatı oluştur
    const toAddressScVal = xdr.ScVal.scvAddress(
      xdr.ScAddress.scAddressTypeAccount(
        xdr.PublicKey.publicKeyTypeEd25519(
          Buffer.from(toAddress.substring(1), 'hex')
        )
      )
    );
    
    // Miktar formatı oluştur (i128)
    const amountScVal = nativeToScVal(amount.toString());
    
    // İşlem oluştur
    const operation = Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: "transfer",
      args: [toAddressScVal, amountScVal]
    });
    
    // İşlemi hazırla ve imzala
    const result = await prepareTransaction(fromAddress, operation);
    
    return result;
  } catch (error) {
    console.error("Transfer failed:", error);
    throw error;
  }
};

// Token mint et (admin işlemi)
export const mintTokens = async (adminAddress, toAddress, amount) => {
  try {
    if (!adminAddress || !toAddress || !amount) {
      throw new Error("Missing required parameters");
    }
    
    // Adres formatı oluştur
    const toAddressScVal = xdr.ScVal.scvAddress(
      xdr.ScAddress.scAddressTypeAccount(
        xdr.PublicKey.publicKeyTypeEd25519(
          Buffer.from(toAddress.substring(1), 'hex')
        )
      )
    );
    
    // Miktar formatı oluştur (i128)
    const amountScVal = nativeToScVal(amount.toString());
    
    // İşlem oluştur
    const operation = Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: "mint",
      args: [toAddressScVal, amountScVal]
    });
    
    // İşlemi hazırla ve imzala
    const result = await prepareTransaction(adminAddress, operation);
    
    return result;
  } catch (error) {
    console.error("Mint failed:", error);
    throw error;
  }
};

// Hesap dondurma
export const freezeAccount = async (adminAddress, accountToFreeze) => {
  try {
    if (!adminAddress || !accountToFreeze) {
      throw new Error("Missing required parameters");
    }
    
    // Adres formatı oluştur
    const accountScVal = xdr.ScVal.scvAddress(
      xdr.ScAddress.scAddressTypeAccount(
        xdr.PublicKey.publicKeyTypeEd25519(
          Buffer.from(accountToFreeze.substring(1), 'hex')
        )
      )
    );
    
    // İşlem oluştur
    const operation = Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: "freeze_account",
      args: [accountScVal]
    });
    
    // İşlemi hazırla ve imzala
    const result = await prepareTransaction(adminAddress, operation);
    
    return result;
  } catch (error) {
    console.error("Freeze failed:", error);
    throw error;
  }
};

// Hesap çözme
export const unfreezeAccount = async (adminAddress, accountToUnfreeze) => {
  try {
    if (!adminAddress || !accountToUnfreeze) {
      throw new Error("Missing required parameters");
    }
    
    // Adres formatı oluştur
    const accountScVal = xdr.ScVal.scvAddress(
      xdr.ScAddress.scAddressTypeAccount(
        xdr.PublicKey.publicKeyTypeEd25519(
          Buffer.from(accountToUnfreeze.substring(1), 'hex')
        )
      )
    );
    
    // İşlem oluştur
    const operation = Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: "unfreeze_account",
      args: [accountScVal]
    });
    
    // İşlemi hazırla ve imzala
    const result = await prepareTransaction(adminAddress, operation);
    
    return result;
  } catch (error) {
    console.error("Unfreeze failed:", error);
    throw error;
  }
};

// Token yakma
export const burnTokens = async (fromAddress, amount) => {
  try {
    if (!fromAddress || !amount) {
      throw new Error("Missing required parameters");
    }
    
    // Miktar formatı oluştur (i128)
    const amountScVal = nativeToScVal(amount.toString());
    
    // İşlem oluştur
    const operation = Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: "burn",
      args: [amountScVal]
    });
    
    // İşlemi hazırla ve imzala
    const result = await prepareTransaction(fromAddress, operation);
    
    return result;
  } catch (error) {
    console.error("Burn failed:", error);
    throw error;
  }
};

// Toplu transfer
export const batchTransfer = async (fromAddress, recipients, amounts) => {
  try {
    if (!fromAddress || !recipients || !amounts || recipients.length !== amounts.length) {
      throw new Error("Missing or invalid parameters");
    }
    
    // Alıcı adresleri formatını oluştur
    const recipientsScVal = xdr.ScVal.scvVec(
      recipients.map(address => 
        xdr.ScVal.scvAddress(
          xdr.ScAddress.scAddressTypeAccount(
            xdr.PublicKey.publicKeyTypeEd25519(
              Buffer.from(address.substring(1), 'hex')
            )
          )
        )
      )
    );
    
    // Miktar formatlarını oluştur
    const amountsScVal = xdr.ScVal.scvVec(
      amounts.map(amount => nativeToScVal(amount.toString()))
    );
    
    // İşlem oluştur
    const operation = Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: "batch_transfer",
      args: [recipientsScVal, amountsScVal]
    });
    
    // İşlemi hazırla ve imzala
    const result = await prepareTransaction(fromAddress, operation);
    
    return result;
  } catch (error) {
    console.error("Batch transfer failed:", error);
    throw error;
  }
};

// Koşullu transfer oluştur
export const createConditionalTransfer = async (
  fromAddress, 
  toAddress, 
  amount, 
  conditionType, 
  expirationLedger = 0
) => {
  try {
    if (!fromAddress || !toAddress || !amount || !conditionType) {
      throw new Error("Missing required parameters");
    }
    
    // Adres formatı oluştur
    const toAddressScVal = xdr.ScVal.scvAddress(
      xdr.ScAddress.scAddressTypeAccount(
        xdr.PublicKey.publicKeyTypeEd25519(
          Buffer.from(toAddress.substring(1), 'hex')
        )
      )
    );
    
    // Miktar formatı oluştur
    const amountScVal = nativeToScVal(amount.toString());
    
    // Koşul formatı oluştur
    let conditionScVal;
    
    if (conditionType.type === 'time' && conditionType.releaseLedger) {
      conditionScVal = xdr.ScVal.scvVec([
        xdr.ScVal.scvSymbol(Buffer.from("TimeBasedRelease")),
        xdr.ScVal.scvU32(conditionType.releaseLedger)
      ]);
    } else if (conditionType.type === 'approval' && conditionType.approver) {
      conditionScVal = xdr.ScVal.scvVec([
        xdr.ScVal.scvSymbol(Buffer.from("ApprovalRequired")),
        xdr.ScVal.scvAddress(
          xdr.ScAddress.scAddressTypeAccount(
            xdr.PublicKey.publicKeyTypeEd25519(
              Buffer.from(conditionType.approver.substring(1), 'hex')
            )
          )
        )
      ]);
    } else {
      throw new Error("Invalid condition type");
    }
    
    // Son kullanma formatı oluştur
    const expirationScVal = xdr.ScVal.scvU32(expirationLedger);
    
    // İşlem oluştur
    const operation = Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: "create_conditional",
      args: [toAddressScVal, amountScVal, conditionScVal, expirationScVal]
    });
    
    // İşlemi hazırla ve imzala
    const result = await prepareTransaction(fromAddress, operation);
    
    return result;
  } catch (error) {
    console.error("Create conditional transfer failed:", error);
    throw error;
  }
};

// Koşullu transferi yürüt
export const executeConditionalTransfer = async (
  fromAddress,
  transferId,
  approver = null
) => {
  try {
    if (!fromAddress || !transferId) {
      throw new Error("Missing required parameters");
    }
    
    // Transfer ID formatı oluştur
    const transferIdScVal = xdr.ScVal.scvU32(transferId);
    
    // Onaylayıcı formatı oluştur (varsa)
    let approverScVal = null;
    if (approver) {
      approverScVal = xdr.ScVal.scvAddress(
        xdr.ScAddress.scAddressTypeAccount(
          xdr.PublicKey.publicKeyTypeEd25519(
            Buffer.from(approver.substring(1), 'hex')
          )
        )
      );
    }
    
    // İşlem oluştur
    const operation = Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: "execute_conditional",
      args: approver ? [transferIdScVal, approverScVal] : [transferIdScVal, xdr.ScVal.scvVoid()]
    });
    
    // İşlemi hazırla ve imzala
    const result = await prepareTransaction(fromAddress, operation);
    
    return result;
  } catch (error) {
    console.error("Execute conditional transfer failed:", error);
    throw error;
  }
};

// Vesting planı oluştur
export const createVestingSchedule = async (
  adminAddress,
  beneficiary,
  totalAmount,
  startLedger,
  durationLedgers,
  vestingType,
  steps = 0,
  cliffLedger = 0
) => {
  try {
    if (!adminAddress || !beneficiary || !totalAmount || !startLedger || !durationLedgers || !vestingType) {
      throw new Error("Missing required parameters");
    }
    
    // Adres formatı oluştur
    const beneficiaryScVal = xdr.ScVal.scvAddress(
      xdr.ScAddress.scAddressTypeAccount(
        xdr.PublicKey.publicKeyTypeEd25519(
          Buffer.from(beneficiary.substring(1), 'hex')
        )
      )
    );
    
    // Miktar formatı oluştur
    const amountScVal = nativeToScVal(totalAmount.toString());
    
    // Başlangıç formatı oluştur
    const startLedgerScVal = xdr.ScVal.scvU32(startLedger);
    
    // Süre formatı oluştur
    const durationScVal = xdr.ScVal.scvU32(durationLedgers);
    
    // Vesting tipi formatı oluştur
    let vestingTypeScVal;
    if (vestingType === 'linear') {
      vestingTypeScVal = xdr.ScVal.scvSymbol(Buffer.from("Linear"));
    } else if (vestingType === 'cliff') {
      vestingTypeScVal = xdr.ScVal.scvSymbol(Buffer.from("Cliff"));
    } else if (vestingType === 'stepped') {
      vestingTypeScVal = xdr.ScVal.scvSymbol(Buffer.from("Stepped"));
    } else {
      throw new Error("Invalid vesting type");
    }
    
    // Adım formatı oluştur
    const stepsScVal = xdr.ScVal.scvU32(steps);
    
    // Cliff formatı oluştur
    const cliffScVal = xdr.ScVal.scvU32(cliffLedger);
    
    // İşlem oluştur
    const operation = Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: "create_vesting",
      args: [
        beneficiaryScVal,
        amountScVal,
        startLedgerScVal,
        durationScVal,
        vestingTypeScVal,
        stepsScVal,
        cliffScVal
      ]
    });
    
    // İşlemi hazırla ve imzala
    const result = await prepareTransaction(adminAddress, operation);
    
    return result;
  } catch (error) {
    console.error("Create vesting schedule failed:", error);
    throw error;
  }
};

// Vested tokenleri talep et
export const claimVestedTokens = async (beneficiary) => {
  try {
    if (!beneficiary) {
      throw new Error("Missing required parameters");
    }
    
    // İşlem oluştur
    const operation = Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: "claim_vesting",
      args: []
    });
    
    // İşlemi hazırla ve imzala
    const result = await prepareTransaction(beneficiary, operation);
    
    return result;
  } catch (error) {
    console.error("Claim vested tokens failed:", error);
    throw error;
  }
};

// Vesting bilgilerini al
export const getVestingInfo = async (beneficiary) => {
  try {
    if (!beneficiary) {
      throw new Error("Missing required parameters");
    }
    
    // Adres formatı oluştur
    const beneficiaryScVal = xdr.ScVal.scvAddress(
      xdr.ScAddress.scAddressTypeAccount(
        xdr.PublicKey.publicKeyTypeEd25519(
          Buffer.from(beneficiary.substring(1), 'hex')
        )
      )
    );
    
    // İşlem oluştur
    const result = await server.simulateTransaction(
      new TransactionBuilder(new Account(beneficiary, "0"), {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE
      })
      .addOperation(
        Operation.invokeContractFunction({
          contract: CONTRACT_ID,
          function: "get_vesting_info",
          args: [beneficiaryScVal]
        })
      )
      .setTimeout(TimeoutInfinite)
      .build()
    );
    
    if (result.result) {
      // XDR'dan vesting bilgilerini çöz
      const value = result.result.retval;
      // (burada XDR çözümleme mantığı implement edilmeli)
      
      // Örnek dönüş
      return {
        beneficiary: beneficiary,
        totalAmount: "10000",
        startLedger: 12345678,
        durationLedgers: 17280,
        vestingType: "linear",
        claimedAmount: 2500
      };
    }
    
    return null;
  } catch (error) {
    console.error("Get vesting info failed:", error);
    return null;
  }
};

// Talep edilebilir vesting miktarını al
export const getVestedAmount = async (beneficiary) => {
  try {
    if (!beneficiary) {
      throw new Error("Missing required parameters");
    }
    
    // Adres formatı oluştur
    const beneficiaryScVal = xdr.ScVal.scvAddress(
      xdr.ScAddress.scAddressTypeAccount(
        xdr.PublicKey.publicKeyTypeEd25519(
          Buffer.from(beneficiary.substring(1), 'hex')
        )
      )
    );
    
    // İşlem oluştur
    const result = await server.simulateTransaction(
      new TransactionBuilder(new Account(beneficiary, "0"), {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE
      })
      .addOperation(
        Operation.invokeContractFunction({
          contract: CONTRACT_ID,
          function: "get_vested_amount",
          args: [beneficiaryScVal]
        })
      )
      .setTimeout(TimeoutInfinite)
      .build()
    );
    
    if (result.result) {
      // XDR'dan vested miktarı çöz
      const value = result.result.retval;
      if (value && value.switch().name === 'scvI128') {
        return value.i128().toString();
      }
    }
    
    return "0";
  } catch (error) {
    console.error("Get vested amount failed:", error);
    return "0";
  }
};
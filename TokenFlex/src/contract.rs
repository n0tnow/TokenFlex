use crate::admin::{has_administrator, read_administrator, write_administrator};
use crate::allowance::{read_allowance, spend_allowance, write_allowance};
use crate::balance::{read_balance, receive_balance, spend_balance};
use crate::metadata::{read_decimal, read_name, read_symbol, write_metadata};
use crate::storage_types::{INSTANCE_BUMP_AMOUNT, INSTANCE_LIFETIME_THRESHOLD};
use crate::storage_types::DataKey;
// Yeni modüllerin importları
use crate::vesting::{
    VestingType, VestingSchedule, VestingError,
    create_vesting_schedule, claim_vested_tokens, calculate_vested_amount, get_vesting_schedule
};
use crate::batch::{batch_transfer, BatchError};
use crate::conditional::{
    ConditionType, ConditionalError,
    create_conditional_transfer, execute_conditional_transfer
};

use soroban_sdk::token::{self, Interface as _};
use soroban_sdk::{contract, contractimpl, Address, Env, String, Vec};
use soroban_token_sdk::metadata::TokenMetadata;
use soroban_token_sdk::TokenUtils;

fn check_nonnegative_amount(amount: i128) {
    if amount < 0 {
        panic!("negative amount is not allowed: {}", amount)
    }
}

// Bir hesabın dondurulup dondurulmadığını kontrol eden yardımcı fonksiyon
pub fn is_account_frozen(e: &Env, account: &Address) -> bool {
    let key = DataKey::Frozen(account.clone());
    e.storage().instance().get::<_, bool>(&key).unwrap_or(false)
}

// Özel olayları yayınlamak için yardımcı fonksiyon
fn emit_custom_event(e: &Env, event_type: &str, admin: Address, account: Address) {
    e.events().publish((event_type, admin, account), ());
}

#[contract]
pub struct Token;

#[contractimpl]
impl Token {
    pub fn initialize(e: Env, admin: Address, decimal: u32, name: String, symbol: String) {
        if has_administrator(&e) {
            panic!("already initialized")
        }
        write_administrator(&e, &admin);
        if decimal > u8::MAX.into() {
            panic!("Decimal must fit in a u8");
        }

        write_metadata(
            &e,
            TokenMetadata {
                decimal,
                name,
                symbol,
            },
        )
    }

    pub fn mint(e: Env, to: Address, amount: i128) {
        check_nonnegative_amount(amount);
        let admin = read_administrator(&e);
        admin.require_auth();

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        receive_balance(&e, to.clone(), amount);
        TokenUtils::new(&e).events().mint(admin, to, amount);
    }

    pub fn set_admin(e: Env, new_admin: Address) {
        let admin = read_administrator(&e);
        admin.require_auth();

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        write_administrator(&e, &new_admin);
        TokenUtils::new(&e).events().set_admin(admin, new_admin);
    }

    // Bir hesabı dondur (sadece yönetici yapabilir)
    pub fn freeze_account(e: Env, account: Address) {
        // Sadece yönetici hesapları dondurabilir
        let admin = read_administrator(&e);
        admin.require_auth();

        // Kontrat örneğinin TTL süresini uzat
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        // Hesabı dondurulmuş olarak ayarla
        let key = DataKey::Frozen(account.clone());
        e.storage().instance().set(&key, &true);

       // Dondurma olayını yayınla
       emit_custom_event(&e, "freeze_account", admin, account);
    }

    // Bir hesabın dondurulmasını kaldır (sadece yönetici yapabilir)
    pub fn unfreeze_account(e: Env, account: Address) {
        // Sadece yönetici hesapların dondurulmasını kaldırabilir
        let admin = read_administrator(&e);
        admin.require_auth();

        // Kontrat örneğinin TTL süresini uzat
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        // Dondurulmuş durumu kaldır
        let key = DataKey::Frozen(account.clone());
        e.storage().instance().remove(&key);

        // Dondurma kaldırma olayını yayınla
        emit_custom_event(&e, "unfreeze_account", admin, account);
    }
    
    // Token vesting fonksiyonları
    pub fn create_vesting(
        e: Env, 
        beneficiary: Address, 
        total_amount: i128, 
        start_ledger: u32, 
        duration_ledgers: u32,
        vesting_type: VestingType,
        steps: u32,
        cliff_ledger: u32
    ) -> Result<(), VestingError> {
        let admin = read_administrator(&e);
        admin.require_auth();
        
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        
        // Önce tokenleri kontrat için ayarla
        // Kontrat, tokenler vesting olana kadar onları tutar
        receive_balance(&e, e.current_contract_address(), total_amount);
        
        create_vesting_schedule(
            &e, 
            admin, 
            beneficiary, 
            total_amount, 
            start_ledger, 
            duration_ledgers, 
            vesting_type, 
            steps, 
            cliff_ledger
        )
    }
    
    pub fn claim_vesting(e: Env, beneficiary: Address) -> Result<i128, VestingError> {
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        
        let claimable = claim_vested_tokens(&e, beneficiary.clone())?;
        
        // Vested tokenleri kontrat adresinden hak sahibine aktar
        spend_balance(&e, e.current_contract_address(), claimable);
        receive_balance(&e, beneficiary.clone(), claimable);
        
        TokenUtils::new(&e).events().transfer(e.current_contract_address(), beneficiary, claimable);
        
        Ok(claimable)
    }
    
    pub fn get_vesting_info(e: Env, beneficiary: Address) -> Result<VestingSchedule, VestingError> {
        get_vesting_schedule(&e, beneficiary)
    }
    
    pub fn get_vested_amount(e: Env, beneficiary: Address) -> Result<i128, VestingError> {
        calculate_vested_amount(&e, beneficiary)
    }
    
    // Toplu transfer fonksiyonu
    pub fn batch_transfer(
        e: Env, 
        from: Address, 
        recipients: Vec<Address>, 
        amounts: Vec<i128>
    ) -> Result<(), BatchError> {
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        
        batch_transfer(&e, from, recipients, amounts)
    }
    
    // Koşullu transfer fonksiyonları
    pub fn create_conditional(
        e: Env,
        from: Address,
        to: Address,
        amount: i128,
        condition_type: ConditionType,
        expiration_ledger: u32
    ) -> Result<(), ConditionalError> {
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
            
        create_conditional_transfer(&e, from, to, amount, condition_type, expiration_ledger)
    }
    
    pub fn execute_conditional(
        e: Env,
        transfer_id: u32,
        approver: Option<Address>
    ) -> Result<(), ConditionalError> {
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
            
        execute_conditional_transfer(&e, transfer_id, approver)
    }
}

#[contractimpl]
impl token::Interface for Token {
    fn allowance(e: Env, from: Address, spender: Address) -> i128 {
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        read_allowance(&e, from, spender).amount
    }

    fn approve(e: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32) {
        from.require_auth();

        check_nonnegative_amount(amount);

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        write_allowance(&e, from.clone(), spender.clone(), amount, expiration_ledger);
        TokenUtils::new(&e)
            .events()
            .approve(from, spender, amount, expiration_ledger);
    }

    fn balance(e: Env, id: Address) -> i128 {
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        read_balance(&e, id)
    }

    fn transfer(e: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        check_nonnegative_amount(amount);

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        // Göndericinin hesabı dondurulmuş mu kontrol et
        if is_account_frozen(&e, &from) {
            panic!("Hesap dondurulmuş ve token transfer edilemez");
        }

        // Transferi gerçekleştir
        spend_balance(&e, from.clone(), amount);
        receive_balance(&e, to.clone(), amount);
        TokenUtils::new(&e).events().transfer(from, to, amount);
    }

    fn transfer_from(e: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();

        check_nonnegative_amount(amount);

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        // Göndericinin hesabı dondurulmuş mu kontrol et
        if is_account_frozen(&e, &from) {
            panic!("Hesap dondurulmuş ve token transfer edilemez");
        }

         // Transferi gerçekleştir
        spend_allowance(&e, from.clone(), spender, amount);
        spend_balance(&e, from.clone(), amount);
        receive_balance(&e, to.clone(), amount);
        TokenUtils::new(&e).events().transfer(from, to, amount)
    }

    fn burn(e: Env, from: Address, amount: i128) {
        from.require_auth();

        check_nonnegative_amount(amount);

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        // Göndericinin hesabı dondurulmuş mu kontrol et
        if is_account_frozen(&e, &from) {
            panic!("Hesap dondurulmuş ve token yakılamaz");
        }

        // Yakma işlemini gerçekleştir
        spend_balance(&e, from.clone(), amount);
        TokenUtils::new(&e).events().burn(from, amount);
    }

    fn burn_from(e: Env, spender: Address, from: Address, amount: i128) {
        spender.require_auth();

        check_nonnegative_amount(amount);

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

         // Göndericinin hesabı dondurulmuş mu kontrol et
         if is_account_frozen(&e, &from) {
            panic!("Hesap dondurulmuş ve token yakılamaz");
        }

        // Yakma işlemini gerçekleştir
        spend_allowance(&e, from.clone(), spender, amount);
        spend_balance(&e, from.clone(), amount);
        TokenUtils::new(&e).events().burn(from, amount)
    }

    fn decimals(e: Env) -> u32 {
        read_decimal(&e)
    }

    fn name(e: Env) -> String {
        read_name(&e)
    }

    fn symbol(e: Env) -> String {
        read_symbol(&e)
    }
}
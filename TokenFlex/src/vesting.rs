use soroban_sdk::{Address, Env, contracterror, contracttype};
use crate::storage_types::{DataKey, INSTANCE_BUMP_AMOUNT, INSTANCE_LIFETIME_THRESHOLD};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VestingError {
    VestingScheduleAlreadyExists = 1,
    VestingScheduleDoesNotExist = 2,
    InsufficientVestedTokens = 3,
    InvalidVestingParameters = 4,
}

#[contracttype]
pub enum VestingType {
    Linear,    // Zaman içinde doğrusal olarak serbest bırakılır
    Cliff,     // Belirli bir süre sonra hepsi bir seferde serbest bırakılır
    Stepped,   // Belirli aralıklarla adım adım serbest bırakılır
}

#[contracttype]
pub struct VestingSchedule {
    pub beneficiary: Address,       // Hakediş alan adres
    pub total_amount: i128,         // Toplam hakediş miktarı
    pub start_ledger: u32,          // Hakediş başlangıç zamanı (ledger olarak)
    pub duration_ledgers: u32,      // Toplam hakediş süresi (ledger olarak)
    pub vesting_type: VestingType,  // Hakediş tipi
    pub claimed_amount: i128,       // Şimdiye kadar talep edilen miktar
    pub steps: u32,                 // Adım sayısı (basamaklı hakediş için)
    pub cliff_ledger: u32,          // Cliff zamanı (cliff hakediş için)
}

// Yeni bir hakediş planı oluştur
pub fn create_vesting_schedule(
    e: &Env,
    admin: Address, 
    beneficiary: Address,
    total_amount: i128,
    start_ledger: u32,
    duration_ledgers: u32,
    vesting_type: VestingType,
    steps: u32,
    cliff_ledger: u32
) -> Result<(), VestingError> {
    // Parametreleri doğrula
    if total_amount <= 0 || duration_ledgers == 0 {
        return Err(VestingError::InvalidVestingParameters);
    }
    
    // Hakediş planı zaten var mı kontrol et
    let key = DataKey::VestingSchedule(beneficiary.clone());
    if e.storage().instance().has(&key) {
        return Err(VestingError::VestingScheduleAlreadyExists);
    }
    
    // Hakediş planını oluştur
    let schedule = VestingSchedule {
        beneficiary: beneficiary.clone(),
        total_amount,
        start_ledger,
        duration_ledgers,
        vesting_type,
        claimed_amount: 0,
        steps,
        cliff_ledger,
    };
    
    // Hakediş planını kaydet
    e.storage().instance().set(&key, &schedule);
    e.storage()
        .instance()
        .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
    
    // Olay yayınla
    e.events().publish(
        ("create_vesting", admin, beneficiary),
        (total_amount, start_ledger, duration_ledgers)
    );
    
    Ok(())
}

// Mevcut ledger'da ne kadar token serbest bırakıldığını hesapla
pub fn calculate_vested_amount(e: &Env, beneficiary: Address) -> Result<i128, VestingError> {
    let key = DataKey::VestingSchedule(beneficiary.clone());
    
    // Hakediş planını al
    if !e.storage().instance().has(&key) {
        return Err(VestingError::VestingScheduleDoesNotExist);
    }
    
    let schedule: VestingSchedule = e.storage().instance().get(&key).unwrap();
    let current_ledger = e.ledger().sequence();
    
    // Hakediş başlamadıysa
    if current_ledger < schedule.start_ledger {
        return Ok(0);
    }
    
    // Hakediş tamamlandıysa
    if current_ledger >= schedule.start_ledger + schedule.duration_ledgers {
        return Ok(schedule.total_amount);
    }
    
    // Hakediş tipine göre serbest bırakılan miktarı hesapla
    match schedule.vesting_type {
        VestingType::Linear => {
            let elapsed = current_ledger - schedule.start_ledger;
            let vested = (schedule.total_amount * elapsed as i128) / schedule.duration_ledgers as i128;
            Ok(vested)
        },
        
        VestingType::Cliff => {
            if current_ledger >= schedule.cliff_ledger {
                Ok(schedule.total_amount)
            } else {
                Ok(0)
            }
        },
        
        VestingType::Stepped => {
            if schedule.steps == 0 {
                return Err(VestingError::InvalidVestingParameters);
            }
            
            let elapsed = current_ledger - schedule.start_ledger;
            let step_size = schedule.duration_ledgers / schedule.steps;
            let completed_steps = elapsed / step_size;
            
            if completed_steps >= schedule.steps {
                Ok(schedule.total_amount)
            } else {
                let vested = (schedule.total_amount * completed_steps as i128) / schedule.steps as i128;
                Ok(vested)
            }
        }
    }
}

// Serbest bırakılan tokenleri talep et
pub fn claim_vested_tokens(e: &Env, beneficiary: Address) -> Result<i128, VestingError> {
    beneficiary.require_auth();
    
    let key = DataKey::VestingSchedule(beneficiary.clone());
    
    // Hakediş planını al
    if !e.storage().instance().has(&key) {
        return Err(VestingError::VestingScheduleDoesNotExist);
    }
    
    let mut schedule: VestingSchedule = e.storage().instance().get(&key).unwrap();
    
    // Serbest bırakılan miktarı hesapla
    let vested_amount = calculate_vested_amount(e, beneficiary.clone())?;
    let claimable = vested_amount - schedule.claimed_amount;
    
    if claimable <= 0 {
        return Err(VestingError::InsufficientVestedTokens);
    }
    
    // Talep edilen miktarı güncelle
    schedule.claimed_amount += claimable;
    e.storage().instance().set(&key, &schedule);
    
    // Olay yayınla
    e.events().publish(
        ("claim_vested", beneficiary.clone()),
        (claimable, schedule.claimed_amount, schedule.total_amount)
    );
    
    Ok(claimable)
}

// Hakediş planı detaylarını al
pub fn get_vesting_schedule(e: &Env, beneficiary: Address) -> Result<VestingSchedule, VestingError> {
    let key = DataKey::VestingSchedule(beneficiary.clone());
    
    if !e.storage().instance().has(&key) {
        return Err(VestingError::VestingScheduleDoesNotExist);
    }
    
    Ok(e.storage().instance().get(&key).unwrap())
}
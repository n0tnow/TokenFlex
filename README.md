![ADB5DFC3-155A-4E1D-9222-D6B87C27B6D7](https://github.com/user-attachments/assets/f05b107a-6fc5-46c4-81c5-953e5f063fe8)

# TokenFlex: Advanced Soroban Token Contract
TokenFlex is a comprehensive token implementation built on the Soroban smart contract platform for the Stellar blockchain. It extends the standard token functionality with advanced features designed for sophisticated financial applications.

# 🌟 Features
## Core Token Features
Standard Operations: Mint, transfer, burn tokens and manage allowances Admin Controls: Administrative functions for token management Metadata Management: Token name, symbol, and decimal information

## Advanced Functionality
Account Freezing: Ability to freeze/unfreeze accounts for regulatory compliance Token Vesting: Multiple vesting schedules (linear, cliff, stepped) for token distribution Batch Operations: Send tokens to multiple recipients in a single transaction Conditional Transfers: Create transfers with time-based or approval-required conditions

## 📋 Project Structure
Smart Contract (Rust)

Token Core
admin.rs: Administrator functions and access control allowance.rs: Token spending permission management balance.rs: Balance operations and tracking metadata.rs: Token information management contract.rs: Main contract implementation with token interface

Advanced Features
vesting.rs: Token vesting schedule implementation batch.rs: Batch transfer operations conditional.rs: Conditional transfer mechanisms

Utilities
storage_types.rs: Data structures for contract storage lib.rs: Contract module organization test.rs: Unit tests for contract functionality

Frontend Application (React)
Core Components
Dashboard: Main token information and transfer functionality Admin Panel: Contract administration functions Vesting: Schedule creation and management Batch Operations: Multi-recipient transfer interface

Utilities
Wallet integration with Freighter (Stellar wallet) Soroban contract interaction services

## 🔧 Technical Details
Contract Architecture The contract follows a modular design with specialized components for different token functionalities. It uses Soroban's storage patterns with bump periods to manage data lifetime. Storage Design

Persistent Storage: For balances and critical data Temporary Storage: For time-limited data like allowances Instance Storage: For contract configuration

Key Functions Token Management

initialize: Set up the token with admin, decimal precision, name, and symbol mint: Create new tokens (admin only) burn/burn_from: Destroy tokens transfer/transfer_from: Move tokens between accounts balance: View address balance

Allowance Management
approve: Grant spending permission allowance: View authorized spending amount

Admin Operations
set_admin: Change the administrator address freeze_account/unfreeze_account: Control account status

Advanced Features
create_vesting_schedule: Set up token vesting claim_vested_tokens: Release tokens according to vesting schedule batch_transfer: Send to multiple recipients create_conditional_transfer: Create transfers with conditions execute_conditional_transfer: Complete transfers when conditions are met

## 🚀 Getting Started
Prerequisites

Rust toolchain Soroban SDK Node.js and npm (for frontend)

Building the Contract
bash# Build the contract cargo build --release

Generate WASM file
cargo build --target wasm32-unknown-unknown --release Deploying the Contract bash# Using Soroban CLI soroban contract deploy
--wasm target/wasm32-unknown-unknown/release/soroban_token_contract.wasm
--source ADMIN_ACCOUNT
--network testnet Initializing the Token bash# Using Soroban CLI soroban contract invoke
--id CONTRACT_ID
--source ADMIN_ACCOUNT
--network testnet
-- initialize
--admin ADMIN_ADDRESS
--decimal 7
--name "TokenFlex"
--symbol "TFX" 🖥️ Frontend Application The included React application provides a user-friendly interface for interacting with the token contract. It features:

Dashboard for viewing token information and performing transfers Admin panel for contract management Vesting interface for creating and managing vesting schedules Batch operations panel for multi-recipient transfers

Running the Frontend bash# Install dependencies npm install

Start development server
npm start

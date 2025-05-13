use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    instruction::Instruction,
    program::invoke_signed,
};
use std::str::FromStr;

declare_id!("9RS7omQopJpsW3uYiCfxoTboEBtxo6a6o5GB5GCvmzUi"); // Replace with your actual program ID

// Import the vault program ID
const VAULT_PROGRAM_ID: &str = "GArNcH5X1sQka24mZvrGuA3QqDhvE9CBe35ZugwNevoH";

#[program]
pub mod smart_wallet {
    use super::*;

    // Initialize a new smart wallet for a user
    pub fn initialize_wallet(ctx: Context<InitializeWallet>, authority: Pubkey) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        wallet.authority = authority;
        wallet.nonce = 0;
        wallet.vault_program = Pubkey::from_str(VAULT_PROGRAM_ID).unwrap();

        msg!("Smart wallet initialized with authority: {}", authority);
        Ok(())
    }

    // Rest of the code remains unchanged
    // ... existing code ...
} 
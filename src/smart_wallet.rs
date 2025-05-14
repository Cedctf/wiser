use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    instruction::Instruction,
    program::invoke_signed,
};
use std::str::FromStr;

declare_id!("9RS7omQopJpsW3uYiCfxoTboEBtxo6a6o5GB5GCvmzUi"); // Update with your actual program ID

// Import the vault program ID
const VAULT_PROGRAM_ID: &str = "GArNcH5X1sQka24mZvrGuA3QqDhvE9CBe35ZugwNevoH";
// The actual vault PDA from the vault contract
const VAULT_PDA: &str = "93XAG4BtLd4d6WQtuAfTAyg85yoXHMZiBrF9Aw8PcXvK";

#[program]
pub mod smart_wallet {
    use super::*;

    // Initialize a new smart wallet for a user
    pub fn initialize_wallet(ctx: Context<InitializeWallet>) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        wallet.owner = ctx.accounts.owner.key();
        wallet.vault_program = Pubkey::from_str(VAULT_PROGRAM_ID).unwrap();
        wallet.vault_pda = Pubkey::from_str(VAULT_PDA).unwrap();

        msg!("Smart wallet initialized for owner: {}", wallet.owner);
        Ok(())
    }

    // Request funds from vault and execute transaction
    pub fn execute_transaction(
        ctx: Context<ExecuteTransaction>,
        amount: u64,
    ) -> Result<()> {
        let wallet = &ctx.accounts.wallet;
        
        // Verify owner
        require!(
            ctx.accounts.owner.key() == wallet.owner,
            WalletError::InvalidOwner
        );
        
        // Verify vault account
        require!(
            ctx.accounts.vault.key() == wallet.vault_pda,
            WalletError::InvalidVaultAccount
        );
        
        // Step 1: Request funds from the vault to the wallet PDA
        let withdraw_ix = anchor_lang::solana_program::instruction::Instruction {
            program_id: wallet.vault_program,
            accounts: vec![
                AccountMeta::new(ctx.accounts.vault.key(), false),
                AccountMeta::new(ctx.accounts.wallet_pda.key(), false),
                AccountMeta::new_readonly(ctx.accounts.owner.key(), true),
                AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
            ],
            data: anchor_lang::AnchorSerialize::try_to_vec(&WithdrawArgs {
                instruction: 2, // withdraw instruction index
                amount,
            })?,
        };
        
        // Calculate the wallet PDA seeds for signing
        let wallet_seeds = &[
            b"wallet",
            wallet.owner.as_ref(),
            &[ctx.bumps.wallet_pda],
        ];
        
        // Invoke the withdraw instruction
        invoke_signed(
            &withdraw_ix,
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.wallet_pda.to_account_info(),
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[wallet_seeds],
        )?;
        
        msg!("Withdrew {} lamports from vault to wallet PDA", amount);
        
        // Now the wallet PDA has funds to pay for the transaction
        // The actual transaction execution will be handled by the client
        
        Ok(())
    }
    
    // Return unused funds back to the vault
    pub fn return_funds(ctx: Context<ReturnFunds>, amount: u64) -> Result<()> {
        let wallet = &ctx.accounts.wallet;
        
        // Verify owner
        require!(
            ctx.accounts.owner.key() == wallet.owner,
            WalletError::InvalidOwner
        );
        
        // Verify vault account
        require!(
            ctx.accounts.vault.key() == wallet.vault_pda,
            WalletError::InvalidVaultAccount
        );
        
        // Calculate the wallet PDA seeds for signing
        let wallet_seeds = &[
            b"wallet",
            wallet.owner.as_ref(),
            &[ctx.bumps.wallet_pda],
        ];
        
        // Create a system instruction to transfer funds back to the vault
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.wallet_pda.key(),
            &ctx.accounts.vault.key(),
            amount,
        );
        
        // Execute the transfer with PDA signature
        invoke_signed(
            &transfer_ix,
            &[
                ctx.accounts.wallet_pda.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[wallet_seeds],
        )?;
        
        msg!("Returned {} lamports to vault", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeWallet<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 32 + 32, // Discriminator + Owner + Vault Program ID + Vault PDA
        seeds = [b"wallet_account", owner.key().as_ref()],
        bump
    )]
    pub wallet: Account<'info, WalletAccount>,
    
    // PDA that will act as the wallet address
    /// CHECK: This is a PDA that will be used as a wallet
    #[account(
        seeds = [b"wallet", owner.key().as_ref()],
        bump,
    )]
    pub wallet_pda: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteTransaction<'info> {
    #[account(
        has_one = owner @ WalletError::InvalidOwner,
    )]
    pub wallet: Account<'info, WalletAccount>,
    
    #[account(
        mut,
        seeds = [b"wallet", owner.key().as_ref()],
        bump,
    )]
    /// CHECK: This is the wallet PDA that will be used to sign transactions
    pub wallet_pda: AccountInfo<'info>,
    
    /// CHECK: This is verified in the vault program
    #[account(mut)]
    pub vault: AccountInfo<'info>,
    
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReturnFunds<'info> {
    #[account()]
    pub wallet: Account<'info, WalletAccount>,
    
    #[account(
        mut,
        seeds = [b"wallet", owner.key().as_ref()],
        bump,
    )]
    /// CHECK: This is the wallet PDA that will be used to sign transactions
    pub wallet_pda: AccountInfo<'info>,
    
    /// CHECK: This is the vault account from the vault program
    #[account(mut)]
    pub vault: AccountInfo<'info>,
    
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct WalletAccount {
    pub owner: Pubkey,         // The owner that can control this wallet
    pub vault_program: Pubkey, // The program ID of the vault
    pub vault_pda: Pubkey,     // The PDA of the vault account
}

// Define the withdraw arguments struct
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct WithdrawArgs {
    pub instruction: u8,
    pub amount: u64,
}

#[error_code]
pub enum WalletError {
    #[msg("Invalid owner for this wallet")]
    InvalidOwner,
    
    #[msg("Invalid vault account")]
    InvalidVaultAccount,
} 
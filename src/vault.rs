use anchor_lang::prelude::*;

declare_id!("GArNcH5X1sQka24mZvrGuA3QqDhvE9CBe35ZugwNevoH");

#[program]
pub mod super_minimal {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Vault initialized");
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            ctx.accounts.depositor.key,
            ctx.accounts.vault.to_account_info().key, 
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.depositor.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        msg!("Deposited {} lamports to vault", amount);
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let vault_info = ctx.accounts.vault.to_account_info();
        let vault_balance = vault_info.lamports();
        
        let rent = Rent::get()?;
        let rent_exempt_min = rent.minimum_balance(8);
        
        require!(
            vault_balance >= amount + rent_exempt_min,
            ErrorCode::InsufficientFunds
        );
        
        **vault_info.try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.recipient.try_borrow_mut_lamports()? += amount;
        
        msg!("Withdrawn {} lamports from vault to {}", amount, ctx.accounts.recipient.key());
        Ok(())
    }
}

#[account]
pub struct VaultAccount {}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        init,
        payer = payer,
        space = 8,  
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, VaultAccount>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, VaultAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, VaultAccount>,

    #[account(mut)]
    pub recipient: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds in the vault")]
    InsufficientFunds,
}
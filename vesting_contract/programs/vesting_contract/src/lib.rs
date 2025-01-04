use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};

declare_id!("GFdLg11UBR8ZeePW43ZyD1gY4z4UQ96LPa22YBgnn4z8");
#[program]
pub mod vesting_contract {
    use super::*;

    pub fn create_vesting_account(
        ctx: Context<CreateVestingAccount>,
        company_name: String,
    ) -> Result<()> {
        *ctx.accounts.vesting_account = VestingAccount {
            owner: ctx.accounts.signer.key(),
            mint: ctx.accounts.mint.key(),
            treasury_token_account: ctx.accounts.treasury_token_account.key(),
            company_name,
            treasury_bump: ctx.bumps.treasury_token_account,
            bump: ctx.bumps.vesting_account,
        };

        Ok(())
    }

    pub fn create_employee_vesting(
        ctx: Context<CreateEmployeeAccount>,
        start_time: i64,
        end_time: i64,
        total_amount: i64,
        cliff_time: i64,
    ) -> Result<()> {
        *ctx.accounts.employee_account = EmployeeAccount {
            beneficiary: ctx.accounts.beneficiary.key(),
            start_time,
            end_time,
            total_amount,
            total_withdrawn: 0,
            cliff_time,
            vesting_account: ctx.accounts.vesting_account.key(),
            bump: ctx.bumps.employee_account,
        };

        Ok(())
    }

    #[derive(Accounts)]
    #[instruction(company_name: String)]
    pub struct CreateVestingAccount<'info> {
        #[account(mut)]
        pub signer: Signer<'info>,
        #[account(
        init,
        space = 8 + VestingAccount::INIT_SPACE,
        payer = signer,
        seeds = [company_name.as_ref()],
        bump
    )]
        pub vesting_account: Account<'info, VestingAccount>,
        pub mint: InterfaceAccount<'info, Mint>,
        #[account(
        init,
        token::mint = mint,
        token::authority = treasury_token_account,
        payer = signer,
        seeds = [b"vesting_treasury", company_name.as_bytes()],
        bump
    )]
        pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,
        pub token_program: Interface<'info, TokenInterface>,
        pub system_program: Program<'info, System>,
    }

    #[derive(Accounts)]
    pub struct CreateEmployeeAccount<'info> {
        #[account(mut)]
        pub owner: Signer<'info>,
        pub beneficiary: SystemAccount<'info>,
        #[account(has_one = owner)]
        pub vesting_account: Account<'info, VestingAccount>,
        #[account(
        init,
        space = 8 + EmployeeAccount::INIT_SPACE,
        payer = owner,
        seeds = [b"employee_vesting", beneficiary.key().as_ref(), vesting_account.key().as_ref()],
        bump
    )]
        pub employee_account: Account<'info, EmployeeAccount>,
        pub system_program: Program<'info, System>,
    }

    #[account]
    #[derive(InitSpace, Debug)]
    pub struct VestingAccount {
        pub owner: Pubkey,
        pub mint: Pubkey,
        pub treasury_token_account: Pubkey,
        #[max_len(50)]
        pub company_name: String,
        pub treasury_bump: u8,
        pub bump: u8,
    }

    #[account]
    #[derive(InitSpace, Debug)]
    pub struct EmployeeAccount {
        pub beneficiary: Pubkey,
        pub start_time: i64,
        pub end_time: i64,
        pub total_amount: i64,
        pub total_withdrawn: i64,
        pub cliff_time: i64,
        pub vesting_account: Pubkey,
        pub bump: u8,
    }
}
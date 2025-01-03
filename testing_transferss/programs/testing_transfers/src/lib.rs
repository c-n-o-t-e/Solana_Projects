use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

declare_id!("CueaL9tbW9egY5Rcwzp4FvnBKaz4HcwCGxvxMxridcca");

#[program]
pub mod testing_transfers {
    use super::*;

    pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
        // msg!("Greetings from: {:?}", ctx.program_id);
        transfer_tokens(
            &ctx.accounts.user1_token_account_a,
            &ctx.accounts.user2_token_account_a,
            &amount,
            &ctx.accounts.token_mint_a,
            &ctx.accounts.user1,
            &ctx.accounts.token_program,
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut)]
    pub user1: Signer<'info>,

    #[account(mut)]
    pub user2: SystemAccount<'info>,

    #[account(mint::token_program = token_program)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = user1,
        associated_token::token_program = token_program
    )]
    pub user1_token_account_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user1,
        associated_token::mint = token_mint_a,
        associated_token::authority = user2,
        associated_token::token_program = token_program
    )]
    pub user2_token_account_a: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn transfer_tokens<'info>(
    from: &InterfaceAccount<'info, TokenAccount>,
    to: &InterfaceAccount<'info, TokenAccount>,
    amount: &u64,
    mint: &InterfaceAccount<'info, Mint>,
    authority: &Signer<'info>,
    token_program: &Interface<'info, TokenInterface>,
) -> Result<()> {
    let transfer_accounts_options = TransferChecked {
        from: from.to_account_info(),
        mint: mint.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };

    // the program youre using plus options
    let cpi_context = CpiContext::new(token_program.to_account_info(), transfer_accounts_options);

    transfer_checked(cpi_context, *amount, mint.decimals)
}

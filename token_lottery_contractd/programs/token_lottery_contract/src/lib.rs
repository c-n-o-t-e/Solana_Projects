use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::metadata::{
    create_master_edition_v3, create_metadata_accounts_v3,
    mpl_token_metadata::types::{CollectionDetails, Creator, DataV2},
    set_and_verify_sized_collection_item, sign_metadata, CreateMasterEditionV3,
    CreateMetadataAccountsV3, Metadata, MetadataAccount, SetAndVerifySizedCollectionItem,
    SignMetadata,
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface},
};
use switchboard_on_demand::accounts::RandomnessAccountData;

declare_id!("BTM3kQXxzRyAkB1m1N78r1g9x886y5h69BeDLaFDxeCn");

#[constant]
pub const NAME: &str = "Token Lottery Ticket #";
#[constant]
pub const URI: &str = "Token Lottery";
#[constant]
pub const SYMBOL: &str = "TICKET";

#[program]
pub mod token_lottery {

    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConifg>,
        start: u64,
        end: u64,
        price: u64,
    ) -> Result<()> {
        ctx.accounts.token_lottery.bump = ctx.bumps.token_lottery;
        ctx.accounts.token_lottery.lottery_start = start;
        ctx.accounts.token_lottery.lottery_end = end;
        ctx.accounts.token_lottery.price = price;
        ctx.accounts.token_lottery.authority = ctx.accounts.payer.key();
        ctx.accounts.token_lottery.randomness_account = Pubkey::default();

        ctx.accounts.token_lottery.ticket_num = 0;
        ctx.accounts.token_lottery.winner_chosen = false;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeConifg<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + TokenLottery::INIT_SPACE,
        // Challenge: Make this be able to run more than 1 lottery at a time
        seeds = [b"token_lottery".as_ref()],
        bump
    )]
    pub token_lottery: Box<Account<'info, TokenLottery>>,

    pub system_program: Program<'info, System>,
}

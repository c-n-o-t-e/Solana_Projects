use anchor_lang::prelude::*;

declare_id!("5UmsxDzMv1k5wGocBfLes6pGZ6iw2R5bmFqGHpJad1NX");

#[program]
pub mod crud {
    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreateEntry>,
        title: String,
        message: String,
    ) -> Result<()> {
        msg!("Journal Entry Created");
        msg!("Title: {}", title);
        msg!("Message: {}", message);

        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title;
        journal_entry.message = message;
        Ok(())
    }
}

pub fn update_journal_entry(
    ctx: Context<UpdateEntry>,
    title: String,
    message: String,
) -> Result<()> {
    msg!("Journal Entry Updated");
    msg!("Title: {}", title);
    msg!("Message: {}", message);

    let journal_entry = &mut ctx.accounts.journal_entry;
    journal_entry.message = message;

    Ok(())
}

pub fn delete_journal_entry(_ctx: Context<DeleteEntry>, title: String) -> Result<()> {
    msg!("Journal entry titled {} deleted", title);
    Ok(())
}


#[derive(Accounts)]
#[instruction(title: String, message: String)] //test
pub struct CreateEntry<'info> {
    #[account(
        init,
        seeds = [title.as_bytes(), owner.key().as_ref()], 
        bump, 
        payer = owner, 
        space = 8 + JournalEntryState::INIT_SPACE
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// realloc is used to increase or decrease the lamports and space of an account 

#[derive(Accounts)]
#[instruction(title: String, message: String)]
pub struct UpdateEntry<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()], 
        bump, 
        realloc = 8 + JournalEntryState::INIT_SPACE,
        realloc::payer = owner, 
        realloc::zero = true, // reset the account to zero and recalculate the space
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,

    #[max_len(64)]
    pub title: String,

    #[max_len(1000)]
    pub message: String,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
    #[account( 
        mut, 
        seeds = [title.as_bytes(), owner.key().as_ref()], 
        bump, 
        close = owner, // close the account
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

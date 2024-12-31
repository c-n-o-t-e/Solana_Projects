#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod votingdapp {
    use super::*;

    pub fn initialize_poll(ctx: Context<InitializePoll>, poll_id: u64, 
                            start_time: u64, 
                            end_time: u64,
                            description: String) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        poll.poll_id = poll_id;
        poll.pool_start = start_time;
        poll.pool_end = end_time;
        poll.description = description;
        poll.candidate_amount = 0;
        Ok(())
    }

    pub fn initialize_candidate(ctx: Context<InitializeCandidate>,
                                candidate_name: String, 
                                pool_id: u64) -> Result<()> {
        let poll =&mut ctx.accounts.poll;                         
        let candidate = &mut ctx.accounts.candidate;
        poll.candidate_amount += 1;
        candidate.candidate_votes = 0;
        candidate.candidate_name = candidate_name;
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, candidate_name: String, 
                                pool_id: u64) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;
        candidate.candidate_votes += 1;
        msg!("Voted for candidate: {}", candidate_name);
        msg!("Candidate votes: {}", candidate.candidate_votes);
        Ok(())
    }

    #[derive(Accounts)]
    #[instruction(candidate_name: String, pool_id: u64)]
    pub struct Vote<'info> {
      // not mutable because we are not paying for the account
        pub signer: Signer<'info>,

        // because we dont need to create it, we just need to read it
        #[account(
          seeds = [pool_id.to_le_bytes().as_ref()], 
          bump,
        )]
        pub poll: Account<'info, Poll>,

        // because we dont need to create it, we just need to read it
        #[account(
          mut, // if we want to update the account
          seeds = [candidate_name.as_bytes(), pool_id.to_le_bytes().as_ref()], 
          bump,
        )]
        pub candidate: Account<'info, Candidate>,
    }

    #[derive(Accounts)]
    #[instruction(candidate_name: String, pool_id: u64)]
    pub struct InitializeCandidate<'info> {
        #[account(mut)]
        pub signer: Signer<'info>,

        // because we dont need to create it, we just need to read it
        #[account(
          mut,
          seeds = [pool_id.to_le_bytes().as_ref()], 
          bump,
        )]
        pub poll: Account<'info, Poll>,

        // initialize candidate account
        #[account(
          init, 
          payer = signer, 
          space = 8 + Candidate::INIT_SPACE, 
          seeds = [candidate_name.as_bytes(), pool_id.to_le_bytes().as_ref()], 
          bump,
        )]
        pub candidate: Account<'info, Candidate>,

        pub system_program: Program<'info, System>,
    }

    #[account]
    #[derive(InitSpace)]
    pub struct Candidate {
      #[max_len(280)]
        pub candidate_name: String,
        pub candidate_votes: u64,
    }

    #[derive(Accounts)]
    #[instruction(poll_id: u64)]
    pub struct InitializePoll<'info> {
        #[account(mut)]
        pub signer: Signer<'info>,
        #[account(
          init, 
          payer = signer, space = 8 + Poll::INIT_SPACE, 
          seeds = [poll_id.to_le_bytes().as_ref()], 
          bump,
        )]
        pub poll: Account<'info, Poll>,
        pub system_program: Program<'info, System>,
    }

    #[account]
    #[derive(InitSpace)]
    pub struct Poll {
        pub poll_id: u64,
        #[max_len(280)]
        pub description: String,
        pub pool_start: u64,
        pub pool_end: u64,
        pub candidate_amount: u64,
    }
}

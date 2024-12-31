import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import { Votingdapp } from '../target/types/votingdapp'
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { program } from '@coral-xyz/anchor/dist/cjs/native/system';

const IDL = require("../target/idl/votingdapp.json");
const votingAddress = new PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF")

describe('votingdapp', () => {
  
  let context;
  let provider
  let votingProgram: Program<Votingdapp>;
  
  beforeAll(async () => {
    context = await startAnchor("", [{ name: "votingdapp", programId: votingAddress }], []);

    provider = new BankrunProvider(context);
  
    votingProgram = new Program<Votingdapp>(
      IDL,
      provider,
    );
  })
  it('should initialize the poll', async () => {
    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      new anchor.BN(0),
      new anchor.BN(1821246480),
      "Describe the weather conditions."
    ).rpc();

    /*
      it points to this [candidate_name.as_bytes(), pool_id.to_le_bytes().as_ref()]
    */
    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);
    console.log(poll);

    expect(poll.pollId.toNumber()).toBe(1);
    expect(poll.description).toBe("Describe the weather conditions.");
    expect(poll.poolStart.toNumber()).toBeLessThan(poll.poolEnd.toNumber());
  })
  

  it('should initialize the candidate', async () => {
    await votingProgram.methods.initializeCandidate(
      "Sunny",
      new anchor.BN(1)
    ).rpc();

    await votingProgram.methods.initializeCandidate(
      "Tunny",
      new anchor.BN(1)
    ).rpc();

    
    const [sunnyAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("Sunny"), new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress
    );
    
    const sunnyCandidate = await votingProgram.account.candidate.fetch(sunnyAddress);
    console.log(sunnyCandidate);

    const [tunnyAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("Tunny"), new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress
    );
    
    const tunnyCandidate = await votingProgram.account.candidate.fetch(tunnyAddress);
    console.log(tunnyCandidate);

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    // expect(poll.candidateAmount.toNumber()).toEqual(2);
    expect(tunnyCandidate.candidateName).toBe("Tunny");
    expect(tunnyCandidate.candidateVotes.toNumber()).toEqual(0);
    expect(sunnyCandidate.candidateName).toBe("Sunny");
    expect(sunnyCandidate.candidateVotes.toNumber()).toEqual(0);
  })

  it('should vote', async () => {
  await votingProgram.methods.vote("Sunny",
      new anchor.BN(1)
  ).rpc();
    
    const [sunnyAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("Sunny"), new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress
    );

    const sunnyCandidate = await votingProgram.account.candidate.fetch(sunnyAddress);
    expect(sunnyCandidate.candidateVotes.toNumber()).toEqual(1);
  })

  
})
  

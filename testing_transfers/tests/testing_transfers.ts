import {
  startAnchor,
  BanksClient,
  ProgramTestContext,
} from "solana-bankrun";

import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { BankrunProvider } from "anchor-bankrun";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import IDL from "../target/idl/testing_transfers.json";
import { makeKeypairs } from "@solana-developers/helpers";
import { TestingTransfers } from "../target/types/testing_transfers";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { createMint, mintTo, createAssociatedTokenAccount, getAccount } from "spl-token-bankrun";

const TOKEN_PROGRAM: typeof TOKEN_PROGRAM_ID = TOKEN_PROGRAM_ID;

describe("Transfer Tests", () => {
  let mint: PublicKey;
  let bob: anchor.web3.Keypair;
  let banksClient: BanksClient;
  let provider: BankrunProvider;
  let alice: anchor.web3.Keypair;
  let context: ProgramTestContext;
  let program: Program<TestingTransfers>;
  let bobAssociatedTokenAccount: anchor.web3.PublicKey;
  let aliceAssociatedTokenAccount: anchor.web3.PublicKey;

  // We're going to reuse these accounts across multiple tests
  const accounts: Record<string, PublicKey> = {
    tokenProgram: TOKEN_PROGRAM,
  };
  [alice, bob] = makeKeypairs(2);

  before(async () => {
    // set up bankrun
    context = await startAnchor(
      "",
      [{ name: "testing_transfers", programId: new PublicKey(IDL.address) }],
      [
        {
          address: bob.publicKey,
          info: {
            lamports: 1_000_000_000,
            data: Buffer.alloc(0),
            owner: SYSTEM_PROGRAM_ID,
            executable: true,
          },
        },
      ]
    );

    provider = new BankrunProvider(context);
    anchor.setProvider(provider);
    alice = provider.wallet.payer;
    banksClient = context.banksClient;
    program = new Program<TestingTransfers>(IDL as TestingTransfers, provider);

    // Create a new mint
    // @ts-ignore
    mint = await createMint(banksClient, alice, alice.publicKey, null, 2);
    aliceAssociatedTokenAccount = await createAssociatedTokenAccount(
                                              banksClient,
                                              alice,
                                              mint,
                                              alice.publicKey
    );
    
    bobAssociatedTokenAccount = await createAssociatedTokenAccount(
                                              banksClient,
                                              bob,
                                              mint,
                                              bob.publicKey
    );

    const amount = 10_00;
    await mintTo(
      // @ts-ignores
      banksClient,
      alice,
      mint,
      aliceAssociatedTokenAccount,
      alice,
      amount
    );

    await mintTo(
      // @ts-ignores
      banksClient,
      bob,
      mint,
      bobAssociatedTokenAccount,
      alice,
      amount
    );
    
    // Save the accounts for later use
    accounts.tokenMintA = mint;
    accounts.user2 = bob.publicKey;
    accounts.user1 = alice.publicKey;
    accounts.user2TokenAccountA = bobAssociatedTokenAccount;
    accounts.user1TokenAccountA = aliceAssociatedTokenAccount;
  })

  it("Should transfer tokens", async () => {
    const amountToTransfer = new BN(100);

    const tokenAccountInfo = await getAccount(banksClient, accounts.user1TokenAccountA);
    console.log(tokenAccountInfo.amount);

    const tokenAccountInfo2 = await getAccount(banksClient, accounts.user2TokenAccountA);
    console.log(tokenAccountInfo2.amount);

    // Transfer from Alice to Bob
    await program.methods
      .transfer(amountToTransfer)
      .accounts({
        ...accounts,
      })
      .signers([alice])
      .rpc();

    const tokenAccountInfo3 = await getAccount(banksClient, accounts.user1TokenAccountA);
    console.log(tokenAccountInfo3.amount);

    const tokenAccountInfo4 = await getAccount(banksClient, accounts.user2TokenAccountA);
    console.log(tokenAccountInfo4.amount);

    accounts.user1 = bob.publicKey;
    accounts.user2 = alice.publicKey;
    accounts.user1TokenAccountA = bobAssociatedTokenAccount;
    accounts.user2TokenAccountA = aliceAssociatedTokenAccount;

    // Transfer from Bob to Alice
    await program.methods
      .transfer(amountToTransfer)
      .accounts({
        ...accounts
      })
      .signers([bob])
      .rpc();

    const tokenAccountInfo5 = await getAccount(banksClient, accounts.user2TokenAccountA);
    console.log(tokenAccountInfo5.amount);

    const tokenAccountInfo6 = await getAccount(banksClient, accounts.user1TokenAccountA);
    console.log(tokenAccountInfo6.amount);
  })
})
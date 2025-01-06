import * as anchor from "@coral-xyz/anchor";
import { BankrunProvider } from "anchor-bankrun";
import {
  TOKEN_2022_PROGRAM_ID,
   TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BN, Program } from "@coral-xyz/anchor";

import {
  startAnchor,
  Clock,
  BanksClient,
  ProgramTestContext,
} from "solana-bankrun";

import {
  makeKeypairs,
} from "@solana-developers/helpers";

import { createMint, mintTo, createAssociatedTokenAccount, getAccount } from "spl-token-bankrun";
import { PublicKey } from "@solana/web3.js";

import IDL from "../target/idl/testing_transfers.json";
import { TestingTransfers } from "../target/types/testing_transfers";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

// Work on both Token Program and new Token Extensions Program
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

    program = new Program<TestingTransfers>(IDL as TestingTransfers, provider);

    banksClient = context.banksClient;
    alice = provider.wallet.payer;

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
    
    

    const balance = await banksClient.getBalance(bob.publicKey)
    
    console.log("bob", balance);
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









































// import { randomBytes } from "node:crypto";
// import * as anchor from "@coral-xyz/anchor";
// import { BN, type Program } from "@coral-xyz/anchor";
// import {
//   TOKEN_2022_PROGRAM_ID,
//   type TOKEN_PROGRAM_ID,
//   getAssociatedTokenAddressSync,
// } from "@solana/spl-token";
// import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
// import { assert } from "chai";
// import { TestingTransfers } from "../target/types/testing_transfers";

// import {
//   confirmTransaction,
//   createAccountsMintsAndTokenAccounts,
//   makeKeypairs,
// } from "@solana-developers/helpers";

// // Work on both Token Program and new Token Extensions Program
// const TOKEN_PROGRAM: typeof TOKEN_2022_PROGRAM_ID | typeof TOKEN_PROGRAM_ID =
//   TOKEN_2022_PROGRAM_ID;

// const SECONDS = 1000;

// // Tests must complete within half this time otherwise
// // they are marked as slow. Since Anchor involves a little
// // network IO, these tests usually take about 15 seconds.
// const ANCHOR_SLOW_TEST_THRESHOLD = 40 * SECONDS;

// const getRandomBigNumber = (size = 8) => {
//   return new BN(randomBytes(size));
// };

// describe("transfers", () => {
//   // Use the cluster and the keypair from Anchor.toml
//   const provider = anchor.AnchorProvider.env();
//   anchor.setProvider(provider);

//   const program = anchor.workspace.TestingTransfers as Program<TestingTransfers>;
//   const user = (provider.wallet as anchor.Wallet).payer;
//   const payer = user;

//   const connection = provider.connection;

  // // We're going to reuse these accounts across multiple tests
  // const accounts: Record<string, PublicKey> = {
  //   tokenProgram: TOKEN_PROGRAM,
  // };

  // let alice: anchor.web3.Keypair;
  // let bob: anchor.web3.Keypair;
  // let tokenMintA: anchor.web3.Keypair;

  // [alice, bob, tokenMintA] = makeKeypairs(3);

//   const amountToTransfer = new BN(1_000);
//   let aliceTokenAccountA;
//   let bobTokenAccountA;

//   before(
//     "Creates Alice and Bob accounts, 2 token mints, and associated token accounts for both tokens for both users",
//     async () => {
//       const usersMintsAndTokenAccounts =
//         await createAccountsMintsAndTokenAccounts(
//           [
//             // Alice's token balances
//             [
//               // 1_000_000_000 of token A
//               1_000_000_000,
//               // 0 of token B
//               0,
//             ],
//             // Bob's token balances
//             [
//               // 0 of token A
//               0,
//               // 1_000_000_000 of token B
//               1_000_000_000,
//             ],
//           ],
//           1 * LAMPORTS_PER_SOL,
//           connection,
//           payer
//         );

//       const users = usersMintsAndTokenAccounts.users;
//       alice = users[0];
//       bob = users[1];

//       const mints = usersMintsAndTokenAccounts.mints;
//       tokenMintA = mints[0];

//       const tokenAccounts = usersMintsAndTokenAccounts.tokenAccounts;
//        aliceTokenAccountA = tokenAccounts[0][0];
//        bobTokenAccountA = tokenAccounts[1][0];

      // // Save the accounts for later use
      // accounts.user1 = alice.publicKey;
      // accounts.user2 = bob.publicKey;
      // accounts.tokenMintA = tokenMintA.publicKey;
      // accounts.user1TokenAccountA = aliceTokenAccountA;
      // accounts.user2TokenAccountA = bobTokenAccountA;
//     }
//   );

  // it("Should transfer tokens", async () => {
  //   const vaultBalanceResponse = await connection.getTokenAccountBalance(accounts.user1TokenAccountA);
  //   console.log(vaultBalanceResponse.value.amount);

  //   // Transfer from Alice to Bob
  //   const transactionSignature = await program.methods
  //     .transfer(amountToTransfer)
  //     .accounts({
  //       ...accounts
  //     })
  //     .signers([alice])
  //     .rpc();

  //   await confirmTransaction(connection, transactionSignature);

  //   const vaultBalanceResponse3 = await connection.getTokenAccountBalance(aliceTokenAccountA);
  //   console.log(vaultBalanceResponse3.value.amount, 'i');

  //   const vaultBalanceResponse4 = await connection.getTokenAccountBalance(bobTokenAccountA);
  //   console.log(vaultBalanceResponse4.value.amount, 'ii');

  //   accounts.user1 = bob.publicKey;
  //   accounts.user2 = alice.publicKey;
  //   accounts.user1TokenAccountA = bobTokenAccountA;
  //   accounts.user2TokenAccountA = aliceTokenAccountA;

  //   // Transfer from Bob to Alice
  //   const transactionSignature2 = await program.methods
  //     .transfer(amountToTransfer)
  //     .accounts({
  //       ...accounts
  //     })
  //     .signers([bob])
  //     .rpc();

  //   await confirmTransaction(connection, transactionSignature2);

  //   const vaultBalanceResponse5 = await connection.getTokenAccountBalance(aliceTokenAccountA);
  //   console.log(vaultBalanceResponse5.value.amount,'i');

  //   const vaultBalanceResponse6 = await connection.getTokenAccountBalance(bobTokenAccountA);
  //   console.log(vaultBalanceResponse6.value.amount,'ii');
  // })

// });

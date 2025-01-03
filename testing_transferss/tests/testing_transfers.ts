import { randomBytes } from "node:crypto";
import * as anchor from "@coral-xyz/anchor";
import { BN, type Program } from "@coral-xyz/anchor";
import {
  TOKEN_2022_PROGRAM_ID,
  type TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { TestingTransfers } from "../target/types/testing_transfers";

import {
  confirmTransaction,
  createAccountsMintsAndTokenAccounts,
  makeKeypairs,
} from "@solana-developers/helpers";

// Work on both Token Program and new Token Extensions Program
const TOKEN_PROGRAM: typeof TOKEN_2022_PROGRAM_ID | typeof TOKEN_PROGRAM_ID =
  TOKEN_2022_PROGRAM_ID;

const SECONDS = 1000;

// Tests must complete within half this time otherwise
// they are marked as slow. Since Anchor involves a little
// network IO, these tests usually take about 15 seconds.
const ANCHOR_SLOW_TEST_THRESHOLD = 40 * SECONDS;

const getRandomBigNumber = (size = 8) => {
  return new BN(randomBytes(size));
};

describe("transfers", () => {
  // Use the cluster and the keypair from Anchor.toml
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TestingTransfers as Program<TestingTransfers>;
  const user = (provider.wallet as anchor.Wallet).payer;
  const payer = user;

  const connection = provider.connection;

  // We're going to reuse these accounts across multiple tests
  const accounts: Record<string, PublicKey> = {
    tokenProgram: TOKEN_PROGRAM,
  };

  let alice: anchor.web3.Keypair;
  let bob: anchor.web3.Keypair;
  let tokenMintA: anchor.web3.Keypair;

  [alice, bob, tokenMintA] = makeKeypairs(3);

  const amountToTransfer = new BN(1_000);
  let aliceTokenAccountA;
  let bobTokenAccountA;

  before(
    "Creates Alice and Bob accounts, 2 token mints, and associated token accounts for both tokens for both users",
    async () => {
      const usersMintsAndTokenAccounts =
        await createAccountsMintsAndTokenAccounts(
          [
            // Alice's token balances
            [
              // 1_000_000_000 of token A
              1_000_000_000,
              // 0 of token B
              0,
            ],
            // Bob's token balances
            [
              // 0 of token A
              0,
              // 1_000_000_000 of token B
              1_000_000_000,
            ],
          ],
          1 * LAMPORTS_PER_SOL,
          connection,
          payer
        );

      const users = usersMintsAndTokenAccounts.users;
      alice = users[0];
      bob = users[1];

      const mints = usersMintsAndTokenAccounts.mints;
      tokenMintA = mints[0];

      const tokenAccounts = usersMintsAndTokenAccounts.tokenAccounts;
       aliceTokenAccountA = tokenAccounts[0][0];
       bobTokenAccountA = tokenAccounts[1][0];

      // Save the accounts for later use
      accounts.user1 = alice.publicKey;
      accounts.user2 = bob.publicKey;
      accounts.tokenMintA = tokenMintA.publicKey;
      accounts.user1TokenAccountA = aliceTokenAccountA;
      accounts.user2TokenAccountA = bobTokenAccountA;
    }
  );

  it("Should transfer from Alice to Bob", async () => {
    const vaultBalanceResponse = await connection.getTokenAccountBalance(accounts.user1TokenAccountA);
    console.log(vaultBalanceResponse.value.amount);

    // Transfer from Alice to Bob
    const transactionSignature = await program.methods
      .transfer(amountToTransfer)
      .accounts({
        ...accounts
      })
      .signers([alice])
      .rpc();

    await confirmTransaction(connection, transactionSignature);

    const vaultBalanceResponse3 = await connection.getTokenAccountBalance(aliceTokenAccountA);
    console.log(vaultBalanceResponse3.value.amount, 'i');

    const vaultBalanceResponse4 = await connection.getTokenAccountBalance(bobTokenAccountA);
    console.log(vaultBalanceResponse4.value.amount, 'ii');

    accounts.user1 = bob.publicKey;
    accounts.user2 = alice.publicKey;
    accounts.user1TokenAccountA = bobTokenAccountA;
    accounts.user2TokenAccountA = aliceTokenAccountA;

    // Transfer from Bob to Alice
    const transactionSignature2 = await program.methods
      .transfer(amountToTransfer)
      .accounts({
        ...accounts
      })
      .signers([bob])
      .rpc();

    await confirmTransaction(connection, transactionSignature2);

    const vaultBalanceResponse5 = await connection.getTokenAccountBalance(aliceTokenAccountA);
    console.log(vaultBalanceResponse5.value.amount,'i');

    const vaultBalanceResponse6 = await connection.getTokenAccountBalance(bobTokenAccountA);
    console.log(vaultBalanceResponse6.value.amount,'ii');
  })

});

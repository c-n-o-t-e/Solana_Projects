import * as anchor from "@coral-xyz/anchor";
import {  PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { Crud } from "../target/types/crud";
import { expect } from "chai";

let crudProgram: Program<Crud>;
let provider: anchor.AnchorProvider;
let crudAccount: anchor.web3.Keypair;

const IDL = require("../target/idl/crud.json");
const crudAddress = new PublicKey("5UmsxDzMv1k5wGocBfLes6pGZ6iw2R5bmFqGHpJad1NX")

describe("anchor", async () => {
  before(async () => {
    provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
      
    crudProgram = new Program<Crud>(
      IDL,
      provider,
    );
    crudAccount = (provider.wallet as anchor.Wallet).payer
  })
  
  it('should create journal', async () => {
    
    await crudProgram.methods.createJournalEntry(
      "Rust", "I'm a Rust Auditor"
    )
      .accounts({
        owner: crudAccount.publicKey,
      })
      .signers([crudAccount])
      .rpc();

    const [journalEntryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("Rust"), crudAccount.publicKey.toBuffer()],
      crudAddress
    );

    const journal = await crudProgram.account.journalEntryState.fetch(journalEntryPda);
    expect(journal.message).to.equal("I'm a Rust Auditor");
  });

  it('should update journal', async () => {
    await crudProgram.methods.updateJournalEntry(
      "Rust", "I'm a Rust Senior Auditor"
    )
      .accounts({
        owner: crudAccount.publicKey,
      })
      .signers([crudAccount])
      .rpc();

    const [journalEntryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("Rust"), crudAccount.publicKey.toBuffer()],
      crudAddress
    );

    const journal = await crudProgram.account.journalEntryState.fetch(journalEntryPda);
    expect(journal.message).to.equal("I'm a Rust Senior Auditor");
  });

  it('should delete journal', async () => {
    await crudProgram.methods.deleteJournalEntry(
      "Rust"
    )
      .accounts({
        owner: crudAccount.publicKey,
      })
      .signers([crudAccount])
      .rpc();

    const [journalEntryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("Rust"), crudAccount.publicKey.toBuffer()],
      crudAddress
    );

    try {
      await crudProgram.account.journalEntryState.fetch(journalEntryPda);
      throw new Error("Journal entry was not deleted");
    } catch (error) {
      expect(error.message).to.include("Account does not exist");
    }
  }); 
})









// describe("crud", () => {
//   // Configure the client to use the local cluster.
//   anchor.setProvider(anchor.AnchorProvider.env());
//   const IDL = require("../target/idl/votingdapp.json");
//   const provider = anchor.AnchorProvider.env();

//   // const program = anchor.workspace.Crud as Program<Crud>;
//    const program = new Program<Crud>(
//       IDL,
//       provider,
//    );
  
//   const crudAddress = new PublicKey("5UmsxDzMv1k5wGocBfLes6pGZ6iw2R5bmFqGHpJad1NX")
//   const crudAccount = anchor.web3.Keypair.generate();

// let journalEntryPda: anchor.web3.PublicKey;

//   it("Is initialized!", async () => {
    
//     await provider.connection.requestAirdrop(
//       crudAccount.publicKey,
//       anchor.web3.LAMPORTS_PER_SOL * 2 // 2 SOL for test setup
//     );
//     // Add your test here.
//     // const tx = await program.methods.createJournalEntry("Rust Dev", "I'm a rust auditor").rpc();
//     // console.log("Your transaction signature", tx);

//     /*
//       it points to this [candidate_name.as_bytes(), pool_id.to_le_bytes().as_ref()]
//     */
//      [journalEntryPda] = PublicKey.findProgramAddressSync(
//       [Buffer.from("Rust Dev"), crudAccount.publicKey.toBuffer()],
//       crudAddress
//     );

//     // Create the journal entry account before fetching it
//     await program.methods.createJournalEntry("Rust Dev", "I'm a rust auditor")
//       .accounts({
//         journalEntry: journalEntryPda,
//         owner: crudAccount.publicKey,
//         systemProgram: anchor.web3.SystemProgram.programId,
//       })
//       .signers([crudAccount])
//       .rpc();

//     // const journal = await program.account.journalEntryState.fetch(journalEntryPda);
//     // console.log(journal);
//   });
// });

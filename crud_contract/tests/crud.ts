import * as anchor from "@coral-xyz/anchor";
import {  PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { Crud } from "../target/types/crud";

const IDL = require("../target/idl/crud.json");
const crudAddress = new PublicKey("5UmsxDzMv1k5wGocBfLes6pGZ6iw2R5bmFqGHpJad1NX")

describe("anchor", async () => {
  it('should initialize the poll', async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
    
  const crudProgram = new Program<Crud>(
    IDL,
    provider,
  );
    
    const crudAccount = (provider.wallet as anchor.Wallet).payer
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

    const poll = await crudProgram.account.journalEntryState.fetch(journalEntryPda);
    console.log(poll);
  })
  
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

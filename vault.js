import { PublicKey } from '@solana/web3.js';

const programId = new PublicKey("GArNcH5X1sQka24mZvrGuA3QqDhvE9CBe35ZugwNevoH");

const [vaultPda] = await PublicKey.findProgramAddress(
  [Buffer.from("vault")],
  programId
);

console.log("Vault PDA:", vaultPda.toBase58());
import { PublicKey } from "@solana/web3.js";

export function isValidSolanaAddress(address: unknown): address is string {
  if (typeof address !== "string") return false;

  try {
    const publicKey = new PublicKey(address);
    return publicKey.toBase58() === address;
  } catch {
    return false;
  }
}

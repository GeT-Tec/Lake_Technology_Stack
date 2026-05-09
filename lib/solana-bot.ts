import { Keypair } from "@solana/web3.js";

/**
 * Carrega a chave privada do bot/tesouraria a partir das variáveis de ambiente.
 * Retorna uma instância de Keypair válida da Solana.
 */
export function getBotKeypair(): Keypair {
  const privateKeyStr = process.env.WALLET_TREASURY_PRIVATE_KEY;
  
  if (!privateKeyStr) {
    throw new Error(
      "WALLET_TREASURY_PRIVATE_KEY não está configurada no arquivo de ambiente (.env.local)."
    );
  }

  try {
    // A chave privada do bot é armazenada como uma string contendo um array JSON de números
    const secretKeyArray = JSON.parse(privateKeyStr);
    
    if (!Array.isArray(secretKeyArray)) {
      throw new Error("A chave privada deve ser um array JSON de números.");
    }
    
    const secretKey = Uint8Array.from(secretKeyArray);
    return Keypair.fromSecretKey(secretKey);
  } catch (error: any) {
    throw new Error(
      `Falha ao inicializar o Keypair do Bot de Tesouraria: ${error.message}`
    );
  }
}

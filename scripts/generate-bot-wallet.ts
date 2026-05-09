import { Keypair } from "@solana/web3.js";

function generate() {
    console.log("------------------------------------------------------------------");
    console.log("🔑 GERADOR DE CARTEIRA DE TESOURARIA DO BOT (LAKEFACET / IRYS) 🔑");
    console.log("------------------------------------------------------------------");
    
    const keypair = Keypair.generate();
    const publicKeyStr = keypair.publicKey.toBase58();
    const privateKeyArrayStr = JSON.stringify(Array.from(keypair.secretKey));
    
    console.log("\n✅ CARTEIRA GERADA COM SUCESSO!");
    console.log("\n👉 CHAVE PÚBLICA (Endereço da Carteira):");
    console.log(`   ${publicKeyStr}`);
    
    console.log("\n👉 CHAVE PRIVADA (Cole este array JSON inteiro na sua variável WALLET_TREASURY_PRIVATE_KEY):");
    console.log(`   ${privateKeyArrayStr}`);
    
    console.log("\n------------------------------------------------------------------");
    console.log("⚠️  AVISO DE SEGURANÇA: NUNCA compartilhe esta chave privada em repositórios públicos!");
    console.log("------------------------------------------------------------------");
}

generate();

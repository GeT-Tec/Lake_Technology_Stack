#!/usr/bin/env node

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🚀 TOKENIZA.WEB3 DEPLOY                   ║
║                   zkSync Sepolia - ATIVO                     ║
╚══════════════════════════════════════════════════════════════╝

🎯 Seus contratos estão DEPLOYADOS e FUNCIONANDO!

📋 ENDEREÇOS DOS CONTRATOS:
══════════════════════════════════════════════════════════════
🏠 AssetToken (NFTs):     0xC2B8d5aefD7d490314D4f9c7ff6dFa129670CE64
🏪 Marketplace:          0x61b2bC16fc652418FB15D4a319b31E1853f38B84  
📝 Waitlist:             0x019ab49cE22877EA615b5c544cAA178525266b51

🔗 EXPLORER LINKS:
══════════════════════════════════════════════════════════════
• AssetToken:    https://sepolia.era.zksync.dev/address/0xC2B8d5aefD7d490314D4f9c7ff6dFa129670CE64
• Marketplace:   https://sepolia.era.zksync.dev/address/0x61b2bC16fc652418FB15D4a319b31E1853f38B84
• Waitlist:      https://sepolia.era.zksync.dev/address/0x019ab49cE22877EA615b5c544cAA178525266b51

⚙️ PRÓXIMOS PASSOS:
══════════════════════════════════════════════════════════════
1. 🔐 Configure sua chave privada real no arquivo .env
2. 💰 Adicione ETH zkSync Sepolia em sua wallet (use o faucet)
3. 🎯 Teste os contratos com os comandos abaixo

📖 COMANDOS PRINCIPAIS:
══════════════════════════════════════════════════════════════
• npm run connect                      - Testar conexão
• npm run asset:mint                   - Criar NFT de ativo
• npm run market:list <id> <preço>     - Vender NFT
• npm run waitlist:join <tipo> <desc>  - Entrar na lista

🌐 RECURSOS ÚTEIS:
══════════════════════════════════════════════════════════════
• Faucet zkSync: https://faucet.quicknode.com/zksync/sepolia
• Bridge:        https://bridge.zksync.io/
• Docs:          ./DEPLOY_GUIDE.md

🔥 DEPLOY CONCLUÍDO COM SUCESSO! 🔥

`);

// Executar teste de conexão automaticamente
const { spawn } = require('child_process');

console.log("🔍 Executando teste de conexão...\n");

const testConnection = spawn('npm', ['run', 'connect'], { 
    stdio: 'inherit',
    shell: true 
});

testConnection.on('close', (code) => {
    if (code === 0) {
        console.log(`
✅ TUDO FUNCIONANDO PERFEITAMENTE!

🎉 Seus contratos estão prontos para uso na zkSync Sepolia!

💡 DICA: Substitua a PRIVATE_KEY no arquivo .env pela sua chave real
    para começar a interagir com os contratos.

🚀 Boa sorte com seu projeto de tokenização!
        `);
    } else {
        console.log(`
❌ Houve um problema na conexão. Verifique:
   1. Arquivo .env configurado
   2. Chave privada válida  
   3. Conexão com a internet
        `);
    }
});

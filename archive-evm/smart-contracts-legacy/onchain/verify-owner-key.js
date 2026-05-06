const { ethers } = require("ethers");

// Verificar se a chave privada corresponde ao endereço
function verifyPrivateKey() {
    const privateKey = "5b161397b1a9d087665e3dde45bec7b382fc7cca66542ad587abc83848ff021c";
    const expectedAddress = "0xa3d5737c037981F02275eD1f4a1dde3b3577355c";
    
    try {
        // Adicionar 0x se não tiver
        const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
        const wallet = new ethers.Wallet(formattedKey);
        
        console.log("🔍 VERIFICAÇÃO DA CHAVE PRIVADA");
        console.log("═══════════════════════════════════════");
        console.log(`🔑 Chave privada: ${privateKey}`);
        console.log(`📱 Endereço gerado: ${wallet.address}`);
        console.log(`🎯 Endereço esperado: ${expectedAddress}`);
        console.log(`✅ Correspondência: ${wallet.address.toLowerCase() === expectedAddress.toLowerCase() ? "SIM" : "NÃO"}`);
        
        if (wallet.address.toLowerCase() === expectedAddress.toLowerCase()) {
            console.log("\n🎉 CONFIRMADO! Esta é a chave privada do OWNER dos contratos!");
            return formattedKey;
        } else {
            console.log("\n❌ A chave privada não corresponde ao endereço esperado.");
            return null;
        }
        
    } catch (error) {
        console.error("❌ Erro ao verificar chave privada:", error.message);
        return null;
    }
}

const result = verifyPrivateKey();
if (result) {
    console.log(`\n🔧 Use esta chave nos arquivos .env: ${result}`);
}

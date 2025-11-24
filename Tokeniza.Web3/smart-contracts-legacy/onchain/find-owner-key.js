const { ethers } = require("hardhat");

// Função para verificar qual chave privada corresponde a um endereço
function getWalletFromPrivateKey(privateKey) {
    try {
        const wallet = new ethers.Wallet(privateKey);
        return {
            address: wallet.address,
            privateKey: privateKey
        };
    } catch (error) {
        return null;
    }
}

// Chaves privadas comuns de desenvolvimento
const commonPrivateKeys = [
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Hardhat account #0
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // Hardhat account #1
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // Hardhat account #2
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", // Hardhat account #3
    "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a", // Hardhat account #4
    "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba", // Hardhat account #5
    "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e", // Hardhat account #6
    "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356", // Hardhat account #7
    "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97", // Hardhat account #8
    "0x2a871d0798d97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6"  // Hardhat account #9
];

async function findOwnerPrivateKey() {
    const targetAddress = "0xa3d5737c037981F02275eD1f4a1dde3b3577355c";
    
    console.log(`🔍 Procurando chave privada para o endereço: ${targetAddress}\n`);
    
    for (let i = 0; i < commonPrivateKeys.length; i++) {
        const wallet = getWalletFromPrivateKey(commonPrivateKeys[i]);
        if (wallet && wallet.address.toLowerCase() === targetAddress.toLowerCase()) {
            console.log(`✅ ENCONTRADO!`);
            console.log(`📋 Conta #${i}: ${wallet.address}`);
            console.log(`🔑 Chave privada: ${wallet.privateKey}`);
            return wallet.privateKey;
        }
        console.log(`❌ Conta #${i}: ${wallet ? wallet.address : 'Inválida'}`);
    }
    
    console.log(`\n❌ Chave privada não encontrada para ${targetAddress}`);
    return null;
}

async function main() {
    console.log("🔍 Verificando chaves privadas do Hardhat...\n");
    
    const ownerPrivateKey = await findOwnerPrivateKey();
    
    if (ownerPrivateKey) {
        console.log(`\n🔧 SOLUÇÃO: Atualize o arquivo .env com a chave correta:`);
        console.log(`PRIVATE_KEY=${ownerPrivateKey}`);
        
        // Atualizar o arquivo .env automaticamente
        const fs = require('fs');
        const path = require('path');
        
        try {
            const envPath = path.join(__dirname, '.env');
            let envContent = fs.readFileSync(envPath, 'utf8');
            
            // Substituir a chave privada
            envContent = envContent.replace(
                /PRIVATE_KEY=.*/,
                `PRIVATE_KEY=${ownerPrivateKey}`
            );
            
            fs.writeFileSync(envPath, envContent);
            console.log(`✅ Arquivo .env atualizado automaticamente!`);
            
        } catch (error) {
            console.error(`❌ Erro ao atualizar .env:`, error.message);
        }
    } else {
        console.log(`\n🤔 O contrato pode ter sido deployado com uma chave privada diferente.`);
        console.log(`💡 Opções:`);
        console.log(`   1. Fazer um novo deploy com a chave atual`);
        console.log(`   2. Transferir a propriedade para sua conta atual`);
        console.log(`   3. Usar uma chave privada diferente`);
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Erro:", error);
            process.exit(1);
        });
}

const { ethers } = require("hardhat");
const { DEPLOYED_CONTRACTS } = require("./connect-deployed-contracts");
require("dotenv").config();

async function checkContractExistence() {
    console.log("🔍 Verificando se os contratos existem na zkSync Sepolia...\n");

    const provider = new ethers.JsonRpcProvider("https://sepolia.era.zksync.dev");
    
    const contracts = [
        { name: "AssetToken", address: DEPLOYED_CONTRACTS.ASSETTOKEN },
        { name: "Marketplace", address: DEPLOYED_CONTRACTS.MARKETPLACE },
        { name: "Waitlist", address: DEPLOYED_CONTRACTS.WAITLIST }
    ];

    for (const contract of contracts) {
        try {
            const code = await provider.getCode(contract.address);
            const exists = code !== "0x";
            
            console.log(`${exists ? "✅" : "❌"} ${contract.name}:`);
            console.log(`   Endereço: ${contract.address}`);
            console.log(`   Existe: ${exists ? "Sim" : "Não"}`);
            console.log(`   Código: ${code.length > 10 ? `${code.substring(0, 10)}... (${code.length} chars)` : code}`);
            console.log("");
            
        } catch (error) {
            console.log(`❌ ${contract.name}: Erro ao verificar - ${error.message}`);
        }
    }
}

async function checkNetwork() {
    console.log("🌐 Verificando conexão com a rede...\n");
    
    try {
        const provider = new ethers.JsonRpcProvider("https://sepolia.era.zksync.dev");
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        
        console.log(`✅ Rede conectada:`);
        console.log(`   Chain ID: ${network.chainId}`);
        console.log(`   Nome: ${network.name || "zkSync Sepolia"}`);
        console.log(`   Bloco atual: ${blockNumber}`);
        console.log("");
        
    } catch (error) {
        console.error("❌ Erro de conexão:", error.message);
    }
}

async function main() {
    await checkNetwork();
    await checkContractExistence();
    
    console.log("💡 Se os contratos não existirem, isso explica os erros!");
    console.log("🔧 Possíveis soluções:");
    console.log("   1. Verificar se os endereços estão corretos");
    console.log("   2. Confirmar se foram deployados na zkSync Sepolia");
    console.log("   3. Fazer um novo deploy se necessário");
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Erro:", error);
            process.exit(1);
        });
}

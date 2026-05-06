const { ethers } = require("hardhat");
const { DEPLOYED_CONTRACTS, ASSETTOKEN_ABI } = require("./connect-deployed-contracts");
require("dotenv").config();

async function checkContractOwnership() {
    console.log("🔍 Verificando propriedade dos contratos...\n");

    const [deployer] = await ethers.getSigners();
    console.log(`📱 Conta atual: ${deployer.address}`);
    
    const assetToken = new ethers.Contract(DEPLOYED_CONTRACTS.ASSETTOKEN, [
        ...ASSETTOKEN_ABI,
        "function owner() external view returns (address)"
    ], deployer);

    try {
        const owner = await assetToken.owner();
        console.log(`👑 Owner do AssetToken: ${owner}`);
        console.log(`🔒 Você é o owner? ${owner.toLowerCase() === deployer.address.toLowerCase() ? "✅ SIM" : "❌ NÃO"}`);
        
        if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
            console.log("\n⚠️  PROBLEMA IDENTIFICADO:");
            console.log("   Você não é o proprietário do contrato AssetToken.");
            console.log("   Apenas o owner pode fazer mint de novos tokens.");
            console.log(`   Owner atual: ${owner}`);
            console.log(`   Sua conta: ${deployer.address}`);
        } else {
            console.log("\n✅ Tudo certo! Você pode fazer mint de tokens.");
        }

    } catch (error) {
        console.error("❌ Erro ao verificar ownership:", error.message);
    }
}

async function checkBalance() {
    console.log("\n💰 Verificando saldo na zkSync Sepolia...\n");
    
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    
    console.log(`💳 Saldo: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther("0.001")) {
        console.log("⚠️  Saldo baixo! Pode precisar de mais ETH para as transações.");
        console.log("🚰 Use o faucet: https://faucet.quicknode.com/zksync/sepolia");
    } else {
        console.log("✅ Saldo suficiente para transações.");
    }
}

async function main() {
    await checkBalance();
    await checkContractOwnership();
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Erro:", error);
            process.exit(1);
        });
}

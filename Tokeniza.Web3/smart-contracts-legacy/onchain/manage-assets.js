const { ethers } = require("hardhat");
const { DEPLOYED_CONTRACTS, ASSETTOKEN_ABI } = require("./connect-deployed-contracts");
require("dotenv").config();

async function mintAssetToken() {
    console.log("🎯 Fazendo mint de um novo AssetToken...\n");

    const [deployer] = await ethers.getSigners();
    const assetToken = new ethers.Contract(DEPLOYED_CONTRACTS.ASSETTOKEN, ASSETTOKEN_ABI, deployer);

    // Dados do ativo para mint (exemplo)
    const assetData = {
        to: deployer.address, // ou outro endereço
        assetType: "Imóvel Residencial",
        assetValue: ethers.parseEther("500"), // 500 ETH como valor do ativo
        assetLocation: "Rua das Flores, 123 - São Paulo, SP",
        tokenURI: "https://ipfs.io/ipfs/QmYourMetadataHash" // Substitua por um URI real
    };

    try {
        console.log("📝 Dados do Ativo:");
        console.log(`   Destinatário: ${assetData.to}`);
        console.log(`   Tipo: ${assetData.assetType}`);
        console.log(`   Valor: ${ethers.formatEther(assetData.assetValue)} ETH`);
        console.log(`   Localização: ${assetData.assetLocation}`);
        console.log(`   Token URI: ${assetData.tokenURI}\n`);

        // Estimar gas
        const gasEstimate = await assetToken.mint.estimateGas(
            assetData.to,
            assetData.assetType,
            assetData.assetValue,
            assetData.assetLocation,
            assetData.tokenURI
        );
        console.log(`⛽ Gas estimado: ${gasEstimate.toString()}`);

        // Executar mint
        console.log("🚀 Executando mint...");
        const tx = await assetToken.mint(
            assetData.to,
            assetData.assetType,
            assetData.assetValue,
            assetData.assetLocation,
            assetData.tokenURI,
            {
                gasLimit: gasEstimate + BigInt(50000) // Adicionar um buffer
            }
        );

        console.log(`📥 Transação enviada: ${tx.hash}`);
        console.log("⏳ Aguardando confirmação...");

        const receipt = await tx.wait();
        console.log(`✅ Transação confirmada no bloco: ${receipt.blockNumber}`);

        // Obter o tokenId do evento
        const event = receipt.logs.find(log => {
            try {
                const parsed = assetToken.interface.parseLog(log);
                return parsed.name === "AssetMinted";
            } catch {
                return false;
            }
        });

        if (event) {
            const parsedEvent = assetToken.interface.parseLog(event);
            const tokenId = parsedEvent.args.tokenId;
            console.log(`🎉 AssetToken criado com sucesso!`);
            console.log(`🆔 Token ID: ${tokenId.toString()}`);
            console.log(`🔗 Transação: https://sepolia.era.zksync.dev/tx/${tx.hash}`);
        }

    } catch (error) {
        console.error("❌ Erro ao fazer mint:", error.message);
        if (error.data) {
            console.error("Dados do erro:", error.data);
        }
    }
}

async function checkAssetInfo(tokenId) {
    console.log(`🔍 Verificando informações do AssetToken ID: ${tokenId}\n`);

    const [deployer] = await ethers.getSigners();
    const assetToken = new ethers.Contract(DEPLOYED_CONTRACTS.ASSETTOKEN, ASSETTOKEN_ABI, deployer);

    try {
        const assetInfo = await assetToken.assetInfo(tokenId);
        const owner = await assetToken.ownerOf(tokenId);

        console.log("📋 Informações do Ativo:");
        console.log("═══════════════════════════");
        console.log(`🆔 Token ID: ${tokenId}`);
        console.log(`👤 Proprietário: ${owner}`);
        console.log(`🏷️  Tipo: ${assetInfo.assetType}`);
        console.log(`💰 Valor: ${ethers.formatEther(assetInfo.assetValue)} ETH`);
        console.log(`📍 Localização: ${assetInfo.assetLocation}`);
        console.log(`✅ Verificado: ${assetInfo.isVerified ? "Sim" : "Não"}`);

    } catch (error) {
        console.error("❌ Erro ao verificar informações:", error.message);
    }
}

async function listAllTokens() {
    console.log("📊 Listando todos os tokens do usuário...\n");

    const [deployer] = await ethers.getSigners();
    const assetToken = new ethers.Contract(DEPLOYED_CONTRACTS.ASSETTOKEN, ASSETTOKEN_ABI, deployer);

    try {
        const balance = await assetToken.balanceOf(deployer.address);
        console.log(`🏦 Total de tokens: ${balance.toString()}\n`);

        if (balance > 0) {
            console.log("🎯 Seus tokens:");
            console.log("═══════════════");
            
            // Note: Este é um exemplo básico. Para uma implementação completa,
            // você precisaria de eventos ou um método auxiliar no contrato
            for (let i = 0; i < Math.min(balance, 10); i++) {
                try {
                    const tokenId = i; // Assumindo IDs sequenciais
                    const owner = await assetToken.ownerOf(tokenId);
                    if (owner.toLowerCase() === deployer.address.toLowerCase()) {
                        const assetInfo = await assetToken.assetInfo(tokenId);
                        console.log(`🆔 ${tokenId}: ${assetInfo.assetType} (${ethers.formatEther(assetInfo.assetValue)} ETH)`);
                    }
                } catch (error) {
                    // Token não existe ou não é seu
                    continue;
                }
            }
        }

    } catch (error) {
        console.error("❌ Erro ao listar tokens:", error.message);
    }
}

// Menu interativo
async function main() {
    console.log("🏠 AssetToken Manager - zkSync Sepolia");
    console.log("═══════════════════════════════════════\n");

    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log("📖 Comandos disponíveis:");
        console.log("  npm run asset:mint           - Criar um novo AssetToken");
        console.log("  npm run asset:info <tokenId> - Ver informações de um token");
        console.log("  npm run asset:list           - Listar seus tokens");
        console.log("\nOu use: node manage-assets.js <comando> [parâmetros]");
        return;
    }

    const command = args[0];

    switch (command) {
        case "mint":
            await mintAssetToken();
            break;
        case "info":
            const tokenId = args[1];
            if (!tokenId) {
                console.error("❌ Por favor, forneça o Token ID");
                return;
            }
            await checkAssetInfo(tokenId);
            break;
        case "list":
            await listAllTokens();
            break;
        default:
            console.error("❌ Comando não reconhecido:", command);
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

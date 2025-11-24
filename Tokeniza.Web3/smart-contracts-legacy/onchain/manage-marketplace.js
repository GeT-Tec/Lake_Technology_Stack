const { ethers } = require("hardhat");
const { DEPLOYED_CONTRACTS, MARKETPLACE_ABI, ASSETTOKEN_ABI } = require("./connect-deployed-contracts");
require("dotenv").config();

async function listAssetForSale(tokenId, priceInEth) {
    console.log(`🏪 Listando AssetToken ${tokenId} por ${priceInEth} ETH...\n`);

    const [deployer] = await ethers.getSigners();
    const marketplace = new ethers.Contract(DEPLOYED_CONTRACTS.MARKETPLACE, MARKETPLACE_ABI, deployer);
    const assetToken = new ethers.Contract(DEPLOYED_CONTRACTS.ASSETTOKEN, ASSETTOKEN_ABI, deployer);

    try {
        // Verificar se é o dono do token
        const owner = await assetToken.ownerOf(tokenId);
        if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
            console.error("❌ Você não é o proprietário deste token");
            return;
        }

        // Verificar aprovação
        const approved = await assetToken.getApproved(tokenId);
        if (approved.toLowerCase() !== DEPLOYED_CONTRACTS.MARKETPLACE.toLowerCase()) {
            console.log("🔐 Aprovando marketplace para transferir o token...");
            const approveTx = await assetToken.approve(DEPLOYED_CONTRACTS.MARKETPLACE, tokenId);
            await approveTx.wait();
            console.log("✅ Aprovação concedida");
        }

        const price = ethers.parseEther(priceInEth.toString());

        // Estimar gas
        const gasEstimate = await marketplace.listAsset.estimateGas(
            DEPLOYED_CONTRACTS.ASSETTOKEN,
            tokenId,
            price
        );

        // Listar no marketplace
        console.log("🚀 Listando no marketplace...");
        const tx = await marketplace.listAsset(
            DEPLOYED_CONTRACTS.ASSETTOKEN,
            tokenId,
            price,
            {
                gasLimit: gasEstimate + BigInt(20000)
            }
        );

        console.log(`📥 Transação enviada: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Token listado com sucesso!`);
        console.log(`🔗 Transação: https://sepolia.era.zksync.dev/tx/${tx.hash}`);

    } catch (error) {
        console.error("❌ Erro ao listar token:", error.message);
    }
}

async function buyAsset(tokenId) {
    console.log(`🛒 Comprando AssetToken ${tokenId}...\n`);

    const [deployer] = await ethers.getSigners();
    const marketplace = new ethers.Contract(DEPLOYED_CONTRACTS.MARKETPLACE, MARKETPLACE_ABI, deployer);

    try {
        // Verificar listing
        const listing = await marketplace.listings(DEPLOYED_CONTRACTS.ASSETTOKEN, tokenId);
        
        if (!listing.active) {
            console.error("❌ Este token não está à venda");
            return;
        }

        console.log(`💰 Preço: ${ethers.formatEther(listing.price)} ETH`);
        console.log(`👤 Vendedor: ${listing.seller}`);

        // Verificar saldo
        const balance = await ethers.provider.getBalance(deployer.address);
        if (balance < listing.price) {
            console.error("❌ Saldo insuficiente");
            return;
        }

        // Comprar
        console.log("🚀 Executando compra...");
        const tx = await marketplace.buyAsset(
            DEPLOYED_CONTRACTS.ASSETTOKEN,
            tokenId,
            {
                value: listing.price
            }
        );

        console.log(`📥 Transação enviada: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Compra realizada com sucesso!`);
        console.log(`🔗 Transação: https://sepolia.era.zksync.dev/tx/${tx.hash}`);

    } catch (error) {
        console.error("❌ Erro ao comprar token:", error.message);
    }
}

async function cancelListing(tokenId) {
    console.log(`❌ Cancelando listagem do AssetToken ${tokenId}...\n`);

    const [deployer] = await ethers.getSigners();
    const marketplace = new ethers.Contract(DEPLOYED_CONTRACTS.MARKETPLACE, MARKETPLACE_ABI, deployer);

    try {
        const listing = await marketplace.listings(DEPLOYED_CONTRACTS.ASSETTOKEN, tokenId);
        
        if (!listing.active) {
            console.error("❌ Este token não está listado");
            return;
        }

        if (listing.seller.toLowerCase() !== deployer.address.toLowerCase()) {
            console.error("❌ Apenas o vendedor pode cancelar a listagem");
            return;
        }

        console.log("🚀 Cancelando listagem...");
        const tx = await marketplace.cancelListing(DEPLOYED_CONTRACTS.ASSETTOKEN, tokenId);

        console.log(`📥 Transação enviada: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Listagem cancelada com sucesso!`);
        console.log(`🔗 Transação: https://sepolia.era.zksync.dev/tx/${tx.hash}`);

    } catch (error) {
        console.error("❌ Erro ao cancelar listagem:", error.message);
    }
}

async function viewListing(tokenId) {
    console.log(`🔍 Verificando listagem do AssetToken ${tokenId}...\n`);

    const [deployer] = await ethers.getSigners();
    const marketplace = new ethers.Contract(DEPLOYED_CONTRACTS.MARKETPLACE, MARKETPLACE_ABI, deployer);
    const assetToken = new ethers.Contract(DEPLOYED_CONTRACTS.ASSETTOKEN, ASSETTOKEN_ABI, deployer);

    try {
        const listing = await marketplace.listings(DEPLOYED_CONTRACTS.ASSETTOKEN, tokenId);
        const assetInfo = await assetToken.assetInfo(tokenId);

        console.log("📋 Informações da Listagem:");
        console.log("════════════════════════════");
        console.log(`🆔 Token ID: ${tokenId}`);
        console.log(`🏷️  Tipo: ${assetInfo.assetType}`);
        console.log(`💰 Preço: ${listing.active ? ethers.formatEther(listing.price) + " ETH" : "Não listado"}`);
        console.log(`👤 Vendedor: ${listing.seller}`);
        console.log(`🔄 Status: ${listing.active ? "À venda" : "Não disponível"}`);
        console.log(`📍 Localização: ${assetInfo.assetLocation}`);

    } catch (error) {
        console.error("❌ Erro ao verificar listagem:", error.message);
    }
}

async function getMarketplaceStats() {
    console.log("📊 Estatísticas do Marketplace...\n");

    const [deployer] = await ethers.getSigners();
    const marketplace = new ethers.Contract(DEPLOYED_CONTRACTS.MARKETPLACE, MARKETPLACE_ABI, deployer);

    try {
        const fee = await marketplace.marketplaceFee();
        console.log("🏪 Informações do Marketplace:");
        console.log("══════════════════════════════");
        console.log(`💳 Taxa: ${fee / 100}%`);
        console.log(`📍 Endereço: ${DEPLOYED_CONTRACTS.MARKETPLACE}`);
        console.log(`🔗 zkSync Explorer: https://sepolia.era.zksync.dev/address/${DEPLOYED_CONTRACTS.MARKETPLACE}`);

    } catch (error) {
        console.error("❌ Erro ao obter estatísticas:", error.message);
    }
}

async function main() {
    console.log("🏪 Marketplace Manager - zkSync Sepolia");
    console.log("════════════════════════════════════════\n");

    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log("📖 Comandos disponíveis:");
        console.log("  npm run market:list <tokenId> <preço>  - Listar token à venda");
        console.log("  npm run market:buy <tokenId>           - Comprar token");
        console.log("  npm run market:cancel <tokenId>        - Cancelar listagem");
        console.log("  npm run market:view <tokenId>          - Ver detalhes da listagem");
        console.log("  npm run market:stats                   - Ver estatísticas");
        console.log("\nOu use: node manage-marketplace.js <comando> [parâmetros]");
        return;
    }

    const command = args[0];

    switch (command) {
        case "list":
            const tokenId = args[1];
            const price = args[2];
            if (!tokenId || !price) {
                console.error("❌ Use: list <tokenId> <preçoEmETH>");
                return;
            }
            await listAssetForSale(tokenId, price);
            break;
        
        case "buy":
            const buyTokenId = args[1];
            if (!buyTokenId) {
                console.error("❌ Use: buy <tokenId>");
                return;
            }
            await buyAsset(buyTokenId);
            break;
        
        case "cancel":
            const cancelTokenId = args[1];
            if (!cancelTokenId) {
                console.error("❌ Use: cancel <tokenId>");
                return;
            }
            await cancelListing(cancelTokenId);
            break;
        
        case "view":
            const viewTokenId = args[1];
            if (!viewTokenId) {
                console.error("❌ Use: view <tokenId>");
                return;
            }
            await viewListing(viewTokenId);
            break;
        
        case "stats":
            await getMarketplaceStats();
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

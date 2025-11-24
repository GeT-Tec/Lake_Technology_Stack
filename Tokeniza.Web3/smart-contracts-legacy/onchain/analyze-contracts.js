const { ethers } = require("hardhat");
const { DEPLOYED_CONTRACTS, ASSETTOKEN_ABI, MARKETPLACE_ABI, WAITLIST_ABI } = require("./connect-deployed-contracts");
require("dotenv").config();

async function demonstrateReadOnlyFunctions() {
    console.log("🔍 Demonstrando funcionalidades READ-ONLY dos contratos...\n");

    const [deployer] = await ethers.getSigners();
    
    // Conectar aos contratos
    const assetToken = new ethers.Contract(DEPLOYED_CONTRACTS.ASSETTOKEN, [
        ...ASSETTOKEN_ABI,
        "function owner() external view returns (address)",
        "function totalSupply() external view returns (uint256)",
        "function tokenURI(uint256 tokenId) external view returns (string)"
    ], deployer);
    
    const marketplace = new ethers.Contract(DEPLOYED_CONTRACTS.MARKETPLACE, MARKETPLACE_ABI, deployer);
    const waitlist = new ethers.Contract(DEPLOYED_CONTRACTS.WAITLIST, WAITLIST_ABI, deployer);

    console.log("═══════════════════════════════════════");
    console.log("📋 INFORMAÇÕES DOS CONTRATOS");
    console.log("═══════════════════════════════════════");

    try {
        // AssetToken info
        const name = await assetToken.name();
        const symbol = await assetToken.symbol();
        const totalSupply = await assetToken.totalSupply();
        const owner = await assetToken.owner();
        
        console.log(`🏠 AssetToken:`);
        console.log(`   Nome: ${name} (${symbol})`);
        console.log(`   Total Supply: ${totalSupply.toString()}`);
        console.log(`   Owner: ${owner}`);
        console.log(`   Endereço: ${DEPLOYED_CONTRACTS.ASSETTOKEN}`);

        // Marketplace info
        const marketplaceFee = await marketplace.marketplaceFee();
        console.log(`\n🏪 Marketplace:`);
        console.log(`   Taxa: ${Number(marketplaceFee) / 100}%`);
        console.log(`   Endereço: ${DEPLOYED_CONTRACTS.MARKETPLACE}`);

        // Waitlist info
        console.log(`\n📝 Waitlist:`);
        console.log(`   Endereço: ${DEPLOYED_CONTRACTS.WAITLIST}`);

        console.log("\n═══════════════════════════════════════");
        console.log("🔍 VERIFICANDO TOKENS EXISTENTES");
        console.log("═══════════════════════════════════════");

        // Tentar encontrar tokens existentes
        if (totalSupply > 0) {
            console.log(`\n✅ Encontrados ${totalSupply.toString()} tokens!`);
            
            for (let i = 0; i < Math.min(Number(totalSupply), 5); i++) {
                try {
                    const tokenOwner = await assetToken.ownerOf(i);
                    const assetInfo = await assetToken.assetInfo(i);
                    
                    console.log(`\n🎯 Token ID ${i}:`);
                    console.log(`   Proprietário: ${tokenOwner}`);
                    console.log(`   Tipo: ${assetInfo.assetType}`);
                    console.log(`   Valor: ${ethers.formatEther(assetInfo.assetValue)} ETH`);
                    console.log(`   Localização: ${assetInfo.assetLocation}`);
                    console.log(`   Verificado: ${assetInfo.isVerified ? "Sim" : "Não"}`);
                    
                    // Verificar se está no marketplace
                    const listing = await marketplace.listings(DEPLOYED_CONTRACTS.ASSETTOKEN, i);
                    if (listing.active) {
                        console.log(`   🏪 À venda por: ${ethers.formatEther(listing.price)} ETH`);
                    }
                    
                } catch (error) {
                    console.log(`   ❌ Token ID ${i}: Não existe ou erro ao acessar`);
                }
            }
        } else {
            console.log("ℹ️  Nenhum token foi criado ainda.");
        }

        console.log("\n═══════════════════════════════════════");
        console.log("👥 VERIFICANDO WAITLIST");
        console.log("═══════════════════════════════════════");

        // Verificar se a conta atual está na waitlist
        const myWaitlistEntry = await waitlist.waitlist(deployer.address);
        if (myWaitlistEntry.timestamp > 0) {
            const date = new Date(Number(myWaitlistEntry.timestamp) * 1000);
            console.log(`✅ Você está na waitlist!`);
            console.log(`   Tipo: ${myWaitlistEntry.assetType}`);
            console.log(`   Detalhes: ${myWaitlistEntry.assetDetails}`);
            console.log(`   Data: ${date.toLocaleString()}`);
            console.log(`   Status: ${myWaitlistEntry.approved ? "Aprovado" : "Pendente"}`);
        } else {
            console.log(`ℹ️  Você não está na waitlist ainda.`);
        }

    } catch (error) {
        console.error("❌ Erro ao acessar informações:", error.message);
    }
}

async function suggestNextSteps() {
    console.log("\n═══════════════════════════════════════");
    console.log("🚀 PRÓXIMOS PASSOS POSSÍVEIS");
    console.log("═══════════════════════════════════════");

    console.log(`
📝 1. ENTRAR NA WAITLIST (qualquer um pode fazer):
   npm run waitlist:join "Imóvel" "Descrição do seu ativo"

🔍 2. VERIFICAR STATUS NA WAITLIST:
   npm run waitlist:status

👁️  3. VER DETALHES DE TOKENS EXISTENTES:
   npm run asset:info <tokenId>

🏪 4. VER LISTAGENS NO MARKETPLACE:
   npm run market:view <tokenId>

💰 5. COMPRAR TOKENS À VENDA (se houver):
   npm run market:buy <tokenId>

🔧 6. PARA MINT (apenas para o owner ${await getOwnerAddress()}):
   - O owner precisa usar sua chave privada
   - Ou transferir propriedade para outra conta

💡 DICA: Mesmo sem ser o owner, você pode:
   - Entrar na waitlist
   - Comprar tokens existentes
   - Ver todas as informações públicas
    `);
}

async function getOwnerAddress() {
    try {
        const [deployer] = await ethers.getSigners();
        const assetToken = new ethers.Contract(DEPLOYED_CONTRACTS.ASSETTOKEN, [
            "function owner() external view returns (address)"
        ], deployer);
        return await assetToken.owner();
    } catch {
        return "Owner não identificado";
    }
}

async function main() {
    console.log("🔍 ANÁLISE COMPLETA DOS CONTRATOS DEPLOYADOS");
    console.log("zkSync Sepolia - Read-Only Access\n");

    await demonstrateReadOnlyFunctions();
    await suggestNextSteps();
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Erro:", error);
            process.exit(1);
        });
}

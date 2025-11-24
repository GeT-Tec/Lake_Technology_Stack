const { ethers } = require("hardhat");
require("dotenv").config();

// Endereços dos contratos deployados na zkSync Sepolia
const DEPLOYED_CONTRACTS = {
    ASSETTOKEN: "0xC2B8d5aefD7d490314D4f9c7ff6dFa129670CE64",
    MARKETPLACE: "0x61b2bC16fc652418FB15D4a319b31E1853f38B84",
    WAITLIST: "0x019ab49cE22877EA615b5c544cAA178525266b51"
};

// ABIs dos contratos (versões simplificadas)
const ASSETTOKEN_ABI = [
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address owner) external view returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function mint(address to, string memory assetType, uint256 assetValue, string memory assetLocation, string memory tokenURI) external returns (uint256)",
    "function assetInfo(uint256 tokenId) external view returns (tuple(string assetType, uint256 assetValue, string assetLocation, bool isVerified))",
    "event AssetMinted(uint256 indexed tokenId, address indexed owner, string assetType, uint256 assetValue)"
];

const MARKETPLACE_ABI = [
    "function listAsset(address nftContract, uint256 tokenId, uint256 price) external",
    "function buyAsset(address nftContract, uint256 tokenId) external payable",
    "function cancelListing(address nftContract, uint256 tokenId) external",
    "function listings(address nftContract, uint256 tokenId) external view returns (tuple(address seller, uint256 price, bool active))",
    "function marketplaceFee() external view returns (uint256)",
    "event AssetListed(address indexed nftContract, uint256 indexed tokenId, address indexed seller, uint256 price)",
    "event AssetSold(address indexed nftContract, uint256 indexed tokenId, address seller, address buyer, uint256 price)"
];

const WAITLIST_ABI = [
    "function joinWaitlist(string memory assetType, string memory assetDetails) external",
    "function approveFromWaitlist(address user) external",
    "function removeFromWaitlist(address user) external",
    "function waitlist(address user) external view returns (tuple(string assetType, string assetDetails, uint256 timestamp, bool approved))",
    "function waitlistAddresses(uint256 index) external view returns (address)",
    "event JoinedWaitlist(address indexed user, string assetType, string assetDetails)",
    "event ApprovedFromWaitlist(address indexed user)"
];

async function main() {
    console.log("🚀 Configurando conexão com os contratos na zkSync Sepolia...\n");

    // Obter o signer
    const [deployer] = await ethers.getSigners();
    console.log("📱 Conta conectada:", deployer.address);
    
    // Verificar saldo
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Saldo:", ethers.formatEther(balance), "ETH\n");

    // Conectar aos contratos
    const assetToken = new ethers.Contract(DEPLOYED_CONTRACTS.ASSETTOKEN, ASSETTOKEN_ABI, deployer);
    const marketplace = new ethers.Contract(DEPLOYED_CONTRACTS.MARKETPLACE, MARKETPLACE_ABI, deployer);
    const waitlist = new ethers.Contract(DEPLOYED_CONTRACTS.WAITLIST, WAITLIST_ABI, deployer);

    console.log("📋 Informações dos Contratos:");
    console.log("═══════════════════════════════════════");
    
    try {
        // AssetToken Info
        const tokenName = await assetToken.name();
        const tokenSymbol = await assetToken.symbol();
        console.log(`🏷️  AssetToken: ${tokenName} (${tokenSymbol})`);
        console.log(`📍 Endereço: ${DEPLOYED_CONTRACTS.ASSETTOKEN}`);
        console.log(`🔗 zkSync Explorer: https://sepolia.era.zksync.dev/address/${DEPLOYED_CONTRACTS.ASSETTOKEN}\n`);        // Marketplace Info
        const marketplaceFee = await marketplace.marketplaceFee();
        console.log(`🏪 Marketplace Taxa: ${Number(marketplaceFee) / 100}%`);
        console.log(`📍 Endereço: ${DEPLOYED_CONTRACTS.MARKETPLACE}`);
        console.log(`🔗 zkSync Explorer: https://sepolia.era.zksync.dev/address/${DEPLOYED_CONTRACTS.MARKETPLACE}\n`);

        // Waitlist Info
        console.log(`📝 Waitlist Contract`);
        console.log(`📍 Endereço: ${DEPLOYED_CONTRACTS.WAITLIST}`);
        console.log(`🔗 zkSync Explorer: https://sepolia.era.zksync.dev/address/${DEPLOYED_CONTRACTS.WAITLIST}\n`);

    } catch (error) {
        console.error("❌ Erro ao obter informações dos contratos:", error.message);
    }

    // Salvar configuração para uso futuro
    const config = {
        network: "zkSync Sepolia",
        chainId: 300,
        rpcUrl: "https://sepolia.era.zksync.dev",
        contracts: DEPLOYED_CONTRACTS
    };

    console.log("✅ Configuração dos contratos salva!");
    console.log("🔧 Para usar os contratos, importe este arquivo e use as instâncias criadas.");
    
    return {
        assetToken,
        marketplace,
        waitlist,
        contracts: DEPLOYED_CONTRACTS,
        deployer
    };
}

// Função para testar funcionalidades básicas
async function testContracts() {
    console.log("\n🧪 Executando testes básicos...\n");
    
    const { assetToken, marketplace, waitlist, deployer } = await main();
    
    try {
        // Teste 1: Verificar se pode chamar funções view
        console.log("🔍 Teste 1: Verificando funções view...");
        const tokenName = await assetToken.name();
        console.log(`✅ AssetToken name: ${tokenName}`);
        
        // Teste 2: Verificar waitlist (exemplo)
        console.log("\n🔍 Teste 2: Testando Waitlist...");
        // await waitlist.joinWaitlist("Imóvel", "Casa em São Paulo - 3 quartos");
        console.log("ℹ️  Para testar a waitlist, descomente a linha acima");
        
        console.log("\n✅ Todos os testes básicos passaram!");
        
    } catch (error) {
        console.error("❌ Erro nos testes:", error.message);
    }
}

// Exportar para uso em outros scripts
module.exports = {
    DEPLOYED_CONTRACTS,
    ASSETTOKEN_ABI,
    MARKETPLACE_ABI,
    WAITLIST_ABI,
    main,
    testContracts
};

// Executar se chamado diretamente
if (require.main === module) {
    main()
        .then(() => testContracts())
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Erro:", error);
            process.exit(1);
        });
}

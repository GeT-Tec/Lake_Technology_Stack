const { ethers } = require("hardhat");
const { DEPLOYED_CONTRACTS, WAITLIST_ABI } = require("./connect-deployed-contracts");
require("dotenv").config();

async function joinWaitlist(assetType, assetDetails) {
    console.log(`📝 Entrando na lista de espera...\n`);

    const [deployer] = await ethers.getSigners();
    const waitlist = new ethers.Contract(DEPLOYED_CONTRACTS.WAITLIST, WAITLIST_ABI, deployer);

    try {
        // Verificar se já está na lista
        const existingEntry = await waitlist.waitlist(deployer.address);
        if (existingEntry.timestamp > 0) {
            console.log("ℹ️  Você já está na lista de espera!");
            console.log(`   Tipo de ativo: ${existingEntry.assetType}`);
            console.log(`   Status: ${existingEntry.approved ? "Aprovado" : "Aguardando aprovação"}`);
            return;
        }

        console.log("📋 Dados da solicitação:");
        console.log(`   Tipo de ativo: ${assetType}`);
        console.log(`   Detalhes: ${assetDetails}`);

        // Entrar na lista
        console.log("🚀 Enviando solicitação...");
        const tx = await waitlist.joinWaitlist(assetType, assetDetails);

        console.log(`📥 Transação enviada: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Você foi adicionado à lista de espera!`);
        console.log(`🔗 Transação: https://sepolia.era.zksync.dev/tx/${tx.hash}`);

    } catch (error) {
        console.error("❌ Erro ao entrar na lista:", error.message);
    }
}

async function checkWaitlistStatus(address) {
    console.log(`🔍 Verificando status na lista de espera...\n`);

    const [deployer] = await ethers.getSigners();
    const waitlist = new ethers.Contract(DEPLOYED_CONTRACTS.WAITLIST, WAITLIST_ABI, deployer);

    const targetAddress = address || deployer.address;

    try {
        const entry = await waitlist.waitlist(targetAddress);

        if (entry.timestamp === 0) {
            console.log("ℹ️  Este endereço não está na lista de espera");
            return;
        }

        const date = new Date(Number(entry.timestamp) * 1000);

        console.log("📋 Status na Lista de Espera:");
        console.log("═══════════════════════════════");
        console.log(`👤 Endereço: ${targetAddress}`);
        console.log(`🏷️  Tipo de ativo: ${entry.assetType}`);
        console.log(`📝 Detalhes: ${entry.assetDetails}`);
        console.log(`📅 Data de entrada: ${date.toLocaleString()}`);
        console.log(`✅ Status: ${entry.approved ? "✅ APROVADO" : "⏳ AGUARDANDO APROVAÇÃO"}`);

    } catch (error) {
        console.error("❌ Erro ao verificar status:", error.message);
    }
}

async function approveUser(userAddress) {
    console.log(`✅ Aprovando usuário: ${userAddress}...\n`);

    const [deployer] = await ethers.getSigners();
    const waitlist = new ethers.Contract(DEPLOYED_CONTRACTS.WAITLIST, WAITLIST_ABI, deployer);

    try {
        // Verificar se o usuário está na lista
        const entry = await waitlist.waitlist(userAddress);
        if (entry.timestamp === 0) {
            console.error("❌ Este usuário não está na lista de espera");
            return;
        }

        if (entry.approved) {
            console.log("ℹ️  Este usuário já foi aprovado");
            return;
        }

        console.log("🚀 Aprovando usuário...");
        const tx = await waitlist.approveFromWaitlist(userAddress);

        console.log(`📥 Transação enviada: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Usuário aprovado com sucesso!`);
        console.log(`🔗 Transação: https://sepolia.era.zksync.dev/tx/${tx.hash}`);

    } catch (error) {
        console.error("❌ Erro ao aprovar usuário:", error.message);
        if (error.message.includes("Ownable")) {
            console.error("💡 Dica: Apenas o proprietário do contrato pode aprovar usuários");
        }
    }
}

async function removeUser(userAddress) {
    console.log(`❌ Removendo usuário: ${userAddress}...\n`);

    const [deployer] = await ethers.getSigners();
    const waitlist = new ethers.Contract(DEPLOYED_CONTRACTS.WAITLIST, WAITLIST_ABI, deployer);

    try {
        // Verificar se o usuário está na lista
        const entry = await waitlist.waitlist(userAddress);
        if (entry.timestamp === 0) {
            console.error("❌ Este usuário não está na lista de espera");
            return;
        }

        console.log("🚀 Removendo usuário...");
        const tx = await waitlist.removeFromWaitlist(userAddress);

        console.log(`📥 Transação enviada: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Usuário removido com sucesso!`);
        console.log(`🔗 Transação: https://sepolia.era.zksync.dev/tx/${tx.hash}`);

    } catch (error) {
        console.error("❌ Erro ao remover usuário:", error.message);
        if (error.message.includes("Ownable")) {
            console.error("💡 Dica: Apenas o proprietário do contrato pode remover usuários");
        }
    }
}

async function listWaitlistUsers() {
    console.log("📊 Listando usuários na lista de espera...\n");

    const [deployer] = await ethers.getSigners();
    const waitlist = new ethers.Contract(DEPLOYED_CONTRACTS.WAITLIST, WAITLIST_ABI, deployer);

    try {
        console.log("👥 Usuários na Lista de Espera:");
        console.log("════════════════════════════════");

        let index = 0;
        let hasUsers = false;

        // Tentar obter usuários (limitado a 20 para evitar loops infinitos)
        for (let i = 0; i < 20; i++) {
            try {
                const userAddress = await waitlist.waitlistAddresses(i);
                const entry = await waitlist.waitlist(userAddress);
                
                if (entry.timestamp > 0) {
                    hasUsers = true;
                    const date = new Date(Number(entry.timestamp) * 1000);
                    const status = entry.approved ? "✅ Aprovado" : "⏳ Pendente";
                    
                    console.log(`${i + 1}. ${userAddress}`);
                    console.log(`   📝 ${entry.assetType}: ${entry.assetDetails}`);
                    console.log(`   📅 ${date.toLocaleDateString()} - ${status}\n`);
                }
            } catch (error) {
                // Fim da lista ou erro
                break;
            }
        }

        if (!hasUsers) {
            console.log("ℹ️  Nenhum usuário encontrado na lista de espera");
        }

    } catch (error) {
        console.error("❌ Erro ao listar usuários:", error.message);
    }
}

async function getWaitlistStats() {
    console.log("📊 Estatísticas da Lista de Espera...\n");

    const [deployer] = await ethers.getSigners();
    const waitlist = new ethers.Contract(DEPLOYED_CONTRACTS.WAITLIST, WAITLIST_ABI, deployer);

    try {
        console.log("📝 Informações da Waitlist:");
        console.log("═══════════════════════════");
        console.log(`📍 Endereço: ${DEPLOYED_CONTRACTS.WAITLIST}`);
        console.log(`🔗 zkSync Explorer: https://sepolia.era.zksync.dev/address/${DEPLOYED_CONTRACTS.WAITLIST}`);
        
        // Contar usuários (básico)
        let totalUsers = 0;
        let approvedUsers = 0;

        for (let i = 0; i < 50; i++) {
            try {
                const userAddress = await waitlist.waitlistAddresses(i);
                const entry = await waitlist.waitlist(userAddress);
                
                if (entry.timestamp > 0) {
                    totalUsers++;
                    if (entry.approved) {
                        approvedUsers++;
                    }
                }
            } catch (error) {
                break;
            }
        }

        console.log(`👥 Total de usuários: ${totalUsers}`);
        console.log(`✅ Usuários aprovados: ${approvedUsers}`);
        console.log(`⏳ Aguardando aprovação: ${totalUsers - approvedUsers}`);

    } catch (error) {
        console.error("❌ Erro ao obter estatísticas:", error.message);
    }
}

async function main() {
    console.log("📝 Waitlist Manager - zkSync Sepolia");
    console.log("═════════════════════════════════════\n");

    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log("📖 Comandos disponíveis:");
        console.log("  npm run waitlist:join <tipo> <detalhes>  - Entrar na lista");
        console.log("  npm run waitlist:status [endereço]      - Ver seu status");
        console.log("  npm run waitlist:approve <endereço>     - Aprovar usuário (owner)");
        console.log("  npm run waitlist:remove <endereço>      - Remover usuário (owner)");
        console.log("  npm run waitlist:list                   - Listar todos os usuários");
        console.log("  npm run waitlist:stats                  - Ver estatísticas");
        console.log("\nOu use: node manage-waitlist.js <comando> [parâmetros]");
        return;
    }

    const command = args[0];

    switch (command) {
        case "join":
            const assetType = args[1];
            const assetDetails = args.slice(2).join(" ");
            if (!assetType || !assetDetails) {
                console.error("❌ Use: join <tipo> <detalhes>");
                console.error("Exemplo: join 'Imóvel' 'Casa 3 quartos em São Paulo'");
                return;
            }
            await joinWaitlist(assetType, assetDetails);
            break;
        
        case "status":
            const address = args[1];
            await checkWaitlistStatus(address);
            break;
        
        case "approve":
            const approveAddress = args[1];
            if (!approveAddress) {
                console.error("❌ Use: approve <endereço>");
                return;
            }
            await approveUser(approveAddress);
            break;
        
        case "remove":
            const removeAddress = args[1];
            if (!removeAddress) {
                console.error("❌ Use: remove <endereço>");
                return;
            }
            await removeUser(removeAddress);
            break;
        
        case "list":
            await listWaitlistUsers();
            break;
        
        case "stats":
            await getWaitlistStats();
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

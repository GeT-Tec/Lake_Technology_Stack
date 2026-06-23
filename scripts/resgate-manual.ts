import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// Carregar variáveis do .env.local manualmente para evitar dependências de pacotes não instalados
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      if (line.trim().startsWith("#") || !line.includes("=")) continue;
      const delimiterIndex = line.indexOf("=");
      const key = line.substring(0, delimiterIndex).trim();
      let val = line.substring(delimiterIndex + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

loadEnv();

const prisma = new PrismaClient();

async function main() {
  const walletAddress = process.env.WALLET_ADDRESS;
  const amountStr = process.env.AMOUNT;
  const txHash = process.env.TX_HASH;

  if (!walletAddress || !amountStr || !txHash) {
    console.error("❌ Erro: Variáveis de ambiente obrigatórias não definidas.");
    console.error("Uso: WALLET_ADDRESS=<address> AMOUNT=<credits> TX_HASH=<hash> npx ts-node scripts/resgate-manual.ts");
    process.exit(1);
  }

  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) {
    console.error("❌ Erro: AMOUNT deve ser um número inteiro positivo.");
    process.exit(1);
  }

  console.log(`\n🚀 Iniciando resgate manual de créditos...`);
  console.log(`   Wallet: ${walletAddress}`);
  console.log(`   Créditos: ${amount}`);
  console.log(`   TxHash: ${txHash}`);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verificar idempotência pelo txHash
      const existingLog = await tx.auditLog.findFirst({
        where: {
          details: {
            contains: txHash,
          },
        },
      });

      if (existingLog) {
        const user = await tx.user.findUnique({
          where: { walletAddress },
          select: { credits: true },
        });
        console.log(`⚠️ Alerta: A transação ${txHash} já foi processada anteriormente.`);
        return {
          credits: user?.credits ?? 0,
          alreadyProcessed: true,
        };
      }

      // 2. Buscar saldo anterior
      const previousUser = await tx.user.findUnique({
        where: { walletAddress },
        select: { credits: true },
      });
      const previousBalance = previousUser?.credits || 0;

      // 3. Upsert do usuário: cria se não existir, incrementa créditos se existir
      const updatedUser = await tx.user.upsert({
        where: { walletAddress },
        update: {
          credits: {
            increment: amount,
          },
        },
        create: {
          walletAddress,
          credits: amount,
        },
      });

      // 4. Registrar no audit log
      await tx.auditLog.create({
        data: {
          actorWallet: walletAddress,
          actionType: "BUY_CREDITS_MANUAL",
          targetId: "CREDIT_BUY_MANUAL",
          details: JSON.stringify({
            planId: "manual_rescue",
            credits: amount,
            txHash: txHash,
            previousBalance,
            newBalance: updatedUser.credits,
            timestamp: new Date().toISOString(),
          }),
        },
      });

      return {
        credits: updatedUser.credits,
        alreadyProcessed: false,
      };
    });

    if (result.alreadyProcessed) {
      console.log(`✅ Operação ignorada para evitar duplicação. Saldo mantido em: ${result.credits} créditos.`);
    } else {
      console.log(`🎉 Sucesso! Créditos creditados.`);
      console.log(`   Novo saldo: ${result.credits} créditos.`);
    }
  } catch (error: any) {
    console.error("❌ Falha crítica ao resgatar créditos:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

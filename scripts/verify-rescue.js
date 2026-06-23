const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

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
  try {
    console.log(`🔎 Buscando todos os usuários no banco contendo 3JGhGa...`);
    const users = await prisma.user.findMany({
      where: {
        walletAddress: {
          startsWith: "3JGhGa"
        }
      }
    });
    console.log(`Usuários encontrados:`, JSON.stringify(users, null, 2));

    console.log(`🔎 Buscando todos os logs no audit_logs contendo 3JGhGa...`);
    const logs = await prisma.auditLog.findMany({
      where: {
        actorWallet: {
          startsWith: "3JGhGa"
        }
      }
    });
    console.log(`Logs encontrados:`, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error("Erro na verificação:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

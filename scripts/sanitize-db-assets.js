/**
 * scripts/sanitize-db-assets.js
 * Sanitização Cirúrgica de Ativos de Teste no Marketplace (Frente A)
 * Deslistagem (unlisting) dos 6 ativos de teste verificados (isListed = false).
 * Operação 100% não-destrutiva via queries parametrizadas: nenhuma linha é deletada fisicamente.
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

loadEnvLocal();

function getSanitizedHostPort() {
  const dbUrl = process.env.DATABASE_URL || '';
  const match = dbUrl.match(/@([a-zA-Z0-9\.\-]+:[0-9]+)/);
  return match ? match[1] : 'Host não identificado';
}

const TEST_ASSET_TARGET_IDS = [
  "2af443dd-4463-413e-8422-1e1d2a0a4a2e", // cvgasxvcsad
  "0df597c0-0641-453b-9f67-727a18ddfd0d", // TESTE 
  "2f15d25c-a298-411c-8f9d-393364f3b21a", // Tokai eio
  "98dac6e5-467e-4c56-9170-f52c4ebd4d8d", // Token Alfa - 001
  "5d5fe389-3f9f-4e82-b7ec-aefb0adb1416", // Token Comp
  "789a2065-99d7-4c49-9a6d-0b9ebc4382a8"  // TOKEN TESTE
];

async function runSanitization() {
  const prisma = new PrismaClient();
  const hostPort = getSanitizedHostPort();

  try {
    console.log('================================================================================');
    console.log('RELATÓRIO DE SANITIZAÇÃO CIRÚRGICA DE ATIVOS (FRENTE A) — MARKETPLACE');
    console.log('================================================================================');
    console.log(`(a) HOST REMOTO: ${hostPort}`);

    // 1. Estado Antes da Sanitização para os 6 alvos
    const targetsBefore = await prisma.$queryRaw`
      SELECT id, name, status, "isListed"
      FROM assets
      WHERE id IN (${TEST_ASSET_TARGET_IDS[0]}, ${TEST_ASSET_TARGET_IDS[1]}, ${TEST_ASSET_TARGET_IDS[2]}, ${TEST_ASSET_TARGET_IDS[3]}, ${TEST_ASSET_TARGET_IDS[4]}, ${TEST_ASSET_TARGET_IDS[5]})
      ORDER BY name ASC
    `;

    console.log('\n--- ESTADO ANTERIOR DOS ALVOS IDENTIFICADOS ---');
    targetsBefore.forEach((a) => {
      console.log(`- ID: ${a.id} | "${a.name}" | Status: ${a.status} | isListed: ${a.isListed}`);
    });

    // 2. Executar Atualização Não-Destrutiva (isListed = false)
    const updateCount = await prisma.$executeRaw`
      UPDATE assets
      SET "isListed" = false
      WHERE id IN (${TEST_ASSET_TARGET_IDS[0]}, ${TEST_ASSET_TARGET_IDS[1]}, ${TEST_ASSET_TARGET_IDS[2]}, ${TEST_ASSET_TARGET_IDS[3]}, ${TEST_ASSET_TARGET_IDS[4]}, ${TEST_ASSET_TARGET_IDS[5]})
    `;

    console.log(`\n(b) TOTAL DE ATIVOS MODIFICADOS: ${updateCount} de ${TEST_ASSET_TARGET_IDS.length}`);

    // 3. Validação do Estado Posterior dos Alvos
    const targetsAfter = await prisma.$queryRaw`
      SELECT id, name, status, "isListed"
      FROM assets
      WHERE id IN (${TEST_ASSET_TARGET_IDS[0]}, ${TEST_ASSET_TARGET_IDS[1]}, ${TEST_ASSET_TARGET_IDS[2]}, ${TEST_ASSET_TARGET_IDS[3]}, ${TEST_ASSET_TARGET_IDS[4]}, ${TEST_ASSET_TARGET_IDS[5]})
      ORDER BY name ASC
    `;

    console.log('\n--- ESTADO POSTERIOR DOS ALVOS (APÓS DESLISTAGEM) ---');
    targetsAfter.forEach((a) => {
      const ok = a.isListed === false ? '✅ DESLISTADO' : '❌ FALHA';
      console.log(`- ${ok} | ID: ${a.id} | "${a.name}" | isListed: ${a.isListed}`);
    });

    // 4. Verificação dos Ativos que DEVEM Permanecer Listados no Marketplace
    const remainingListed = await prisma.$queryRaw`
      SELECT id, name, status, "isListed"
      FROM assets
      WHERE "isListed" = true
      ORDER BY name ASC
    `;

    console.log(`\n--- ATIVOS QUE PERMANECEM LISTADOS NO MARKETPLACE (TOTAL: ${remainingListed.length}) ---`);
    remainingListed.forEach((a) => {
      console.log(`- ID: ${a.id} | "${a.name}" | Status: ${a.status} | isListed: ${a.isListed}`);
    });

    // 5. Total de Ativos na Base (Garantia de Não-Deleção Física)
    const countRes = await prisma.$queryRaw`
      SELECT COUNT(*)::int as total FROM assets
    `;
    const totalAssetsCount = countRes[0]?.total ?? 0;
    console.log(`\n(c) AUDITORIA DE INTEGRIDADE: Total geral de registros na tabela assets: ${totalAssetsCount} (Nenhum registro foi deletado)`);
    console.log('================================================================================');
  } catch (err) {
    console.error('ERRO CRÍTICO NA SANITIZAÇÃO:', err.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runSanitization();

/**
 * scripts/audit-db-schema-parity.js
 * Auditoria determinística de paridade de esquema e desvio (schema drift) entre
 * Prisma Schema e banco remoto Supabase PostgreSQL.
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Carregar .env.local caso não esteja presente no process.env
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

// Mascarar host e porta para conformidade de segurança
function getSanitizedHostPort() {
  const dbUrl = process.env.DATABASE_URL || '';
  const match = dbUrl.match(/@([a-zA-Z0-9\.\-]+:[0-9]+)/);
  return match ? match[1] : 'Host não identificado';
}

// Modelos esperados definidos em prisma/schema.prisma
const EXPECTED_PRISMA_MODELS = [
  {
    modelName: 'User',
    tableName: 'users',
    expectedColumns: ['id', 'walletAddress', 'nickname', 'createdAt', 'credits', 'role', 'isDeleted', 'deletedAt']
  },
  {
    modelName: 'UserMedal',
    tableName: 'user_medals',
    expectedColumns: ['id', 'userWallet', 'medalId', 'earnedAt']
  },
  {
    modelName: 'AdminWhitelist',
    tableName: 'admins',
    expectedColumns: ['walletAddress', 'addedAt', 'addedBy', 'role']
  },
  {
    modelName: 'Asset',
    tableName: 'assets',
    expectedColumns: [
      'id', 'ownerWallet', 'name', 'type', 'valuation', 'tokenPrice', 'totalTokens',
      'imageUrl', 'contractUrl', 'status', 'contractAddress', 'isListed', 'chainId',
      'sector', 'tokenNature', 'treasuryTokens', 'marketTokens', 'tokensAvailable',
      'royalties', 'description', 'createdAt', 'updatedAt'
    ]
  },
  {
    modelName: 'KycRecord',
    tableName: 'kyc_records',
    expectedColumns: ['id', 'userWallet', 'status', 'encryptedData', 'verifiedAt', 'reviewedBy']
  },
  {
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    expectedColumns: ['id', 'actorWallet', 'actionType', 'targetId', 'details', 'createdAt']
  },
  {
    modelName: 'credit_ledger',
    tableName: 'credit_ledger',
    expectedColumns: [
      'id', 'user_id', 'operation_type', 'amount', 'balance_before', 'balance_after',
      'crypto_amount', 'crypto_symbol', 'tx_hash', 'related_order_id', 'description',
      'metadata', 'created_at'
    ]
  },
  {
    modelName: 'payment_orders',
    tableName: 'payment_orders',
    expectedColumns: [
      'id', 'user_id', 'external_tid', 'amount_brl', 'amount_crypto', 'currency_symbol',
      'status', 'smart_contract_address', 'blockchain_network', 'created_at', 'updated_at'
    ]
  },
  {
    modelName: 'user_credits',
    tableName: 'user_credits',
    expectedColumns: ['user_id', 'balance', 'last_updated']
  },
  {
    modelName: 'webhook_logs',
    tableName: 'webhook_logs',
    expectedColumns: [
      'id', 'event_type', 'payload', 'token_received', 'external_tid',
      'related_order_id', 'ip_address', 'user_agent', 'processed', 'created_at'
    ]
  },
  {
    modelName: 'InvestmentReceipt',
    tableName: 'investment_receipts',
    expectedColumns: [
      'id', 'investorWallet', 'assetId', 'quantity', 'amountPaidCrypto',
      'cryptoSymbol', 'txHash', 'child_fraction_hash', 'status', 'resalePrice', 'createdAt'
    ]
  },
  {
    modelName: 'RiskAcknowledgement',
    tableName: 'risk_acknowledgements',
    expectedColumns: ['id', 'userWallet', 'assetId', 'acceptedAt', 'ipAddress', 'signatureHash']
  },
  {
    modelName: 'AdminPermission',
    tableName: 'admin_permissions',
    expectedColumns: ['id', 'walletAddress', 'role', 'grantedByMaster', 'createdAt', 'updatedAt']
  },
  {
    modelName: 'UserProfile',
    tableName: 'user_profiles',
    expectedColumns: ['id', 'walletAddress', 'isCitizen', 'citizenshipMintDate', 'sbtImageUrl', 'createdAt', 'updatedAt']
  }
];

async function runAudit() {
  const prisma = new PrismaClient();
  const hostPort = getSanitizedHostPort();

  try {
    // 1. Validar Conexão Básica
    await prisma.$queryRaw`SELECT 1 as ok`;

    // 2. Coletar Tabelas Existentes no PostgreSQL Remoto
    const remoteTablesRaw = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    const remoteTableNames = new Set(remoteTablesRaw.map((t) => t.table_name));

    // 3. Coletar Todas as Colunas das Tabelas Públicas
    const remoteColumnsRaw = await prisma.$queryRaw`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
    `;
    const remoteColumnsByTable = {};
    remoteColumnsRaw.forEach((row) => {
      if (!remoteColumnsByTable[row.table_name]) {
        remoteColumnsByTable[row.table_name] = new Set();
      }
      remoteColumnsByTable[row.table_name].add(row.column_name);
    });

    // 4. Auditoria de Paridade por Modelo
    const tableParityAudits = [];
    for (const model of EXPECTED_PRISMA_MODELS) {
      const exists = remoteTableNames.has(model.tableName);
      let rowCount = 0;
      const discrepancies = [];

      if (exists) {
        try {
          const countRes = await prisma.$queryRawUnsafe(
            `SELECT COUNT(*)::int as count FROM "${model.tableName}"`
          );
          rowCount = countRes[0]?.count ?? 0;
        } catch (err) {
          discrepancies.push(`Erro ao contar linhas: ${err.message}`);
        }

        const remoteCols = remoteColumnsByTable[model.tableName] || new Set();
        // Verificar colunas ausentes no banco
        model.expectedColumns.forEach((col) => {
          if (!remoteCols.has(col)) {
            discrepancies.push(`Coluna ausente no banco remoto: ${col}`);
          }
        });
        // Verificar colunas extras no banco não descritas no Prisma
        remoteCols.forEach((col) => {
          if (!model.expectedColumns.includes(col)) {
            discrepancies.push(`Coluna extra no banco remoto: ${col}`);
          }
        });
      } else {
        discrepancies.push(`Tabela ${model.tableName} ausente no banco remoto.`);
      }

      tableParityAudits.push({
        modelName: model.modelName,
        tableName: model.tableName,
        existsInRemote: exists,
        expectedInPrisma: true,
        rowCount,
        columnDiscrepancies: discrepancies
      });
    }

    // Tabelas extras existentes no banco e não declaradas no Prisma (excluindo _prisma_migrations)
    const expectedTableNames = new Set(EXPECTED_PRISMA_MODELS.map((m) => m.tableName));
    const extraTables = [...remoteTableNames].filter(
      (t) => !expectedTableNames.has(t) && t !== '_prisma_migrations'
    );

    // 5. Histórico de Migrações do Prisma
    let migrationRecords = [];
    let migrationsTableExists = remoteTableNames.has('_prisma_migrations');
    if (migrationsTableExists) {
      migrationRecords = await prisma.$queryRaw`
        SELECT id, migration_name, finished_at, rolled_back_at
        FROM "_prisma_migrations"
        ORDER BY finished_at ASC
      `;
    }

    // 6. Inventário de Ativos (Assets)
    const assetsList = await prisma.$queryRaw`
      SELECT id, name, status, "isListed"
      FROM assets
      ORDER BY name ASC
    `;

    // 7. Geração do Relatório Formatado em Português
    console.log('================================================================================');
    console.log('RELATÓRIO DE AUDITORIA DE PARIDADE E SCHEMA DRIFT — SUPABASE POSTGRESQL');
    console.log('================================================================================');
    console.log(`(a) HOST E PORTA REMOTOS AUDITADOS: ${hostPort}`);
    console.log(`(b) STATUS DA CONEXÃO: CONEXÃO BEM-SUCEDIDA (SELECT 1 OK)`);
    console.log(`(c) TABELA DE MIGRAÇÕES (_prisma_migrations): ${migrationsTableExists ? 'PRESENTE' : 'AUSENTE'}`);

    if (migrationRecords.length > 0) {
      console.log('\n--- HISTÓRICO DE MIGRAÇÕES APLICADAS NO BANCO REMOTO ---');
      migrationRecords.forEach((m) => {
        const status = m.rolled_back_at ? 'ROLLED BACK' : m.finished_at ? 'APLICADA COM SUCESSO' : 'INCOMPLETA';
        console.log(`- [${m.migration_name}] | Status: ${status} | Concluída em: ${m.finished_at || 'N/A'}`);
      });
    }

    console.log('\n--- PARIDADE DE MODELOS PRISMA VS TABELAS NO SUPABASE ---');
    let hasDrift = false;
    tableParityAudits.forEach((aud) => {
      const icon = aud.existsInRemote && aud.columnDiscrepancies.length === 0 ? '✅' : '⚠️';
      if (aud.columnDiscrepancies.length > 0 || !aud.existsInRemote) hasDrift = true;
      console.log(
        `${icon} Modelo: ${aud.modelName} -> Tabela: "${aud.tableName}" | Presente: ${aud.existsInRemote ? 'SIM' : 'NÃO'} | Linhas: ${aud.rowCount}`
      );
      if (aud.columnDiscrepancies.length > 0) {
        aud.columnDiscrepancies.forEach((d) => console.log(`   └─ Discrepância: ${d}`));
      }
    });

    if (extraTables.length > 0) {
      console.log('\n--- TABELAS EXTRAS ENCONTRADAS NO BANCO (NÃO DECLARADAS NO PRISMA) ---');
      extraTables.forEach((t) => console.log(`- "${t}"`));
    } else {
      console.log('\nNenhuma tabela extra encontrada no schema public.');
    }

    console.log(`\nDiagnóstico de Drift de Esquema: ${hasDrift ? 'DESVIO DETECTADO' : '100% PARIDADE CONFIRMADA'}`);

    console.log('\n--- INVENTÁRIO COMPLETO DE ATIVOS (ASSETS) ---');
    console.log(`Total de ativos cadastrados: ${assetsList.length}`);
    assetsList.forEach((a) => {
      console.log(`- ID: ${a.id} | Ativo: "${a.name}" | Status: ${a.status} | isListed: ${a.isListed}`);
    });

    console.log('================================================================================');
  } catch (err) {
    console.error('ERRO CRÍTICO NA AUDITORIA:', err.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runAudit();

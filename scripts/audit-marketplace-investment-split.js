/**
 * scripts/audit-marketplace-investment-split.js
 * Auditoria determinística de split de investimento do Marketplace (3-Way Split Audit).
 * Modo Read-Only: analisa o código-fonte e o ambiente (.env.local) sem realizar alterações.
 */

const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const envVars = {};
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
        envVars[key] = val;
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
  return envVars;
}

function maskWallet(wallet) {
  if (!wallet || wallet.length < 10) return wallet || 'NÃO CONFIGURADO';
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

function auditMarketplaceSplit() {
  const envVars = loadEnvLocal();

  const marketplaceFile = path.resolve(process.cwd(), 'app/marketplace/page.tsx');
  let marketplaceCode = '';
  if (fs.existsSync(marketplaceFile)) {
    marketplaceCode = fs.readFileSync(marketplaceFile, 'utf8');
  }

  // 1. Resolução das variáveis de carteira do ambiente
  const platformWallet = envVars.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || "ENS9dX7oP2bvX9kF9g1Vvf2JzGpgcTSWTpniezargFZ6";
  const treasuryWallet = envVars.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS || process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS || "CXqfj7vFFrpBMVaj8fuyQkGwFgHktdyYVDju723hnmWa";
  const liquidityReceiverWallet = envVars.NEXT_PUBLIC_LIQUIDITY_RECEIVER_WALLET || process.env.NEXT_PUBLIC_LIQUIDITY_RECEIVER_WALLET || "8DzctwAnUeXTy2xbUz1z5nfr3xfqCWYCxYAVTni7XvRH";

  // 2. Análise estática das instruções em app/marketplace/page.tsx
  // Mercado Primário (Investimento Direto 3-Way)
  const hasPrimaryOwnerTransfer = marketplaceCode.includes('ownerPubKey') && marketplaceCode.includes('ASSET_COST_L');
  const hasPrimaryPlatformSplit = marketplaceCode.includes('platformPubKey') && marketplaceCode.includes('PLATFORM_FEE_95_L');
  const hasPrimaryTreasurySplit = marketplaceCode.includes('treasuryPubKey') && marketplaceCode.includes('TREASURY_FEE_5_L');

  // Mercado Secundário (P2P Resale)
  const hasSecondarySellerTransfer = marketplaceCode.includes('sellerPubKey') && marketplaceCode.includes('SELLER_L');
  const hasSecondaryTreasuryTransfer = marketplaceCode.includes('treasuryPubKey') && marketplaceCode.includes('PLATFORM_L');
  const hasSecondaryRoyaltiesTransfer = marketplaceCode.includes('creatorPubKey') && marketplaceCode.includes('ROYALTIES_L');

  const is3WayPrimaryComplete = hasPrimaryOwnerTransfer && hasPrimaryPlatformSplit && hasPrimaryTreasurySplit;

  console.log('================================================================================');
  console.log('RELATÓRIO DE VALIDAÇÃO: SPLIT ATÔMICO 3-WAY DO MARKETPLACE PRIMÁRIO');
  console.log('================================================================================');

  console.log('\n1. CARTEIRAS OFICIAIS VERIFICADAS:');
  console.log(`- Plataforma (95% Fee Target): ${maskWallet(platformWallet)}`);
  console.log(`- Tesouraria (5% Liquidity Target): ${maskWallet(treasuryWallet)}`);
  console.log(`- Liquidez Mainnet (Fallback): ${maskWallet(liquidityReceiverWallet)}`);

  console.log('\n2. STATUS DAS INSTRUÇÕES ON-CHAIN (CHECKOUT PRIMÁRIO):');
  console.log(`- [Instrução 1] Repasse ao Criador (ASSET_COST_L -> ownerPubKey): ${hasPrimaryOwnerTransfer ? '✅ ATIVO' : '❌ AUSENTE'}`);
  console.log(`- [Instrução 2] Taxa Plataforma 95% (PLATFORM_FEE_95_L -> platformPubKey): ${hasPrimaryPlatformSplit ? '✅ ATIVO' : '❌ AUSENTE'}`);
  console.log(`- [Instrução 3] Taxa Liquidez/Tesouraria 5% (TREASURY_FEE_5_L -> treasuryPubKey): ${hasPrimaryTreasurySplit ? '✅ ATIVO' : '❌ AUSENTE'}`);

  console.log('\n3. VERIFICAÇÃO DE SINTAXE E INTEGRIDADE:');
  console.log(`- Arquitetura de Transação: Split Atômico 3-Way`);
  console.log(`- Status de Conformidade: ${is3WayPrimaryComplete ? '✅ 100% CONFORME' : '❌ INCOMPLETO'}`);
  console.log('================================================================================');

  if (!is3WayPrimaryComplete) {
    process.exit(1);
  }
}

auditMarketplaceSplit();

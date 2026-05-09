import { NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";
import { getBotKeypair } from "@/lib/solana-bot";

/**
 * Endpoint de Refill automático acionado por cron job (GET /api/cron/refill)
 * 100% isolado das interações dos usuários finais para blindagem contra erros 429.
 */
export async function GET(req: Request) {
  try {
    // 1. Carrega o Keypair do bot de tesouraria
    let botKeypair;
    try {
      botKeypair = getBotKeypair();
    } catch (err: any) {
      console.warn("[Cron Refill] Bot de tesouraria não configurado:", err.message);
      return NextResponse.json(
        { error: "Bot de Tesouraria não configurado no arquivo .env.local." },
        { status: 503 }
      );
    }

    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
    const connection = new Connection(rpcUrl, "confirmed");

    const botBalance = await connection.getBalance(botKeypair.publicKey);
    const balanceSOL = botBalance / 1_000_000_000;

    // Se o saldo atual for inferior a 3.0 SOL, acionamos a recarga
    if (balanceSOL < 3.0) {
      console.log(`[Cron Refill] Saldo atual (${balanceSOL} SOL) abaixo do limite de 3.0 SOL. Efetuando recarga...`);
      
      try {
        const signature = await connection.requestAirdrop(
          botKeypair.publicKey,
          1.0 * 1_000_000_000 // solicita 1.0 SOL Devnet
        );

        const latestBlock = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
          signature,
          ...latestBlock
        });

        const newBalance = await connection.getBalance(botKeypair.publicKey);
        console.log(`[Cron Refill] Recarga de 1.0 SOL concluída com sucesso! Novo saldo: ${newBalance / 1_000_000_000} SOL`);

        return NextResponse.json({
          success: true,
          action: "REFILL_EXECUTED",
          message: "Saldo reabastecido com sucesso via Solana Devnet Airdrop.",
          signature,
          currentBalance: newBalance / 1_000_000_000,
        });

      } catch (airdropError: any) {
        console.warn(`[Cron Refill Warning] Airdrop rejeitado pela Solana (Provável Rate-Limit 429): ${airdropError.message}`);
        
        return NextResponse.json({
          success: false,
          action: "REFILL_FAILED_SILENTLY",
          message: "Falha ao requisitar airdrop da Solana. O limite de taxa (429) ou tráfego alto impediu a recarga assíncrona.",
          error: airdropError.message,
          currentBalance: balanceSOL,
        }, { status: 429 });
      }
    }

    return NextResponse.json({
      success: true,
      action: "NO_ACTION_REQUIRED",
      message: "Saldo da tesouraria saudável. Nenhuma recarga necessária.",
      currentBalance: balanceSOL,
    });

  } catch (error: any) {
    console.error("[Cron Refill Error]", error);
    return NextResponse.json(
      { error: `Erro interno ao executar rotina de reabastecimento: ${error.message}` },
      { status: 500 }
    );
  }
}

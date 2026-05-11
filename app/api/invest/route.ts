import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, transactionSignature, cryptoAmount, assetId } = body;

    if (!walletAddress || !transactionSignature || cryptoAmount === undefined || !assetId) {
      return NextResponse.json(
        { error: "Dados incompletos para processar o investimento." },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { user_credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const currentBalance = user.credits ?? user.user_credits?.balance ?? 0;
    const CREDIT_COST = 5;

    if (currentBalance < CREDIT_COST) {
      return NextResponse.json(
        { error: "Saldo de créditos insuficiente. Você precisa de 5 Créditos Lake." },
        { status: 402 }
      );
    }

    const newBalance = currentBalance - CREDIT_COST;

    // Executar transação atômica
    await prisma.$transaction(async (tx) => {
      // 1. Debitar créditos
      if (user.credits !== null) {
        await tx.user.update({
          where: { id: user.id },
          data: { credits: newBalance },
        });
      } else if (user.user_credits) {
        await tx.user_credits.update({
          where: { user_id: user.id },
          data: { balance: newBalance },
        });
      }

      // 2. Inserir no ledger
      await tx.credit_ledger.create({
        data: {
          user_id: user.id,
          operation_type: "INVESTMENT_FEE",
          amount: -CREDIT_COST,
          balance_before: currentBalance,
          balance_after: newBalance,
          crypto_amount: new Prisma.Decimal(cryptoAmount),
          crypto_symbol: "SOL",
          tx_hash: transactionSignature,
          description: `Investimento processado no ativo: ${assetId}`,
        },
      });
    });

    return NextResponse.json(
      { success: true, message: "Investimento registrado e créditos deduzidos com sucesso." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[POST /api/invest] Erro:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar investimento." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, transactionSignature, cryptoAmount, receiptId } = body;

    if (!walletAddress || !transactionSignature || cryptoAmount === undefined || !receiptId) {
      return NextResponse.json(
        { error: "Dados incompletos para processar a listagem no mercado secundário." },
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

    // Buscar recibo
    const receipt = await prisma.investmentReceipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Recibo de investimento não encontrado." }, { status: 404 });
    }

    if (receipt.investorWallet !== walletAddress) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    if (receipt.status !== "HELD") {
      return NextResponse.json({ error: "Este ativo já está listado ou foi vendido." }, { status: 400 });
    }

    const currentBalance = user.credits ?? user.user_credits?.balance ?? 0;
    const LISTING_FEE_CREDITS = 5;

    if (currentBalance < LISTING_FEE_CREDITS) {
      return NextResponse.json(
        { error: "Saldo de créditos insuficiente. Você precisa de 5 Créditos Lake para listar no mercado secundário." },
        { status: 402 }
      );
    }

    const newBalance = currentBalance - LISTING_FEE_CREDITS;

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

      // 2. Atualizar status do recibo
      await tx.investmentReceipt.update({
        where: { id: receiptId },
        data: { status: "LISTED_FOR_SALE" },
      });

      // 3. Inserir no ledger de créditos
      await tx.credit_ledger.create({
        data: {
          user_id: user.id,
          operation_type: "SECONDARY_MARKET_FEE",
          amount: -LISTING_FEE_CREDITS,
          balance_before: currentBalance,
          balance_after: newBalance,
          crypto_amount: new Prisma.Decimal(cryptoAmount),
          crypto_symbol: "SOL",
          tx_hash: transactionSignature,
          description: `Listagem no Mercado Secundário do recibo: ${receiptId}`,
        },
      });
    });

    return NextResponse.json(
      { success: true, message: "Ativo listado no mercado secundário com sucesso." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[POST /api/invest/list-resale] Erro:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar a listagem." },
      { status: 500 }
    );
  }
}

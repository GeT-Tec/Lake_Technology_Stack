import { NextResponse } from "next/server";
import { uploadFileToIrys, InsufficientFundsError } from "@/lib/storage/irys";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const walletAddress = formData.get("walletAddress") as string | null;
    const transactionSignature = formData.get("transactionSignature") as string | null;
    const cryptoAmountStr = formData.get("cryptoAmount") as string | null;

    if (!walletAddress || !transactionSignature) {
      return NextResponse.json(
        { error: "A assinatura da transação (MINT_FEE) e a carteira são obrigatórias para o upload." },
        { status: 400 }
      );
    }

    const cryptoAmount = cryptoAmountStr ? parseFloat(cryptoAmountStr) : 0.05;

    if (!file || typeof file === "string" || !file.arrayBuffer) {
      return NextResponse.json(
        { error: "Nenhum arquivo válido enviado no corpo da requisição." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo excede o limite de 10MB." },
        { status: 413 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { user_credits: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    console.log(
      `[POST /api/upload] Recebido: ${file.name} (${file.size} bytes), tipo: ${file.type}`
    );

    // Converte File → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload real via SDK Irys na Devnet
    const { url } = await uploadFileToIrys(buffer, file.type);

    console.log(`[POST /api/upload] Sucesso — URL: ${url}`);

    // Registrar taxa na tesouraria (credit_ledger híbrido)
    const currentBalance = user.credits ?? user.user_credits?.balance ?? 0;
    
    await prisma.credit_ledger.create({
      data: {
        user_id: user.id,
        operation_type: "MINT_FEE",
        amount: 0,
        balance_before: currentBalance,
        balance_after: currentBalance,
        crypto_amount: new Prisma.Decimal(cryptoAmount),
        crypto_symbol: "SOL",
        tx_hash: transactionSignature,
        description: `Taxa de armazenamento e rede processada.`,
      },
    });

    return NextResponse.json({ url }, { status: 200 });
  } catch (error: any) {
    if (error instanceof InsufficientFundsError) {
      console.error("[POST /api/upload] Saldo insuficiente:", error.message);
      return NextResponse.json(
        {
          error:
            "Saldo insuficiente na tesouraria. Recarregue a conta Irys antes de continuar.",
          detail: error.message,
        },
        { status: 402 }
      );
    }

    console.error("[POST /api/upload Error]", error);
    return NextResponse.json(
      {
        error: `Erro interno no upload para o Arweave via Irys: ${error?.message || error}`,
      },
      { status: 500 }
    );
  }
}

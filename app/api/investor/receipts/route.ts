import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json({ error: "Carteira não informada." }, { status: 400 });
    }

    const receipts = await prisma.investmentReceipt.findMany({
      where: { investorWallet: wallet },
      include: { asset: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ receipts }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/investor/receipts] Erro:", error);
    return NextResponse.json({ error: "Erro ao buscar recibos." }, { status: 500 });
  }
}

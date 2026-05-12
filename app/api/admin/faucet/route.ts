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

    const user = await prisma.user.findUnique({
      where: { walletAddress: wallet },
      include: { user_credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { credits: 100 },
      });

      if (user.user_credits) {
        await tx.user_credits.update({
          where: { user_id: user.id },
          data: { balance: 100 },
        });
      }
    });

    return NextResponse.json(
      { message: "100 créditos adicionados com sucesso", wallet },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[GET /api/admin/faucet] Erro:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

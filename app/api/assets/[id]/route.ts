import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidSolanaAddress } from "@/lib/solana-address";

export const dynamic = "force-dynamic";

// DELETE /api/assets/[id] — Exclusão segura: apenas o dono pode excluir
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15+: params é uma Promise e deve ser aguardado
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const requestWallet = searchParams.get("wallet");

    if (!id) {
      return NextResponse.json(
        { error: "ID do ativo não fornecido." },
        { status: 400 }
      );
    }

    if (!isValidSolanaAddress(requestWallet)) {
      return NextResponse.json(
        { error: "Carteira inválida." },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      return NextResponse.json(
        { error: "Ativo não encontrado." },
        { status: 404 }
      );
    }

    // Comparação EXATA Base58 — sem mode: insensitive, sem toLowerCase()
    if (asset.ownerWallet !== requestWallet) {
      return NextResponse.json(
        { error: "Não autorizado. Apenas o criador pode excluir este ativo." },
        { status: 403 }
      );
    }

    await prisma.asset.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Ativo excluído com sucesso.",
    });
  } catch (error) {
    console.error("[DELETE /api/assets/[id]] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao excluir ativo." },
      { status: 500 }
    );
  }
}

// PATCH /api/assets/[id] — Atualizar status do ativo (ex: aprovar)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const requestWallet = searchParams.get("wallet");
    const body = await req.json();
    const { status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID do ativo não fornecido." },
        { status: 400 }
      );
    }

    if (!isValidSolanaAddress(requestWallet)) {
      return NextResponse.json(
        { error: "Carteira inválida." },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      return NextResponse.json(
        { error: "Ativo não encontrado." },
        { status: 404 }
      );
    }

    if (asset.ownerWallet !== requestWallet) {
      return NextResponse.json(
        {
          error: "Não autorizado. Apenas o criador pode atualizar este ativo.",
        },
        { status: 403 }
      );
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, asset: updatedAsset });
  } catch (error) {
    console.error("[PATCH /api/assets/[id]] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar ativo." },
      { status: 500 }
    );
  }
}

// GET /api/assets/[id] — Retorna detalhes de um ativo específico para o dashboard de gestão
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID do ativo não fornecido." },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      return NextResponse.json(
        { error: "Ativo não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, asset });
  } catch (error) {
    console.error("[GET /api/assets/[id]] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar detalhes do ativo." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
            return NextResponse.json({ error: "ID do ativo não fornecido." }, { status: 400 });
        }

        if (!requestWallet) {
            return NextResponse.json({ error: "Carteira não fornecida." }, { status: 400 });
        }

        const asset = await prisma.asset.findUnique({
            where: { id },
        });

        if (!asset) {
            return NextResponse.json({ error: "Ativo não encontrado." }, { status: 404 });
        }

        // Comparação EXATA Base58 — sem mode: insensitive, sem toLowerCase()
        if (asset.ownerWallet !== requestWallet) {
            return NextResponse.json(
                { error: "Não autorizado. Apenas o criador pode excluir este ativo." },
                { status: 403 }
            );
        }

        await prisma.asset.delete({ where: { id } });

        return NextResponse.json({ success: true, message: "Ativo excluído com sucesso." });
    } catch (error) {
        console.error("[DELETE /api/assets/[id]] Erro:", error);
        return NextResponse.json({ error: "Erro ao excluir ativo." }, { status: 500 });
    }
}

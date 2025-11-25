import { NextRequest, NextResponse } from "next/server";
// Importamos do nosso novo arquivo seguro
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const wallet = searchParams.get("wallet");

        // 1. Validação Básica
        if (!wallet) {
            return NextResponse.json({ isAdmin: false, error: "Carteira não informada" }, { status: 400 });
        }

        // 2. Busca Segura (Try/Catch específico para o banco)
        console.log(`[API] Buscando admin para wallet: ${wallet}`);

        // NOTA TÁTICA: O 'prisma.admins' abaixo depende do passo 'npx prisma db pull'.
        // Se der erro de digitação aqui, verifique seu schema.prisma para ver o nome do model.
        // ADJUSTMENT: Model name is AdminWhitelist in schema.prisma
        const admin = await prisma.adminWhitelist.findFirst({
            where: {
                walletAddress: {
                    equals: wallet,
                    mode: 'insensitive', // Ignora maiúsculas/minúsculas
                },
            },
        });

        if (admin) {
            console.log(`[API] SUCESSO! Admin encontrado: ${admin.role}`);
            return NextResponse.json({ isAdmin: true, role: admin.role });
        } else {
            console.log(`[API] Acesso negado. Carteira não está na tabela admins.`);
            return NextResponse.json({ isAdmin: false });
        }

    } catch (error: any) {
        // 3. Log do Erro Real no Terminal (Para podermos ver o que houve)
        console.error("💥 [ERRO CRÍTICO NO BACKEND]:", error);
        return NextResponse.json(
            { isAdmin: false, error: "Erro interno no servidor", details: error.message },
            { status: 500 }
        );
    }
}

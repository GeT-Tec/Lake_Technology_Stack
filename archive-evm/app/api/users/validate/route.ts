import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Force dynamic mode to prevent build-time execution
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { walletAddress } = body;

        // Validation
        if (!walletAddress || typeof walletAddress !== 'string') {
            return NextResponse.json(
                { error: "walletAddress é obrigatório" },
                { status: 400 }
            );
        }

        console.log(`[API] Validando usuário: ${walletAddress}`);

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: {
                walletAddress: walletAddress.toLowerCase(),
            },
        });

        // If user doesn't exist, create them
        if (!user) {
            console.log(`[API] Usuário não encontrado. Criando novo registro...`);
            user = await prisma.user.create({
                data: {
                    walletAddress: walletAddress.toLowerCase(),
                    credits: 5, // Give 5 free credits to new users
                },
            });
            console.log(`[API] ✅ Usuário criado com sucesso! Credits: ${user.credits}`);
        } else {
            console.log(`[API] ✅ Usuário existente encontrado. Credits: ${user.credits}`);
        }

        return NextResponse.json({
            success: true,
            user: {
                walletAddress: user.walletAddress,
                credits: user.credits,
                createdAt: user.createdAt,
            },
        });

    } catch (error: any) {
        console.error("💥 [ERRO NA VALIDAÇÃO DE USUÁRIO]:", error);
        return NextResponse.json(
            {
                error: "Erro ao validar usuário",
                details: error.message,
            },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET: Buscar créditos do usuário
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const walletAddress = searchParams.get("wallet");

        if (!walletAddress) {
            return NextResponse.json(
                { error: "walletAddress é obrigatório" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { walletAddress: walletAddress.toLowerCase() },
            select: { credits: true, walletAddress: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            credits: user.credits,
            walletAddress: user.walletAddress
        });

    } catch (error: any) {
        console.error("Erro ao buscar créditos:", error);
        return NextResponse.json(
            { error: "Erro ao buscar créditos", details: error.message },
            { status: 500 }
        );
    }
}

// POST: Gastar créditos
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { walletAddress, amount = 1 } = body;

        if (!walletAddress) {
            return NextResponse.json(
                { error: "walletAddress é obrigatório" },
                { status: 400 }
            );
        }

        // Buscar usuário atual
        const user = await prisma.user.findUnique({
            where: { walletAddress: walletAddress.toLowerCase() }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        // Verificar se tem créditos suficientes
        if (user.credits < amount) {
            return NextResponse.json(
                { error: "Créditos insuficientes", credits: user.credits },
                { status: 400 }
            );
        }

        // Decrementar créditos
        const updatedUser = await prisma.user.update({
            where: { walletAddress: walletAddress.toLowerCase() },
            data: { credits: { decrement: amount } }
        });

        // Registrar no audit log
        await prisma.auditLog.create({
            data: {
                userWallet: walletAddress.toLowerCase(),
                action: "SPEND_CREDITS",
                metadata: {
                    amount,
                    previousBalance: user.credits,
                    newBalance: updatedUser.credits
                }
            }
        });

        console.log(`✅ Créditos gastos: ${amount}. Saldo restante: ${updatedUser.credits}`);

        return NextResponse.json({
            success: true,
            credits: updatedUser.credits,
            spent: amount
        });

    } catch (error: any) {
        console.error("Erro ao gastar créditos:", error);
        return NextResponse.json(
            { error: "Erro ao processar transação", details: error.message },
            { status: 500 }
        );
    }
}

// PATCH: Adicionar créditos (compra)
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { walletAddress, amount = 10, planId, txHash } = body;

        if (!walletAddress) {
            return NextResponse.json(
                { error: "walletAddress é obrigatório" },
                { status: 400 }
            );
        }

        // Buscar saldo anterior para o audit log
        const previousUser = await prisma.user.findUnique({
            where: { walletAddress: walletAddress.toLowerCase() },
            select: { credits: true }
        });

        const previousBalance = previousUser?.credits || 0;

        // Incrementar créditos
        const updatedUser = await prisma.user.update({
            where: { walletAddress: walletAddress.toLowerCase() },
            data: { credits: { increment: amount } }
        });

        // Registrar no audit log (BUY_CREDITS)
        await prisma.auditLog.create({
            data: {
                userWallet: walletAddress.toLowerCase(),
                action: "BUY_CREDITS",
                metadata: {
                    planId: planId || "unknown",
                    credits: amount,
                    txHash: txHash || null,
                    previousBalance,
                    newBalance: updatedUser.credits
                }
            }
        });

        console.log(`✅ Créditos adicionados: ${amount}. Plano: ${planId}. Novo saldo: ${updatedUser.credits}`);

        return NextResponse.json({
            success: true,
            credits: updatedUser.credits,
            added: amount,
            planId
        });

    } catch (error: any) {
        console.error("Erro ao adicionar créditos:", error);
        return NextResponse.json(
            { error: "Erro ao adicionar créditos", details: error.message },
            { status: 500 }
        );
    }
}

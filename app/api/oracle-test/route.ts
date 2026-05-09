import { NextRequest, NextResponse } from "next/server";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { getSolPrice, getSolPriceFromJupiter, getSolPriceFromPyth, PYTH_SOL_USD_FEED } from "@/lib/solana-oracle";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const solanaNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
        const { searchParams } = new URL(req.url);
        const simulateFailure = searchParams.get("simulateFailure") === "true";

        const connection = new Connection(clusterApiUrl(solanaNetwork === "mainnet-beta" ? "mainnet-beta" : "devnet"));

        console.log(`[Oracle Test Route] Iniciando teste do Oráculo Dual na rede: ${solanaNetwork} (Simular Falha: ${simulateFailure})`);

        const jupPrice = await getSolPriceFromJupiter(simulateFailure);
        const pythPrice = await getSolPriceFromPyth(connection, simulateFailure);
        
        let finalPrice = null;
        let errorMsg = null;
        let variancePct = null;

        try {
            finalPrice = await getSolPrice(connection, simulateFailure);
            if (jupPrice !== null && pythPrice !== null) {
                const variance = Math.abs(jupPrice - pythPrice) / Math.max(jupPrice, pythPrice);
                variancePct = variance * 100;
            }
        } catch (err: any) {
            errorMsg = err.message;
        }

        return NextResponse.json({
            success: !simulateFailure && errorMsg === null,
            solanaNetwork,
            pythPriceAccount: PYTH_SOL_USD_FEED,
            prices: {
                jupiter: jupPrice,
                pyth: pythPrice,
                variancePercent: variancePct ? `${variancePct.toFixed(2)}%` : null,
                finalResolvedPrice: finalPrice
            },
            status: {
                jupiterOk: jupPrice !== null,
                pythOk: pythPrice !== null,
                varianceOk: variancePct !== null ? variancePct <= 3 : true
            },
            error: errorMsg || (simulateFailure ? "Simulação de falha ativada com sucesso. Ambos os oráculos estão offline." : null)
        });

    } catch (error: any) {
        console.error("Erro na rota de teste do oráculo:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

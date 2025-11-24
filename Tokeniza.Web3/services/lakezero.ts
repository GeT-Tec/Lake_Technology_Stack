import { TokenizePayload, LakeZeroResponse } from "@/types/lakezero";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const API_URL = process.env.NEXT_PUBLIC_LAKEZERO_API_URL || "http://localhost:8000";

export const LakeZeroService = {
    /**
     * Envia o payload para o motor de assinatura LakeZero.
     */
    async signAndTokenize(payload: TokenizePayload): Promise<LakeZeroResponse> {
        console.log(`[LakeZero Service] Iniciando processo. Mode: ${USE_MOCK ? 'MOCK' : 'REAL'}`);

        if (USE_MOCK) {
            return mockSignatureProcess(payload);
        }

        try {
            const response = await fetch(`${API_URL}/api/v1/tokenize`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_KEY || "dev-key"}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`LakeZero API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("[LakeZero Service] Falha crítica:", error);
            return {
                status: "ERROR",
                message: "Falha na comunicação com o motor de criptografia.",
            };
        }
    }
};

// Simulação de latência e processamento criptográfico
async function mockSignatureProcess(payload: TokenizePayload): Promise<LakeZeroResponse> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                status: "SUCCESS",
                transaction_id: "LZ-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
                message: "Ativo validado e assinado digitalmente pelo LakeZero Core.",
                signature: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("")
            });
        }, 2000); // Simula 2s de processamento
    });
}

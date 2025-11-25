// ARQUIVO: services/adminService.ts

import prisma from '../lib/prisma'; // Importa a conexão única

export interface AdminProfile {
    walletAddress: string;
    role: 'SUPER_ADMIN' | 'OPERATOR' | 'AUDITOR';
    addedAt: Date;
}

/**
 * Verifica se uma carteira tem credenciais de Admin no Banco de Dados.
 * @param walletAddress Endereço da carteira (0x...)
 * @returns Perfil do Admin ou null se não autorizado.
 */
export async function getAdminProfile(walletAddress: string): Promise<AdminProfile | null> {
    if (!walletAddress) return null;

    try {
        // Normaliza para lowercase para evitar erros de Case Sensitive
        const normalizedWallet = walletAddress.toLowerCase();

        const admin = await prisma.adminWhitelist.findUnique({
            where: {
                walletAddress: normalizedWallet,
            },
        });

        if (!admin) return null;

        return {
            walletAddress: admin.walletAddress,
            role: admin.role,
            addedAt: admin.addedAt,
        };

    } catch (error) {
        console.error("ERRO CRÍTICO AO CONSULTAR ADMIN:", error);
        return null; // Em caso de falha no banco, nega acesso por segurança (Fail-Safe)
    }
}

/**
 * Verifica apenas se é um Super Admin (God Mode)
 */
export async function isSuperAdmin(walletAddress: string): Promise<boolean> {
    const profile = await getAdminProfile(walletAddress);
    return profile?.role === 'SUPER_ADMIN';
}

// ARQUIVO: app/api/admin/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfile } from '@/services/adminService';

export async function GET(req: NextRequest) {
    try {
        // 1. Pega a carteira da URL (Ex: ?wallet=0x123...)
        const { searchParams } = new URL(req.url);
        const wallet = searchParams.get('wallet');

        if (!wallet) {
            return NextResponse.json({ isAdmin: false, role: null }, { status: 400 });
        }

        // 2. Consulta o Serviço Blindado (que fala com o Supabase)
        const profile = await getAdminProfile(wallet);

        // 3. Responde para o Frontend
        if (profile) {
            return NextResponse.json({
                isAdmin: true,
                role: profile.role,
                label: profile.role === 'SUPER_ADMIN' ? 'COMANDANTE' : 'OPERADOR'
            });
        }

        return NextResponse.json({ isAdmin: false, role: null });

    } catch (error) {
        console.error('Erro na verificação de admin:', error);
        return NextResponse.json({ isAdmin: false }, { status: 500 });
    }
}

// ARQUIVO: components/AdminBadge.tsx
'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/context/wallet-context'; // Ajuste se seu contexto tiver outro nome

export default function AdminBadge() {
    const { walletAddress } = useWallet(); // Pega a carteira conectada do contexto
    const [status, setStatus] = useState<{ is: boolean; label: string } | null>(null);

    useEffect(() => {
        if (!walletAddress) {
            setStatus(null);
            return;
        }

        // Pergunta para a API se essa carteira é poderosa
        fetch(`/api/admin/check?wallet=${walletAddress}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.isAdmin) {
                    setStatus({ is: true, label: data.label });
                } else {
                    setStatus(null);
                }
            })
            .catch((err) => console.error("Falha na inteligência:", err));
    }, [walletAddress]);

    if (!status) return null; // Se não for admin, não mostra nada (Stealth Mode)

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-pulse">
            <div className="bg-slate-900 border border-emerald-500 text-emerald-400 px-4 py-2 rounded shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="font-mono text-xs font-bold tracking-widest uppercase">
                    {status.label} NO COMANDO
                </span>
            </div>
        </div>
    );
}

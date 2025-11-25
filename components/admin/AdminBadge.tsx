"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/context/wallet-context";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function AdminBadge() {
    const { walletAddress } = useWallet();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            // Se não tem carteira, reseta e para.
            if (!walletAddress) {
                setIsAdmin(false);
                return;
            }

            console.log("🕵️ [CLIENT] Iniciando verificação para:", walletAddress);
            setLoading(true);

            try {
                // Força a URL com a carteira atual
                const response = await fetch(`/api/admin/check?wallet=${walletAddress}`);
                const data = await response.json();

                console.log("🕵️ [CLIENT] Resposta da API:", data);

                if (data.isAdmin) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("🕵️ [CLIENT] Erro ao conectar na API:", error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [walletAddress]);

    // Renderização Condicional
    if (!walletAddress) return null;
    if (!isAdmin && !loading) return null; // Se não é admin e carregou, esconde.

    return (
        <div className="flex items-center gap-2 px-3 py-1 ml-2 rounded-full bg-slate-900 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            {loading ? (
                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
            ) : (
                <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
                        Admin
                    </span>
                </>
            )}
        </div>
    );
}

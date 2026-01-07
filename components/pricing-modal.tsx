"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, Loader2, ShieldCheck } from "lucide-react";
import { useCredits } from "@/context/credits-context";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PACKAGES = [
    {
        id: "trial",
        credits: 5,
        priceWei: "0x6D606E88800", // ~0.00012 ETH (~$0.35)
        priceLabel: "0.00012 ETH",
        priceUsd: "~$0.35 USDT",
        name: "Trial",
        description: "Teste rápido da plataforma.",
        popular: false
    },
    {
        id: "starter",
        credits: 10,
        priceWei: "0x15A7545B4000", // ~0.00038 ETH (~$1.15)
        priceLabel: "0.00038 ETH",
        priceUsd: "~$1.15 USDT",
        name: "Starter",
        description: "Ideal para começar a explorar.",
        popular: false
    },
    {
        id: "pro",
        credits: 50,
        priceWei: "0x210D3A6F8000", // ~0.00058 ETH (~$1.75)
        priceLabel: "0.00058 ETH",
        priceUsd: "~$1.75 USDT",
        name: "Pro",
        description: "Melhor valor para investidores.",
        popular: true
    },
    {
        id: "expert",
        credits: 100,
        priceWei: "0x421A74DF0000", // ~0.00116 ETH (~$3.50)
        priceLabel: "0.00116 ETH",
        priceUsd: "~$3.50 USDT",
        name: "Expert",
        description: "Para uso intensivo e institucional.",
        popular: false
    }
];

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const { buyCredits } = useCredits();
    const { toast } = useToast();
    const [loadingPackage, setLoadingPackage] = useState<string | null>(null);

    const handlePurchase = async (pkg: typeof PACKAGES[0]) => {
        setLoadingPackage(pkg.id);

        try {
            await buyCredits(pkg.credits, pkg.priceWei);

            toast({
                title: "✅ Compra realizada com sucesso!",
                description: `Você adquiriu ${pkg.credits} créditos. Aproveite!`,
                duration: 5000,
            });
            onClose();

        } catch (error: any) {
            console.error("Erro na compra:", error);
            toast({
                variant: "destructive",
                title: "❌ Falha na compra",
                description: error.message || "A transação foi cancelada ou falhou.",
            });
        } finally {
            setLoadingPackage(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] bg-slate-50 p-0 overflow-hidden border-none shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {/* Header Promocional */}
                    <div className="bg-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-50"></div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/50">
                                <Zap className="text-white w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Desbloqueie o Poder do LakeTokeniza</h2>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Adquira créditos para acessar simuladores avançados, relatórios de viabilidade e tokenização de ativos reais.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <ShieldCheck className="w-4 h-4 text-green-400" />
                                    Transação segura via Blockchain
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-800 pt-4">
                                    Os valores de contribuição dos pacotes oferecidos são para manter a manutenção da plataforma e a segurança dos serviços oferecidos.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pacotes */}
                    <div className="col-span-2 p-8 bg-white overflow-y-auto max-h-[80vh]">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-2xl font-bold text-slate-900">Escolha seu pacote</DialogTitle>
                            <DialogDescription>Selecione a quantidade de créditos que deseja adicionar.</DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PACKAGES.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className={`
                                        relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between
                                        ${pkg.popular
                                            ? 'border-blue-500 bg-blue-50/50 hover:shadow-md'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }
                                        ${loadingPackage && loadingPackage !== pkg.id ? 'opacity-50 pointer-events-none' : ''}
                                    `}
                                    onClick={() => !loadingPackage && handlePurchase(pkg)}
                                >
                                    {pkg.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
                                            MAIS POPULAR
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">{pkg.name}</h3>
                                                <p className="text-xs text-slate-500">{pkg.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold font-mono">
                                                    {pkg.priceLabel}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-bold mt-1">
                                                    {pkg.priceUsd}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-end gap-1 mb-4">
                                            <span className="text-3xl font-extrabold text-slate-900">{pkg.credits}</span>
                                            <span className="font-bold text-slate-500 mb-1 text-sm">créditos</span>
                                        </div>
                                    </div>

                                    <Button
                                        className={`w-full font-bold h-9 text-sm ${pkg.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                                        disabled={!!loadingPackage}
                                    >
                                        {loadingPackage === pkg.id ? (
                                            <>
                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                ...
                                            </>
                                        ) : (
                                            "Comprar"
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 text-center text-xs text-slate-400">
                            Ao confirmar, uma transação será enviada para sua carteira Web3.
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

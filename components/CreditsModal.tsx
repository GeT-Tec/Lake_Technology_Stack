"use client";

import { useCredits, CREDIT_PLANS, CreditPlan } from "@/context/credits-context";
import { useWallet } from "@/context/wallet-context";
import { getEthPriceAndHex } from "@/lib/token-prices";
import { X, Zap, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CreditsModal() {
    const { isModalOpen, closeModal, buyCredits, isLoading } = useCredits();
    const { isConnected } = useWallet();

    if (!isModalOpen) return null;

    const handlePurchase = async (originalPlan: CreditPlan) => {
        if (!isConnected) {
            alert("Conecte sua carteira primeiro.");
            return;
        }

        // Calculate dynamic ETH price from USD
        const { ethDisplay, weiHex } = getEthPriceAndHex(originalPlan.priceUSD);

        // Create synthetic plan with updated ETH values
        const finalPlan: CreditPlan = {
            ...originalPlan,
            priceEth: weiHex,
            priceEthDisplay: ethDisplay
        };

        await buyCredits(finalPlan);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={closeModal}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Close button */}
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
                    aria-label="Fechar"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Left Panel - Branding (Dark) */}
                    <div className="bg-slate-900 text-white p-8 md:w-80 flex flex-col justify-between min-h-[480px]">
                        <div>
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-6">
                                <Zap className="w-6 h-6 text-white" />
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold mb-4 leading-tight">
                                Desbloqueie o Poder do LakeTokeniza
                            </h2>

                            {/* Description */}
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                Adquira créditos para acessar simuladores avançados,
                                relatórios de viabilidade e tokenização de ativos reais.
                            </p>

                            {/* Security Badge */}
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <Check className="w-4 h-4 text-green-400" />
                                <span>Transação segura via Blockchain</span>
                            </div>
                        </div>

                        {/* Footer text */}
                        <p className="text-xs text-slate-500 mt-8 leading-relaxed">
                            Os valores de contribuição dos pacotes oferecidos são para manter a
                            manutenção da plataforma e a segurança dos serviços oferecidos.
                        </p>
                    </div>

                    {/* Right Panel - Plans (Light) */}
                    <div className="flex-1 p-8 bg-white">
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Escolha seu pacote
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Selecione a quantidade de créditos que deseja adicionar.
                        </p>

                        {/* Grid 2x2 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {CREDIT_PLANS.map((plan) => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    onSelect={handlePurchase}
                                    isLoading={isLoading}
                                />
                            ))}
                        </div>

                        {/* Footer */}
                        <p className="text-xs text-center text-slate-400 mt-6">
                            Ao confirmar, uma transação será enviada para sua carteira Web3.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface PlanCardProps {
    plan: CreditPlan;
    onSelect: (plan: CreditPlan) => void;
    isLoading: boolean;
}

function PlanCard({ plan, onSelect, isLoading }: PlanCardProps) {
    // Get dynamic ETH price for display
    const { ethDisplay } = getEthPriceAndHex(plan.priceUSD);

    return (
        <div
            className={cn(
                "relative border rounded-xl p-5 transition-all duration-200",
                plan.popular
                    ? "border-blue-500 bg-blue-50/30 shadow-lg ring-1 ring-blue-200"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
            )}
        >
            {/* Popular Badge - Positioned at top border */}
            {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Mais Popular
                    </span>
                </div>
            )}

            {/* Header: Name + ETH Badge */}
            <div className="flex justify-between items-start mb-1">
                <div>
                    <h4 className="font-semibold text-slate-900 text-base">{plan.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {plan.id === "trial" && "Teste rápido da plataforma."}
                        {plan.id === "starter" && "Ideal para começar a explorar."}
                        {plan.id === "pro" && "Melhor valor para investidores."}
                        {plan.id === "expert" && "Para uso intensivo e institucional."}
                    </p>
                </div>

                {/* ETH Badge - Black background */}
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-medium text-white bg-slate-950 px-2 py-1 rounded">
                        {ethDisplay} <span className="text-slate-400">ETH</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                        {plan.priceUsdt}
                    </span>
                </div>
            </div>

            {/* Credits - Large number */}
            <div className="flex items-baseline gap-1.5 my-4">
                <span className="text-4xl font-bold text-slate-900">{plan.credits}</span>
                <span className="text-sm text-slate-500">créditos</span>
            </div>

            {/* Buy Button */}
            <button
                onClick={() => onSelect(plan)}
                disabled={isLoading}
                className={cn(
                    "w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200",
                    plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
                        : "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400",
                    "disabled:cursor-not-allowed"
                )}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processando...
                    </span>
                ) : (
                    "Comprar"
                )}
            </button>
        </div>
    );
}

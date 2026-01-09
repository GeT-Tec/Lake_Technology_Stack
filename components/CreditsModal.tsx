"use client";

import { useCredits, CREDIT_PLANS, CreditPlan } from "@/context/credits-context";
import { useWallet } from "@/context/wallet-context";
import { X, Zap, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CreditsModal() {
    const { isModalOpen, closeModal, buyCredits, isLoading } = useCredits();
    const { isConnected } = useWallet();

    if (!isModalOpen) return null;

    const handlePurchase = async (plan: CreditPlan) => {
        if (!isConnected) {
            alert("Conecte sua carteira primeiro.");
            return;
        }
        await buyCredits(plan);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeModal}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Close button */}
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Left Panel - Branding */}
                    <div className="bg-slate-900 text-white p-8 md:w-72 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                                <Zap className="w-6 h-6" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-3">
                            Desbloqueie o Poder do LakeTokeniza
                        </h2>

                        <p className="text-slate-400 text-sm mb-6">
                            Adquira créditos para acessar simuladores avançados,
                            relatórios de viabilidade e tokenização de ativos reais.
                        </p>

                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Transação segura via Blockchain</span>
                        </div>

                        <p className="text-xs text-slate-500 mt-6">
                            Os valores de contribuição dos pacotes oferecidos são para manter a
                            manutenção da plataforma e a segurança dos serviços oferecidos.
                        </p>
                    </div>

                    {/* Right Panel - Plans */}
                    <div className="flex-1 p-8">
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Escolha seu pacote
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Selecione a quantidade de créditos que deseja adicionar.
                        </p>

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
    return (
        <div
            className={cn(
                "relative border rounded-xl p-5 transition-all duration-200",
                plan.popular
                    ? "border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-100"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
            )}
        >
            {/* Popular Badge */}
            {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Mais Popular
                    </span>
                </div>
            )}

            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-semibold text-slate-900">{plan.name}</h4>
                    <p className="text-xs text-slate-500">
                        {plan.id === "trial" && "Teste rápido da plataforma."}
                        {plan.id === "starter" && "Ideal para começar a explorar."}
                        {plan.id === "pro" && "Melhor valor para investidores."}
                        {plan.id === "expert" && "Para uso intensivo e institucional."}
                    </p>
                </div>

                <div className="text-right">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {plan.priceEthDisplay} ETH
                    </span>
                </div>
            </div>

            <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-slate-900">{plan.credits}</span>
                <span className="text-sm text-slate-500">créditos</span>
            </div>

            <div className="text-xs text-slate-400 mb-4">
                {plan.priceUsdt} USDT
            </div>

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

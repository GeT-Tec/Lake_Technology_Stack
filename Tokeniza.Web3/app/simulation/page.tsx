"use client";
import { useState } from "react";
import { useWallet } from "@/context/wallet-context";
import { useCredits } from "@/context/credits-context";
import { CheckCircle2, Loader2, Zap, History, ExternalLink, AlertTriangle } from "lucide-react";

export default function SimulationPage() {
  const { isConnected, connectWallet } = useWallet();
  const { credits, spendCredit, buyCredits, isLoading, history } = useCredits();
  const [simStatus, setSimStatus] = useState<"idle" | "success">("idle");

  const handleSimulation = async () => {
    if (!isConnected) return;
    if (credits === 0) {
      if (confirm("Saldo zerado. Deseja comprar 3 créditos por 0.0001 ETH?")) await buyCredits();
      return;
    }
    const success = await spendCredit();
    if (success) setSimStatus("success");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Simulação de Tokenização</h1>
          <p className="text-slate-600 mt-2">Economia Híbrida: Pague na Blockchain, use via LakeZero.</p>
        </div>

        {/* SALDO & AÇÕES */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${credits > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Saldo Disponível</p>
                  <p className="text-xl font-bold text-slate-900">{credits} Simulações</p>
                </div>
              </div>
              <button onClick={buyCredits} disabled={isLoading} className="text-sm font-bold text-blue-600 hover:underline disabled:opacity-50">
                {isLoading ? "Processando..." : "+ Recarregar (0.0001 ETH)"}
              </button>
            </div>

            {simStatus === "success" ? (
              <div className="animate-in fade-in zoom-in-95">
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3 text-green-800">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-bold text-sm">Simulação Realizada!</p>
                    <p className="text-xs">1 crédito consumido. Assinatura LakeZero registrada.</p>
                  </div>
                </div>
                <button onClick={() => setSimStatus("idle")} className="w-full py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Nova Simulação</button>
              </div>
            ) : (
              <div className="text-center py-4">
                {!isConnected ? (
                  <button onClick={connectWallet} className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold">Conectar Carteira</button>
                ) : (
                  <button onClick={handleSimulation} disabled={isLoading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white" />}
                    {credits > 0 ? "Simular Agora (1 Crédito)" : "Comprar Créditos"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* HISTÓRICO DE TRANSAÇÕES (NOVO) */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Histórico de Transações</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {history.map((tx) => (
                <div key={tx.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${tx.type === 'COMPRA' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {tx.type}
                      </span>
                      <span className="text-xs text-slate-400">{tx.date}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === 'COMPRA' ? 'text-green-600' : 'text-slate-700'}`}>
                      {tx.amount}
                    </p>
                    {tx.hash && tx.type === 'COMPRA' && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-400 hover:text-blue-600 flex items-center justify-end gap-1 mt-0.5"
                      >
                        Ver na Blockchain <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {tx.type === 'USO' && <span className="text-[10px] text-slate-400 block mt-0.5">Off-chain (LakeZero)</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
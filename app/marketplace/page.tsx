"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, TrendingUp, Briefcase, Trash2, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";

const DEMO_ASSETS = [
  { id: "demo-1", name: "Edifício Faria Lima Prime", type: "Real Estate", price: 1200, yield: "12.5% a.a.", available: "45%", image: "bg-blue-900", locked: false, isDemo: true, ownerWallet: null },
  { id: "demo-2", name: "Usinas Solares Bahia I", type: "Energia Renovável", price: 850, yield: "14.2% a.a.", available: "12%", image: "bg-amber-600", locked: false, isDemo: true, ownerWallet: null },
];

interface AssetItem {
  id: string;
  name: string;
  type: string;
  price?: number;
  yield?: string;
  available?: string;
  image: string;
  locked: boolean;
  isDemo?: boolean;
  isUserAsset?: boolean;
  ownerWallet: string | null;
  status?: string;
}

// ─── Modal de Confirmação de Exclusão ───────────────────────────────────────
function DeleteConfirmModal({
  assetName,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  assetName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-in zoom-in-95 fade-in duration-200">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Cancelar Simulação</h3>
        <p className="text-slate-500 text-center text-sm mb-2">
          Tem certeza que deseja cancelar e excluir permanentemente:
        </p>
        <p className="text-center font-semibold text-slate-800 mb-6">"{assetName}"</p>
        <p className="text-xs text-red-500 text-center mb-6 font-medium">
          ⚠️ Esta ação é irreversível e não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Manter
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isDeleting ? "Excluindo..." : "Sim, Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function Marketplace() {
  const { publicKey } = useSolanaWallet();
  const connectedWallet = publicKey?.toBase58() ?? null;

  const [activeFilter, setActiveFilter] = useState("Todos");
  const [assets, setAssets] = useState<AssetItem[]>(DEMO_ASSETS);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Estado do modal de exclusão
  const [deleteTarget, setDeleteTarget] = useState<AssetItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Busca ativos do banco de dados
  const fetchAssets = useCallback(async () => {
    setIsLoadingAssets(true);
    try {
      const url = connectedWallet
        ? `/api/assets?wallet=${connectedWallet}`
        : `/api/assets`;

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.assets) {
        const dbAssets: AssetItem[] = data.assets.map((a: any) => {
          const isApproved = a.status === "APPROVED" || a.status === "ACTIVE" || a.status === "TOKENIZED";
          return {
            id: a.id,
            name: a.name,
            type: a.type,
            price: Number(a.valuation) / 1000,
            yield: isApproved ? "12.0% a.a." : "Em Análise",
            available: "100%",
            image: "bg-slate-700",
            locked: isApproved ? false : true,
            isUserAsset: true,
            ownerWallet: a.ownerWallet,
            status: a.status,
          };
        });

        setAssets([...dbAssets, ...DEMO_ASSETS]);
      }
    } catch (err) {
      console.error("[Marketplace] Erro ao buscar ativos:", err);
      setAssets(DEMO_ASSETS);
    } finally {
      setIsLoadingAssets(false);
    }
  }, [connectedWallet]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Exclusão com validação de autoria
  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !connectedWallet) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/assets/${deleteTarget.id}?wallet=${encodeURIComponent(connectedWallet)}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao excluir.");

      // Atualização imediata do estado local — sem reload
      setAssets(prev => prev.filter(a => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: any) {
      alert(`❌ ${e.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Forçar aprovação do ativo (Dev Mode)
  const handleForceApproval = async (assetId: string) => {
    if (!connectedWallet) return;
    try {
      const res = await fetch(`/api/assets/${assetId}?wallet=${encodeURIComponent(connectedWallet)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao aprovar ativo.");

      // Atualiza o estado local do ativo para aprovação imediata sem reload
      setAssets(prev =>
        prev.map(a =>
          a.id === assetId
            ? { ...a, status: "APPROVED", locked: false, yield: "12.0% a.a." }
            : a
        )
      );
    } catch (e: any) {
      alert(`❌ ${e.message}`);
    }
  };

  const filteredAssets = assets
    .filter(a => {
      if (activeFilter === "Meus Ativos") return a.ownerWallet === connectedWallet;
      if (activeFilter !== "Todos") return a.type.includes(activeFilter);
      return true;
    })
    .filter(a =>
      searchQuery === "" ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const isMyAsset = (a: AssetItem) =>
    connectedWallet !== null && a.ownerWallet === connectedWallet;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 px-6">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-slate-500 mt-1 text-sm">Ativos tokenizados e simulações em análise</p>
      </div>

      {/* Filtros e Busca */}
      <div className="sticky top-20 z-30 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 py-4 px-6 flex flex-wrap justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {["Todos", "Meus Ativos"].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeFilter === f
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white border border-slate-200 hover:border-slate-400"
              }`}
            >
              {f}
              {f === "Meus Ativos" && connectedWallet && (
                <span className="ml-2 bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {assets.filter(a => a.ownerWallet === connectedWallet).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar ativo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-6 py-12">
        {isLoadingAssets ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            <span className="ml-3 text-slate-500">Carregando ativos...</span>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-24">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium">Nenhum ativo encontrado.</p>
            {activeFilter === "Meus Ativos" && (
              <p className="text-slate-400 text-sm mt-1">Crie uma simulação no Simulador Institucional.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredAssets.map(asset => (
              <div
                key={asset.id}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Faixa colorida superior */}
                <div className={`h-2 w-full ${asset.image}`} />

                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <div className={`p-2 rounded-lg ${isMyAsset(asset) ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                      {isMyAsset(asset) ? <Briefcase className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                    </div>
                    <div className="flex items-center gap-2">
                      {isMyAsset(asset) ? (
                        asset.status === "APPROVED" || asset.status === "ACTIVE" || asset.status === "TOKENIZED" ? (
                          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            ATIVO
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                            EM ANÁLISE
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-green-50 text-green-700 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          ATIVO
                        </span>
                      )}

                      {/* Botão Destrutivo — apenas para o dono */}
                      {isMyAsset(asset) && !asset.isDemo && (
                        <button
                          onClick={() => setDeleteTarget(asset)}
                          title="Cancelar esta simulação"
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold mb-1 truncate" title={asset.name}>{asset.name}</h3>
                  <p className="text-xs text-slate-500 uppercase mb-4 truncate">{asset.type}</p>

                  {isMyAsset(asset) ? (
                    asset.status === "APPROVED" || asset.status === "ACTIVE" || asset.status === "TOKENIZED" ? (
                      <Link
                        href={`/manage/${asset.id}`}
                        className="block w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold text-sm text-center transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                      >
                        Gerenciar Ativo
                      </Link>
                    ) : (
                      <div className="flex gap-2">
                        <Link
                          href={`/manage/${asset.id}`}
                          className="flex-grow py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-bold text-sm text-center transition-all shadow-md flex items-center justify-center"
                        >
                          Gerenciar (Modo Dev)
                        </Link>
                        <button
                          onClick={() => handleForceApproval(asset.id)}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                          title="Aprovar Ativo na Blockchain"
                        >
                          Aprovar
                        </button>
                      </div>
                    )
                  ) : (
                    <button
                      disabled={asset.locked}
                      className={`w-full py-2 rounded-lg font-bold text-sm transition-colors ${
                        asset.locked
                          ? "bg-slate-100 text-slate-400 cursor-default"
                          : "bg-slate-900 text-white hover:bg-slate-700"
                      }`}
                    >
                      Investir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {deleteTarget && (
        <DeleteConfirmModal
          assetName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !isDeleting && setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
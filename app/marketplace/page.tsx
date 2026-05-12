"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, TrendingUp, Briefcase, Trash2, Loader2, AlertTriangle, ShieldCheck, X, Zap, Coins, Lock, ExternalLink, ChevronRight } from "lucide-react";
import { useConnection, useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { useCredits } from "@/context/credits-context";
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";
import Image from "next/image";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

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
  description?: string;
  tokensAvailable?: number;
  totalTokens?: number;
  valuation?: number;
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

// ─── Modal de Investimento ────────────────────────────────────────────────────
function InvestModal({ asset, onClose }: { asset: AssetItem; onClose: () => void }) {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useSolanaWallet();
  const { solPrice, refreshSolPrice, addTransactionRecord } = useCredits();
  const [isProcessing, setIsProcessing] = useState(false);

  // Assumindo que o preço no banco já é a representação base ou BRL
  const tokenPriceBRL = asset.price ?? 0;
  const maxQty = asset.tokensAvailable ?? 0;
  const [qty, setQty] = useState(1);
  
  // Cotações Fixas (Mock para Frontend Visual)
  const RATE_USDC_BRL = 5.10;
  const RATE_SOL_BRL = 850.0;

  // Cálculos Unitários
  const tokenPriceUSDC = (tokenPriceBRL / RATE_USDC_BRL).toFixed(2);
  const tokenPriceSOL = (tokenPriceBRL / RATE_SOL_BRL).toFixed(4);

  // Cálculos Totais
  const totalBRLValue = qty * tokenPriceBRL;
  const totalBRL = totalBRLValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const totalUSDC = (totalBRLValue / RATE_USDC_BRL).toFixed(2);
  const totalSOL = (totalBRLValue / RATE_SOL_BRL).toFixed(4);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 fade-in duration-200">

        {/* Hero image */}
        {asset.image && asset.image.startsWith("https://") ? (
          <div className="relative w-full h-48 bg-slate-50 flex items-center justify-center overflow-hidden rounded-t-xl border-b border-slate-100 shrink-0">
            <Image
              src={asset.image}
              alt="Asset RWA"
              fill
              className="object-contain p-4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-5 z-10">
              <p className="text-white/90 text-xs font-bold uppercase tracking-widest drop-shadow-md">Ativo RWA Tokenizado</p>
              <h2 className="text-white text-2xl font-extrabold leading-tight drop-shadow-lg">{asset.name}</h2>
            </div>
            <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white flex items-center gap-1 border border-white/10 z-10">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Arweave RWA
            </div>
            <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white transition-colors z-10">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className={`h-24 w-full ${asset.image} flex items-center px-6 justify-between`}>
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Ativo RWA</p>
              <h2 className="text-white text-xl font-extrabold">{asset.name}</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wider">{asset.type}</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">{asset.yield ?? "Rendimento variável"}</span>
          </div>

          {asset.description && (
            <section className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">A Missão e o Lastro</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{asset.description}</p>
            </section>
          )}

          {asset.valuation ? (
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4">
               <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Valuation do Empreendimento</span>
               <CurrencyDisplay variant="subtextOnly" brlValue={asset.valuation} />
            </div>
          ) : null}

          {/* Price grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Preço por Token</p>
              <p className="text-2xl font-extrabold text-slate-900 leading-none">
                {tokenPriceBRL.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                ~ {tokenPriceUSDC} USDC | ~ {tokenPriceSOL} SOL
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-center">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Inventário</p>
              <p className="text-sm text-slate-700 mt-2">
                Disponível: <span className="font-bold">{asset.tokensAvailable?.toLocaleString() || "100%"}</span> de um total de {asset.totalTokens?.toLocaleString() || "100%"}
              </p>
            </div>
          </div>

          {/* Qty selector */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Quantidade de Tokens</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors text-lg flex items-center justify-center">−</button>
              <span className="flex-1 text-center text-2xl font-extrabold text-slate-900">{qty}</span>
              <button disabled={qty >= maxQty} onClick={() => setQty(q => Math.min(maxQty, q + 1))} className={`w-10 h-10 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 transition-colors text-lg flex items-center justify-center ${qty >= maxQty ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}>+</button>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-end">
              <span className="text-sm text-slate-500 font-medium">Total estimado</span>
              <div className="text-right">
                <span className="block text-2xl font-extrabold text-slate-900 leading-none">{totalBRL}</span>
                <span className="block text-xs text-slate-500 font-medium mt-1">
                  ~ {totalUSDC} USDC | ~ {totalSOL} SOL
                </span>
              </div>
            </div>
          </div>

          {/* Taxa — Motor de Créditos Lake */}
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-violet-100 rounded-xl shrink-0">
              <Coins className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-violet-800">Taxa de Operação — Motor Lake</p>
              <p className="text-xs text-violet-600 mt-0.5">Esta operação consome <strong>5 Créditos Lake</strong> e uma taxa de rede de <strong>$1.00 USD</strong> (convertidos em SOL) da sua carteira conectada.</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-2xl font-extrabold text-violet-700">5</p>
              <p className="text-[10px] text-violet-500 font-bold uppercase">Créditos</p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={async () => {
              if (!publicKey) {
                alert("Conecte sua carteira para investir.");
                return;
              }
              
              setIsProcessing(true);
              try {
                console.log("[Invest] Preparando pagamento de investimento...");

                // 1. Obter Preço Dinâmico do SOL (US$)
                let currentPrice = solPrice;
                if (!currentPrice || currentPrice <= 0) {
                  currentPrice = await refreshSolPrice();
                }
                
                if (!currentPrice || currentPrice <= 0) {
                  throw new Error("Falha ao obter cotação do SOL. Tente novamente.");
                }

                // Taxa da Plataforma: $1.00 USD
                const exactFeeSol = 1.00 / currentPrice;
                const safeFeeSol = exactFeeSol * 1.01; // 1% buffer
                const INVEST_FEE = Math.floor(safeFeeSol * LAMPORTS_PER_SOL);

                // Custo Principal dos Tokens (P2P):
                const RATE_USDC_BRL = 5.10;
                const tokensUsdValue = ((asset.price || 0) * qty) / RATE_USDC_BRL;
                const exactTokensSol = tokensUsdValue / currentPrice;
                const safeTokensSol = exactTokensSol * 1.01; // 1% buffer
                const TOKENS_COST = Math.floor(safeTokensSol * LAMPORTS_PER_SOL);
                
                const totalSolAmount = safeFeeSol + safeTokensSol;

                const treasuryPubKey = new PublicKey(
                  process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS || "CXqfj7vFFrpBMVaj8fuyQkGwFgHktdyYVDju723hnmWa"
                );

                if (publicKey.toBase58() === treasuryPubKey.toBase58()) {
                  throw new Error("A carteira conectada não pode ser a própria Tesouraria.");
                }

                const creatorPubKey = new PublicKey(asset.ownerWallet || treasuryPubKey.toBase58());

                const transaction = new Transaction().add(
                  // 1. Instrução de Taxa ($1.00 USD) para Tesouraria
                  SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: treasuryPubKey,
                    lamports: INVEST_FEE,
                  }),
                  // 2. Instrução Principal (Custo do Ativo) para o Criador (P2P)
                  SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: creatorPubKey,
                    lamports: TOKENS_COST,
                  })
                );

                const latestBlockhash = await connection.getLatestBlockhash("confirmed");
                transaction.recentBlockhash = latestBlockhash.blockhash;
                transaction.feePayer = publicKey;

                const signature = await sendTransaction(transaction, connection);
                console.log("[Invest] Transação enviada. Assinatura:", signature);

                await connection.confirmTransaction({
                  signature,
                  blockhash: latestBlockhash.blockhash,
                  lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                }, "confirmed");

                // 2. Chamar Backend para Debitar Créditos e Registrar no Ledger
                const res = await fetch("/api/invest", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    walletAddress: publicKey.toBase58(),
                    transactionSignature: signature,
                    cryptoAmount: totalSolAmount,
                    quantity: qty,
                    assetId: asset.id,
                  }),
                });

                const data = await res.json();
                if (!res.ok) {
                  throw new Error(data.error || "Falha ao registrar investimento no servidor.");
                }

                // Update local history
                addTransactionRecord({
                  id: Date.now().toString(),
                  type: "USO",
                  amount: "-5 Créditos",
                  hash: signature,
                  date: new Date().toLocaleString("pt-BR"),
                  planId: `Investimento: ${asset.name}`,
                  solAmount: totalSolAmount,
                });

                alert("🎉 Investimento simulado com sucesso!");
                onClose();
              } catch (err: any) {
                console.error("[Invest Error]", err);
                alert(`Falha no investimento: ${err.message}`);
              } finally {
                setIsProcessing(false);
              }
            }}
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-base transition-all duration-300 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 group"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover:animate-pulse" />}
            {isProcessing ? "Processando Blockchain..." : "Confirmar Investimento"}
            {!isProcessing && <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />}
          </button>

          <p className="text-center text-xs text-slate-400">
            Ao investir, você concorda com os Termos da LakeTokeniza e com a natureza simulada deste ativo na Devnet.
          </p>
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
  const [investTarget, setInvestTarget] = useState<AssetItem | null>(null);

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
            price: Number(a.tokenPrice) || Number(a.valuation) / 1000,
            yield: isApproved ? "12.0% a.a." : "Em Análise",
            available: "100%",
            image: a.imageUrl || "bg-slate-700",
            locked: isApproved ? false : true,
            isUserAsset: true,
            ownerWallet: a.ownerWallet,
            status: a.status,
            description: a.description || "Detalhes comerciais deste projeto em fase de estruturação.",
            tokensAvailable: a.marketTokens || 0,
            totalTokens: a.totalTokens || 0,
            valuation: Number(a.valuation) || 0,
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
                {/* Capa do ativo — contêiner de altura fixa, imagem absolutamente posicionada */}
                {asset.image && asset.image.startsWith("https://") ? (
                  <div className="relative w-full h-48 bg-slate-50 flex items-center justify-center overflow-hidden rounded-t-xl border-b border-slate-100 shrink-0">
                    <Image
                      src={asset.image}
                      alt="Asset RWA"
                      fill
                      className="object-contain p-4"
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-slate-900/80 backdrop-blur-sm text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1 border border-white/10 z-10">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Arweave RWA
                    </div>
                  </div>
                ) : (
                  <div className={`h-2 w-full shrink-0 ${asset.image || "bg-slate-700"}`} />
                )}

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
                      onClick={() => {
                        if (!connectedWallet) {
                          alert("Acesso Negado: Conecte sua carteira Web3 para visualizar a tese de investimento.");
                          return;
                        }
                        if (!asset.locked) setInvestTarget(asset);
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                        asset.locked
                          ? "bg-slate-100 text-slate-400 cursor-default"
                          : "bg-gradient-to-r from-slate-900 to-slate-800 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-blue-500/20 flex items-center justify-center gap-1.5"
                      }`}
                    >
                      {asset.locked ? (
                        <span className="flex items-center gap-1.5 justify-center"><Lock className="w-3.5 h-3.5" /> Em Análise</span>
                      ) : (
                        <span className="flex items-center gap-1.5 justify-center"><Zap className="w-3.5 h-3.5" /> Investir</span>
                      )}
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

      {investTarget && (
        <InvestModal
          asset={investTarget}
          onClose={() => setInvestTarget(null)}
        />
      )}
    </div>
  );
}
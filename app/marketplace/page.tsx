"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, TrendingUp, Briefcase, Trash2, Loader2, AlertTriangle, ShieldCheck, X, Zap, Coins, Lock, ChevronRight } from "lucide-react";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import Image from "next/image";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { useMedals } from "@/context/medals-context";
import { useDict, useLocale } from "@/lib/i18n/client";

const DEMO_IDS = ["demo-1", "demo-2"] as const;

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
  const dict = useDict();
  const t = dict.marketplace;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-in zoom-in-95 fade-in duration-200">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 text-center mb-2">{t.deleteTitle}</h3>
        <p className="text-slate-500 text-center text-sm mb-2">
          {t.deleteConfirm}
        </p>
        <p className="text-center font-semibold text-slate-800 mb-6">&quot;{assetName}&quot;</p>
        <p className="text-xs text-red-500 text-center mb-6 font-medium">
          {t.deleteWarn}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {t.keep}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isDeleting ? t.deleting : t.yesDelete}
          </button>
        </div>
      </div>
    </div>
  );
}

function InvestModal({ asset, onClose }: { asset: AssetItem; onClose: () => void }) {
  const dict = useDict();
  const { locale } = useLocale();
  const t = dict.marketplace;
  const tokenPriceBRL = asset.price ?? 0;
  const maxQty = asset.tokensAvailable ?? 0;
  const [qty, setQty] = useState(1);

  const RATE_USDC_BRL = 5.10;
  const RATE_SOL_BRL = 850.0;

  const tokenPriceUSDC = (tokenPriceBRL / RATE_USDC_BRL).toFixed(2);
  const tokenPriceSOL = (tokenPriceBRL / RATE_SOL_BRL).toFixed(4);

  const totalBRLValue = qty * tokenPriceBRL;
  const numberLocale = locale === "pt-BR" ? "pt-BR" : "en-US";
  const totalBRL = totalBRLValue.toLocaleString(numberLocale, { style: "currency", currency: "BRL" });
  const totalUSDC = (totalBRLValue / RATE_USDC_BRL).toFixed(2);
  const totalSOL = (totalBRLValue / RATE_SOL_BRL).toFixed(4);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 fade-in duration-200">

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
              <p className="text-white/90 text-xs font-bold uppercase tracking-widest drop-shadow-md">{t.assetRwa}</p>
              <h2 className="text-white text-2xl font-extrabold leading-tight drop-shadow-lg">{asset.name}</h2>
            </div>
            <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white flex items-center gap-1 border border-white/10 z-10">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> {t.arweaveRwa}
            </div>
            <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white transition-colors z-10">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className={`h-24 w-full ${asset.image} flex items-center px-6 justify-between`}>
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{t.assetRwa}</p>
              <h2 className="text-white text-xl font-extrabold">{asset.name}</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wider">{asset.type}</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">{asset.yield ?? t.tag.variableYield}</span>
          </div>

          {asset.description && (
            <section className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">{t.mission}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{asset.description}</p>
            </section>
          )}

          {asset.valuation ? (
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4">
               <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t.valuationLabel}</span>
               <CurrencyDisplay variant="subtextOnly" brlValue={asset.valuation} />
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{t.pricePerToken}</p>
              <p className="text-2xl font-extrabold text-slate-900 leading-none">
                {tokenPriceBRL.toLocaleString(numberLocale, { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                ~ {tokenPriceUSDC} USDC | ~ {tokenPriceSOL} SOL
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-center">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{t.inventory}</p>
              <p className="text-sm text-slate-700 mt-2">
                {t.availableOf
                  .replace("{avail}", String(asset.tokensAvailable?.toLocaleString() || "100%"))
                  .replace("{total}", String(asset.totalTokens?.toLocaleString() || "100%"))}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">{t.tokenQty}</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors text-lg flex items-center justify-center">−</button>
              <span className="flex-1 text-center text-2xl font-extrabold text-slate-900">{qty}</span>
              <button disabled={qty >= maxQty} onClick={() => setQty(q => Math.min(maxQty, q + 1))} className={`w-10 h-10 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 transition-colors text-lg flex items-center justify-center ${qty >= maxQty ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100'}`}>+</button>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-end">
              <span className="text-sm text-slate-500 font-medium">{t.estimatedTotal}</span>
              <div className="text-right">
                <span className="block text-2xl font-extrabold text-slate-900 leading-none">{totalBRL}</span>
                <span className="block text-xs text-slate-500 font-medium mt-1">
                  ~ {totalUSDC} USDC | ~ {totalSOL} SOL
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-violet-100 rounded-xl shrink-0">
              <Coins className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-violet-800">{t.feeTitle}</p>
              <p className="text-xs text-violet-600 mt-0.5">{t.feeDesc}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-2xl font-extrabold text-violet-700">5</p>
              <p className="text-[10px] text-violet-500 font-bold uppercase">{t.creditsLabel}</p>
            </div>
          </div>

          <button
            onClick={() => alert(t.mockAlert)}
            className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-base transition-all duration-300 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 group"
          >
            <Zap className="w-5 h-5 group-hover:animate-pulse" />
            {t.confirmInvest}
            <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-xs text-slate-400">
            {t.terms}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Marketplace() {
  const { publicKey } = useSolanaWallet();
  const connectedWallet = publicKey?.toBase58() ?? null;
  const { award } = useMedals();
  const dict = useDict();
  const t = dict.marketplace;

  const DEMO_ASSETS: AssetItem[] = [
    { id: DEMO_IDS[0], name: t.demoBuilding, type: t.demoBuildingType, price: 1200, yield: `12.5% ${t.perAnnum}`, available: "45%", image: "bg-blue-900", locked: false, isDemo: true, ownerWallet: null },
    { id: DEMO_IDS[1], name: t.demoSolar, type: t.demoSolarType, price: 850, yield: `14.2% ${t.perAnnum}`, available: "12%", image: "bg-amber-600", locked: false, isDemo: true, ownerWallet: null },
  ];

  const [activeFilter, setActiveFilter] = useState<"all" | "mine">("all");
  const [assets, setAssets] = useState<AssetItem[]>(DEMO_ASSETS);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<AssetItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [investTarget, setInvestTarget] = useState<AssetItem | null>(null);

  useEffect(() => {
    if (investTarget) {
      void award("asset_browsed");
    }
  }, [investTarget, award]);

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
            yield: isApproved ? t.defaultYield : t.yieldReview,
            available: "100%",
            image: a.imageUrl || "bg-slate-700",
            locked: isApproved ? false : true,
            isUserAsset: true,
            ownerWallet: a.ownerWallet,
            status: a.status,
            description: a.description || t.assetUnderReview,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedWallet, t.defaultYield, t.yieldReview, t.assetUnderReview]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !connectedWallet) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/assets/${deleteTarget.id}?wallet=${encodeURIComponent(connectedWallet)}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error");

      setAssets(prev => prev.filter(a => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: any) {
      alert(`❌ ${e.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleForceApproval = async (assetId: string) => {
    if (!connectedWallet) return;
    try {
      const res = await fetch(`/api/assets/${assetId}?wallet=${encodeURIComponent(connectedWallet)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");

      setAssets(prev =>
        prev.map(a =>
          a.id === assetId
            ? { ...a, status: "APPROVED", locked: false, yield: t.defaultYield }
            : a
        )
      );
    } catch (e: any) {
      alert(`❌ ${e.message}`);
    }
  };

  const filteredAssets = assets
    .filter(a => {
      if (activeFilter === "mine") return a.ownerWallet === connectedWallet;
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
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 px-6">
        <h1 className="text-3xl font-bold">{t.pageTitle}</h1>
        <p className="text-slate-500 mt-1 text-sm">{t.pageSubtitle}</p>
      </div>

      <div className="sticky top-20 z-30 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 py-4 px-6 flex flex-wrap justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {(["all", "mine"] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeFilter === f
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white border border-slate-200 hover:border-slate-400"
              }`}
            >
              {f === "all" ? t.filterAll : t.filterMine}
              {f === "mine" && connectedWallet && (
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
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {isLoadingAssets ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            <span className="ml-3 text-slate-500">{t.loading}</span>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-24">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium">{t.empty}</p>
            {activeFilter === "mine" && (
              <p className="text-slate-400 text-sm mt-1">{t.emptyMine}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredAssets.map(asset => (
              <div
                key={asset.id}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
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
                      {t.arweaveRwa}
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
                            {t.statusActive}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                            {t.statusReview}
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-green-50 text-green-700 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          {t.statusActive}
                        </span>
                      )}

                      {isMyAsset(asset) && !asset.isDemo && (
                        <button
                          onClick={() => setDeleteTarget(asset)}
                          title={t.cancelSimTitle}
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
                        {t.manageAsset}
                      </Link>
                    ) : (
                      <div className="flex gap-2">
                        <Link
                          href={`/manage/${asset.id}`}
                          className="flex-grow py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-bold text-sm text-center transition-all shadow-md flex items-center justify-center"
                        >
                          {t.manageDev}
                        </Link>
                        <button
                          onClick={() => handleForceApproval(asset.id)}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                          title={t.approveTitle}
                        >
                          {t.approve}
                        </button>
                      </div>
                    )
                  ) : (
                    <button
                      disabled={asset.locked}
                      onClick={() => {
                        if (!connectedWallet) {
                          alert(t.connectAlert);
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
                        <span className="flex items-center gap-1.5 justify-center"><Lock className="w-3.5 h-3.5" /> {t.analysis}</span>
                      ) : (
                        <span className="flex items-center gap-1.5 justify-center"><Zap className="w-3.5 h-3.5" /> {t.invest}</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

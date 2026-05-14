"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { ShieldCheck, Copy, ExternalLink, Loader2, Wallet, TrendingUp, TrendingDown, Store, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useRouter } from "next/navigation";

export default function InvestorDashboard() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [createdAssets, setCreatedAssets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"investimentos" | "emissoes">("investimentos");
  const [isLoading, setIsLoading] = useState(true);
  
  // Oracle States
  const [solPriceBRL, setSolPriceBRL] = useState<number | null>(null);
  const [solPriceUSD, setSolPriceUSD] = useState<number | null>(null);

  // Modal States
  const [isListingId, setIsListingId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [resaleQty, setResaleQty] = useState<number>(1);
  const [resalePrice, setResalePrice] = useState<number>(0);

  useEffect(() => {
    const fetchOracle = async () => {
      try {
        const res = await fetch("https://economia.awesomeapi.com.br/json/last/SOL-BRL,SOL-USD");
        const data = await res.json();
        setSolPriceBRL(parseFloat(data.SOLBRL.ask));
        setSolPriceUSD(parseFloat(data.SOLUSD.ask));
      } catch (err) {
        console.error("Erro no oráculo AwesomeAPI:", err);
      }
    };
    fetchOracle();
  }, []);

  const fetchReceipts = async () => {
    if (!publicKey) return;
    try {
      const res = await fetch(`/api/investor/receipts?wallet=${publicKey.toBase58()}`);
      const data = await res.json();
      if (data.receipts) {
        setReceipts(data.receipts);
      }
    } catch (err) {
      console.error("Erro ao buscar recibos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrimaryAssets = async () => {
    if (!publicKey) return;
    try {
      const res = await fetch("/api/assets");
      const data = await res.json();
      if (data.assets) {
        setCreatedAssets(data.assets.filter((a: any) => a.ownerWallet === publicKey.toBase58()));
      }
    } catch (err) {
      console.error("Erro ao buscar ativos:", err);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchReceipts();
      fetchPrimaryAssets();
    } else {
      setIsLoading(false);
    }
  }, [publicKey]);

  const handleDeleteAsset = async (asset: any) => {
    if (!window.confirm(`Tem certeza que deseja excluir '${asset.name}'?`)) return;
    try {
      const res = await fetch(`/api/assets/${asset.id}?wallet=${publicKey?.toBase58()}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir");
      fetchPrimaryAssets();
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  const handleForceApproval = async (id: string) => {
    if (!window.confirm("Deseja aprovar e publicar este ativo no mercado primário?")) return;
    try {
      const res = await fetch(`/api/assets/${id}?wallet=${publicKey?.toBase58()}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      if (!res.ok) throw new Error("Falha ao aprovar");
      alert("Ativo Aprovado com Sucesso!");
      fetchPrimaryAssets();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Hash copiado para a área de transferência!");
  };

  const openResaleModal = (receipt: any) => {
    setSelectedReceipt(receipt);
    setResaleQty(receipt.quantity);
    setResalePrice(Number(receipt.asset?.tokenPrice || 0));
  };

  const closeResaleModal = () => {
    setSelectedReceipt(null);
    setResaleQty(1);
    setResalePrice(0);
  };

  const executeListing = async () => {
    if (!publicKey || !selectedReceipt) return;
    if (!solPriceUSD) {
      alert("Aguarde a conexão com o oráculo de preços.");
      return;
    }

    if (resaleQty <= 0 || resaleQty > selectedReceipt.quantity) {
      alert("Quantidade inválida.");
      return;
    }

    if (resalePrice <= 0) {
      alert("Defina um preço válido.");
      return;
    }

    setIsListingId(selectedReceipt.id);
    try {
      // 1. Cobrar Taxa da Rede na Phantom ($0.50 USD)
      const exactFeeSol = 0.50 / solPriceUSD;
      const safeFeeSol = exactFeeSol * 1.01; // 1% buffer
      const LISTING_FEE = Math.floor(safeFeeSol * LAMPORTS_PER_SOL);

      const treasuryPubKey = new PublicKey(
        process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS || "CXqfj7vFFrpBMVaj8fuyQkGwFgHktdyYVDju723hnmWa"
      );

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubKey,
          lamports: LISTING_FEE,
        })
      );

      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      console.log("[Resale] Transação enviada. Assinatura:", signature);

      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }, "confirmed");

      // 2. Chamar Rota Backend para debitar 5 Créditos e mudar status
      const res = await fetch("/api/invest/list-resale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          transactionSignature: signature,
          cryptoAmount: safeFeeSol,
          receiptId: selectedReceipt.id,
          resaleQty: Number(resaleQty),
          resalePrice: Number(resalePrice)
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao registrar listamento no servidor.");
      }

      alert("Ativo listado no mercado secundário com sucesso!");
      closeResaleModal();
      fetchReceipts(); // Recarregar a lista
      router.refresh(); // Sync Header


    } catch (err: any) {
      console.error("[Resale Error]", err);
      alert(`Falha no listamento: ${err.message}`);
    } finally {
      setIsListingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-indigo-600" />
            Meu Portfólio
          </h1>
          <p className="text-slate-500 mt-2">
            Acompanhe seus ativos e frações RWA com Marcação a Mercado em tempo real.
          </p>
        </div>

        {publicKey && !isLoading && (
          <div className="flex gap-4 border-b border-slate-200 mb-8">
            <button
              onClick={() => setActiveTab("investimentos")}
              className={`pb-4 px-2 font-bold transition-all border-b-2 ${
                activeTab === "investimentos" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Meus Investimentos
            </button>
            <button
              onClick={() => setActiveTab("emissoes")}
              className={`pb-4 px-2 font-bold transition-all border-b-2 ${
                activeTab === "emissoes" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Minhas Emissões
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : !publicKey ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Conecte sua carteira</h2>
            <p className="text-slate-500">Conecte sua carteira Solana para visualizar seus investimentos.</p>
          </div>
        ) : activeTab === "investimentos" ? (
          receipts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-200">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Nenhum investimento encontrado</h2>
            <p className="text-slate-500 mb-6">Você ainda não adquiriu frações de ativos na LakeTokeniza.</p>
            <Link href="/marketplace" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
              Explorar Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {receipts.map((receipt) => {
              const historicSol = Number(receipt.amountPaidCrypto);
              const currentBRL = solPriceBRL ? historicSol * solPriceBRL : null;
              const currentUSD = solPriceUSD ? historicSol * solPriceUSD : null;

              const originalTokenPriceBRL = Number(receipt.asset?.tokenPrice || 0);
              const historicTotalBRL = receipt.quantity * originalTokenPriceBRL;
              
              const isProfit = currentBRL ? currentBRL > historicTotalBRL : null;
              const isLoss = currentBRL ? currentBRL < historicTotalBRL : null;

              return (
                <div key={receipt.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col xl:flex-row gap-6 items-start xl:items-center relative overflow-hidden">
                  
                  {/* Status Ribbon */}
                  {receipt.status === "LISTED_FOR_SALE" && (
                    <div className="absolute -right-12 top-6 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-12 rotate-45 shadow-sm z-10">
                      Listado (Venda)
                    </div>
                  )}

                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {receipt.asset?.type || "RWA"}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Comprado em {new Date(receipt.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                      {receipt.asset?.name || "Ativo Desconhecido"}
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Quantidade</p>
                        <p className="font-extrabold text-slate-800 text-lg">{receipt.quantity} <span className="text-xs font-medium text-slate-500">Tokens</span></p>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Pago Histórico (SOL)</p>
                        <p className="font-extrabold text-slate-800 text-lg">{historicSol.toFixed(4)} <span className="text-xs font-medium text-slate-500">SOL</span></p>
                      </div>

                      <div className={`p-3 rounded-lg border ${isProfit ? 'bg-emerald-50 border-emerald-100' : isLoss ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'} col-span-2 md:col-span-2 relative`}>
                        <div className="absolute right-3 top-3">
                          {isProfit ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : isLoss ? <TrendingDown className="w-5 h-5 text-rose-500" /> : null}
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Valor Atual (Marcação a Mercado)</p>
                        {currentBRL && currentUSD ? (
                          <>
                            <p className="font-extrabold text-slate-900 text-lg">{currentBRL.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                            <p className="text-xs font-medium text-slate-500">~ {currentUSD.toLocaleString("en-US", { style: "currency", currency: "USD" })} USD</p>
                          </>
                        ) : (
                          <p className="font-extrabold text-slate-400 text-sm mt-2">Cotação Indisponível</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full xl:w-auto flex flex-col gap-3 min-w-[300px]">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        Recibo Criptográfico
                      </p>
                      <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg">
                        <span className="text-xs font-mono text-slate-600 truncate flex-1" title={receipt.child_fraction_hash}>
                          {receipt.child_fraction_hash.substring(0, 16)}...{receipt.child_fraction_hash.substring(receipt.child_fraction_hash.length - 8)}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(receipt.child_fraction_hash)}
                          className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
                          title="Copiar Hash"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-3 text-right">
                        <a 
                          href={`https://solscan.io/tx/${receipt.txHash}?cluster=devnet`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[11px] text-indigo-600 font-bold flex items-center justify-end gap-1 hover:underline"
                        >
                          Ver transação <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Botão Secundário */}
                    {receipt.status === "HELD" && (
                      <button 
                        onClick={() => openResaleModal(receipt)}
                        className="w-full py-3 bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 text-white font-extrabold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Store className="w-4 h-4" />
                        Colocar à Venda
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )
        ) : activeTab === "emissoes" ? (
          createdAssets.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-200">
              <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">Nenhuma emissão encontrada</h2>
              <p className="text-slate-500 mb-6">Você ainda não tokenizou nenhum ativo.</p>
              <Link href="/tokenize" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                Tokenizar Ativo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {createdAssets.map((asset) => (
                <div key={asset.id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                  {asset.image && asset.image.startsWith("https://") ? (
                    <div className="relative w-full h-48 bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100">
                      <img src={asset.image} alt="Asset" className="object-contain w-full h-full p-4" />
                      {!asset.isDemo && (
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            onClick={() => handleDeleteAsset(asset)}
                            title="Excluir Ativo"
                            className="p-2 rounded-lg bg-white/90 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`relative h-2 w-full shrink-0 ${asset.image || "bg-slate-700"}`}>
                      {!asset.isDemo && (
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            onClick={() => handleDeleteAsset(asset)}
                            title="Excluir Ativo"
                            className="p-2 rounded-lg bg-white/90 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-1 truncate">{asset.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-4">{asset.type}</p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div><p className="text-[10px] text-slate-400 font-bold uppercase">Preço</p><p className="font-extrabold text-slate-900">{(asset.tokenPrice ? Number(asset.tokenPrice) : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p></div>
                      <div><p className="text-[10px] text-slate-400 font-bold uppercase">Rendimento</p><p className="font-extrabold text-emerald-600">8.5% a.a.</p></div>
                    </div>
                    <div className="mt-auto">
                      {asset.status === "APPROVED" || asset.status === "ACTIVE" || asset.status === "TOKENIZED" ? (
                        <Link href={`/dashboard/manage/${asset.id}`} className="w-full block text-center py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">
                          Gerenciar Ativo
                        </Link>
                      ) : (
                        <div className="flex gap-2">
                          <Link href={`/dashboard/manage/${asset.id}`} className="flex-1 block text-center py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">
                            Gerenciar
                          </Link>
                          <button
                            onClick={() => handleForceApproval(asset.id)}
                            className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm transition-colors shadow-sm flex-1"
                          >
                            Aprovar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : null}
      </main>

      {/* Modal de Revenda */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={closeResaleModal} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Venda no Secundário</h2>
            <p className="text-slate-500 text-sm mb-6">
              Você pode vender o seu lote inteiro ou fracioná-lo. Defina a quantidade e o preço unitário.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Quantidade para Venda</label>
                <div className="flex items-center">
                  <input 
                    type="number" 
                    min={1} 
                    max={selectedReceipt.quantity} 
                    value={resaleQty}
                    onChange={(e) => setResaleQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <span className="ml-3 text-sm text-slate-500 font-medium">/ {selectedReceipt.quantity} max</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Preço Unitário (BRL)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 font-bold">R$</span>
                  <input 
                    type="number" 
                    min={0.01} 
                    step={0.01}
                    value={resalePrice}
                    onChange={(e) => setResalePrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                <span className="font-bold">Custos de Listagem:</span> Esta operação consumirá 5 Créditos Lake e uma taxa de rede de $0.50 USD (convertidos em SOL) da sua carteira.
              </p>
            </div>

            <button
              onClick={executeListing}
              disabled={isListingId === selectedReceipt.id}
              className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              {isListingId === selectedReceipt.id ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>Confirmar Listagem</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

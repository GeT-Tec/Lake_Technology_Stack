"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Copy, Check, Wallet, X, History, ExternalLink, Zap, AlertTriangle } from "lucide-react";
import { useWallet } from "@/context/wallet-context";
import { useCredits } from "@/context/credits-context";

export function Navbar() {
  const pathname = usePathname();
  const { walletAddress, connectWallet, disconnectWallet } = useWallet();
  // Usando as funções de controle do histórico direto do Contexto
  const { credits, buyCredits, history, isLoading, isHistoryOpen, openHistory, closeHistory } = useCredits();

  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Aprenda", href: "/learn" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Tokenizar", href: "/tokenize" },
  ];

  const handleConnect = () => setIsWalletOpen(true);
  const executeConnect = async () => { await connectWallet(); setIsWalletOpen(false); };
  const copyAddr = () => { navigator.clipboard.writeText(walletAddress!); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  // Fecha menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Lógica opcional de fechar dropdowns
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900 tracking-tighter leading-none">LAKE<span className="text-blue-700">TOKENIZA</span></span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase">RWA Protocol</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={`text-sm font-medium hover:text-blue-700 ${pathname === item.href ? "text-blue-700 font-bold" : "text-slate-600"}`}>{item.name}</Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* BOTÃO DE CRÉDITOS (Ao clicar, abre o histórico) */}
            {walletAddress && (
              <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200 transition-all" onClick={openHistory}>
                <Zap className={`w-4 h-4 ${credits > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                <span className="text-sm font-bold text-slate-900">{credits}</span>
                {/* Botãozinho de + para comprar direto */}
                <button onClick={(e) => { e.stopPropagation(); buyCredits(); }} disabled={isLoading} className="ml-2 bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded hover:bg-blue-700 text-xs" title="Recarregar">+</button>
              </div>
            )}

            {/* BOTÃO DA CARTEIRA */}
            <button onClick={handleConnect} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold shadow-lg transition-all ${walletAddress ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-slate-900 text-white hover:bg-blue-900'}`}>
              {walletAddress ? (
                <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}</>
              ) : "Conectar Carteira"}
            </button>
          </div>
        </div>
      </nav>

      {/* MODAL CARTEIRA */}
      {isWalletOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Sua Carteira</h3>
              <button onClick={() => setIsWalletOpen(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="p-4 space-y-4">
              {!walletAddress ? (
                <button onClick={executeConnect} className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-500 transition-all group">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center"><Wallet className="text-orange-600 w-6 h-6" /></div>
                  <div className="text-left"><p className="font-bold text-slate-700 group-hover:text-blue-700">Browser Wallet</p><p className="text-xs text-slate-500">Rabby / MetaMask</p></div>
                </button>
              ) : (
                <>
                  <div className="text-center py-4 bg-slate-50 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">{walletAddress.substring(2, 4).toUpperCase()}</div>
                    <p className="font-mono text-xs text-slate-600 bg-white px-2 py-1 rounded inline-block border">{walletAddress}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={openHistory} className="p-3 border rounded-lg hover:bg-slate-50 flex flex-col items-center gap-1 text-xs font-bold text-slate-700"><History className="w-4 h-4" /> Histórico</button>
                    <button onClick={() => { disconnectWallet(); setIsWalletOpen(false); }} className="p-3 border rounded-lg hover:bg-red-50 flex flex-col items-center gap-1 text-xs font-bold text-red-600"><LogOut className="w-4 h-4" /> Sair</button>
                  </div>
                  <p className="text-[10px] text-center text-slate-400">Para trocar de conta, altere na extensão.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTÓRICO (SIDEBAR) */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/20 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg flex items-center gap-2"><History className="w-5 h-5 text-blue-600" /> Histórico Financeiro</h3>
              <button onClick={closeHistory}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
            </div>

            {/* LISTA DE TRANSAÇÕES */}
            <div className="flex-1 overflow-y-auto p-0">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <History className="w-12 h-12 mb-2 opacity-20" />
                  <p>Nenhuma transação registrada.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {history.map((tx) => (
                    <div key={tx.id} className="p-5 hover:bg-slate-50 transition-colors flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${tx.type === 'COMPRA' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{tx.type}</span>
                          <span className="text-xs text-slate-400">{tx.date}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono truncate w-32 opacity-70">{tx.hash}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${tx.type === 'COMPRA' ? 'text-green-600' : 'text-slate-700'}`}>{tx.amount}</p>
                        {tx.hash && tx.type === 'COMPRA' && (
                          <a href={`https://sepolia.etherscan.io/tx/${tx.hash}`} target="_blank" className="text-[10px] text-blue-500 hover:underline flex justify-end gap-1 items-center mt-1">
                            Blockchain <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {tx.type === 'USO' && <span className="text-[10px] text-slate-400 block mt-1">Assinatura LakeZero</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-slate-50">
              <button onClick={buyCredits} disabled={isLoading} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-900 shadow-lg flex justify-center gap-2">
                {isLoading ? "Processando..." : "Comprar Mais Créditos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

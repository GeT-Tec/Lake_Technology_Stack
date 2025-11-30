// ARQUIVO: components/ChangeWalletModal.tsx
'use client';

import { X, ShieldAlert, RefreshCw } from 'lucide-react'; // Certifique-se de ter lucide-react instalado

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangeWalletModal({ isOpen, onClose }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">

                {/* Botão Fechar */}
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <X size={20} />
                </button>

                {/* Cabeçalho */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-amber-500/10 rounded-full">
                        <ShieldAlert className="text-amber-500" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Troca de Identidade</h2>
                </div>

                {/* Corpo Instrucional */}
                <div className="space-y-4 text-slate-300 text-sm">
                    <p>
                        Por protocolos de segurança da Web3, a aplicação não pode forçar o fechamento da sua Carteira (Extension) remotamente.
                    </p>

                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                        <h3 className="text-emerald-500 font-bold mb-2 uppercase text-xs tracking-widest">Protocolo Manual:</h3>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Abra a extensão da sua carteira (Rabby/MetaMask).</li>
                            <li>Clique na opção <span className="text-white font-bold">"Desconectar este site"</span> ou <span className="text-white font-bold">"Lock"</span>.</li>
                            <li>Recarregue esta página (F5).</li>
                        </ol>
                    </div>

                    <p className="text-xs text-slate-500">
                        Recomendação DevSecOps: Para alternar entre múltiplas identidades, utilize Perfis de Navegador distintos ou janelas anônimas.
                    </p>
                </div>

                {/* Ação */}
                <div className="mt-6">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded flex items-center justify-center gap-2 transition-all"
                    >
                        <RefreshCw size={18} />
                        Entendido, Recarregar Página
                    </button>
                </div>

            </div>
        </div>
    );
}

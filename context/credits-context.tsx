"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallet } from "./wallet-context";

// Treasury wallet for receiving payments
const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET || "0xa56d035c92B479c49Be359496564a8A598716ec4";

// Credit Plans Configuration
export interface CreditPlan {
    id: string;
    name: string;
    credits: number;
    priceEth: string;      // Price in ETH (hex format for transaction)
    priceEthDisplay: string; // Price in ETH (display format)
    priceUsdt: string;     // Price in USDT (display only)
    popular?: boolean;
}

export const CREDIT_PLANS: CreditPlan[] = [
    {
        id: "trial",
        name: "Trial",
        credits: 5,
        priceEth: "0x6C6B935B8BBD4000", // ~0.00012 ETH
        priceEthDisplay: "0.00012",
        priceUsdt: "~$0.35"
    },
    {
        id: "starter",
        name: "Starter",
        credits: 10,
        priceEth: "0x1550F7DCA70000", // ~0.00038 ETH
        priceEthDisplay: "0.00038",
        priceUsdt: "~$1.15"
    },
    {
        id: "pro",
        name: "Pro",
        credits: 50,
        priceEth: "0x20C855D7F50000", // ~0.00058 ETH
        priceEthDisplay: "0.00058",
        priceUsdt: "~$1.75",
        popular: true
    },
    {
        id: "expert",
        name: "Expert",
        credits: 100,
        priceEth: "0x41C2141C148000", // ~0.00116 ETH
        priceEthDisplay: "0.00116",
        priceUsdt: "~$3.00"
    }
];

type TransactionType = "COMPRA" | "USO";

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: string;
    hash?: string;
    date: string;
    planId?: string;
}

interface CreditsContextType {
    credits: number;
    buyCredits: (plan: CreditPlan) => Promise<boolean>;
    spendCredit: () => Promise<boolean>;
    isLoading: boolean;
    history: Transaction[];
    openHistory: () => void;
    isHistoryOpen: boolean;
    closeHistory: () => void;
    refreshCredits: () => Promise<void>;
    // Modal controls
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: ReactNode }) {
    const { walletAddress, isConnected } = useWallet();
    const [credits, setCredits] = useState(0);
    const [history, setHistory] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch credits from database when wallet connects
    const refreshCredits = async () => {
        if (!walletAddress || !isConnected) {
            setCredits(0);
            return;
        }

        try {
            const response = await fetch(`/api/users/credits?wallet=${walletAddress}`);
            const data = await response.json();

            if (response.ok) {
                setCredits(data.credits || 0);
                console.log(`✅ Créditos carregados do banco: ${data.credits}`);
            } else {
                console.error("Erro ao carregar créditos:", data.error);
            }
        } catch (error) {
            console.error("Erro ao buscar créditos:", error);
        }
    };

    // Load credits from database when wallet connects
    useEffect(() => {
        refreshCredits();

        // Also load history from localStorage (fallback)
        if (walletAddress) {
            const savedHistory = localStorage.getItem(`history_${walletAddress}`);
            setHistory(savedHistory ? JSON.parse(savedHistory) : []);
        } else {
            setHistory([]);
        }
    }, [walletAddress, isConnected]);

    const saveHistoryToLocal = (newHistory: Transaction[]) => {
        setHistory(newHistory);
        if (walletAddress) {
            localStorage.setItem(`history_${walletAddress}`, JSON.stringify(newHistory));
        }
    };

    /**
     * Compra créditos com base no plano selecionado
     * @param plan - Plano de créditos selecionado
     * @returns true se a compra foi bem-sucedida
     */
    const buyCredits = async (plan: CreditPlan): Promise<boolean> => {
        if (!walletAddress) {
            alert("Conecte sua carteira primeiro.");
            return false;
        }

        setIsLoading(true);

        try {
            if (typeof window !== "undefined" && (window as any).ethereum) {
                console.log(`🛒 Iniciando compra: ${plan.name} (${plan.credits} créditos)`);

                // Execute blockchain transaction to Treasury Wallet
                const txHash = await (window as any).ethereum.request({
                    method: "eth_sendTransaction",
                    params: [{
                        from: walletAddress,
                        to: TREASURY_WALLET,
                        value: plan.priceEth
                    }]
                });

                console.log(`📤 Transação enviada: ${txHash}`);

                // Add credits via API (with audit log)
                const response = await fetch('/api/users/credits', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        walletAddress,
                        amount: plan.credits,
                        planId: plan.id,
                        txHash: txHash
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    setCredits(data.credits);

                    const newTx: Transaction = {
                        id: Date.now().toString(),
                        type: "COMPRA",
                        amount: `+${plan.credits} Créditos`,
                        hash: txHash,
                        date: new Date().toLocaleString('pt-BR'),
                        planId: plan.id
                    };

                    saveHistoryToLocal([newTx, ...history]);
                    setIsModalOpen(false);

                    console.log(`✅ Compra realizada! Novo saldo: ${data.credits}`);
                    alert(`✅ Compra realizada! Você agora tem ${data.credits} créditos.`);

                    return true;
                } else {
                    throw new Error(data.error || "Erro ao adicionar créditos");
                }
            } else {
                alert("Carteira Web3 não detectada. Instale MetaMask ou Rabby.");
                return false;
            }
        } catch (error: any) {
            console.error("Erro na compra de créditos:", error);

            if (error.code === 4001) {
                alert("Transação cancelada pelo usuário.");
            } else {
                alert("Compra cancelada ou falhou. Tente novamente.");
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Gasta 1 crédito para usar funcionalidade paga
     * @returns true se o crédito foi debitado com sucesso
     */
    const spendCredit = async (): Promise<boolean> => {
        if (!walletAddress) {
            alert("Conecte sua carteira primeiro.");
            return false;
        }

        if (credits <= 0) {
            alert("Saldo insuficiente. Compre mais créditos.");
            setIsModalOpen(true); // Open modal to buy credits
            return false;
        }

        setIsLoading(true);

        try {
            // Spend credit via API
            const response = await fetch('/api/users/credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress,
                    amount: 1
                })
            });

            const data = await response.json();

            if (response.ok) {
                setCredits(data.credits);

                const newTx: Transaction = {
                    id: Date.now().toString(),
                    type: "USO",
                    amount: "-1 Crédito",
                    hash: "LZ-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    date: new Date().toLocaleString('pt-BR')
                };

                saveHistoryToLocal([newTx, ...history]);
                console.log(`✅ Crédito gasto. Saldo: ${data.credits}`);
                return true;
            } else {
                alert(data.error || "Erro ao gastar crédito");
                return false;
            }
        } catch (error) {
            console.error("Erro ao gastar crédito:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CreditsContext.Provider value={{
            credits,
            buyCredits,
            spendCredit,
            isLoading,
            history,
            isHistoryOpen,
            openHistory: () => setIsHistoryOpen(true),
            closeHistory: () => setIsHistoryOpen(false),
            refreshCredits,
            // Modal controls
            isModalOpen,
            openModal: () => setIsModalOpen(true),
            closeModal: () => setIsModalOpen(false)
        }}>
            {children}
        </CreditsContext.Provider>
    );
}

export function useCredits() {
    const context = useContext(CreditsContext);
    if (!context) throw new Error("useCredits must be used within CreditsProvider");
    return context;
}

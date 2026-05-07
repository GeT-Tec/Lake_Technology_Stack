"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Credit Plans Configuration
export interface CreditPlan {
    id: string;
    name: string;
    credits: number;
    priceUSD: number;          // Base price in USD
    priceEth: string;          // Keeping the prop name to not break UI, but this is irrelevant now
    priceEthDisplay: string;   // Keeping prop name
    priceUsdt: string;         // Price in USDT (display only)
    popular?: boolean;
}

export const CREDIT_PLANS: CreditPlan[] = [
    {
        id: "trial",
        name: "Trial",
        credits: 5,
        priceUSD: 0.35,
        priceEth: "0x6C6B935B8BBD4000",
        priceEthDisplay: "0.00012",
        priceUsdt: "~$0.35"
    },
    {
        id: "starter",
        name: "Starter",
        credits: 10,
        priceUSD: 1.15,
        priceEth: "0x1550F7DCA70000",
        priceEthDisplay: "0.00038",
        priceUsdt: "~$1.15"
    },
    {
        id: "pro",
        name: "Pro",
        credits: 50,
        priceUSD: 1.75,
        priceEth: "0x20C855D7F50000",
        priceEthDisplay: "0.00058",
        priceUsdt: "~$1.75",
        popular: true
    },
    {
        id: "expert",
        name: "Expert",
        credits: 100,
        priceUSD: 3.50,
        priceEth: "0x51DAC207A00000",
        priceEthDisplay: "0.00117",
        priceUsdt: "~$3.50"
    }
];

type TransactionType = "COMPRA" | "USO";

export interface TransactionRecord {
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
    history: TransactionRecord[];
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
    const { publicKey, connected, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const walletAddress = publicKey?.toBase58();
    
    const [credits, setCredits] = useState(0);
    const [history, setHistory] = useState<TransactionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch credits from database when wallet connects
    const refreshCredits = async () => {
        if (!walletAddress || !connected) {
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
    }, [walletAddress, connected]);

    const saveHistoryToLocal = (newHistory: TransactionRecord[]) => {
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
        if (!publicKey || !walletAddress) {
            alert("Conecte sua carteira primeiro.");
            return false;
        }

        setIsLoading(true);

        try {
            console.log(`🛒 Iniciando compra: ${plan.name} (${plan.credits} créditos)`);
            
            if (!process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS) {
                throw new Error("Wallet de destino não configurada");
            }

            const MOCK_SOL_PRICE_USD = 150;
            const solAmount = plan.priceUSD / MOCK_SOL_PRICE_USD;
            const lamportsAmount = Math.round(solAmount * LAMPORTS_PER_SOL);

            // TODO: Implementar lógica de 'Gasless Transaction' (Fee Payer) para contas novas com 0 SOL no futuro.
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS),
                    lamports: lamportsAmount,
                })
            );

            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            // Execute blockchain transaction to Treasury Wallet
            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            }, 'confirmed');

            const txHash = signature;
            console.log(`📤 Transação confirmada: ${txHash}`);

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

                const newTx: TransactionRecord = {
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
        } catch (error: any) {
            console.error("Erro na compra de créditos:", error);
            alert("Compra cancelada ou falhou. Tente novamente.");
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

                const newTx: TransactionRecord = {
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

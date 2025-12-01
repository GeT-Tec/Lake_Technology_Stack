"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallet } from "./wallet-context";

const TREASURY_WALLET = "0xa56d035c92B479c49Be359496564a8A598716ec4"; // Sua Wallet
const CREDIT_PACKAGE_PRICE = "0x5AF3107A4000"; // 0.0001 ETH
const CREDITS_PER_PACKAGE = 10; // Pacote de 10 créditos

type TransactionType = "COMPRA" | "USO";

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: string;
    hash?: string;
    date: string;
}

interface CreditsContextType {
    credits: number;
    buyCredits: () => Promise<void>;
    spendCredit: () => Promise<boolean>;
    isLoading: boolean;
    history: Transaction[];
    openHistory: () => void;
    isHistoryOpen: boolean;
    closeHistory: () => void;
    refreshCredits: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: ReactNode }) {
    const { walletAddress, isConnected } = useWallet();
    const [credits, setCredits] = useState(0);
    const [history, setHistory] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

    const buyCredits = async () => {
        if (!walletAddress) return;
        setIsLoading(true);

        try {
            if (typeof window !== "undefined" && (window as any).ethereum) {
                // Execute blockchain transaction
                const txHash = await (window as any).ethereum.request({
                    method: "eth_sendTransaction",
                    params: [{ from: walletAddress, to: TREASURY_WALLET, value: CREDIT_PACKAGE_PRICE }]
                });

                // Add credits via API
                const response = await fetch('/api/users/credits', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        walletAddress,
                        amount: CREDITS_PER_PACKAGE
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    setCredits(data.credits);

                    const newTx: Transaction = {
                        id: Date.now().toString(),
                        type: "COMPRA",
                        amount: `+${CREDITS_PER_PACKAGE} Créditos`,
                        hash: txHash,
                        date: new Date().toLocaleString('pt-BR')
                    };

                    saveHistoryToLocal([newTx, ...history]);
                    setIsHistoryOpen(true);
                    alert(`✅ Compra realizada! Você agora tem ${data.credits} créditos.`);
                } else {
                    throw new Error(data.error || "Erro ao adicionar créditos");
                }
            }
        } catch (error) {
            console.error("Erro na compra de créditos:", error);
            alert("Compra cancelada ou falhou.");
        } finally {
            setIsLoading(false);
        }
    };

    const spendCredit = async () => {
        if (!walletAddress) {
            alert("Conecte sua carteira primeiro.");
            return false;
        }

        if (credits <= 0) {
            alert("Saldo insuficiente.");
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
            refreshCredits
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

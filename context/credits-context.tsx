"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallet } from "./wallet-context";

const TREASURY_WALLET = "0xa56d035c92B479c49Be359496564a8A598716ec4"; // Sua Wallet
const CREDIT_PACKAGE_PRICE = "0x5AF3107A4000"; // 0.0001 ETH
const CREDITS_PER_PACKAGE = 3;

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
    openHistory: () => void; // Nova função para forçar abertura via UI
    isHistoryOpen: boolean;
    closeHistory: () => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: ReactNode }) {
    const { walletAddress } = useWallet();
    const [credits, setCredits] = useState(0);
    const [history, setHistory] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Load initial state
    useEffect(() => {
        if (walletAddress) {
            const savedCredits = localStorage.getItem(`credits_${walletAddress}`);
            const savedHistory = localStorage.getItem(`history_${walletAddress}`);
            setCredits(savedCredits ? parseInt(savedCredits) : 0);
            setHistory(savedHistory ? JSON.parse(savedHistory) : []);
        } else {
            setCredits(0);
            setHistory([]);
        }
    }, [walletAddress]);

    const saveState = (newCredits: number, newHistory: Transaction[]) => {
        setCredits(newCredits);
        setHistory(newHistory);
        if (walletAddress) {
            localStorage.setItem(`credits_${walletAddress}`, newCredits.toString());
            localStorage.setItem(`history_${walletAddress}`, JSON.stringify(newHistory));
        }
    };

    const buyCredits = async () => {
        if (!walletAddress) return;
        setIsLoading(true);
        try {
            if (typeof window !== "undefined" && (window as any).ethereum) {
                const txHash = await (window as any).ethereum.request({
                    method: "eth_sendTransaction",
                    params: [{ from: walletAddress, to: TREASURY_WALLET, value: CREDIT_PACKAGE_PRICE }]
                });

                const newTx: Transaction = {
                    id: Date.now().toString(),
                    type: "COMPRA",
                    amount: `+${CREDITS_PER_PACKAGE} Créditos`,
                    hash: txHash,
                    date: new Date().toLocaleString('pt-BR')
                };

                saveState(credits + CREDITS_PER_PACKAGE, [newTx, ...history]);
                setIsHistoryOpen(true); // Abre o histórico automaticamente após compra
                alert("Compra realizada com sucesso!");
            }
        } catch (error) {
            console.error(error);
            alert("Compra cancelada.");
        } finally {
            setIsLoading(false);
        }
    };

    const spendCredit = async () => {
        if (credits <= 0) { alert("Saldo insuficiente."); return false; }
        setIsLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1000)); // Mock LakeZero Latency
            const newTx: Transaction = {
                id: Date.now().toString(),
                type: "USO",
                amount: "-1 Crédito",
                hash: "LZ-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
                date: new Date().toLocaleString('pt-BR')
            };
            saveState(credits - 1, [newTx, ...history]);
            return true;
        } catch (e) { return false; }
        finally { setIsLoading(false); }
    };

    return (
        <CreditsContext.Provider value={{ credits, buyCredits, spendCredit, isLoading, history, isHistoryOpen, openHistory: () => setIsHistoryOpen(true), closeHistory: () => setIsHistoryOpen(false) }}>
            {children}
        </CreditsContext.Provider>
    );
}

export function useCredits() {
    const context = useContext(CreditsContext);
    if (!context) throw new Error("useCredits error");
    return context;
}

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WalletContextType {
    walletAddress: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    isConnected: boolean;
    walletType: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [walletType, setWalletType] = useState<string | null>(null);

    const detectWallet = () => {
        if (typeof window === "undefined") return null;
        const provider = (window as any).ethereum;
        if (!provider) return null;

        if (provider.isRabby) return "Rabby";
        if (provider.isMetaMask) return "MetaMask";
        if (provider.isTrust) return "Trust Wallet";
        return "Injected Wallet";
    };

    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window !== "undefined" && (window as any).ethereum) {
                try {
                    const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        setWalletType(detectWallet());
                    }
                } catch (error) {
                    console.error("Erro de verificação:", error);
                }
            }
        };
        checkConnection();
    }, []);

    const connectWallet = async () => {
        if (typeof window !== "undefined" && (window as any).ethereum) {
            try {
                // FORÇAR PERMISSÕES (SEGURANÇA)
                await (window as any).ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [{ eth_accounts: {} }]
                });

                const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
                setWalletAddress(accounts[0]);
                setWalletType(detectWallet());

            } catch (error) {
                console.error("Usuário rejeitou conexão:", error);
            }
        } else {
            alert("Nenhuma carteira Web3 detectada. Por favor instale Rabby, MetaMask ou similar.");
            window.open("https://rabby.io", "_blank");
        }
    };

    const disconnectWallet = () => {
        // LIMPEZA TOTAL DE ESTADO
        setWalletAddress(null);
        setWalletType(null);
        // Opcional: Limpar localStorage se houver dados sensíveis de sessão
        // localStorage.removeItem("user_session"); 
    };

    return (
        <WalletContext.Provider value={{ walletAddress, connectWallet, disconnectWallet, isConnected: !!walletAddress, walletType }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}

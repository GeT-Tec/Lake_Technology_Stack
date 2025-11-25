"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

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

    // 1. Variável de controle para saber se devemos conectar
    const STORAGE_KEY = 'lake_wallet_connected_intent';

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
            // A TRAVA DE SEGURANÇA:
            // Primeiro, olhamos no LocalStorage se o usuário DEIXOU a sessão aberta da última vez.
            const userIntendsToConnect = window.localStorage.getItem(STORAGE_KEY) === 'true';

            // Se não tiver a flag 'true', a gente MATA o processo aqui. 
            // Mesmo que a Rabby esteja gritando "Estou conectada!", nós a ignoramos.
            if (!userIntendsToConnect) {
                console.log("Usuário deslogado (Sem intenção de conexão). Ignorando Provider.");
                setWalletAddress(null); // Garante estado limpo
                return;
            }

            // Se passou da trava, aí sim verificamos o provider
            if (typeof window !== "undefined" && (window as any).ethereum) {
                try {
                    const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        setWalletType(detectWallet());
                    } else {
                        // Se o provider não retornou contas, limpamos a flag por segurança
                        window.localStorage.removeItem(STORAGE_KEY);
                    }
                } catch (error) {
                    console.error("Erro ao restaurar conexão:", error);
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

                // GRAVA A INTENÇÃO: "O usuário quer ficar conectado"
                window.localStorage.setItem(STORAGE_KEY, 'true');

            } catch (error) {
                console.error("Usuário rejeitou conexão:", error);
            }
        } else {
            alert("Nenhuma carteira Web3 detectada. Por favor instale Rabby, MetaMask ou similar.");
            window.open("https://rabby.io", "_blank");
        }
    };

    const disconnectWallet = useCallback(() => {
        // 1. Limpa o estado local do React
        setWalletAddress(null);
        setWalletType(null);

        // 2. Limpa o LocalStorage
        if (typeof window !== 'undefined') {
            // REMOVE A INTENÇÃO: "O usuário quer sair"
            window.localStorage.removeItem(STORAGE_KEY);
            window.localStorage.removeItem('walletConnected'); // Limpa legado se existir
            window.localStorage.removeItem('user_session');
        }

        // 3. Tenta revogar permissões
        if ((window as any).ethereum) {
            try {
                (window as any).ethereum.request({
                    method: "wallet_revokePermissions",
                    params: [
                        {
                            eth_accounts: {},
                        },
                    ],
                });
            } catch (e) {
                console.log("Wallet não suporta revogação via API, apenas limpeza local.");
            }
        }

        // 4. Recarrega a página para garantir estado limpo
        window.location.reload();
    }, []);

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

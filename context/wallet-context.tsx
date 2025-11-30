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
        let provider = typeof window !== "undefined" ? (window as any).ethereum : null;

        // RETRY LOGIC: Espera a injeção da extensão (race condition protection)
        if (!provider) {
            console.log("Wallet provider não detectado imediatamente. Aguardando 1000ms...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            provider = typeof window !== "undefined" ? (window as any).ethereum : null;
        }

        // Verificação final: se ainda não existir, alerta o usuário
        if (!provider) {
            alert("Nenhuma carteira Web3 detectada. Por favor instale Rabby, MetaMask ou similar.");
            window.open("https://rabby.io", "_blank");
            return;
        }

        // SUPORTE PARA MÚLTIPLAS INJEÇÕES (Rabby + MetaMask)
        // Se houver múltiplos providers, usa o primeiro disponível
        if (provider.providers && Array.isArray(provider.providers)) {
            console.log("Múltiplas carteiras detectadas:", provider.providers.length);
            provider = provider.providers[0]; // Prioriza o primeiro
        }

        try {
            // FORÇAR PERMISSÕES (SEGURANÇA)
            await provider.request({
                method: "wallet_requestPermissions",
                params: [{ eth_accounts: {} }]
            });

            const accounts = await provider.request({ method: "eth_accounts" });

            if (accounts.length === 0) {
                alert("Nenhuma conta encontrada. Por favor desbloqueie sua carteira.");
                return;
            }

            const userWalletAddress = accounts[0];

            // DATABASE VALIDATION: Register/validate user in Supabase
            try {
                console.log("🔍 Validando usuário no banco de dados...");
                const response = await fetch('/api/users/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ walletAddress: userWalletAddress }),
                });

                if (!response.ok) {
                    throw new Error('Falha na validação do usuário');
                }

                const data = await response.json();
                console.log("✅ Usuário validado no banco de dados:", data.user);

            } catch (dbError) {
                console.error("❌ Erro ao validar usuário no banco:", dbError);
                alert("Erro ao validar usuário no banco de dados. Por favor, tente novamente.");
                return; // Não permite conexão se validação DB falhar
            }

            // Só define como conectado se a validação DB foi bem-sucedida
            setWalletAddress(userWalletAddress);
            setWalletType(detectWallet());

            // GRAVA A INTENÇÃO: "O usuário quer ficar conectado"
            window.localStorage.setItem(STORAGE_KEY, 'true');

        } catch (error) {
            console.error("Erro ao conectar carteira:", error);
            // Não mostra alert se o usuário apenas rejeitou a conexão
            if ((error as any)?.code === 4001) {
                console.log("Usuário rejeitou a conexão");
            } else {
                alert("Erro ao conectar. Por favor tente novamente.");
            }
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

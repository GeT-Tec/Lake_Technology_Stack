"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface WalletContextType {
    walletAddress: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    isConnected: boolean;
    isConnecting: boolean;
    walletType: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [walletType, setWalletType] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    // 1. Variável de controle para saber se devemos conectar
    const STORAGE_KEY = 'lake_wallet_connected_intent';

    // CONSTANTS
    const TARGET_CHAIN_ID = "0xaa36a7"; // Sepolia Testnet (11155111)
    const TARGET_CHAIN_NAME = "Sepolia";

    const detectWallet = () => {
        if (typeof window === "undefined") return null;
        const provider = (window as any).ethereum;
        if (!provider) return null;

        // Check providers array
        if (provider.providers && Array.isArray(provider.providers)) {
            if (provider.providers.some((p: any) => p.isRabby)) return "Rabby";
            if (provider.providers.some((p: any) => p.isMetaMask)) return "MetaMask";
        }

        if (provider.isRabby) return "Rabby";
        if (provider.isMetaMask) return "MetaMask";
        if (provider.isTrust) return "Trust Wallet";
        return "Injected Wallet";
    };

    // EVENTS HANDLERS
    const handleAccountsChanged = useCallback((accounts: string[]) => {
        console.log("🔄 Evento accountsChanged detectado:", accounts);
        if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletType(detectWallet());
            window.localStorage.setItem(STORAGE_KEY, 'true');
        } else {
            // Se o array vier vazio, o usuário desconectou pela carteira
            console.log("Usuário desconectou pela carteira.");
            setWalletAddress(null);
            window.localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    const handleChainChanged = useCallback((chainId: string) => {
        console.log("🔄 Evento chainChanged detectado:", chainId);
        if (chainId !== TARGET_CHAIN_ID) {
            alert(`Você mudou para uma rede incorreta. Por favor, volte para ${TARGET_CHAIN_NAME}.`);
            // Opcional: Forçar refresh ou desconectar
            // window.location.reload(); 
        }
    }, []);

    useEffect(() => {
        const checkConnection = async () => {
            const userIntendsToConnect = window.localStorage.getItem(STORAGE_KEY) === 'true';

            if (!userIntendsToConnect) {
                setWalletAddress(null);
                return;
            }

            if (typeof window !== "undefined" && (window as any).ethereum) {
                try {
                    const provider = (window as any).ethereum;
                    const accounts = await provider.request({ method: "eth_accounts" });

                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                        setWalletType(detectWallet());

                        // Check Chain ID on load
                        const chainId = await provider.request({ method: "eth_chainId" });
                        if (chainId !== TARGET_CHAIN_ID) {
                            console.warn(`Rede incorreta detectada no load: ${chainId}`);
                        }
                    } else {
                        window.localStorage.removeItem(STORAGE_KEY);
                    }
                } catch (error) {
                    console.error("Erro ao restaurar conexão:", error);
                }
            }
        };

        checkConnection();

        // SETUP LISTENERS
        if (typeof window !== "undefined" && (window as any).ethereum) {
            const provider = (window as any).ethereum;
            provider.on('accountsChanged', handleAccountsChanged);
            provider.on('chainChanged', handleChainChanged);

            return () => {
                // Removendo listeners no cleanup
                if (provider.removeListener) {
                    provider.removeListener('accountsChanged', handleAccountsChanged);
                    provider.removeListener('chainChanged', handleChainChanged);
                }
            };
        }

    }, [handleAccountsChanged, handleChainChanged]);

    const getProvider = useCallback(() => {
        if (typeof window === "undefined") return null;
        const ethereum = (window as any).ethereum;
        if (!ethereum) return null;

        if (ethereum.providers && Array.isArray(ethereum.providers)) {
            // Se houver múltiplos providers, tenta encontrar Rabby ou MetaMask
            const rabby = ethereum.providers.find((p: any) => p.isRabby);
            if (rabby) return rabby;

            const metamask = ethereum.providers.find((p: any) => p.isMetaMask);
            if (metamask) return metamask;

            return ethereum.providers[0];
        }

        return ethereum;
    }, []);

    const connectWallet = async () => {
        if (isConnecting) return; // Prevent double clicks
        setIsConnecting(true);

        try {
            let provider = getProvider();

            // RETRY LOGIC: Espera a injeção da extensão (race condition protection)
            if (!provider) {
                console.log("Wallet provider não detectado imediatamente. Aguardando 1000ms...");
                await new Promise(resolve => setTimeout(resolve, 1000));
                provider = getProvider();
            }

            // MOBILE DEEP LINKING (Fallback)
            // Se estiver no mobile e não detectar provider (sem app de wallet browser), invoca o Deep Link
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (!provider && isMobile) {
                console.log("📱 Mobile detectado sem provider. Redirecionando para Deep Link...");

                // Remove protocolo (http/https) para formatar corretamente para o MetaMask
                const currentUrl = window.location.href.replace(/^https?:\/\//, '');
                const deepLink = `https://metamask.app.link/dapp/${currentUrl}`;

                // Redireciona
                window.location.href = deepLink;

                setIsConnecting(false);
                return;
            }

            // Verificação final: se ainda não existir, alerta o usuário (Desktop flow)
            if (!provider) {
                alert("Nenhuma carteira Web3 detectada. Por favor instale Rabby, MetaMask ou similar.");
                window.open("https://rabby.io", "_blank");
                return;
            }

            // 1. GENERIC CONNECTION (Standard EIP-1102)
            const accounts = await provider.request({ method: "eth_requestAccounts" });

            if (accounts.length === 0) {
                alert("Nenhuma conta encontrada. Por favor desbloqueie sua carteira.");
                return;
            }

            const userWalletAddress = accounts[0];

            // 2. CHAIN VALIDATION & SWITCH
            const currentChainId = await provider.request({ method: 'eth_chainId' });
            if (currentChainId !== TARGET_CHAIN_ID) {
                try {
                    await provider.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: TARGET_CHAIN_ID }],
                    });
                } catch (switchError: any) {
                    // This error code indicates that the chain has not been added to MetaMask.
                    if (switchError.code === 4902) {
                        alert(`Por favor, adicione a rede Sepolia (${TARGET_CHAIN_ID}) à sua carteira.`);
                    }
                    console.error("Erro ao trocar rede:", switchError);
                }
            }


            // 3. DATABASE VALIDATION: Register/validate user in Supabase
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s Timeout

            try {
                console.log("🔍 Validando usuário no banco de dados...");
                const response = await fetch('/api/users/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ walletAddress: userWalletAddress }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error('Falha na validação do usuário');
                }

                const data = await response.json();
                console.log("✅ Usuário validado no banco de dados:", data.user);

            } catch (dbError: any) {
                clearTimeout(timeoutId);
                console.error("❌ Erro ao validar usuário no banco:", dbError);
                if (dbError.name === 'AbortError') {
                    alert("Tempo limite excedido ao validar usuário. O banco de dados pode estar lento. Tente novamente.");
                } else {
                    alert("Erro ao validar usuário no banco de dados. Por favor, tente novamente.");
                }
                return; // Não permite conexão se validação DB falhar
            }

            // Só define como conectado se a validação DB foi bem-sucedida
            setWalletAddress(userWalletAddress);
            setWalletType(detectWallet());

            // GRAVA A INTENÇÃO: "O usuário quer ficar conectado"
            window.localStorage.setItem(STORAGE_KEY, 'true');

        } catch (error: any) {
            console.error("Erro ao conectar carteira:", error);
            // Tratamento de conflito de provider
            if (error.message && error.message.includes("conflict")) {
                alert("Detectado conflito entre carteiras. Por favor, desative uma delas (Ex: MetaMask x Rabby) e recarregue.");
                return;
            }

            // Não mostra alert se o usuário apenas rejeitou a conexão
            if (error.code === 4001) {
                console.log("Usuário rejeitou a conexão");
            } else {
                alert("Erro ao conectar. Por favor verifique sua carteira.");
            }
        } finally {
            setIsConnecting(false);
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
        <WalletContext.Provider value={{ walletAddress, connectWallet, disconnectWallet, isConnected: !!walletAddress, walletType, isConnecting }}>
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

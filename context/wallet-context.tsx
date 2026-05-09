"use client";

import React, { createContext, useContext, useEffect, useCallback, ReactNode } from "react";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

interface WalletContextType {
    walletAddress: string | null;
    connectWallet: () => void;
    disconnectWallet: () => void;
    isConnected: boolean;
    walletType: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const { publicKey, connected, disconnect, wallet, connect, connecting } = useSolanaWallet();
    const { setVisible } = useWalletModal();

    const walletAddress = publicKey ? publicKey.toBase58() : null;
    const walletType = wallet?.adapter.name || null;

    // DPO/LGPD Compliance: Trigger connection handshakes strictly when a wallet has been explicitly selected from the modal
    useEffect(() => {
        if (wallet && !connected && !connecting) {
            const walletName = wallet.adapter.name;
            console.log("[Handshake Trace] Iniciando conexão com:", walletName);
            console.log(`🔌 [Wallet Context] Estabelecendo handshake de conexão com a carteira: ${walletName}...`);
            connect().catch((err) => {
                console.error("❌ Falha ao estabelecer handshake com a carteira:", err);
            });
        }
    }, [wallet, connected, connecting, connect]);

    useEffect(() => {
        // Quando conecta a carteira Solana, validamos no banco
        const validateUser = async () => {
            if (connected && walletAddress) {
                try {
                    console.log("🔍 Validando usuário no banco de dados Solana...");
                    const response = await fetch('/api/users/validate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ walletAddress }),
                    });

                    if (!response.ok) {
                        throw new Error('Falha na validação do usuário');
                    }

                    const data = await response.json();
                    console.log("✅ Usuário validado no banco de dados:", data.user);
                } catch (dbError) {
                    console.error("❌ Erro ao validar usuário no banco:", dbError);
                    alert("Erro ao validar usuário no banco de dados. Por favor, tente novamente.");
                    disconnect(); // Desconecta se falhar
                }
            }
        };

        validateUser();
    }, [connected, walletAddress, disconnect]);

    const connectWallet = useCallback(() => {
        setVisible(true); // Abre o modal do Solana Wallet Adapter
    }, [setVisible]);

    const disconnectWallet = useCallback(() => {
        disconnect();
    }, [disconnect]);

    return (
        <WalletContext.Provider value={{ 
            walletAddress, 
            connectWallet, 
            disconnectWallet, 
            isConnected: connected, 
            walletType 
        }}>
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

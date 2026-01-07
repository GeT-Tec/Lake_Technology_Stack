"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@/context/wallet-context";
import { Copy, History, Shield, LogOut, Wallet } from "lucide-react";
import Link from "next/link";

export function WalletControl() {
    const { walletAddress, connectWallet, disconnectWallet, isConnected, isConnecting } = useWallet();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isDropdownOpen]);

    // Check if user is admin (you can replace with actual admin check API call)
    useEffect(() => {
        async function checkAdmin() {
            if (!walletAddress) return;

            try {
                const response = await fetch(`/api/admin/check?wallet=${walletAddress}`);
                const data = await response.json();
                setIsAdmin(data.isAdmin || false);
            } catch (error) {
                console.error("Error checking admin status:", error);
            }
        }

        if (isConnected && walletAddress) {
            checkAdmin();
        }
    }, [walletAddress, isConnected]);

    const handleCopyAddress = async () => {
        if (!walletAddress) return;

        try {
            await navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy address:", error);
        }
    };

    const handleDisconnect = () => {
        setIsDropdownOpen(false);
        disconnectWallet();
    };

    // ESTADO DESCONECTADO: Botão "Conectar Carteira"
    if (!isConnected || !walletAddress) {
        return (
            <button
                disabled={isConnecting}
                onClick={async () => {
                    try {
                        await connectWallet();
                    } catch (err) {
                        console.error("Critical Wallet Error:", err);
                        alert("Erro crítico ao carregar interface da carteira. Recarregue a página.");
                    }
                }}
                className={`
          px-6 py-2.5 
          bg-gradient-to-r from-blue-600 to-blue-700 
          hover:from-blue-700 hover:to-blue-800
          text-white font-semibold rounded-lg 
          shadow-md hover:shadow-lg
          transition-all duration-200
          flex items-center gap-2
          ${isConnecting ? "opacity-75 cursor-wait" : ""}
        `}
            >
                {isConnecting ? (
                    <>
                        <span className="animate-spin mr-2">⏳</span>
                        Conectando...
                    </>
                ) : (
                    <>
                        <Wallet className="w-4 h-4" />
                        Conectar Carteira
                    </>
                )}
            </button>
        );
    }

    // ESTADO CONECTADO: Badge com Dropdown
    const truncatedAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Badge Clicável */}
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="
          px-4 py-2 
          bg-slate-900 text-white 
          font-mono text-sm font-medium
          rounded-lg 
          border border-slate-700
          hover:bg-slate-800 hover:border-slate-600
          transition-all duration-200
          shadow-sm
        "
            >
                {truncatedAddress}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div
                    className="
            absolute right-0 mt-2 w-56
            bg-white rounded-lg shadow-xl
            py-2
            ring-1 ring-black ring-opacity-5
            z-50
            animate-in fade-in slide-in-from-top-2 duration-200
          "
                >
                    {/* Copiar Endereço */}
                    <button
                        onClick={handleCopyAddress}
                        className="
              w-full px-4 py-2.5
              text-left text-sm text-slate-700
              hover:bg-slate-50
              transition-colors
              flex items-center gap-3
            "
                    >
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span>{copied ? "✓ Copiado!" : "Copiar Endereço"}</span>
                    </button>

                    {/* Histórico de Transações */}
                    <Link
                        href="/history"
                        onClick={() => setIsDropdownOpen(false)}
                        className="
              w-full px-4 py-2.5
              text-left text-sm text-slate-700
              hover:bg-slate-50
              transition-colors
              flex items-center gap-3
            "
                    >
                        <History className="w-4 h-4 text-slate-500" />
                        <span>Histórico de Transações</span>
                    </Link>

                    {/* Painel Admin (Visível apenas se admin) */}
                    {isAdmin && (
                        <>
                            <div className="h-px bg-slate-100 my-1" />
                            <Link
                                href="/admin"
                                onClick={() => setIsDropdownOpen(false)}
                                className="
                  w-full px-4 py-2.5
                  text-left text-sm text-blue-600 font-medium
                  hover:bg-blue-50
                  transition-colors
                  flex items-center gap-3
                "
                            >
                                <Shield className="w-4 h-4 text-blue-600" />
                                <span>Painel Admin</span>
                            </Link>
                        </>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-slate-100 my-1" />

                    {/* Desconectar */}
                    <button
                        onClick={handleDisconnect}
                        className="
              w-full px-4 py-2.5
              text-left text-sm text-red-600 font-medium
              hover:bg-red-50
              transition-colors
              flex items-center gap-3
            "
                    >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Desconectar</span>
                    </button>
                </div>
            )}
        </div>
    );
}

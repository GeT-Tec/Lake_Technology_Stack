"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@/context/wallet-context";
import { useCredits } from "@/context/credits-context";
import {
  Copy,
  History,
  Shield,
  LogOut,
  Wallet,
  Coins,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useDict } from "@/lib/i18n/client";

export function WalletControl() {
  const {
    walletAddress,
    connectWallet,
    disconnectWallet,
    isConnected,
    validationError,
  } = useWallet();
  const { credits, openModal } = useCredits();
  const dict = useDict();
  const t = dict.wallet;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

    useEffect(() => {
        async function checkAdmin() {
            if (!walletAddress) return;

      try {
        const response = await fetch(
          `/api/admin/check?wallet=${encodeURIComponent(walletAddress)}`
        );
        if (!response.ok) {
          setIsAdmin(false);
          return;
        }
        const data = await response.json();
        setIsAdmin(data.isAdmin || false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
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

  const handleOpenCreditsModal = () => {
    setIsDropdownOpen(false);
    openModal();
  };

  if (!isConnected || !walletAddress) {
    return (
      <button
        onClick={connectWallet}
        className="
          px-6 py-2.5
          bg-gradient-to-r from-blue-600 to-blue-700
          hover:from-blue-700 hover:to-blue-800
          text-white font-semibold rounded-lg
          shadow-md hover:shadow-lg
          transition-all duration-200
          flex items-center gap-2
        "
      >
        <Wallet className="w-4 h-4" />
        {t.connect}
      </button>
    );
  }

  const truncatedAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  return (
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      <button
        onClick={handleOpenCreditsModal}
        className="
                    px-3 py-2
                    bg-gradient-to-r from-blue-500 to-blue-600
                    hover:from-blue-600 hover:to-blue-700
                    text-white font-medium text-sm
                    rounded-lg
                    shadow-sm hover:shadow-md
                    transition-all duration-200
                    flex items-center gap-1.5
                "
        title={t.creditsTooltip}
      >
        <Coins className="w-4 h-4" />
        <span>{credits}</span>
        <Plus className="w-3 h-3 opacity-70" />
      </button>

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

      {isDropdownOpen && (
        <div
          className="
            absolute right-0 top-full mt-2 w-56
            bg-white rounded-lg shadow-xl
            py-2
            ring-1 ring-black ring-opacity-5
            z-50
            animate-in fade-in slide-in-from-top-2 duration-200
          "
        >
          <div className="px-4 py-2.5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{t.yourCredits}</span>
              <span className="font-bold text-slate-900">{credits}</span>
            </div>
            {validationError && (
              <p className="mt-2 text-xs leading-relaxed text-amber-600">
                {validationError}
              </p>
            )}
          </div>

          <button
            onClick={handleOpenCreditsModal}
            className="
              w-full px-4 py-2.5
              text-left text-sm text-slate-700
              hover:bg-slate-50
              transition-colors
              flex items-center gap-3
            "
          >
            <Coins className="w-4 h-4 text-slate-600" />
            <span>{t.buyCredits}</span>
          </button>

          <div className="h-px bg-slate-100 my-1" />

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
            <span>{copied ? t.copied : t.copyAddress}</span>
          </button>

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
            <span>{t.txHistory}</span>
          </Link>

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
                <span>{t.adminPanel}</span>
              </Link>
            </>
          )}

          <div className="h-px bg-slate-100 my-1" />

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
            <span>{t.disconnect}</span>
          </button>
        </div>
      )}
    </div>
  );
}

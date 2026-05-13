"use client";

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletAdapterNetwork,
  type WalletAdapter,
} from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  UnsafeBurnerWalletAdapter,
} from "@solana/wallet-adapter-wallets";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  // Forcing DEVNET to resolve Phantom network mismatch
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  const wallets = useMemo(() => {
    const adapters: WalletAdapter[] = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ];
    const enableUnsafeBurner =
      process.env.NODE_ENV !== "production" ||
      process.env.NEXT_PUBLIC_ENABLE_UNSAFE_BURNER === "true";

    if (enableUnsafeBurner) {
      adapters.push(new UnsafeBurnerWalletAdapter());
    }

    return adapters;
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={false}
        onError={(error) => console.error("[Wallet Error]", error)}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

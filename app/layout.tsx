import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { SolanaProvider } from "@/components/SolanaProvider";
import { WalletProvider } from "@/context/wallet-context";
import { CreditsProvider } from "@/context/credits-context";
import { CreditsModal } from "@/components/CreditsModal";
import { Footer } from "@/components/Footer";
import { GlobalTicker } from "@/components/GlobalTicker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lake Tokeniza | Investimentos RWA",
  description: "Plataforma institucional de tokenização de ativos reais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col`}
      >
        <SolanaProvider>
          <WalletProvider>
            <CreditsProvider>
              <GlobalTicker />
              <Navbar />
              <main className="flex-grow w-full">{children}</main>
              <Footer />
              <CreditsModal />
            </CreditsProvider>
          </WalletProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { WalletProvider } from "@/context/wallet-context"; // Importar Provider
import { CreditsProvider } from "@/context/credits-context";


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
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col`}>
        <WalletProvider>
          <CreditsProvider>
            <Navbar />
            <main className="flex-grow w-full">
              {children}
            </main>
          </CreditsProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
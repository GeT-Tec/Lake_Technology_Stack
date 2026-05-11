import type { Metadata } from "next";
import { Nunito, EB_Garamond } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { SolanaProvider } from "@/components/SolanaProvider";
import { WalletProvider } from "@/context/wallet-context";
import { CreditsProvider } from "@/context/credits-context";
import { CreditsModal } from "@/components/CreditsModal";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lake | Opening digital horizons",
  description: "Plataforma institucional de tokenização de ativos reais em Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={`${nunito.variable} ${ebGaramond.variable}`}>
      <body className="bg-lake-paper text-lake-ink antialiased min-h-screen flex flex-col font-sans">
        <SolanaProvider>
          <WalletProvider>
            <CreditsProvider>
              <Navbar />
              <main className="flex-grow w-full">{children}</main>
              <CreditsModal />
            </CreditsProvider>
          </WalletProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}

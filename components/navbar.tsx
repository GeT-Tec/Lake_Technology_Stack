"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WalletControl } from "@/components/wallet-control";
import AdminBadge from "@/components/admin/AdminBadge"; // Verifique se o caminho está correto na sua pasta
import { Menu, X } from "lucide-react"; // Ícones essenciais
import { useState } from "react";

// Rotas de Navegação
const navItems = [
  { name: "Home", href: "/" },
  { name: "Aprenda", href: "/learn" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "Tokenizar", href: "/tokenize" },
  { name: "Meus Investimentos", href: "/dashboard/investor" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* 1. LOGO (Esquerda) */}
        <Link href="/" className="flex items-center gap-2 z-50">
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
              LAKE<span className="text-blue-600">TOKENIZA</span>
            </span>
            <span className="text-[0.6rem] font-semibold tracking-widest text-slate-500 uppercase">
              RWA Protocol
            </span>
          </div>
        </Link>

        {/* 2. MENU DESKTOP (Centro - Escondido no Mobile) */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-600",
                pathname === item.href
                  ? "text-blue-600 font-semibold"
                  : "text-slate-600"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* 3. AÇÕES DESKTOP (Direita) */}
        <div className="hidden md:flex items-center gap-4">
          <AdminBadge />
          <WalletControl />
        </div>

        {/* 4. BOTÃO MENU MOBILE (Aparece só no Mobile) */}
        <div className="md:hidden flex items-center gap-4">
          {/* O AdminBadge pode aparecer comprimido no mobile ou ficar dentro do menu, 
                aqui deixei fora para visibilidade rápida, mas se quebrar, movemos para dentro */}
          <div className="scale-75 origin-right">
            <AdminBadge />
          </div>

          <button
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 5. PAINEL MOBILE (Expandido) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl flex flex-col p-4 gap-4 animate-in slide-in-from-top-5 fade-in-20">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)} // Fecha ao clicar
                className={cn(
                  "px-4 py-3 rounded-lg text-base font-medium transition-colors border border-transparent",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700 border-blue-100"
                    : "text-slate-700 hover:bg-slate-50 hover:border-slate-100"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="h-px bg-slate-100 my-1" />

          {/* Carteira no Mobile (Botão Grande) */}
          <div className="flex justify-center pb-2">
            <div className="w-full [&>button]:w-full [&>button]:justify-center">
              <WalletControl />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

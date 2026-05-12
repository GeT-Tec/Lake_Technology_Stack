"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WalletControl } from "@/components/wallet-control";
import AdminBadge from "@/components/admin/AdminBadge";
import { Menu, X } from "lucide-react";
import { useState } from "react";

// Rotas de Navegação
const navItems = [
  { name: "Home", href: "/" },
  { name: "Trilha", href: "/learn#trail-head-title" },
  { name: "Aprenda", href: "/learn" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "Tokenizar", href: "/tokenize" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">

        {/* 1. LOGO Lake (Esquerda) */}
        <Link href="/" className="flex items-center gap-3 z-50 group">
          <Image
            src="/brand/lake-logo-light.png"
            alt="Lake — Opening digital horizons"
            width={132}
            height={42}
            priority
            className="h-10 w-auto transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        {/* 2. MENU DESKTOP (Centro - Escondido no Mobile) */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-bold transition-colors hover:text-lake-cyan",
                pathname === item.href
                  ? "text-lake-cyan-dark"
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
                  "px-4 py-3 rounded-xl text-base font-bold transition-colors border border-transparent",
                  pathname === item.href
                    ? "bg-lake-cyan-soft text-lake-cyan-dark border-lake-cyan-light/40"
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

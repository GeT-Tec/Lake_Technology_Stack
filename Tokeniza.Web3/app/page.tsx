import Link from "next/link";
import { ShieldCheck, Zap, Globe, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 text-slate-900">

      {/* HERO SECTION */}
      <div className="w-full max-w-6xl px-4 py-20 text-center mt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-6 tracking-wide border border-blue-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Protocolo LakeZero Ativo v1.0
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900">
          O Futuro dos Investimentos <br />
          <span className="text-blue-600">É Real. É Tokenizado.</span>
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          A primeira plataforma institucional que une a segurança jurídica do mercado tradicional com a liquidez instantânea da blockchain.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/marketplace" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:-translate-y-1 flex items-center gap-2">
            Ver Ativos Disponíveis <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/tokenize" className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-lg font-bold text-lg transition-all hover:border-slate-300 shadow-sm flex items-center gap-2">
            Quero Tokenizar meu Ativo
          </Link>
        </div>
      </div>

      {/* CARDS DE VALOR (AGORA INTERATIVOS) */}
      <div className="w-full bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">

            {/* Card 1: Segurança -> Vai para Aprenda */}
            <Link href="/learn" className="group p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5 text-blue-500 -translate-x-2 group-hover:translate-x-0 transition-transform" />
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">Segurança Jurídica</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Entenda como nossos Smart Contracts são auditados e vinculados à legislação vigente (CVM).
              </p>
            </Link>

            {/* Card 2: Liquidez LakeZero -> Vai para Aprenda (Tecnologia) */}
            <Link href="/learn" className="group p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-yellow-200 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5 text-yellow-500 -translate-x-2 group-hover:translate-x-0 transition-transform" />
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-yellow-100">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-yellow-600 transition-colors">Liquidez LakeZero</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Descubra a tecnologia de assinatura proprietária com latência zero e taxa de sustentabilidade.
              </p>
            </Link>

            {/* Card 3: Acesso Global -> Vai para Marketplace (Conversão) */}
            <Link href="/marketplace" className="group p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-emerald-200 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5 text-emerald-500 -translate-x-2 group-hover:translate-x-0 transition-transform" />
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-emerald-100">
                <Globe className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-emerald-600 transition-colors">Acesso Global</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Comece a investir agora em grandes empreendimentos de qualquer lugar do mundo.
              </p>
            </Link>

          </div>
        </div>
      </div>
    </main>
  );
}
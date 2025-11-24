import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* HERO SECTION */}
      <section className="w-full py-24 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-8 border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Protocolo LakeZero Ativo v1.0
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6">
            O Futuro dos Investimentos <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-900">
              É Real. É Tokenizado.
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            A primeira plataforma institucional que une a segurança jurídica do mercado tradicional com a liquidez instantânea da blockchain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace">
              <button className="px-8 py-4 bg-blue-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-700/20 hover:bg-blue-800 transition-all flex items-center gap-2">
                Ver Ativos Disponíveis <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/tokenize">
              <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
                Quero Tokenizar meu Ativo
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="w-full py-20 bg-slate-50">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 text-blue-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Segurança Jurídica</h3>
            <p className="text-slate-600">Contratos inteligentes auditados e vinculados à legislação vigente.</p>
          </div>
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mb-6 text-amber-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Liquidez LakeZero</h3>
            <p className="text-slate-600">Tecnologia de assinatura proprietária com latência zero.</p>
          </div>
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-6 text-emerald-600">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Acesso Global</h3>
            <p className="text-slate-600">Invista em grandes empreendimentos de qualquer lugar do mundo.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
import { BookOpen, Droplets, AlertTriangle, ExternalLink, Wallet, ShieldCheck, Zap, Globe, Lock, FileText, Landmark, KeyRound, Download, MousePointerClick, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 scroll-smooth">
      {/* Header Section */}
      <div className="bg-slate-900 text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
              <BookOpen className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Academia Lake</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl">
            Seu guia definitivo para navegar na economia tokenizada com segurança e autonomia.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* --- SIDEBAR DE NAVEGAÇÃO (STICKY) --- */}
          <aside className="lg:w-1/4">
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Conceitos Fundamentais</h3>
                <nav className="space-y-1">
                  <a href="#security" className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors text-sm font-medium">Segurança Jurídica</a>
                  <a href="#liquidity" className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-yellow-600 transition-colors text-sm font-medium">Liquidez LakeZero</a>
                  <a href="#global" className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-emerald-600 transition-colors text-sm font-medium">Acesso Global</a>
                </nav>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Laboratório Prático</h3>
                <nav className="space-y-1">
                  <a href="#wallet-tutorial" className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-purple-600 transition-colors text-sm font-medium">1. Criar sua Carteira</a>
                  <a href="#faucet-tutorial" className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors text-sm font-medium">2. Obter Tokens (Grátis)</a>
                </nav>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Dica:</strong> Use este menu para navegar rapidamente entre a teoria e a prática.
                </p>
              </div>
            </div>
          </aside>

          {/* --- CONTEÚDO PRINCIPAL --- */}
          <main className="lg:w-3/4 space-y-20">

            {/* SEÇÃO 1: PILARES (TEORIA) */}
            <section className="space-y-12">

              {/* 1.1 SEGURANÇA JURÍDICA */}
              <div id="security" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><ShieldCheck className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-bold text-slate-900">Segurança Jurídica & Compliance</h2>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <p className="text-slate-600 leading-relaxed">
                    Na LakeTokeniza, a tecnologia blockchain não substitui a lei, ela a fortalece. Cada token emitido é um espelho digital de um contrato real.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> Lastro Real</h4>
                      <p className="text-sm text-slate-600">Tokens vinculados a CCBs (Cédulas de Crédito Bancário) ou CICs, registrados e auditáveis.</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Landmark className="w-4 h-4 text-blue-500" /> Garantia Legal</h4>
                      <p className="text-sm text-slate-600">Seus direitos de propriedade são garantidos pela legislação vigente, independente da tecnologia.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1.2 LIQUIDEZ LAKEZERO */}
              <div id="liquidity" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><Zap className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-bold text-slate-900">Liquidez LakeZero</h2>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <p className="text-slate-600 leading-relaxed">
                    Resolvemos o maior problema das DEXs: a lentidão e o custo. Nossa arquitetura híbrida permite trading instantâneo.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Assinatura Off-Chain:</strong> Ordens casadas em milissegundos em nossos servidores seguros.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Liquidação On-Chain:</strong> Apenas a troca final de custódia vai para a Blockchain, garantindo transparência.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-600 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Taxa de Sustentabilidade ($0.30):</strong> Uma contribuição fixa para manter a infraestrutura de alta performance.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 1.3 ACESSO GLOBAL */}
              <div id="global" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Globe className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-bold text-slate-900">Acesso Global</h2>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <p className="text-slate-600 leading-relaxed">
                    Sua carteira digital é seu passaporte financeiro. Invista em ativos brasileiros de qualquer lugar do mundo, sem burocracia bancária.
                  </p>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-800 text-sm">
                    <strong>Vantagem:</strong> Use USDT, USDC ou ETH. Proteja seu patrimônio contra instabilidades locais e tenha portabilidade total.
                  </div>
                </div>
              </div>

            </section>

            <div className="h-px bg-slate-200"></div>

            {/* SEÇÃO 2: LABORATÓRIO (PRÁTICA) */}
            <section className="space-y-12">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Wallet className="w-6 h-6" /></div>
                <h2 className="text-2xl font-bold text-slate-900">Laboratório Prático</h2>
              </div>

              {/* TUTORIAL 1: CARTEIRA */}
              <div id="wallet-tutorial" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-purple-50 p-6 border-b border-purple-100">
                  <h3 className="font-bold text-lg text-purple-900">1. Sua Primeira Carteira Digital</h3>
                  <p className="text-purple-700 text-sm mt-1">O passo inicial para sua soberania financeira.</p>
                </div>
                <div className="p-8 space-y-8">

                  <div className="relative pl-8 border-l-2 border-slate-200 space-y-8">
                    {/* Passo A */}
                    <div className="relative">
                      <span className="absolute -left-[41px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-sm ring-4 ring-white">1</span>
                      <h4 className="font-bold text-slate-900 mb-2">Escolha e Instale</h4>
                      <p className="text-slate-600 text-sm mb-4">Recomendamos a <strong>Rabby Wallet</strong> (mais segura e amigável) ou a <strong>MetaMask</strong> (padrão de mercado). Instale a extensão no seu navegador.</p>
                      <div className="flex gap-3">
                        <Link href="https://rabby.io" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">
                          <Download className="w-4 h-4" /> Baixar Rabby
                        </Link>
                        <Link href="https://metamask.io" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">
                          <Download className="w-4 h-4" /> Baixar MetaMask
                        </Link>
                      </div>
                    </div>

                    {/* Passo B */}
                    <div className="relative">
                      <span className="absolute -left-[41px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-sm ring-4 ring-white">2</span>
                      <h4 className="font-bold text-slate-900 mb-2">Guarde a Frase Secreta (Seed)</h4>
                      <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                        <p className="text-red-800 text-xs font-bold flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4" /> ATENÇÃO MÁXIMA
                        </p>
                        <p className="text-red-700 text-sm">
                          A carteira vai gerar 12 ou 24 palavras. <strong>Anote em papel e guarde em um cofre.</strong> Nunca tire print, nunca salve no computador. Quem tem essas palavras tem seu dinheiro.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* TUTORIAL 2: TOKENS */}
              <div id="faucet-tutorial" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-blue-50 p-6 border-b border-blue-100">
                  <h3 className="font-bold text-lg text-blue-900">2. Obtendo Dinheiro de Teste (Faucet)</h3>
                  <p className="text-blue-700 text-sm mt-1">Como estamos na rede de testes (Sepolia), você não gasta dinheiro real.</p>
                </div>
                <div className="p-8 space-y-6">
                  <p className="text-slate-600 text-sm">
                    Para pagar as taxas da rede (Gas) e comprar ativos de teste, você precisa de <strong>Sepolia ETH</strong>. Existem sites chamados "Faucets" (Torneiras) que dão isso de graça.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Link href="https://faucets.chain.link/" target="_blank" className="group p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">Chainlink Faucet</span>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                      </div>
                      <p className="text-xs text-slate-500">Requer login com Github. Rápido e confiável.</p>
                    </Link>

                    <Link href="https://sepolia-faucet.pk910.de/" target="_blank" className="group p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">PoW Faucet</span>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                      </div>
                      <p className="text-xs text-slate-500">Sem login. Requer deixar a aba aberta minerando.</p>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                    <MousePointerClick className="w-4 h-4" />
                    <span>Após conseguir os tokens, volte aqui e clique em <strong>"Conectar Carteira"</strong> no topo da página.</span>
                  </div>

                </div>
              </div>

            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
import { BookOpen, Droplets, AlertTriangle, ExternalLink, Wallet, ShieldCheck, Zap, Globe, Lock, FileText, Landmark, KeyRound } from "lucide-react";
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
            Entenda a tecnologia, a segurança jurídica e o ecossistema financeiro por trás da LakeTokeniza.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-20">

        {/* --- MÓDULO 1: PILARES DO PROTOCOLO (RESPOSTA AOS CARDS DA HOME) --- */}
        <section className="space-y-12">

          {/* 1.1 SEGURANÇA JURÍDICA (Anchor: #security) */}
          <div id="security" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="bg-blue-50 p-8 md:w-1/3 flex flex-col justify-center border-r border-blue-100">
              <ShieldCheck className="w-12 h-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900">Segurança Jurídica & Compliance</h2>
              <p className="text-slate-600 mt-2">
                Não é apenas código. É a lei aplicada à tecnologia.
              </p>
            </div>
            <div className="p-8 md:w-2/3 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" /> O Contrato Inteligente é um Contrato Real?
                </h3>
                <p className="text-slate-600 mt-2 leading-relaxed">
                  Sim. Na LakeTokeniza, cada token (ERC-20/ERC-1155) emitido está vinculado juridicamente a uma <strong>Cédula de Crédito Bancário (CCB)</strong> ou a um <strong>Contrato de Investimento Coletivo (CIC)</strong>. O "Smart Contract" na blockchain é o espelho digital de um documento físico registrado em cartório ou sob as normas da CVM (Comissão de Valores Mobiliários).
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-blue-500" /> Proteção ao Investidor
                </h3>
                <p className="text-slate-600 mt-2 leading-relaxed">
                  Se a internet acabar amanhã, seu direito de propriedade continua existindo. A Blockchain garante a transparência e a auditoria em tempo real, mas a segurança jurídica do "Mundo Real" (RWA) garante que seu ativo tem lastro, garantia e execução legal em caso de inadimplência.
                </p>
              </div>
            </div>
          </div>

          {/* 1.2 LIQUIDEZ LAKEZERO (Anchor: #liquidity) */}
          <div id="liquidity" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="bg-yellow-50 p-8 md:w-1/3 flex flex-col justify-center border-r border-yellow-100">
              <Zap className="w-12 h-12 text-yellow-600 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900">Liquidez LakeZero</h2>
              <p className="text-slate-600 mt-2">
                Velocidade de HFT (High Frequency Trading) com a segurança da Blockchain.
              </p>
            </div>
            <div className="p-8 md:w-2/3 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">O Problema da Blockchain Tradicional</h3>
                <p className="text-slate-600 mt-2 leading-relaxed">
                  Em plataformas comuns, você paga uma taxa ("Gas") a cada clique e espera segundos ou minutos para confirmar. Isso mata a agilidade de um mercado financeiro moderno.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">A Solução LakeZero (Híbrida)</h3>
                <p className="text-slate-600 mt-2 leading-relaxed">
                  Nós desenvolvemos um motor de assinatura <strong>Off-Chain</strong> (fora da rede) com liquidação <strong>On-Chain</strong>. Você negocia instantaneamente, sem taxas de gás para ordens de compra e venda dentro do ambiente. Apenas a custódia final é gravada na Blockchain.
                </p>
                <div className="mt-4 p-4 bg-yellow-50/50 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                  <strong>Taxa de Sustentabilidade ($0.30):</strong> Esta pequena contribuição serve para manter essa super-infraestrutura de servidores ativos, garantindo que você tenha latência zero sem depender de mineradores lentos.
                </div>
              </div>
            </div>
          </div>

          {/* 1.3 ACESSO GLOBAL (Anchor: #global) */}
          <div id="global" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="bg-emerald-50 p-8 md:w-1/3 flex flex-col justify-center border-r border-emerald-100">
              <Globe className="w-12 h-12 text-emerald-600 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900">Acesso Global & Liberdade</h2>
              <p className="text-slate-600 mt-2">
                O fim das fronteiras geográficas para o seu dinheiro.
              </p>
            </div>
            <div className="p-8 md:w-2/3 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Por que investir Globalmente?</h3>
                <p className="text-slate-600 mt-2 leading-relaxed">
                  Historicamente, apenas grandes fundos podiam comprar imóveis no Brasil estando no Japão, ou investir em Agronegócio sem ter conta em banco local. A burocracia bancária (SWIFT, Câmbio, Spread) comia 10% do lucro.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">A Vantagem da Tokenização</h3>
                <p className="text-slate-600 mt-2 leading-relaxed">
                  Com a LakeTokeniza, sua carteira digital é seu passaporte. Você usa <strong>USDT, USDC ou ETH</strong> (moedas globais) para comprar frações de ativos reais.
                  <br /><br />
                  Isso significa <strong>Proteção Patrimonial</strong> (seu ativo não pode ser confiscado por instabilidade política local) e <strong>Portabilidade</strong> (você leva seu patrimônio no bolso para qualquer país). É a verdadeira soberania financeira.
                </p>
              </div>
            </div>
          </div>

        </section>

        {/* --- DIVISOR VISUAL --- */}
        <div className="flex items-center gap-4">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-slate-400 text-sm font-medium uppercase tracking-widest">Área Técnica</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        {/* --- MÓDULO ANTERIOR: TUTORIAL DE WALLET/FAUCETS (MANTIDO) --- */}
        <section className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-slate-900">Laboratório: Como Operar (Carteiras & Tokens)</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* O que é Wallet */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-slate-500" /> O que é uma Wallet?
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Não é onde o dinheiro fica (ele fica na Blockchain). É onde ficam suas <strong>chaves</strong> para movimentar esse dinheiro. Se você perder a chave (frase secreta), perde o acesso. Instale a <strong>Rabby Wallet</strong> ou <strong>MetaMask</strong> para começar.
              </p>
            </div>

            {/* Faucets */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-purple-500" /> Tokens de Teste (Grátis)
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Estamos na rede de testes <strong>Sepolia</strong>. O dinheiro aqui é fictício. Você pode pegar de graça nos "Faucets" (Torneiras).
              </p>
              <div className="flex flex-col gap-2">
                <Link href="https://faucets.chain.link/" target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  Link 1: Chainlink Faucet (Requer Login) <ExternalLink className="w-3 h-3" />
                </Link>
                <Link href="https://sepolia-faucet.pk910.de/" target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  Link 2: PoW Mining (Sem Login) <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
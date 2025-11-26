import { BookOpen, Droplets, AlertTriangle, ExternalLink, Wallet, Pickaxe } from "lucide-react";
import Link from "next/link";

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header Section */}
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
              <BookOpen className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Central de Conhecimento</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl">
            Domine a tokenização de ativos reais (RWA). Aprenda como operar, conseguir tokens de teste e investir com segurança.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">

        {/* --- MÓDULO CRÍTICO: COMO CONSEGUIR TOKENS --- */}
        <section className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Droplets className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-slate-900">Primeiros Passos: Conseguindo Tokens de Teste</h2>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex gap-4">
                <div className="p-3 bg-blue-100 rounded-full h-fit">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">O que é o "Sepolia ETH"?</h3>
                  <p className="text-slate-600 mt-1">
                    Para realizar transações na Blockchain, você precisa pagar uma pequena taxa chamada "Gas".
                    Como estamos em um ambiente de testes (Testnet), usamos um dinheiro fictício chamado <strong>Sepolia ETH</strong>.
                    Ele não tem valor financeiro real, mas é essencial para testar a plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 grid gap-8 md:grid-cols-2">
              {/* Método 1: Chainlink */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">1</span>
                  <h4 className="font-semibold text-slate-900">Método Rápido (Chainlink)</h4>
                </div>
                <p className="text-sm text-slate-600">
                  A maneira mais fácil. Exige conectar sua carteira e autenticar com o GitHub.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <li className="flex gap-2">✓ Acesse <strong>faucets.chain.link</strong></li>
                  <li className="flex gap-2">✓ Conecte sua Carteira (Rabby/MetaMask)</li>
                  <li className="flex gap-2">✓ Selecione "Ethereum Sepolia"</li>
                  <li className="flex gap-2">✓ Receba 20 Test LINK + 0.1 ETH</li>
                </ul>
                <Link
                  href="https://faucets.chain.link/"
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Acessar Chainlink Faucet <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Método 2: PoW Mining */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">2</span>
                  <h4 className="font-semibold text-slate-900">Método Alternativo (Mineração)</h4>
                </div>
                <p className="text-sm text-slate-600">
                  Se o Chainlink falhar, use este. Você deixa a aba aberta "minerando" tokens.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <li className="flex gap-2">✓ Acesse <strong>sepolia-faucet.pk910.de</strong></li>
                  <li className="flex gap-2">✓ Cole o endereço da sua carteira</li>
                  <li className="flex gap-2">✓ Clique em "Start Mining"</li>
                  <li className="flex gap-2">✓ Aguarde acumular (Min: 0.05 ETH)</li>
                </ul>
                <Link
                  href="https://sepolia-faucet.pk910.de/"
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Acessar PoW Faucet <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Alerta Importante */}
            <div className="bg-amber-50 border-t border-amber-100 p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-sm text-amber-800">
                <strong>Atenção:</strong> Para evitar spam, a maioria dos Faucets exige que sua carteira tenha pelo menos
                <strong> 0.001 ETH</strong> na rede principal (Mainnet). Se for sua primeira vez, o método PoW (Opção 2) costuma funcionar sem essa exigência.
              </div>
            </div>
          </div>
        </section>

        {/* --- CONTEÚDO ORIGINAL (PRESERVADO) --- */}
        <section className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <h3 className="text-xl font-bold mb-3 text-slate-900">O que é RWA?</h3>
            <p className="text-slate-600 mb-4">
              Real World Assets (Ativos do Mundo Real) são tokens digitais que representam a propriedade de bens físicos, como imóveis, títulos ou commodities.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <h3 className="text-xl font-bold mb-3 text-slate-900">Segurança Jurídica</h3>
            <p className="text-slate-600 mb-4">
              Nossa plataforma une a CVM com a Blockchain. Cada token é vinculado a um contrato jurídico real, garantindo seus direitos fora da internet.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <h3 className="text-xl font-bold mb-3 text-slate-900">Como Investir?</h3>
            <p className="text-slate-600 mb-4">
              1. Conecte sua Carteira.<br />
              2. Escolha um ativo no Marketplace.<br />
              3. Use seus Créditos ou ETH para adquirir frações.<br />
              4. Receba dividendos na carteira.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
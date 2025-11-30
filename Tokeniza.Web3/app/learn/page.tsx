import { BookOpen, Droplets, AlertTriangle, ExternalLink, Wallet, ShieldCheck, Coins, KeyRound, Lock } from "lucide-react";
import Link from "next/link";

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header Section */}
      <div className="bg-slate-900 text-white py-16 relative overflow-hidden">
        {/* Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
              <BookOpen className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Academia Lake</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl">
            Sua jornada da Web2 para a Web3 começa aqui. Educação, segurança e liberdade financeira.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">

        {/* --- NOVO MÓDULO: ENTENDENDO A WALLET (BÁSICO) --- */}
        <section className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <KeyRound className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">O Básico: O que é uma Carteira (Wallet)?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Não é onde você guarda dinheiro.</h3>
              <p className="text-slate-600 leading-relaxed">
                Imagine que a Blockchain é um cofre gigante de vidro transparente. Todo mundo vê o dinheiro lá dentro, mas ninguém pode tocar.
              </p>
              <p className="text-slate-600 leading-relaxed">
                A sua <strong>Wallet (Carteira)</strong> não guarda as moedas. Ela guarda as <strong>CHAVES</strong> e as <strong>SENHAS</strong> que permitem movimentar aquele dinheiro dentro do cofre.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Regra de Ouro da Autocustódia
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  "Not your keys, not your coins." (Sem chaves, sem moedas). Se você perder sua senha (Frase Semente), ninguém pode recuperar. Você é o seu próprio banco.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="bg-white p-2 rounded-md shadow-sm text-2xl">🦊</div>
                <div>
                  <h4 className="font-bold text-slate-900">MetaMask / Rabby</h4>
                  <p className="text-sm text-slate-500">São "chaves digitais" que vivem no seu navegador. Elas assinam as transações.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="bg-white p-2 rounded-md shadow-sm text-2xl">📝</div>
                <div>
                  <h4 className="font-bold text-slate-900">Frase de Recuperação</h4>
                  <p className="text-sm text-slate-500">São 12 palavras que geram suas chaves. Guarde num papel, jamais no computador.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- MÓDULO: CONTRIBUIÇÃO E SEGURANÇA LAKEZERO --- */}
        <section className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-slate-900">Por que cobramos $0.30? A Tecnologia LakeZero.</h2>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>

            <div className="grid md:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">Contribuição para a Liberdade</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    A taxa simbólica de <strong>$0.30 USD</strong> (Crédito) não é apenas uma cobrança. É uma contribuição para o <strong>Fundo de Tesouraria Lake</strong>. Este fundo garante a manutenção dos servidores de alta performance, auditorias de segurança contínuas e o desenvolvimento de ferramentas de educação financeira gratuitas.
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="bg-white/10 p-4 rounded-xl flex-1 border border-white/10">
                    <Coins className="w-6 h-6 text-yellow-400 mb-2" />
                    <div className="font-bold">Liquidez Futura</div>
                    <div className="text-xs text-slate-400">Fundo garantidor para o ecossistema.</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl flex-1 border border-white/10">
                    <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
                    <div className="font-bold">Auditoria</div>
                    <div className="text-xs text-slate-400">Monitoramento 24/7.</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-l border-white/10 pl-8">
                <h3 className="text-lg font-bold text-white">O Diferencial LakeZero API</h3>
                <p className="text-slate-400 text-sm">
                  Muitas plataformas expõem seus dados. O Protocolo LakeZero utiliza uma arquitetura de <strong>"Assinatura Criptográfica Isolada"</strong>.
                </p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Seus dados são validados em um ambiente blindado (Rust).</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Integridade Zero-Trust: Nunca confiamos, sempre verificamos matematicamente.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Latência Zero: Segurança de banco com velocidade de internet.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* --- MÓDULO ANTERIOR: CONSEGUINDO TOKENS --- */}
        <section className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Droplets className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-slate-900">Laboratório: Conseguindo Tokens de Teste (Faucets)</h2>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex gap-4">
                <div className="p-3 bg-purple-100 rounded-full h-fit">
                  <Wallet className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">O que é o "Sepolia ETH"?</h3>
                  <p className="text-slate-600 mt-1">
                    Para usar a Blockchain, você paga uma taxa ("Gas"). Na nossa rede de testes (Sepolia), esse dinheiro é fictício e gratuito.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">1</span>
                  <h4 className="font-semibold text-slate-900">Chainlink Faucet (Rápido)</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <li className="flex gap-2">✓ Acesse faucets.chain.link</li>
                  <li className="flex gap-2">✓ Conecte com GitHub e Carteira</li>
                  <li className="flex gap-2">✓ Receba 0.1 Test ETH</li>
                </ul>
                <Link
                  href="https://faucets.chain.link/"
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                  Ir para Chainlink <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">2</span>
                  <h4 className="font-semibold text-slate-900">PoW Mining (Sem Login)</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <li className="flex gap-2">✓ Acesse sepolia-faucet.pk910.de</li>
                  <li className="flex gap-2">✓ Cole sua carteira e inicie a mineração</li>
                  <li className="flex gap-2">✓ Ótimo para quem não tem saldo na rede principal</li>
                </ul>
                <Link
                  href="https://sepolia-faucet.pk910.de/"
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                  Ir para PoW Faucet <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="bg-amber-50 border-t border-amber-100 p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-sm text-amber-800">
                <strong>Dica Pro:</strong> A maioria dos faucets exige que você tenha pelo menos <strong>0.001 ETH</strong> na rede principal (Mainnet) para evitar robôs. Se você é novo, use a opção 2 (PoW) que não tem essa exigência.
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
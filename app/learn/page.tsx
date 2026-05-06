import {
  BookOpen,
  Droplets,
  AlertTriangle,
  ExternalLink,
  Wallet,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  FileText,
  Landmark,
  GraduationCap,
  Cpu,
  Coins,
  SearchCheck,
  Key,
  Fingerprint,
  UserCheck,
  Ghost
} from "lucide-react";
import Link from "next/link";

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 scroll-smooth">

      {/* --- HERO: AUTORIDADE IMEDIATA --- */}
      <div className="bg-slate-900 text-white pt-24 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 mb-6">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold tracking-wider uppercase text-emerald-400">Lake Academy</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Domine a Nova Economia <br />
            <span className="text-emerald-400">Tokenizada.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            De iniciante a investidor institucional. Este é o repositório definitivo de conhecimento sobre RWA, Blockchain e a infraestrutura LakeZero.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* --- SIDEBAR DE NAVEGAÇÃO (STICKY) --- */}
          <aside className="lg:w-1/4 hidden lg:block">
            <div className="sticky top-24 space-y-8">

              {/* Menu Conceitos */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Fundamentos (Teoria)</h3>
                <nav className="flex flex-col space-y-1">
                  <a href="#intro-rwa" className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all text-slate-600 hover:text-emerald-700">
                    <Globe className="w-4 h-4" />
                    <span className="font-medium">O que é RWA?</span>
                  </a>
                  <a href="#juridico" className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all text-slate-600 hover:text-blue-700">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-medium">Segurança Jurídica</span>
                  </a>
                  <a href="#lakezero" className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all text-slate-600 hover:text-yellow-700">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">Tecnologia LakeZero</span>
                  </a>
                </nav>
              </div>

              {/* Menu Identidade (NOVO) */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Privacidade</h3>
                <nav className="flex flex-col space-y-1">
                  <a href="#identity" className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all text-slate-600 hover:text-cyan-700">
                    <Fingerprint className="w-4 h-4" />
                    <span className="font-medium">Identidade & Hash</span>
                  </a>
                </nav>
              </div>

              {/* Menu Prático */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Laboratório (Prática)</h3>
                <nav className="flex flex-col space-y-1">
                  <a href="#wallet-masterclass" className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all text-slate-600 hover:text-purple-700">
                    <Wallet className="w-4 h-4" />
                    <span className="font-medium">Masterclass: Carteiras</span>
                  </a>
                  <a href="#faucets" className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all text-slate-600 hover:text-purple-700">
                    <Droplets className="w-4 h-4" />
                    <span className="font-medium">Resgatar Tokens (Faucets)</span>
                  </a>
                </nav>
              </div>

            </div>
          </aside>

          {/* --- CONTEÚDO PRINCIPAL --- */}
          <main className="lg:w-3/4 space-y-24">

            {/* SEÇÃO 1: RWA */}
            <section id="intro-rwa" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-4 border-b border-emerald-200 pb-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Globe className="w-8 h-8 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">A Revolução RWA (Real World Assets)</h2>
                  <p className="text-slate-500">Por que a BlackRock chama isso de "A próxima geração de mercados".</p>
                </div>
              </div>
              <div className="prose prose-lg text-slate-600 max-w-none">
                <p>
                  <strong>Imagine poder comprar um pedaço de um prédio na Faria Lima ou de uma fazenda de soja no Mato Grosso com a mesma facilidade que envia um e-mail.</strong>
                </p>
                <p>
                  Ativos do Mundo Real (RWA) são a ponte definitiva entre o mercado financeiro tradicional (Web2) e a Blockchain (Web3). Não estamos falando de moedas meme ou especulação vazia. Estamos falando de colocar ativos de trilhões de dólares — Imóveis, Agronegócio, Crédito Privado — dentro da segurança da Blockchain.
                </p>
                <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-2">💰 Fracionamento</h4>
                    <p className="text-sm">Um imóvel de R$ 10 milhões é inacessível. Tokenizado, ele vira 1 milhão de pedaços de R$ 10,00. Qualquer um pode investir.</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-2">🌍 Liquidez Global 24/7</h4>
                    <p className="text-sm">O mercado tradicional fecha às 17h e não funciona no fim de semana. A Blockchain nunca dorme. Venda seus ativos domingo às 3h da manhã.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* SEÇÃO 2: SEGURANÇA JURÍDICA */}
            <section id="juridico" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-4 border-b border-blue-200 pb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ShieldCheck className="w-8 h-8 text-blue-700" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">O "Lastro" Jurídico</h2>
                  <p className="text-slate-500">Código é Lei? Não. A Lei é a Lei. Nós unimos os dois.</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 space-y-6">
                <div className="flex gap-4 items-start">
                  <FileText className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">O Token é o Espelho do Contrato</h3>
                    <p className="text-slate-700 mt-2 leading-relaxed">
                      Para cada ativo listado na LakeTokeniza, existe uma estrutura jurídica robusta no mundo real. Geralmente utilizamos:
                    </p>
                    <ul className="list-disc ml-5 mt-3 space-y-2 text-slate-700">
                      <li><strong>CCB (Cédula de Crédito Bancário):</strong> Para dívidas e recebíveis.</li>
                      <li><strong>SPE (Sociedade de Propósito Específico):</strong> Para projetos imobiliários.</li>
                      <li><strong>Tokens de Recebíveis:</strong> Registrados conforme normas da CVM.</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Landmark className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Garantia de Execução</h3>
                    <p className="text-slate-700 mt-2">
                      Se a plataforma sair do ar, se a internet cair, seu direito de propriedade persiste. O Token serve como prova de titularidade irrefutável para execução judicial se necessário. Isso é segurança institucional.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SEÇÃO 3: TECNOLOGIA LAKEZERO */}
            <section id="lakezero" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-4 border-b border-yellow-200 pb-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Cpu className="w-8 h-8 text-yellow-700" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Arquitetura LakeZero™</h2>
                  <p className="text-slate-500">Por que cobramos uma taxa de sustentabilidade de $0.30?</p>
                </div>
              </div>
              <div className="prose prose-lg text-slate-600 max-w-none">
                <p>
                  O maior problema da Blockchain pura é o custo. Pagar R$ 15,00 de taxa ("Gas") para comprar R$ 50,00 de um ativo inviabiliza o negócio.
                </p>
                <div className="bg-slate-900 text-white p-8 rounded-2xl my-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-emerald-400 font-bold text-lg mb-2 flex items-center gap-2">
                        <Zap className="w-5 h-5" /> Off-Chain Speed
                      </h4>
                      <p className="text-slate-400 text-sm">
                        Todas as ordens de compra, venda e troca dentro da plataforma acontecem em nossos servidores seguros (Rust).
                        <strong>Custo de Gás: ZERO. Velocidade: MILISSEGUNDOS.</strong>
                      </p>
                    </div>
                    <div>
                      <h4 className="text-emerald-400 font-bold text-lg mb-2 flex items-center gap-2">
                        <Lock className="w-5 h-5" /> On-Chain Settlement
                      </h4>
                      <p className="text-slate-400 text-sm">
                        O saldo final e a custódia são sincronizados com a Blockchain pública. Garantindo que ninguém (nem nós) possa alterar o histórico final.
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-700">
                    <div className="flex items-start gap-4">
                      <Coins className="w-6 h-6 text-yellow-400 shrink-0" />
                      <div>
                        <h5 className="font-bold text-white">Taxa de Sustentabilidade ($0.30)</h5>
                        <p className="text-slate-400 text-sm mt-1">
                          Manter servidores de alta performance, auditores de segurança e parcerias jurídicas custa caro.
                          Cobramos uma taxa fixa simbólica para garantir que o sistema seja sustentável, auditável e livre de censura.
                          Além disso, parte dessa taxa alimenta o <strong>Fundo de Liquidez</strong> do protocolo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SEÇÃO NOVO: IDENTIDADE & PRIVACIDADE (BUSINESS LENS) */}
            <section id="identity" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-4 border-b border-cyan-200 pb-4">
                <div className="p-3 bg-cyan-100 rounded-xl">
                  <Fingerprint className="w-8 h-8 text-cyan-700" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Identidade: O "Código Estranho"</h2>
                  <p className="text-slate-500">Por que usamos 0x71... em vez do seu Nome ou CPF?</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="prose prose-lg text-slate-600 max-w-none mb-8">
                  <p>
                    Muitos usuários se assustam ao ver um código como <code>0x71C...9A2</code>. Parece um erro de computador, mas na verdade é a sua <strong>Blindagem de Privacidade</strong>.
                  </p>
                  <p>
                    Pense nisso como uma "Conta Suíça Numerada". O sistema sabe que a conta existe e é válida, mas não precisa saber quem é o dono para deixar você operar. Isso garante que seus dados não vazem em ataques hackers.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-0 border border-slate-200 rounded-xl overflow-hidden">
                  {/* Lado P2P */}
                  <div className="bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Ghost className="w-6 h-6 text-slate-600" />
                      <h3 className="font-bold text-lg text-slate-900">Modo P2P (Liberdade)</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 min-h-[40px]">
                      Para trocas de créditos, tokens de utilidade e serviços digitais peer-to-peer.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex gap-2">✅ <strong>Login:</strong> Apenas Carteira (0x...)</li>
                      <li className="flex gap-2">✅ <strong>Dados:</strong> Zero Exposição</li>
                      <li className="flex gap-2">✅ <strong>Velocidade:</strong> Instantânea</li>
                    </ul>
                  </div>

                  {/* Lado KYC */}
                  <div className="bg-blue-50/50 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <UserCheck className="w-6 h-6 text-blue-600" />
                      <h3 className="font-bold text-lg text-slate-900">Modo Investidor (RWA)</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 min-h-[40px]">
                      Para comprar Imóveis ou Títulos de Dívida (Exigência da Lei/CVM).
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex gap-2">🛡️ <strong>Login:</strong> Carteira + LakeID</li>
                      <li className="flex gap-2">🛡️ <strong>Dados:</strong> KYC (Validação de Doc)</li>
                      <li className="flex gap-2">🛡️ <strong>Segurança:</strong> Proteção Legal Completa</li>
                    </ul>
                  </div>
                </div>
                <p className="text-center text-xs text-slate-400 mt-4">
                  Na LakeTokeniza, você escolhe como quer operar. Privacidade quando possível, Identificação quando necessário.
                </p>
              </div>
            </section>

            {/* SEÇÃO 4: WALLET MASTERCLASS (PRÁTICA) */}
            <section id="wallet-masterclass" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-4 border-b border-purple-200 pb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Wallet className="w-8 h-8 text-purple-700" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Masterclass: Carteiras Digitais</h2>
                  <p className="text-slate-500">Se você não tem a chave, o dinheiro não é seu.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-bold text-slate-800">O Cofre de Vidro</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Pense na Blockchain como um cofre de vidro gigante na praça da cidade. Todos podem ver quanto dinheiro tem em cada caixa, mas ninguém pode tocar.
                      A sua <strong>Wallet</strong> guarda a <strong>CHAVE</strong> que abre a sua caixa.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 w-full md:w-1/3 text-center">
                    <Key className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                    <div className="font-bold text-purple-900">Seed Phrase (Semente)</div>
                    <p className="text-xs text-purple-700 mt-2">
                      Aquelas 12 palavras são o seu dinheiro. Nunca digite em sites suspeitos.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800">Tutorial de Instalação (Recomendado)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Link href="https://phantom.app" target="_blank" className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">1</div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-700">Phantom Wallet (A Favorita)</div>
                        <div className="text-xs text-slate-500">O padrão da indústria na Solana. Interface impecável e super segura.</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
                    </Link>
                    <Link href="https://solflare.com" target="_blank" className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">2</div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-orange-700">Solflare (Institucional)</div>
                        <div className="text-xs text-slate-500">Focada em segurança avançada, ideal para quem vai investir em RWA pesados.</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* SEÇÃO 5: FAUCETS */}
            <section id="faucets" className="scroll-mt-24 space-y-6 pb-20">
              <div className="flex items-center gap-4 border-b border-indigo-200 pb-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Coins className="w-8 h-8 text-indigo-700" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Faucets: Dinheiro de Teste</h2>
                  <p className="text-slate-500">Como conseguir "Devnet SOL" para simular na plataforma.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    <SearchCheck className="w-12 h-12 text-slate-100" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Opção 1: Faucet Oficial da Solana</h3>
                  <ul className="text-sm text-slate-600 space-y-2 mb-6">
                    <li>1. Acesse faucet.solana.com</li>
                    <li>2. Cole o endereço da sua carteira Phantom.</li>
                    <li>3. Selecione "Devnet" e clique em Airdrop.</li>
                    <li>4. Receba 1 SOL na hora.</li>
                  </ul>
                  <Link href="https://faucet.solana.com/" target="_blank" className="w-full block text-center py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors">
                    Ir para Faucet Solana
                  </Link>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Pickaxe className="w-12 h-12 text-slate-100" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Opção 2: QuickNode Faucet (Alternativo)</h3>
                  <ul className="text-sm text-slate-600 space-y-2 mb-6">
                    <li>1. Acesse faucet.quicknode.com/solana/devnet</li>
                    <li>2. Conecte sua carteira.</li>
                    <li>3. Compartilhe no X (opcional) para ganhar bônus.</li>
                    <li>4. Receba o SOL de teste para operar.</li>
                  </ul>
                  <Link href="https://faucet.quicknode.com/solana/devnet" target="_blank" className="w-full block text-center py-3 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-900 transition-colors">
                    Ir para QuickNode Faucet
                  </Link>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}

function Pickaxe(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2L22 9.5" />
      <path d="M4.68 12.32a3 3 0 0 0 4.24 4.24l7.64-7.64a3 3 0 0 0-4.24-4.24l-7.64 7.64z" />
      <path d="m9.62 17.26-6.68 6.68a2 2 0 0 1-2.72-2.95l6.46-6.47" />
    </svg>
  )
}
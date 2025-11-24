"use client";

import { BookOpen, Scale, Server, Coins, BarChart3, ShieldCheck, PieChart, FileText, ChevronDown } from "lucide-react";

export default function LearnPage() {
  const steps = [
    {
      id: 1,
      title: "Avaliação e Auditoria",
      description: "O ativo real (imóvel, energia, dívida) passa por uma auditoria jurídica e financeira rigorosa para garantir sua existência e valor.",
      icon: <Scale className="w-6 h-6 text-blue-600" />,
    },
    {
      id: 2,
      title: "Estruturação Jurídica",
      description: "Criação de um veículo legal (SPV) ou contrato que vincula o ativo físico aos tokens digitais, garantindo proteção pela lei vigente.",
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
    },
    {
      id: 3,
      title: "Emissão na Blockchain",
      description: "Os tokens são gerados na rede (Smart Contracts) representando frações do ativo. Tudo registrado de forma imutável.",
      icon: <Server className="w-6 h-6 text-blue-600" />,
    },
    {
      id: 4,
      title: "Distribuição",
      description: "Investidores compram os tokens no Marketplace. O acesso é democratizado, permitindo tickets baixos.",
      icon: <Coins className="w-6 h-6 text-blue-600" />,
    },
    {
      id: 5,
      title: "Mercado Secundário",
      description: "Diferente de imóveis físicos, você pode vender seus tokens instantaneamente para obter liquidez sem burocracia.",
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
    },
  ];

  return (
    <div className="w-full py-12 bg-slate-50">
      <div className="container mx-auto px-6">

        {/* HERO APRENDA */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Entenda a Tokenização</h1>
          <p className="text-lg text-slate-600">
            Transformamos ativos ilíquidos e burocráticos em ativos digitais ágeis e globais.
            Veja como funciona o processo de ponta a ponta.
          </p>
        </div>

        {/* TIMELINE */}
        <div className="relative max-w-4xl mx-auto mb-24">
          <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-slate-200 hidden md:block"></div>
          <div className="space-y-12">
            {steps.map((step) => (
              <div key={step.id} className="relative flex flex-col md:flex-row gap-8 group">
                <div className="flex-shrink-0 z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-blue-500 group-hover:shadow-blue-500/20 transition-all duration-300">
                    {step.icon}
                  </div>
                </div>
                <div className="flex-grow bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                      Passo 0{step.id}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DEEP DIVE / KNOWLEDGE BASE */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Base de Conhecimento</h2>
            <p className="text-slate-500 mt-2">Mergulhe nos detalhes técnicos e jurídicos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: CVM */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-500/50 transition-all">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Segurança Jurídica & CVM</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                A tokenização de ativos é reconhecida pela CVM (Comissão de Valores Mobiliários).
                Utilizamos estruturas legais sólidas que garantem que o token representa, de fato,
                a propriedade ou o direito de crédito sobre o ativo real. Não é "dinheiro fictício",
                é um contrato digital com validade jurídica.
              </p>
            </div>

            {/* Card 2: Fracionamento */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-amber-500/50 transition-all">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-4 text-amber-600">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">O Poder do Fracionamento</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Imagine um prédio de R$ 10 milhões. Tradicionalmente, apenas grandes fundos poderiam comprá-lo.
                Com a tokenização, dividimos esse prédio em 100.000 pedaços (tokens) de R$ 100.
                Isso permite que você seja "dono" de uma fração do imóvel e receba aluguéis proporcionais.
              </p>
            </div>

            {/* Card 3: Smart Contracts */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-emerald-500/50 transition-all">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Contracts (Contratos Inteligentes)</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                São códigos autoexecutáveis na blockchain. Exemplo: Se o token prevê pagamento de juros dia 05,
                o Smart Contract distribui o valor automaticamente para a carteira de todos os donos do token,
                sem a necessidade de um banco intermediário cobrando taxas altas.
              </p>
            </div>

            {/* Card 4: Custódia */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-purple-500/50 transition-all">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4 text-purple-600">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Custódia e Segurança</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Diferente de deixar dinheiro no banco, na Web3 você tem a custódia dos seus ativos (Self-Custody).
                A LakeTokeniza fornece a infraestrutura, mas os tokens ficam na sua carteira. Isso garante
                transparência total e elimina o "risco da corretora".
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
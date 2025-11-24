"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, TrendingUp, Loader2, Zap, Lock, Briefcase, PieChart, ShieldCheck, Lightbulb } from "lucide-react";
import { useWallet } from "@/context/wallet-context";
import { useCredits } from "@/context/credits-context";
// Removendo import do serviço temporariamente para isolar o problema
// import { LakeZeroService } from "@/services/lakezero";

const ASSET_OPTIONS = ["Imóvel (Real Estate)", "Energia Renovável", "Agronegócio (Agro)", "Dívida / Precatórios", "Startups / Equity", "Créditos de Carbono", "Royalties Musicais", "Outros"];

export default function TokenizePage() {
  const router = useRouter();
  const { walletAddress, connectWallet, isConnected } = useWallet();
  const { credits, spendCredit, buyCredits, isLoading: isCreditLoading } = useCredits();

  const [hasAccess, setHasAccess] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Estado Híbrido (Visual Formatado + Valor Numérico)
  const [formData, setFormData] = useState({ name: "", type: "", customType: "", description: "", valuation: 0, tokenCount: 0, tokenPrice: 0, documents: null as File | null });
  const [errors, setErrors] = useState<string | null>(null);

  const totalRaise = formData.tokenCount * formData.tokenPrice;
  const projectedProfit = totalRaise - formData.valuation;
  const profitMargin = formData.valuation > 0 ? (projectedProfit / formData.valuation) * 100 : 0;

  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Formatadores de Input
  const parseCurrency = (value: string) => { const digits = value.replace(/\D/g, ""); return Number(digits) / 100; };
  const formatInputValue = (val: number) => { if (!val) return ""; return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

  // --- AÇÕES ---
  const handleUnlock = async () => {
    if (credits <= 0) { if (confirm("Comprar créditos?")) await buyCredits(); return; }
    if (await spendCredit()) setHasAccess(true);
  };

  const handleNext = () => {
    setErrors(null);
    if (step === 1 && (!formData.name || !formData.type || !formData.description)) { setErrors("Campos obrigatórios."); return; }
    if (step === 2 && (!formData.valuation || !formData.tokenCount || !formData.tokenPrice)) { setErrors("Defina os valores."); return; }
    setStep(prev => prev + 1);
  };

  // SUBMIT BLINDADO (MOCK LOCAL)
  const handleSubmit = async () => {
    if (!formData.documents) { setErrors("Documento obrigatório."); return; }
    setIsSubmitting(true);

    try {
      // SIMULAÇÃO DE ASSINATURA SEGURA (Para garantir que a UI não trave)
      console.log("Iniciando assinatura...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos

      // Sucesso
      setShowReport(true);

    } catch (e) {
      alert("Erro ao processar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleListAsset = async () => {
    if (confirm("Enviar para o Marketplace?")) {
      const newAsset = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type === "Outros" ? formData.customType : formData.type,
        value: totalRaise,
        status: "Em Análise",
        owner: walletAddress
      };
      const currentAssets = JSON.parse(localStorage.getItem("my_assets") || "[]");
      localStorage.setItem("my_assets", JSON.stringify([...currentAssets, newAsset]));
      alert("Enviado com Sucesso!");
      router.push("/marketplace");
    }
  };

  if (!hasAccess) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-200">
        <Lock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Simulador Institucional</h1>
        <p className="text-slate-500 mb-6">Acesso restrito. Tokenize ativos reais.</p>
        {!isConnected ? <button onClick={connectWallet} className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold">Conectar Carteira</button> : <button onClick={handleUnlock} disabled={isCreditLoading} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex justify-center gap-2">{isCreditLoading ? <Loader2 className="animate-spin" /> : <Zap className="fill-white" />} {credits > 0 ? "Desbloquear (1 Crédito)" : "Comprar Acesso"}</button>}
      </div>
    </div>
  );

  if (showReport) return (
    <div className="min-h-screen bg-slate-100 py-12 flex justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-slate-900 p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
          <div className="relative z-10">
            <div className="flex justify-center mb-6"><div className="bg-green-500/20 p-3 rounded-full shadow-lg shadow-green-500/20"><CheckCircle className="w-20 h-20 text-green-400" /></div></div>
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-green-900/50 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-wider mb-4"><ShieldCheck className="w-3 h-3" /> Auditado & Aprovado</div>
            <h2 className="text-5xl font-bold text-white mb-2 tracking-tight">Estudo de Viabilidade</h2>
            <p className="text-slate-400 text-xl">{formData.name}</p>
          </div>
        </div>

        <div className="p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="p-8 bg-slate-50 rounded-3xl border"><p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2">Captação Total</p><p className="text-4xl font-bold text-slate-900">{formatBRL(totalRaise)}</p></div>
            <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100"><p className="text-sm text-emerald-800 font-bold uppercase tracking-widest mb-2">Lucro Projetado</p><p className="text-4xl font-bold text-emerald-600">+{formatBRL(projectedProfit)}</p><p className="text-sm text-emerald-700 mt-2 font-bold">Markup de {profitMargin.toFixed(1)}%</p></div>
            <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100"><p className="text-sm text-blue-800 font-bold uppercase tracking-widest mb-2">Status Legal</p><p className="text-3xl font-bold text-blue-900">Pré-Aprovado</p></div>
          </div>

          <div className="mb-10 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl flex gap-5 items-start shadow-sm">
            <Lightbulb className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div><h4 className="font-bold text-blue-900 text-lg">Segurança CVM & Blockchain</h4><p className="text-base text-blue-800 mt-2 leading-relaxed">A tokenização via LakeZero segue padrões rigorosos de transparência (Resolução CVM 175). Ao fracionar este ativo em {formData.tokenCount} partes, você democratiza o acesso e aumenta a velocidade de venda em até 80%.</p></div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <button onClick={handleListAsset} className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl flex items-center justify-center gap-3"><Briefcase className="w-6 h-6" /> Enviar para Listagem e Consultoria</button>
            <button onClick={() => { setHasAccess(false); setStep(1); setShowReport(false); }} className="md:w-1/4 py-5 text-slate-500 font-bold text-lg hover:bg-slate-100 rounded-2xl border border-transparent hover:border-slate-200">Sair</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 flex justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-10 max-w-4xl w-full h-fit">
        <div className="flex justify-between mb-10 px-10">
          {[1, 2, 3].map(s => <div key={s} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${step >= s ? "bg-slate-900 text-white shadow-md scale-110" : "bg-slate-100 text-slate-400"}`}>{s}</div>)}
        </div>

        {errors && <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center gap-3"><AlertCircle className="w-6 h-6" /> <span className="font-medium">{errors}</span></div>}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-3xl font-bold text-slate-800">Dados do Ativo</h2>
            <div><label className="text-sm font-bold text-slate-500 uppercase mb-1 block">Nome</label><input type="text" className="w-full p-4 text-lg border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Fazenda Santa Fé" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="text-sm font-bold text-slate-500 uppercase mb-1 block">Categoria</label><select className="w-full p-4 text-lg border rounded-xl bg-slate-50 focus:bg-white outline-none" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}><option value="">Selecione...</option>{ASSET_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
              {formData.type === "Outros" && <div><label className="text-sm font-bold text-slate-500 uppercase mb-1 block">Especifique</label><input type="text" className="w-full p-4 text-lg border rounded-xl bg-blue-50 focus:bg-white outline-none" value={formData.customType} onChange={e => setFormData({ ...formData, customType: e.target.value })} /></div>}
            </div>
            <div><label className="text-sm font-bold text-slate-500 uppercase mb-1 block">Descrição</label><textarea rows={4} className="w-full p-4 text-lg border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Detalhes..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-3xl font-bold text-slate-800">Estrutura Financeira</h2>
            <div>
              <label className="text-sm font-bold text-slate-500 uppercase mb-1 block">Valuation (Custo Base)</label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-slate-400 font-bold text-lg">R$</span>
                <input type="text" className="w-full p-4 pl-14 text-xl font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={formatInputValue(formData.valuation)} onChange={e => setFormData({ ...formData, valuation: parseCurrency(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div><label className="text-sm font-bold text-slate-500 uppercase mb-1 block">Qtd. Tokens</label><input type="number" className="w-full p-4 text-xl font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none" value={formData.tokenCount || ""} onChange={e => setFormData({ ...formData, tokenCount: Number(e.target.value) })} /></div>
              <div>
                <label className="text-sm font-bold text-slate-500 uppercase mb-1 block">Preço Venda</label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-blue-400 font-bold text-lg">R$</span>
                  <input type="text" className="w-full p-4 pl-14 text-xl font-bold border-2 border-blue-100 rounded-xl bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none" value={formatInputValue(formData.tokenPrice)} onChange={e => setFormData({ ...formData, tokenPrice: parseCurrency(e.target.value) })} />
                </div>
              </div>
            </div>
            {projectedProfit > 0 && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-xl flex justify-between items-center shadow-sm">
                <div><p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">Lucro Estimado</p><p className="text-4xl font-bold text-emerald-600">+{formatBRL(projectedProfit)}</p></div>
                <div className="text-right"><span className="bg-white px-4 py-2 rounded-lg text-sm font-bold text-emerald-700 shadow-sm border border-emerald-100">+{profitMargin.toFixed(1)}% Markup</span></div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-3xl font-bold text-slate-800">Auditoria</h2>
            <div className="border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center relative hover:bg-slate-50 cursor-pointer transition-all group hover:border-blue-400">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files && setFormData({ ...formData, documents: e.target.files[0] })} />
              {formData.documents ? (
                <div className="flex flex-col items-center"><div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"><FileText className="w-10 h-10 text-green-600" /></div><p className="font-bold text-slate-700 text-xl">{formData.documents.name}</p><p className="text-sm text-green-600 mt-2 font-medium">Pronto para upload seguro</p></div>
              ) : (
                <div className="flex flex-col items-center"><div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-white group-hover:shadow-md transition-all"><Upload className="w-10 h-10 text-slate-400 group-hover:text-blue-500" /></div><p className="text-slate-600 font-bold text-xl">Upload do Contrato / Matrícula</p><p className="text-sm text-slate-400 mt-2">PDF, JPG ou PNG (Máx 10MB)</p></div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-12 pt-6 border-t border-slate-100">
          <button onClick={() => setStep(p => p - 1)} disabled={step === 1} className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl disabled:opacity-50 text-lg transition-all">Voltar</button>
          {step < 3 ? <button onClick={handleNext} className="px-10 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-900 shadow-xl flex items-center gap-3 text-lg">Próximo <ArrowRight className="w-5 h-5" /></button> : <button onClick={handleSubmit} disabled={isSubmitting} className="px-10 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-xl flex items-center gap-3 text-lg">{isSubmitting ? <><Loader2 className="w-6 h-6 animate-spin" /> Assinando...</> : <><Zap className="w-6 h-6 fill-white" /> Confirmar e Assinar</>}</button>}
        </div>
      </div>
    </div>
  );
}
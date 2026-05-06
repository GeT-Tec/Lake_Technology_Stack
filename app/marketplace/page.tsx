"use client";
import { useState, useEffect } from "react";
import { Search, TrendingUp, Briefcase } from "lucide-react";

const DEMO_ASSETS = [
  { id: 1, name: "Edifício Faria Lima Prime", type: "Real Estate", price: 1200, yield: "12.5% a.a.", available: "45%", image: "bg-blue-900", locked: false },
  { id: 2, name: "Usinas Solares Bahia I", type: "Energia Renovável", price: 850, yield: "14.2% a.a.", available: "12%", image: "bg-amber-600", locked: false }
];

export default function Marketplace() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [assets, setAssets] = useState<any[]>(DEMO_ASSETS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAssets = JSON.parse(localStorage.getItem("my_assets") || "[]");
      const formattedUserAssets = savedAssets.map((asset: any, index: number) => ({
        id: `user-${index}`,
        name: asset.name,
        type: asset.type,
        price: asset.value / 1000,
        yield: "Em Análise",
        available: "100%",
        image: "bg-slate-700",
        locked: true,
        isUserAsset: true
      }));
      setAssets([...formattedUserAssets, ...DEMO_ASSETS]);
    }
  }, []);

  const filteredAssets = activeFilter === "Todos" ? assets : assets.filter(a => a.type.includes(activeFilter) || (activeFilter === "Meus Ativos" && a.isUserAsset));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 px-6"><h1 className="text-3xl font-bold">Marketplace</h1></div>
      <div className="sticky top-20 z-30 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 py-4 px-6 flex justify-between">
        <div className="flex gap-2">{["Todos", "Meus Ativos"].map(f => <button key={f} onClick={() => setActiveFilter(f)} className={`px-4 py-2 rounded-full text-sm font-bold ${activeFilter === f ? "bg-slate-900 text-white" : "bg-white border"}`}>{f}</button>)}</div>
        <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm" /></div>
      </div>
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all">
            <div className={`h-2 w-full ${asset.image}`}></div>
            <div className="p-6">
              <div className="flex justify-between mb-4">
                <div className={`p-2 rounded-lg ${asset.isUserAsset ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>{asset.isUserAsset ? <Briefcase className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}</div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${asset.isUserAsset ? 'bg-purple-100 text-purple-800' : 'bg-green-50 text-green-700'}`}>{asset.isUserAsset ? "EM ANÁLISE" : "ATIVO"}</span>
              </div>
              <h3 className="text-lg font-bold mb-1">{asset.name}</h3>
              <p className="text-xs text-slate-500 uppercase mb-4">{asset.type}</p>
              <button disabled={asset.locked} className={`w-full py-2 rounded-lg font-bold text-sm ${asset.locked ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white'}`}>{asset.isUserAsset ? "Aguardando Aprovação" : "Investir"}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
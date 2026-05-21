"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "@/context/wallet-context";
import { useMedals } from "@/context/medals-context";
import { TrailHead } from "@/components/medals/TrailHead";
import { MedalsGrid } from "@/components/medals/MedalsGrid";
import {
  Droplets,
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
  Key,
  Fingerprint,
  UserCheck,
  Ghost,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useDict } from "@/lib/i18n/client";

export default function LearnPage() {
  const { walletAddress } = useWallet();
  const { award } = useMedals();
  const dict = useDict();
  const t = dict.learn;
  const [recipientAddress, setRecipientAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const rwaSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (walletAddress) {
      setRecipientAddress(walletAddress);
      void award("wallet_connected");
    }
  }, [walletAddress, award]);

  useEffect(() => {
    const node = rwaSectionRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            void award("rwa_intro_read");
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [award]);

  const handleRequestFaucet = async () => {
    if (!recipientAddress) return;
    setLoading(true);
    setTxSignature(null);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/faucet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: recipientAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.faucet.requestFail);
      }

      setTxSignature(data.signature);
      void award("faucet_claimed");
    } catch (err: any) {
      console.error("[Faucet Request Error]", err);
      setErrorMsg(err.message || t.faucet.unknownErr);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 scroll-smooth">

      <TrailHead />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <MedalsGrid />
        </div>
      </div>

      <div className="bg-slate-900 text-white pt-24 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 mb-6">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold tracking-wider uppercase text-emerald-400">{t.academyBadge}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            {t.heroTitle} <br />
            <span className="text-emerald-400">{t.heroTitleAccent}</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {t.heroLead}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          <aside className="lg:w-1/4 hidden lg:block">
            <div className="sticky top-24 space-y-8">

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">{t.sideTheoryTitle}</h3>
                <nav className="flex flex-col space-y-1">
                  <a href="#intro-rwa" className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all text-slate-600 hover:text-emerald-700">
                    <Globe className="w-4 h-4" />
                    <span className="font-medium">{t.navRwa}</span>
                  </a>
                  <a href="#juridico" className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all text-slate-600 hover:text-blue-700">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-medium">{t.navLegal}</span>
                  </a>
                  <a href="#lakezero" className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all text-slate-600 hover:text-yellow-700">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">{t.navLakezero}</span>
                  </a>
                </nav>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">{t.sidePrivacyTitle}</h3>
                <nav className="flex flex-col space-y-1">
                  <a href="#identity" className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all text-slate-600 hover:text-cyan-700">
                    <Fingerprint className="w-4 h-4" />
                    <span className="font-medium">{t.navIdentity}</span>
                  </a>
                </nav>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">{t.sideLabTitle}</h3>
                <nav className="flex flex-col space-y-1">
                  <a href="#wallet-masterclass" className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all text-slate-600 hover:text-purple-700">
                    <Wallet className="w-4 h-4" />
                    <span className="font-medium">{t.navWallet}</span>
                  </a>
                  <a href="#faucets" className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all text-slate-600 hover:text-purple-700">
                    <Droplets className="w-4 h-4" />
                    <span className="font-medium">{t.navFaucets}</span>
                  </a>
                </nav>
              </div>

            </div>
          </aside>

          <main className="lg:w-3/4 space-y-24">

            <section id="intro-rwa" ref={rwaSectionRef} className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-4 border-b border-emerald-200 pb-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Globe className="w-8 h-8 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{t.rwa.title}</h2>
                  <p className="text-slate-500">{t.rwa.subtitle}</p>
                </div>
              </div>
              <div className="prose prose-lg text-slate-600 max-w-none">
                <p>
                  <strong>{t.rwa.p1Bold}</strong>
                </p>
                <p>
                  {t.rwa.p2}
                </p>
                <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-2">{t.rwa.cardFracTitle}</h4>
                    <p className="text-sm">{t.rwa.cardFracDesc}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-2">{t.rwa.cardLiqTitle}</h4>
                    <p className="text-sm">{t.rwa.cardLiqDesc}</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="juridico" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-4 border-b border-blue-200 pb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ShieldCheck className="w-8 h-8 text-blue-700" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{t.legal.title}</h2>
                  <p className="text-slate-500">{t.legal.subtitle}</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 space-y-6">
                <div className="flex gap-4 items-start">
                  <FileText className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{t.legal.mirrorTitle}</h3>
                    <p className="text-slate-700 mt-2 leading-relaxed">
                      {t.legal.mirrorBody}
                    </p>
                    <ul className="list-disc ml-5 mt-3 space-y-2 text-slate-700">
                      <li>{t.legal.bullet1}</li>
                      <li>{t.legal.bullet2}</li>
                      <li>{t.legal.bullet3}</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Landmark className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{t.legal.execTitle}</h3>
                    <p className="text-slate-700 mt-2">
                      {t.legal.execBody}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="lakezero" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-4 border-b border-yellow-200 pb-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Cpu className="w-8 h-8 text-yellow-700" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{t.lakezero.title}</h2>
                  <p className="text-slate-500">{t.lakezero.subtitle}</p>
                </div>
              </div>
              <div className="prose prose-lg text-slate-600 max-w-none">
                <p>
                  {t.lakezero.p1}
                </p>
                <div className="bg-slate-900 text-white p-8 rounded-2xl my-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-emerald-400 font-bold text-lg mb-2 flex items-center gap-2">
                        <Zap className="w-5 h-5" /> {t.lakezero.offTitle}
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {t.lakezero.offBody}{" "}
                        <strong>{t.lakezero.offBoldTail}</strong>
                      </p>
                    </div>
                    <div>
                      <h4 className="text-emerald-400 font-bold text-lg mb-2 flex items-center gap-2">
                        <Lock className="w-5 h-5" /> {t.lakezero.onTitle}
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {t.lakezero.onBody}
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-700">
                    <div className="flex items-start gap-4">
                      <Coins className="w-6 h-6 text-yellow-400 shrink-0" />
                      <div>
                        <h5 className="font-bold text-white">{t.lakezero.feeTitle}</h5>
                        <p className="text-slate-400 text-sm mt-1">
                          {t.lakezero.feeBody}
                          <strong>{t.lakezero.feeBodyHighlight}</strong>
                          {t.lakezero.feeBodyEnd}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="identity" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-4 border-b border-cyan-200 pb-4">
                <div className="p-3 bg-cyan-100 rounded-xl">
                  <Fingerprint className="w-8 h-8 text-cyan-700" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{t.identity.title}</h2>
                  <p className="text-slate-500">{t.identity.subtitle}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="prose prose-lg text-slate-600 max-w-none mb-8">
                  <p>
                    {t.identity.p1Lead}<code>0x71C...9A2</code>{t.identity.p1End}<strong>{t.identity.p1Bold}</strong>{t.identity.p1Suffix}
                  </p>
                  <p>
                    {t.identity.p2}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-0 border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Ghost className="w-6 h-6 text-slate-600" />
                      <h3 className="font-bold text-lg text-slate-900">{t.identity.p2pTitle}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 min-h-[40px]">
                      {t.identity.p2pDesc}
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex gap-2">✅ <strong>{t.identity.p2pLogin}</strong> {t.identity.p2pLoginV}</li>
                      <li className="flex gap-2">✅ <strong>{t.identity.p2pData}</strong> {t.identity.p2pDataV}</li>
                      <li className="flex gap-2">✅ <strong>{t.identity.p2pSpeed}</strong> {t.identity.p2pSpeedV}</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50/50 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <UserCheck className="w-6 h-6 text-blue-600" />
                      <h3 className="font-bold text-lg text-slate-900">{t.identity.kycTitle}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 min-h-[40px]">
                      {t.identity.kycDesc}
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex gap-2">🛡️ <strong>{t.identity.kycLogin}</strong> {t.identity.kycLoginV}</li>
                      <li className="flex gap-2">🛡️ <strong>{t.identity.kycData}</strong> {t.identity.kycDataV}</li>
                      <li className="flex gap-2">🛡️ <strong>{t.identity.kycSec}</strong> {t.identity.kycSecV}</li>
                    </ul>
                  </div>
                </div>
                <p className="text-center text-xs text-slate-400 mt-4">
                  {t.identity.footer}
                </p>
              </div>
            </section>

            <section id="wallet-masterclass" className="scroll-mt-24 space-y-6">
              <div className="flex items-center gap-4 border-b border-purple-200 pb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Wallet className="w-8 h-8 text-purple-700" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{t.walletSec.title}</h2>
                  <p className="text-slate-500">{t.walletSec.subtitle}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-bold text-slate-800">{t.walletSec.glassTitle}</h3>
                    <p className="text-slate-600 leading-relaxed">
                      {t.walletSec.glassBody} <strong>{t.walletSec.glassWalletBold}</strong> {t.walletSec.glassBodyEnd} <strong>{t.walletSec.glassKeyBold}</strong> {t.walletSec.glassBodyTail}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 w-full md:w-1/3 text-center">
                    <Key className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                    <div className="font-bold text-purple-900">{t.walletSec.seedTitle}</div>
                    <p className="text-xs text-purple-700 mt-2">
                      {t.walletSec.seedBody}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800">{t.walletSec.tutorialTitle}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Link href="https://phantom.app" target="_blank" className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">1</div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-700">{t.walletSec.phantomTitle}</div>
                        <div className="text-xs text-slate-500">{t.walletSec.phantomDesc}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
                    </Link>
                    <Link href="https://solflare.com" target="_blank" className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">2</div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-orange-700">{t.walletSec.solflareTitle}</div>
                        <div className="text-xs text-slate-500">{t.walletSec.solflareDesc}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section id="faucets" className="scroll-mt-24 space-y-6 pb-20">
              <div className="flex items-center gap-4 border-b border-indigo-200 pb-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Coins className="w-8 h-8 text-indigo-700" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{t.faucet.title}</h2>
                  <p className="text-slate-500">{t.faucet.subtitle}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border-2 border-indigo-100 shadow-md relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-xl text-slate-900 mb-2 flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-indigo-500" />
                      {t.faucet.nativeTitle}
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      {t.faucet.nativeDesc}
                    </p>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          {t.faucet.addrLabel}
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 text-sm font-mono border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder={t.faucet.addrPlaceholder}
                          value={recipientAddress}
                          onChange={(e) => setRecipientAddress(e.target.value)}
                        />
                      </div>

                      {txSignature && (
                        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl text-emerald-800 text-sm space-y-1 animate-in fade-in duration-200">
                          <p className="font-bold flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            {t.faucet.success}
                          </p>
                          <p className="text-xs text-emerald-600 font-mono break-all leading-relaxed">
                            {t.faucet.signature} {txSignature}
                          </p>
                          <Link
                            href={`https://solscan.io/tx/${txSignature}?cluster=devnet`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline mt-1"
                          >
                            {t.faucet.viewOnSolscan} <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}

                      {errorMsg && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-800 text-sm space-y-1 animate-in fade-in duration-200">
                          <p className="font-bold flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            {t.faucet.failed}
                          </p>
                          <p className="text-xs leading-relaxed">{errorMsg}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleRequestFaucet}
                    disabled={loading || !recipientAddress}
                    className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                      loading || !recipientAddress
                        ? "bg-indigo-300 cursor-not-allowed shadow-none"
                        : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t.faucet.transferring}
                      </>
                    ) : (
                      t.faucet.claimBtn
                    )}
                  </button>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Pickaxe className="w-16 h-16 text-slate-800" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-slate-900 mb-2 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-slate-500" />
                      {t.faucet.qnTitle}
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      {t.faucet.qnDesc}
                    </p>
                    <ul className="text-sm text-slate-600 space-y-3 mb-8">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                        <span>{t.faucet.qnStep1}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                        <span>{t.faucet.qnStep2}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                        <span>{t.faucet.qnStep3}</span>
                      </li>
                    </ul>
                  </div>
                  <Link
                    href="https://faucet.quicknode.com/solana/devnet"
                    target="_blank"
                    className="w-full text-center py-4 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow"
                  >
                    {t.faucet.qnGo}
                    <ExternalLink className="w-4 h-4" />
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

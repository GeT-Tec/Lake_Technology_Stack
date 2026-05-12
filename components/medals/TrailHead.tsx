"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { useMedals } from "@/context/medals-context";
import { MEDALS, type MedalDefinition } from "@/lib/medals";
import { cn } from "@/lib/utils";

// Renderiza as 6 "laminas" da logo Lake como caminho de treinamento.
// Cada lamina = uma fase. As cores derivam diretamente do catalogo (lib/medals).
// Conforme Lake_Presentation_Design.pptx: "Cada parte da logo representa uma
// etapa do treinamento" — Fase 1..5 em pastel + PRO em LakeBlue.

interface BladeProps {
  medal: MedalDefinition;
  earned: boolean;
  index: number;
}

// Offsets horizontais em % que reproduzem o zigzag da logo Lake.
const OFFSETS = [4, 18, 10, 26, 16, 30];

function Blade({ medal, earned, index }: BladeProps) {
  const offset = OFFSETS[index] ?? 0;
  return (
    <Link
      href={`/learn#${medal.anchorId}`}
      className={cn(
        "group relative block w-full transition-transform hover:-translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lake-cyan rounded-full",
      )}
      style={{ marginLeft: `${offset}%` }}
      aria-label={`${medal.label} — ${medal.title}`}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-4 rounded-full pr-6 pl-5 py-4 shadow-sm border transition-all",
          earned
            ? "shadow-md"
            : "opacity-90 group-hover:opacity-100 grayscale-[20%]",
        )}
        style={{
          background: medal.color,
          borderColor: medal.color,
          // PRO usa LakeBlue; texto branco. Demais usam ink (mais legivel sobre pastel).
          color: medal.phase === "PRO" ? "#FFFFFF" : "#0A0A0A",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-extrabold border-2",
              medal.phase === "PRO"
                ? "bg-white/15 border-white/40 text-white"
                : "bg-white/70 border-white text-slate-900",
            )}
          >
            {medal.phase === "PRO" ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              medal.phase
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">
              {medal.label}
            </div>
            <div className="text-lg font-extrabold leading-tight truncate">
              {medal.title}
            </div>
          </div>
        </div>
        <div className="shrink-0">
          {earned ? (
            <CheckCircle2
              className={cn(
                "w-6 h-6",
                medal.phase === "PRO" ? "text-white" : "text-slate-900",
              )}
            />
          ) : (
            <Lock
              className={cn(
                "w-5 h-5",
                medal.phase === "PRO" ? "text-white/70" : "text-slate-900/60",
              )}
            />
          )}
        </div>
      </div>
      <div className="mt-1 px-5 text-xs text-slate-500">
        {earned ? medal.tagline : medal.criteria}
      </div>
    </Link>
  );
}

export function TrailHead() {
  const { isEarned, earned, total } = useMedals();
  const progress = useMemo(
    () => Math.round((earned.length / total) * 100),
    [earned.length, total],
  );

  return (
    <section
      className="relative w-full bg-gradient-to-b from-white via-lake-cyan-soft/40 to-white py-16 md:py-20"
      aria-labelledby="trail-head-title"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lake-cyan-soft text-lake-cyan-dark text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            Trilha Lake
          </span>
          <h2
            id="trail-head-title"
            className="mt-4 text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight"
          >
            Abrindo seus horizontes digitais.
          </h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">
            Cada lâmina da logo Lake é uma fase do seu treinamento. Avance, ganhe
            medalhas e chegue ao modo PRO.
          </p>
          <div className="mt-6">
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-lake-cyan transition-all duration-700"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              />
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-500">
              {earned.length} de {total} medalhas · {progress}% concluído
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {MEDALS.map((m, i) => (
            <Blade
              key={m.id}
              medal={m}
              earned={isEarned(m.id)}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

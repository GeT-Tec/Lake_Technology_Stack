"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MedalDefinition } from "@/lib/medals";

interface Props {
  medal: MedalDefinition;
  earned: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const SIZE_MAP = {
  sm: { wrap: "w-12 h-12 text-xs", label: "text-[10px]" },
  md: { wrap: "w-20 h-20 text-base", label: "text-xs" },
  lg: { wrap: "w-28 h-28 text-lg", label: "text-sm" },
} as const;

export function MedalBadge({
  medal,
  earned,
  size = "md",
  showLabel = true,
}: Props) {
  const s = SIZE_MAP[size];
  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-extrabold tracking-wide border-2 transition-all",
          s.wrap,
          earned
            ? cn(
                medal.bgClass,
                medal.textClass,
                medal.borderClass,
                "shadow-md ring-2 ring-offset-2 ring-offset-white",
                medal.ringClass,
              )
            : "bg-slate-100 text-slate-400 border-slate-200 grayscale",
        )}
        title={earned ? medal.title : `Bloqueada: ${medal.criteria}`}
        aria-label={
          earned
            ? `Medalha ${medal.title} conquistada`
            : `Medalha ${medal.title} bloqueada`
        }
      >
        {earned ? medal.label : <Lock className="w-1/3 h-1/3" />}
      </div>
      {showLabel && (
        <div className={cn("text-center font-semibold", s.label)}>
          <div className={earned ? "text-slate-800" : "text-slate-400"}>
            {medal.title}
          </div>
        </div>
      )}
    </div>
  );
}

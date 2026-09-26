"use client";

import type { Finding } from "@/types";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { FileSearch, Sparkles } from "lucide-react";
import { cn, formatPercent } from "@/lib/utils";

const SEVERITY_CONFIG: Record<
  Finding["severity"],
  {
    border: string;
    bg: string;
    badgeBg: string;
    strictnessLabel: string;
    beaconColor: string;
    shadow: string;
    textColor: string;
  }
> = {
  potential_concern: {
    border: "border-2 border-red-500",
    bg: "bg-gradient-to-br from-red-50/90 via-white to-red-50/40",
    badgeBg: "bg-red-600 text-white shadow-sm",
    strictnessLabel: "Strictness Level: Critical Risk",
    beaconColor: "bg-red-500",
    shadow: "shadow-xl shadow-red-500/15",
    textColor: "text-red-900",
  },
  high: {
    border: "border-2 border-amber-500",
    bg: "bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40",
    badgeBg: "bg-amber-600 text-white shadow-sm",
    strictnessLabel: "Strictness Level: High Attention",
    beaconColor: "bg-amber-500",
    shadow: "shadow-xl shadow-amber-500/15",
    textColor: "text-amber-950",
  },
  review: {
    border: "border-2 border-yellow-500",
    bg: "bg-gradient-to-br from-yellow-50/90 via-white to-yellow-50/40",
    badgeBg: "bg-yellow-600 text-white shadow-sm",
    strictnessLabel: "Strictness Level: Review Needed",
    beaconColor: "bg-yellow-500",
    shadow: "shadow-xl shadow-yellow-500/15",
    textColor: "text-yellow-950",
  },
  low: {
    border: "border-2 border-emerald-500",
    bg: "bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40",
    badgeBg: "bg-emerald-600 text-white shadow-sm",
    strictnessLabel: "Strictness Level: Low Concern / Fair",
    beaconColor: "bg-emerald-500",
    shadow: "shadow-xl shadow-emerald-500/15",
    textColor: "text-emerald-950",
  },
};

/**
 * A prominent, highly illuminated spotlight for the single most important finding.
 * Boldly highlighted according to its strictness level.
 */
export function TopConcern({
  finding,
  onShowWhy,
  onSelect,
}: {
  finding: Finding;
  onShowWhy: () => void;
  onSelect: () => void;
}) {
  const config = SEVERITY_CONFIG[finding.severity];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelect();
        }
      }}
      className={cn(
        "w-full text-left rounded-2xl p-5 sm:p-6 transition-all duration-300 card-3d relative overflow-hidden group cursor-pointer",
        config.border,
        config.bg,
        config.shadow
      )}
    >
      {/* Top Header Banner with Level of Strictness Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                config.beaconColor
              )}
            />
            <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", config.beaconColor)} />
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide",
              config.badgeBg
            )}
          >
            <Sparkles className="h-3 w-3" />
            {config.strictnessLabel}
          </span>
        </div>

        <span className="text-[0.7rem] font-bold text-ink-soft bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-border/80 shadow-2xs">
          {formatPercent(finding.confidence)} AI confidence match
        </span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <SeverityBadge severity={finding.severity} size="md" />
          <h2 className="mt-3 font-serif-heading text-xl sm:text-2xl font-bold text-ink tracking-tight">
            {finding.title}
          </h2>
        </div>
      </div>

      <p className="mt-3 text-sm text-ink-soft leading-relaxed max-w-2xl font-medium">
        {finding.explanation}
      </p>

      {/* Footer Bar with Section info and Show Me Why Button */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-border/60">
        <span className="text-xs font-semibold text-ink-faint">
          {finding.section ? `Clause §${finding.section}` : "Unlabeled clause"}
          {finding.page ? `, page ${finding.page}` : ""}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShowWhy();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand hover:bg-brand-strong px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <FileSearch className="h-4 w-4" aria-hidden="true" />
          Show Me Why &amp; Legal Citations
        </button>
      </div>
    </div>
  );
}

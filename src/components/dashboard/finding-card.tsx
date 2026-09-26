"use client";

import type { Finding } from "@/types";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { cn, formatPercent } from "@/lib/utils";
import { FileSearch, BookmarkPlus, Check, Shield, Sparkles, FileEdit } from "lucide-react";

const SEVERITY_CARD_STYLES: Record<
  Finding["severity"],
  {
    border: string;
    bg: string;
    activeRing: string;
    confidenceBadge: string;
    borderL: string;
  }
> = {
  potential_concern: {
    border: "border-red-200/90 hover:border-red-400",
    bg: "bg-gradient-to-r from-red-50/50 via-white to-white",
    activeRing: "border-red-600 ring-2 ring-red-400/40 shadow-md",
    confidenceBadge: "bg-red-50 text-red-800 border-red-200",
    borderL: "border-l-red-600",
  },
  high: {
    border: "border-amber-200/90 hover:border-amber-400",
    bg: "bg-gradient-to-r from-amber-50/50 via-white to-white",
    activeRing: "border-amber-500 ring-2 ring-amber-400/40 shadow-md",
    confidenceBadge: "bg-amber-50 text-amber-900 border-amber-200",
    borderL: "border-l-amber-500",
  },
  review: {
    border: "border-yellow-200/90 hover:border-yellow-400",
    bg: "bg-gradient-to-r from-yellow-50/50 via-white to-white",
    activeRing: "border-yellow-500 ring-2 ring-yellow-400/40 shadow-md",
    confidenceBadge: "bg-yellow-50 text-yellow-900 border-yellow-200",
    borderL: "border-l-yellow-500",
  },
  low: {
    border: "border-emerald-200/90 hover:border-emerald-400",
    bg: "bg-gradient-to-r from-emerald-50/50 via-white to-white",
    activeRing: "border-emerald-600 ring-2 ring-emerald-400/40 shadow-md",
    confidenceBadge: "bg-emerald-50 text-emerald-900 border-emerald-200",
    borderL: "border-l-emerald-600",
  },
};

export function FindingCard({
  finding,
  active,
  onSelect,
  onShowWhy,
  onSaveToVault,
  isSaved,
  onDraftResponse,
  onOpenAdvisor,
}: {
  finding: Finding;
  active: boolean;
  onSelect: () => void;
  onShowWhy: () => void;
  onSaveToVault?: () => void;
  isSaved?: boolean;
  onDraftResponse?: () => void;
  onOpenAdvisor?: () => void;
}) {
  const style = SEVERITY_CARD_STYLES[finding.severity];
  const primarySource = finding.sources[0];
  const cureTitle = primarySource?.title ?? finding.legalConcept ?? "Statutory Legal Protection";
  const cureExplanation = primarySource?.excerpt ?? finding.whyItMatters ?? finding.explanation;

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-l-4 p-5 transition-all duration-200 cursor-pointer card-3d",
        style.borderL,
        style.bg,
        active ? style.activeRing + " -translate-y-0.5" : style.border + " shadow-xs"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <SeverityBadge severity={finding.severity} size="sm" />
          <h3 className="mt-2 font-bold text-ink text-sm sm:text-base leading-snug">{finding.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[0.7rem] font-bold whitespace-nowrap px-2 py-0.5 rounded border shadow-2xs",
              style.confidenceBadge
            )}
          >
            {formatPercent(finding.confidence)} match
          </span>
          {onSaveToVault && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSaveToVault();
              }}
              className={cn(
                "p-1.5 rounded-lg text-xs transition-all shadow-2xs cursor-pointer",
                isSaved ? "text-low bg-low-bg" : "text-ink-faint hover:text-brand hover:bg-brand-soft"
              )}
              title={isSaved ? "Saved to Evidence Vault" : "Save to Evidence Vault"}
            >
              {isSaved ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Scanned Clause Snippet */}
      {finding.clauseText && (
        <div className="mt-3 rounded-lg border border-border/80 bg-paper/70 p-3 text-xs font-serif italic text-ink leading-relaxed">
          &ldquo;{finding.clauseText}&rdquo;
        </div>
      )}

      {/* THE STATUTORY CURE & LEGAL SHIELD */}
      <div className="mt-3 rounded-xl border border-brand/20 bg-brand-soft/40 p-3 space-y-1">
        <div className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-brand">
          <Shield className="h-3 w-3 text-brand" />
          <span>Statutory Cure &amp; Legal Shield</span>
        </div>
        <p className="text-xs font-bold text-ink">{cureTitle}</p>
        <p className="text-[0.72rem] text-ink-soft leading-relaxed line-clamp-2">
          {cureExplanation}
        </p>
      </div>

      {/* INDIVIDUAL RECOMMENDED NEXT STEPS */}
      {finding.actions && finding.actions.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider text-ink-faint">
            <Sparkles className="h-3 w-3 text-accent" />
            <span>Recommended Next Steps:</span>
          </div>
          <div className="space-y-1.5">
            {finding.actions.slice(0, 2).map((act, i) => (
              <div
                key={act.id || i}
                className="flex items-start gap-2 rounded-lg bg-white/90 border border-border/60 p-2 text-xs"
              >
                <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-brand text-white text-[0.6rem] font-bold mt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink text-[0.75rem] leading-snug">{act.label}</p>
                  {act.description && (
                    <p className="text-[0.68rem] text-ink-soft mt-0.5 line-clamp-1">{act.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTION TOOLBAR */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/70">
        <span className="text-[0.7rem] text-ink-faint font-medium">
          {finding.section ? `Section §${finding.section}` : "Unlabeled clause"}
          {finding.page ? `, page ${finding.page}` : ""}
        </span>
        <div className="flex items-center gap-1.5">
          {onDraftResponse && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDraftResponse();
              }}
              className="inline-flex items-center gap-1 font-semibold text-xs text-white bg-brand hover:bg-brand-strong px-2.5 py-1 rounded-md transition-all shadow-2xs cursor-pointer"
            >
              <FileEdit className="h-3 w-3" />
              Draft Letter
            </button>
          )}
          {onOpenAdvisor && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAdvisor();
              }}
              className="inline-flex items-center gap-1 font-medium text-xs text-ink hover:text-brand bg-paper hover:bg-white border border-border px-2.5 py-1 rounded-md transition-all cursor-pointer"
            >
              <Sparkles className="h-3 w-3 text-accent" />
              Advisor
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShowWhy();
            }}
            className="inline-flex items-center gap-1 font-medium text-xs text-brand hover:text-brand-strong bg-brand-soft/70 hover:bg-brand-soft px-2.5 py-1 rounded-md transition-all cursor-pointer"
          >
            <FileSearch className="h-3 w-3" aria-hidden="true" />
            Show Why
          </button>
        </div>
      </div>
    </div>
  );
}

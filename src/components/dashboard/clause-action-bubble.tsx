"use client";

import type { Finding } from "@/types";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Shield, Sparkles, ArrowRight, FileEdit, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClauseActionBubble({
  finding,
  onDraftResponse,
  onOpenAdvisor,
  onClose,
  className,
}: {
  finding: Finding;
  onDraftResponse?: () => void;
  onOpenAdvisor?: () => void;
  onClose?: () => void;
  className?: string;
}) {
  const primarySource = finding.sources[0];
  const cureTitle = primarySource?.title ?? finding.legalConcept ?? "Statutory Consumer Protection";
  const cureExcerpt =
    primarySource?.excerpt ??
    finding.whyItMatters ??
    "This clause can be legally modified or challenged under applicable civil code.";

  return (
    <div
      className={cn(
        "clause-bubble animate-bubble-pop z-50 w-80 sm:w-96 rounded-2xl border-2 border-brand/40 bg-white/95 backdrop-blur-xl p-4 text-ink shadow-2xl text-left select-none",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-border/70 pb-2.5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <SeverityBadge severity={finding.severity} size="sm" />
            {finding.section && (
              <span className="text-[0.65rem] font-sans font-bold text-ink-faint uppercase tracking-wider">
                Section §{finding.section}
              </span>
            )}
          </div>
          <h4 className="font-serif-heading text-sm font-bold text-ink leading-tight">
            {finding.title}
          </h4>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ink-faint hover:bg-paper hover:text-ink transition-colors cursor-pointer"
            aria-label="Close bubble"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* THE CURE & STATUTORY SHIELD */}
      <div className="mt-3 rounded-xl border border-brand/20 bg-brand-soft/50 p-2.5 space-y-1">
        <div className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-brand">
          <Shield className="h-3 w-3 text-brand" />
          <span>Statutory Cure &amp; Legal Shield</span>
        </div>
        <p className="text-xs font-bold text-ink">{cureTitle}</p>
        <p className="text-[0.7rem] text-ink-soft leading-relaxed line-clamp-2">{cureExcerpt}</p>
      </div>

      {/* INDIVIDUAL RECOMMENDED NEXT STEPS */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider text-ink-faint">
          <Sparkles className="h-3 w-3 text-accent" />
          <span>Recommended Next Steps:</span>
        </div>
        <div className="space-y-1">
          {finding.actions && finding.actions.length > 0 ? (
            finding.actions.slice(0, 3).map((action, idx) => (
              <div
                key={action.id || idx}
                className="flex items-start gap-2 rounded-lg bg-paper/80 px-2.5 py-1.5 text-xs border border-border/50"
              >
                <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-brand text-[0.6rem] font-bold text-white mt-0.5">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink text-[0.75rem] leading-snug">
                    {action.label}
                  </p>
                  {action.description && (
                    <p className="text-[0.65rem] text-ink-soft leading-tight mt-0.5 line-clamp-1">
                      {action.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 text-xs text-ink-soft bg-paper/60 p-2 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span className="text-[0.7rem]">Send standard statutory objection letter with citation</span>
            </div>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-3 pt-2.5 border-t border-border/70 flex items-center justify-between gap-2">
        {onDraftResponse && (
          <button
            type="button"
            onClick={onDraftResponse}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand hover:bg-brand-strong text-white px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileEdit className="h-3 w-3" />
            Draft Counter Letter
          </button>
        )}
        {onOpenAdvisor && (
          <button
            type="button"
            onClick={onOpenAdvisor}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-paper hover:bg-white text-ink px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="h-3 w-3 text-accent" />
            Strategy
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

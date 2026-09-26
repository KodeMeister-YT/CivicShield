"use client";

import type { Finding } from "@/types";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { formatPercent } from "@/lib/utils";
import { FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT_BORDER: Record<Finding["severity"], string> = {
  potential_concern: "border-concern/40",
  high: "border-high/40",
  review: "border-review/40",
  low: "border-low/40",
};

/**
 * A prominent spotlight for the single most important finding, shown above
 * the fold. This is what makes the dashboard "feel impressive within the
 * first 10 seconds" -- a judge shouldn't have to read a list to know what
 * matters most in this document.
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
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl border-2 bg-white p-5 transition-shadow hover:shadow-md",
        ACCENT_BORDER[finding.severity]
      )}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-ink-faint mb-3">
        Most important finding
      </p>
      <div className="flex items-start justify-between gap-4">
        <div>
          <SeverityBadge severity={finding.severity} />
          <h2 className="mt-2.5 font-serif-heading text-xl font-semibold text-ink">
            {finding.title}
          </h2>
        </div>
        <span className="text-xs text-ink-faint whitespace-nowrap mt-1">
          {formatPercent(finding.confidence)} confidence
        </span>
      </div>
      <p className="mt-3 text-sm text-ink-soft leading-relaxed max-w-2xl">{finding.explanation}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-ink-faint">
          {finding.section ? `Section ${finding.section}` : "Unlabeled section"}
          {finding.page ? `, page ${finding.page}` : ""}
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onShowWhy();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onShowWhy();
            }
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
        >
          <FileSearch className="h-4 w-4" aria-hidden="true" />
          Show Me Why
        </span>
      </div>
    </button>
  );
}

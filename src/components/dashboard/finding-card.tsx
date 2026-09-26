"use client";

import type { Finding } from "@/types";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { cn, formatPercent } from "@/lib/utils";
import { FileSearch } from "lucide-react";

export function FindingCard({
  finding,
  active,
  onSelect,
  onShowWhy,
}: {
  finding: Finding;
  active: boolean;
  onSelect: () => void;
  onShowWhy: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-4 transition-colors cursor-pointer",
        active ? "border-brand ring-1 ring-brand" : "border-border hover:border-border-strong"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <SeverityBadge severity={finding.severity} size="sm" />
          <h3 className="mt-2 font-medium text-ink text-sm">{finding.title}</h3>
        </div>
        <span className="text-xs text-ink-faint whitespace-nowrap">
          {formatPercent(finding.confidence)} confidence
        </span>
      </div>
      <p className="mt-2 text-sm text-ink-soft leading-relaxed line-clamp-2">{finding.explanation}</p>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-ink-faint">
          {finding.section ? `Section ${finding.section}` : "Unlabeled section"}
          {finding.page ? `, page ${finding.page}` : ""}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShowWhy();
          }}
          className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
        >
          <FileSearch className="h-3.5 w-3.5" aria-hidden="true" />
          Show Me Why
        </button>
      </div>
    </div>
  );
}

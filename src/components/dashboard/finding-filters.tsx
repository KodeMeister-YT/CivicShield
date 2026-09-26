"use client";

import { cn } from "@/lib/utils";

export type FilterKey = "all" | "high_priority" | "payment" | "termination" | "penalty" | "rights" | "other";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "high_priority", label: "High priority" },
  { key: "payment", label: "Payment" },
  { key: "termination", label: "Termination" },
  { key: "penalty", label: "Penalty" },
  { key: "rights", label: "Rights" },
  { key: "other", label: "Other" },
];

export function FindingFilters({
  active,
  onChange,
}: {
  active: FilterKey;
  onChange: (key: FilterKey) => void;
}) {
  return (
    <div role="tablist" aria-label="Filter findings" className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          role="tab"
          aria-selected={active === f.key}
          onClick={() => onChange(f.key)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
            active === f.key
              ? "bg-brand text-white border-brand"
              : "bg-white text-ink-soft border-border hover:border-border-strong"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export function matchesFilter(finding: { severity: string; category: string }, filter: FilterKey): boolean {
  switch (filter) {
    case "all":
      return true;
    case "high_priority":
      return finding.severity === "high" || finding.severity === "potential_concern";
    case "payment":
      return finding.category === "payment";
    case "termination":
      return finding.category === "termination" || finding.category === "notice_period";
    case "penalty":
      return finding.category === "penalty";
    case "rights":
      return ["deposit", "warranty", "refund", "restriction", "confidentiality"].includes(
        finding.category
      );
    case "other":
      return ![
        "payment",
        "termination",
        "notice_period",
        "penalty",
        "deposit",
        "warranty",
        "refund",
        "restriction",
        "confidentiality",
      ].includes(finding.category);
    default:
      return true;
  }
}

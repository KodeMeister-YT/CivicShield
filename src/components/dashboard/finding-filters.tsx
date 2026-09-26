"use client";

import { cn } from "@/lib/utils";

export type FilterKey =
  | "all"
  | "potential_concern"
  | "high"
  | "review"
  | "low"
  | "termination"
  | "rights";

interface SeverityFilterConfig {
  key: FilterKey;
  label: string;
  dotColor: string;
  inactiveClass: string;
  activeClass: string;
  badgeInactive: string;
  badgeActive: string;
}

const SEVERITY_FILTERS: SeverityFilterConfig[] = [
  {
    key: "all",
    label: "All Findings",
    dotColor: "bg-slate-500",
    inactiveClass: "border-slate-300 bg-white text-slate-800 hover:border-slate-500 hover:bg-slate-50",
    activeClass: "border-2 border-slate-900 bg-slate-900 text-white shadow-md ring-2 ring-slate-400/30",
    badgeInactive: "bg-slate-100 text-slate-800",
    badgeActive: "bg-white/20 text-white",
  },
  {
    key: "potential_concern",
    label: "Critical Concern",
    dotColor: "bg-red-500",
    inactiveClass: "border-red-200 bg-red-50/80 text-red-800 hover:border-red-400 hover:bg-red-100",
    activeClass: "border-2 border-red-600 bg-red-600 text-white shadow-md ring-2 ring-red-400/30",
    badgeInactive: "bg-red-100 text-red-900 font-bold",
    badgeActive: "bg-white/25 text-white",
  },
  {
    key: "high",
    label: "High Attention",
    dotColor: "bg-amber-500",
    inactiveClass: "border-amber-200 bg-amber-50/80 text-amber-900 hover:border-amber-400 hover:bg-amber-100",
    activeClass: "border-2 border-amber-600 bg-amber-600 text-white shadow-md ring-2 ring-amber-400/30",
    badgeInactive: "bg-amber-100 text-amber-950 font-bold",
    badgeActive: "bg-white/25 text-white",
  },
  {
    key: "review",
    label: "Review Needed",
    dotColor: "bg-yellow-500",
    inactiveClass: "border-yellow-200 bg-yellow-50/80 text-yellow-900 hover:border-yellow-400 hover:bg-yellow-100",
    activeClass: "border-2 border-yellow-500 bg-yellow-500 text-white shadow-md ring-2 ring-yellow-400/30",
    badgeInactive: "bg-yellow-100 text-yellow-950 font-bold",
    badgeActive: "bg-white/25 text-white",
  },
  {
    key: "low",
    label: "Low Concern",
    dotColor: "bg-emerald-500",
    inactiveClass: "border-emerald-200 bg-emerald-50/80 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100",
    activeClass: "border-2 border-emerald-600 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/30",
    badgeInactive: "bg-emerald-100 text-emerald-950 font-bold",
    badgeActive: "bg-white/25 text-white",
  },
];

const TOPIC_FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "termination", label: "Termination & Notice Clauses" },
  { key: "rights", label: "Deposits, Warranties & Rights" },
];

export function FindingFilters({
  active,
  counts,
  onChange,
}: {
  active: FilterKey;
  counts?: {
    total: number;
    potential_concern?: number;
    high?: number;
    review?: number;
    low?: number;
  };
  onChange: (key: FilterKey) => void;
}) {
  function getCount(key: FilterKey): number | undefined {
    if (!counts) return undefined;
    if (key === "all") return counts.total;
    if (key === "potential_concern") return counts.potential_concern;
    if (key === "high") return counts.high;
    if (key === "review") return counts.review;
    if (key === "low") return counts.low;
    return undefined;
  }

  return (
    <div
      role="tablist"
      aria-label="Filter findings by severity or category"
      className="space-y-3 rounded-2xl border border-border bg-white p-3.5 sm:p-4 shadow-sm"
    >
      {/* Primary Severity Row: Equally Spaced & Strictness Color-Coded */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {SEVERITY_FILTERS.map((f) => {
          const count = getCount(f.key);
          const isActive = active === f.key;

          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(f.key)}
              className={cn(
                "flex items-center justify-between gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all border cursor-pointer card-3d-subtle",
                isActive ? f.activeClass : f.inactiveClass
              )}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full flex-shrink-0",
                    isActive ? "bg-white ring-1 ring-white/50" : f.dotColor
                  )}
                />
                <span className="truncate">{f.label}</span>
              </div>
              {count !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[0.7rem] font-black flex-shrink-0 shadow-2xs",
                    isActive ? f.badgeActive : f.badgeInactive
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category / Topic Filters: Separated Row with Clean Spacing */}
      <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-border/60">
        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-ink-faint mr-1">
          Topic Filter:
        </span>
        {TOPIC_FILTERS.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(t.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border cursor-pointer",
                isActive
                  ? "bg-brand text-white border-brand shadow-xs"
                  : "bg-paper text-ink-soft border-border hover:bg-white hover:text-ink hover:border-slate-300"
              )}
            >
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function matchesFilter(
  finding: { severity: string; category: string },
  filter: FilterKey
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "potential_concern":
      return finding.severity === "potential_concern";
    case "high":
      return finding.severity === "high";
    case "review":
      return finding.severity === "review";
    case "low":
      return finding.severity === "low";
    case "termination":
      return finding.category === "termination" || finding.category === "notice_period";
    case "rights":
      return [
        "deposit",
        "warranty",
        "refund",
        "restriction",
        "confidentiality",
        "maintenance",
      ].includes(finding.category);
    default:
      return true;
  }
}

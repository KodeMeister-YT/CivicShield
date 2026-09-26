import type { DocumentAnalysis } from "@/types";
import { SEVERITY_META } from "@/components/ui/severity-badge";
import { Download, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FilterKey } from "./finding-filters";
import { cn } from "@/lib/utils";

export function StatusSummary({
  analysis,
  activeFilter = "all",
  onFilterSelect,
  onExportReport,
}: {
  analysis: DocumentAnalysis;
  activeFilter?: FilterKey;
  onFilterSelect?: (filter: FilterKey) => void;
  onExportReport?: () => void;
}) {
  const { counts, total } = analysis.summary;
  const order: Array<keyof typeof counts> = ["potential_concern", "high", "review", "low"];

  return (
    <div className="rounded-xl border border-border bg-white px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="font-serif-heading text-base sm:text-lg font-semibold text-ink">
            Document Analysis
          </h2>
          {analysis.jurisdiction && (
            <span className="inline-flex items-center gap-1 rounded bg-brand-soft px-2 py-0.5 text-[0.7rem] font-medium text-brand">
              <MapPin className="h-3 w-3" />
              {analysis.jurisdiction}
            </span>
          )}
          <span className="text-xs text-ink-faint">
            ({analysis.isDemo ? "Demo" : analysis.fileName} &middot; {total} clause{total === 1 ? "" : "s"} reviewed)
          </span>
        </div>
        {onExportReport && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onExportReport}
            className="self-start sm:self-auto h-8 text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export Report
          </Button>
        )}
      </div>

      <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 perspective-1000">
        {order.map((key) => {
          const meta = SEVERITY_META[key];
          const Icon = meta.icon;
          const isSelected = activeFilter === key;
          const count = counts[key];

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (onFilterSelect) {
                  onFilterSelect(isSelected ? "all" : (key as FilterKey));
                }
              }}
              title={`Click to filter: ${meta.label} (${count})`}
              className={cn(
                "relative text-left rounded-xl p-3 transition-all duration-200 cursor-pointer border flex flex-col justify-between card-3d",
                meta.bg,
                isSelected
                  ? "ring-2 ring-brand ring-offset-2 border-brand shadow-md -translate-y-1 bg-white"
                  : "border-border/70 hover:border-border-strong hover:bg-white/80 shadow-2xs"
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <div className={cn("flex items-center gap-1.5 text-xs font-bold", meta.textColor)}>
                  <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{meta.label}</span>
                </div>
                {isSelected ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white text-[10px] shadow-xs">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full opacity-60 bg-current" />
                )}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-ink leading-tight tracking-tight">{count}</span>
                <span className="text-[0.65rem] text-ink-faint font-semibold uppercase tracking-wider">
                  {isSelected ? "Active Filter" : "Click to view"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

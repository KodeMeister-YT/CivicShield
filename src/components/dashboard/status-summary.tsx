import type { DocumentAnalysis } from "@/types";
import { SEVERITY_META } from "@/components/ui/severity-badge";

export function StatusSummary({ analysis }: { analysis: DocumentAnalysis }) {
  const { counts, total } = analysis.summary;
  const order: Array<keyof typeof counts> = ["potential_concern", "high", "review", "low"];

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif-heading text-lg font-semibold text-ink">Document Analysis</h2>
        <span className="text-xs text-ink-faint">{analysis.isDemo ? "Demo document" : analysis.fileName}</span>
      </div>
      <p className="text-sm text-ink-soft mt-1">
        {total} clause{total === 1 ? "" : "s"} reviewed
      </p>
      <ul className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {order.map((key) => {
          const meta = SEVERITY_META[key];
          const Icon = meta.icon;
          return (
            <li key={key} className={`rounded-md ${meta.bg} px-3 py-2.5`}>
              <div className={`flex items-center gap-1.5 text-xs font-medium ${meta.textColor}`}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {meta.label}
              </div>
              <p className="mt-1 text-xl font-semibold text-ink">{counts[key]}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

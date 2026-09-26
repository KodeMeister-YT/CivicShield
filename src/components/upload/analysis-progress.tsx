"use client";

import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STAGES = [
  { key: "reading", label: "Reading document" },
  { key: "extracting", label: "Extracting clauses" },
  { key: "detecting_issues", label: "Identifying legal issues" },
  { key: "verifying_sources", label: "Verifying against sources" },
  { key: "building_action_plan", label: "Building action plan" },
] as const;

/**
 * Simulated staged progress. The real pipeline runs as a single request,
 * but presenting it as discrete stages (per product spec section 32) makes
 * the AI feel understandable rather than a black box, and keeps the UI
 * responsive during the request.
 */
export function AnalysisProgress({ done }: { done: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i < STAGES.length - 1 ? i + 1 : i));
    }, 700);
    return () => clearInterval(interval);
  }, [done]);

  const displayIndex = done ? STAGES.length : activeIndex;

  return (
    <ul className="space-y-3" aria-live="polite">
      {STAGES.map((stage, i) => {
        const complete = i < displayIndex || done;
        const active = i === displayIndex && !done;
        return (
          <li key={stage.key} className="flex items-center gap-3 text-sm">
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0",
                complete ? "bg-low text-white" : active ? "bg-brand-soft text-brand" : "bg-paper border border-border"
              )}
            >
              {complete ? (
                <Check className="h-3 w-3" aria-hidden="true" />
              ) : active ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              ) : null}
            </span>
            <span className={complete || active ? "text-ink" : "text-ink-faint"}>
              {stage.label}
              {complete && <span className="sr-only"> (complete)</span>}
              {active && <span className="sr-only"> (in progress)</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

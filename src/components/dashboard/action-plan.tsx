"use client";

import type { Action, Finding } from "@/types";
import { useState } from "react";
import { Check, ExternalLink, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActionPlan({
  finding,
  onGenerateResponse,
}: {
  finding: Finding;
  onGenerateResponse: () => void;
}) {
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(finding.actions.filter((a) => a.completed).map((a) => a.id))
  );

  function toggle(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif-heading text-lg font-bold text-ink">Action Plan &middot; Recommended Next Steps</h3>
          <p className="text-xs text-ink-soft">Tactical step-by-step instructions to protect your legal position.</p>
        </div>
        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-ink-faint bg-paper px-2 py-0.5 rounded border border-border">
          {completed.size}/{finding.actions.length} Completed
        </span>
      </div>

      <ol className="space-y-2 pt-1">
        {finding.actions.map((action, i) => (
          <ActionRow
            key={action.id}
            index={i + 1}
            action={action}
            done={completed.has(action.id)}
            onToggle={() => toggle(action.id)}
            onGenerateResponse={onGenerateResponse}
          />
        ))}
      </ol>
    </div>
  );
}

function ActionRow({
  index,
  action,
  done,
  onToggle,
  onGenerateResponse,
}: {
  index: number;
  action: Action;
  done: boolean;
  onToggle: () => void;
  onGenerateResponse: () => void;
}) {
  return (
    <li
      className={cn(
        "flex items-start gap-3.5 rounded-xl border p-3.5 transition-all duration-200 card-3d-subtle",
        done
          ? "border-emerald-200/60 bg-emerald-50/30 opacity-75"
          : "border-border bg-white hover:border-brand/40 hover:shadow-2xs"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        aria-label={done ? `Mark "${action.label}" as not completed` : `Mark "${action.label}" as completed`}
        className={cn(
          "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer shadow-2xs",
          done
            ? "bg-emerald-600 border-emerald-600 text-white"
            : "border-border-strong bg-paper hover:border-brand text-transparent hover:bg-brand-soft"
        )}
      >
        <Check className={cn("h-3 w-3 stroke-[3]", done ? "text-white" : "text-transparent")} aria-hidden="true" />
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn("text-xs sm:text-sm font-semibold transition-all", done ? "text-ink-faint line-through" : "text-ink")}>
          <span className="text-brand font-bold mr-1.5">{index}.</span>
          {action.label}
        </p>
        {action.description && (
          <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">{action.description}</p>
        )}
      </div>

      {action.kind === "generate_response" && (
        <button
          onClick={onGenerateResponse}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-strong px-2.5 py-1.5 rounded-lg shadow-2xs transition-all flex-shrink-0 cursor-pointer"
        >
          <FileEdit className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Draft Letter</span>
        </button>
      )}

      {action.href && (
        <a
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-strong bg-brand-soft px-2.5 py-1.5 rounded-lg transition-all flex-shrink-0"
        >
          <span>Official Law</span>
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      )}
    </li>
  );
}



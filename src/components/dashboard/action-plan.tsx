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
    <div>
      <h3 className="font-serif-heading text-lg font-semibold text-ink mb-1">Your next steps</h3>
      <p className="text-sm text-ink-soft mb-4">Concrete actions for this specific finding.</p>
      <ol className="space-y-2.5">
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
    <li className="flex items-start gap-3 rounded-md border border-border p-3">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        aria-label={done ? `Mark "${action.label}" as not completed` : `Mark "${action.label}" as completed`}
        className={cn(
          "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border",
          done ? "bg-low border-low text-white" : "border-border-strong text-transparent"
        )}
      >
        <Check className="h-3 w-3" aria-hidden="true" />
      </button>
      <div className="flex-1">
        <p className={cn("text-sm font-medium", done ? "text-ink-faint line-through" : "text-ink")}>
          {index}. {action.label}
        </p>
        {action.description && <p className="text-xs text-ink-faint mt-0.5">{action.description}</p>}
      </div>
      {action.kind === "generate_response" && (
        <button
          onClick={onGenerateResponse}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline whitespace-nowrap"
        >
          <FileEdit className="h-3.5 w-3.5" aria-hidden="true" />
          Generate
        </button>
      )}
      {action.href && (
        <a
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline whitespace-nowrap"
        >
          View <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      )}
    </li>
  );
}



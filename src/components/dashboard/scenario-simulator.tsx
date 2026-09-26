"use client";

import type { Finding, ScenarioNode, ScenarioResult } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What happens if I terminate this agreement early?",
  "What happens if I don't pay this amount?",
  "What happens if I don't respond at all?",
];

export function ScenarioSimulator({
  finding,
  onClose,
}: {
  finding?: Finding;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(q: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, finding }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not process this question.");
        return;
      }
      setResult(data.result);
    } catch {
      setError("The scenario simulator is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scenario-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-md p-0 sm:p-6 animate-fade-in"
    >
      <div className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-t-xl sm:rounded-xl bg-white shadow-2xl p-6 animate-modal-in border border-border">
        <div className="flex items-start justify-between">
          <h2 id="scenario-title" className="font-serif-heading text-xl font-semibold text-ink">
            What happens if…?
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-faint hover:text-ink p-1.5 rounded hover:bg-brand-soft"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!result && (
          <div className="mt-5">
            <label htmlFor="scenario-question" className="text-sm font-medium text-ink">
              Ask a question about this document
            </label>
            <textarea
              id="scenario-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="What happens if..."
              className="mt-1.5 w-full rounded-md border border-border-strong px-3 py-2.5 text-sm"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuestion(s)}
                  className="text-xs rounded-full border border-border px-2.5 py-1 text-ink-soft hover:border-border-strong"
                >
                  {s}
                </button>
              ))}
            </div>
            {error && <p className="mt-3 text-sm text-concern">{error}</p>}
            <Button
              onClick={() => ask(question)}
              disabled={loading || question.trim().length < 3}
              className="mt-4 w-full"
            >
              {loading ? "Thinking…" : "Simulate scenario"}
            </Button>
          </div>
        )}

        {result && (
          <div className="mt-5">
            {result.knownFacts.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-faint mb-1.5">
                  Known facts
                </p>
                <ul className="text-sm text-ink-soft space-y-1 list-disc list-inside">
                  {result.knownFacts.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint mb-2">
              Decision tree
            </p>
            <DecisionTreeNode node={result.decisionTree} depth={0} />

            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint mt-5 mb-2">
              Possible outcomes
            </p>
            <ul className="space-y-1.5">
              {result.possibleOutcomes.map((o) => (
                <li key={o.id} className="flex items-center gap-2 text-sm">
                  <CertaintyTag certainty={o.certainty} />
                  <span className="text-ink-soft">{o.label}</span>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-xs text-ink-faint italic">{result.disclaimer}</p>
            <Button variant="secondary" onClick={() => setResult(null)} className="mt-4 w-full">
              Ask another question
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function DecisionTreeNode({ node, depth }: { node: ScenarioNode; depth: number }) {
  return (
    <div className={cn(depth > 0 && "ml-4 mt-2")}>
      <div className="rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink">
        {node.text}
      </div>
      {node.children.length > 0 && (
        <div className="ml-2 mt-1 flex flex-col items-start">
          <ArrowDown className="h-3.5 w-3.5 text-ink-faint ml-1" aria-hidden="true" />
          {node.children.map((child) => (
            <DecisionTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function CertaintyTag({ certainty }: { certainty: "known" | "possible" | "uncertain" }) {
  const map = {
    known: { label: "Known", cls: "bg-low-bg text-low" },
    possible: { label: "Possible", cls: "bg-review-bg text-review" },
    uncertain: { label: "Uncertain", cls: "bg-paper text-ink-faint border border-border" },
  };
  const m = map[certainty];
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide", m.cls)}>
      {m.label}
    </span>
  );
}

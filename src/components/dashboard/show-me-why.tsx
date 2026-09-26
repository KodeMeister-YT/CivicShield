"use client";

import type { Finding } from "@/types";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { formatPercent } from "@/lib/utils";
import { X, ExternalLink, ScrollText, Scale, Brain, Gauge, Sparkles, BookmarkPlus, Check } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export function ShowMeWhy({
  finding,
  onClose,
  onWhatCanIDo,
  onSaveToVault,
  isSaved,
}: {
  finding: Finding;
  onClose: () => void;
  onWhatCanIDo: () => void;
  onSaveToVault?: () => void;
  isSaved?: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="show-why-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-md p-0 sm:p-6 animate-fade-in"
    >
      <div className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-t-xl sm:rounded-xl bg-white shadow-2xl animate-modal-in border border-border">
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <SeverityBadge severity={finding.severity} />
            <h2 id="show-why-title" className="mt-3 font-serif-heading text-xl font-semibold text-ink">
              {finding.title}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {onSaveToVault && (
              <button
                type="button"
                onClick={onSaveToVault}
                className="text-ink-faint hover:text-brand p-1.5 rounded hover:bg-brand-soft transition-colors"
                title={isSaved ? "Saved to vault" : "Save to vault"}
              >
                {isSaved ? <Check className="h-4 w-4 text-low" /> : <BookmarkPlus className="h-4 w-4" />}
              </button>
            )}
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close"
              className="text-ink-faint hover:text-ink p-1.5 rounded hover:bg-brand-soft"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          <Section icon={ScrollText} title="What the document says">
            <blockquote className="border-l-2 border-border-strong pl-3 text-sm text-ink italic">
              &ldquo;{finding.clauseText}&rdquo;
            </blockquote>
            <p className="mt-2 text-xs text-ink-faint">
              {finding.section ? `Section ${finding.section}` : "Section unlabeled"}
              {finding.page ? ` · Page ${finding.page}` : ""}
            </p>
          </Section>

          <Section title="Why this matters">
            <p className="text-sm text-ink-soft leading-relaxed">{finding.whyItMatters}</p>
          </Section>

          <Section icon={Scale} title="Legal basis">
            {finding.sources.length === 0 || !finding.sources[0].verified ? (
              <p className="text-sm text-ink-faint italic">Source verification unavailable.</p>
            ) : (
              <ul className="space-y-3">
                {finding.sources.map((s) => (
                  <li key={s.id} className="rounded-md border border-border p-3">
                    <p className="text-sm font-medium text-ink">{s.title}</p>
                    <p className="text-xs text-ink-faint mt-0.5">{s.authority} · {s.jurisdiction}</p>
                    <p className="text-sm text-ink-soft mt-2 leading-relaxed">{s.excerpt}</p>
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                      >
                        View source <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section icon={Brain} title="AI reasoning">
            <p className="text-sm text-ink-soft leading-relaxed">{finding.reasoning}</p>
          </Section>

          <div className="rounded-md border border-border p-3">
            <p className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-2">
              Fact vs. interpretation
            </p>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs font-medium text-ink-faint">From your document</dt>
                <dd className="text-ink-soft">{truncate(finding.factVsInference.fromDocument, 140)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-ink-faint">AI interpretation</dt>
                <dd className="text-ink-soft">{finding.factVsInference.aiInterpretation}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-ink-faint">Legal source</dt>
                <dd className="text-ink-soft">{truncate(finding.factVsInference.legalSource, 140)}</dd>
              </div>
            </dl>
          </div>

          <Section icon={Gauge} title="Confidence">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-paper overflow-hidden">
                <div
                  className="h-full bg-brand"
                  style={{ width: `${Math.round(finding.confidence * 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-ink">{formatPercent(finding.confidence)}</span>
            </div>
            {finding.needsProfessionalReview && (
              <p className="mt-2 text-xs text-ink-faint">
                This situation may require professional legal review.
              </p>
            )}
          </Section>

          <Button onClick={onWhatCanIDo} className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            What can I do? (AI Strategic Guidance)
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon?: typeof ScrollText;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint mb-2">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        {title}
      </h3>
      {children}
    </div>
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

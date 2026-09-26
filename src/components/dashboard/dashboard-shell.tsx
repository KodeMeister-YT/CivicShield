"use client";

import { useMemo, useState } from "react";
import type { DocumentAnalysis, Finding } from "@/types";
import { StatusSummary } from "./status-summary";
import { DocumentViewer } from "./document-viewer";
import { FindingCard } from "./finding-card";
import { FindingFilters, matchesFilter, type FilterKey } from "./finding-filters";
import { ShowMeWhy } from "./show-me-why";
import { ActionPlan } from "./action-plan";
import { ResponseGenerator } from "./response-generator";
import { ScenarioSimulator } from "./scenario-simulator";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, MessageCircleQuestion } from "lucide-react";
import { addVaultItem } from "@/lib/client/vault-store";
import { randomId } from "@/lib/client/id";
import { TopConcern } from "./top-concern";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Highest concern first, so the dashboard leads with what matters most --
// a judge (or a real user) should see the biggest issue within seconds,
// not have to hunt for it in document order.
const SEVERITY_ORDER: Record<Finding["severity"], number> = {
  potential_concern: 0,
  high: 1,
  review: 2,
  low: 3,
};

export function DashboardShell({ analysis }: { analysis: DocumentAnalysis }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const sortedFindings = useMemo(
    () =>
      [...analysis.findings].sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
      ),
    [analysis.findings]
  );

  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(
    sortedFindings[0]?.id ?? null
  );
  const [showWhyId, setShowWhyId] = useState<string | null>(null);
  const [responseFindingId, setResponseFindingId] = useState<string | null>(null);
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const topFinding = sortedFindings[0] ?? null;

  const filteredFindings = useMemo(
    () =>
      sortedFindings.filter((f) => f.id !== topFinding?.id && matchesFilter(f, filter)),
    [sortedFindings, filter, topFinding]
  );

  const selectedFinding = analysis.findings.find((f) => f.id === selectedFindingId) ?? null;
  const showWhyFinding = analysis.findings.find((f) => f.id === showWhyId) ?? null;
  const responseFinding = analysis.findings.find((f) => f.id === responseFindingId) ?? null;
  const flaggedClauseIds = new Set(analysis.findings.map((f) => f.clauseId));

  function saveFindingToVault(finding: Finding) {
    addVaultItem({
      id: randomId(),
      type: "clause",
      title: finding.title,
      content: finding.clauseText,
      createdAt: new Date().toISOString(),
      analysisId: analysis.id,
    });
    setSavedIds((prev) => new Set(prev).add(finding.id));
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b border-border bg-paper px-6 py-4">
        <div className="mx-auto max-w-7xl flex flex-col gap-3">
          <Link
            href={analysis.isDemo ? "/demo" : "/analyze"}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-faint hover:text-ink transition-colors w-fit"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {analysis.isDemo ? "Back to demo cases" : "Analyze another document"}
          </Link>
          <StatusSummary analysis={analysis} />
        </div>
      </div>

      {/* Desktop: split screen. Mobile: stacked (document -> findings -> actions). */}
      <div className="flex-1 overflow-hidden grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="hidden lg:block border-r border-border overflow-hidden">
          <DocumentViewer
            document={analysis.document}
            activeClauseId={selectedFinding?.clauseId ?? null}
            flaggedClauseIds={flaggedClauseIds}
          />
        </div>

        <div className="overflow-y-auto scrollbar-thin px-6 py-6">
          <div className="lg:hidden mb-6 rounded-lg border border-border overflow-hidden h-64">
            <DocumentViewer
              document={analysis.document}
              activeClauseId={selectedFinding?.clauseId ?? null}
              flaggedClauseIds={flaggedClauseIds}
            />
          </div>

          {topFinding && (
            <TopConcern
              finding={topFinding}
              onShowWhy={() => setShowWhyId(topFinding.id)}
              onSelect={() => setSelectedFindingId(topFinding.id)}
            />
          )}

          <div className="flex items-center justify-between gap-3 mb-4 mt-8">
            <FindingFilters active={filter} onChange={setFilter} />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setScenarioOpen(true)}
              className="whitespace-nowrap"
            >
              <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
              What happens if…?
            </Button>
          </div>

          <div className="space-y-3">
            {filteredFindings.length === 0 ? (
              <p className="text-sm text-ink-faint py-10 text-center">
                {sortedFindings.length <= 1
                  ? "No other findings to review."
                  : "No findings match this filter."}
              </p>
            ) : (
              filteredFindings.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  active={finding.id === selectedFindingId}
                  onSelect={() => setSelectedFindingId(finding.id)}
                  onShowWhy={() => setShowWhyId(finding.id)}
                />
              ))
            )}
          </div>

          {selectedFinding && (
            <div className="mt-8 rounded-lg border border-border bg-white p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                  Action plan &middot; {selectedFinding.title}
                </p>
                <button
                  onClick={() => saveFindingToVault(selectedFinding)}
                  disabled={savedIds.has(selectedFinding.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline disabled:text-ink-faint disabled:no-underline whitespace-nowrap"
                >
                  <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
                  {savedIds.has(selectedFinding.id) ? "Saved to vault" : "Save to vault"}
                </button>
              </div>
              <ActionPlan
                finding={selectedFinding}
                onGenerateResponse={() => setResponseFindingId(selectedFinding.id)}
              />
            </div>
          )}
        </div>
      </div>

      {showWhyFinding && (
        <ShowMeWhy
          finding={showWhyFinding}
          onClose={() => setShowWhyId(null)}
          onWhatCanIDo={() => {
            setSelectedFindingId(showWhyFinding.id);
            setShowWhyId(null);
          }}
        />
      )}

      {responseFinding && (
        <ResponseGenerator finding={responseFinding} onClose={() => setResponseFindingId(null)} />
      )}

      {scenarioOpen && (
        <ScenarioSimulator finding={selectedFinding ?? undefined} onClose={() => setScenarioOpen(false)} />
      )}
    </div>
  );
}

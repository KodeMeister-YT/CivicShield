"use client";

import { useMemo, useState, useRef } from "react";
import type { DocumentAnalysis, Finding } from "@/types";
import { StatusSummary } from "./status-summary";
import { DocumentViewer } from "./document-viewer";
import { FindingCard } from "./finding-card";
import { FindingFilters, matchesFilter, type FilterKey } from "./finding-filters";
import { ShowMeWhy } from "./show-me-why";
import { ActionPlan } from "./action-plan";
import { ResponseGenerator } from "./response-generator";
import { ScenarioSimulator } from "./scenario-simulator";
import { AiAdvisor } from "./ai-advisor";
import { ExportReportModal } from "./export-report";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, MessageCircleQuestion, Sparkles } from "lucide-react";
import { addVaultItem } from "@/lib/client/vault-store";
import { showToast } from "@/components/ui/toast";
import { randomId } from "@/lib/client/id";
import { TopConcern } from "./top-concern";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const SEVERITY_ORDER: Record<Finding["severity"], number> = {
  potential_concern: 0,
  high: 1,
  review: 2,
  low: 3,
};

const SEVERITY_TITLES: Record<string, string> = {
  potential_concern: "Potential Legal Concerns",
  high: "High Attention Findings",
  review: "Clauses Needing Review",
  low: "Low Concern Acknowledged Clauses",
  termination: "Termination & Notice Clauses",
  rights: "Deposits, Warranties & Rights",
};

export function DashboardShell({ analysis }: { analysis: DocumentAnalysis }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const rightPanelRef = useRef<HTMLDivElement>(null);

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
  const [advisorFindingId, setAdvisorFindingId] = useState<string | null>(null);
  const [responseFindingId, setResponseFindingId] = useState<string | null>(null);
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [exportReportOpen, setExportReportOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const topFinding = sortedFindings[0] ?? null;

  const filteredFindings = useMemo(
    () =>
      filter === "all"
        ? sortedFindings.filter((f) => f.id !== topFinding?.id)
        : sortedFindings.filter((f) => matchesFilter(f, filter)),
    [sortedFindings, filter, topFinding]
  );

  function handleFilterChange(newFilter: FilterKey) {
    setFilter(newFilter);
    if (newFilter !== "all") {
      // Instantly open and select the first finding belonging to this category
      const firstMatching = sortedFindings.find((f) => matchesFilter(f, newFilter));
      if (firstMatching) {
        setSelectedFindingId(firstMatching.id);
      }
    } else {
      setSelectedFindingId(sortedFindings[0]?.id ?? null);
    }

    // Smoothly scroll the panel to the top so the opened category is immediately in view
    if (rightPanelRef.current) {
      rightPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const selectedFinding = analysis.findings.find((f) => f.id === selectedFindingId) ?? null;
  const showWhyFinding = analysis.findings.find((f) => f.id === showWhyId) ?? null;
  const advisorFinding = analysis.findings.find((f) => f.id === advisorFindingId) ?? null;
  const responseFinding = analysis.findings.find((f) => f.id === responseFindingId) ?? null;
  const flaggedClauseIds = new Set(analysis.findings.map((f) => f.clauseId));

  const focusedClauseIds = useMemo(() => {
    if (filter === "all") return null;
    const ids = new Set<string>();
    for (const f of filteredFindings) {
      ids.add(f.clauseId);
    }
    return ids;
  }, [filter, filteredFindings]);

  function saveFindingToVault(finding: Finding) {
    addVaultItem({
      id: randomId(),
      type: "clause",
      title: finding.title,
      content: `${finding.clauseText}\n\n[Analysis]: ${finding.explanation}\n[Why it matters]: ${finding.whyItMatters}`,
      createdAt: new Date().toISOString(),
      analysisId: analysis.id,
    });
    setSavedIds((prev) => new Set(prev).add(finding.id));
    showToast(`Saved "${finding.title}" to Evidence Vault!`, "success");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b border-border bg-paper px-6 py-3">
        <div className="mx-auto max-w-7xl flex flex-col gap-2.5">
          <Link
            href={analysis.isDemo ? "/demo" : "/analyze"}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-faint hover:text-ink transition-colors w-fit"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {analysis.isDemo ? "Back to demo cases" : "Analyze another document"}
          </Link>
          <StatusSummary
            analysis={analysis}
            activeFilter={filter}
            onFilterSelect={handleFilterChange}
            onExportReport={() => setExportReportOpen(true)}
          />
        </div>
      </div>

      {/* Desktop: split screen. Mobile: stacked */}
      <div className="flex-1 overflow-hidden grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="hidden lg:block border-r border-border overflow-hidden">
          <DocumentViewer
            document={analysis.document}
            activeClauseId={selectedFinding?.clauseId ?? null}
            flaggedClauseIds={flaggedClauseIds}
            focusedClauseIds={focusedClauseIds}
            focusCategoryLabel={SEVERITY_TITLES[filter] ?? filter.replace(/_/g, " ")}
            onClearFocus={() => handleFilterChange("all")}
            findings={analysis.findings}
            onDraftResponse={(f) => setResponseFindingId(f.id)}
            onOpenAdvisor={(f) => setAdvisorFindingId(f.id)}
            onSelectFinding={(id) => setSelectedFindingId(id)}
          />
        </div>

        <div ref={rightPanelRef} className="overflow-y-auto scrollbar-thin px-6 py-8 space-y-8">
          <div className="lg:hidden rounded-lg border border-border overflow-hidden h-64">
            <DocumentViewer
              document={analysis.document}
              activeClauseId={selectedFinding?.clauseId ?? null}
              flaggedClauseIds={flaggedClauseIds}
              focusedClauseIds={focusedClauseIds}
              focusCategoryLabel={SEVERITY_TITLES[filter] ?? filter.replace(/_/g, " ")}
              onClearFocus={() => handleFilterChange("all")}
              findings={analysis.findings}
              onDraftResponse={(f) => setResponseFindingId(f.id)}
              onOpenAdvisor={(f) => setAdvisorFindingId(f.id)}
              onSelectFinding={(id) => setSelectedFindingId(id)}
            />
          </div>

          {/* Active Category Header when filtered, or Top Concern Priority Spotlight */}
          {filter !== "all" ? (
            <div className="rounded-2xl border-2 border-brand/30 bg-gradient-to-r from-brand-soft/60 to-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-3d">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 rounded-xl bg-brand text-white items-center justify-center shadow-xs flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] uppercase font-bold tracking-wider text-brand bg-brand-soft px-2 py-0.5 rounded">
                      🔍 Focus Mode Active &middot; Read Format
                    </span>
                    <span className="text-[0.65rem] text-ink-faint hidden sm:inline">
                      (Non-matching clauses blurred)
                    </span>
                  </div>
                  <h2 className="mt-1 font-serif-heading text-lg sm:text-xl font-bold text-ink">
                    {SEVERITY_TITLES[filter] ?? filter.replace(/_/g, " ")} ({filteredFindings.length} {filteredFindings.length === 1 ? "clause" : "clauses"})
                  </h2>
                </div>
              </div>
              <button
                onClick={() => handleFilterChange("all")}
                className="rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-bold text-brand hover:border-brand hover:bg-brand-soft transition-all shadow-2xs flex-shrink-0 cursor-pointer"
              >
                ← Unblur all clauses ({analysis.summary.total})
              </button>
            </div>
          ) : (
            topFinding && (
              <div className="space-y-2">
                <TopConcern
                  finding={topFinding}
                  onShowWhy={() => setShowWhyId(topFinding.id)}
                  onSelect={() => setSelectedFindingId(topFinding.id)}
                />
              </div>
            )
          )}

          {/* Findings List Section (The actual clauses / problems) */}
          <section className="space-y-4 pt-2 border-t border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-brand">
                  Clause-by-Clause Audit
                </span>
                <h3 className="font-serif-heading text-xl font-bold text-ink">
                  {filter === "all" ? `All Document Findings (${filteredFindings.length})` : `Clauses in this Category (${filteredFindings.length})`}
                </h3>
                <p className="text-xs text-ink-soft">
                  Select any clause or hover in the document viewer to inspect individual cures and recommended next steps
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setScenarioOpen(true)}
                className="whitespace-nowrap self-start sm:self-auto gap-1.5 shadow-2xs h-9"
              >
                <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
                What happens if…?
              </Button>
            </div>

            {/* Filter Bar: Only visible when in All mode to eliminate right-side clutter when a specification is selected */}
            {filter === "all" ? (
              <FindingFilters
                active={filter}
                counts={{
                  total: analysis.summary.total,
                  potential_concern: analysis.summary.counts.potential_concern,
                  high: analysis.summary.counts.high,
                  review: analysis.summary.counts.review,
                  low: analysis.summary.counts.low,
                }}
                onChange={handleFilterChange}
              />
            ) : (
              <div className="flex items-center justify-between rounded-xl bg-paper/90 border border-border/80 px-4 py-2.5 text-xs shadow-2xs">
                <span className="flex items-center gap-2 font-medium text-ink">
                  <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                  Showing individual clauses &amp; cures for:{" "}
                  <strong className="text-brand font-bold">
                    {SEVERITY_TITLES[filter] ?? filter.replace(/_/g, " ")}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleFilterChange("all")}
                  className="rounded-lg bg-white border border-border px-2.5 py-1 text-xs font-bold text-brand hover:bg-brand hover:text-white transition-all shadow-2xs cursor-pointer"
                >
                  Show All Filters
                </button>
              </div>
            )}

            {filteredFindings.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-white py-14 px-6 text-center">
                <p className="text-sm font-semibold text-ink-soft">
                  No findings match this filter.
                </p>
                <button
                  onClick={() => handleFilterChange("all")}
                  className="mt-2 text-xs font-bold text-brand hover:underline cursor-pointer"
                >
                  Reset to show all findings
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {filteredFindings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    active={finding.id === selectedFindingId}
                    onSelect={() => setSelectedFindingId(finding.id)}
                    onShowWhy={() => setShowWhyId(finding.id)}
                    onSaveToVault={() => saveFindingToVault(finding)}
                    isSaved={savedIds.has(finding.id)}
                    onDraftResponse={() => setResponseFindingId(finding.id)}
                    onOpenAdvisor={() => setAdvisorFindingId(finding.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Action Plan & Recommended Next Steps for Currently Selected Finding */}
          {selectedFinding && (
            <div className="rounded-2xl border-2 border-brand/30 bg-white p-6 shadow-sm ring-1 ring-brand/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
                <div>
                  <span className="inline-block text-[0.65rem] font-bold uppercase tracking-wider text-brand bg-brand-soft px-2 py-0.5 rounded">
                    Action Plan &middot; Recommended Next Steps
                  </span>
                  <h3 className="mt-1 text-sm font-semibold text-ink">
                    For: {selectedFinding.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setAdvisorFindingId(selectedFinding.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand text-white hover:bg-brand/90 px-3 py-1.5 text-xs font-semibold shadow-xs transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Strategy Advisor
                  </button>
                  <button
                    onClick={() => saveFindingToVault(selectedFinding)}
                    disabled={savedIds.has(selectedFinding.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:text-brand hover:border-brand transition-colors disabled:text-low disabled:border-transparent whitespace-nowrap"
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
                    {savedIds.has(selectedFinding.id) ? "Saved" : "Save to Vault"}
                  </button>
                </div>
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
            setAdvisorFindingId(showWhyFinding.id);
            setShowWhyId(null);
          }}
          onSaveToVault={() => saveFindingToVault(showWhyFinding)}
          isSaved={savedIds.has(showWhyFinding.id)}
        />
      )}

      {advisorFinding && (
        <AiAdvisor
          finding={advisorFinding}
          jurisdiction={analysis.jurisdiction}
          onClose={() => setAdvisorFindingId(null)}
          onOpenResponse={() => setResponseFindingId(advisorFinding.id)}
          onOpenScenario={() => setScenarioOpen(true)}
        />
      )}

      {responseFinding && (
        <ResponseGenerator finding={responseFinding} onClose={() => setResponseFindingId(null)} />
      )}

      {scenarioOpen && (
        <ScenarioSimulator finding={selectedFinding ?? undefined} onClose={() => setScenarioOpen(false)} />
      )}

      {exportReportOpen && (
        <ExportReportModal
          analysis={analysis}
          onClose={() => setExportReportOpen(false)}
        />
      )}
    </div>
  );
}

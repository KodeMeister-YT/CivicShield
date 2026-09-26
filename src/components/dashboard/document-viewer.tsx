"use client";

import type { Clause, ExtractedDocument, Finding } from "@/types";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useMemo } from "react";
import { FileText, Eye, Sparkles, X, ShieldAlert } from "lucide-react";
import { ClauseActionBubble } from "./clause-action-bubble";

export function DocumentViewer({
  document,
  activeClauseId,
  flaggedClauseIds,
  focusedClauseIds = null,
  focusCategoryLabel = null,
  onClearFocus,
  findings,
  onDraftResponse,
  onOpenAdvisor,
  onSelectFinding,
}: {
  document: ExtractedDocument;
  activeClauseId: string | null;
  flaggedClauseIds: Set<string>;
  focusedClauseIds?: Set<string> | null;
  focusCategoryLabel?: string | null;
  onClearFocus?: () => void;
  findings?: Finding[];
  onDraftResponse?: (finding: Finding) => void;
  onOpenAdvisor?: (finding: Finding) => void;
  onSelectFinding?: (findingId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLElement>(null);
  const [hoveredClauseId, setHoveredClauseId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const findingMap = useMemo(() => {
    const map = new Map<string, Finding>();
    if (findings) {
      for (const f of findings) {
        map.set(f.clauseId, f);
      }
    }
    return map;
  }, [findings]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeClauseId]);

  const isFocusMode = focusedClauseIds !== null && focusedClauseIds.size > 0;

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-paper-raised/90 backdrop-blur-md sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-2 truncate">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand flex-shrink-0">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="truncate">
            <p className="text-xs sm:text-sm font-semibold text-ink truncate">{document.fileName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
          <span className="text-[0.7rem] uppercase font-bold tracking-wider text-ink-faint px-2 py-0.5 rounded bg-paper border border-border">
            {document.clauses.length} clauses
          </span>
        </div>
      </div>

      {/* Focus Mode Activated Banner in Viewer */}
      {isFocusMode && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-brand/90 to-brand-strong text-white text-xs shadow-xs animate-fade-in sticky top-[53px] z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
            <span className="font-semibold">
              Focus Lens: <span className="text-accent-soft">{focusCategoryLabel}</span> ({focusedClauseIds.size} in focus, rest blurred)
            </span>
          </div>
          {onClearFocus && (
            <button
              onClick={onClearFocus}
              className="inline-flex items-center gap-1 rounded bg-white/20 hover:bg-white/30 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
              Unblur All
            </button>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-3 font-serif-heading text-[0.95rem] leading-relaxed select-text"
      >
        {document.clauses.map((clause: Clause) => {
          const isActive = clause.id === activeClauseId;
          const isFlagged = flaggedClauseIds.has(clause.id);
          const isClauseInFocus = isFocusMode ? focusedClauseIds.has(clause.id) : true;
          const isBlurred = isFocusMode && !isClauseInFocus;
          const finding = findingMap.get(clause.id);
          const showBubble = hoveredClauseId === clause.id && !!finding && !isBlurred;

          return (
            <div
              key={clause.id}
              ref={isActive ? (activeRef as React.RefObject<HTMLDivElement>) : undefined}
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                if (!isBlurred) {
                  setHoveredClauseId(clause.id);
                  if (finding && onSelectFinding) {
                    onSelectFinding(finding.id);
                  }
                }
              }}
              onMouseLeave={() => {
                hoverTimeoutRef.current = setTimeout(() => {
                  setHoveredClauseId(null);
                }, 300);
              }}
              onClick={() => {
                if (isBlurred && onClearFocus) {
                  onClearFocus();
                } else if (finding && onSelectFinding) {
                  onSelectFinding(finding.id);
                }
              }}
              className={cn(
                "relative rounded-xl px-4 py-3 -mx-2 transition-all duration-300",
                isBlurred && "blur-out-backdrop cursor-pointer hover:blur-none hover:opacity-75",
                !isBlurred && "focus-sharp-readable card-3d-subtle",
                isActive &&
                  "bg-gradient-to-r from-review-bg/90 via-review-bg/50 to-white ring-2 ring-brand border-l-4 border-l-brand shadow-md -translate-y-0.5 animate-clause-pulse",
                !isActive && !isBlurred && isFlagged && "bg-paper/80 hover:bg-paper border-l-3 border-l-review/60 hover:shadow-2xs",
                !isActive && !isBlurred && !isFlagged && "hover:bg-paper/40",
                finding && "cursor-pointer"
              )}
            >
              {isActive && (
                <div className="flex items-center justify-between gap-1.5 text-[0.65rem] font-sans font-bold uppercase tracking-wider text-brand mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-ping" />
                    <Eye className="h-3 w-3" />
                    Currently Selected Clause
                  </span>
                  {finding && (
                    <span className="text-[0.65rem] text-accent font-semibold lowercase tracking-normal flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Hover for Cure &amp; Steps
                    </span>
                  )}
                </div>
              )}
              {isFocusMode && isClauseInFocus && !isActive && (
                <div className="flex items-center justify-between gap-1 text-[0.65rem] font-sans font-bold uppercase tracking-wider text-accent mb-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Focused Clause &middot; Read Format
                  </span>
                  {finding && (
                    <span className="text-[0.65rem] text-brand font-semibold lowercase tracking-normal flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3 text-concern" />
                      Hover for Cure &amp; Steps
                    </span>
                  )}
                </div>
              )}
              {!isActive && (!isFocusMode || !isClauseInFocus) && isFlagged && !isBlurred && (
                <div className="flex items-center justify-between text-[0.65rem] text-ink-faint mb-1">
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    Flagged Legal Concern
                  </span>
                  <span className="text-[0.65rem] text-brand font-semibold">
                    Hover for Cure &amp; Steps
                  </span>
                </div>
              )}
              <p className={cn(isBlurred && "select-none")}>
                {clause.section && (
                  <span className="text-xs font-sans font-bold text-ink mr-2 bg-white px-2 py-0.5 rounded border border-border shadow-2xs">
                    §{clause.section}
                  </span>
                )}
                {clause.text}
              </p>

              {/* Floating Bubble of Recommended Steps & Cure */}
              {showBubble && finding && (
                <div
                  className="absolute left-2 top-full mt-1.5 z-40"
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                  }}
                  onMouseLeave={() => {
                    hoverTimeoutRef.current = setTimeout(() => {
                      setHoveredClauseId(null);
                    }, 250);
                  }}
                >
                  <ClauseActionBubble
                    finding={finding}
                    onDraftResponse={onDraftResponse ? () => onDraftResponse(finding) : undefined}
                    onOpenAdvisor={onOpenAdvisor ? () => onOpenAdvisor(finding) : undefined}
                    onClose={() => setHoveredClauseId(null)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

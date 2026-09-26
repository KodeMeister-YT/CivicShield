"use client";

import type { Clause, ExtractedDocument } from "@/types";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { FileText } from "lucide-react";

/**
 * Renders the extracted document as a sequence of clause paragraphs. The
 * clause corresponding to the currently selected finding is highlighted
 * and scrolled into view -- this is the "click a finding, see it in the
 * document" trust feature from the product spec (section 17).
 */
export function DocumentViewer({
  document,
  activeClauseId,
  flaggedClauseIds,
}: {
  document: ExtractedDocument;
  activeClauseId: string | null;
  flaggedClauseIds: Set<string>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeClauseId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-paper-raised sticky top-0 z-10">
        <FileText className="h-4 w-4 text-ink-faint" aria-hidden="true" />
        <p className="text-sm font-medium text-ink truncate">{document.fileName}</p>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-4 font-serif-heading text-[0.95rem] leading-relaxed"
      >
        {document.clauses.map((clause: Clause) => {
          const isActive = clause.id === activeClauseId;
          const isFlagged = flaggedClauseIds.has(clause.id);
          return (
            <p
              key={clause.id}
              ref={isActive ? (activeRef as React.RefObject<HTMLParagraphElement>) : undefined}
              className={cn(
                "rounded-md px-3 py-2 -mx-3 transition-colors duration-300",
                isActive && "bg-review-bg ring-2 ring-review",
                !isActive && isFlagged && "bg-paper"
              )}
            >
              {clause.section && (
                <span className="text-xs font-sans font-medium text-ink-faint mr-2">
                  §{clause.section}
                </span>
              )}
              {clause.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}

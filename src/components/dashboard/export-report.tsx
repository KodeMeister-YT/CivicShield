"use client";

import type { DocumentAnalysis } from "@/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Printer, Download, Copy, Check, ShieldCheck } from "lucide-react";
import { useState } from "react";

export function ExportReportModal({
  analysis,
  onClose,
}: {
  analysis: DocumentAnalysis;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handlePrint() {
    window.print();
  }

  function generateMarkdownReport(): string {
    const lines: string[] = [
      `# CivicShield Legal Document Analysis Report`,
      `**Document:** ${analysis.fileName}`,
      `**Domain:** ${analysis.domain} | **Category:** ${analysis.category}`,
      `**Jurisdiction:** ${analysis.jurisdiction || "Federal / General US"}`,
      `**Date Generated:** ${formatDate(analysis.createdAt)}`,
      ``,
      `---`,
      `## Executive Risk Summary`,
      `- Total Clauses Reviewed: ${analysis.summary.total}`,
      `- Potential Legal Concerns: ${analysis.summary.counts.potential_concern}`,
      `- High Attention: ${analysis.summary.counts.high}`,
      `- Review Recommended: ${analysis.summary.counts.review}`,
      `- Low Concern: ${analysis.summary.counts.low}`,
      ``,
      `---`,
      `## Detailed Findings & Action Plans`,
    ];

    analysis.findings.forEach((f, i) => {
      lines.push(
        `### ${i + 1}. ${f.title} [Severity: ${f.severity.toUpperCase()}]`,
        `**Section/Location:** ${f.section ? `Section ${f.section}` : "Unlabeled"} ${f.page ? `(Page ${f.page})` : ""}`,
        `**Document Clause:** "${f.clauseText}"`,
        ``,
        `**Explanation:** ${f.explanation}`,
        `**Why It Matters:** ${f.whyItMatters}`,
        ``,
        `**Legal Grounds & Sources:**`,
        f.sources.length > 0 && f.sources[0].verified
          ? f.sources.map((s) => `- ${s.title} (${s.authority}): ${s.excerpt}`).join("\n")
          : "- Source verification unavailable in current local knowledge base.",
        ``,
        `**Recommended Next Steps:**`,
        f.actions.map((a) => `- [ ] ${a.label}${a.description ? `: ${a.description}` : ""}`).join("\n"),
        ``,
        `---`
      );
    });

    lines.push(
      `## Disclaimer`,
      `CivicShield provides informational guidance and civic rights navigation, not formal legal representation or an attorney-client relationship. For binding representation, consult an attorney licensed in your jurisdiction.`
    );

    return lines.join("\n");
  }

  function handleCopy() {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const text = generateMarkdownReport();
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `civicshield-report-${analysis.fileName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-md p-4 sm:p-6 animate-fade-in"
    >
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl overflow-hidden border border-border animate-modal-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-paper-raised">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <h2 className="font-serif-heading text-lg font-semibold text-ink">
              Export Legal Analysis Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-ink-faint hover:text-ink p-1 rounded hover:bg-brand-soft"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="px-6 py-3 bg-paper border-b border-border flex items-center justify-between gap-3 text-xs">
          <span className="text-ink-soft">Ready to save, print, or share with an advisor:</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5 text-low" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy text"}
            </Button>
            <Button size="sm" variant="secondary" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" />
              Download .md
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Printable Report View */}
        <div className="flex-1 overflow-y-auto p-8 font-sans space-y-6 text-sm text-ink leading-relaxed">
          <div className="border-b border-border pb-4">
            <h1 className="font-serif-heading text-2xl font-bold text-ink">
              CivicShield Analysis Report
            </h1>
            <p className="text-xs text-ink-faint mt-1">
              Document: <span className="text-ink font-medium">{analysis.fileName}</span> | Domain:{" "}
              <span className="text-ink font-medium">{analysis.domain}</span> | Date:{" "}
              {formatDate(analysis.createdAt)}
            </p>
            {analysis.jurisdiction && (
              <p className="text-xs text-brand font-medium mt-0.5">
                Jurisdiction: {analysis.jurisdiction}
              </p>
            )}
          </div>

          <div>
            <h3 className="font-serif-heading text-base font-semibold mb-2">Executive Risk Summary</h3>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-concern-bg text-concern font-medium">
                {analysis.summary.counts.potential_concern} Potential Concern
              </div>
              <div className="p-2 rounded bg-high-bg text-high font-medium">
                {analysis.summary.counts.high} High Attention
              </div>
              <div className="p-2 rounded bg-review-bg text-review font-medium">
                {analysis.summary.counts.review} Review
              </div>
              <div className="p-2 rounded bg-low-bg text-low font-medium">
                {analysis.summary.counts.low} Low Concern
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-serif-heading text-base font-semibold border-b border-border pb-1">
              Flagged Findings & Strategic Action
            </h3>
            {analysis.findings.map((f, i) => (
              <div key={f.id} className="rounded-lg border border-border p-4 bg-paper/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-ink text-sm">
                    {i + 1}. {f.title}
                  </h4>
                  <span className="text-xs uppercase font-semibold text-ink-faint px-2 py-0.5 rounded bg-white border border-border">
                    {f.severity}
                  </span>
                </div>
                <blockquote className="border-l-2 border-brand/40 pl-3 text-xs italic text-ink-soft bg-white p-2 rounded">
                  &ldquo;{f.clauseText}&rdquo;
                </blockquote>
                <p className="text-xs text-ink-soft">
                  <strong className="text-ink">Explanation:</strong> {f.explanation}
                </p>
                <p className="text-xs text-ink-soft">
                  <strong className="text-ink">Why it matters:</strong> {f.whyItMatters}
                </p>
                {f.sources.length > 0 && f.sources[0].verified && (
                  <p className="text-xs text-brand font-medium">
                    Legal Basis: {f.sources[0].title} ({f.sources[0].authority})
                  </p>
                )}
                {f.actions.length > 0 && (
                  <div className="pt-2 border-t border-border/60">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink-faint mb-1">
                      Action Checklist:
                    </p>
                    <ul className="text-xs text-ink-soft space-y-1 list-disc list-inside">
                      {f.actions.map((act) => (
                        <li key={act.id}>
                          {act.label} {act.description ? `(${act.description})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 text-xs text-ink-faint">
            <p>
              <strong>Legal Notice:</strong> CivicShield is an automated informational civic rights
              navigator, not a law firm. This document does not constitute formal legal counsel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

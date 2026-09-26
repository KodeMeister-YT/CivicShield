import { randomUUID } from "crypto";
import { extractRawText } from "@/lib/document/extract-text";
import { extractFacts, extractSectionsAndClauses, splitIntoPages } from "@/lib/document/structure";
import { classifyDocumentCategory, domainForCategory } from "@/lib/legal/classify";
import { detectIssues } from "@/lib/legal/detect-issues";
import { sanitizeExtractedText } from "@/lib/validation/upload";
import type {
  DocumentAnalysis,
  DocumentCategory,
  ExtractedDocument,
  PipelineError,
  Severity,
} from "@/types";

export class AnalysisPipelineError extends Error {
  stage: PipelineError["stage"];
  userMessage: string;
  constructor(stage: PipelineError["stage"], message: string, userMessage: string) {
    super(message);
    this.stage = stage;
    this.userMessage = userMessage;
  }
}

/**
 * End-to-end document analysis pipeline:
 * UPLOAD -> EXTRACTION -> CLASSIFICATION -> CLAUSE EXTRACTION ->
 * ISSUE DETECTION -> SOURCE RETRIEVAL -> RISK SCORING -> ACTION PLAN
 *
 * Each stage is isolated so a failure at one stage produces a specific,
 * user-facing error rather than a generic crash (see AnalysisPipelineError).
 */
export async function runAnalysisPipeline(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  userSelectedCategory?: DocumentCategory;
  jurisdiction?: string;
}): Promise<DocumentAnalysis> {
  const { buffer, fileName, mimeType, userSelectedCategory, jurisdiction } = params;

  // Stage 1: extraction
  let raw;
  try {
    raw = await extractRawText(buffer, mimeType, fileName);
  } catch (err) {
    throw new AnalysisPipelineError(
      "extracting",
      err instanceof Error ? err.message : String(err),
      "We couldn't read this document. It may be corrupted, password-protected, or in an unsupported format."
    );
  }

  const cleanText = sanitizeExtractedText(raw.text);
  if (cleanText.trim().length < 10) {
    throw new AnalysisPipelineError(
      "extracting",
      "Empty document after extraction",
      "This document appears to be empty or contains no readable text. If it's a scanned image, text extraction may not be supported yet."
    );
  }

  const pages = splitIntoPages({ ...raw, text: cleanText });

  // Stage 2: classification
  const detected = classifyDocumentCategory(cleanText);
  const category = userSelectedCategory && userSelectedCategory !== "other"
    ? userSelectedCategory
    : detected.category;
  const domain = domainForCategory(category);

  // Stage 3: clause/claim extraction
  const { sections, clauses } = extractSectionsAndClauses(pages);
  const facts = extractFacts(clauses);

  const document: ExtractedDocument = {
    id: randomUUID(),
    fileName,
    mimeType,
    fullText: cleanText,
    sections,
    clauses,
    facts,
    pageCount: raw.pageCount ?? pages.length,
    truncated: raw.text.length > cleanText.length,
  };

  // Stage 4-8: issue detection, source retrieval (inside detectIssues),
  // risk scoring (severity assigned per-rule), action plan (per-finding)
  let findings;
  try {
    findings = await detectIssues(document, domain, jurisdiction);
  } catch (err) {
    throw new AnalysisPipelineError(
      "detecting_issues",
      err instanceof Error ? err.message : String(err),
      "Analysis is temporarily unavailable. Your original document has not been modified."
    );
  }

  const summary = summarize(findings.map((f) => f.severity));

  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    fileName,
    category,
    domain,
    jurisdiction,
    isDemo: false,
    document,
    findings,
    summary,
  };
}

function summarize(severities: Severity[]) {
  const counts: Record<Severity, number> = {
    low: 0,
    review: 0,
    high: 0,
    potential_concern: 0,
  };
  for (const s of severities) counts[s]++;
  return { total: severities.length, counts };
}

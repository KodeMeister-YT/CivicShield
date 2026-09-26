import { extractFacts, extractSectionsAndClauses } from "@/lib/document/structure";
import { classifyDocumentCategory, domainForCategory } from "@/lib/legal/classify";
import { detectIssues } from "@/lib/legal/detect-issues";
import type { DocumentAnalysis, ExtractedDocument, Severity } from "@/types";
import { CONSUMER_DEMO_TEXT, TENANT_DEMO_TEXT, WORK_DEMO_TEXT } from "./documents";

/**
 * Builds precomputed demo analyses using the SAME rule-based pipeline
 * stages as real uploads (structure extraction, classification, issue
 * detection). Because the pipeline is deterministic and has no live LLM
 * dependency, this can run once at server startup and be cached in memory,
 * giving Demo Mode instant load times with zero risk of AI/network
 * failures during a live presentation.
 */
async function buildAnalysis(
  fileName: string,
  text: string,
  slug: "tenant" | "work" | "consumer"
): Promise<DocumentAnalysis> {
  const { sections, clauses } = extractSectionsAndClauses([text]);
  const facts = extractFacts(clauses);
  const detected = classifyDocumentCategory(text);
  const domain = domainForCategory(detected.category);

  const document: ExtractedDocument = {
    id: `demo-doc-${slug}`,
    fileName,
    mimeType: "text/plain",
    fullText: text,
    sections,
    clauses,
    facts,
    pageCount: 1,
    truncated: false,
  };

  const findings = await detectIssues(document, domain);
  const summary = summarize(findings.map((f) => f.severity));

  return {
    id: `demo-${slug}`,
    createdAt: new Date().toISOString(),
    fileName,
    category: detected.category,
    domain,
    isDemo: true,
    document,
    findings,
    summary,
  };
}

function summarize(severities: Severity[]) {
  const counts: Record<Severity, number> = { low: 0, review: 0, high: 0, potential_concern: 0 };
  for (const s of severities) counts[s]++;
  return { total: severities.length, counts };
}

let cache: Promise<Record<"tenant" | "work" | "consumer", DocumentAnalysis>> | null = null;

export function getDemoAnalyses() {
  if (!cache) {
    cache = (async () => ({
      tenant: await buildAnalysis("Sample Residential Lease Agreement.txt", TENANT_DEMO_TEXT, "tenant"),
      work: await buildAnalysis("Notice of Employment Termination.txt", WORK_DEMO_TEXT, "work"),
      consumer: await buildAnalysis(
        "Purchase Agreement and Warranty Terms.txt",
        CONSUMER_DEMO_TEXT,
        "consumer"
      ),
    }))();
  }
  return cache;
}

export type DemoSlug = "tenant" | "work" | "consumer";

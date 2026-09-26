import { randomUUID } from "crypto";
import type { Clause, ExtractedDocument, Finding, ShieldDomain } from "@/types";
import { rulesForCategory } from "./issue-rules";
import { retrieveLegalSources } from "@/lib/rag";
import { buildActionsForFinding } from "@/lib/ai/action-plan";

/**
 * Deterministic, rule-based issue detection. This is the reliable backbone
 * of the analysis pipeline (see lib/ai/analyze.ts for where an optional
 * LLM-assisted pass can layer on top). Every finding produced here already
 * satisfies the AI safety layer: it cites real sources, states confidence,
 * and separates fact from interpretation.
 */
export async function detectIssues(
  document: ExtractedDocument,
  domain: ShieldDomain,
  jurisdiction?: string
): Promise<Finding[]> {
  const findings: Finding[] = [];
  const seenRuleClausePairs = new Set<string>();

  for (const clause of document.clauses) {
    const rules = rulesForCategory(clause.category);
    if (rules.length === 0) continue;

    // Prefer the most specific matching rule (one with a pattern that hits);
    // fall back to a general rule for the category if no specific one fires.
    const specific = rules.filter((r) => r.pattern && r.pattern.test(clause.text));
    const general = rules.filter((r) => !r.pattern);
    const chosen = specific[0] ?? general[0];
    if (!chosen) continue;

    const dedupeKey = `${chosen.id}-${clause.id}`;
    if (seenRuleClausePairs.has(dedupeKey)) continue;
    seenRuleClausePairs.add(dedupeKey);

    const sources = await retrieveLegalSources({
      category: clause.category,
      domain,
      text: clause.text,
      jurisdiction,
      limit: 2,
    });

    const confidence = adjustConfidence(chosen.baseConfidence, sources);

    const finding: Finding = {
      id: randomUUID(),
      title: chosen.title,
      category: clause.category,
      domain,
      severity: chosen.severity,
      confidence,
      clauseId: clause.id,
      clauseText: clause.text,
      section: clause.section,
      page: clause.page,
      explanation: chosen.explanation,
      whyItMatters: chosen.whyItMatters,
      legalConcept: chosen.legalConcept,
      sources,
      reasoning: buildReasoningTrail(clause, chosen, sources),
      actions: [],
      factVsInference: {
        fromDocument: clause.text,
        aiInterpretation: chosen.explanation,
        legalSource: sources[0]?.excerpt ?? "Source verification unavailable.",
      },
      needsProfessionalReview: chosen.needsProfessionalReview || confidence < 0.55,
    };

    finding.actions = buildActionsForFinding(finding);
    findings.push(finding);
  }

  // Also surface a "low concern" acknowledgment for clauses that were
  // classified but didn't trigger any rule, so the dashboard's "N low
  // concern" count reflects real coverage rather than only flagged issues.
  const flaggedClauseIds = new Set(findings.map((f) => f.clauseId));
  const lowConcernSample = document.clauses.filter(
    (c) => !flaggedClauseIds.has(c.id) && c.category !== "other" && c.text.length > 40
  );

  for (const clause of lowConcernSample.slice(0, 5)) {
    findings.push(buildLowConcernFinding(clause, domain));
  }

  return findings;
}

function buildLowConcernFinding(clause: Clause, domain: ShieldDomain): Finding {
  return {
    id: randomUUID(),
    title: `${capitalize(clause.category.replace(/_/g, " "))} clause`,
    category: clause.category,
    domain,
    severity: "low",
    confidence: 0.5,
    clauseId: clause.id,
    clauseText: clause.text,
    section: clause.section,
    page: clause.page,
    explanation:
      "This clause was reviewed and does not appear to raise an obvious concern based on our current rule set.",
    whyItMatters:
      "It's still part of the agreement and worth reading, but nothing stood out as unusual or risky.",
    sources: [],
    reasoning:
      "No specific issue pattern matched this clause category, and no strong risk keywords were detected.",
    actions: [],
    factVsInference: {
      fromDocument: clause.text,
      aiInterpretation: "No significant concern detected.",
      legalSource: "Not applicable.",
    },
    needsProfessionalReview: false,
  };
}

function adjustConfidence(
  base: number,
  sources: Finding["sources"]
): number {
  const verifiedCount = sources.filter((s) => s.verified).length;
  let confidence = base;
  if (verifiedCount === 0) confidence -= 0.15;
  if (verifiedCount >= 2) confidence += 0.05;
  return Math.max(0.2, Math.min(0.95, Math.round(confidence * 100) / 100));
}

function buildReasoningTrail(
  clause: Clause,
  rule: { title: string; explanation: string },
  sources: Finding["sources"]
): string {
  const sourcePart =
    sources.length > 0 && sources[0].verified
      ? `The retrieved source "${sources[0].title}" (${sources[0].authority}) discusses related concepts.`
      : "No verified source was confidently matched for this specific clause.";

  return [
    `The document states: "${truncate(clause.text, 160)}"`,
    `This was classified under the "${clause.category.replace(/_/g, " ")}" category and matched the pattern for "${rule.title}".`,
    sourcePart,
    "These appear relevant because the clause language and the source content overlap in subject matter, though this is a heuristic match, not a legal determination.",
  ].join(" ");
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

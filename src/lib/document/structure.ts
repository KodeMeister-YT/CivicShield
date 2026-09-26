import { randomUUID } from "crypto";
import type { Clause, ClauseCategory, DocumentSection, ExtractedFact } from "@/types";
import { classifyClauseText } from "@/lib/legal/classify";

/**
 * Splits raw extracted text into sections and clauses, and pulls out
 * structured facts (dates, amounts, parties, deadlines). This is a
 * heuristic, pattern-based structural parser -- not an LLM call -- so it is
 * fast, deterministic, and never fails silently.
 *
 * Section/page references are preserved wherever detectable so the UI can
 * show "This finding came from Section 8.2, page 4."
 */

const HEADING_PATTERN =
  /^(?:(section|article|clause)\s+)?(\d+(?:\.\d+)*)[\.\):\-\s]+([A-Z][A-Za-z0-9 ,'&\-\/]{2,80})$/i;

const MONEY_PATTERN = /\$\s?[\d,]+(?:\.\d{2})?/g;
const DATE_PATTERN =
  /\b(?:\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4})\b/gi;
const DEADLINE_KEYWORDS = /\b(within|no later than|by the|prior to|before)\b/i;
const PENALTY_KEYWORDS = /\b(penalty|forfeit|liquidated damages|fee of|fine of)\b/i;
const PARTY_PATTERN =
  /\b(landlord|tenant|lessee|lessor|employer|employee|buyer|seller|company|contractor|client|consumer|customer)\b/i;

export function splitIntoPages(raw: { pages?: string[]; text: string }): string[] {
  if (raw.pages && raw.pages.length > 0) return raw.pages;
  return [raw.text];
}

export function extractSectionsAndClauses(pages: string[]): {
  sections: DocumentSection[];
  clauses: Clause[];
} {
  const sections: DocumentSection[] = [];
  const clauses: Clause[] = [];
  let sectionOrder = 0;
  let currentSection: DocumentSection | undefined;

  pages.forEach((pageText, pageIndex) => {
    const page = pageIndex + 1;
    const rawParagraphs = pageText
      .split(/\r?\n\s*\r?\n|\r?\n(?=\d+(?:\.\d+)*[\.\):])/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    for (const paragraph of rawParagraphs) {
      const firstLine = paragraph.split("\n")[0].trim();
      const headingMatch = firstLine.match(HEADING_PATTERN);

      if (headingMatch && paragraph.length < 500) {
        // Treat short, heading-shaped paragraphs as section markers.
        currentSection = {
          id: randomUUID(),
          heading: firstLine,
          page,
          order: sectionOrder++,
        };
        sections.push(currentSection);

        // If the paragraph IS just the heading (e.g. "Section 8. Termination"
        // on its own line with no body text), don't also emit it as a
        // clause -- otherwise it gets classified and flagged alongside the
        // real sub-clauses (8.1, 8.2, ...) underneath it, producing a
        // confusing near-duplicate finding for the same section.
        if (paragraph.trim() === firstLine.trim()) continue;
      }

      if (paragraph.length < 15) continue; // skip stray fragments

      const category = classifyClauseText(paragraph);
      const importance = estimateImportance(paragraph, category);

      clauses.push({
        id: randomUUID(),
        section: extractSectionRef(paragraph) ?? currentSection?.heading,
        page,
        text: paragraph,
        category,
        importance,
      });
    }
  });

  if (clauses.length === 0 && pages.join("").trim().length > 0) {
    // Extremely unstructured document (e.g. one giant paragraph) -- fall
    // back to sentence-level chunking so the pipeline still has something
    // to classify rather than failing.
    return sentenceFallback(pages);
  }

  return { sections, clauses };
}

function sentenceFallback(pages: string[]): { sections: DocumentSection[]; clauses: Clause[] } {
  const clauses: Clause[] = [];
  pages.forEach((pageText, pageIndex) => {
    const sentences = pageText
      .split(/(?<=[.;])\s+(?=[A-Z])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);
    for (const sentence of sentences) {
      const category = classifyClauseText(sentence);
      clauses.push({
        id: randomUUID(),
        page: pageIndex + 1,
        text: sentence,
        category,
        importance: estimateImportance(sentence, category),
      });
    }
  });
  return { sections: [], clauses };
}

function extractSectionRef(text: string): string | undefined {
  const match = text.match(/^(?:section|article|clause)?\s*(\d+(?:\.\d+)+|\d+\.)/i);
  return match ? match[1].replace(/\.$/, "") : undefined;
}

function estimateImportance(
  text: string,
  category: ClauseCategory
): Clause["importance"] {
  const highSignalCategories: ClauseCategory[] = [
    "termination",
    "penalty",
    "deposit",
    "restriction",
    "confidentiality",
  ];
  if (highSignalCategories.includes(category)) return "high";
  if (PENALTY_KEYWORDS.test(text) || MONEY_PATTERN.test(text)) return "medium";
  return "low";
}

export function extractFacts(clauses: Clause[]): ExtractedFact[] {
  const facts: ExtractedFact[] = [];

  for (const clause of clauses) {
    const amounts = clause.text.match(MONEY_PATTERN) ?? [];
    for (const amount of amounts) {
      facts.push({
        id: randomUUID(),
        type: "amount",
        label: "Monetary amount",
        value: amount,
        clauseId: clause.id,
      });
    }

    const dates = clause.text.match(DATE_PATTERN) ?? [];
    for (const date of dates) {
      facts.push({
        id: randomUUID(),
        type: DEADLINE_KEYWORDS.test(clause.text) ? "deadline" : "date",
        label: DEADLINE_KEYWORDS.test(clause.text) ? "Deadline" : "Date",
        value: date,
        clauseId: clause.id,
      });
    }

    const partyMatch = clause.text.match(PARTY_PATTERN);
    if (partyMatch) {
      facts.push({
        id: randomUUID(),
        type: "party",
        label: "Party referenced",
        value: partyMatch[0],
        clauseId: clause.id,
      });
    }

    if (PENALTY_KEYWORDS.test(clause.text)) {
      facts.push({
        id: randomUUID(),
        type: "penalty",
        label: "Penalty language",
        value: clause.text.slice(0, 120),
        clauseId: clause.id,
      });
    }
  }

  return facts;
}

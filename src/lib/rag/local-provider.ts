import { legalSources } from "@/data/legal-sources";
import type { LegalSourceProvider, LegalSourceQuery } from "./provider";
import type { LegalSource } from "@/types";

/**
 * Keyword-scored retrieval over the seeded legal source set.
 *
 * This stands in for a real embeddings/pgvector similarity search (see
 * section 13 of the product spec). It is intentionally simple: score by
 * (a) domain match, (b) category/tag overlap, (c) keyword overlap between
 * the clause text and the source excerpt/title. This keeps the RAG
 * architecture real and swappable without requiring external infra for
 * the hackathon demo.
 *
 * To upgrade: implement LegalSourceProvider with an embeddings-backed
 * provider (e.g. OpenAI embeddings + pgvector) and swap the import in
 * src/lib/rag/index.ts. No calling code needs to change.
 */
export class LocalKeywordProvider implements LegalSourceProvider {
  async retrieve(query: LegalSourceQuery) {
    const { category, domain, text, jurisdiction, limit = 3 } = query;
    const words = tokenize(text);

    const scored = legalSources.map((source) => {
      let score = 0;

      if (source.domain === domain) score += 0.4;
      else if (source.domain === "General") score += 0.1;

      if (source.tags.includes(category)) score += 0.35;

      // Jurisdiction matching bonus
      if (jurisdiction && jurisdiction.toLowerCase() !== "federal" && jurisdiction.toLowerCase() !== "general") {
        if (source.jurisdiction.toLowerCase().includes(jurisdiction.toLowerCase())) {
          score += 0.45;
        }
      }

      const sourceWords = tokenize(`${source.title} ${source.excerpt}`);
      const overlap = words.filter((w) => sourceWords.includes(w)).length;
      score += Math.min(overlap * 0.05, 0.25);

      return { ...source, relevanceScore: Math.min(score, 1) };
    });

    return scored
      .filter((s) => s.relevanceScore > 0.15)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

/** Fallback used when retrieval finds nothing above the relevance threshold. */
export function unverifiedSourcePlaceholder(): LegalSource & { relevanceScore: number } {
  return {
    id: "src-unverified",
    title: "Source verification unavailable",
    authority: "CivicShield",
    url: "",
    jurisdiction: "Unknown",
    excerpt:
      "We could not confidently match this clause to a verified legal source in our current knowledge base. This does not mean no relevant law exists.",
    domain: "General",
    tags: [],
    verified: false,
    relevanceScore: 0,
  };
}

import type { ClauseCategory, LegalSource, ShieldDomain } from "@/types";

/**
 * Abstraction for legal source retrieval. The hackathon build ships a
 * seeded, keyword-scored provider (see local-provider.ts) but any future
 * implementation (a live legal database/API, pgvector similarity search,
 * a licensed case-law API, etc.) only needs to implement this interface.
 */
export interface LegalSourceQuery {
  /** The clause category being investigated, e.g. "termination". */
  category: ClauseCategory;
  /** The product vertical the document belongs to. */
  domain: ShieldDomain;
  /** Free-text clause content, used for keyword/semantic matching. */
  text: string;
  /** Optional jurisdiction specified by user or detected. */
  jurisdiction?: string;
  /** Max number of sources to return. */
  limit?: number;
}

export interface LegalSourceProvider {
  retrieve(query: LegalSourceQuery): Promise<Array<LegalSource & { relevanceScore: number }>>;
}

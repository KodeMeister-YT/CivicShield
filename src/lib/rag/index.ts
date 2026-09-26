import { LocalKeywordProvider, unverifiedSourcePlaceholder } from "./local-provider";
import type { LegalSourceProvider, LegalSourceQuery } from "./provider";
import type { CitedSource } from "@/types";

// Single point of configuration for which retrieval provider backs the app.
// Swap this line to plug in a real embeddings/pgvector or licensed legal
// database provider later -- nothing else in the pipeline needs to change.
const provider: LegalSourceProvider = new LocalKeywordProvider();

export async function retrieveLegalSources(query: LegalSourceQuery): Promise<CitedSource[]> {
  const results = await provider.retrieve(query);
  if (results.length === 0) {
    return [unverifiedSourcePlaceholder()];
  }
  return results.map((r) => ({ ...r, retrievedAt: new Date().toISOString() }));
}

export type { LegalSourceProvider, LegalSourceQuery } from "./provider";

"use client";

import type { DocumentAnalysis } from "@/types";

/**
 * Client-side storage for analysis results, keyed by analysis id.
 * Uploaded document text/analysis never leaves the browser after the
 * initial API call except for what the user explicitly saves to the
 * Evidence Vault. Uses sessionStorage so it clears when the tab closes --
 * appropriate for a hackathon demo handling potentially sensitive
 * documents without a persistent backend.
 */
const KEY_PREFIX = "civicshield:analysis:";

export function storeAnalysis(analysis: DocumentAnalysis) {
  try {
    sessionStorage.setItem(KEY_PREFIX + analysis.id, JSON.stringify(analysis));
  } catch {
    // sessionStorage may be unavailable (private browsing, quota) -- fail
    // silently, the dashboard page will show its "not found" state.
  }
}

export function getStoredAnalysis(id: string): DocumentAnalysis | null {
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + id);
    return raw ? (JSON.parse(raw) as DocumentAnalysis) : null;
  } catch {
    return null;
  }
}

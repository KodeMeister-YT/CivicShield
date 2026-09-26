"use client";

import type { EvidenceVaultItem } from "@/types";

/**
 * Evidence Vault storage. Uses localStorage (persists across sessions,
 * unlike the sessionStorage-backed analysis cache) since the vault is
 * explicitly opt-in: users choose what to save here for later reference.
 * This is a client-only MVP store; a production build would sync this to
 * an authenticated backend (see product spec section 19).
 */
const KEY = "civicshield:vault";

export function getVaultItems(): EvidenceVaultItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as EvidenceVaultItem[]) : [];
  } catch {
    return [];
  }
}

export function addVaultItem(item: EvidenceVaultItem) {
  try {
    const items = getVaultItems();
    items.unshift(item);
    localStorage.setItem(KEY, JSON.stringify(items));
    notifyVaultChange();
  } catch {
    // localStorage may be unavailable -- fail silently, vault is best-effort.
  }
}

export function removeVaultItem(id: string) {
  try {
    const items = getVaultItems().filter((i) => i.id !== id);
    localStorage.setItem(KEY, JSON.stringify(items));
    notifyVaultChange();
  } catch {
    // no-op
  }
}

// --- useSyncExternalStore plumbing, so React components can subscribe to
// vault changes without setState-in-effect anti-patterns or hydration
// mismatches (localStorage doesn't exist on the server).
const listeners = new Set<() => void>();

function notifyVaultChange() {
  listeners.forEach((l) => l());
}

export function subscribeVault(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getVaultSnapshot(): EvidenceVaultItem[] {
  return getVaultItems();
}

export function getVaultServerSnapshot(): EvidenceVaultItem[] {
  return [];
}

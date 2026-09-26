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

let cachedItems: EvidenceVaultItem[] = [];
let cachedRaw: string | null = null;

export function getVaultItems(): EvidenceVaultItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cachedRaw) {
      return cachedItems;
    }
    cachedRaw = raw;
    cachedItems = raw ? (JSON.parse(raw) as EvidenceVaultItem[]) : [];
    return cachedItems;
  } catch {
    return [];
  }
}

export function addVaultItem(item: EvidenceVaultItem) {
  try {
    const items = getVaultItems().filter((i) => i.id !== item.id);
    const updated = [item, ...items];
    const serialized = JSON.stringify(updated);
    localStorage.setItem(KEY, serialized);
    cachedRaw = serialized;
    cachedItems = updated;
    notifyVaultChange();
  } catch {
    // localStorage may be unavailable -- fail silently, vault is best-effort.
  }
}

export function removeVaultItem(id: string) {
  try {
    const items = getVaultItems().filter((i) => i.id !== id);
    const serialized = JSON.stringify(items);
    localStorage.setItem(KEY, serialized);
    cachedRaw = serialized;
    cachedItems = items;
    notifyVaultChange();
  } catch {
    // no-op
  }
}

export function clearVault() {
  try {
    localStorage.removeItem(KEY);
    cachedRaw = null;
    cachedItems = [];
    notifyVaultChange();
  } catch {
    // no-op
  }
}

// --- useSyncExternalStore plumbing
const listeners = new Set<() => void>();

function notifyVaultChange() {
  listeners.forEach((l) => l());
}

export function subscribeVault(callback: () => void): () => void {
  listeners.add(callback);
  
  // Also listen for storage events from other tabs
  const handleStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cachedRaw = e.newValue;
      cachedItems = e.newValue ? (JSON.parse(e.newValue) as EvidenceVaultItem[]) : [];
      callback();
    }
  };
  
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }
  
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

export function getVaultSnapshot(): EvidenceVaultItem[] {
  return getVaultItems();
}

const SERVER_SNAPSHOT: EvidenceVaultItem[] = [];
export function getVaultServerSnapshot(): EvidenceVaultItem[] {
  return SERVER_SNAPSHOT;
}


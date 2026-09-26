"use client";

import { useSyncExternalStore } from "react";
import {
  getVaultServerSnapshot,
  getVaultSnapshot,
  removeVaultItem,
  subscribeVault,
} from "@/lib/client/vault-store";
import { formatDate } from "@/lib/utils";
import { Trash2, Archive } from "lucide-react";

export default function VaultPage() {
  const items = useSyncExternalStore(subscribeVault, getVaultSnapshot, getVaultServerSnapshot);

  function remove(id: string) {
    removeVaultItem(id);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-serif-heading text-3xl font-semibold text-ink">Evidence Vault</h1>
      <p className="mt-2 text-ink-soft">
        Save clauses, generated responses, and notes here so your evidence is organized if a
        dispute happens later. Stored only in your browser.
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-border-strong bg-white px-6 py-16 text-center">
          <Archive className="h-8 w-8 text-ink-faint mx-auto" aria-hidden="true" />
          <p className="mt-3 text-sm text-ink-soft">
            Nothing saved yet. From an analysis dashboard, save a clause, note, or generated
            response to see it here.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs uppercase tracking-wide font-medium text-accent">
                    {item.type}
                  </span>
                  <h2 className="mt-1 font-medium text-ink text-sm">{item.title}</h2>
                </div>
                <button
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.title} from vault`}
                  className="text-ink-faint hover:text-concern p-1 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed whitespace-pre-wrap line-clamp-4">
                {item.content}
              </p>
              <p className="mt-2 text-xs text-ink-faint">Saved {formatDate(item.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useState, useSyncExternalStore } from "react";
import {
  addVaultItem,
  clearVault,
  getVaultServerSnapshot,
  getVaultSnapshot,
  removeVaultItem,
  subscribeVault,
} from "@/lib/client/vault-store";
import { formatDate } from "@/lib/utils";
import { Trash2, Archive, Plus, Download, Copy, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import { randomId } from "@/lib/client/id";
import type { EvidenceVaultItem } from "@/types";

type FilterType = "all" | "clause" | "response" | "note";

export default function VaultPage() {
  const items = useSyncExternalStore(subscribeVault, getVaultSnapshot, getVaultServerSnapshot);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    addVaultItem({
      id: randomId(),
      type: "note",
      title: noteTitle.trim(),
      content: noteContent.trim(),
      createdAt: new Date().toISOString(),
    });

    setNoteTitle("");
    setNoteContent("");
    setShowAddNote(false);
    showToast("Evidence note added to Vault!", "success");
  }

  function handleCopy(item: EvidenceVaultItem) {
    navigator.clipboard.writeText(`${item.title}\n\n${item.content}`);
    setCopiedId(item.id);
    showToast("Copied to clipboard!", "info");
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleExport() {
    if (items.length === 0) return;
    const text = items
      .map(
        (it) =>
          `==============================\n[${it.type.toUpperCase()}] ${it.title}\nDate: ${formatDate(
            it.createdAt
          )}\n==============================\n${it.content}\n\n`
      )
      .join("\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `civicshield-evidence-vault-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-heading text-3xl font-semibold text-ink">Evidence Vault</h1>
          <p className="mt-1 text-ink-soft">
            Save clauses, generated responses, and notes so your evidence is organized for any future dispute.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddNote(true)}
            className="whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Add Note
          </Button>
          {items.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExport}
              className="whitespace-nowrap"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {showAddNote && (
        <form
          onSubmit={handleAddNote}
          className="mt-6 rounded-lg border border-brand bg-white p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-brand" /> Add Evidence Note
            </h2>
            <button
              type="button"
              onClick={() => setShowAddNote(false)}
              className="text-xs text-ink-faint hover:text-ink"
            >
              Cancel
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Move-in walkthrough notes or conversation log"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full rounded-md border border-border-strong px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">Evidence / Details</label>
            <textarea
              required
              rows={3}
              placeholder="Record exact timestamps, people spoken to, witness names, or photos taken..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full rounded-md border border-border-strong px-3 py-2 text-sm bg-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddNote(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save to Vault
            </Button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="mt-8 flex items-center justify-between border-b border-border pb-3">
        <div className="flex gap-2">
          {(["all", "clause", "response", "note"] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                filter === t
                  ? "bg-brand text-white"
                  : "bg-paper text-ink-soft hover:bg-brand-soft"
              }`}
            >
              {t === "all" ? `All (${items.length})` : `${t}s (${items.filter((i) => i.type === t).length})`}
            </button>
          ))}
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your entire Evidence Vault?")) {
                clearVault();
              }
            }}
            className="text-xs text-ink-faint hover:text-concern transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-border-strong bg-white px-6 py-16 text-center">
          <Archive className="h-8 w-8 text-ink-faint mx-auto" aria-hidden="true" />
          <p className="mt-3 text-sm text-ink-soft font-medium">
            {items.length === 0
              ? "Nothing saved yet."
              : `No items matching "${filter}".`}
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            {items.length === 0
              ? "From an analysis dashboard, save important clauses, letters, or add a manual note above."
              : "Try switching filter tabs."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {filteredItems.map((item) => (
            <li key={item.id} className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block text-[0.65rem] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-brand-soft text-brand">
                    {item.type}
                  </span>
                  <h2 className="mt-1.5 font-medium text-ink text-base">{item.title}</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(item)}
                    aria-label="Copy to clipboard"
                    className="text-ink-faint hover:text-brand p-1.5 rounded hover:bg-brand-soft transition-colors"
                    title="Copy text"
                  >
                    {copiedId === item.id ? <Check className="h-4 w-4 text-low" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => removeVaultItem(item.id)}
                    aria-label={`Remove ${item.title} from vault`}
                    className="text-ink-faint hover:text-concern p-1.5 rounded hover:bg-concern-bg transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed whitespace-pre-wrap bg-paper p-3 rounded border border-border/60">
                {item.content}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-ink-faint">
                <span>Saved on {formatDate(item.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

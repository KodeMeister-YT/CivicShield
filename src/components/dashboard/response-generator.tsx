"use client";

import type { Finding, GeneratedResponse } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, Check, Copy, X } from "lucide-react";
import { addVaultItem } from "@/lib/client/vault-store";
import { randomId } from "@/lib/client/id";

export function ResponseGenerator({
  finding,
  onClose,
}: {
  finding: Finding;
  onClose: () => void;
}) {
  const recipientDefault = domainToRecipient(finding.domain);
  const [recipientType, setRecipientType] = useState(recipientDefault);
  const [response, setResponse] = useState<GeneratedResponse | null>(null);
  const [editableBody, setEditableBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finding, recipientType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not generate a response.");
        return;
      }
      setResponse(data.response);
      setEditableBody(data.response.body);
    } catch {
      setError("Response generation is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(editableBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function saveToVault() {
    if (!response) return;
    addVaultItem({
      id: randomId(),
      type: "response",
      title: response.subject,
      content: editableBody,
      createdAt: new Date().toISOString(),
      analysisId: finding.id,
    });
    setSaved(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="response-gen-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm p-0 sm:p-6"
    >
      <div className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-t-xl sm:rounded-xl bg-white shadow-xl p-6">
        <div className="flex items-start justify-between">
          <h2 id="response-gen-title" className="font-serif-heading text-xl font-semibold text-ink">
            Generate Response
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-faint hover:text-ink p-1.5 rounded hover:bg-brand-soft"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!response && (
          <div className="mt-5">
            <label htmlFor="recipient-type" className="text-sm font-medium text-ink">
              Who is this addressed to?
            </label>
            <select
              id="recipient-type"
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value as GeneratedResponse["recipientType"])}
              className="mt-1.5 w-full rounded-md border border-border-strong px-3 py-2 text-sm bg-white"
            >
              <option value="landlord">Landlord / Property Manager</option>
              <option value="employer">Employer / HR</option>
              <option value="seller">Seller / Customer Service</option>
              <option value="other">Other</option>
            </select>

            {error && <p className="mt-3 text-sm text-concern">{error}</p>}

            <Button onClick={generate} disabled={loading} className="mt-5 w-full">
              {loading ? "Generating…" : "Generate Response"}
            </Button>
          </div>
        )}

        {response && (
          <div className="mt-5">
            <p className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-1">Subject</p>
            <p className="text-sm text-ink mb-4">{response.subject}</p>
            <label htmlFor="response-body" className="text-xs font-medium text-ink-faint uppercase tracking-wide">
              Edit response
            </label>
            <textarea
              id="response-body"
              value={editableBody}
              onChange={(e) => setEditableBody(e.target.value)}
              rows={12}
              className="mt-1.5 w-full rounded-md border border-border-strong px-3 py-2.5 text-sm font-sans leading-relaxed"
            />
            <p className="mt-2 text-xs text-ink-faint">
              This draft is generated from your document and this finding. Review and edit before
              sending -- CivicShield does not send messages on your behalf.
            </p>
            <div className="mt-4 flex gap-3">
              <Button onClick={copyToClipboard} variant="secondary" className="flex-1">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy response"}
              </Button>
              <Button onClick={saveToVault} variant="secondary" disabled={saved} className="flex-1">
                <BookmarkPlus className="h-4 w-4" />
                {saved ? "Saved to vault" : "Save to vault"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function domainToRecipient(domain: Finding["domain"]): GeneratedResponse["recipientType"] {
  switch (domain) {
    case "TenantShield":
      return "landlord";
    case "WorkShield":
      return "employer";
    case "ConsumerShield":
      return "seller";
    default:
      return "other";
  }
}

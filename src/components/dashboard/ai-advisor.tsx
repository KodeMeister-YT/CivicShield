"use client";

import type { Finding } from "@/types";
import type { AdvisorAdvice } from "@/lib/ai/gemini";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/severity-badge";
import {
  X,
  Shield,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Send,
  Loader2,
  BookmarkPlus,
  Sparkles,
  FileEdit,
  MessageCircleQuestion,
  HelpCircle,
} from "lucide-react";
import { addVaultItem } from "@/lib/client/vault-store";
import { randomId } from "@/lib/client/id";

interface Message {
  role: "user" | "ai";
  text: string;
}

export function AiAdvisor({
  finding,
  jurisdiction,
  onClose,
  onOpenResponse,
  onOpenScenario,
}: {
  finding: Finding;
  jurisdiction?: string;
  onClose: () => void;
  onOpenResponse: () => void;
  onOpenScenario: () => void;
}) {
  const [advice, setAdvice] = useState<AdvisorAdvice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [savedToVault, setSavedToVault] = useState(false);

  // Chat Q&A state
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    async function fetchAdvice() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ finding, jurisdiction }),
        });
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          setError(data.error ?? "Could not load strategic advice.");
        } else {
          setAdvice(data.advice);
        }
      } catch {
        if (active) setError("Strategic advisor is temporarily unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAdvice();
    return () => {
      active = false;
    };
  }, [finding, jurisdiction]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleAskQuestion(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!question.trim() || asking) return;

    const userText = question.trim();
    setQuestion("");
    const newMessages: Message[] = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setAsking(true);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finding,
          question: userText,
          chatHistory: newMessages,
          jurisdiction,
        }),
      });
      const data = await res.json();
      if (res.ok && data.answer) {
        setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "I'm having trouble analyzing that question right now. Please try again or rephrase." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Network error occurred while fetching the answer." },
      ]);
    } finally {
      setAsking(false);
    }
  }

  function copyScript() {
    if (!advice?.negotiationScript) return;
    navigator.clipboard.writeText(advice.negotiationScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  }

  function handleSaveToVault() {
    if (!advice) return;
    addVaultItem({
      id: randomId(),
      type: "note",
      title: `Action Strategy: ${finding.title}`,
      content: `EXECUTIVE SUMMARY:\n${advice.executiveSummary}\n\nACTION STEPS:\n${advice.actionChecklist
        .map((a) => `- [${a.urgency.toUpperCase()}] ${a.step}: ${a.detail}`)
        .join("\n")}\n\nNEGOTIATION SCRIPT:\n${advice.negotiationScript}`,
      createdAt: new Date().toISOString(),
      analysisId: finding.id,
    });
    setSavedToVault(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="advisor-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 backdrop-blur-md p-0 sm:p-6 animate-fade-in"
    >
      <div className="w-full sm:max-w-2xl max-h-[92vh] flex flex-col rounded-t-xl sm:rounded-xl bg-white shadow-2xl overflow-hidden border border-border animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-paper-raised">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-brand-soft flex items-center justify-center text-brand">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 id="advisor-title" className="font-serif-heading text-lg font-semibold text-ink">
                AI Action Advisor
              </h2>
              <p className="text-xs text-ink-faint">
                Tactical guidance for {finding.title} {jurisdiction ? `(${jurisdiction})` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-faint hover:text-ink p-1.5 rounded hover:bg-brand-soft transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <SeverityBadge severity={finding.severity} />
            <span className="text-xs text-ink-faint">
              {finding.section ? `Section ${finding.section}` : "Relevant provision"}
            </span>
          </div>

          {loading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto" />
              <p className="text-sm text-ink-soft font-medium">Generating your strategic action plan…</p>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg border border-concern/30 bg-concern-bg p-4 text-sm text-concern">
              {error}
            </div>
          )}

          {advice && !loading && (
            <>
              {/* Executive Summary */}
              <div className="rounded-lg border border-brand/20 bg-brand-soft/40 p-4">
                <div className="flex items-start gap-2.5">
                  <Shield className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-brand">
                      Your Legal Standing & Leverage
                    </h3>
                    <p className="mt-1 text-sm text-ink leading-relaxed font-sans">
                      {advice.executiveSummary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rights Overview */}
              {advice.rightsOverview?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint mb-2">
                    Key Rights You Retain
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {advice.rightsOverview.map((right, idx) => (
                      <div
                        key={idx}
                        className="rounded-md border border-border bg-paper p-2.5 text-xs text-ink flex items-start gap-2"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-low flex-shrink-0 mt-0.5" />
                        <span>{right}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checklist */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint mb-2">
                  Immediate Action Checklist
                </h3>
                <ul className="space-y-2">
                  {advice.actionChecklist.map((item, idx) => (
                    <li
                      key={idx}
                      className="rounded-md border border-border p-3 bg-white flex items-start justify-between gap-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-ink">{item.step}</p>
                        <p className="text-xs text-ink-soft mt-0.5 leading-relaxed">{item.detail}</p>
                      </div>
                      <span
                        className={`text-[0.65rem] uppercase font-semibold px-2 py-0.5 rounded tracking-wide ${
                          item.urgency === "immediate"
                            ? "bg-concern-bg text-concern"
                            : item.urgency === "soon"
                            ? "bg-review-bg text-review"
                            : "bg-paper text-ink-faint"
                        }`}
                      >
                        {item.urgency}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-low/20 bg-low-bg/40 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-low flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="h-3.5 w-3.5" /> What To Do
                  </h3>
                  <ul className="space-y-1.5 text-xs text-ink-soft">
                    {advice.dos.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-low font-bold">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-concern/20 bg-concern-bg/40 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-concern flex items-center gap-1.5 mb-2">
                    <XCircle className="h-3.5 w-3.5" /> What NOT To Do
                  </h3>
                  <ul className="space-y-1.5 text-xs text-ink-soft">
                    {advice.donts.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-concern font-bold">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Negotiation Script */}
              {advice.negotiationScript && (
                <div className="rounded-lg border border-border bg-paper p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                      Recommended Script (Email or Talking Point)
                    </h3>
                    <button
                      onClick={copyScript}
                      className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
                    >
                      {copiedScript ? <Check className="h-3.5 w-3.5 text-low" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedScript ? "Copied" : "Copy script"}
                    </button>
                  </div>
                  <p className="text-xs text-ink-soft leading-relaxed italic border-l-2 border-brand pl-3">
                    &ldquo;{advice.negotiationScript}&rdquo;
                  </p>
                </div>
              )}

              {/* Interactive Follow-up Chat */}
              <div className="border-t border-border pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint mb-2 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-brand" /> Ask Follow-Up Question
                </h3>
                <p className="text-xs text-ink-soft mb-3">
                  Have a specific question about how this applies to your situation? Ask our AI advisor:
                </p>

                {messages.length > 0 && (
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto p-3 bg-paper rounded-lg border border-border">
                    {messages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-2.5 rounded-md ${
                          m.role === "user"
                            ? "bg-brand text-white ml-8"
                            : "bg-white text-ink border border-border mr-8 leading-relaxed whitespace-pre-wrap"
                        }`}
                      >
                        <p className="font-semibold text-[0.65rem] mb-0.5 opacity-70">
                          {m.role === "user" ? "You" : "CivicShield AI Advisor"}
                        </p>
                        {m.text}
                      </div>
                    ))}
                    {asking && (
                      <div className="text-xs p-2.5 rounded-md bg-white text-ink border border-border mr-8 flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
                        <span>Researching your question…</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}

                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Can they evict me immediately if I refuse to pay this fee?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="flex-1 rounded-md border border-border-strong px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <Button type="submit" size="sm" disabled={!question.trim() || asking}>
                    {asking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Footer Action Bridges */}
        <div className="p-4 border-t border-border bg-paper-raised flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onOpenResponse();
              }}
            >
              <FileEdit className="h-3.5 w-3.5" />
              Draft Response Letter
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenScenario();
              }}
            >
              <MessageCircleQuestion className="h-3.5 w-3.5" />
              Simulate Scenario
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveToVault}
            disabled={savedToVault || !advice}
            className="text-xs"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            {savedToVault ? "Strategy Saved to Vault" : "Save Strategy to Vault"}
          </Button>
        </div>
      </div>
    </div>
  );
}

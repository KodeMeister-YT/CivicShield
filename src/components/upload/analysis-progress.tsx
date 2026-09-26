"use client";

import { Check, Loader2, Sparkles, Shield, Cpu, Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STAGES = [
  { key: "reading", label: "Optical structure parsing & clause boundary identification", short: "Structure Parsing" },
  { key: "extracting", label: "Extracting legal covenants, deposit terms & termination thresholds", short: "Clause Extraction" },
  { key: "detecting_issues", label: "Cross-referencing statutory rights against state code", short: "Statutory Audit" },
  { key: "verifying_sources", label: "Grounding legal citations via Gemini RAG pipeline", short: "Citation Grounding" },
  { key: "building_action_plan", label: "Synthesizing tactical defense strategy & negotiation letters", short: "Defense Synthesis" },
] as const;

export function AnalysisProgress({ done }: { done: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i < STAGES.length - 1 ? i + 1 : i));
    }, 750);
    return () => clearInterval(interval);
  }, [done]);

  const displayIndex = done ? STAGES.length : activeIndex;
  const progressPercent = Math.min(100, Math.round(((displayIndex + 1) / (STAGES.length + 1)) * 100));

  return (
    <div className="space-y-6 perspective-1000">
      {/* 3D Scanning Hologram Chamber */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-brand/40 bg-gradient-to-br from-paper-raised via-white to-brand-soft/40 p-6 shadow-xl shadow-brand/10 card-3d">
        {/* Animated Cyber Grid */}
        <div className="absolute inset-0 bg-grid-subtle opacity-40 pointer-events-none" />

        {/* Ambient Corner Glows */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        {/* Dynamic Sweeping Laser Scan Beam */}
        <div className="animate-scan-beam" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand to-brand-strong text-white shadow-md shadow-brand/20">
              <Shield className="h-6 w-6 animate-pulse" />
              <div className="absolute -inset-1 rounded-xl border border-brand/50 animate-radar pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-ink">CivicShield Legal Audit Engine</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Active
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-0.5">
                Multi-agent legal review powered by Google Gemini 2.5 Flash &amp; Verified Legal RAG
              </p>
            </div>
          </div>

          {/* Percentage Readout Counter */}
          <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
            <span className="text-2xl font-black text-brand tracking-tight">
              {progressPercent}%
            </span>
            <span className="text-[0.65rem] uppercase font-bold tracking-wider text-ink-faint">
              Audit Progress
            </span>
          </div>
        </div>

        {/* Shimmering Progress Bar */}
        <div className="mt-5 h-2.5 w-full rounded-full bg-paper border border-border overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-brand via-accent to-brand transition-all duration-500 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 animate-shimmer" />
          </div>
        </div>

        {/* Live System Telemetry Ticker */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.7rem] text-ink-faint border-t border-border/60 pt-2.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3 w-3 text-brand" />
            <span>In-Memory Inference Sandbox</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Scale className="h-3 w-3 text-accent" />
            <span>State Statutory Verification</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Zero Server Retention</span>
          </div>
        </div>
      </div>

      {/* Discrete 3D Stage Cards */}
      <ul className="space-y-2.5" aria-live="polite">
        {STAGES.map((stage, i) => {
          const complete = i < displayIndex || done;
          const active = i === displayIndex && !done;
          return (
            <li
              key={stage.key}
              className={cn(
                "flex items-center justify-between rounded-xl border p-3 text-sm transition-all duration-300 card-3d-subtle",
                active && "border-brand bg-brand-soft/50 shadow-xs translate-x-1.5 font-medium ring-1 ring-brand/20",
                complete && "border-border/80 bg-white/80 opacity-90",
                !complete && !active && "border-border/40 bg-white/40 opacity-40"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-lg flex-shrink-0 text-xs transition-all duration-300 shadow-2xs",
                    complete
                      ? "bg-emerald-600 text-white"
                      : active
                      ? "bg-brand text-white ring-2 ring-brand/30 animate-pulse"
                      : "bg-paper border border-border text-ink-faint"
                  )}
                >
                  {complete ? (
                    <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
                  ) : active ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </span>
                <span className={cn("text-xs sm:text-sm truncate", complete || active ? "text-ink font-medium" : "text-ink-faint")}>
                  {stage.label}
                </span>
              </div>

              <span
                className={cn(
                  "text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 hidden sm:inline-block",
                  complete ? "bg-emerald-50 text-emerald-700" : active ? "bg-brand-soft text-brand font-bold" : "text-ink-faint"
                )}
              >
                {complete ? "Complete" : active ? "Processing" : "Queued"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

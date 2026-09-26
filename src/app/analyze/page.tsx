"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import { Dropzone } from "@/components/upload/dropzone";
import { CategorySelect } from "@/components/upload/category-select";
import { AnalysisProgress } from "@/components/upload/analysis-progress";
import { Button } from "@/components/ui/button";
import type { DocumentAnalysis, DocumentCategory, PipelineError } from "@/types";
import {
  AlertCircle,
  MapPin,
  Sparkles,
  Home,
  Briefcase,
  ShoppingBag,
  ArrowRight,
  Shield,
  Scale,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { storeAnalysis } from "@/lib/client/analysis-store";
import { TENANT_DEMO_TEXT, WORK_DEMO_TEXT, CONSUMER_DEMO_TEXT } from "@/data/demo/documents";
import { showToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const JURISDICTIONS = [
  { name: "California", stat: "Cal. Civ. Code § 1950.5, AB 1482, B&P § 16600 active", badge: "High Protection" },
  { name: "New York", stat: "NY Gen. Oblig. § 7-108, HSTPA 2019 active", badge: "High Protection" },
  { name: "Texas", stat: "Tex. Prop. Code § 92.103 & § 92.104 active", badge: "Standard Protection" },
  { name: "Florida", stat: "Fla. Stat. Chap. 83 active", badge: "Standard Protection" },
  { name: "Federal / General US", stat: "UCC § 2-302, Magnuson-Moss & FLSA active", badge: "Federal Code" },
  { name: "Other / Nationwide", stat: "General Restatement of Contracts (Second)", badge: "Common Law" },
];

const PRESET_SHOWCASES = {
  tenant: {
    title: "California Residential Lease",
    clauseRef: "Section 3.2 · Security Deposit",
    rawQuote:
      "The security deposit of $2,000.00 is strictly non-refundable and will be retained by Landlord regardless of the condition of the premises upon termination.",
    trapType: "Unlawful Blanket Deposit Forfeiture",
    statute: "California Civil Code § 1950.5",
    cureSummary:
      "Non-refundable deposits are illegal in California. Landlords must return the deposit within 21 days minus itemized receipts for actual damages.",
    recommendedStep: "Generate statutory 21-day demand counter-letter citing Cal. Civ. Code § 1950.5.",
    riskLevel: "Critical Concern",
    riskBadge: "border-red-500 text-red-700 bg-red-50",
  },
  work: {
    title: "Employment Termination Agreement",
    clauseRef: "Section 4.1 · Non-Compete Covenant",
    rawQuote:
      "For a period of 24 months post-termination, Employee shall not engage in, work for, or consult with any competitive technology enterprise nationwide.",
    trapType: "Void Restrictive Non-Compete",
    statute: "Cal. Bus. & Prof. Code § 16600 & FTC Rule",
    cureSummary:
      "Post-employment non-compete agreements are void as a matter of law in California regardless of whether signed voluntarily.",
    recommendedStep: "Counter with standard NDA and request clean severance release waiver.",
    riskLevel: "High Attention",
    riskBadge: "border-amber-500 text-amber-700 bg-amber-50",
  },
  consumer: {
    title: "Consumer Terms & Warranty",
    clauseRef: "Section 7 · As-Is Warranty Waiver",
    rawQuote:
      "Products are sold strictly 'AS IS' with all faults. Company disclaims all express and implied warranties and provides no refunds.",
    trapType: "Deceptive Warranty Waiver",
    statute: "Magnuson-Moss Warranty Act & UCC § 2-302",
    cureSummary:
      "Implied warranties of merchantability cannot be disclaimed if a written service contract or warranty is offered.",
    recommendedStep: "File formal refund claim citing Magnuson-Moss disclosure mandates.",
    riskLevel: "Review Needed",
    riskBadge: "border-yellow-500 text-yellow-800 bg-yellow-50",
  },
};

function AnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sampleParam = searchParams.get("sample");

  const initialSample = useMemo(() => {
    if (!sampleParam) return null;
    if (sampleParam === "tenant" || sampleParam.includes("lease") || sampleParam.includes("residential")) {
      return {
        file: new File([TENANT_DEMO_TEXT], "Sample_California_Lease.txt", { type: "text/plain" }),
        category: "housing" as DocumentCategory,
        jurisdiction: "California",
        preset: "tenant" as const,
      };
    }
    if (sampleParam === "work" || sampleParam.includes("employment")) {
      return {
        file: new File([WORK_DEMO_TEXT], "Notice_of_Termination.txt", { type: "text/plain" }),
        category: "employment" as DocumentCategory,
        jurisdiction: "California",
        preset: "work" as const,
      };
    }
    if (sampleParam === "consumer" || sampleParam.includes("warranty")) {
      return {
        file: new File([CONSUMER_DEMO_TEXT], "Purchase_and_Warranty_Agreement.txt", { type: "text/plain" }),
        category: "consumer" as DocumentCategory,
        jurisdiction: "Federal / General US",
        preset: "consumer" as const,
      };
    }
    return null;
  }, [sampleParam]);

  const [file, setFile] = useState<File | null>(() => initialSample?.file ?? null);
  const [category, setCategory] = useState<DocumentCategory | null>(() => initialSample?.category ?? null);
  const [jurisdiction, setJurisdiction] = useState<string>(
    () => initialSample?.jurisdiction ?? "Federal / General US"
  );
  const [status, setStatus] = useState<"idle" | "analyzing" | "done" | "error">("idle");
  const [error, setError] = useState<PipelineError | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<"tenant" | "work" | "consumer" | null>(
    () => initialSample?.preset ?? null
  );

  function loadSample(type: "tenant" | "work" | "consumer") {
    let text = "";
    let name = "";
    let cat: DocumentCategory = "housing";
    let jur = "California";

    if (type === "tenant") {
      text = TENANT_DEMO_TEXT;
      name = "Sample_California_Lease.txt";
      cat = "housing";
      jur = "California";
    } else if (type === "work") {
      text = WORK_DEMO_TEXT;
      name = "Notice_of_Termination.txt";
      cat = "employment";
      jur = "California";
    } else {
      text = CONSUMER_DEMO_TEXT;
      name = "Purchase_and_Warranty_Agreement.txt";
      cat = "consumer";
      jur = "Federal / General US";
    }

    const sampleFile = new File([text], name, { type: "text/plain" });
    setFile(sampleFile);
    setCategory(cat);
    setJurisdiction(jur);
    setSelectedPreset(type);
    showToast(`Loaded ${name}! Ready to analyze.`, "info");
  }

  async function handleAnalyze() {
    if (!file) return;
    setStatus("analyzing");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    if (category) formData.append("category", category);
    formData.append("jurisdiction", jurisdiction);

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error as PipelineError);
        setStatus("error");
        return;
      }

      const analysis = data.analysis as DocumentAnalysis;
      storeAnalysis(analysis);
      setStatus("done");
      router.push(`/dashboard/${analysis.id}`);
    } catch {
      setError({
        stage: "unknown",
        message: "network error",
        userMessage:
          "Analysis is temporarily unavailable. Your original document has not been modified.",
      });
      setStatus("error");
    }
  }

  const currentJurData = JURISDICTIONS.find((j) => j.name === jurisdiction) ?? JURISDICTIONS[0];
  const activePresetData = selectedPreset
    ? PRESET_SHOWCASES[selectedPreset]
    : PRESET_SHOWCASES.tenant;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Dynamic 3D Ambient Glowing Orbs */}
      <div className="hero-glow-orb -top-24 -left-24 h-96 w-96 bg-brand/10 animate-float" />
      <div className="hero-glow-orb top-1/2 -right-32 h-[450px] w-[450px] bg-accent/10 animate-float-slow" />
      <div className="hero-glow-orb -bottom-32 left-1/3 h-80 w-80 bg-indigo-500/10 animate-float-reverse" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:py-14">
        {/* Header with 3D Cyber Beacon */}
        <div className="text-center sm:text-left space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft/70 px-3.5 py-1 text-xs font-semibold text-brand shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Legal Ingestion Engine &middot; LexHack 2026</span>
          </div>

          <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            Analyze Any Legal Document
          </h1>
          <p className="text-sm sm:text-base text-ink-soft max-w-2xl leading-relaxed">
            Choose a 1-click sample or drop your own contract. Watch CivicShield continuously scan for predatory traps, ground your rights in verified law, and generate your defense.
          </p>
        </div>

        {/* 2-Column Workstation: Left (Input Station) / Right (Continuous Animated Live Scanner) */}
        <div className="grid lg:grid-cols-12 gap-8 items-start mt-8">
          {/* LEFT COLUMN: Input & Configuration Station */}
          <div className="lg:col-span-7 space-y-6">
            {/* 3D Interactive Sample Document Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  Step 1: Choose a Curated Sample or Your Own File:
                </label>
                <span className="text-[0.65rem] text-ink-faint hidden sm:inline">
                  Click to preview instant contract
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {/* Preset 1: Tenant */}
                <button
                  type="button"
                  onClick={() => loadSample("tenant")}
                  className={cn(
                    "relative text-left rounded-xl border p-3.5 transition-all duration-200 cursor-pointer card-3d flex flex-col justify-between",
                    selectedPreset === "tenant"
                      ? "border-brand bg-brand-soft/50 ring-2 ring-brand/30 shadow-md -translate-y-1"
                      : "border-border bg-white hover:border-brand/50 hover:bg-paper/50"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand">
                        <Home className="h-4 w-4" />
                      </div>
                      <span className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 border border-amber-200">
                        3 High Risks
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-ink">California Lease</h4>
                    <p className="text-[0.7rem] text-ink-soft mt-1 leading-normal line-clamp-2">
                      Deposit forfeiture, 24h notice, unannounced entry.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[0.65rem] text-ink-faint">
                    <span>Cal. Civ. Code § 1950.5</span>
                    {selectedPreset === "tenant" && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
                    )}
                  </div>
                </button>

                {/* Preset 2: Employment */}
                <button
                  type="button"
                  onClick={() => loadSample("work")}
                  className={cn(
                    "relative text-left rounded-xl border p-3.5 transition-all duration-200 cursor-pointer card-3d flex flex-col justify-between",
                    selectedPreset === "work"
                      ? "border-brand bg-brand-soft/50 ring-2 ring-brand/30 shadow-md -translate-y-1"
                      : "border-border bg-white hover:border-brand/50 hover:bg-paper/50"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <span className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-800 border border-purple-200">
                        Unlawful Ban
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-ink">Employment Termination</h4>
                    <p className="text-[0.7rem] text-ink-soft mt-1 leading-normal line-clamp-2">
                      2-year nationwide non-compete, zero severance.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[0.65rem] text-ink-faint">
                    <span>Cal. B&amp;P § 16600</span>
                    {selectedPreset === "work" && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
                    )}
                  </div>
                </button>

                {/* Preset 3: Consumer */}
                <button
                  type="button"
                  onClick={() => loadSample("consumer")}
                  className={cn(
                    "relative text-left rounded-xl border p-3.5 transition-all duration-200 cursor-pointer card-3d flex flex-col justify-between",
                    selectedPreset === "consumer"
                      ? "border-brand bg-brand-soft/50 ring-2 ring-brand/30 shadow-md -translate-y-1"
                      : "border-border bg-white hover:border-brand/50 hover:bg-paper/50"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <span className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-800 border border-blue-200">
                        As-Is Clause
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-ink">Warranty &amp; Purchase</h4>
                    <p className="text-[0.7rem] text-ink-soft mt-1 leading-normal line-clamp-2">
                      Final sale disclaimer, arbitration waiver &amp; return bans.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[0.65rem] text-ink-faint">
                    <span>UCC § 2-302</span>
                    {selectedPreset === "consumer" && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Dropzone / Text Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-ink flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-brand" />
                  Or Upload Your Own Agreement:
                </label>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-ink-faint">
                  {file ? file.name : "Awaiting Document"}
                </span>
              </div>
              <Dropzone
                file={file}
                onFileSelected={(f) => {
                  setFile(f);
                  setSelectedPreset(null);
                }}
                onClear={() => {
                  setFile(null);
                  setSelectedPreset(null);
                }}
              />
            </div>

            {/* Step 2: Category Classification */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-brand" />
                Step 2: Document Classification
              </label>
              <div className="rounded-2xl border border-border bg-white p-4 shadow-xs card-3d-subtle">
                <CategorySelect value={category} onChange={setCategory} />
              </div>
            </div>

            {/* Step 3: Governing Jurisdiction */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="jurisdiction-select" className="text-sm font-semibold text-ink flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-brand" />
                  Step 3: Governing State Jurisdiction
                </label>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-brand bg-brand-soft px-2 py-0.5 rounded">
                  {currentJurData.badge}
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-white p-4 shadow-xs space-y-3 card-3d-subtle">
                <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-center">
                  <select
                    id="jurisdiction-select"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full rounded-xl border border-border-strong px-3.5 py-2 text-sm bg-paper/50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all cursor-pointer font-medium"
                  >
                    {JURISDICTIONS.map((j) => (
                      <option key={j.name} value={j.name}>
                        {j.name}
                      </option>
                    ))}
                  </select>

                  <div className="rounded-lg bg-brand-soft/60 px-3 py-1.5 text-[0.7rem] text-brand font-medium border border-brand/20">
                    <span className="font-bold">Active RAG: </span>
                    {currentJurData.stat}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Button
                onClick={handleAnalyze}
                disabled={!file || status === "analyzing"}
                size="lg"
                className={cn(
                  "w-full sm:w-auto h-12 px-8 text-sm font-semibold rounded-xl transition-all duration-300 shadow-md card-3d cursor-pointer flex items-center justify-center gap-2",
                  file
                    ? "bg-brand text-white hover:bg-brand-strong hover:shadow-lg hover:shadow-brand/20 ring-2 ring-brand/30"
                    : "opacity-50 cursor-not-allowed"
                )}
              >
                {status === "analyzing" ? (
                  <span>Auditing Clauses with Gemini AI…</span>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Run CivicShield Defense Analysis</span>
                    <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <span className="text-xs text-ink-faint flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-brand" />
                100% In-Memory Sandbox &middot; Ready in ~2 seconds
              </span>
            </div>

            {status === "error" && error && (
              <div
                role="alert"
                className="flex gap-3 rounded-xl border border-concern/30 bg-concern-bg p-4 text-sm text-concern animate-shake"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Analysis Failed</p>
                  <p className="text-xs text-concern/90 mt-0.5">{error.userMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Continuous Animated Live Scanner & Defense Radar */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            {/* The Continuous Animated Holographic Scanner Card */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-brand/30 bg-white p-6 shadow-xl card-3d">
              {/* Continuous Laser Scanning Beam Traversing the Card */}
              <div className="animate-continuous-scan" />

              {/* Holographic Scanner Top Header */}
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <Scale className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">{activePresetData.title}</p>
                    <p className="text-[0.65rem] text-ink-faint">Live Continuous Defense Radar</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Scanning Active
                </span>
              </div>

              {/* Scanned Clause Live Quote */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-[0.65rem] uppercase font-bold tracking-wider text-ink-faint">
                  <span>{activePresetData.clauseRef}</span>
                  <span className={cn("px-2 py-0.5 rounded border", activePresetData.riskBadge)}>
                    {activePresetData.riskLevel}
                  </span>
                </div>
                <div className="relative rounded-xl border border-border/80 bg-paper/80 p-3.5 text-xs font-serif italic text-ink leading-relaxed">
                  &ldquo;{activePresetData.rawQuote}&rdquo;
                </div>
              </div>

              {/* Continuous Left-to-Right Animated Neural Flow */}
              <div className="my-4 relative flex items-center justify-between text-[0.65rem] font-bold uppercase tracking-wider text-brand bg-brand-soft/50 rounded-lg p-2 overflow-hidden border border-brand/20">
                <div className="animate-neural-pulse absolute inset-0 bg-gradient-to-r from-transparent via-brand/20 to-transparent pointer-events-none" />
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-concern" />
                  1. Trap Detected
                </span>
                <span className="text-brand">&rarr;</span>
                <span className="flex items-center gap-1">
                  <Scale className="h-3 w-3 text-accent" />
                  2. Grounded Law
                </span>
                <span className="text-brand">&rarr;</span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-emerald-600" />
                  3. Cure Ready
                </span>
              </div>

              {/* Detected Statutory Cure & Legal Shield */}
              <div className="space-y-3">
                <div className="rounded-xl border border-brand/20 bg-brand-soft/40 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-brand">
                    <Shield className="h-3 w-3 text-brand" />
                    <span>Statutory Cure &amp; Legal Shield</span>
                  </div>
                  <p className="text-xs font-bold text-ink">{activePresetData.statute}</p>
                  <p className="text-[0.7rem] text-ink-soft leading-relaxed">
                    {activePresetData.cureSummary}
                  </p>
                </div>

                {/* Recommended Next Step */}
                <div className="rounded-xl border border-border/70 bg-paper/60 p-3 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-ink">Recommended Next Step:</p>
                    <p className="text-[0.7rem] text-ink-soft mt-0.5">
                      {activePresetData.recommendedStep}
                    </p>
                  </div>
                </div>
              </div>

              {/* Telemetry Indicator Nodes */}
              <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-3 gap-2 text-[0.65rem] text-ink-faint text-center">
                <div className="rounded bg-paper p-1.5 border border-border/50">
                  <span className="block font-bold text-ink">0% Stored</span>
                  <span>In-Memory</span>
                </div>
                <div className="rounded bg-paper p-1.5 border border-border/50">
                  <span className="block font-bold text-ink">Verified RAG</span>
                  <span>State Codes</span>
                </div>
                <div className="rounded bg-paper p-1.5 border border-border/50">
                  <span className="block font-bold text-ink">Gemini 2.5</span>
                  <span>Flash Engine</span>
                </div>
              </div>
            </div>

            {/* Live Progress Chamber when analyzing */}
            {status === "analyzing" && (
              <div className="rounded-2xl border-2 border-brand bg-white p-5 shadow-xl animate-fade-in">
                <AnalysisProgress done={false} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-6 py-20 text-center text-ink-soft">
          Loading document analyzer…
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dropzone } from "@/components/upload/dropzone";
import { CategorySelect } from "@/components/upload/category-select";
import { AnalysisProgress } from "@/components/upload/analysis-progress";
import { Button } from "@/components/ui/button";
import type { DocumentAnalysis, DocumentCategory, PipelineError } from "@/types";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { storeAnalysis } from "@/lib/client/analysis-store";

export default function AnalyzePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory | null>(null);
  const [status, setStatus] = useState<"idle" | "analyzing" | "done" | "error">("idle");
  const [error, setError] = useState<PipelineError | null>(null);

  async function handleAnalyze() {
    if (!file) return;
    setStatus("analyzing");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    if (category) formData.append("category", category);

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

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-serif-heading text-3xl font-semibold text-ink">Analyze a Document</h1>
      <p className="mt-2 text-ink-soft">
        Upload a document below. CivicShield extracts clauses, flags potential issues, and grounds
        its findings in verified legal sources.
      </p>

      <div className="mt-8 rounded-md border border-border bg-accent-soft/60 px-4 py-3 text-sm text-ink-soft flex gap-2.5">
        <ShieldAlert className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          Your documents may contain sensitive information. Avoid uploading information you are
          not authorized to share. Files are processed only for this analysis and are not stored
          on our servers.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        <Dropzone file={file} onFileSelected={setFile} onClear={() => setFile(null)} />
        <CategorySelect value={category} onChange={setCategory} />
      </div>

      {status === "analyzing" && (
        <div className="mt-8 rounded-lg border border-border bg-white p-6">
          <AnalysisProgress done={false} />
        </div>
      )}

      {status === "error" && error && (
        <div
          role="alert"
          className="mt-8 flex gap-2.5 rounded-md border border-concern/30 bg-concern-bg px-4 py-3 text-sm text-concern"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p>{error.userMessage}</p>
        </div>
      )}

      <div className="mt-8">
        <Button
          onClick={handleAnalyze}
          disabled={!file || status === "analyzing"}
          size="lg"
          className="w-full sm:w-auto"
        >
          {status === "analyzing" ? "Analyzing…" : "Start Analysis"}
        </Button>
      </div>
    </div>
  );
}

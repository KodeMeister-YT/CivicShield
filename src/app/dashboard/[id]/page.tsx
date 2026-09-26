"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { DocumentAnalysis, PipelineError } from "@/types";
import { getStoredAnalysis } from "@/lib/client/analysis-store";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AlertCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

export default function DashboardPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [error, setError] = useState<PipelineError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      if (id.startsWith("demo-")) {
        const slug = id.replace("demo-", "");
        try {
          const res = await fetch(`/api/demo/${slug}`);
          const data = await res.json();
          if (!active) return;
          if (!res.ok) {
            setError(data.error);
          } else {
            setAnalysis(data.analysis);
          }
        } catch {
          if (active) {
            setError({
              stage: "unknown",
              message: "network error",
              userMessage: "Demo data is temporarily unavailable.",
            });
          }
        }
        setLoading(false);
        return;
      }

      const stored = getStoredAnalysis(id);
      if (active) {
        setAnalysis(stored);
        if (!stored) {
          setError({
            stage: "unknown",
            message: "not found",
            userMessage:
              "We couldn't find this analysis. It may have expired, or the page was opened in a new tab/session.",
          });
        }
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center text-ink-soft">
        Loading analysis…
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <AlertCircle className="h-8 w-8 text-concern mx-auto" aria-hidden="true" />
        <p className="mt-4 text-ink-soft">
          {error?.userMessage ?? "Something went wrong loading this analysis."}
        </p>
        <LinkButton href="/analyze" className="mt-6" variant="secondary">
          Analyze a document
        </LinkButton>
      </div>
    );
  }

  return <DashboardShell analysis={analysis} />;
}

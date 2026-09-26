"use client";

import { cn } from "@/lib/utils";
import {
  FileText,
  UploadCloud,
  X,
  CheckCircle2,
  Sparkles,
  ClipboardPaste,
  Shield,
  FileCode,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

const ACCEPTED = ".pdf,.docx,.txt";

function getFileBadge(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return { label: "PDF", bg: "bg-red-500/10 text-red-700 border-red-200" };
  if (ext === "docx" || ext === "doc") return { label: "DOCX", bg: "bg-blue-500/10 text-blue-700 border-blue-200" };
  return { label: "TXT", bg: "bg-emerald-500/10 text-emerald-700 border-emerald-200" };
}

export function Dropzone({
  file,
  onFileSelected,
  onClear,
}: {
  file: File | null;
  onFileSelected: (file: File) => void;
  onClear: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<"file" | "paste">("file");
  const [pastedText, setPastedText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) onFileSelected(dropped);
    },
    [onFileSelected]
  );

  const handleApplyPastedText = () => {
    if (!pastedText.trim()) return;
    const pastedFile = new File([pastedText], "Pasted_Contract.txt", { type: "text/plain" });
    onFileSelected(pastedFile);
    setPastedText("");
  };

  if (file) {
    const badge = getFileBadge(file.name);
    return (
      <div className="relative group perspective-1000 animate-fade-in">
        <div className="relative overflow-hidden rounded-xl border-2 border-brand/40 bg-gradient-to-br from-white via-paper-raised to-brand-soft/30 p-5 shadow-lg shadow-brand/5 card-3d">
          {/* Subtle 3D ambient glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* 3D Document Badge */}
              <div className="relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-brand to-brand-strong text-white shadow-md shadow-brand/20">
                <FileText className="h-6 w-6" aria-hidden="true" />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </p>
                  <span
                    className={cn(
                      "text-[0.65rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                      badge.bg
                    )}
                  >
                    {badge.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-ink-soft">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span>&middot;</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <Sparkles className="h-3 w-3 text-emerald-600 animate-pulse" />
                    Ready for Ingestion
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClear}
              aria-label="Remove selected file"
              className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-white text-ink-faint hover:text-concern hover:border-concern/40 hover:bg-concern-bg/40 transition-all shadow-2xs"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 perspective-1000">
      {/* Upload Mode Switcher Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-paper-raised/80 w-fit text-xs font-medium">
        <button
          type="button"
          onClick={() => setMode("file")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer",
            mode === "file"
              ? "bg-brand text-white shadow-2xs"
              : "text-ink-soft hover:text-ink hover:bg-paper"
          )}
        >
          <UploadCloud className="h-3.5 w-3.5" />
          <span>Upload File (PDF / DOCX / TXT)</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer",
            mode === "paste"
              ? "bg-brand text-white shadow-2xs"
              : "text-ink-soft hover:text-ink hover:bg-paper"
          )}
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          <span>Paste Contract Text</span>
        </button>
      </div>

      {mode === "file" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-300 card-3d",
            isDragging
              ? "border-brand bg-gradient-to-b from-brand-soft/80 to-white ring-4 ring-brand/20 scale-[1.01]"
              : "border-border-strong bg-white hover:border-brand/70 hover:bg-paper/40"
          )}
        >
          {/* Subtle cyber background grid */}
          <div className="absolute inset-0 bg-grid-subtle opacity-30 pointer-events-none" />

          {/* 3D Layered Floating Document Stack Graphic */}
          <div className="relative mx-auto mb-4 h-16 w-16 flex items-center justify-center">
            {/* Background Layer 1 */}
            <div className="absolute inset-0 rounded-xl bg-accent-soft border border-accent/20 rotate-6 scale-90 opacity-60 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-95" />
            {/* Background Layer 2 */}
            <div className="absolute inset-0 rounded-xl bg-brand-soft border border-brand/20 -rotate-6 scale-95 opacity-80 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-100" />
            {/* Front Card */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-brand to-brand-strong text-white shadow-lg shadow-brand/25 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
              <UploadCloud className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
              {/* Radar pulse ring */}
              <div className="absolute -inset-1 rounded-xl border border-brand/40 animate-radar pointer-events-none" />
            </div>
          </div>

          <div className="relative z-10 space-y-1">
            <p className="text-base font-semibold text-ink transition-colors group-hover:text-brand">
              Drag &amp; drop your document here
            </p>
            <p className="text-xs text-ink-soft">
              Supports <span className="font-semibold text-ink">PDF</span>,{" "}
              <span className="font-semibold text-ink">DOCX</span>, or{" "}
              <span className="font-semibold text-ink">TXT</span> up to 10 MB
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand bg-brand-soft/70 px-3 py-1 rounded-full group-hover:bg-brand group-hover:text-white transition-all shadow-2xs">
                <FileCode className="h-3.5 w-3.5" />
                Or click to browse files
              </span>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="sr-only"
            aria-label="Choose a document to upload"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) onFileSelected(selected);
            }}
          />
        </div>
      ) : (
        /* Direct Text Paste Tab */
        <div className="relative rounded-2xl border-2 border-border bg-white p-5 shadow-sm space-y-3 card-3d">
          <div className="flex items-center justify-between">
            <label htmlFor="paste-contract" className="text-xs font-semibold text-ink flex items-center gap-1.5">
              <ClipboardPaste className="h-3.5 w-3.5 text-brand" />
              Paste Full Agreement or Lease Text
            </label>
            <span className="text-[0.65rem] text-ink-faint">
              {pastedText.length} characters
            </span>
          </div>
          <textarea
            id="paste-contract"
            rows={5}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your lease, employment contract, or warranty agreement text here..."
            className="w-full rounded-xl border border-border p-3 text-xs leading-relaxed font-mono bg-paper/50 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-y"
          />
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-ink-faint flex items-center gap-1">
              <Shield className="h-3 w-3 text-brand" />
              Zero server logging &middot; 100% memory processed
            </span>
            <button
              type="button"
              disabled={!pastedText.trim()}
              onClick={handleApplyPastedText}
              className="text-xs font-semibold rounded-lg bg-brand text-white px-4 py-2 hover:bg-brand/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Use This Text
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

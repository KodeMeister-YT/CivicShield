"use client";

import { cn } from "@/lib/utils";
import { FileText, UploadCloud, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

const ACCEPTED = ".pdf,.docx,.txt";

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

  if (file) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-brand flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-ink">{file.name}</p>
            <p className="text-xs text-ink-faint">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Remove selected file"
          className="text-ink-faint hover:text-ink p-1.5 rounded hover:bg-brand-soft"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-14 text-center transition-colors",
        isDragging ? "border-brand bg-brand-soft" : "border-border-strong bg-white"
      )}
    >
      <UploadCloud className="h-9 w-9 text-ink-faint" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-ink">Drag and drop your document here</p>
        <p className="text-xs text-ink-faint mt-1">PDF, DOCX, or TXT — up to 10 MB</p>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-1 text-sm font-medium text-brand hover:underline"
      >
        Browse files
      </button>
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
  );
}

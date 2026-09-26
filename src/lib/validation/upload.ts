import type { DocumentCategory } from "@/types";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_MIME_TYPES = new Set([
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
export const ALLOWED_EXTENSIONS = new Set(["txt", "pdf", "docx"]);

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates an uploaded file before it ever reaches extraction/AI stages.
 * This is the app's primary defense against malformed or oversized input
 * crashing the pipeline (see section 30/31 of the product spec).
 */
export function validateUpload(file: { size: number; type: string; name: string }): UploadValidationResult {
  if (file.size === 0) {
    return { valid: false, error: "The uploaded file appears to be empty." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "File exceeds the 10 MB size limit." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeOk = ALLOWED_MIME_TYPES.has(file.type);
  const extOk = ALLOWED_EXTENSIONS.has(ext);

  if (!mimeOk && !extOk) {
    return {
      valid: false,
      error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file.",
    };
  }

  return { valid: true };
}

export const VALID_CATEGORIES: DocumentCategory[] = [
  "housing",
  "employment",
  "consumer",
  "government",
  "education",
  "other",
];

export function isValidCategory(value: string): value is DocumentCategory {
  return VALID_CATEGORIES.includes(value as DocumentCategory);
}

/**
 * Basic text sanitization before any text is logged or stored. Strips
 * control characters and caps length to avoid pathological input.
 */
export function sanitizeExtractedText(text: string, maxLength = 200_000): string {
  const stripped = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  return stripped.length > maxLength ? stripped.slice(0, maxLength) : stripped;
}

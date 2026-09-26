import { NextRequest, NextResponse } from "next/server";
import { runAnalysisPipeline, AnalysisPipelineError } from "@/lib/ai/analyze";
import { isValidCategory, validateUpload } from "@/lib/validation/upload";
import type { PipelineError } from "@/types";

// Server-only route. No AI provider keys are ever sent to the client --
// all analysis happens here. Uploaded file bytes are processed in-memory
// for this request only and are not persisted to disk or a database.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse("upload", "Invalid form data.", "We couldn't process your upload. Please try again.");
  }

  const file = formData.get("file");
  const categoryField = formData.get("category");
  const jurisdictionField = formData.get("jurisdiction");

  if (!(file instanceof File)) {
    return errorResponse("upload", "No file provided.", "Please attach a document to analyze.");
  }

  const validation = validateUpload({ size: file.size, type: file.type, name: file.name });
  if (!validation.valid) {
    return errorResponse("upload", validation.error ?? "Invalid file.", validation.error ?? "Invalid file.");
  }

  const category =
    typeof categoryField === "string" && isValidCategory(categoryField) ? categoryField : undefined;
  const jurisdiction =
    typeof jurisdictionField === "string" && jurisdictionField.trim().length > 0
      ? jurisdictionField.trim()
      : undefined;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const analysis = await runAnalysisPipeline({
      buffer,
      fileName: file.name,
      mimeType: file.type || inferMimeFromName(file.name),
      userSelectedCategory: category,
      jurisdiction,
    });
    return NextResponse.json({ analysis });
  } catch (err) {
    if (err instanceof AnalysisPipelineError) {
      return errorResponse(err.stage, err.message, err.userMessage);
    }
    console.error("Unexpected analysis pipeline error:", err);
    return errorResponse(
      "unknown",
      err instanceof Error ? err.message : String(err),
      "Analysis is temporarily unavailable. Your original document has not been modified."
    );
  }
}

function inferMimeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "text/plain";
}

function errorResponse(stage: PipelineError["stage"], message: string, userMessage: string) {
  const body: { error: PipelineError } = { error: { stage, message, userMessage } };
  return NextResponse.json(body, { status: 400 });
}

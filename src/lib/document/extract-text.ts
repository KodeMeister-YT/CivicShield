import mammoth from "mammoth";

/**
 * Raw text + page extraction from an uploaded file buffer.
 * Supports .txt, .pdf, .docx. Anything else is rejected upstream in
 * lib/validation/upload.ts before this is ever called.
 */
export interface RawExtraction {
  text: string;
  pageCount?: number;
  /** Per-page text, when the source format has real pages (PDF). */
  pages?: string[];
}

export async function extractRawText(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<RawExtraction> {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (mimeType === "text/plain" || ext === "txt") {
    return { text: buffer.toString("utf-8") };
  }

  if (mimeType === "application/pdf" || ext === "pdf") {
    return extractPdf(buffer);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value };
  }

  throw new Error(`Unsupported file type: ${mimeType || ext}`);
}

async function extractPdf(buffer: Buffer): Promise<RawExtraction> {
  try {
    // pdf-parse v2 ships an ESM-first PDFParse class built on pdfjs-dist. In
    // Node it always runs pdfjs's "fake worker" fallback, which dynamically
    // imports GlobalWorkerOptions.workerSrc (default: the relative path
    // "./pdf.worker.mjs"). That relative path breaks once this module is
    // bundled by Next.js, so we point it at the real file on disk instead.
    const pdfParseModule = await import("pdf-parse");
    const { PDFParse } = pdfParseModule;
    const pdfjsGlobal = (globalThis as { pdfjsLib?: { GlobalWorkerOptions: { workerSrc: string } } })
      .pdfjsLib;
    if (pdfjsGlobal?.GlobalWorkerOptions) {
      // Under Turbopack, require.resolve()/import.meta.resolve() return a
      // virtual bundler path (containing "[project]") rather than a real
      // filesystem path, so we can't use them to locate pdf.worker.mjs on
      // disk. Instead, build the real path directly from process.cwd() --
      // reliable because this route always runs from the project root in
      // both dev and production (Node.js runtime, not edge).
      const path = await import("path");
      const { pathToFileURL } = await import("url");
      const workerPath = path.join(
        process.cwd(),
        "node_modules",
        "pdf-parse",
        "dist",
        "pdf-parse",
        "cjs",
        "pdf.worker.mjs"
      );
      // pdfjs does `await import(workerSrc)` internally, which requires a
      // proper file:// URL on Windows (a raw "C:\..." path is not a valid
      // ES module specifier and gets rejected at runtime).
      pdfjsGlobal.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
    }
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      const pages = result.pages.map((p) => p.text);
      return {
        text: result.text,
        pageCount: result.total,
        pages,
      };
    } finally {
      await parser.destroy();
    }
  } catch (err) {
    throw new Error(
      `Failed to extract PDF content: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

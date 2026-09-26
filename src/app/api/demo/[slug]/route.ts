import { NextResponse } from "next/server";
import { getDemoAnalyses, type DemoSlug } from "@/data/demo/build-demo";

export const runtime = "nodejs";

const VALID_SLUGS: DemoSlug[] = ["tenant", "work", "consumer"];

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!VALID_SLUGS.includes(slug as DemoSlug)) {
    return NextResponse.json(
      { error: { stage: "upload", message: "invalid slug", userMessage: "Unknown demo case." } },
      { status: 404 }
    );
  }

  try {
    const analyses = await getDemoAnalyses();
    return NextResponse.json({ analysis: analyses[slug as DemoSlug] });
  } catch (err) {
    console.error("Demo analysis build failed:", err);
    return NextResponse.json(
      {
        error: {
          stage: "unknown",
          message: err instanceof Error ? err.message : String(err),
          userMessage: "Demo data is temporarily unavailable.",
        },
      },
      { status: 500 }
    );
  }
}

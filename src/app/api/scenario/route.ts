import { NextRequest, NextResponse } from "next/server";
import { simulateScenario } from "@/lib/ai/scenario-simulator";
import { findingSchema } from "@/lib/ai/schema";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  question: z.string().min(3).max(500),
  finding: findingSchema.optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid question." }, { status: 400 });
  }

  try {
    const result = simulateScenario(parsed.data);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Scenario simulation failed:", err);
    return NextResponse.json(
      { error: "The scenario simulator is temporarily unavailable." },
      { status: 500 }
    );
  }
}

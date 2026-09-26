import { NextRequest, NextResponse } from "next/server";
import { findingSchema } from "@/lib/ai/schema";
import { generateAdvisorAdvice, answerAdvisorQuestion } from "@/lib/ai/gemini";
import { z } from "zod";

export const runtime = "nodejs";

const advisorRequestSchema = z.object({
  finding: findingSchema,
  question: z.string().optional(),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(["user", "ai"]),
        text: z.string(),
      })
    )
    .optional(),
  jurisdiction: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = advisorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid finding data provided to advisor." },
      { status: 400 }
    );
  }

  const { finding, question, chatHistory = [], jurisdiction } = parsed.data;

  try {
    if (question && question.trim().length > 0) {
      const answer = await answerAdvisorQuestion(finding, question.trim(), chatHistory, jurisdiction);
      return NextResponse.json({ answer });
    }

    const advice = await generateAdvisorAdvice(finding, jurisdiction);
    return NextResponse.json({ advice });
  } catch (err) {
    console.error("Advisor processing failed:", err);
    return NextResponse.json(
      { error: "Strategic guidance is temporarily unavailable." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/ai/response-generator";
import { findingSchema } from "@/lib/ai/schema";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  finding: findingSchema,
  recipientType: z.enum(["landlord", "employer", "seller", "other"]),
  senderName: z.string().optional(),
  additionalFacts: z.array(z.string()).optional(),
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
    return NextResponse.json(
      { error: "Could not generate a response from the provided finding." },
      { status: 400 }
    );
  }

  try {
    const response = generateResponse(parsed.data);
    return NextResponse.json({ response });
  } catch (err) {
    console.error("Response generation failed:", err);
    return NextResponse.json(
      { error: "Response generation is temporarily unavailable." },
      { status: 500 }
    );
  }
}

import { z } from "zod";

// Zod schemas mirror src/types/index.ts. These are used to validate any
// LLM-produced JSON before it ever reaches the UI. If validation fails we
// retry once with a repair prompt, then fall back to the rule-based engine
// rather than let malformed output break the interface (see lib/ai/repair.ts).

export const clauseCategorySchema = z.enum([
  "payment",
  "deposit",
  "termination",
  "notice_period",
  "penalty",
  "liability",
  "confidentiality",
  "restriction",
  "renewal",
  "refund",
  "warranty",
  "dispute_resolution",
  "jurisdiction",
  "data_privacy",
  "maintenance",
  "other",
]);

export const severitySchema = z.enum(["low", "review", "high", "potential_concern"]);

export const shieldDomainSchema = z.enum([
  "TenantShield",
  "WorkShield",
  "ConsumerShield",
  "General",
]);

export const actionKindSchema = z.enum([
  "preserve_evidence",
  "collect_evidence",
  "generate_response",
  "view_source",
  "escalate",
  "review_professional",
  "custom",
]);

export const actionSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  kind: actionKindSchema,
  description: z.string().optional(),
  completed: z.boolean().default(false),
  href: z.string().optional(),
});

export const citedSourceSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  authority: z.string().min(1),
  url: z.string().url(),
  jurisdiction: z.string(),
  excerpt: z.string(),
  domain: shieldDomainSchema,
  tags: z.array(clauseCategorySchema),
  retrievedAt: z.string().optional(),
  verified: z.boolean(),
  relevanceScore: z.number().min(0).max(1),
});

export const findingSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  category: clauseCategorySchema,
  domain: shieldDomainSchema,
  severity: severitySchema,
  confidence: z.number().min(0).max(1),
  clauseId: z.string(),
  clauseText: z.string().min(1),
  section: z.string().optional(),
  page: z.number().optional(),
  explanation: z.string().min(1),
  whyItMatters: z.string().min(1),
  legalConcept: z.string().optional(),
  sources: z.array(citedSourceSchema),
  reasoning: z.string().min(1),
  actions: z.array(actionSchema),
  factVsInference: z.object({
    fromDocument: z.string(),
    aiInterpretation: z.string(),
    legalSource: z.string(),
  }),
  needsProfessionalReview: z.boolean(),
});

export const findingArraySchema = z.array(findingSchema);

export type ValidatedFinding = z.infer<typeof findingSchema>;

export const scenarioResultSchema = z.object({
  question: z.string(),
  knownFacts: z.array(z.string()),
  decisionTree: z.lazy(() =>
    z.object({
      id: z.string(),
      text: z.string(),
      children: z.array(z.any()),
    })
  ),
  possibleOutcomes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      certainty: z.enum(["known", "possible", "uncertain"]),
    })
  ),
  disclaimer: z.string(),
});

export const generatedResponseSchema = z.object({
  id: z.string(),
  findingId: z.string().optional(),
  recipientType: z.enum(["landlord", "employer", "seller", "other"]),
  subject: z.string(),
  body: z.string(),
  userFacts: z.array(z.string()),
  createdAt: z.string(),
});

/**
 * Validate an unknown payload against a zod schema, returning either the
 * parsed data or a structured error -- never throws.
 */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.message };
}

import { randomUUID } from "crypto";
import type { Finding, GeneratedResponse } from "@/types";

/**
 * Generates a professional, factual written response referencing a
 * specific finding. Template-based rather than free-form LLM generation so
 * output is predictable and never invents facts -- user-supplied facts are
 * interpolated verbatim and clearly separated from the templated language
 * around them (see userFacts on the returned object).
 */
export function generateResponse(params: {
  finding: Finding;
  recipientType: GeneratedResponse["recipientType"];
  senderName?: string;
  additionalFacts?: string[];
}): GeneratedResponse {
  const { finding, recipientType, senderName = "[Your Name]", additionalFacts = [] } = params;

  const copy = COPY[recipientType];
  const subject = `${copy.subjectPrefix}: ${finding.title}`;
  const locationRef = finding.section
    ? ` (Section ${finding.section}${finding.page ? `, page ${finding.page}` : ""})`
    : "";

  const factLines = additionalFacts.length
    ? `\n\nA few additional details for your reference:\n${additionalFacts.map((f) => `- ${f}`).join("\n")}`
    : "";

  const body = `Dear ${copy.recipientLabel},

${copy.opening}

"${truncate(finding.clauseText, 400)}"${locationRef}

${finding.explanation} ${finding.whyItMatters}${factLines}

${copy.ask}

${copy.closing}

Sincerely,
${senderName}`;

  return {
    id: randomUUID(),
    findingId: finding.id,
    recipientType,
    subject,
    body,
    userFacts: additionalFacts,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Recipient-specific voice and structure. Each entry produces a
 * genuinely different, realistic letter -- not the same template with a
 * swapped-out salutation -- while still only using facts drawn from the
 * finding itself (never inventing new claims).
 */
const COPY: Record<
  GeneratedResponse["recipientType"],
  { recipientLabel: string; subjectPrefix: string; opening: string; ask: string; closing: string }
> = {
  landlord: {
    recipientLabel: "Landlord/Property Manager",
    subjectPrefix: "Question about my lease",
    opening: "I'm writing about a clause in my lease that I'd like to understand better before it becomes an issue:",
    ask: "Could you confirm in writing how this will be handled, and let me know if my understanding of this clause is correct? I'd like to resolve this now rather than after move-out.",
    closing: "Thank you for taking the time to clarify this. I look forward to your response.",
  },
  employer: {
    recipientLabel: "Hiring Manager/HR Department",
    subjectPrefix: "Question about my employment terms",
    opening: "I'm writing to ask for clarification on a provision in my employment paperwork:",
    ask: "Could you confirm the intended scope of this provision in writing? I want to make sure I understand my obligations correctly going forward.",
    closing: "I appreciate your help clarifying this and am happy to discuss further if useful.",
  },
  seller: {
    recipientLabel: "Customer Service Team",
    subjectPrefix: "Question about my order",
    opening: "I'm writing about a term in my purchase that I'd like clarified:",
    ask: "Could you confirm how this applies to my order, and what my options are? I'd appreciate a written response for my records.",
    closing: "Thank you for your help resolving this.",
  },
  other: {
    recipientLabel: "Sir or Madam",
    subjectPrefix: "Question regarding a document you sent",
    opening: "I'm writing to ask for clarification on the following:",
    ask: "Could you confirm how this will be handled and provide a written response for my records?",
    closing: "Thank you for your time.",
  },
};

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

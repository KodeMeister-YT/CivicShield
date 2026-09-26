import type { ClauseCategory, Severity } from "@/types";

/**
 * Rule definitions used by the deterministic issue-detection engine
 * (see lib/legal/detect-issues.ts). Each rule describes what pattern in a
 * clause triggers concern, how severe that concern is, and the
 * plain-language explanation to show the user. This is the reliable
 * fallback path that runs with zero external dependencies -- the pipeline
 * never depends solely on an LLM being available.
 */
export interface IssueRule {
  id: string;
  category: ClauseCategory;
  /** Additional pattern the clause text must match for this specific rule to fire. */
  pattern?: RegExp;
  severity: Severity;
  title: string;
  explanation: string;
  whyItMatters: string;
  legalConcept?: string;
  needsProfessionalReview: boolean;
  baseConfidence: number;
}

export const issueRules: IssueRule[] = [
  {
    id: "termination-immediate",
    category: "termination",
    pattern: /immediat(e|ely)|without (prior )?notice|at any time/i,
    severity: "potential_concern",
    title: "Immediate termination without notice",
    explanation:
      "This clause appears to allow one or both parties to end the agreement right away, without giving the other side advance warning.",
    whyItMatters:
      "Termination without a notice period can leave the other party with very little time to respond, find alternatives, or contest the decision. Depending on the type of agreement and jurisdiction, minimum notice periods may be required by law even if the document doesn't mention one.",
    legalConcept: "Notice requirements / procedural fairness in contract termination",
    needsProfessionalReview: true,
    baseConfidence: 0.72,
  },
  {
    id: "termination-general",
    category: "termination",
    severity: "high",
    title: "Termination clause",
    explanation:
      "This section describes how and when the agreement can be ended by either party.",
    whyItMatters:
      "Termination clauses determine your options if the relationship breaks down. It's worth understanding exactly what triggers termination and what happens afterward (deposits, notice, final payments).",
    legalConcept: "Contract termination provisions",
    needsProfessionalReview: false,
    baseConfidence: 0.65,
  },
  {
    id: "deposit-forfeit",
    category: "deposit",
    pattern: /non-?refundable|forfeit|will not be returned|kept by/i,
    severity: "potential_concern",
    title: "Deposit may not be returned",
    explanation:
      "This clause suggests that a deposit could be kept by the other party under certain conditions, or may not be refundable at all.",
    whyItMatters:
      "Many jurisdictions place limits on when and how deposits can be withheld, and often require an itemized reason. A blanket non-refundable deposit clause deserves closer review.",
    legalConcept: "Security deposit handling and return requirements",
    needsProfessionalReview: true,
    baseConfidence: 0.7,
  },
  {
    id: "deposit-general",
    category: "deposit",
    severity: "review",
    title: "Deposit clause",
    explanation: "This section describes a deposit and the conditions attached to it.",
    whyItMatters:
      "Deposits are refundable in most standard arrangements unless there's damage, unpaid amounts, or a breach. Confirm the exact conditions for its return.",
    legalConcept: "Security deposit handling",
    needsProfessionalReview: false,
    baseConfidence: 0.6,
  },
  {
    id: "penalty-high",
    category: "penalty",
    pattern: /\$\s?[\d,]{3,}|entire (remaining|balance)|full amount/i,
    severity: "high",
    title: "Potentially significant penalty",
    explanation:
      "This clause imposes a financial penalty that could be substantial depending on the circumstances.",
    whyItMatters:
      "Large penalty or liquidated-damages clauses are sometimes unenforceable if they're disproportionate to actual harm. It's worth checking whether this amount is reasonable and negotiable.",
    legalConcept: "Liquidated damages / penalty clause enforceability",
    needsProfessionalReview: true,
    baseConfidence: 0.68,
  },
  {
    id: "penalty-general",
    category: "penalty",
    severity: "review",
    title: "Penalty or fee clause",
    explanation: "This section describes a fee or penalty that may apply.",
    whyItMatters: "Understanding what triggers this fee helps you avoid it or budget for it.",
    needsProfessionalReview: false,
    baseConfidence: 0.55,
  },
  {
    id: "restriction-noncompete",
    category: "restriction",
    pattern: /non-?compete|shall not (work|engage|compete)/i,
    severity: "high",
    title: "Restriction on future work or activity",
    explanation:
      "This clause tries to limit what you can do after the relationship ends, such as working for a competitor.",
    whyItMatters:
      "Non-compete and similar restrictions are heavily regulated and, in some places, largely unenforceable for most workers. The scope (time, geography, industry) matters a lot.",
    legalConcept: "Non-compete and restrictive covenant enforceability",
    needsProfessionalReview: true,
    baseConfidence: 0.7,
  },
  {
    id: "confidentiality-general",
    category: "confidentiality",
    severity: "review",
    title: "Confidentiality obligation",
    explanation: "This clause requires you to keep certain information private.",
    whyItMatters:
      "Confidentiality clauses are common and usually reasonable, but check the scope and duration -- overly broad or indefinite obligations are worth questioning.",
    needsProfessionalReview: false,
    baseConfidence: 0.55,
  },
  {
    id: "liability-waiver",
    category: "liability",
    pattern: /waive|hold harmless|indemnif|no liability/i,
    severity: "high",
    title: "Liability waiver or indemnification",
    explanation:
      "This clause asks you to give up certain rights to hold the other party responsible, or to cover costs on their behalf.",
    whyItMatters:
      "Broad liability waivers can shift significant risk onto you. It's worth understanding exactly what you're giving up and whether it's balanced.",
    legalConcept: "Liability waivers and indemnification clauses",
    needsProfessionalReview: true,
    baseConfidence: 0.66,
  },
  {
    id: "dispute-arbitration",
    category: "dispute_resolution",
    pattern: /arbitrat|class action waiver/i,
    severity: "review",
    title: "Mandatory arbitration or dispute limits",
    explanation:
      "This clause may require disputes to go through arbitration instead of court, and could limit your ability to join a class action.",
    whyItMatters:
      "Arbitration clauses affect how you can resolve a future dispute and may limit certain legal options. Understanding this upfront avoids surprises later.",
    legalConcept: "Arbitration agreements and dispute resolution mechanisms",
    needsProfessionalReview: true,
    baseConfidence: 0.62,
  },
  {
    id: "renewal-auto",
    category: "renewal",
    pattern: /automatically renew|automatically extend|evergreen/i,
    severity: "review",
    title: "Automatic renewal",
    explanation:
      "This agreement may renew automatically unless you take action to stop it.",
    whyItMatters:
      "Auto-renewal clauses can lock you into another term if you miss a cancellation window. Note the deadline for opting out.",
    legalConcept: "Automatic renewal / evergreen clause disclosure",
    needsProfessionalReview: false,
    baseConfidence: 0.6,
  },
  {
    id: "refund-limited",
    category: "refund",
    pattern: /no refund|final sale|non-?refundable/i,
    severity: "high",
    title: "Limited or no refund rights",
    explanation:
      "This clause indicates that refunds may not be available for this purchase or service.",
    whyItMatters:
      "Depending on how and where the purchase was made, you may still have cancellation or refund rights under consumer protection rules (for example, a cooling-off period for certain sales).",
    legalConcept: "Consumer refund and cancellation rights",
    needsProfessionalReview: false,
    baseConfidence: 0.64,
  },
  {
    id: "warranty-disclaimer",
    category: "warranty",
    pattern: /as-?is|no warrant|disclaims? (all )?warrant/i,
    severity: "review",
    title: "Warranty disclaimed",
    explanation:
      "This clause states the product or service comes with no warranty, or as-is.",
    whyItMatters:
      "Some warranty protections may still apply by law regardless of what a contract says, especially for defective goods.",
    legalConcept: "Implied warranty protections",
    needsProfessionalReview: false,
    baseConfidence: 0.58,
  },
  {
    id: "data-privacy-broad",
    category: "data_privacy",
    pattern: /share (your )?(personal )?(data|information)|third part(y|ies)|sell.{0,20}data/i,
    severity: "review",
    title: "Data sharing with third parties",
    explanation:
      "This clause allows your personal information to be shared with other organizations.",
    whyItMatters:
      "Understanding who your data is shared with and why helps you assess privacy risk before agreeing.",
    legalConcept: "Data privacy and sharing disclosures",
    needsProfessionalReview: false,
    baseConfidence: 0.55,
  },
  {
    id: "notice-period-short",
    category: "notice_period",
    pattern: /24 hours|48 hours|1 day|one day|2 days|two days/i,
    severity: "review",
    title: "Very short notice period",
    explanation:
      "This clause sets a notice period that appears unusually short.",
    whyItMatters:
      "Short notice periods reduce the time you have to react, plan, or find alternatives. Compare it to what's typical for this kind of agreement.",
    needsProfessionalReview: false,
    baseConfidence: 0.58,
  },
];

export function rulesForCategory(category: ClauseCategory): IssueRule[] {
  return issueRules.filter((r) => r.category === category);
}

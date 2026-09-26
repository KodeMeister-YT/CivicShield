import type { ClauseCategory } from "@/types";

/**
 * Flexible, extensible clause classifier.
 *
 * Rather than hardcoding the entire legal universe, categories are defined
 * as a ranked list of keyword/regex signals. Adding a new category means
 * adding one entry here -- no changes needed elsewhere in the pipeline.
 * This keeps classification fast, offline, and deterministic for the
 * hackathon demo; a future version could swap this for an LLM or a
 * lightweight text classifier without changing the calling code (see
 * classifyClauseTextWithAI below for the optional LLM-assisted path).
 */
interface CategorySignal {
  category: ClauseCategory;
  patterns: RegExp[];
  weight: number;
}

const SIGNALS: CategorySignal[] = [
  {
    category: "termination",
    patterns: [/terminat/i, /end (this|the) (agreement|lease|contract)/i, /cancel(lation)?\b/i],
    weight: 3,
  },
  {
    category: "deposit",
    patterns: [/security deposit/i, /\bdeposit\b/i, /down payment/i],
    weight: 3,
  },
  {
    category: "penalty",
    patterns: [/penalty/i, /liquidated damages/i, /forfeit/i, /late fee/i, /fine of/i],
    weight: 3,
  },
  {
    category: "notice_period",
    patterns: [/notice period/i, /\bdays?['\u2019]? notice\b/i, /advance notice/i, /prior written notice/i],
    weight: 2,
  },
  {
    category: "payment",
    patterns: [/\brent\b/i, /\bsalary\b/i, /\bwages?\b/i, /payment (of|schedule|due)/i, /\binvoice\b/i],
    weight: 2,
  },
  {
    category: "liability",
    patterns: [/liability/i, /indemnif/i, /hold harmless/i, /limitation of liability/i],
    weight: 2,
  },
  {
    category: "confidentiality",
    patterns: [/confidential/i, /non-disclosure/i, /\bnda\b/i, /trade secret/i],
    weight: 2,
  },
  {
    category: "restriction",
    patterns: [/non-compete/i, /noncompete/i, /shall not (compete|work|engage)/i, /restrict(ed|ion)/i],
    weight: 2,
  },
  {
    category: "renewal",
    patterns: [/renew(al|s)?\b/i, /automatically extend/i, /evergreen/i],
    weight: 2,
  },
  {
    category: "refund",
    patterns: [/refund/i, /money(\s|-)?back/i, /reimburse/i],
    weight: 2,
  },
  {
    category: "warranty",
    patterns: [/warrant(y|ies)/i, /guarantee/i, /defect/i],
    weight: 2,
  },
  {
    category: "dispute_resolution",
    patterns: [/arbitrat/i, /mediation/i, /dispute resolution/i, /governing law/i, /class action waiver/i],
    weight: 2,
  },
  {
    category: "jurisdiction",
    patterns: [/jurisdiction/i, /venue\b/i, /governed by the laws of/i],
    weight: 2,
  },
  {
    category: "data_privacy",
    patterns: [/personal (data|information)/i, /privacy policy/i, /\bgdpr\b/i, /data protection/i],
    weight: 2,
  },
  {
    category: "maintenance",
    patterns: [/maintenance/i, /repairs?\b/i, /habitab(le|ility)/i],
    weight: 1,
  },
];

export function classifyClauseText(text: string): ClauseCategory {
  let best: { category: ClauseCategory; score: number } | undefined;

  for (const signal of SIGNALS) {
    const matches = signal.patterns.filter((p) => p.test(text)).length;
    if (matches === 0) continue;
    const score = matches * signal.weight;
    if (!best || score > best.score) {
      best = { category: signal.category, score };
    }
  }

  return best?.category ?? "other";
}

export function classifyDocumentCategory(fullText: string): {
  category: "housing" | "employment" | "consumer" | "government" | "education" | "other";
  confidence: number;
} {
  const signals: Array<{
    category: "housing" | "employment" | "consumer" | "government" | "education" | "other";
    patterns: RegExp[];
  }> = [
    {
      category: "housing",
      patterns: [/\blease\b/i, /landlord/i, /tenant/i, /rental agreement/i, /premises/i],
    },
    {
      category: "employment",
      patterns: [/employ(er|ee|ment)/i, /termination of employment/i, /job title/i, /payroll/i, /at-will/i],
    },
    {
      category: "consumer",
      patterns: [/purchase/i, /refund/i, /warranty/i, /consumer/i, /order (number|confirmation)/i, /receipt/i],
    },
    {
      category: "government",
      patterns: [/department of/i, /municipal/i, /city of/i, /notice of violation/i, /government/i],
    },
    {
      category: "education",
      patterns: [/university/i, /college/i, /student/i, /enrollment/i, /academic/i],
    },
  ];

  let best: { category: (typeof signals)[number]["category"]; score: number } | undefined;
  for (const s of signals) {
    const score = s.patterns.filter((p) => p.test(fullText)).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { category: s.category, score };
    }
  }

  if (!best) return { category: "other", confidence: 0.3 };
  const confidence = Math.min(0.5 + best.score * 0.12, 0.95);
  return { category: best.category, confidence };
}

export function domainForCategory(
  category: "housing" | "employment" | "consumer" | "government" | "education" | "other"
): "TenantShield" | "WorkShield" | "ConsumerShield" | "General" {
  switch (category) {
    case "housing":
      return "TenantShield";
    case "employment":
      return "WorkShield";
    case "consumer":
      return "ConsumerShield";
    default:
      return "General";
  }
}

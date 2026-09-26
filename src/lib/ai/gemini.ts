import { GoogleGenAI } from "@google/genai";
import type { Finding, ScenarioResult } from "@/types";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

export function isGeminiAvailable(): boolean {
  return Boolean(API_KEY && API_KEY.trim().length > 5);
}

function getClient(): GoogleGenAI | null {
  if (!isGeminiAvailable()) return null;
  return new GoogleGenAI({ apiKey: API_KEY! });
}

export interface AdvisorAdvice {
  executiveSummary: string;
  rightsOverview: string[];
  actionChecklist: Array<{ step: string; detail: string; urgency: "immediate" | "soon" | "optional" }>;
  dos: string[];
  donts: string[];
  negotiationScript: string;
}

/**
 * Generates actionable strategy for "What Can I Do?"
 * Uses Gemini if API key is present, otherwise falls back to grounded legal heuristic generator.
 */
export async function generateAdvisorAdvice(finding: Finding, jurisdiction?: string): Promise<AdvisorAdvice> {
  const client = getClient();
  if (client) {
    try {
      const prompt = `You are a public-interest legal advocate and civic rights navigator helping an everyday person understand a document clause.
The user is reviewing the following clause:
- Document Category: ${finding.category} (${finding.domain})
- Severity: ${finding.severity}
- Jurisdiction: ${jurisdiction || "General US"}
- Clause Text: "${finding.clauseText}"
- Current Finding: "${finding.title}" - ${finding.explanation}
- Why It Matters: ${finding.whyItMatters}

Provide a structured, practical, empowering "What Can I Do?" action guide.
Return ONLY valid JSON matching this exact schema:
{
  "executiveSummary": "A concise, reassuring 2-3 sentence overview of their position and what power they have.",
  "rightsOverview": ["Specific right 1", "Specific right 2"],
  "actionChecklist": [
    { "step": "Action title", "detail": "Specific instructions", "urgency": "immediate" | "soon" | "optional" }
  ],
  "dos": ["Do X (e.g. document in writing)", "Do Y"],
  "donts": ["Don't X (e.g. withhold rent without escrow)", "Don't Y"],
  "negotiationScript": "A sample polite but firm paragraph they can say or email to counter or question this clause."
}`;

      const res = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = res.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.executiveSummary && Array.isArray(parsed.actionChecklist)) {
          return parsed as AdvisorAdvice;
        }
      }
    } catch (err) {
      console.warn("Gemini generation failed, falling back to heuristic engine:", err);
    }
  }

  // Grounded heuristic fallback
  return getFallbackAdvisorAdvice(finding, jurisdiction);
}

/**
 * Handles interactive follow-up Q&A within the AI Strategy Advisor
 */
export async function answerAdvisorQuestion(
  finding: Finding,
  question: string,
  chatHistory: Array<{ role: "user" | "ai"; text: string }>,
  jurisdiction?: string
): Promise<string> {
  const client = getClient();
  if (client) {
    try {
      const historyContext = chatHistory
        .map((m) => `${m.role === "user" ? "User" : "Advisor"}: ${m.text}`)
        .join("\n");

      const prompt = `You are an expert civic rights guide assisting a user regarding a specific clause in their document.
Document context:
- Clause: "${finding.clauseText}"
- Category: ${finding.category}
- Legal concepts: ${finding.legalConcept || "Standard contractual obligations"}
- Jurisdiction: ${jurisdiction || "General US"}

Previous conversation:
${historyContext}

User Question: "${question}"

Provide a direct, practical, and legally grounded explanation in 2 to 3 paragraphs.
Clearly separate verified rules/facts from practical strategy. If the stakes are high, remind them when licensed professional review is recommended.`;

      const res = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.3 },
      });

      if (res.text) return res.text;
    } catch (err) {
      console.warn("Gemini follow-up failed, falling back:", err);
    }
  }

  return getFallbackAnswer(finding, question);
}

/**
 * Generates dynamic Scenario Simulation trees
 */
export async function generateAiScenario(
  question: string,
  finding?: Finding,
  jurisdiction?: string
): Promise<ScenarioResult | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const prompt = `You are a legal scenario modeling engine. The user is asking "What happens if...?" regarding a document clause.
Context:
${finding ? `- Clause: "${finding.clauseText}"\n- Category: ${finding.category}\n- Title: ${finding.title}` : "- General document inquiry"}
- Jurisdiction: ${jurisdiction || "General US"}
- User Question: "${question}"

Analyze the likely paths, branching consequences, and uncertainties.
Return ONLY valid JSON with this exact structure:
{
  "question": "${question}",
  "knownFacts": ["Fact firmly known from document or statutory baseline 1", "Fact 2"],
  "decisionTree": {
    "id": "root",
    "text": "IF [User Action or Scenario Trigger]",
    "children": [
      {
        "id": "branch1",
        "text": "Likely immediate response from other party",
        "children": [
          { "id": "leaf1", "text": "Consequence A", "children": [] },
          { "id": "leaf2", "text": "Consequence B", "children": [] }
        ]
      },
      {
        "id": "branch2",
        "text": "Alternative path or procedural requirement",
        "children": [
          { "id": "leaf3", "text": "Consequence C", "children": [] }
        ]
      }
    ]
  },
  "possibleOutcomes": [
    { "id": "out1", "label": "Outcome description 1", "certainty": "known" | "possible" | "uncertain" },
    { "id": "out2", "label": "Outcome description 2", "certainty": "known" | "possible" | "uncertain" }
  ],
  "disclaimer": "This scenario tree illustrates common patterns based on contract law principles, not a court prediction. Specific facts, notices, and local laws alter outcomes."
}`;

    const res = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    if (res.text) {
      return JSON.parse(res.text) as ScenarioResult;
    }
  } catch (err) {
    console.warn("Gemini scenario simulation failed:", err);
  }
  return null;
}

// ----------------- Fallback Generators -----------------

function getFallbackAdvisorAdvice(finding: Finding, jurisdiction?: string): AdvisorAdvice {
  const stateStr = jurisdiction && jurisdiction !== "federal" ? ` in ${jurisdiction.toUpperCase()}` : "";

  switch (finding.category) {
    case "deposit":
      return {
        executiveSummary: `Blanket non-refundable deposit terms are heavily restricted or illegal in most jurisdictions${stateStr}. Landlords are generally legally required to return security deposits minus itemized deductions for actual damage beyond normal wear and tear.`,
        rightsOverview: [
          "Right to an itemized written accounting of all deposit deductions.",
          "Right to pre-move-out inspection in many states (e.g. California 2-week advance inspection).",
          "Statutory deadlines for deposit return (typically 14 to 30 days after vacating).",
        ],
        actionChecklist: [
          { step: "Take high-resolution photos/video", detail: "Photograph every room, wall, appliance, and fixture before handing over keys.", urgency: "immediate" },
          { step: "Send written forwarding address", detail: "Provide your new address via email or certified mail to trigger the statutory return clock.", urgency: "immediate" },
          { step: "Request a joint pre-moveout walkthrough", detail: "Ask the landlord to point out anything they consider damage so you can address it.", urgency: "soon" },
        ],
        dos: [
          "Document everything in writing with dated copies.",
          "Request receipts or repair invoices if deductions are claimed.",
          "Cite statutory deposit return deadlines if delayed.",
        ],
        donts: [
          "Don't sign any move-out agreement forfeiting your deposit without reviewing deductions.",
          "Don't rely on oral promises from property managers.",
        ],
        negotiationScript: `I noticed Section ${finding.section || ""} states the deposit is non-refundable. Under standard statutory landlord-tenant rules, security deposits remain the tenant's property held in trust, subject only to itemized deductions for damages beyond normal wear and tear. Could you confirm that an itemized statement and return will follow the statutory timeline upon move-out?`,
      };

    case "termination":
    case "notice_period":
      return {
        executiveSummary: `Immediate or unilateral termination without notice is often legally unenforceable or subject to statutory minimums${stateStr}. Both housing and employment laws require procedural notice or cause in many contexts.`,
        rightsOverview: [
          "Right to statutory notice periods (typically 30 to 60 days for periodic leases).",
          "Protection against retaliatory or discriminatory termination.",
          "Right to written notice specifying grounds if termination is for cause.",
        ],
        actionChecklist: [
          { step: "Preserve all records of communications", detail: "Save all emails, texts, pay records, or notices without alteration.", urgency: "immediate" },
          { step: "Clarify effective dates in writing", detail: "Ask for written confirmation of the exact departure date and reasons cited.", urgency: "immediate" },
          { step: "Assess mitigating alternatives", detail: "Negotiate an agreed timeline or transition period before escalating.", urgency: "soon" },
        ],
        dos: [
          "Respond calmly in writing acknowledging receipt while stating your position.",
          "Calculate any compensation or final wages owed.",
        ],
        donts: [
          "Don't verbally agree to leave earlier than legally required.",
          "Don't waive claims without consideration or severance.",
        ],
        negotiationScript: `Regarding Section ${finding.section || ""}, immediate termination without adequate notice causes substantial disruption and does not align with customary procedural guidelines. I would like to propose a reasonable transition period of 30 days to facilitate an orderly handover.`,
      };

    case "restriction":
    case "confidentiality":
      return {
        executiveSummary: `Post-employment non-compete clauses are under severe regulatory restriction nationwide (including FTC rulemakings and outright statutory bans in California, Minnesota, and others).`,
        rightsOverview: [
          "Right to pursue your lawful profession or trade.",
          "Unreasonable geographic or temporal restrictions are frequently voided by courts.",
          "Nondisclosure agreements cannot prohibit reporting unlawful conduct.",
        ],
        actionChecklist: [
          { step: "Map the restriction's exact boundaries", detail: "Highlight the geographic radius, duration, and restricted roles.", urgency: "immediate" },
          { step: "Check your state's non-compete laws", detail: "States like CA, MN, and OK render nearly all employee non-competes void.", urgency: "immediate" },
          { step: "Consult a local employment attorney if stakes are high", detail: "Especially before declining job offers or joining a competitor.", urgency: "soon" },
        ],
        dos: [
          "Review what genuinely constitutes proprietary trade secrets versus general industry skills.",
          "Ask for an official waiver or narrowing if you are moving to a new role.",
        ],
        donts: [
          "Don't assume a signed non-compete is automatically enforceable.",
          "Don't download proprietary internal client lists or files.",
        ],
        negotiationScript: `The non-compete provision in Section ${finding.section || ""} is broader in duration and geography than standard industry practices. To ensure clarity for both parties, I request that the scope be narrowed to direct solicitation of active accounts rather than a blanket employment ban.`,
      };

    default:
      return {
        executiveSummary: `This clause imposes obligations that warrant careful verification. Knowing the exact statutory baseline gives you significant leverage to negotiate or protect yourself.`,
        rightsOverview: [
          "Right to fair disclosure and unconscionability protections in consumer and adhesion contracts.",
          "Protection against deceptive or misleading penalty terms.",
        ],
        actionChecklist: [
          { step: "Mark the clause in the original document", detail: "Keep a permanent copy of the agreement as provided.", urgency: "immediate" },
          { step: "Ask for written clarification", detail: "Send a brief polite query asking how the clause is applied in practice.", urgency: "soon" },
        ],
        dos: [
          "Keep all communications written and dated.",
          "Compare the terms against standard industry benchmarks.",
        ],
        donts: [
          "Don't concede obligations that exceed the contract's explicit language.",
        ],
        negotiationScript: `I am reviewing Section ${finding.section || ""} regarding ${finding.title}. Could you provide written clarification on how this provision is enforced in practice so that both parties have a shared understanding?`,
      };
  }
}

function getFallbackAnswer(finding: Finding, question: string): string {
  const q = question.toLowerCase();
  if (q.includes("evict") || q.includes("kick me out") || q.includes("leave")) {
    return `In virtually all US jurisdictions, a landlord **cannot legally remove you without a formal court eviction order**. Even if a lease states "immediate termination" or "right of re-entry," self-help evictions (changing locks, shutting off utilities, removing possessions) are strictly illegal.

**What to do right now:**
1. Keep a copy of your lease and proof of payments on your phone or in your car.
2. Put all communications with the landlord in writing (email or certified text).
3. If they attempt to lock you out, contact local tenant legal aid or law enforcement immediately.`;
  }

  if (q.includes("pay") || q.includes("money") || q.includes("deduct") || q.includes("fee")) {
    return `Fees and penalties are subject to reasonableness tests under contract law. Disproportionate penalties disguised as "liquidated damages" are routinely ruled unenforceable penalties by courts.

**Key guideline:**
Ask for an itemized breakdown of the actual costs incurred. If it's a deposit dispute, landlords are legally required to provide receipts or estimates for repairs within the statutory window.`;
  }

  return `Regarding "${finding.title}": 
Contract terms are interpreted in light of the governing statutes in your jurisdiction. Where a contract clause conflicts with consumer, housing, or employment protection statutes, the public law generally supersedes the private contract.

We recommend using the **Generate Response** tool to put your position on record in a factual, calm manner.`;
}

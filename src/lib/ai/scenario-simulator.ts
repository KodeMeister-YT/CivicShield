import { randomUUID } from "crypto";
import type { Finding, ScenarioNode, ScenarioOutcome, ScenarioResult } from "@/types";

/**
 * "What happens if...?" scenario simulator.
 *
 * Produces a small decision tree grounded in the finding's known facts,
 * clearly separating what's known (from the document) from what's merely
 * possible or uncertain. This is template-driven rather than a free-form
 * LLM call so outcomes never overstate certainty.
 */
export function simulateScenario(params: {
  question: string;
  finding?: Finding;
}): ScenarioResult {
  const { question, finding } = params;
  const lowerQ = question.toLowerCase();

  const knownFacts: string[] = [];
  if (finding) {
    knownFacts.push(`Relevant clause: "${truncate(finding.clauseText, 160)}"`);
    if (finding.section) knownFacts.push(`Located in Section ${finding.section}`);
    knownFacts.push(`Category: ${finding.category.replace(/_/g, " ")}`);
  }

  const scenarioType = classifyScenario(lowerQ, finding);
  const { tree, outcomes } = buildTreeForType(scenarioType, finding, question);

  return {
    question,
    knownFacts,
    decisionTree: tree,
    possibleOutcomes: outcomes,
    disclaimer:
      "This is a simplified illustration based on common patterns, not a guaranteed prediction. Actual outcomes depend on your specific facts, jurisdiction, and how the other party responds. Consider professional review for high-stakes decisions.",
  };
}

type ScenarioType = "no_response" | "early_termination" | "non_payment" | "generic";

function classifyScenario(question: string, finding?: Finding): ScenarioType {
  if (/don'?t respond|no response|ignore/i.test(question)) return "no_response";
  if (/terminat|end (the|this) (lease|agreement|contract)|cancel/i.test(question)) return "early_termination";
  if (/don'?t pay|not pay|withhold payment/i.test(question)) return "non_payment";
  if (finding?.category === "termination") return "early_termination";
  if (finding?.category === "payment" || finding?.category === "penalty") return "non_payment";
  return "generic";
}

function node(text: string, children: ScenarioNode[] = []): ScenarioNode {
  return { id: randomUUID(), text, children };
}

function buildTreeForType(
  type: ScenarioType,
  finding: Finding | undefined,
  question: string
): { tree: ScenarioNode; outcomes: ScenarioOutcome[] } {
  switch (type) {
    case "no_response":
      return {
        tree: node(`IF YOU DO NOT RESPOND`, [
          node("The other party may treat the matter as unresolved or unacknowledged.", [
            node("They may proceed with their stated action (e.g. termination, fee, or deduction).", [
              node("A dispute may continue or escalate if you disagree with the outcome."),
            ]),
            node("Alternatively, they may take no further action if the stakes are low."),
          ]),
        ]),
        outcomes: [
          { id: randomUUID(), label: "The situation is treated as resolved by default.", certainty: "possible" },
          { id: randomUUID(), label: "The other party escalates or enforces the clause.", certainty: "possible" },
          { id: randomUUID(), label: "A written response preserves your position for later.", certainty: "known" },
        ],
      };
    case "early_termination":
      return {
        tree: node(`IF YOU TERMINATE EARLY`, [
          node(
            finding
              ? `The agreement's termination clause ("${truncate(finding.clauseText, 100)}") would likely apply.`
              : "The agreement's termination clause would likely apply."
          , [
            node("A penalty, forfeited deposit, or notice requirement may be triggered, depending on the exact terms."),
            node("The other party may accept the termination without dispute if terms are followed."),
          ]),
        ]),
        outcomes: [
          { id: randomUUID(), label: "You may owe a fee or lose a deposit, depending on the clause.", certainty: "possible" },
          { id: randomUUID(), label: "Following the stated notice period reduces dispute risk.", certainty: "known" },
          { id: randomUUID(), label: "The other party could dispute the termination.", certainty: "uncertain" },
        ],
      };
    case "non_payment":
      return {
        tree: node(`IF THE AMOUNT IS NOT PAID`, [
          node("The other party may send a formal demand or notice.", [
            node("Late fees or penalties described in the document may apply."),
            node("Continued non-payment could lead to further escalation (e.g. collections, legal action, termination)."),
          ]),
        ]),
        outcomes: [
          { id: randomUUID(), label: "A late fee or penalty may apply if one is specified.", certainty: "possible" },
          { id: randomUUID(), label: "The matter could escalate if unresolved for an extended period.", certainty: "possible" },
          { id: randomUUID(), label: "Documenting your reason for withholding payment is advisable.", certainty: "known" },
        ],
      };
    default:
      return {
        tree: node(`REGARDING: "${truncate(question, 80)}"`, [
          node("This depends heavily on the specific clause, jurisdiction, and how the other party responds.", [
            node("Reviewing the relevant clause and any applicable legal source is a reasonable first step."),
          ]),
        ]),
        outcomes: [
          { id: randomUUID(), label: "Outcome depends on specific facts not captured here.", certainty: "uncertain" },
        ],
      };
  }
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

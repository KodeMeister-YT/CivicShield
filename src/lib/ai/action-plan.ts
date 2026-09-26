import { randomUUID } from "crypto";
import type { Action, Finding } from "@/types";

/**
 * Builds a concrete, practical action list for a single finding. Actions
 * are deliberately specific to the finding's category/severity rather than
 * generic "consult a lawyer" advice -- professional review is offered as
 * one escalation option among several, per the product's safety framing.
 */
export function buildActionsForFinding(finding: Finding): Action[] {
  const actions: Action[] = [
    {
      id: randomUUID(),
      label: "Preserve the original document",
      kind: "preserve_evidence",
      description: "Keep the original file and any related communication unedited.",
      completed: true,
    },
  ];

  actions.push(...categorySpecificActions(finding));

  if (finding.sources.length > 0 && finding.sources[0].verified) {
    actions.push({
      id: randomUUID(),
      label: `Review the source: ${finding.sources[0].title}`,
      kind: "view_source",
      description: finding.sources[0].authority,
      completed: false,
      href: finding.sources[0].url,
    });
  }

  if (finding.severity === "high" || finding.severity === "potential_concern") {
    actions.push({
      id: randomUUID(),
      label: "Draft a written response",
      kind: "generate_response",
      description: "Use the response generator to put your position in writing.",
      completed: false,
    });
  }

  if (finding.needsProfessionalReview) {
    actions.push({
      id: randomUUID(),
      label: "Consider professional legal review",
      kind: "review_professional",
      description:
        "This situation may benefit from a licensed professional's review before you act.",
      completed: false,
    });
  }

  return actions;
}

function categorySpecificActions(finding: Finding): Action[] {
  switch (finding.category) {
    case "deposit":
      return [
        {
          id: randomUUID(),
          label: "Collect related evidence",
          kind: "collect_evidence",
          description: "Move-in/move-out photos, condition reports, and payment receipts.",
          completed: false,
        },
      ];
    case "payment":
      return [
        {
          id: randomUUID(),
          label: "Collect payment records",
          kind: "collect_evidence",
          description: "Pay stubs, bank statements, invoices, or receipts referenced in the clause.",
          completed: false,
        },
      ];
    case "termination":
    case "notice_period":
      return [
        {
          id: randomUUID(),
          label: "Note all relevant dates",
          kind: "collect_evidence",
          description: "Confirm when notice was given (or should have been) and any deadlines.",
          completed: false,
        },
      ];
    case "penalty":
      return [
        {
          id: randomUUID(),
          label: "Calculate the potential penalty amount",
          kind: "custom",
          description: "Understand the maximum financial exposure before responding.",
          completed: false,
        },
      ];
    case "refund":
    case "warranty":
      return [
        {
          id: randomUUID(),
          label: "Gather proof of purchase",
          kind: "collect_evidence",
          description: "Receipt, order confirmation, and any product/service defect evidence.",
          completed: false,
        },
      ];
    case "restriction":
    case "confidentiality":
      return [
        {
          id: randomUUID(),
          label: "Map the exact scope of the restriction",
          kind: "custom",
          description: "Note the duration, geography, and activities the clause covers.",
          completed: false,
        },
      ];
    default:
      return [];
  }
}

/** Escalation options shown in the dashboard, independent of any one finding. */
export function generalEscalationActions(): Action[] {
  return [
    {
      id: randomUUID(),
      label: "Explore dispute resolution options",
      kind: "escalate",
      description: "Mediation or arbitration may resolve this faster than litigation.",
      completed: false,
      href: "https://www.uscourts.gov/services-forms/other-services/alternative-dispute-resolution",
    },
    {
      id: randomUUID(),
      label: "Find free or low-cost legal help",
      kind: "review_professional",
      description: "A directory of legal aid resources, if you decide you need professional review.",
      completed: false,
      href: "https://www.usa.gov/legal-aid",
    },
  ];
}

// Core domain types for CivicShield.
// These describe the structured, validated shape of everything the AI
// pipeline produces. UI components should never depend on free-form LLM text.

export type DocumentCategory =
  | "housing"
  | "employment"
  | "consumer"
  | "government"
  | "education"
  | "other";

export type ShieldDomain = "TenantShield" | "WorkShield" | "ConsumerShield" | "General";

export type ClauseCategory =
  | "payment"
  | "deposit"
  | "termination"
  | "notice_period"
  | "penalty"
  | "liability"
  | "confidentiality"
  | "restriction"
  | "renewal"
  | "refund"
  | "warranty"
  | "dispute_resolution"
  | "jurisdiction"
  | "data_privacy"
  | "maintenance"
  | "other";

export type Severity = "low" | "review" | "high" | "potential_concern";

/** A structurally-extracted piece of the source document. */
export interface Clause {
  id: string;
  section?: string;
  page?: number;
  text: string;
  category: ClauseCategory;
  /** Heuristic importance assigned during extraction, before issue detection. */
  importance: "low" | "medium" | "high";
}

/** A date, amount, party, deadline or similar structured fact pulled from the document. */
export interface ExtractedFact {
  id: string;
  type: "date" | "amount" | "party" | "deadline" | "obligation" | "penalty";
  label: string;
  value: string;
  clauseId?: string;
}

export interface DocumentSection {
  id: string;
  heading: string;
  page?: number;
  order: number;
}

/** The output of the document extraction stage. */
export interface ExtractedDocument {
  id: string;
  fileName: string;
  mimeType: string;
  fullText: string;
  sections: DocumentSection[];
  clauses: Clause[];
  facts: ExtractedFact[];
  pageCount?: number;
  truncated: boolean;
}

/** A legal source record. Never fabricated -- always a real, checkable reference. */
export interface LegalSource {
  id: string;
  title: string;
  authority: string;
  url: string;
  jurisdiction: string;
  excerpt: string;
  domain: ShieldDomain;
  tags: ClauseCategory[];
  retrievedAt?: string;
  verified: boolean;
}

/** A source as attached to a specific finding, with relevance scoring from retrieval. */
export interface CitedSource extends LegalSource {
  relevanceScore: number;
}

export type ActionKind =
  | "preserve_evidence"
  | "collect_evidence"
  | "generate_response"
  | "view_source"
  | "escalate"
  | "review_professional"
  | "custom";

export interface Action {
  id: string;
  label: string;
  kind: ActionKind;
  description?: string;
  completed: boolean;
  href?: string;
}

/** The central unit of analysis output: one AI finding about one clause. */
export interface Finding {
  id: string;
  title: string;
  category: ClauseCategory;
  domain: ShieldDomain;
  severity: Severity;
  confidence: number; // 0-1
  clauseId: string;
  clauseText: string;
  section?: string;
  page?: number;
  explanation: string; // plain-language explanation
  whyItMatters: string;
  legalConcept?: string;
  sources: CitedSource[];
  reasoning: string; // AI reasoning trail, shown in "Show Me Why"
  actions: Action[];
  factVsInference: {
    fromDocument: string;
    aiInterpretation: string;
    legalSource: string;
  };
  needsProfessionalReview: boolean;
}

export interface AnalysisStage {
  key:
    | "reading"
    | "extracting"
    | "classifying"
    | "detecting_issues"
    | "verifying_sources"
    | "building_action_plan";
  label: string;
  status: "pending" | "in_progress" | "complete" | "error";
}

export interface DocumentAnalysis {
  id: string;
  createdAt: string;
  fileName: string;
  category: DocumentCategory;
  domain: ShieldDomain;
  isDemo: boolean;
  document: ExtractedDocument;
  findings: Finding[];
  summary: {
    total: number;
    counts: Record<Severity, number>;
  };
}

/** A single answer branch produced by the scenario simulator. */
export interface ScenarioOutcome {
  id: string;
  label: string;
  certainty: "known" | "possible" | "uncertain";
}

export interface ScenarioNode {
  id: string;
  text: string;
  children: ScenarioNode[];
}

export interface ScenarioResult {
  question: string;
  knownFacts: string[];
  decisionTree: ScenarioNode;
  possibleOutcomes: ScenarioOutcome[];
  disclaimer: string;
}

export interface GeneratedResponse {
  id: string;
  findingId?: string;
  recipientType: "landlord" | "employer" | "seller" | "other";
  subject: string;
  body: string;
  userFacts: string[];
  createdAt: string;
}

export interface EvidenceVaultItem {
  id: string;
  type: "document" | "response" | "clause" | "note";
  title: string;
  content: string;
  createdAt: string;
  analysisId?: string;
}

/** Standard error shape returned by API routes so the UI never breaks on failure. */
export interface PipelineError {
  stage: AnalysisStage["key"] | "upload" | "unknown";
  message: string;
  userMessage: string;
}

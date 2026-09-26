# CivicShield

**Know what they can do. Know what you can do.**

CivicShield is an AI-powered legal/civic rights navigator built for **LexHack 2026**. It helps
ordinary people understand confusing legal and official documents by identifying important
clauses, explaining them in plain language, grounding findings in verified legal sources, and
turning that understanding into a concrete next-step plan.

> CivicShield provides informational guidance, not legal representation. It is a first layer of
> legal understanding and action planning -- not a substitute for professional legal advice.

## Product philosophy

```
DOCUMENT -> EVIDENCE -> LAW -> RISK -> ACTION
```

Three MVP verticals: **TenantShield** (housing), **WorkShield** (employment), **ConsumerShield**
(consumer disputes). The architecture is extensible to more domains.

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Try `/demo` for three instant, precomputed analyses that require
no upload (TenantShield, WorkShield, ConsumerShield), or `/analyze` to upload a real PDF/DOCX/TXT
document (10 MB limit).

```bash
npm run build   # production build
npm run lint    # eslint
```

## Architecture

```
UPLOAD
  -> DOCUMENT EXTRACTION      (src/lib/document)      text from pdf/docx/txt
  -> DOCUMENT CLASSIFICATION  (src/lib/legal/classify) which vertical + category
  -> CLAUSE/CLAIM EXTRACTION  (src/lib/document/structure) sections, clauses, facts
  -> LEGAL ISSUE DETECTION    (src/lib/legal/detect-issues + issue-rules)
  -> SOURCE RETRIEVAL (RAG)   (src/lib/rag)            keyword-scored retrieval over seeded sources
  -> SOURCE-GROUNDED ANALYSIS (Finding.reasoning/sources/factVsInference)
  -> RISK/IMPORTANCE SCORING  (Finding.severity/confidence)
  -> EVIDENCE MAPPING         (Finding.clauseText/section/page)
  -> ACTION PLAN GENERATION   (src/lib/ai/action-plan.ts)
  -> USER DASHBOARD           (src/components/dashboard)
```

Every stage is isolated and produces zod-validated, structured output (`src/types`,
`src/lib/ai/schema.ts`) -- the UI never depends on free-form LLM text and a failure at any stage
surfaces a specific, user-facing error (`AnalysisPipelineError`) instead of crashing.

### Current implementation: deterministic, not an LLM call

For the hackathon build, clause classification and issue detection are implemented as a
transparent, rule-based engine (`src/lib/legal/issue-rules.ts`) rather than a live LLM call. This
was a deliberate choice for a legal-safety product: it is fully deterministic, has zero risk of
hallucinated citations, works with no external API key or network dependency, and makes Demo Mode
instant and 100% reliable during a live presentation. The schemas, retrieval abstraction, and
pipeline are structured so a real LLM-assisted pass (with retry/repair against the same zod
schemas) can be layered in without changing any downstream code -- see "Extending" below.

### RAG / legal source retrieval

`src/lib/rag/provider.ts` defines a `LegalSourceProvider` interface. The seeded implementation
(`src/lib/rag/local-provider.ts`) scores sources by domain match, category/tag overlap, and
keyword overlap against a hand-curated set of **real, verifiable government sources**
(`src/data/legal-sources`): U.S. Department of Labor, HUD, FTC, CFPB, EEOC, Cornell Legal
Information Institute, U.S. Courts, USA.gov. No statute, case, or citation is ever fabricated --
if no source clears the relevance threshold, the UI shows "Source verification unavailable."
instead of guessing.

To swap in a live legal database, embeddings + pgvector, or a licensed case-law API: implement
`LegalSourceProvider` and change one line in `src/lib/rag/index.ts`.

### Demo Mode

`src/data/demo` contains three fictional, clearly-labelled sample documents and precomputes their
full analyses once (in-memory cache) using the exact same pipeline stages as real uploads. This
makes the demo instant and immune to network/AI failures during a live presentation.

## Key features

- **Show Me Why**: every finding traces back to the original clause (with section/page), the
  matched legal source, the AI's reasoning trail, and a calibrated confidence score.
- **Split-screen document viewer**: clicking a finding highlights the source clause in the
  document (desktop split-screen; stacked on mobile).
- **Action Plan**: category-specific, checkable next steps (not just "consult a lawyer").
- **Response Generator**: template-based professional response drafts, factual and editable,
  clearly separating user-supplied facts from AI-generated language.
- **Scenario Simulator ("What happens if...?")**: a decision-tree answer distinguishing known
  facts, possible outcomes, and uncertainty -- never a guaranteed prediction.
- **Evidence Vault**: client-side (localStorage) space to save clauses, responses, and notes.
- **AI safety layer**: uncertainty detection, citation requirements, fact-vs-inference display,
  confidence scores, and escalation-to-professional-review framing throughout.

## Tech stack & disclosures

- **Framework**: Next.js 16 (App Router, Turbopack), React 19, TypeScript.
- **Styling**: Tailwind CSS v4, custom civic/legal-tech design tokens (no component library).
- **Validation**: Zod for all structured AI output.
- **Document parsing**: `pdf-parse` (PDF), `mammoth` (DOCX), native text for `.txt`.
- **Icons**: `lucide-react`.
- **No external AI API is called in this build** -- the pipeline is deterministic and rule-based
  (see above). No API keys are required or stored.
- **Storage**: no backend database in this MVP. Uploaded files are processed in-memory for a
  single request and are not persisted. Analysis results live in `sessionStorage` (per tab, per
  session); Evidence Vault entries live in `localStorage` (until the user clears them).
- **Legal sources**: real government URLs, seeded and hand-verified (see
  `src/data/legal-sources/index.ts`). Not exhaustive, and not a substitute for jurisdiction-
  specific legal research.

## Privacy

- Documents are validated (type, size) before processing and are not logged or persisted server-
  side.
- All analysis happens server-side (API routes); no document content or key material is exposed
  to the client beyond the structured analysis result.
- The upload page displays an explicit notice about sensitive information before any file leaves
  the browser.

## Project structure

```
src/
  app/            routes: /, /analyze, /demo, /vault, /dashboard/[id], /api/*
  components/     upload, dashboard, layout, ui primitives
  lib/
    ai/           schemas, action plan, response generator, scenario simulator, pipeline
    document/     text extraction + structural parsing
    legal/        clause classification + issue detection rules
    rag/          retrieval abstraction + seeded provider
    validation/   upload validation + sanitization
    client/       browser-only stores (analysis cache, vault, ids)
  types/          shared domain types
  data/
    demo/         fictional demo documents + precomputed analyses
    legal-sources/ seeded, verified legal source records
```

## Known limitations (hackathon scope)

- Clause classification/issue detection is rule-based, not an LLM -- broader legal nuance beyond
  the seeded rules and sources will not be detected.
- Legal sources are federal-level and illustrative; state/local law varies and is not modeled.
- No authentication or multi-user persistence; Evidence Vault is local to one browser.
- Scanned/image-only PDFs (no embedded text layer) are not OCR'd.

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

- **"What Can I Do?" AI Strategy Advisor**: Built on the official `@google/genai` SDK (Gemini 2.5 Flash), providing executive strategy summaries, retained statutory rights, prioritized action checklists, **Do's & Don'ts**, customized negotiation scripts, and live interactive Q&A grounded in specific document clauses.
- **Show Me Why**: Every finding traces back to the original clause (with section/page), the matched legal statute, the AI's reasoning trail, and a calibrated confidence score.
- **State-Level Jurisdiction Intelligence**: Automatically matches statutory protections across California, New York, Texas, and Federal law (e.g., California Civil Code § 1950.5, Texas Property Code § 92.103, NY General Obligations Law § 7-108).
- **Split-Screen Interactive Document Viewer**: Active breathing pulse highlighting (`animate-clause-pulse`) and animated risk badges directly over flagged text.
- **1-Click Sample Document Loaders**: Immediate testing for residential leases, non-competes, and consumer warranty terms right on the upload page with zero local file requirements.
- **Scenario Simulator ("What happens if...?")**: AI and decision-tree outcomes distinguishing known facts, probable outcomes, and uncertainties -- never guessing.
- **Response Generator**: Generates formal, legally grounded dispute and counter-proposal letters tailored to landlords, employers, or vendors.
- **Evidence Vault**: Comprehensive evidence locker with note creation, category filtering (`All`, `Clauses`, `Responses`, `Notes`), and one-click export to a structured `.txt` legal dossier.
- **Printable & Markdown Audit Reports**: Generates comprehensive, exportable PDF and Markdown summary reports for legal aid clinics and mediation.
- **AI Safety & Privacy Layer**: Uncertainty detection, strict fact-vs-inference isolation, in-memory zero-retention processing, and clear non-representation disclaimers.

## Tech stack & disclosures

- **Framework**: Next.js 16 (App Router, Turbopack), React 19, TypeScript 5.
- **AI & Reasoning Engine**: Google Gen AI SDK (`@google/genai`) with `gemini-2.5-flash` + reliable statutory heuristic fallback (runs online with `GEMINI_API_KEY` or 100% offline in demo mode).
- **Styling & Motion**: Tailwind CSS v4, custom civic cyber-grid keyframes, glassmorphism (`backdrop-blur-md`), and interactive toast system.
- **Validation**: Zod schema validation for all structured AI outputs.
- **Document parsing**: `pdf-parse` (PDF with Windows-safe path resolution), `mammoth` (DOCX), native UTF-8 for plain text.
- **Icons**: `lucide-react`.
- **Privacy & Security**: Zero server-side persistence of uploaded files. Ingestion and analysis occur entirely in-memory. Evidence Vault items are stored strictly in client-side storage under user control.
- **Legal sources**: Hand-verified federal and state government statutes (HUD, FTC, CFPB, California Civil Code, Texas Property Code, NY General Obligations Law).

## LexHack 2026 Track Alignment

- ⚖️ **Access to Justice & Civic Tech**: Demystifies one-sided adhesion contracts for vulnerable tenants, workers, and consumers with actionable negotiation scripts.
- 🛡️ **AI Safety, Ethics & Governance**: Eliminates hallucinations through grounded RAG, explicit confidence metrics, fact-vs-inference separation, and privacy-preserving ephemeral processing.
- ⚡ **Legal Automation & Workflow Innovation**: Full lifecycle automation from raw document parsing to interactive scenario modeling, dispute letter generation, and Evidence Vault dossier export.
- 🚀 **LexHack Builders Fellowship**: Engineered for real-world deployment in partnership with community legal aid clinics and tenant advocacy organizations.

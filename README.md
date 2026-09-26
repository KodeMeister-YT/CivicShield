# CivicShield

**Know what they can do. Know what you can do.**

CivicShield is an AI-powered legal/civic rights navigator built for **LexHack 2026**. It helps
ordinary people understand confusing legal and official documents by identifying important
clauses, explaining them in plain language, grounding findings in verified legal sources, and
turning that understanding into a concrete next-step plan.

> CivicShield provides informational guidance, not legal representation. It is a first layer of
> legal understanding and action planning -- not a substitute for professional legal advice.

## The problem

Most people who receive a lease, a termination notice, or a purchase agreement don't need a
lawyer to read it -- they need help understanding it well enough to know if something is worth
questioning, and what to do next. CivicShield is that first layer.

## Core philosophy

CivicShield is built around one pipeline, applied consistently to every document:

```mermaid
flowchart LR
    A[DOCUMENT<br/><sub>Original uploaded material</sub>] --> B[EVIDENCE<br/><sub>Relevant clause, section, page</sub>]
    B --> C[LAW<br/><sub>Verified legal source</sub>]
    C --> D[RISK<br/><sub>Severity, confidence, uncertainty</sub>]
    D --> E[ACTION<br/><sub>Practical next steps, response</sub>]

    style A fill:#faf9f6,stroke:#16181d,stroke-width:2px
    style B fill:#fbf1dd,stroke:#a1780f,stroke-width:2px
    style C fill:#e8efec,stroke:#1c3a3a,stroke-width:2px
    style D fill:#fbeee2,stroke:#b5591a,stroke-width:2px
    style E fill:#eaf5ef,stroke:#2f7d5c,stroke-width:2px
```

| Stage | What it means in CivicShield |
|---|---|
| **DOCUMENT** | The original uploaded material -- unmodified, never persisted server-side. |
| **EVIDENCE** | The exact clause the finding is based on, with section/page reference where available. |
| **LAW** | A verified legal source -- a real government URL, or an explicit "source verification unavailable." |
| **RISK** | A severity label, a calibrated confidence score, and explicit uncertainty framing. |
| **ACTION** | A concrete next-step plan and, optionally, a drafted written response. |

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

---

## 📊 Project Visualizations

Every diagram below reflects the actual implementation in this repository -- component names,
module paths, and data values are taken directly from the codebase and the live TenantShield demo
API response (`/api/demo/tenant`), not invented. Where a number is shown, it is real demo/sample
data and is labeled as such.

### 1. End-to-end analysis pipeline

How a document moves from upload to dashboard. Each stage maps to a real module in `src/lib`.

```mermaid
flowchart LR
    D[Document] --> EX[Extraction<br/><sub>lib/document/extract-text.ts</sub>]
    EX --> CL[Classification<br/><sub>lib/legal/classify.ts</sub>]
    CL --> CE[Clause / Claim<br/>Extraction<br/><sub>lib/document/structure.ts</sub>]
    CE --> ID[Legal Issue<br/>Detection<br/><sub>lib/legal/detect-issues.ts</sub>]
    ID --> SR[Legal Source<br/>Retrieval<br/><sub>lib/rag</sub>]
    SR --> SG[Source-Grounded<br/>Analysis]
    SG --> RC[Risk /<br/>Confidence]
    RC --> EM[Evidence<br/>Mapping]
    EM --> AP[Action Plan<br/><sub>lib/ai/action-plan.ts</sub>]
    AP --> DB[(Dashboard)]

    style D fill:#faf9f6,stroke:#16181d
    style DB fill:#e8efec,stroke:#1c3a3a,stroke-width:2px
```

### 2. Product / user journey

```mermaid
flowchart TD
    subgraph Entry["Entry point"]
        L[Landing page]
        L --> U[Upload a document]
        L --> DM[Demo Mode]
    end

    subgraph Analysis["Analysis"]
        U --> AN[Analysis pipeline runs]
        DM --> AN2[Precomputed analysis loads instantly]
        AN --> F[Findings dashboard]
        AN2 --> F
    end

    subgraph Trust["Trust & evidence"]
        F --> HC[Click a finding]
        HC --> HL[Clause highlighted<br/>in document viewer]
        HC --> SW["Show Me Why"]
        SW --> LS[Legal source + reasoning<br/>+ confidence]
    end

    subgraph Act["Act"]
        LS --> WCI["What Can I Do?"]
        WCI --> APL[Action plan]
        APL --> RG[Response Generator]
        APL --> EV[Evidence Vault]
        RG --> EV
    end

    style L fill:#faf9f6,stroke:#16181d,stroke-width:2px
    style SW fill:#fbf1dd,stroke:#a1780f,stroke-width:2px
    style WCI fill:#eaf5ef,stroke:#2f7d5c,stroke-width:2px
```

### 3. Product verticals

```mermaid
graph LR
    CS[CivicShield]
    CS --> TS[TenantShield]
    CS --> WS[WorkShield]
    CS --> CoS[ConsumerShield]

    TS --> TS1[Rental Agreements]
    TS --> TS2[Landlord Notices]
    TS --> TS3[Deposits / Termination]

    WS --> WS1[Employment Contracts]
    WS --> WS2[Termination Notices]
    WS --> WS3[Notice Periods / Non-Competes]

    CoS --> CoS1[Refunds]
    CoS --> CoS2[Warranties]
    CoS --> CoS3[Purchase Terms]

    style CS fill:#1c3a3a,stroke:#0f2626,color:#fff
    style TS fill:#e8efec,stroke:#1c3a3a
    style WS fill:#e8efec,stroke:#1c3a3a
    style CoS fill:#e8efec,stroke:#1c3a3a
```

All three verticals run through the identical pipeline, action plan engine, response generator,
and scenario simulator -- see the [feature coverage matrix](#feature-coverage) below.

### 4 & 5. Sample TenantShield demo — finding distribution

The precomputed TenantShield demo (`/api/demo/tenant`, backed by the fictional sample lease in
`src/data/demo/documents.ts`) currently produces **10 findings** across 12 extracted clauses. This
is real output from the current rule engine on one fixed sample document -- **not** a statistic
about real-world leases, legal outcomes, or CivicShield's accuracy in general.

```mermaid
pie
    title Sample TenantShield Demo — Finding Distribution (demo data only)
    "Potential Legal Concern" : 3
    "Review" : 3
    "Low Concern" : 3
    "High Attention" : 1
```

"TenantShield Demo Findings by Risk Level" (demo data only) -- rendered as a Markdown table since
Mermaid's `xychart-beta` bar-chart support on GitHub is not reliably guaranteed, per the same 10
findings shown in the pie chart above:

| Risk level | Count (demo) | |
|---|---|---|
| 🔴 Potential Legal Concern | 3 | `███` |
| 🟠 High Attention | 1 | `█` |
| 🟡 Review | 3 | `███` |
| 🟢 Low Concern | 3 | `███` |
| **Total findings** | **10** | |

<a id="feature-coverage"></a>

### 6. Feature coverage matrix

What actually exists in the current implementation, per vertical. All three verticals share the
same underlying pipeline and components (`src/lib`, `src/components/dashboard`) -- there is no
vertical-specific gating in the code, so coverage is identical across columns today.

| Feature | TenantShield | WorkShield | ConsumerShield |
|---|---|---|---|
| Document analysis | ✅ | ✅ | ✅ |
| Clause detection | ✅ | ✅ | ✅ |
| Risk classification | ✅ | ✅ | ✅ |
| Show Me Why | ✅ | ✅ | ✅ |
| Legal source retrieval | ✅ | ✅ | ✅ |
| Document highlighting | ✅ | ✅ | ✅ |
| Action Plan | ✅ | ✅ | ✅ |
| Response Generator | ✅ | ✅ | ✅ |
| Scenario Simulator | ✅ | ✅ | ✅ |
| Evidence Vault | ✅ | ✅ | ✅ |

### 7. Architecture

```mermaid
flowchart TD
    U[User] --> APP[Next.js App]
    APP --> UD["Upload (/analyze) or\nDemo (/demo)"]
    UD --> EXT[Document Extraction]
    EXT --> CLS[Classification]
    CLS --> SP[Structural Parsing]
    SP --> ISS[Issue Detection]
    ISS --> RAG[RAG Provider]
    RAG --> SRC[(Legal Sources)]
    RAG --> SF[Structured Findings]
    SF --> DASH[Dashboard]

    DASH --> APLAN[Action Plan]
    DASH --> RGEN[Response Generator]
    DASH --> SIM[Scenario Simulator]
    DASH --> VAULT[Evidence Vault]

    style APP fill:#1c3a3a,stroke:#0f2626,color:#fff
    style DASH fill:#e8efec,stroke:#1c3a3a,stroke-width:2px
```

### 8. Legal source retrieval

```mermaid
flowchart LR
    F[Finding candidate] --> Q[Query / category<br/>+ keyword matching]
    Q --> LSP[LegalSourceProvider<br/><sub>interface</sub>]
    LSP --> LKP[LocalKeywordProvider<br/><sub>lib/rag/local-provider.ts</sub>]
    LKP --> SEED[(Seeded legal sources<br/>src/data/legal-sources)]
    SEED --> REL[Relevant source<br/>≥ relevance threshold]
    REL --> EV[Finding evidence<br/>+ citation]

    SEED -.-> DOL[U.S. Dept. of Labor]
    SEED -.-> HUD[HUD]
    SEED -.-> FTC[FTC]
    SEED -.-> CFPB[CFPB]
    SEED -.-> EEOC[EEOC]
    SEED -.-> LII[Cornell Legal<br/>Information Institute]
    SEED -.-> COURTS[U.S. Courts]
    SEED -.-> USAGOV[USA.gov]

    style LSP fill:#e8efec,stroke:#1c3a3a,stroke-width:2px
    style EV fill:#eaf5ef,stroke:#2f7d5c,stroke-width:2px
```

These sources are a hand-curated, federal-level starting set for the hackathon demo -- they do
**not** cover all laws or jurisdictions. If no seeded source clears the relevance threshold for a
clause, CivicShield shows an explicit "Source verification unavailable" rather than guessing.

### 9. Deterministic today, LLM-ready tomorrow

```mermaid
flowchart LR
    DOC[Document] --> AI[Analysis Interface]
    AI --> RULE[Deterministic Rule Engine<br/><sub>lib/legal/issue-rules.ts<br/>— CURRENT</sub>]
    RULE --> ZOD[Zod Structured Output]
    ZOD --> DASH[Dashboard]

    AI -.-> FUT[Future: LLM-Assisted Analysis<br/><sub>NOT IMPLEMENTED</sub>]
    FUT -.-> ZOD

    style RULE fill:#eaf5ef,stroke:#2f7d5c,stroke-width:2px
    style FUT fill:#faf9f6,stroke:#83868f,stroke-width:2px,stroke-dasharray: 5 5
    style ZOD fill:#e8efec,stroke:#1c3a3a,stroke-width:2px
```

The dashed node and edges mark the **only** part of this diagram that does not exist yet. Today,
every finding comes from the deterministic rule engine; an LLM-assisted pass could later plug into
the same `Analysis Interface` and produce the same validated `Finding` shape, without touching the
dashboard or any downstream component.

## Key features

- **Show Me Why**: every finding traces back to the original clause (with section/page), the
  matched legal source, the AI's reasoning trail, and a calibrated confidence score.
- **Split-screen document viewer**: clicking a finding highlights the source clause in the
  document (desktop split-screen; stacked on mobile).
- **AI safety layer**: uncertainty detection, citation requirements, fact-vs-inference display,
  confidence scores, and escalation-to-professional-review framing throughout.

### Action Plan

Category-specific, checkable next steps -- not just "consult a lawyer."

```mermaid
flowchart LR
    I[Potential issue] --> P[Preserve original document]
    P --> R[Record relevant dates]
    R --> S[Review the legal source]
    S --> D[Draft a response]
    D --> V[Save to Evidence Vault]

    style I fill:#fbeee2,stroke:#b5591a,stroke-width:2px
    style V fill:#e8efec,stroke:#1c3a3a
```

### Response Generator

Template-based professional response drafts, factual and editable, clearly separating
user-supplied facts from AI-generated language.

```mermaid
flowchart LR
    F[Finding] --> C[Relevant clause]
    C --> R[Recipient type<br/><sub>landlord / employer / seller</sub>]
    R --> DR[Draft response]
    DR --> E[User edits]
    E --> CS[Copy or save to vault]
```

### Scenario Simulator ("What happens if...?")

A decision-tree answer distinguishing known facts, possible outcomes, and uncertainty -- these are
scenario explorations, **not guaranteed legal predictions**.

```mermaid
flowchart TD
    Q["'What happens if...?'"] --> O1[Possible outcome A]
    Q --> O2[Possible outcome B]
    O1 --> C1[Contractual consequence]
    O2 --> C2[Contractual consequence]
    C1 --> D1[Potential dispute]
    C2 --> D2[No dispute if terms followed]
    D1 --> A1[Further action /<br/>professional review]

    style Q fill:#fbf1dd,stroke:#a1780f,stroke-width:2px
    style A1 fill:#eaf5ef,stroke:#2f7d5c
```

### Evidence Vault

Client-side (localStorage) space to save clauses, responses, and notes.

```mermaid
flowchart TD
    F[Finding] --> EV[(Evidence Vault)]
    R[Response] --> EV
    N[Notes] --> EV
    EV --> LS[Browser localStorage]
```

## Tech stack & disclosures

- **Framework**: Next.js 16 (App Router, Turbopack), React 19, TypeScript.
- **Styling**: Tailwind CSS v4, custom civic/legal-tech design tokens (no component library).
- **Validation**: Zod for all structured AI output.
- **Document parsing**: `pdf-parse` (PDF), `mammoth` (DOCX), native text for `.txt`.
- **Icons**: `lucide-react`.
- **No external AI API is called in this build** -- the pipeline is deterministic and rule-based
  (see diagram 9 above). No API keys are required or stored.
- **Storage**: no backend database in this MVP. Uploaded files are processed in-memory for a
  single request and are not persisted. Analysis results live in `sessionStorage` (per tab, per
  session); Evidence Vault entries live in `localStorage` (until the user clears them).
- **Legal sources**: real government URLs, seeded and hand-verified (see
  `src/data/legal-sources/index.ts`). Not exhaustive, and not a substitute for jurisdiction-
  specific legal research.

## Privacy & data flow

```mermaid
flowchart LR
    B[Browser] --> UP[Upload]
    UP --> API[API route<br/><sub>/api/analyze</sub>]
    API --> MEM[In-memory processing<br/><sub>no disk / DB persistence</sub>]
    MEM --> SA[Structured analysis]
    SA --> SS[Client sessionStorage]

    F2[Finding / Response / Notes] -.user opts in.-> EV[(Evidence Vault)]
    EV --> LS[Browser localStorage]

    style MEM fill:#eaf5ef,stroke:#2f7d5c,stroke-width:2px
    style SS fill:#e8efec,stroke:#1c3a3a
    style LS fill:#e8efec,stroke:#1c3a3a
```

- Documents are validated (type, size) before processing and are not logged or persisted
  server-side.
- All analysis happens server-side (API routes); no document content or key material is exposed
  to the client beyond the structured analysis result.
- Uploaded documents are **not stored in a backend database** -- nothing persists once the
  request completes, aside from what the browser itself holds in `sessionStorage`/`localStorage`.
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

## Future roadmap

- Optional LLM-assisted analysis pass behind the same `Analysis Interface` (see diagram 9), with
  retry/repair against the existing Zod schemas.
- Embeddings/pgvector-backed `LegalSourceProvider` for broader, semantic source retrieval.
- State/local jurisdiction-aware legal source sets.
- OCR support for scanned/image-only PDFs.

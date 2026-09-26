# CivicShield

**Know what they can do. Know what you can do.**

CivicShield turns confusing legal documents (leases, termination notices, purchase agreements)
into plain-language explanations, evidence-backed findings, and a concrete next-step plan.

> Informational guidance, not legal representation. Not a substitute for professional legal
> advice.

**Verticals:** TenantShield (housing) · WorkShield (employment) · ConsumerShield (consumer)

```mermaid
flowchart LR
    A[DOCUMENT] --> B[EVIDENCE] --> C[LAW] --> D[RISK] --> E[ACTION]
    style A fill:#faf9f6,stroke:#16181d,stroke-width:2px,color:#16181d
    style B fill:#fbf1dd,stroke:#a1780f,stroke-width:2px,color:#16181d
    style C fill:#e8efec,stroke:#1c3a3a,stroke-width:2px,color:#16181d
    style D fill:#fbeee2,stroke:#b5591a,stroke-width:2px,color:#16181d
    style E fill:#eaf5ef,stroke:#2f7d5c,stroke-width:2px,color:#16181d
```

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

`/demo` for instant precomputed analyses (no upload needed) · `/analyze` to upload a real
PDF/DOCX/TXT (10 MB limit).

## Pipeline

```mermaid
flowchart LR
    D[Document] --> EX[Extraction] --> CL[Classification] --> CE[Clause Extraction]
    CE --> ID[Issue Detection] --> SR[Source Retrieval] --> RC[Risk / Confidence]
    RC --> AP[Action Plan] --> DB[(Dashboard)]

    style D fill:#faf9f6,stroke:#16181d,color:#16181d
    style DB fill:#e8efec,stroke:#1c3a3a,stroke-width:2px,color:#16181d
```

## User journey

```mermaid
flowchart TD
    L[Landing] --> U[Upload / Demo]
    U --> F[Findings dashboard]
    F --> HC[Click a finding<br/>→ clause highlighted]
    HC --> SW["Show Me Why"<br/>source + confidence]
    SW --> WCI["What Can I Do?"]
    WCI --> APL[Action plan]
    APL --> RG[Response Generator]
    APL --> EV[Evidence Vault]

    style L fill:#faf9f6,stroke:#16181d,stroke-width:2px,color:#16181d
    style SW fill:#fbf1dd,stroke:#a1780f,stroke-width:2px,color:#16181d
    style WCI fill:#eaf5ef,stroke:#2f7d5c,stroke-width:2px,color:#16181d
```

## Verticals

```mermaid
graph LR
    CS[CivicShield] --> TS[TenantShield] --> TS1[Leases / Deposits / Termination]
    CS --> WS[WorkShield] --> WS1[Contracts / Termination / Notice periods]
    CS --> CoS[ConsumerShield] --> CoS1[Refunds / Warranties / Purchase terms]

    style CS fill:#1c3a3a,stroke:#0f2626,color:#fff
    style TS fill:#e8efec,stroke:#1c3a3a,color:#16181d
    style WS fill:#e8efec,stroke:#1c3a3a,color:#16181d
    style CoS fill:#e8efec,stroke:#1c3a3a,color:#16181d
```

All three run the same pipeline and components — see the [feature matrix](#feature-matrix).

## TenantShield demo results

Real output from `/api/demo/tenant` on the fictional sample lease — **demo data, not a
real-world statistic**.

```mermaid
pie
    title Sample TenantShield Demo — Finding Distribution
    "Potential Legal Concern" : 3
    "Review" : 3
    "Low Concern" : 3
    "High Attention" : 1
```

| Risk level | Count |
|---|---|
| 🔴 Potential Legal Concern | 3 |
| 🟠 High Attention | 1 |
| 🟡 Review | 3 |
| 🟢 Low Concern | 3 |
| **Total** | **10** |

<a id="feature-matrix"></a>

## Feature matrix

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

## Architecture

```mermaid
flowchart TD
    U[User] --> APP[Next.js App]
    APP --> EXT[Extraction] --> CLS[Classification] --> ISS[Issue Detection]
    ISS --> RAG[RAG Provider] --> SRC[(Legal Sources)]
    RAG --> SF[Structured Findings] --> DASH[Dashboard]
    DASH --> APLAN[Action Plan]
    DASH --> RGEN[Response Generator]
    DASH --> SIM[Scenario Simulator]
    DASH --> VAULT[Evidence Vault]

    style APP fill:#1c3a3a,stroke:#0f2626,color:#fff
    style DASH fill:#e8efec,stroke:#1c3a3a,stroke-width:2px,color:#16181d
```

## Legal source retrieval

```mermaid
flowchart LR
    F[Finding] --> Q[Keyword matching] --> LSP[LegalSourceProvider]
    LSP --> SEED[(Seeded sources)] --> EV[Finding evidence]

    SEED -.-> DOL[DOL]
    SEED -.-> HUD[HUD]
    SEED -.-> FTC[FTC]
    SEED -.-> CFPB[CFPB]
    SEED -.-> EEOC[EEOC]
    SEED -.-> LII[Cornell LII]
    SEED -.-> COURTS[U.S. Courts]
    SEED -.-> USAGOV[USA.gov]

    style LSP fill:#e8efec,stroke:#1c3a3a,stroke-width:2px,color:#16181d
    style EV fill:#eaf5ef,stroke:#2f7d5c,stroke-width:2px,color:#16181d
```

Federal-level, hand-curated, real government URLs only. Not exhaustive. No source match →
"Source verification unavailable" instead of a guess.

## Deterministic today, LLM-ready tomorrow

```mermaid
flowchart LR
    DOC[Document] --> AI[Analysis Interface]
    AI --> RULE[Rule Engine — CURRENT] --> ZOD[Zod Output] --> DASH[Dashboard]
    AI -.-> FUT[LLM-Assisted — NOT BUILT] -.-> ZOD

    style RULE fill:#eaf5ef,stroke:#2f7d5c,stroke-width:2px,color:#16181d
    style FUT fill:#faf9f6,stroke:#83868f,stroke-width:2px,stroke-dasharray: 5 5,color:#16181d
```

No external AI calls today — fully rule-based, zero hallucination risk, works offline. The dashed
path is a future option, not implemented.

## Core features

**Show Me Why** — clause → source → reasoning → confidence, always traceable.

**Action Plan**

```mermaid
flowchart LR
    I[Issue] --> P[Preserve document] --> R[Record dates] --> S[Review source]
    S --> D[Draft response] --> V[Save to vault]
```

**Response Generator**

```mermaid
flowchart LR
    F[Finding] --> R[Recipient type] --> DR[Draft] --> E[Edit] --> CS[Copy / Save]
```

**Scenario Simulator** — "What happens if...?" as a decision tree. Explorations, not guarantees.

```mermaid
flowchart TD
    Q["What happens if...?"] --> O1[Possible outcome] --> D1[Potential dispute]
    D1 --> A1[Further action /<br/>professional review]
```

**Evidence Vault** — save findings/responses/notes to localStorage.

## Privacy

```mermaid
flowchart LR
    B[Browser] --> API[API route] --> MEM[In-memory only] --> SA[Structured result]
    SA --> SS[sessionStorage]
    EVI[Finding / Response / Notes] -.opt-in.-> LS[localStorage vault]
```

No backend database. Uploaded files are never persisted — processed in-memory per request only.

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Zod · `pdf-parse` · `mammoth` · `lucide-react`

No external AI API, no API keys required.

## Limitations

- Rule-based detection, not an LLM — misses nuance outside the seeded rules/sources.
- Federal-level sources only; state/local law not modeled.
- No auth or multi-user persistence.
- No OCR for scanned/image-only PDFs.

## Roadmap

- Optional LLM-assisted analysis behind the same interface + schemas.
- Embeddings/pgvector-backed source retrieval.
- State/local jurisdiction sources.
- OCR for scanned PDFs.

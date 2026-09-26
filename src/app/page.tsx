"use client";

import { useState } from "react";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import {
  ArrowRight,
  FileSearch,
  Home as HomeIcon,
  Briefcase,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Scale,
  Zap,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { TypewriterText, LetterRevealText } from "@/components/ui/typewriter-text";

interface InteractiveSample {
  id: string;
  tabLabel: string;
  docTitle: string;
  domain: string;
  clauseQuote: string;
  flagTitle: string;
  statute: string;
  aiAdvice: string;
  severityColor: string;
  demoSlug: string;
}

const INTERACTIVE_SAMPLES: InteractiveSample[] = [
  {
    id: "tenant",
    tabLabel: "Residential Lease",
    docTitle: "California_Apartment_Lease.pdf",
    domain: "TenantShield",
    clauseQuote:
      "Section 3.2: The security deposit of $2,000.00 is strictly non-refundable and will be retained by Landlord regardless of the condition of the premises upon termination.",
    flagTitle: "Unlawful Blanket Deposit Forfeiture",
    statute: "California Civil Code § 1950.5",
    aiAdvice:
      "Non-refundable deposits are illegal in California. Landlords must return the deposit within 21 days minus itemized receipts for actual damage beyond ordinary wear and tear.",
    severityColor: "border-concern text-concern bg-concern-bg",
    demoSlug: "tenant",
  },
  {
    id: "work",
    tabLabel: "Employment Agreement",
    docTitle: "Tech_Employment_Agreement.docx",
    domain: "WorkShield",
    clauseQuote:
      "Section 4.1: For a period of 24 months post-termination, Employee shall not engage in, work for, or consult with any competitive technology enterprise nationwide.",
    flagTitle: "Overbroad Restrictive Covenant",
    statute: "Cal. Bus. & Prof. Code § 16600 & FTC Rule",
    aiAdvice:
      "Post-employment non-compete agreements are void and legally unenforceable in California regardless of whether signed voluntarily. Counter with a standard NDA.",
    severityColor: "border-high text-high bg-high-bg",
    demoSlug: "work",
  },
  {
    id: "consumer",
    tabLabel: "Consumer Warranty",
    docTitle: "Purchase_Terms_and_Conditions.txt",
    domain: "ConsumerShield",
    clauseQuote:
      "Section 7: Products are sold strictly 'AS IS' with all faults. Company disclaims all express and implied warranties and will provide no refunds or replacements.",
    flagTitle: "Deceptive Warranty Waiver",
    statute: "Magnuson-Moss Warranty Act & UCC § 2-314",
    aiAdvice:
      "Implied warranties of merchantability cannot be disclaimed if a written service contract or warranty is offered. Consumers retain refund rights for defective items.",
    severityColor: "border-review text-review bg-review-bg",
    demoSlug: "consumer",
  },
];

export default function Home() {
  const [activeSample, setActiveSample] = useState<InteractiveSample>(INTERACTIVE_SAMPLES[0]);

  return (
    <div className="relative overflow-hidden selection:bg-brand-soft">
      {/* 3D Multi-Layer Ambient Glow Orbs */}
      <div className="hero-glow-orb bg-brand/20 w-[600px] h-[600px] -top-[160px] -left-[100px] animate-pulse-glow" />
      <div className="hero-glow-orb bg-accent/25 w-[500px] h-[500px] top-[140px] -right-[120px] animate-float-slow" />
      <div className="hero-glow-orb bg-indigo-500/15 w-[550px] h-[550px] top-[450px] left-[35%] animate-float-reverse" />

      {/* Subtle Civic Grid */}
      <div className="absolute inset-0 bg-grid-subtle opacity-50 pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Prop */}
          <div className="lg:col-span-7 space-y-6 animate-slide-up">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-brand bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-brand/20 shadow-xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span>AI-Powered Civic Defense &middot; LexHack 2026</span>
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-ink-soft bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border shadow-xs">
                <span className="text-accent font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  Live Defense:
                </span>
                <TypewriterText
                  phrases={[
                    "Lease & Deposit Auditing",
                    "Unlawful Non-Compete Detection",
                    "Deceptive Warranty Challenge",
                    "Illegal 24h Entry Protection",
                    "Client-Side Evidence Vaulting",
                  ]}
                  className="font-semibold text-ink min-w-[210px]"
                />
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl font-serif-heading font-bold leading-[1.12] text-ink tracking-tight">
              Know what they can do.
              <br />
              <span className="bg-gradient-to-r from-brand via-teal-700 to-amber-700 bg-clip-text text-transparent">
                Know what you can do.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-ink-soft leading-relaxed max-w-2xl font-sans">
              Don&apos;t get bullied by confusing legal jargon. Upload any lease, employment contract,
              or consumer agreement. CivicShield detects predatory traps, grounds your rights in
              verified statutes, and arms you with ready-to-send counter-proposals.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <LinkButton
                href="/analyze"
                size="lg"
                className="shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all bg-brand hover:bg-brand-strong text-white px-7 py-3.5 text-base font-semibold"
              >
                Analyze a Document
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </LinkButton>
              <LinkButton
                href="/demo"
                variant="secondary"
                size="lg"
                className="bg-white/80 backdrop-blur-md hover:bg-white text-ink border-border shadow-xs hover:shadow-sm px-6 py-3.5 text-base font-medium transition-all"
              >
                <Sparkles className="h-4 w-4 text-accent" />
                Explore Demo Cases
              </LinkButton>
            </div>

            {/* Live Trust Metrics Bar */}
            <div className="pt-6 grid grid-cols-3 gap-3 border-t border-border/80 max-w-lg">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-ink-faint">Privacy</p>
                <p className="text-sm font-semibold text-ink flex items-center gap-1 mt-0.5">
                  <Lock className="h-3.5 w-3.5 text-brand" />
                  100% In-Memory
                </p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-ink-faint">Legal RAG</p>
                <p className="text-sm font-semibold text-ink flex items-center gap-1 mt-0.5">
                  <Scale className="h-3.5 w-3.5 text-brand" />
                  Verified Statutes
                </p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-ink-faint">AI Copilot</p>
                <p className="text-sm font-semibold text-ink flex items-center gap-1 mt-0.5">
                  <Zap className="h-3.5 w-3.5 text-accent" />
                  Gemini 2.5 Flash
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Holographic Interactive Document Showcase */}
          <div className="lg:col-span-5 relative perspective-1000 preserve-3d flex justify-center">
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 via-teal-500/20 to-accent/20 rounded-3xl blur-2xl -z-10 animate-pulse-glow" />

            {/* The 3D Floating Document Card */}
            <div className="w-full max-w-md glass-morphism rounded-2xl p-6 shadow-2xl animate-float transition-all duration-500 hover:rotate-0 rotate-y-[-6deg] rotate-x-[4deg]">
              {/* Card Top Banner with Laser Scanner Bar */}
              <div className="relative overflow-hidden rounded-xl border border-border/80 bg-paper p-4">
                <div className="animate-scan-beam" />
                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand" />
                    <span className="text-xs font-semibold text-ink truncate">
                      Residential_Lease_Agreement.pdf
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE SCANNER
                  </span>
                </div>

                {/* Scanned Clause Snippet */}
                <div className="mt-3 space-y-2 text-xs font-serif-heading text-ink-soft">
                  <p className="text-[0.7rem] text-ink-faint uppercase font-sans tracking-wide">
                    Section 3.2 &middot; Security Deposit
                  </p>
                  <blockquote className="rounded bg-concern-bg/70 border-l-4 border-concern p-2.5 text-ink italic font-serif leading-relaxed">
                    &ldquo;The security deposit is strictly non-refundable and will be retained by Landlord regardless of move-out condition.&rdquo;
                  </blockquote>
                </div>
              </div>

              {/* Floating Holographic Badges */}
              <div className="mt-4 space-y-3">
                {/* Badge 1: Statutory Flag */}
                <div className="flex items-start gap-2.5 rounded-xl border border-concern/30 bg-white/90 backdrop-blur-md p-3 shadow-md transition-transform hover:scale-[1.02]">
                  <AlertTriangle className="h-4 w-4 text-concern flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-concern">Flagged Unlawful Clause</p>
                    <p className="text-ink-soft mt-0.5">
                      Violates <strong>California Civil Code § 1950.5</strong> (Mandatory deposit return within 21 days).
                    </p>
                  </div>
                </div>

                {/* Badge 2: AI Action Advisor */}
                <div className="flex items-start gap-2.5 rounded-xl border border-brand/30 bg-white/90 backdrop-blur-md p-3 shadow-md transition-transform hover:scale-[1.02]">
                  <Sparkles className="h-4 w-4 text-brand flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-brand">AI Strategy Advisor</p>
                    <p className="text-ink-soft mt-0.5">
                      Counter-proposal letter generated with statutory citation (95% confidence).
                    </p>
                  </div>
                </div>

                {/* Badge 3: Evidence Vault */}
                <div className="flex items-center justify-between rounded-xl border border-border bg-paper/90 px-3.5 py-2 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-ink">
                    <Lock className="h-3.5 w-3.5 text-brand" />
                    Evidence Vault
                  </span>
                  <span className="text-[0.7rem] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                    Saved to Dossier
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LIVE SCANNER DEMO WIDGET */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <ScrollReveal>
          <div className="rounded-3xl border border-border bg-white shadow-xl p-6 sm:p-10 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-accent">
                  Interactive Preview
                </span>
                <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-ink mt-1">
                  <LetterRevealText text="See CivicShield in Action" />
                </h2>
                <p className="text-sm text-ink-soft mt-1">
                  Click any agreement below to test real-time statutory detection and AI strategy.
                </p>
              </div>
            {/* Interactive Tab Buttons */}
            <div className="flex flex-wrap gap-2">
              {INTERACTIVE_SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => setActiveSample(sample)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-xs font-semibold transition-all border",
                    activeSample.id === sample.id
                      ? "bg-brand text-white border-brand shadow-md scale-[1.02]"
                      : "bg-paper text-ink-soft border-border hover:bg-white hover:text-ink hover:border-slate-300"
                  )}
                >
                  {sample.tabLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Inspection Layout */}
          <div className="mt-8 grid md:grid-cols-2 gap-6 items-stretch">
            {/* Left Box: The Extracted Document Text */}
            <div className="rounded-2xl border border-border bg-paper p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-ink-faint border-b border-border/60 pb-3 mb-4">
                  <span className="flex items-center gap-1.5 font-medium text-ink">
                    <FileText className="h-4 w-4 text-brand" />
                    {activeSample.docTitle}
                  </span>
                  <span className="bg-brand-soft text-brand font-semibold px-2 py-0.5 rounded text-[0.7rem]">
                    {activeSample.domain}
                  </span>
                </div>
                <p className="text-xs uppercase font-bold tracking-wider text-ink-faint mb-2">
                  Scanned Contract Clause
                </p>
                <div className="rounded-xl border border-review/30 bg-review-bg/50 p-4 font-serif text-ink leading-relaxed italic text-sm">
                  &ldquo;{activeSample.clauseQuote}&rdquo;
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between text-xs">
                <span className="text-ink-faint font-medium">Automatic OCR &amp; Clause Extraction</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </span>
              </div>
            </div>

            {/* Right Box: AI Analysis & Statutory Shield */}
            <div className="rounded-2xl border border-border/90 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={cn("inline-block text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded border", activeSample.severityColor)}>
                      High Risk Detected
                    </span>
                    <h3 className="font-serif-heading text-lg font-bold text-ink mt-1.5">
                      {activeSample.flagTitle}
                    </h3>
                  </div>
                  <Scale className="h-5 w-5 text-accent flex-shrink-0" />
                </div>

                <div className="rounded-xl border border-border bg-paper/60 p-3.5">
                  <p className="text-[0.65rem] uppercase font-bold tracking-wider text-brand">
                    Statutory Legal Basis
                  </p>
                  <p className="text-xs font-semibold text-ink mt-0.5">
                    {activeSample.statute}
                  </p>
                </div>

                <div>
                  <p className="text-[0.65rem] uppercase font-bold tracking-wider text-ink-faint mb-1">
                    AI Strategy Advisor Guidance
                  </p>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    {activeSample.aiAdvice}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <Link
                  href={`/dashboard/demo-${activeSample.demoSlug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
                >
                  Open Full Interactive Analysis &rarr;
                </Link>
                <Link
                  href="/analyze"
                  className="rounded-lg bg-brand text-white px-3 py-1.5 text-xs font-semibold hover:bg-brand-strong transition-colors"
                >
                  Scan Your Own
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>

      {/* THREE DOMAIN CARDS (3D Hover Physics) */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              Comprehensive Defense
            </span>
            <h2 className="font-serif-heading text-3xl font-bold text-ink mt-1">
              <LetterRevealText text="Built for Three Critical Life Arenas" />
            </h2>
            <p className="text-sm text-ink-soft mt-2">
              Everyday people face one-sided contracts where bargaining power is unequal. CivicShield levels the playing field.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-3 gap-6">
          <ScrollReveal delayMs={0}>
            <DomainCard
              icon={HomeIcon}
              title="Tenant Rights"
              subtitle="TenantShield"
              demoSlug="tenant"
              description="Protect against non-refundable deposit traps, illegal 24h entry clauses, surprise late fees, and eviction threats without statutory notice."
            />
          </ScrollReveal>
          <ScrollReveal delayMs={150}>
            <DomainCard
              icon={Briefcase}
              title="Worker Protections"
              subtitle="WorkShield"
              demoSlug="work"
              description="Evaluate termination letters, overbroad 2-year non-competes, aggressive IP assignment clauses, and unpaid severance promises."
            />
          </ScrollReveal>
          <ScrollReveal delayMs={300}>
            <DomainCard
              icon={ShoppingBag}
              title="Consumer Disputes"
              subtitle="ConsumerShield"
              demoSlug="consumer"
              description="Expose deceptive 'as-is' warranty waivers, hidden evergreen auto-renewals, forced arbitration clauses, and illegal refund bans."
            />
          </ScrollReveal>
        </div>
      </section>

      {/* 4-STEP CIVIC DEFENSE PIPELINE */}
      <section className="border-t border-border bg-paper-raised/70 backdrop-blur-md relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                How It Works
              </span>
              <h2 className="font-serif-heading text-3xl font-bold text-ink mt-1">
                <LetterRevealText text="Document → Evidence → Law → Action" />
              </h2>
              <p className="text-sm text-ink-soft mt-2">
                A 4-step pipeline designed to prevent hallucinations and generate enforceable leverage.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScrollReveal delayMs={0}>
              <PipelineCard
                step="01"
                icon={FileSearch}
                title="1. Parse & Segment"
                description="OCR and structural parsing breaks the document into clauses, paragraphs, and facts without storing any data server-side."
              />
            </ScrollReveal>
            <ScrollReveal delayMs={100}>
              <PipelineCard
                step="02"
                icon={Scale}
                title="2. Grounded Legal RAG"
                description="Matches flagged clauses to verified statutes (California, NY, Texas, Federal) with real citations and confidence scores."
              />
            </ScrollReveal>
            <ScrollReveal delayMs={200}>
              <PipelineCard
                step="03"
                icon={Zap}
                title="3. AI Strategy Advisor"
                description="Powered by Gemini 2.5 Flash. Delivers tailored negotiation scripts, Do's &amp; Don'ts, and interactive Q&amp;A."
              />
            </ScrollReveal>
            <ScrollReveal delayMs={300}>
              <PipelineCard
                step="04"
                icon={Lock}
                title="4. Evidence Vault"
                description="Store clauses, notes, and letters in a client-side sandbox. Export a structured legal dossier for mediation or court."
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION (3D Cyber Glow Banner) */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand text-white p-8 sm:p-14 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-soft bg-white/10 px-3 py-1 rounded-full mb-4">
                  <Shield className="h-3.5 w-3.5" />
                  Zero Cost &middot; 100% Private
                </span>
                <h3 className="font-serif-heading text-3xl sm:text-4xl font-bold leading-tight">
                  <LetterRevealText text="Stand up for your rights before you sign." />
                </h3>
                <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
                  Upload your document or test with 1-click sample contracts. Know exactly where the law stands.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <LinkButton
                  href="/analyze"
                  size="lg"
                  className="bg-white text-brand hover:bg-paper font-semibold shadow-md whitespace-nowrap"
                >
                  Start Free Analysis
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </LinkButton>
                <LinkButton
                  href="/demo"
                  variant="secondary"
                  size="lg"
                  className="bg-white/10 text-white hover:bg-white/20 border-white/20 font-medium whitespace-nowrap"
                >
                  Try Demo Cases
                </LinkButton>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

function DomainCard({
  icon: Icon,
  title,
  subtitle,
  description,
  demoSlug,
}: {
  icon: typeof HomeIcon;
  title: string;
  subtitle: string;
  description: string;
  demoSlug: string;
}) {
  return (
    <div className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-brand/40 flex flex-col justify-between">
      <div>
        <div className="h-12 w-12 rounded-xl bg-brand-soft text-brand flex items-center justify-center transition-colors group-hover:bg-brand group-hover:text-white shadow-xs">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-xs uppercase tracking-wider text-accent font-bold mt-4">{subtitle}</p>
        <h3 className="font-serif-heading text-xl font-bold text-ink mt-0.5">{title}</h3>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">{description}</p>
      </div>
      <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between">
        <Link
          href={`/dashboard/demo-${demoSlug}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand group-hover:translate-x-0.5 transition-transform"
        >
          Explore Demo Case <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function PipelineCard({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: string;
  icon: typeof FileSearch;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-paper border border-border flex items-center justify-center text-brand">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="text-xl font-serif-heading font-bold text-ink-faint/50">{step}</span>
      </div>
      <h3 className="font-serif-heading text-base font-bold text-ink">{title}</h3>
      <p className="mt-2 text-xs text-ink-soft leading-relaxed">{description}</p>
    </div>
  );
}

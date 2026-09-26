import { LinkButton } from "@/components/ui/button";
import { ArrowRight, FileSearch, Gavel, ShieldCheck, Home as HomeIcon, Briefcase, ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand bg-brand-soft px-3 py-1 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            CivicShield
          </p>
          <h1 className="mt-6 text-4xl sm:text-5xl font-serif-heading font-semibold leading-tight text-ink">
            Know what they can do.
            <br />
            Know what you can do.
          </h1>
          <p className="mt-6 text-lg text-ink-soft leading-relaxed max-w-2xl">
            Upload a legal or official document. CivicShield identifies important clauses,
            explains them in plain language, grounds its findings in legal sources, and gives
            you an actionable next-step plan.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <LinkButton href="/analyze" size="lg">
              Analyze a Document
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LinkButton>
            <LinkButton href="/demo" variant="secondary" size="lg">
              See How It Works
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Three domain cards */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid sm:grid-cols-3 gap-5">
          <DomainCard
            icon={HomeIcon}
            title="Housing"
            subtitle="TenantShield"
            description="Rental agreements, landlord notices, deposits, and termination terms."
          />
          <DomainCard
            icon={Briefcase}
            title="Work"
            subtitle="WorkShield"
            description="Employment contracts, termination letters, notice periods, and non-competes."
          />
          <DomainCard
            icon={ShoppingBag}
            title="Consumer"
            subtitle="ConsumerShield"
            description="Refund disputes, warranty claims, and unclear purchase terms."
          />
        </div>
      </section>

      {/* Three pillars */}
      <section className="border-t border-border bg-paper-raised">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-serif-heading text-2xl font-semibold text-ink mb-2">
            Document &rarr; Evidence &rarr; Law &rarr; Risk &rarr; Action
          </h2>
          <p className="text-ink-soft max-w-2xl mb-12">
            CivicShield turns confusing legal and official documents into evidence-backed
            explanations, risk signals, and actionable next steps.
          </p>
          <div className="grid sm:grid-cols-3 gap-10">
            <Pillar
              icon={FileSearch}
              title="Understand"
              description="Plain-language explanations of clauses that might otherwise take a law degree to parse."
            />
            <Pillar
              icon={Gavel}
              title="Verify"
              description="Evidence-backed legal sources, real citations, and clear confidence levels -- never fabricated law."
            />
            <Pillar
              icon={ArrowRight}
              title="Act"
              description="Concrete next steps, response generation, and scenario simulation for what happens next."
            />
          </div>
        </div>
      </section>

      {/* Trust statement */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="rounded-lg border border-border bg-brand-soft/60 px-6 py-5 text-sm text-ink-soft max-w-3xl">
          <p>
            <strong className="text-ink">CivicShield provides informational guidance, not legal
            representation.</strong> It is designed as a first layer of legal understanding and
            action planning -- not a substitute for professional legal advice. High-stakes or
            ambiguous situations are flagged for professional review.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-xl border border-border bg-white p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-serif-heading text-xl font-semibold text-ink">
              See it work in under a minute
            </h3>
            <p className="text-ink-soft mt-1">
              Try a precomputed demo case -- no upload required.
            </p>
          </div>
          <LinkButton href="/demo" size="lg">
            Try a Demo Case
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </LinkButton>
        </div>
      </section>
    </div>
  );
}

function DomainCard({
  icon: Icon,
  title,
  subtitle,
  description,
}: {
  icon: typeof HomeIcon;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-6 hover:border-border-strong transition-colors">
      <Icon className="h-6 w-6 text-brand" aria-hidden="true" />
      <h3 className="mt-4 font-serif-heading text-lg font-semibold text-ink">{title}</h3>
      <p className="text-xs uppercase tracking-wide text-accent font-medium mt-0.5">{subtitle}</p>
      <p className="mt-3 text-sm text-ink-soft leading-relaxed">{description}</p>
    </div>
  );
}

function Pillar({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileSearch;
  title: string;
  description: string;
}) {
  return (
    <div>
      <Icon className="h-6 w-6 text-brand" aria-hidden="true" />
      <h3 className="mt-4 font-serif-heading text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink-soft leading-relaxed">{description}</p>
    </div>
  );
}

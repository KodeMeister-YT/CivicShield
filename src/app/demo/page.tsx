import { LinkButton } from "@/components/ui/button";
import { ArrowRight, Briefcase, Home, ShoppingBag } from "lucide-react";

const CASES = [
  {
    slug: "tenant",
    domain: "TenantShield",
    icon: Home,
    title: "Rental Agreement",
    description:
      "A sample lease with an immediate-termination clause and a non-refundable deposit provision.",
  },
  {
    slug: "work",
    domain: "WorkShield",
    icon: Briefcase,
    title: "Employment Termination Notice",
    description:
      "A sample termination notice with a broad non-compete and no severance.",
  },
  {
    slug: "consumer",
    domain: "ConsumerShield",
    icon: ShoppingBag,
    title: "Consumer Purchase & Warranty Terms",
    description: "A sample purchase agreement with a final-sale clause and disclaimed warranty.",
  },
] as const;

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <h1 className="font-serif-heading text-3xl font-semibold text-ink">Demo Mode</h1>
      <p className="mt-2 text-ink-soft max-w-2xl">
        Explore a complete CivicShield analysis instantly, using curated fictional documents. No
        upload required.
      </p>
      <p className="mt-3 inline-block text-xs uppercase tracking-wide font-medium text-accent bg-accent-soft px-2.5 py-1 rounded">
        Demo documents are fictional and for demonstration only
      </p>

      <div className="mt-10 grid sm:grid-cols-3 gap-5">
        {CASES.map((c) => (
          <div key={c.slug} className="flex flex-col rounded-lg border border-border bg-white p-6">
            <c.icon className="h-6 w-6 text-brand" aria-hidden="true" />
            <p className="mt-4 text-xs uppercase tracking-wide text-accent font-medium">
              {c.domain}
            </p>
            <h2 className="mt-1 font-serif-heading text-lg font-semibold text-ink">{c.title}</h2>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed flex-1">{c.description}</p>
            <LinkButton href={`/dashboard/demo-${c.slug}`} className="mt-5" variant="secondary">
              Try {c.domain} Demo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LinkButton>
          </div>
        ))}
      </div>
    </div>
  );
}

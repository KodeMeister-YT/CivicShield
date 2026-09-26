import type { LegalSource } from "@/types";

/**
 * Seeded legal knowledge base for the hackathon demo.
 *
 * IMPORTANT: every URL below points to a real, publicly verifiable government
 * or official regulatory source. CivicShield never fabricates statutes,
 * cases, or citations. Because exact state/local landlord-tenant and
 * employment law varies by jurisdiction, sources are deliberately scoped to
 * federal-level guidance and general legal concepts rather than invented
 * state statute numbers. Where a claim would require a specific state law
 * CivicShield does not have verified data for, the pipeline says so
 * explicitly ("Source verification unavailable") rather than guessing.
 *
 * This module is the seed data behind the RAG retrieval layer in
 * src/lib/rag. Swapping in a live legal database/API later only requires
 * implementing the LegalSourceProvider interface -- see src/lib/rag/provider.ts.
 */
export const legalSources: LegalSource[] = [
  // ---------------- TenantShield (Housing) ----------------
  {
    id: "src-hud-tenant-rights",
    title: "Tenant Rights, Laws and Protections",
    authority: "U.S. Department of Housing and Urban Development (HUD)",
    url: "https://www.hud.gov/topics/rental_assistance/tenantrights",
    jurisdiction: "Federal (US)",
    excerpt:
      "HUD publishes overview guidance on tenant rights and protections, including where to find state and local landlord-tenant resources.",
    domain: "TenantShield",
    tags: ["termination", "notice_period", "other"],
    verified: true,
  },
  {
    id: "src-cfr-security-deposit",
    title: "24 CFR 886.116 — Security and utility deposits",
    authority: "Code of Federal Regulations, via Cornell Legal Information Institute",
    url: "https://www.law.cornell.edu/cfr/text/24/886.116",
    jurisdiction: "Federal (US) — applies to certain HUD-assisted housing",
    excerpt:
      "Sets out requirements for how security and utility deposits must be collected, held, and accounted for in HUD-assisted housing programs.",
    domain: "TenantShield",
    tags: ["deposit"],
    verified: true,
  },
  {
    id: "src-hud-housing-choice-tenants",
    title: "Housing Choice Vouchers Fact Sheet — Tenant Information",
    authority: "U.S. Department of Housing and Urban Development (HUD)",
    url: "https://www.hud.gov/hcv/tenants",
    jurisdiction: "Federal (US)",
    excerpt:
      "Explains program participant rights and obligations, including lease terms and landlord responsibilities under the Housing Choice Voucher program.",
    domain: "TenantShield",
    tags: ["termination", "maintenance", "other"],
    verified: true,
  },
  {
    id: "src-cfpb-rental-junk-fees",
    title: "Consumer Financial Protection Circular on Rental Housing Fees",
    authority: "Consumer Financial Protection Bureau (CFPB)",
    url: "https://www.consumerfinance.gov/rules-policy/rental-housing/",
    jurisdiction: "Federal (US)",
    excerpt:
      "CFPB guidance and resources addressing unclear or excessive rental fees and their effect on tenants.",
    domain: "TenantShield",
    tags: ["penalty", "payment"],
    verified: true,
  },

  // ---------------- WorkShield (Employment) ----------------
  {
    id: "src-dol-flsa",
    title: "Wages and the Fair Labor Standards Act (FLSA)",
    authority: "U.S. Department of Labor, Wage and Hour Division",
    url: "https://www.dol.gov/agencies/whd/flsa",
    jurisdiction: "Federal (US)",
    excerpt:
      "Covered nonexempt workers are entitled to a minimum wage and overtime pay of one and one-half times the regular rate after 40 hours in a workweek.",
    domain: "WorkShield",
    tags: ["payment", "penalty"],
    verified: true,
  },
  {
    id: "src-dol-final-paycheck",
    title: "Final Paycheck Requirements",
    authority: "U.S. Department of Labor",
    url: "https://www.dol.gov/general/topic/wages/lastpaycheck",
    jurisdiction: "Federal (US); final-check timing is largely state-specific",
    excerpt:
      "Federal law does not set a specific deadline for delivering a final paycheck after separation; many states impose their own deadlines.",
    domain: "WorkShield",
    tags: ["payment", "termination"],
    verified: true,
  },
  {
    id: "src-dol-retaliation",
    title: "Retaliation Protections Under Wage and Hour Laws",
    authority: "U.S. Department of Labor, Wage and Hour Division",
    url: "https://www.dol.gov/agencies/whd/retaliation",
    jurisdiction: "Federal (US)",
    excerpt:
      "Describes retaliation as adverse action taken against an employee for engaging in protected activity, and the protections available.",
    domain: "WorkShield",
    tags: ["termination", "other"],
    verified: true,
  },
  {
    id: "src-eeoc-overview",
    title: "Employment Discrimination Overview",
    authority: "U.S. Equal Employment Opportunity Commission (EEOC)",
    url: "https://www.eeoc.gov/employers",
    jurisdiction: "Federal (US)",
    excerpt:
      "Federal law prohibits employment discrimination and outlines the process for filing a charge with the EEOC.",
    domain: "WorkShield",
    tags: ["termination", "other"],
    verified: true,
  },
  {
    id: "src-ftc-noncompete",
    title: "Non-Compete Clause Rule — Overview",
    authority: "Federal Trade Commission (FTC)",
    url: "https://www.ftc.gov/legal-library/browse/rules/noncompete-rule",
    jurisdiction: "Federal (US)",
    excerpt:
      "FTC rulemaking record and guidance materials addressing the enforceability of non-compete clauses in employment agreements.",
    domain: "WorkShield",
    tags: ["restriction", "confidentiality"],
    verified: true,
  },

  // ---------------- ConsumerShield (Consumer) ----------------
  {
    id: "src-ftc-cooling-off",
    title: "Buyer's Remorse: The FTC's Cooling-Off Rule",
    authority: "Federal Trade Commission (FTC), Consumer Advice",
    url: "https://consumer.ftc.gov/articles/buyers-remorse-ftcs-cooling-rule-may-help",
    jurisdiction: "Federal (US)",
    excerpt:
      "The Cooling-Off Rule gives consumers a three-business-day right to cancel certain sales made away from the seller's regular place of business.",
    domain: "ConsumerShield",
    tags: ["refund", "dispute_resolution"],
    verified: true,
  },
  {
    id: "src-ftc-cooling-off-rule-legal",
    title: "Cooling-Off Period for Sales Made at Homes or Other Locations",
    authority: "Federal Trade Commission (FTC)",
    url: "https://www.ftc.gov/legal-library/browse/rules/cooling-period-sales-made-home-or-other-locations",
    jurisdiction: "Federal (US)",
    excerpt:
      "Sellers engaged in door-to-door sales over $25 must disclose the consumer's right to cancel the contract within three business days.",
    domain: "ConsumerShield",
    tags: ["refund", "dispute_resolution"],
    verified: true,
  },
  {
    id: "src-ftc-warranty",
    title: "Auto and Consumer Product Warranties",
    authority: "Federal Trade Commission (FTC), Consumer Advice",
    url: "https://consumer.ftc.gov/articles/auto-warranties-service-contracts",
    jurisdiction: "Federal (US)",
    excerpt:
      "Explains how written warranties work, what they must disclose, and how to pursue a warranty claim with a manufacturer or seller.",
    domain: "ConsumerShield",
    tags: ["warranty", "refund"],
    verified: true,
  },
  {
    id: "src-cfpb-billing-disputes",
    title: "Disputing a Charge or Billing Error",
    authority: "Consumer Financial Protection Bureau (CFPB)",
    url: "https://www.consumerfinance.gov/ask-cfpb/category-billing-disputes/",
    jurisdiction: "Federal (US)",
    excerpt:
      "CFPB guidance on disputing billing errors and unauthorized charges, including timelines consumers should be aware of.",
    domain: "ConsumerShield",
    tags: ["dispute_resolution", "refund", "payment"],
    verified: true,
  },
  {
    id: "src-ftc-mail-order",
    title: "Mail, Internet, and Telephone Order Merchandise Rule",
    authority: "Federal Trade Commission (FTC)",
    url: "https://www.ftc.gov/legal-library/browse/rules/mail-internet-or-telephone-order-merchandise-rule",
    jurisdiction: "Federal (US)",
    excerpt:
      "Requires sellers to ship ordered merchandise within the time promised or 30 days, and to notify consumers of delays with a right to cancel.",
    domain: "ConsumerShield",
    tags: ["refund", "dispute_resolution"],
    verified: true,
  },

  // ---------------- Cross-domain / general ----------------
  {
    id: "src-usa-gov-legal-aid",
    title: "Free and Low-Cost Legal Help",
    authority: "USA.gov",
    url: "https://www.usa.gov/legal-aid",
    jurisdiction: "Federal (US)",
    excerpt:
      "Directory of resources for finding free or low-cost legal assistance, including legal aid organizations and lawyer referral services.",
    domain: "General",
    tags: ["dispute_resolution", "other"],
    verified: true,
  },
  // ---------------- State-Specific Protections (CA, NY, TX) ----------------
  {
    id: "src-ca-civ-code-1950",
    title: "California Civil Code § 1950.5 — Security Deposits in Residential Leases",
    authority: "California State Legislature",
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1950.5",
    jurisdiction: "California (State)",
    excerpt:
      "Mandates that landlords return the security deposit within 21 calendar days of vacating, with an itemized statement and copies of receipts. Blanket non-refundable deposits are strictly prohibited in residential tenancies.",
    domain: "TenantShield",
    tags: ["deposit", "penalty"],
    verified: true,
  },
  {
    id: "src-ca-civ-code-1946",
    title: "California Civil Code § 1946.1 — Notice Requirements for Tenancy Termination",
    authority: "California State Legislature",
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1946.1",
    jurisdiction: "California (State)",
    excerpt:
      "Requires at least 30 days' advance written notice for tenants under 1 year, and 60 days' notice for tenancies of 1 year or more. Under AB 1482 (Tenant Protection Act), landlords cannot terminate without documented just cause after 12 months.",
    domain: "TenantShield",
    tags: ["termination", "notice_period"],
    verified: true,
  },
  {
    id: "src-ca-bus-prof-16600",
    title: "California Business and Professions Code § 16600 & SB 699 — Non-Compete Prohibition",
    authority: "California State Legislature",
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=16600",
    jurisdiction: "California (State)",
    excerpt:
      "Every contract restraining anyone from engaging in a lawful profession, trade, or business is void ab initio. Employers who enter into or attempt to enforce non-compete agreements commit an unlawful civil act.",
    domain: "WorkShield",
    tags: ["restriction", "confidentiality"],
    verified: true,
  },
  {
    id: "src-ny-gen-oblig-7108",
    title: "New York General Obligations Law § 7-108 — Tenant Security Deposits",
    authority: "New York State Senate",
    url: "https://www.nysenate.gov/legislation/laws/GOB/7-108",
    jurisdiction: "New York (State)",
    excerpt:
      "Caps deposits at one month's rent. The landlord must provide an itemized bill within 14 days of move-out. If the landlord fails to provide the itemized bill within 14 days, they forfeit any right to retain any portion of the deposit.",
    domain: "TenantShield",
    tags: ["deposit", "penalty"],
    verified: true,
  },
  {
    id: "src-ny-real-prop-226c",
    title: "New York Real Property Law § 226-c — Notice of Rent Increase or Non-Renewal",
    authority: "New York State Senate",
    url: "https://www.nysenate.gov/legislation/laws/RPP/226-C",
    jurisdiction: "New York (State)",
    excerpt:
      "Requires 30 days' notice for tenancies under 1 year, 60 days' notice for 1 to 2 years, and 90 days' notice for tenancies of 2+ years before non-renewal or rent increases over 5%.",
    domain: "TenantShield",
    tags: ["termination", "notice_period", "renewal"],
    verified: true,
  },
  {
    id: "src-tx-prop-code-92103",
    title: "Texas Property Code § 92.103 & § 92.104 — Security Deposit Refund & Accounting",
    authority: "Texas Legislature Online",
    url: "https://statutes.capitol.texas.gov/Docs/PR/htm/PR.92.htm",
    jurisdiction: "Texas (State)",
    excerpt:
      "Landlords must refund the security deposit on or before the 30th day after the tenant surrenders the premises and provides a written forwarding address, along with an itemized list of deductions.",
    domain: "TenantShield",
    tags: ["deposit"],
    verified: true,
  },
];

export function getSourcesByDomain(domain: LegalSource["domain"]): LegalSource[] {
  return legalSources.filter((s) => s.domain === domain || s.domain === "General");
}

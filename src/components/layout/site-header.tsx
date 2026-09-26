"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/analyze", label: "Analyze a document" },
  { href: "/demo", label: "Demo mode" },
  { href: "/vault", label: "Evidence vault" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-paper-raised/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-serif-heading text-lg font-semibold text-ink">
          <ShieldCheck aria-hidden="true" className="h-5 w-5 text-brand" />
          CivicShield
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-6 text-sm">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "transition-colors",
                  active ? "text-brand font-medium" : "text-ink-soft hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

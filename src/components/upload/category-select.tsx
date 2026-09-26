"use client";

import type { DocumentCategory } from "@/types";
import { cn } from "@/lib/utils";
import { Briefcase, Home, Landmark, ShoppingBag, GraduationCap, Sparkles, HelpCircle } from "lucide-react";

const OPTIONS: Array<{ value: DocumentCategory; label: string; icon: typeof Home }> = [
  { value: "housing", label: "Housing", icon: Home },
  { value: "employment", label: "Employment", icon: Briefcase },
  { value: "consumer", label: "Consumer", icon: ShoppingBag },
  { value: "government", label: "Government", icon: Landmark },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "other", label: "Other / Not sure", icon: HelpCircle },
];

export function CategorySelect({
  value,
  onChange,
}: {
  value: DocumentCategory | null;
  onChange: (v: DocumentCategory | null) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink mb-3">What kind of document is this?</legend>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm text-left transition-colors",
                active
                  ? "border-brand bg-brand-soft text-ink font-medium"
                  : "border-border text-ink-soft hover:border-border-strong"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {opt.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "mt-3 inline-flex items-center gap-1.5 text-sm",
          value === null ? "text-brand font-medium" : "text-ink-faint hover:text-ink-soft"
        )}
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Let CivicShield detect the category
      </button>
    </fieldset>
  );
}

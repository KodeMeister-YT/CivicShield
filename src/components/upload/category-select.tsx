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
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between">
        <legend className="text-sm font-semibold text-ink flex items-center gap-1.5">
          <span>What kind of document is this?</span>
        </legend>
        <span className="text-[0.65rem] uppercase font-bold tracking-wider text-ink-faint">
          Optional Classification
        </span>
      </div>

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
                "group relative flex items-center gap-2.5 rounded-xl border p-3 text-sm text-left transition-all duration-200 cursor-pointer card-3d-subtle",
                active
                  ? "border-brand bg-gradient-to-r from-brand-soft to-white text-brand font-semibold shadow-xs ring-2 ring-brand/20 -translate-y-0.5"
                  : "border-border bg-white text-ink-soft hover:border-border-strong hover:bg-paper/50"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-colors flex-shrink-0",
                  active
                    ? "bg-brand text-white shadow-xs"
                    : "bg-paper text-ink-soft group-hover:bg-brand-soft group-hover:text-brand"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="truncate">{opt.label}</span>
              {active && (
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-all px-2.5 py-1 rounded-md",
          value === null
            ? "text-brand bg-brand-soft font-semibold"
            : "text-ink-faint hover:text-ink hover:bg-paper"
        )}
      >
        <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
        Let CivicShield auto-detect from contents
      </button>
    </fieldset>
  );
}

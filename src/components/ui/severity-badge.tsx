import { cn } from "@/lib/utils";
import type { Severity } from "@/types";
import { AlertTriangle, CircleAlert, CircleCheck, Info } from "lucide-react";

/**
 * Severity is always communicated with an icon + text label + color, never
 * color alone (WCAG 1.4.1 -- use of color). See SEVERITY_META for the
 * canonical labels used across the app.
 */
export const SEVERITY_META: Record<
  Severity,
  { label: string; short: string; textColor: string; bg: string; icon: typeof Info }
> = {
  low: {
    label: "Low concern",
    short: "Low",
    textColor: "text-low",
    bg: "bg-low-bg",
    icon: CircleCheck,
  },
  review: {
    label: "Review",
    short: "Review",
    textColor: "text-review",
    bg: "bg-review-bg",
    icon: Info,
  },
  high: {
    label: "High attention",
    short: "High",
    textColor: "text-high",
    bg: "bg-high-bg",
    icon: AlertTriangle,
  },
  potential_concern: {
    label: "Potential legal concern",
    short: "Concern",
    textColor: "text-concern",
    bg: "bg-concern-bg",
    icon: CircleAlert,
  },
};

export function SeverityBadge({
  severity,
  size = "md",
  className,
}: {
  severity: Severity;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = SEVERITY_META[severity];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        meta.bg,
        meta.textColor,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      <Icon aria-hidden="true" className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {meta.label}
    </span>
  );
}

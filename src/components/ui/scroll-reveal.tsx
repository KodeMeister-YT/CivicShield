"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ScrollReveal({
  children,
  className,
  delayMs = 0,
  threshold = 0.15,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delayMs > 0) {
            setTimeout(() => setIsVisible(true), delayMs);
          } else {
            setIsVisible(true);
          }
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delayMs, threshold]);

  return (
    <div
      ref={elementRef}
      className={cn(
        "scroll-reveal",
        isVisible ? "is-visible" : "is-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Animated typewriter effect that writes out phrases letter-by-letter
 */
export function TypewriterText({
  phrases,
  className,
  typeSpeed = 45,
  deleteSpeed = 25,
  pauseMs = 2000,
}: {
  phrases: string[];
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseMs?: number;
}) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex] ?? "";
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText.length < currentPhrase.length) {
      // Typing next character
      timeout = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
      }, typeSpeed);
    } else if (!isDeleting && displayText.length === currentPhrase.length) {
      // Pause at full phrase
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseMs);
    } else if (isDeleting && displayText.length > 0) {
      // Deleting character
      timeout = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length - 1));
      }, deleteSpeed);
    } else if (isDeleting && displayText.length === 0) {
      // Pause briefly then move to next phrase
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }, 250);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentPhraseIndex, phrases, typeSpeed, deleteSpeed, pauseMs]);

  return (
    <span className={cn("inline-flex items-center", className)}>
      <span>{displayText}</span>
      <span className="ml-0.5 inline-block w-0.5 h-[1.1em] bg-current animate-cursor-blink" />
    </span>
  );
}

/**
 * Letter-by-letter scroll reveal: letters pop in with staggered delay
 */
export function LetterRevealText({
  text,
  className,
  staggerMs = 25,
}: {
  text: string;
  className?: string;
  staggerMs?: number;
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={cn("inline", className)}>
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={cn(
            "inline-block transition-all",
            inView ? "animate-letter-in" : "opacity-0 blur-[6px] translate-y-2"
          )}
          style={{
            animationDelay: `${index * staggerMs}ms`,
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

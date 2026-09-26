"use client";

import { useState, useEffect } from "react";
import { Check, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "info" | "warning";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let toastListeners: Array<(t: ToastMessage) => void> = [];

export function showToast(message: string, type: ToastType = "success") {
  const t: ToastMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    message,
    type,
  };
  toastListeners.forEach((fn) => fn(t));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (t: ToastMessage) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== t.id));
      }, 2500);
    };

    toastListeners.push(handleToast);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handleToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2.5 rounded-lg bg-ink text-white px-4 py-3 text-xs sm:text-sm shadow-2xl animate-toast-in border border-white/10"
        >
          {t.type === "success" && <Check className="h-4 w-4 text-low" />}
          {t.type === "info" && <Info className="h-4 w-4 text-brand-soft" />}
          {t.type === "warning" && <AlertTriangle className="h-4 w-4 text-accent" />}
          <span className="font-medium">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

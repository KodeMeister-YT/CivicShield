export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-ink-faint flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p>
          CivicShield provides informational guidance, not legal representation. It does not
          create an attorney-client relationship.
        </p>
        <p className="whitespace-nowrap">Built for LexHack 2026</p>
      </div>
    </footer>
  );
}

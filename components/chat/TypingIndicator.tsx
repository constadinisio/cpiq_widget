export function TypingIndicator() {
  return (
    <div className="flex animate-slide-in-left items-end gap-2" aria-live="polite" aria-label="Escribiendo">
      <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-[11px] font-bold text-white shadow-sm">
        C
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">
        <Dot delay="0ms" />
        <Dot delay="180ms" />
        <Dot delay="360ms" />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-slate-400"
      style={{ animationDelay: delay }}
    />
  );
}

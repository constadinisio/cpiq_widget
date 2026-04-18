import { BRANDING } from '@/lib/branding';

export function HeroIntro() {
  return (
    <div className="animate-fade-in px-1 pb-2 pt-1">
      <h1 className="text-[22px] font-bold leading-tight tracking-tight text-slate-900">
        {BRANDING.chat.heroGreeting}
      </h1>
      <p className="mt-1 text-[15px] leading-snug text-slate-700">
        {BRANDING.chat.heroQuestion}
      </p>
      <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">
        {BRANDING.chat.heroHint}
      </p>
    </div>
  );
}

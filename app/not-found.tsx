import { BRANDING } from '@/lib/branding';

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
      <div
        aria-hidden
        className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500 font-bold"
      >
        404
      </div>
      <h1 className="text-[15px] font-semibold text-slate-900">{BRANDING.errors.notFoundTitle}</h1>
      <p className="max-w-[260px] text-[13px] text-slate-500">{BRANDING.errors.notFoundBody}</p>
    </main>
  );
}

import { IconLock } from '@/components/icons';

export function Composer() {
  return (
    <div className="border-t border-slate-200 bg-white px-3 py-2.5">
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 transition hover:border-slate-300">
        <input
          type="text"
          readOnly
          disabled
          placeholder="Elegí una opción para continuar"
          aria-label="El chat completo continúa en el portal"
          className="flex-1 cursor-not-allowed bg-transparent text-[13px] text-slate-500 placeholder:text-slate-400 focus:outline-none"
        />
        <IconLock />
      </div>
      <p className="mt-1.5 text-center text-[10.5px] text-slate-400">
        El chat completo continúa en el portal CPIQ
      </p>
    </div>
  );
}

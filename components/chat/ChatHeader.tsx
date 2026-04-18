import { BRANDING } from '@/lib/branding';
import { IconClose } from '@/components/icons';

interface ChatHeaderProps {
  onClose: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-brand via-brand to-brand-dark px-4 pb-3.5 pt-3.5 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-white/30 blur-2xl" />
        <div className="absolute -right-6 top-0 h-20 w-20 rounded-full bg-white/20 blur-xl" />
      </div>

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandAvatar />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[14px] font-semibold">{BRANDING.widget.title}</p>
            <p className="flex items-center gap-1.5 text-[11px] text-white/80">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
              />
              {BRANDING.widget.status}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar asistente"
          className="shrink-0 rounded-full p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:bg-white/20"
        >
          <IconClose />
        </button>
      </div>
    </header>
  );
}

function BrandAvatar() {
  return (
    <div
      aria-hidden
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-[14px] font-bold text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.25)] backdrop-blur"
    >
      {BRANDING.widget.avatarInitial}
    </div>
  );
}

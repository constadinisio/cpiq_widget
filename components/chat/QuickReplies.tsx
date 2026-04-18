import { PANEL_ACTIONS, type PanelAction } from '@/lib/panel-routes';
import { ActionIcon, IconArrow } from '@/components/icons';

interface QuickRepliesProps {
  onSelect: (action: PanelAction) => void;
  variant?: 'cards' | 'chips';
}

export function QuickReplies({ onSelect, variant = 'cards' }: QuickRepliesProps) {
  if (variant === 'chips') {
    return (
      <div className="flex animate-fade-in flex-wrap gap-1.5 pl-9 pt-1">
        {PANEL_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onSelect(action)}
            className="group inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-white px-3 py-1.5 text-[12.5px] font-medium text-brand shadow-sm transition hover:border-brand hover:bg-brand hover:text-white focus-visible:border-brand"
          >
            <span>{action.label}</span>
            <IconArrow className="transition group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Opciones rápidas
      </p>
      <div className="flex flex-col gap-1.5">
        {PANEL_ACTIONS.map((action) => (
          <ActionCard key={action.id} action={action} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

interface ActionCardProps {
  action: PanelAction;
  onSelect: (action: PanelAction) => void;
}

function ActionCard({ action, onSelect }: ActionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(action)}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:-translate-y-px hover:border-brand hover:bg-brand-soft hover:shadow-md focus-visible:border-brand"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
        <ActionIcon name={action.icon} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold leading-tight text-slate-900">
          {action.label}
        </p>
        <p className="mt-0.5 truncate text-[12px] leading-tight text-slate-500">
          {action.description}
        </p>
      </div>
      <IconArrow className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand" />
    </button>
  );
}

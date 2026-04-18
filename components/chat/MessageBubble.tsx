import { memo } from 'react';
import type { ChatMessage } from '@/app/types';
import type { PanelActionId } from '@/lib/panel-routes';
import { IconExternal } from '@/components/icons';

interface MessageBubbleProps {
  message: ChatMessage;
  onCtaClick: (actionId: PanelActionId) => void;
  showAvatar: boolean;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  onCtaClick,
  showAvatar
}: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex animate-slide-in-right justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-brand to-brand-dark px-3.5 py-2 text-[13.5px] leading-snug text-white shadow-sm">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex animate-slide-in-left items-end gap-2">
      <AvatarSlot visible={showAvatar} />
      {message.kind === 'cta' ? (
        <a
          href={message.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onCtaClick(message.actionId)}
          className="group inline-flex max-w-[80%] items-center gap-2 rounded-2xl rounded-bl-md border border-brand/60 bg-brand px-3.5 py-2 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-brand-dark hover:shadow-md focus-visible:shadow-md"
        >
          <span>{message.text}</span>
          <IconExternal className="shrink-0 transition group-hover:translate-x-0.5" />
        </a>
      ) : (
        <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] leading-snug text-slate-800 shadow-sm">
          {message.text}
        </div>
      )}
    </div>
  );
});

function AvatarSlot({ visible }: { visible: boolean }) {
  if (!visible) {
    return <div aria-hidden className="h-7 w-7 shrink-0" />;
  }
  return (
    <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-[11px] font-bold text-white shadow-sm">
      C
    </div>
  );
}

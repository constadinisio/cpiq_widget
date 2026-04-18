'use client';

import { useCallback, useMemo } from 'react';
import { useHostContext } from '@/hooks/useHostContext';
import { useChatFlow } from '@/hooks/useChatFlow';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { QuickReplies } from '@/components/chat/QuickReplies';
import { Composer } from '@/components/chat/Composer';
import { HeroIntro } from '@/components/chat/HeroIntro';
import type { PanelAction, PanelActionId } from '@/lib/panel-routes';
import type { ChatMessage } from '@/app/types';

export default function WidgetPage() {
  const host = useHostContext();

  const handleNavigate = useCallback(
    (action: PanelAction) => {
      host.send({
        type: 'cpiq:navigate',
        action: action.id,
        path: action.path,
        clientId: host.clientId
      });
    },
    [host]
  );

  const handleCtaClick = useCallback(
    (actionId: PanelActionId) => {
      host.send({ type: 'cpiq:cta-click', actionId, clientId: host.clientId });
    },
    [host]
  );

  const { messages, typing, hasStarted, selectAction } = useChatFlow({
    clientId: host.clientId,
    onNavigate: handleNavigate
  });

  const scrollRef = useAutoScroll<HTMLDivElement>(`${messages.length}-${typing}`);

  const messagesWithAvatar = useMemo(() => decorateAvatars(messages), [messages]);

  return (
    <main className="flex h-full flex-col bg-slate-50">
      <ChatHeader onClose={() => host.send({ type: 'cpiq:close' })} />

      <div ref={scrollRef} className="chat-scroll flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        {!hasStarted && <HeroIntro />}

        <div className="flex flex-col gap-2">
          {messagesWithAvatar.map(({ message, showAvatar }) => (
            <MessageBubble
              key={message.id}
              message={message}
              showAvatar={showAvatar}
              onCtaClick={handleCtaClick}
            />
          ))}

          {typing && <TypingIndicator />}

          {!typing && (
            <div className="mt-2">
              <QuickReplies
                onSelect={selectAction}
                variant={hasStarted ? 'chips' : 'cards'}
              />
            </div>
          )}
        </div>
      </div>

      <Composer />
    </main>
  );
}

interface DecoratedMessage {
  message: ChatMessage;
  showAvatar: boolean;
}

/**
 * Muestra el avatar del bot sólo en el primer mensaje de cada secuencia
 * (para que mensajes consecutivos del bot se vean agrupados).
 */
function decorateAvatars(messages: readonly ChatMessage[]): DecoratedMessage[] {
  return messages.map((message, index) => {
    if (message.role !== 'bot') {
      return { message, showAvatar: false };
    }
    const previous = messages[index - 1];
    const isFirstOfSequence = !previous || previous.role !== 'bot';
    return { message, showAvatar: isFirstOfSequence };
  });
}

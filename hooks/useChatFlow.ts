'use client';

import { useCallback, useState } from 'react';
import { buildPanelUrl, type PanelAction, type PanelActionId } from '@/lib/panel-routes';
import { BRANDING } from '@/lib/branding';
import type { ChatMessage } from '@/app/types';

const TYPING_DELAY_MS = 650;

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface UseChatFlowArgs {
  clientId: string;
  onNavigate: (action: PanelAction) => void;
}

interface UseChatFlowResult {
  messages: ChatMessage[];
  typing: boolean;
  hasStarted: boolean;
  selectAction: (action: PanelAction) => void;
}

export function useChatFlow({ clientId, onNavigate }: UseChatFlowArgs): UseChatFlowResult {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'bot',
      kind: 'text',
      text: BRANDING.chat.welcome,
      createdAt: Date.now()
    }
  ]);
  const [typing, setTyping] = useState(false);

  const selectAction = useCallback(
    (action: PanelAction) => {
      const now = Date.now();
      const actionId: PanelActionId = action.id;

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'user',
          kind: 'text',
          text: action.label,
          createdAt: now
        }
      ]);
      setTyping(true);
      onNavigate(action);

      window.setTimeout(() => {
        const href = buildPanelUrl(action.path, { src: 'widget', client: clientId });
        setTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'bot',
            kind: 'text',
            text: BRANDING.chat.confirmationFor(action.label),
            createdAt: Date.now()
          },
          {
            id: uid(),
            role: 'bot',
            kind: 'cta',
            text: BRANDING.chat.ctaText,
            href,
            actionId,
            createdAt: Date.now()
          }
        ]);
      }, TYPING_DELAY_MS);
    },
    [clientId, onNavigate]
  );

  return {
    messages,
    typing,
    hasStarted: messages.length > 1,
    selectAction
  };
}

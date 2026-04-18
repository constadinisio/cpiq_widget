import type { PanelActionId } from '@/lib/panel-routes';

export interface TextMessage {
  id: string;
  role: 'bot' | 'user';
  kind: 'text';
  text: string;
  createdAt: number;
}

export interface CtaMessage {
  id: string;
  role: 'bot';
  kind: 'cta';
  text: string;
  href: string;
  actionId: PanelActionId;
  createdAt: number;
}

export type ChatMessage = TextMessage | CtaMessage;

export interface HostContext {
  clientId: string;
  hostOrigin: string | null;
}

export type HostOutboundMessage =
  | { type: 'cpiq:ready' }
  | { type: 'cpiq:close' }
  | { type: 'cpiq:navigate'; action: PanelActionId; path: string; clientId: string }
  | { type: 'cpiq:cta-click'; actionId: PanelActionId; clientId: string };

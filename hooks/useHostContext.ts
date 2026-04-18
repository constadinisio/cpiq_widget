'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { HostContext, HostOutboundMessage } from '@/app/types';

function postToHost(message: HostOutboundMessage): void {
  if (typeof window === 'undefined' || window.parent === window) return;
  try {
    window.parent.postMessage(message, '*');
  } catch {
    /* noop */
  }
}

interface UseHostContextResult extends HostContext {
  send: (message: HostOutboundMessage) => void;
}

export function useHostContext(): UseHostContextResult {
  const [ctx, setCtx] = useState<HostContext>({ clientId: 'default', hostOrigin: null });
  const readyRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCtx({
      clientId: params.get('client') || 'default',
      hostOrigin: params.get('host')
    });

    if (!readyRef.current) {
      readyRef.current = true;
      postToHost({ type: 'cpiq:ready' });
    }
  }, []);

  const send = useCallback((message: HostOutboundMessage) => {
    postToHost(message);
  }, []);

  return { ...ctx, send };
}

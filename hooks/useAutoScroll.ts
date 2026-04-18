'use client';

import { useEffect, useRef } from 'react';

/**
 * Mantiene el scroll del contenedor pegado al fondo cuando cambia `trigger`.
 * Respeta prefers-reduced-motion evitando el smooth scroll.
 */
export function useAutoScroll<T extends HTMLElement>(trigger: unknown) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }, [trigger]);

  return ref;
}

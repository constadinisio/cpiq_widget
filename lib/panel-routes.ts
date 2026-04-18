export const PANEL_BASE_URL =
  process.env.NEXT_PUBLIC_PANEL_URL?.replace(/\/$/, '') || 'https://panel.cpiq.com';

export type PanelActionId = 'pago-matricula' | 'registro' | 'encomienda-nueva' | 'encomienda-estado';

export type PanelAction = {
  id: PanelActionId;
  label: string;
  description: string;
  path: string;
  icon: 'payment' | 'user-plus' | 'plus' | 'status';
};

export const PANEL_ACTIONS: readonly PanelAction[] = [
  {
    id: 'pago-matricula',
    label: 'Abonar matrícula',
    description: 'Pagá tu matrícula anual',
    path: '/pago-matricula',
    icon: 'payment'
  },
  {
    id: 'registro',
    label: 'Darse de alta',
    description: 'Registrate como matriculado',
    path: '/registro',
    icon: 'user-plus'
  },
  {
    id: 'encomienda-nueva',
    label: 'Crear encomienda',
    description: 'Iniciá un nuevo trámite',
    path: '/encomiendas/nueva',
    icon: 'plus'
  },
  {
    id: 'encomienda-estado',
    label: 'Ver estado',
    description: 'Consultá el estado de tus trámites',
    path: '/encomiendas/estado',
    icon: 'status'
  }
] as const;

export function buildPanelUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(path.startsWith('/') ? path : `/${path}`, `${PANEL_BASE_URL}/`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

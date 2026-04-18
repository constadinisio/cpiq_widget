/**
 * Copy centralizado del widget CPIQ.
 *
 * Toda la voz del producto vive acá. Cambiar un texto en este archivo
 * actualiza toda la UI. Pensado para:
 * - Consistencia de voz institucional
 * - Facilitar futuras traducciones (i18n)
 * - Auditoría rápida de qué le decimos al usuario
 */

export const BRANDING = {
  institution: {
    short: 'CPIQ',
    long: 'Consejo Profesional de Ingeniería Química'
  },

  widget: {
    title: 'Asistente CPIQ',
    status: 'En línea · Asistente virtual',
    avatarInitial: 'C',
    footer: 'Consejo Profesional de Ingeniería Química'
  },

  chat: {
    welcome: 'Hola. Soy el asistente del CPIQ. ¿En qué podemos ayudarte?',
    heroGreeting: 'Hola.',
    heroQuestion: '¿En qué podemos ayudarte?',
    heroHint: 'Elegí una opción y te redirigimos al portal para continuar con tu trámite.',
    quickRepliesTitle: 'Opciones',
    composerPlaceholder: 'Elegí una opción para continuar',
    composerHint: 'Continuá tu consulta en el portal CPIQ',
    ctaText: 'Abrir en el portal',
    confirmationFor: (actionLabel: string): string =>
      `Perfecto. Te redirigimos al portal para continuar con ${actionLabel.toLowerCase()}.`
  },

  teaser: {
    defaultText: 'Chat con el Consejo'
  },

  meta: {
    title: 'Asistente · CPIQ',
    description:
      'Asistente del Consejo Profesional de Ingeniería Química. Gestioná matrícula, encomiendas y trámites.',
    keywords: ['CPIQ', 'Consejo Profesional', 'Ingeniería Química', 'matrícula', 'encomiendas']
  },

  errors: {
    genericTitle: 'Algo salió mal',
    genericBody: 'No pudimos cargar el asistente. Probá recargar o entrá directo al portal.',
    genericCta: 'Reintentar',
    notFoundTitle: 'Página no encontrada',
    notFoundBody: 'La ruta que intentaste abrir no existe.'
  }
} as const;

export type Branding = typeof BRANDING;

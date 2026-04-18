# Widget CPIQ

Widget embebible del CPIQ. Es **solo un punto de entrada**: muestra 4 opciones y redirige al panel externo. No tiene lógica de negocio, autenticación ni IA — todo eso vive en el panel.

---

## Arquitectura

Tres piezas desacopladas:

```
┌─────────────────────────────────────────┐
│  Sitio del cliente (cpiq.com, etc)      │
│                                         │
│   <script src=".../loader.js">          │  ← 1. Loader
│                                         │
│       ↓ inyecta dinámicamente           │
│                                         │
│   widget.js                             │  ← 2. Script principal
│   (botón flotante + iframe)             │
│                                         │
│       ↓ iframe.src                      │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ widget.cpiq.com (Next.js App)   │   │  ← 3. App del widget
│   │ 4 botones → redirect al panel   │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    ↓
         https://panel.cpiq.com/...          ← Panel externo (fuera de este repo)
```

| Pieza | Archivo | Rol |
|---|---|---|
| Loader | `public/loader.js` | Script mínimo que el cliente copia y pega. Lee `data-*` y carga `widget.js`. |
| Widget | `public/widget.js` | Crea el botón flotante y el iframe. Maneja toggle, postMessage, API global. |
| App | `app/page.tsx` | UI del iframe. 4 opciones que redirigen al panel en nueva pestaña. |

---

## Estructura de carpetas

```
widget_cpiq_web/
├── app/
│   ├── api/
│   │   └── health/route.ts   ← Endpoint /api/health para monitoreo
│   ├── globals.css
│   ├── layout.tsx            ← Metadata, OG, favicon, preconnect
│   ├── page.tsx              ← Orquestador del chat (~100 líneas)
│   ├── error.tsx             ← Error boundary visual del iframe
│   ├── not-found.tsx         ← 404 dentro del iframe
│   └── types.ts              ← ChatMessage, HostContext, eventos
├── components/
│   ├── chat/
│   │   ├── ChatHeader.tsx    ← Gradient + avatar + close
│   │   ├── Composer.tsx      ← Input readonly + hint
│   │   ├── HeroIntro.tsx     ← Saludo inicial
│   │   ├── MessageBubble.tsx ← Burbujas bot/user/cta (memoized)
│   │   ├── QuickReplies.tsx  ← Cards (idle) / Chips (conversación)
│   │   └── TypingIndicator.tsx
│   └── icons.tsx             ← SVG icons + ActionIcon mapper
├── hooks/
│   ├── useAutoScroll.ts      ← Scroll al bottom respetando reduced-motion
│   ├── useChatFlow.ts        ← Estado de mensajes + typing + handleSelect
│   └── useHostContext.ts     ← clientId + postMessage al host
├── lib/
│   ├── branding.ts           ← Copy centralizado (voz institucional, i18n-ready)
│   └── panel-routes.ts       ← Las 4 opciones + URL del panel
├── public/
│   ├── .well-known/
│   │   └── security.txt      ← RFC 9116 contacto de seguridad
│   ├── favicon.svg           ← Logo C con gradient brand
│   ├── loader.js             ← Snippet embebible (punto de entrada)
│   ├── robots.txt            ← Disallow explícito
│   └── widget.js             ← Botón flotante + iframe + teaser
├── examples/
│   ├── integration.html      ← Demo técnica con API
│   └── mock-cpiq.html        ← Sitio mock CPIQ (dark mode)
├── .env.example
├── CHANGELOG.md
├── README.md
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Desarrollo local

```bash
npm install
cp .env.example .env.local
npm run dev                   # Next.js en http://localhost:3000
```

Abrí `examples/mock-cpiq.html` con un servidor estático (ej. `npx serve examples -l 5500`) y navegá a `http://localhost:5500/mock-cpiq` — el widget se carga desde el dev server local.

> **No abras el HTML con `file://` (doble click)**. Los navegadores bloquean scripts externos con `crossOrigin` cuando el origen es `null`. Usá siempre un server HTTP.

---

## Cambiar copy del widget

Toda la voz del producto vive en un solo archivo: **`lib/branding.ts`**.

Cambiar cualquier string ahí actualiza toda la UI (welcome, hero, confirmaciones, CTA, footer, placeholders, textos de error). Ejemplo:

```ts
// lib/branding.ts
chat: {
  welcome: 'Hola. Soy el asistente del CPIQ. ¿En qué podemos ayudarte?',
  ctaText: 'Abrir en el portal',
  confirmationFor: (label) => `Perfecto. Te redirigimos al portal para continuar con ${label.toLowerCase()}.`,
  // ...
}
```

Si mañana querés sumar inglés/portugués, el archivo ya está estructurado para envolverlo con un hook `useBranding(lang)`.

---

## Configuración del loader

Todo se pasa por atributos `data-*`:

```html
<script
  src="https://widget.cpiq.com/loader.js"
  data-position="bottom-right"               <!-- bottom-right | bottom-left -->
  data-primary-color="#0B5FFF"               <!-- hex 3 o 6 dígitos -->
  data-panel-origin="https://panel.cpiq.com"
  data-client-id="mi-cliente"                <!-- para multi-cliente / analytics -->
  data-version="1"                           <!-- cache buster de widget.js -->
  data-auto-open="false"

  <!-- Teaser (burbuja "saludo" al lado del botón) -->
  data-teaser="true"                         <!-- true | false (default true) -->
  data-teaser-text="Chat con el Consejo"
  data-teaser-delay="1500"                   <!-- ms antes de mostrarlo -->
  data-teaser-auto-hide="0"                  <!-- 0 = nunca; ms = auto-cerrar -->
  data-teaser-dismissible="true"             <!-- muestra la × -->

  async></script>
```

Nada es obligatorio: todos los valores tienen default sensato.

### Teaser (burbuja de saludo)

Aparece encima del botón después del `data-teaser-delay` y dice lo que pongas en `data-teaser-text`. Al clickearla abre el widget. Si el usuario la cierra con la `×`, se recuerda por 30 días (localStorage) y no vuelve a aparecer en ese navegador.

Se oculta automáticamente:
- cuando el widget se abre (por cualquier medio)
- en mobile (< 480px) — así no tapa el contenido

Controlable desde JS:

```js
window.CPIQWidget.showTeaser();    // forzar que aparezca
window.CPIQWidget.hideTeaser();    // ocultarlo sin recordar
window.CPIQWidget.dismissTeaser(); // ocultarlo y recordar 30 días
window.CPIQWidget.resetTeaser();   // limpiar el "dismiss" guardado
```

---

## API pública

Una vez cargado, el widget expone `window.CPIQWidget`:

```js
window.CPIQWidget.open();
window.CPIQWidget.close();
window.CPIQWidget.toggle();

window.CPIQWidget.showTeaser();        // mostrar burbuja a demanda
window.CPIQWidget.hideTeaser();        // ocultar sin recordar
window.CPIQWidget.dismissTeaser();     // ocultar + recordar 30 días (localStorage)
window.CPIQWidget.resetTeaser();       // limpiar el dismiss guardado

window.CPIQWidget.version;             // string
window.CPIQWidget.config;              // objeto congelado con la config resuelta
window.CPIQWidget.on('navigate', (d) => { /* ... */ });
```

También: **la tecla Escape cierra el widget** cuando está abierto. Al cerrar, el foco
vuelve al elemento que lo había abierto (accesibilidad estándar).

### Eventos (listeners o `window.addEventListener('cpiq:<event>', ...)`)

| Evento | `detail` | Cuándo |
|---|---|---|
| `mounted` | `{ clientId, version }` | Al montar el widget en el DOM |
| `ready` | `{ clientId }` | La app del iframe terminó de cargar |
| `toggle` | `{ open: boolean }` | Al abrir o cerrar |
| `navigate` | `{ action, path, clientId }` | Click en una opción (antes del redirect) |
| `teaser-shown` | `{ clientId }` | Cuando aparece la burbuja de saludo |
| `teaser-click` | `{ clientId }` | Usuario clickeó la burbuja (abre el widget) |
| `teaser-dismissed` | `{ byUser, clientId }` | Usuario cerró la burbuja con × |
| `error` | `{ digest, message }` | Error boundary capturó un fallo en el iframe |

Perfecto para conectar con GA4, Segment, Plausible, etc.

---

## Endpoints y monitoreo

| Endpoint | Propósito | Output |
|---|---|---|
| `GET /` | App del widget (dentro del iframe) | HTML |
| `GET /loader.js` | Snippet embebible | JS · `Cache-Control: max-age=300` |
| `GET /widget.js` | Botón flotante + iframe + teaser | JS · `Cache-Control: max-age=3600, s-maxage=86400` |
| `GET /api/health` | Health check para monitoreo | `{ok, service, version, timestamp}` · `Cache-Control: no-store` |
| `GET /favicon.svg` | Favicon institucional | SVG con gradient brand |
| `GET /robots.txt` | Disallow all (no indexable) | text/plain |
| `GET /.well-known/security.txt` | RFC 9116 — contacto de seguridad | text/plain |

---

## Comunicación iframe ↔ host

Vía `postMessage`. Origin siempre validado contra `widgetOrigin`.

Mensajes que emite la app (iframe → host):

- `cpiq:ready`
- `cpiq:close`
- `cpiq:open`
- `cpiq:navigate` — `{ type, action, path, clientId }`

---

## Infraestructura recomendada

### Estructura de dominios

| Dominio | Qué sirve | De dónde |
|---|---|---|
| `widget.cpiq.com` | App Next.js (iframe) + `/loader.js` + `/widget.js` | Este repo, deploy en Vercel |
| `panel.cpiq.com` | Panel externo (login, IA, lógica) | Otro repo / stack |
| `cpiq.com` | Sitio institucional que embebe el widget | Donde ya esté hosteado |

Un solo dominio (`widget.cpiq.com`) sirve las 3 cosas — no hace falta CDN aparte para los scripts estáticos.

### Deploy en Vercel (paso a paso)

1. **Crear proyecto**
   ```bash
   vercel link
   vercel env add NEXT_PUBLIC_PANEL_URL production     # https://panel.cpiq.com
   vercel env add NEXT_PUBLIC_WIDGET_URL production    # https://widget.cpiq.com
   vercel env add NEXT_PUBLIC_ALLOWED_HOSTS production # hosts separados por espacio
   vercel env add NEXT_PUBLIC_WIDGET_VERSION production
   ```

2. **Asignar dominio custom**
   - En Vercel → Domains → agregar `widget.cpiq.com`
   - Apuntar el CNAME al proyecto según las instrucciones de Vercel

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Verificar**
   - `https://widget.cpiq.com/` → app del widget (UI con 4 opciones)
   - `https://widget.cpiq.com/loader.js` → loader (200 OK, `Content-Type: application/javascript`)
   - `https://widget.cpiq.com/widget.js` → widget principal
   - `https://widget.cpiq.com/api/health` → `{ok:true, service:"cpiq-widget", ...}`
   - `https://widget.cpiq.com/favicon.svg` → favicon renderiza

### Cache busting

- `loader.js` tiene cache corto (`max-age=300`) — se actualiza rápido.
- `widget.js` tiene cache largo pero se invalida con el query `?v=` que genera el loader desde `data-version`.
- Para forzar update, los clientes suben `data-version="2"` (o se actualiza `NEXT_PUBLIC_WIDGET_VERSION` si el loader lo toma de ahí).

### CORS / CSP

Configurado en `next.config.mjs`:

- Los scripts (`/loader.js`, `/widget.js`) tienen `Access-Control-Allow-Origin: *` — se pueden embeber desde cualquier dominio.
- La app (`/`) sirve `Content-Security-Policy: frame-ancestors <hosts>` — restringe qué sitios pueden embeber el iframe.
  - Por defecto `*` (todo permitido).
  - Para restringir a los dominios conocidos del CPIQ:
    ```
    NEXT_PUBLIC_ALLOWED_HOSTS=https://cpiq.com https://www.cpiq.com
    ```

---

## Seguridad (básica)

Implementado de arranque:

- [x] Validación de origin en `postMessage` (iframe → host)
- [x] Sanitización de `clientId`, `primaryColor`, `version` en `widget.js`
- [x] CSP `frame-ancestors` configurable vía `NEXT_PUBLIC_ALLOWED_HOSTS`
- [x] `referrerpolicy="strict-origin-when-cross-origin"` en el iframe
- [x] `rel="noopener noreferrer"` en los links al panel
- [x] `X-Content-Type-Options: nosniff` en todos los endpoints
- [x] `robots: noindex, nofollow` en la app + `/robots.txt` explícito
- [x] `security.txt` (RFC 9116) en `/.well-known/security.txt`
- [x] `formatDetection` desactivado (no autolinkea teléfonos/emails)

Lo que NO implementa (a propósito):

- Autenticación — es problema del panel
- Validación de inputs de negocio — no hay inputs, solo 4 botones
- Rate limiting — el widget no consume APIs propias

---

## Extensiones preparadas (sin implementar features)

El diseño ya deja lugar para:

1. **Multi-cliente** — `data-client-id` viaja en la URL del iframe y en los eventos. Cuando haya panel con lógica por cliente, ya está propagado.
2. **Analytics** — eventos `cpiq:*` listos para enganchar a cualquier tracker sin modificar el widget.
3. **postMessage bidireccional** — el canal ya está abierto; agregar más eventos (ej. `cpiq:auth-required`) es trivial.
4. **Configuración por script** — cada tag `<script>` puede tener su propia config (colores, posición, cliente) sin rebuild.
5. **i18n** — `lib/branding.ts` ya aísla todo el copy, listo para envolver en `useBranding(lang)`.

---

## Production readiness checklist

Antes de ir a producción, verificá:

### Infraestructura
- [ ] Proyecto desplegado en Vercel (o provider equivalente)
- [ ] Env vars configuradas: `NEXT_PUBLIC_PANEL_URL`, `NEXT_PUBLIC_WIDGET_URL`, `NEXT_PUBLIC_ALLOWED_HOSTS`, `NEXT_PUBLIC_WIDGET_VERSION`
- [ ] `NEXT_PUBLIC_ALLOWED_HOSTS` restringido a los dominios reales del CPIQ (no `*`)
- [ ] Dominio custom apuntado al deploy (o subdominio `.vercel.app` estable)
- [ ] HTTPS activo (automático en Vercel)
- [ ] `/api/health` responde 200 con `{ok:true}`

### Accesibilidad
- [x] `aria-label` en todos los botones
- [x] `aria-live` en el typing indicator
- [x] `aria-expanded` en el botón flotante
- [x] Escape cierra el widget
- [x] Focus restore al cerrar
- [x] `prefers-reduced-motion` respetado (animaciones desactivadas)
- [x] Focus visible en todos los interactivos

### Observabilidad
- [ ] Eventos `cpiq:*` conectados a GA4 / Plausible / Segment
- [ ] Uptime monitor apuntado a `/api/health` (UptimeRobot, BetterStack, etc.)
- [ ] Error boundary emite `cpiq:error` al host — logueado en el tracker

### Contenido
- [ ] `lib/branding.ts` revisado por alguien del CPIQ (voz institucional)
- [ ] `lib/panel-routes.ts` tiene las rutas reales del panel
- [ ] `security.txt` con el email de contacto real de seguridad

---

## Scripts disponibles

| Comando | Uso |
|---|---|
| `npm run dev` | Dev server en `localhost:3000` (hot reload) |
| `npm run build` | Build de producción optimizado |
| `npm run start` | Sirve el build local |
| `npm run typecheck` | TypeScript sin emitir (chequeo rápido sin build) |
| `npm run lint` | ESLint (config default de Next.js) |

---

## Licencia

UNLICENSED — software propietario del Consejo Profesional de Ingeniería Química.
Ver [CHANGELOG.md](./CHANGELOG.md) para el historial de versiones.

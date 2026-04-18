# Changelog

Todos los cambios notables al widget CPIQ se documentan acá. Sigue el formato
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado semántico
[SemVer](https://semver.org/lang/es/).

## [1.0.0] — 2026-04-18

Release inicial del widget embebible del CPIQ.

### Added

- Widget embebible con loader.js + widget.js (botón flotante + iframe)
- UI conversacional (welcome, quick replies, CTA al portal)
- Teaser bubble "Chat con el Consejo" al lado del botón
- Dismissal persistente del teaser en localStorage (30 días)
- API global `window.CPIQWidget` (open, close, toggle, showTeaser, hideTeaser)
- Eventos para analytics (`cpiq:mounted`, `cpiq:teaser-shown`, `cpiq:navigate`, etc.)
- Multi-cliente vía `data-client-id`
- Copy centralizado en `lib/branding.ts`
- Configuración de acciones del panel en `lib/panel-routes.ts`
- Metadata completa (OG, favicon SVG, robots, viewport)
- Error boundary y página 404
- Health check en `/api/health`
- Tecla Escape cierra el widget, focus restore al cerrar
- Accesibilidad: `aria-*` labels, `prefers-reduced-motion`, focus visible
- CSP `frame-ancestors` configurable por env var
- CORS abierto en scripts, preconnect al dominio del panel

### Security

- Validación de origin en `postMessage` (iframe ↔ host)
- Sanitización de `clientId`, `primaryColor`, `version` en widget.js
- `X-Content-Type-Options: nosniff` en todos los endpoints
- `robots: noindex, nofollow` en toda la app del iframe
- Cache-Control específico por tipo de asset (loader corto, widget largo, app hasheada)

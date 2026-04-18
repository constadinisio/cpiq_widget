/*!
 * CPIQ Widget Loader
 * Entry script que los clientes embeben en su sitio.
 * Lee configuración de atributos data-* y carga widget.js.
 *
 * Uso:
 *   <script src="https://widget.cpiq.com/loader.js"
 *           data-position="bottom-right"
 *           data-primary-color="#0B5FFF"
 *           data-panel-origin="https://panel.cpiq.com"
 *           data-client-id="default"
 *           data-version="1"
 *           async></script>
 */
(function () {
  if (window.__CPIQ_WIDGET_LOADED__) return;
  window.__CPIQ_WIDGET_LOADED__ = true;

  function findSelf() {
    if (document.currentScript) return document.currentScript;
    var all = document.getElementsByTagName('script');
    for (var i = all.length - 1; i >= 0; i--) {
      var src = all[i].src || '';
      if (src.indexOf('/loader.js') !== -1) return all[i];
    }
    return null;
  }

  var self = findSelf();
  if (!self || !self.src) {
    console.warn('[CPIQ] loader no pudo detectar su propio <script>; revisar integración.');
    return;
  }

  var origin;
  try {
    origin = new URL(self.src, location.href).origin;
  } catch (_) {
    console.warn('[CPIQ] loader.src inválido');
    return;
  }

  var attr = function (name, fallback) {
    var v = self.getAttribute(name);
    return v == null || v === '' ? fallback : v;
  };

  var config = {
    widgetOrigin: attr('data-widget-origin', origin),
    panelOrigin: attr('data-panel-origin', 'https://panel.cpiq.com'),
    position: attr('data-position', 'bottom-right'),
    primaryColor: attr('data-primary-color', '#0B5FFF'),
    clientId: attr('data-client-id', 'default'),
    version: attr('data-version', '1'),
    autoOpen: attr('data-auto-open', 'false') === 'true',
    teaserEnabled: attr('data-teaser', 'true') !== 'false',
    teaserText: attr('data-teaser-text', 'Chat con el Consejo'),
    teaserDelay: attr('data-teaser-delay', '1500'),
    teaserAutoHide: attr('data-teaser-auto-hide', '0'),
    teaserDismissible: attr('data-teaser-dismissible', 'true') !== 'false'
  };

  window.__CPIQ_WIDGET_CONFIG__ = config;

  var script = document.createElement('script');
  script.src = config.widgetOrigin.replace(/\/$/, '') + '/widget.js?v=' + encodeURIComponent(config.version);
  script.async = true;
  script.defer = true;
  script.crossOrigin = 'anonymous';
  script.onerror = function () {
    console.error('[CPIQ] error cargando widget.js desde', script.src);
  };
  document.head.appendChild(script);
})();

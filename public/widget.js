/*!
 * CPIQ Widget
 * Inyecta un botón flotante + iframe con la UI del widget.
 * Lee configuración desde window.__CPIQ_WIDGET_CONFIG__ (seteada por loader.js).
 *
 * API global:
 *   window.CPIQWidget.open()
 *   window.CPIQWidget.close()
 *   window.CPIQWidget.toggle()
 *   window.CPIQWidget.showTeaser()
 *   window.CPIQWidget.hideTeaser()
 *   window.CPIQWidget.on(event, handler)
 *
 * Eventos: mounted, ready, toggle, navigate, teaser-shown, teaser-click, teaser-dismissed
 */
(function () {
  if (window.__CPIQ_WIDGET_MOUNTED__) return;
  window.__CPIQ_WIDGET_MOUNTED__ = true;

  var cfg = window.__CPIQ_WIDGET_CONFIG__ || {};
  var widgetOrigin = (cfg.widgetOrigin || location.origin).replace(/\/$/, '');
  var position = cfg.position === 'bottom-left' ? 'bottom-left' : 'bottom-right';
  var primary = sanitizeColor(cfg.primaryColor) || '#0B5FFF';
  var clientId = String(cfg.clientId || 'default').replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64);
  var version = String(cfg.version || '1').replace(/[^a-zA-Z0-9_.\-]/g, '').slice(0, 32);

  var teaserEnabled = cfg.teaserEnabled !== false;
  var teaserText = String(cfg.teaserText || 'Chat con el Consejo').slice(0, 80);
  var teaserDelayMs = Math.max(0, Math.min(60000, parseInt(cfg.teaserDelay, 10) || 1500));
  var teaserAutoHideMs = Math.max(0, Math.min(600000, parseInt(cfg.teaserAutoHide, 10) || 0));
  var teaserDismissible = cfg.teaserDismissible !== false;
  var teaserDismissPersistDays = 30;

  var BTN_ID = 'cpiq-widget-button';
  var IFR_ID = 'cpiq-widget-iframe';
  var TEASER_ID = 'cpiq-widget-teaser';
  var TEASER_STORAGE_KEY = 'cpiq:teaser-dismissed:' + clientId;

  var listeners = {};
  function on(event, fn) {
    (listeners[event] = listeners[event] || []).push(fn);
  }
  function emit(event, detail) {
    (listeners[event] || []).forEach(function (fn) {
      try { fn(detail); } catch (_) { /* noop */ }
    });
    try {
      window.dispatchEvent(new CustomEvent('cpiq:' + event, { detail: detail }));
    } catch (_) { /* noop */ }
    if (typeof cfg.onEvent === 'function') {
      try { cfg.onEvent(event, detail); } catch (_) { /* noop */ }
    }
  }

  function sanitizeColor(value) {
    if (!value || typeof value !== 'string') return null;
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : null;
  }

  function hexToRgba(hex, alpha) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) {
      h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    }
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return 'rgba(11,95,255,' + alpha + ')';
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
  }

  function injectStyles() {
    var posCss = position === 'bottom-left'
      ? 'left:20px;right:auto;'
      : 'right:20px;left:auto;';
    var mobilePosCss = position === 'bottom-left'
      ? 'left:12px;right:auto;'
      : 'right:12px;left:auto;';

    var css = [
      '#' + BTN_ID + '{',
      'all:initial;position:fixed;bottom:20px;', posCss,
      'z-index:2147483646;width:60px;height:60px;border-radius:50%;',
      'background:', primary, ';color:#fff;cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;',
      'box-shadow:0 6px 20px rgba(15,23,42,.25);',
      'transition:transform .18s ease, box-shadow .18s ease;',
      'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}',
      '#' + BTN_ID + ':hover{transform:translateY(-1px) scale(1.04);box-shadow:0 10px 24px rgba(15,23,42,.3)}',
      '#' + BTN_ID + ':focus-visible{outline:3px solid rgba(11,95,255,.4);outline-offset:2px}',
      '#' + BTN_ID + ' svg{width:28px;height:28px;display:block}',

      '#' + IFR_ID + '{',
      'position:fixed;bottom:92px;', posCss,
      'z-index:2147483647;width:384px;height:620px;',
      'max-width:calc(100vw - 32px);max-height:calc(100vh - 112px);',
      'border:0;border-radius:16px;background:#fff;',
      'box-shadow:0 20px 50px rgba(15,23,42,.28);',
      'opacity:0;pointer-events:none;transform:translateY(8px) scale(.98);',
      'transition:opacity .18s ease, transform .18s ease;',
      'color-scheme:light}',
      '#' + IFR_ID + '.cpiq-open{opacity:1;pointer-events:auto;transform:translateY(0) scale(1)}',

      '@media (max-width:480px){',
      '#' + IFR_ID + '{width:calc(100vw - 16px);height:calc(100vh - 92px);bottom:84px;', mobilePosCss, '}',
      '#' + BTN_ID + '{bottom:12px;', mobilePosCss, '}',
      '}',

      /* Pulse ring effect on mount (runs 2 times then stops) */
      '#' + BTN_ID + '::before{content:"";position:absolute;inset:0;border-radius:50%;',
      'pointer-events:none;animation:cpiq-pulse 2.2s ease-out 2}',
      '@keyframes cpiq-pulse{',
      '0%{box-shadow:0 0 0 0 ', hexToRgba(primary, 0.45), '}',
      '70%{box-shadow:0 0 0 14px ', hexToRgba(primary, 0), '}',
      '100%{box-shadow:0 0 0 0 ', hexToRgba(primary, 0), '}}',

      '@media (prefers-reduced-motion:reduce){',
      '#' + BTN_ID + '{transition:none}',
      '#' + BTN_ID + '::before{animation:none}',
      '#' + IFR_ID + '{transition:opacity 1ms}',
      '#' + TEASER_ID + '{transition:opacity 1ms}',
      '}',

      /* Teaser bubble */
      '#' + TEASER_ID + '{',
      'all:initial;position:fixed;bottom:92px;', posCss,
      'z-index:2147483645;box-sizing:border-box;',
      'display:flex;align-items:center;gap:10px;',
      'max-width:260px;padding:10px 34px 10px 12px;',
      'background:#fff;border:1px solid rgba(15,23,42,.06);',
      'border-radius:16px;box-shadow:0 10px 30px rgba(15,23,42,.18);',
      'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;',
      'font-size:13.5px;line-height:1.35;color:#0f172a;',
      'opacity:0;transform:translateY(6px);pointer-events:none;',
      'transition:opacity .26s ease,transform .26s ease,box-shadow .18s ease;',
      'cursor:pointer}',
      '#' + TEASER_ID + '.cpiq-teaser-visible{opacity:1;transform:translateY(0);pointer-events:auto}',
      '#' + TEASER_ID + ':hover{transform:translateY(-1px);box-shadow:0 14px 36px rgba(15,23,42,.22)}',
      '#' + TEASER_ID + ' .cpiq-teaser-avatar{',
      'flex-shrink:0;width:28px;height:28px;border-radius:50%;',
      'background:', primary, ';color:#fff;font-weight:700;font-size:11px;',
      'display:flex;align-items:center;justify-content:center;',
      'box-shadow:0 2px 6px ', hexToRgba(primary, 0.3), '}',
      '#' + TEASER_ID + ' .cpiq-teaser-text{font-weight:500;color:#0f172a}',
      '#' + TEASER_ID + ' .cpiq-teaser-close{',
      'all:initial;position:absolute;top:5px;right:5px;',
      'width:22px;height:22px;border-radius:50%;',
      'background:#f1f5f9;color:#64748b;cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;',
      'transition:background .15s ease,color .15s ease;',
      'font-family:inherit}',
      '#' + TEASER_ID + ' .cpiq-teaser-close:hover{background:#e2e8f0;color:#0f172a}',
      '#' + TEASER_ID + ' .cpiq-teaser-close svg{width:10px;height:10px;display:block}',
      '@media (max-width:480px){#' + TEASER_ID + '{display:none}}'
    ].join('');

    var style = document.createElement('style');
    style.setAttribute('data-cpiq', 'widget');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = BTN_ID;
    btn.setAttribute('aria-label', 'Abrir asistente CPIQ');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', IFR_ID);
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M12 3C6.48 3 2 6.86 2 11.6c0 2.5 1.25 4.74 3.23 6.3-.1.8-.42 2.1-1.2 3.4-.17.27.05.6.37.54 2.1-.44 3.57-1.24 4.43-1.84.97.2 2 .3 3.17.3 5.52 0 10-3.86 10-8.6S17.52 3 12 3zm-4 9a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm4 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm4 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"/>' +
      '</svg>';
    btn.addEventListener('click', function () { toggle(); });
    return btn;
  }

  function buildTeaser() {
    var el = document.createElement('div');
    el.id = TEASER_ID;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', teaserText + '. Abrir asistente.');

    var avatar = document.createElement('div');
    avatar.className = 'cpiq-teaser-avatar';
    avatar.textContent = 'C';

    var text = document.createElement('div');
    text.className = 'cpiq-teaser-text';
    text.textContent = teaserText;

    el.appendChild(avatar);
    el.appendChild(text);

    if (teaserDismissible) {
      var close = document.createElement('button');
      close.type = 'button';
      close.className = 'cpiq-teaser-close';
      close.setAttribute('aria-label', 'Descartar mensaje');
      close.innerHTML =
        '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
        '<path d="M4.3 4.3a1 1 0 011.4 0L10 8.6l4.3-4.3a1 1 0 111.4 1.4L11.4 10l4.3 4.3a1 1 0 01-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 01-1.4-1.4L8.6 10 4.3 5.7a1 1 0 010-1.4z"/>' +
        '</svg>';
      close.addEventListener('click', function (e) {
        e.stopPropagation();
        dismissTeaser(true);
      });
      el.appendChild(close);
    }

    el.addEventListener('click', function () {
      emit('teaser-click', { clientId: clientId });
      hideTeaser(false);
      toggle(true);
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });

    return el;
  }

  function isTeaserDismissed() {
    if (!teaserDismissible) return false;
    try {
      var raw = window.localStorage.getItem(TEASER_STORAGE_KEY);
      if (!raw) return false;
      var entry = JSON.parse(raw);
      if (!entry || typeof entry.at !== 'number') return false;
      var maxAge = teaserDismissPersistDays * 24 * 60 * 60 * 1000;
      return Date.now() - entry.at < maxAge;
    } catch (_) {
      return false;
    }
  }

  function persistTeaserDismissal() {
    try {
      window.localStorage.setItem(
        TEASER_STORAGE_KEY,
        JSON.stringify({ at: Date.now(), v: version })
      );
    } catch (_) { /* noop */ }
  }

  var teaserState = { shown: false, autoHideTimer: null, showTimer: null };

  function showTeaser() {
    if (!teaserEnabled || state.open || teaserState.shown) return;
    var el = document.getElementById(TEASER_ID);
    if (!el) return;
    el.classList.add('cpiq-teaser-visible');
    teaserState.shown = true;
    emit('teaser-shown', { clientId: clientId });
    if (teaserAutoHideMs > 0) {
      clearTimeout(teaserState.autoHideTimer);
      teaserState.autoHideTimer = window.setTimeout(function () {
        hideTeaser(false);
      }, teaserAutoHideMs);
    }
  }

  function hideTeaser(persist) {
    var el = document.getElementById(TEASER_ID);
    clearTimeout(teaserState.autoHideTimer);
    clearTimeout(teaserState.showTimer);
    if (el) el.classList.remove('cpiq-teaser-visible');
    teaserState.shown = false;
    if (persist) persistTeaserDismissal();
  }

  function dismissTeaser(byUser) {
    hideTeaser(true);
    emit('teaser-dismissed', { byUser: !!byUser, clientId: clientId });
  }

  function buildIframe() {
    var ifr = document.createElement('iframe');
    ifr.id = IFR_ID;
    ifr.title = 'Asistente CPIQ';
    ifr.setAttribute('loading', 'lazy');
    ifr.setAttribute('allow', 'clipboard-write');
    ifr.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

    var params = new URLSearchParams({
      client: clientId,
      host: location.origin,
      v: version
    });
    ifr.src = widgetOrigin + '/?' + params.toString();
    return ifr;
  }

  var state = { open: false };

  function toggle(next) {
    var open = typeof next === 'boolean' ? next : !state.open;
    state.open = open;
    var ifr = document.getElementById(IFR_ID);
    var btn = document.getElementById(BTN_ID);
    if (ifr) ifr.classList.toggle('cpiq-open', open);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) hideTeaser(false);
    emit('toggle', { open: open });
  }

  function handleMessage(event) {
    if (event.origin !== widgetOrigin) return;
    var data = event.data;
    if (!data || typeof data !== 'object' || typeof data.type !== 'string') return;
    if (data.type.indexOf('cpiq:') !== 0) return;

    switch (data.type) {
      case 'cpiq:ready':
        emit('ready', { clientId: clientId });
        break;
      case 'cpiq:close':
        toggle(false);
        break;
      case 'cpiq:open':
        toggle(true);
        break;
      case 'cpiq:navigate':
        emit('navigate', {
          action: data.action,
          path: data.path,
          clientId: clientId
        });
        break;
      default:
        /* ignore unknown event types */
    }
  }

  function mount() {
    injectStyles();
    var btn = buildButton();
    var ifr = buildIframe();
    document.body.appendChild(btn);
    document.body.appendChild(ifr);

    if (teaserEnabled && !isTeaserDismissed()) {
      var teaser = buildTeaser();
      document.body.appendChild(teaser);
      teaserState.showTimer = window.setTimeout(showTeaser, teaserDelayMs);
    }

    window.addEventListener('message', handleMessage);
    emit('mounted', { clientId: clientId, version: version });
    if (cfg.autoOpen) toggle(true);
  }

  window.CPIQWidget = {
    open: function () { toggle(true); },
    close: function () { toggle(false); },
    toggle: function () { toggle(); },
    showTeaser: showTeaser,
    hideTeaser: function () { hideTeaser(false); },
    dismissTeaser: function () { dismissTeaser(false); },
    resetTeaser: function () {
      try { window.localStorage.removeItem(TEASER_STORAGE_KEY); } catch (_) { /* noop */ }
    },
    on: on,
    version: version,
    config: Object.freeze({
      widgetOrigin: widgetOrigin,
      position: position,
      primaryColor: primary,
      clientId: clientId,
      version: version,
      teaserText: teaserText,
      teaserEnabled: teaserEnabled
    })
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();

/*
 * dc-lite.js — a small, open runtime that plays Inkingi's .dc.html design files
 * in any browser, outside the design canvas.
 *
 * Supports what the mockups use: {{holes}}, <sc-if>, <sc-for>, <helmet>,
 * event handlers (onClick, onChange, ...), inline styles with holes, and a
 * `class Component extends DCLogic` script with state/setState.
 *
 * Usage:  DCLite.mount('design/Main.dc.html', document.getElementById('app'))
 */
(function () {
  'use strict';
  var h = React.createElement;

  // HTML parsing lowercases attribute names, so map them back to React names.
  var EVENTS = ['Click', 'DoubleClick', 'Change', 'Input', 'Submit', 'KeyDown', 'KeyUp', 'KeyPress',
    'Focus', 'Blur', 'MouseEnter', 'MouseLeave', 'MouseDown', 'MouseUp', 'MouseMove', 'MouseOver', 'MouseOut',
    'PointerDown', 'PointerUp', 'PointerMove', 'PointerEnter', 'PointerLeave', 'TouchStart', 'TouchEnd',
    'TouchMove', 'Scroll', 'Wheel', 'ContextMenu', 'Load', 'Error', 'AnimationEnd', 'TransitionEnd'];
  var ATTR = { 'class': 'className', 'for': 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly',
    maxlength: 'maxLength', minlength: 'minLength', autocomplete: 'autoComplete', autofocus: 'autoFocus',
    autoplay: 'autoPlay', colspan: 'colSpan', rowspan: 'rowSpan', contenteditable: 'contentEditable',
    crossorigin: 'crossOrigin', enterkeyhint: 'enterKeyHint', inputmode: 'inputMode', spellcheck: 'spellCheck',
    srcset: 'srcSet', novalidate: 'noValidate', playsinline: 'playsInline', datetime: 'dateTime',
    'xlink:href': 'xlinkHref', 'xml:space': 'xmlSpace' };
  EVENTS.forEach(function (e) { ATTR['on' + e.toLowerCase()] = 'on' + e; });
  var VOID = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, source: 1, track: 1, wbr: 1 };

  var HOLE = /\{\{\s*([^}]*?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]*?)\s*\}\}\s*$/;

  function lookup(path, scope) {
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    var m = /^(['"])(.*)\1$/.exec(path);
    if (m) return m[2];
    var parts = path.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }
  function str(v) { return v == null || v === false ? '' : String(v); }
  function interp(text, scope) {
    return text.replace(HOLE, function (_, p) { return str(lookup(p, scope)); });
  }
  function resolve(raw, scope) {
    var m = WHOLE.exec(raw);
    if (m) return lookup(m[1], scope);
    return raw.indexOf('{{') >= 0 ? interp(raw, scope) : raw;
  }
  function camel(prop) {
    if (prop.indexOf('--') === 0) return prop;
    return prop.replace(/^-ms-/, 'ms-').replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
  }
  function parseStyle(css) {
    var out = {};
    // split on ; that are not inside parentheses (url(), rgba(), etc.)
    var depth = 0, buf = '', parts = [];
    for (var i = 0; i < css.length; i++) {
      var c = css[i];
      if (c === '(') depth++; else if (c === ')') depth--;
      if (c === ';' && depth === 0) { parts.push(buf); buf = ''; } else buf += c;
    }
    parts.push(buf);
    parts.forEach(function (decl) {
      var k = decl.indexOf(':');
      if (k < 0) return;
      var name = decl.slice(0, k).trim(), val = decl.slice(k + 1).trim();
      if (name) out[camel(name)] = val;
    });
    return out;
  }

  function props(el, scope, key) {
    var p = { key: key };
    for (var i = 0; i < el.attributes.length; i++) {
      var a = el.attributes[i], name = a.name, raw = a.value;
      if (name.indexOf('hint-') === 0) continue;
      var val = resolve(raw, scope);
      if (name === 'style') { p.style = parseStyle(str(val)); continue; }
      var rn = ATTR[name] || name;
      if (el.namespaceURI === 'http://www.w3.org/2000/svg' && rn.indexOf('-') > 0 && !/^(aria|data)-/.test(rn)) rn = camel(rn);
      if (rn === 'value' && el.tagName.toLowerCase() === 'input' && !el.hasAttribute('onchange') && !el.hasAttribute('oninput')) {
        p.defaultValue = val; continue;
      }
      if (rn === 'checked' && !el.hasAttribute('onchange')) { p.defaultChecked = val === '' ? true : !!val; continue; }
      if (val === '' && /^(disabled|checked|selected|hidden|required|readOnly|autoFocus|multiple|open|controls|muted|loop|playsInline|noValidate)$/.test(rn)) val = true;
      p[rn] = val;
    }
    return p;
  }

  function kids(node, scope) {
    var out = [];
    var list = node.childNodes;
    for (var i = 0; i < list.length; i++) {
      var r = render(list[i], scope, i);
      if (r == null) continue;
      if (Array.isArray(r)) out.push.apply(out, r); else out.push(r);
    }
    return out;
  }

  function render(node, scope, key) {
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      return t.indexOf('{{') >= 0 ? interp(t, scope) : t;
    }
    if (node.nodeType !== 1) return null; // comments etc.
    var tag = node.tagName.toLowerCase();
    if (node.namespaceURI === 'http://www.w3.org/2000/svg') tag = node.tagName; // keep SVG case (e.g. linearGradient)
    if (tag === 'helmet' || tag === 'script') return null;
    if (tag === 'sc-if') {
      if (!resolve(node.getAttribute('value') || '', scope)) return null;
      return h(React.Fragment, { key: key }, kids(node, scope));
    }
    if (tag === 'sc-for') {
      var listVal = resolve(node.getAttribute('list') || '', scope) || [];
      var as = node.getAttribute('as') || 'item';
      return h(React.Fragment, { key: key }, listVal.map(function (item, idx) {
        var s = Object.create(scope);
        s[as] = item; s.$index = idx;
        return h(React.Fragment, { key: (item && item.id != null) ? item.id : idx }, kids(node, s));
      }));
    }
    if (tag === 'dc-import' || tag === 'x-import') {
      console.warn('[dc-lite] <' + tag + '> is not supported yet');
      return null;
    }
    var p = props(node, scope, key);
    if (VOID[tag]) return h(tag, p);
    if (tag === 'textarea') { p.defaultValue = p.defaultValue || node.textContent; return h(tag, p); }
    return h.apply(null, [tag, p].concat(kids(node, scope)));
  }

  // Base class the design scripts extend.
  function makeBase(template) {
    class DCLogic extends React.Component {
      constructor(p) { super(p); this.state = this.state || {}; }
      renderVals() { return {}; }
      render() {
        var vals = this.renderVals() || {};
        return h(React.Fragment, null, kids(template, vals));
      }
    }
    return DCLogic;
  }

  function injectHelmet(helmet, id) {
    if (!helmet || document.querySelector('[data-dc-helmet="' + id + '"]')) return;
    Array.prototype.forEach.call(helmet.children, function (el) {
      var copy = document.createElement(el.tagName.toLowerCase());
      for (var i = 0; i < el.attributes.length; i++) copy.setAttribute(el.attributes[i].name, el.attributes[i].value);
      copy.textContent = el.textContent;
      copy.setAttribute('data-dc-helmet', id);
      document.head.appendChild(copy);
    });
  }

  function load(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('Could not load ' + url + ' (' + r.status + ')');
      return r.text();
    }).then(function (text) {
      var doc = new DOMParser().parseFromString(text, 'text/html');
      var root = doc.querySelector('x-dc');
      if (!root) throw new Error(url + ' has no <x-dc> root');
      var helmet = root.querySelector('helmet');
      // Read the design props block, then remove nodes the renderer must not draw.
      var script = doc.querySelector('script[data-dc-script]');
      var meta = {};
      try { meta = JSON.parse(script.getAttribute('data-props') || '{}'); } catch (e) { /* ignore */ }
      if (helmet) helmet.parentNode.removeChild(helmet);
      var DCLogic = makeBase(root);
      var Component = new Function('DCLogic', 'React', script.textContent + '\n;return Component;')(DCLogic, React);
      var defaults = {};
      Object.keys(meta).forEach(function (k) { if (k[0] !== '$' && meta[k] && 'default' in meta[k]) defaults[k] = meta[k]['default']; });
      return { Component: Component, helmet: helmet, preview: meta.$preview || null, defaults: defaults, title: (doc.querySelector('title') || {}).textContent };
    });
  }

  function mount(url, el, extraProps) {
    return load(url).then(function (d) {
      injectHelmet(d.helmet, url);
      if (d.title && !document.title) document.title = d.title;
      var root = ReactDOM.createRoot(el);
      root.render(h(d.Component, Object.assign({}, d.defaults, extraProps || {})));
      return d;
    }).catch(function (err) {
      el.innerHTML = '<pre style="color:#ff8a80;padding:24px;white-space:pre-wrap;font:14px monospace">' +
        String(err && err.stack || err).replace(/</g, '&lt;') + '</pre>';
      throw err;
    });
  }

  window.DCLite = { load: load, mount: mount };
})();

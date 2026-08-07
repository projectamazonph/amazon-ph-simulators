/* ============================================================
   PROJECT AMAZON PH ACADEMY — SHARED SHELL JS
   - Highlights current tool in nav
   - Injects topbar + footer if not present
   - Applies unified skin (tokens + skin.css) to tool pages
   - Wraps tool body in .pha-skin-wrap
   ============================================================ */
(function () {
  'use strict';

  // Tool registry — single source of truth for nav
  var TOOLS = [
    { id: 'ad-console',    name: 'AdConsole Pro',   tag: 'Ad Operations',   file: 'ad-console.html' },
    { id: 'keyword-lab',   name: 'Keyword Lab',     tag: 'Keyword Research', file: 'keyword-lab.html' },
    { id: 'search-triage', name: 'Search Term Triage', tag: 'Triage',         file: 'search-triage.html' },
    { id: 'bulk-file',     name: 'Bulk File Simulator', tag: 'Bulk Ops',      file: 'bulk-file.html' },
    { id: 'listing',       name: 'BuyBox Dojo',     tag: 'Listing + PPC',    file: 'listing.html' },
    { id: 'pacing-deck',   name: 'Pacing Deck',     tag: 'Budget + Pacing',  file: 'pacing-deck.html' }
  ];

  // Detect which tool this page is (by filename or data attribute)
  function currentToolId() {
    var explicit = document.body.getAttribute('data-pha-tool');
    if (explicit) return explicit;
    var path = window.location.pathname.split('/').pop() || 'index.html';
    var match = TOOLS.find(function (t) { return t.file === path; });
    return match ? match.id : 'hub';
  }

  // Inject the unified design tokens + skin (if not already there)
  function injectSkin() {
    if (document.querySelector('link[data-pha-tokens]')) return;
    var head = document.head;
    var t = document.createElement('link');
    t.rel = 'stylesheet';
    t.href = 'assets/tokens.css';
    t.setAttribute('data-pha-tokens', '1');
    head.appendChild(t);
    var s = document.createElement('link');
    s.rel = 'stylesheet';
    s.href = 'assets/skin.css';
    s.setAttribute('data-pha-skin', '1');
    head.appendChild(s);
  }

  // Mark active nav link
  function markActive(currentId) {
    var links = document.querySelectorAll('.pha-nav a[data-pha-tool]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-pha-tool') === currentId) {
        links[i].classList.add('is-current');
        links[i].setAttribute('aria-current', 'page');
      }
    }
  }

  // Build nav links (skips if already in DOM)
  function buildNav(currentId) {
    var nav = document.querySelector('.pha-nav');
    if (!nav) return;
    // If nav is already populated by the page author, just mark active links
    if (nav.children.length > 0) {
      nav.dataset.phaBuilt = '1';
      return;
    }
    nav.dataset.phaBuilt = '1';
    // Don't link to the current page
    var toShow = TOOLS.filter(function (t) { return t.id !== currentId; });
    toShow.forEach(function (t) {
      var a = document.createElement('a');
      a.href = t.file;
      a.setAttribute('data-pha-tool', t.id);
      a.textContent = t.name;
      nav.appendChild(a);
    });
  }

  // Auto-inject topbar + footer if page didn't include them
  function ensureChrome() {
    if (!document.querySelector('.pha-topbar')) {
      var toolId = currentToolId();
      var tool = TOOLS.find(function (t) { return t.id === toolId; });
      var isHub = toolId === 'hub' || !tool;
      var toolName = isHub ? 'SimGrid' : tool.name;
      var toolTag = isHub ? 'Control Hub' : tool.tag;
      var bar = document.createElement('div');
      bar.className = 'pha-topbar';
      bar.setAttribute('role', 'banner');
      bar.innerHTML =
        '<a class="pha-back" href="index.html" aria-label="' + (isHub ? 'Home' : 'Back to Academy Hub') + '">' +
          '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 3 L5 8 L10 13" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '<span>' + (isHub ? 'Home' : 'Hub') + '</span>' +
        '</a>' +
        '<a class="pha-brand" href="index.html" aria-label="Project Amazon PH Academy home">' +
          '<div class="pha-brand-mark" aria-hidden="true">PH</div>' +
          '<div class="pha-brand-text"><b>Project Amazon PH</b><span>Academy · SimGrid</span></div>' +
        '</a>' +
        '<div class="pha-divider" aria-hidden="true"></div>' +
        '<div class="pha-tool-name">' +
          '<b>' + toolName + '</b>' +
          '<span class="pha-tag">' + toolTag + '</span>' +
        '</div>' +
        '<nav class="pha-nav" aria-label="Tool navigation"></nav>' +
        '<div class="pha-status" role="status" aria-label="Academy status: online"><span class="dot" aria-hidden="true"></span><span>Academy · online</span></div>';
      document.body.insertBefore(bar, document.body.firstChild);
    }
    if (!document.querySelector('.pha-footer')) {
      var f = document.createElement('footer');
      f.className = 'pha-footer';
      f.innerHTML =
        '<div><b>PROJECT AMAZON PH</b> &nbsp;·&nbsp; Academy SimGrid</div>' +
        '<div class="pha-foot-links">' +
          '<a href="index.html">Hub</a>' +
          TOOLS.map(function (t) { return '<a href="' + t.file + '">' + t.name + '</a>'; }).join('') +
        '</div>' +
        '<div class="pha-foot-meta">v1.0 · ' + (document.body.getAttribute('data-pha-tool') ? 'Tool module' : 'Control Hub') + '</div>';
      document.body.appendChild(f);
    }
  }

  // Apply pha-skin class to body (skips hub; hub has its own styles)
  function applySkin() {
    if (currentToolId() === 'hub') return;
    document.body.classList.add('pha-skin');
  }

  // Wrap the tool's body content (between topbar/footer) in .pha-skin-wrap
  function wrapContent() {
    if (currentToolId() === 'hub') return;
    if (document.querySelector('.pha-skin-wrap')) return;
    var topbar = document.querySelector('.pha-topbar');
    var footer = document.querySelector('.pha-footer');
    var before = topbar ? topbar.nextSibling : null;
    var after = footer || null;
    var wrap = document.createElement('div');
    wrap.className = 'pha-skin-wrap';
    // Move all children that are between topbar and footer into the wrap
    var node = before;
    var moved = [];
    while (node && node !== after) {
      moved.push(node);
      node = node.nextSibling;
    }
    if (moved.length === 0) {
      // No topbar/footer found — wrap whole body
      while (document.body.firstChild) {
        wrap.appendChild(document.body.firstChild);
      }
      document.body.appendChild(wrap);
    } else {
      moved.forEach(function (n) { wrap.appendChild(n); });
      // Insert wrap right after the topbar (or at start of body)
      if (topbar) topbar.parentNode.insertBefore(wrap, topbar.nextSibling);
      else document.body.insertBefore(wrap, document.body.firstChild);
    }
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectSkin();
      ensureChrome();
      applySkin();
      wrapContent();
      buildNav(currentToolId());
      markActive(currentToolId());
    });
  } else {
    injectSkin();
    ensureChrome();
    applySkin();
    wrapContent();
    buildNav(currentToolId());
    markActive(currentToolId());
  }
})();

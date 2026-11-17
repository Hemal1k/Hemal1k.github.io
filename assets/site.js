// The switch of the theme: Automatic (as the system) → Light → Dark, remembered in this browser. The head of each page
// sets the remembered one before anything is drawn (no flash of the other theme).
(function () {
  var KEY = 'hemi-theme', root = document.documentElement;
  var modes = ['auto', 'light', 'dark'];
  var names = { auto: 'Automatic', light: 'Light', dark: 'Dark' };
  var icons = {
    auto: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.8"/><path d="M8 2.2v11.6A5.8 5.8 0 018 2.2z" fill="currentColor"/></svg>',
    light: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M3.2 12.8l1.1-1.1M11.7 4.3l1.1-1.1"/></svg>',
    dark: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.6A5.8 5.8 0 016.4 2.5a5.8 5.8 0 107.1 7.1z"/></svg>'
  };
  var mode = 'auto';
  try { mode = localStorage.getItem(KEY) || 'auto'; } catch (e) {}
  if (modes.indexOf(mode) < 0) mode = 'auto';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-switch';
  function show() {
    if (mode === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', mode);
    btn.innerHTML = icons[mode] + '<span>' + names[mode] + '</span>';
    var next = modes[(modes.indexOf(mode) + 1) % 3];
    btn.title = 'Theme: ' + names[mode] + ' – click for ' + names[next];
    btn.setAttribute('aria-label', btn.title);
  }
  btn.addEventListener('click', function () {
    mode = modes[(modes.indexOf(mode) + 1) % 3];
    try { if (mode === 'auto') localStorage.removeItem(KEY); else localStorage.setItem(KEY, mode); } catch (e) {}
    show();
  });
  show();
  var nav = document.querySelector('.topbar nav');
  if (nav) nav.appendChild(btn); else { btn.classList.add('float'); document.body.appendChild(btn); }
})();

// The sections, cards and pictures come up softly when they are scrolled to (not with "reduce motion").
(function () {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('js');
  var items = document.querySelectorAll('main section h2, main section .sub, main .card, main .shot:not(.hero-shot), main table.req, main .prose > *');
  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(function (el) {
    // the cards of one grid one after another
    var grid = el.parentElement && el.parentElement.classList.contains('grid') ? el.parentElement : null;
    if (grid) el.style.setProperty('--d', (Array.prototype.indexOf.call(grid.children, el) % 6) * 0.07 + 's');
    el.classList.add('reveal');
    seen.observe(el);
  });
})();

// The latest version of each app, from its releases on GitHub (kept for an hour: a visit asks GitHub only once).
(function () {
  var els = document.querySelectorAll('[data-repo]');
  if (!els.length || !window.fetch) return;
  var KEY = 'hemi-versions-2', cache = {};
  try { cache = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  var fresh = cache.t && Date.now() - cache.t < 3600000;
  function show(repo) {
    var v = cache[repo];
    if (!v) return;
    document.querySelectorAll('[data-repo="' + repo + '"]').forEach(function (el) {
      el.textContent = 'v' + v.tag;
      el.title = 'Latest version';
      el.hidden = false;
    });
  }
  var repos = [];
  els.forEach(function (el) { if (repos.indexOf(el.dataset.repo) < 0) repos.push(el.dataset.repo); });
  repos.forEach(function (repo) {
    if (fresh && cache[repo]) return show(repo);
    fetch('https://api.github.com/repos/Hemal1k/' + repo + '/releases/latest')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && j.tag_name) {
          cache[repo] = { tag: j.tag_name.replace(/^v/i, '') };
          cache.t = Date.now();
          try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch (e) {}
        }
        show(repo);
      })
      .catch(function () { show(repo); });
  });
})();

// The sketches of the apps that need a script: HeMiPad types its file, HeMiDock types "volume" into its quick search.
// They start when they come on screen; with "reduce motion" they stay as they are drawn (all shown).
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function onScreen(el, start) {
    if (!('IntersectionObserver' in window)) { start(); return; }
    var o = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { o.disconnect(); start(); }
    }, { threshold: 0.25 });
    o.observe(el);
  }

  document.querySelectorAll('.sk-pad').forEach(function (pad) {
    var lines = [].slice.call(pad.querySelectorAll('.sk-code > span'));
    var pos = pad.querySelector('.sk-pos'), chars = pad.querySelector('.sk-chars');
    var lens = lines.map(function (l) { return l.textContent.length; });
    onScreen(pad, async function () {
      for (;;) {
        lines.forEach(function (l) { l.style.width = '0ch'; });
        var typed = 0;
        for (var i = 0; i < lines.length; i++) {
          var l = lines[i];
          l.classList.add('caret');
          // the indentation at once, the rest key by key
          var start = l.textContent.length - l.textContent.replace(/^ +/, '').length;
          for (var c = start; c <= lens[i]; c++) {
            l.style.width = c + 'ch';
            if (pos) pos.textContent = 'Ln ' + (i + 1) + ', Col ' + (c + 1);
            if (chars) chars.textContent = (typed + c) + ' characters';
            await wait(c === start ? 120 : 26 + Math.random() * 30);
          }
          typed += lens[i] + 1;
          l.classList.remove('caret');
        }
        lines[lines.length - 1].classList.add('caret');
        await wait(3500);
        lines[lines.length - 1].classList.remove('caret');
      }
    });
  });

  document.querySelectorAll('.sk-desk').forEach(function (desk) {
    var text = desk.querySelector('.sk-q-text'), val = desk.querySelector('.sk-qval');
    function set(cls, on) { desk.classList.toggle(cls, on); }
    onScreen(desk, async function () {
      for (;;) {
        set('open', false); set('found', false); set('set', false);
        await wait(1000);
        text.textContent = ''; val.textContent = '30';
        set('open', true);
        await wait(600);
        for (var ch of 'volume') { text.textContent += ch; await wait(120); }
        await wait(250);
        set('found', true);
        await wait(1200);
        set('set', true);
        for (var v = 30; v <= 75; v += 3) { val.textContent = String(v); await wait(70); }
        val.textContent = '75';
        await wait(2400);
        set('open', false);
        await wait(700);
      }
    });
  });

  // HeMimizer: the programs drawn as chosen are switched on one after another; the counts follow (drawn: all on)
  document.querySelectorAll('.sk-mz').forEach(function (mz) {
    var picks = [].slice.call(mz.querySelectorAll('.sk-choice.on'));
    var total = {};
    mz.querySelectorAll('[data-count]').forEach(function (el) {
      var m = el.textContent.match(/of (\d+)/);
      if (m) total[el.dataset.count] = m[1];
    });
    function count() {
      var all = 0, by = {};
      mz.querySelectorAll('.sk-choice.on').forEach(function (c) { all++; by[c.dataset.group] = (by[c.dataset.group] || 0) + 1; });
      mz.querySelectorAll('[data-count]').forEach(function (el) {
        var g = el.dataset.count, n = g === 'all' ? all : by[g] || 0;
        el.textContent = g === 'all' ? String(n) : n + ' of ' + total[g];
        el.classList.toggle('off', g !== 'all' && n === 0);
      });
    }
    onScreen(mz, async function () {
      for (;;) {
        picks.forEach(function (c) { c.classList.remove('on'); });
        count();
        await wait(900);
        for (var i = 0; i < picks.length; i++) { picks[i].classList.add('on'); count(); await wait(650); }
        await wait(3500);
      }
    });
  });
})();

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
  var KEY = 'hemi-versions', cache = {};
  try { cache = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  var fresh = cache.t && Date.now() - cache.t < 3600000;
  function date(d) {
    try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return String(d).slice(0, 10); }
  }
  function show(repo) {
    var v = cache[repo];
    if (!v) return;
    document.querySelectorAll('[data-repo="' + repo + '"]').forEach(function (el) {
      el.textContent = 'v' + v.tag + ' · ' + date(v.date);
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
          cache[repo] = { tag: j.tag_name.replace(/^v/i, ''), date: j.published_at };
          cache.t = Date.now();
          try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch (e) {}
        }
        show(repo);
      })
      .catch(function () { show(repo); });
  });
})();

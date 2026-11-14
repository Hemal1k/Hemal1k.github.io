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

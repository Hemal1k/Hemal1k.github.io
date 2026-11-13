// Czech or English: chosen before (kept in this browser), otherwise by the language of the browser.
(function () {
  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  var lang = saved || ((navigator.language || '').toLowerCase().indexOf('cs') === 0 || (navigator.language || '').toLowerCase().indexOf('sk') === 0 ? 'cs' : 'en');
  function apply(l) {
    document.documentElement.lang = l;
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.set === l ? 'true' : 'false'); });
    var t = document.querySelector('meta[name="title-' + l + '"]');
    if (t) document.title = t.content;
  }
  apply(lang);
  document.addEventListener('DOMContentLoaded', function () {
    apply(lang);
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.addEventListener('click', function () {
        lang = b.dataset.set;
        try { localStorage.setItem('lang', lang); } catch (e) {}
        apply(lang);
      });
    });
  });
})();

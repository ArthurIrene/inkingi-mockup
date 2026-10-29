/* Reads the version from design/canvas.json (the canvas title note, e.g. "Home v28 · makers & workshops")
   and fills every element marked data-version="short" (v28) or data-version="full" (v28 · makers & workshops). */
(function () {
  fetch('design/canvas.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (c) {
    var note = (c.notes && c.notes.t1 && c.notes.t1.text) || '';
    var m = /v(\d+)/.exec(note);
    if (!m) return;
    var short = 'v' + m[1];
    var rest = note.split('·').slice(1).join('·').trim();
    document.querySelectorAll('[data-version]').forEach(function (el) {
      el.textContent = el.getAttribute('data-version') === 'full' && rest ? short + ' · ' + rest : short;
      el.hidden = false;
    });
  }).catch(function () {});
})();

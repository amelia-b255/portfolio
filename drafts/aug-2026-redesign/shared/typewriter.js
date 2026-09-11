/* Typewriter + fade for section headings on scroll-in.
   - Scrolling DOWN into a heading types it out (every time, not just once).
   - Scrolling UP into a heading just fades it in with full text (no retype).
   - Leaving the viewport cancels any in-flight typing; the page's existing
     .will-animate.visible transition handles the fade in/out.
   Types the heading text AND its texture data-text in sync so the concrete
   overlay (shared/texture.css) types too.
   Vine-aware: on the homepage each heading's text is wrapped in a .vine-head
   span that also holds the flanking orchid-vine canvases. We type the leading
   text node (so the canvases survive) and let the inline-block .vine-head hug
   the typed text — the flanking vines simply spread outward as the title types,
   and the centred texture ghost stays aligned. Reversible: remove this include. */
(function () {
  var SPEED = 70; // ms per character

  var st = document.createElement('style');
  st.textContent = 'section h2.will-animate{transform:none !important;filter:none !important;transition:opacity 0.7s ease !important;}';
  document.head.appendChild(st);

  // the element that directly holds the heading's text node: the .vine-head
  // wrapper when present (homepage), else the h2 itself (other pages)
  function holderOf(h) { return h.querySelector(':scope > .vine-head') || h; }
  function leadTextNode(holder) {
    var tn = holder.firstChild;
    if (!tn || tn.nodeType !== 3) { tn = document.createTextNode(''); holder.insertBefore(tn, holder.firstChild); }
    return tn;
  }
  function setText(h, s) {
    leadTextNode(holderOf(h)).nodeValue = s;          // keeps any element children (vine canvases)
    if (h.hasAttribute('data-text')) h.setAttribute('data-text', s);
  }

  function init() {
    var heads = [].slice.call(document.querySelectorAll('section h2'));
    function fill(h) { var f = h.getAttribute('data-full'); if (f) setText(h, f); }

    heads.forEach(function (h) {
      var full = (h.textContent || '').replace(/\s+/g, ' ').trim();
      if (!full) return;
      h.setAttribute('data-full', full);
      setText(h, '');
    });
    if (!('IntersectionObserver' in window)) { heads.forEach(fill); return; }

    // track scroll direction so we can retype on the way down but not on the way up
    var lastY = window.pageYOffset, dir = 'down';
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset;
      if (y !== lastY) dir = y > lastY ? 'down' : 'up';
      lastY = y;
    }, { passive: true });

    function typeIt(h) {
      var full = h.getAttribute('data-full');
      var gen = (h.__gen = (h.__gen || 0) + 1);
      var i = 0;
      setText(h, '');
      (function step() {
        if (h.__gen !== gen) return; // cancelled (left viewport) or superseded
        i++;
        setText(h, full.slice(0, i));
        if (i < full.length) setTimeout(step, SPEED);
      })();
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var h = e.target;
        if (e.isIntersecting) {
          if (h.__inView) return;
          h.__inView = true;
          if (dir === 'down') typeIt(h); else fill(h);
        } else {
          h.__inView = false;
          h.__gen = (h.__gen || 0) + 1; // cancel in-flight typing; keep text for the fade-out
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    heads.forEach(function (h) { if (h.getAttribute('data-full')) io.observe(h); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* Give headings + descriptions a data-text copy so the texture-overlay
   duplicate (::before in texture.css) can render the same letters. */
(function () {
  function apply() {
    document.querySelectorAll('.hero-content h1, section h2, .hero-content p, section > p, .back-button')
      .forEach(function (e) {
        if (!e.hasAttribute('data-text')) e.setAttribute('data-text', (e.textContent || '').trim());
      });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();

/* Lightbox with AB watermark overlay */
(function() {
  // Inject styles
  var css = document.createElement('style');
  css.textContent = `
    .ab-lightbox-overlay {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(0,0,0,0.85);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.3s ease;
      cursor: pointer;
    }
    .ab-lightbox-overlay.active { opacity: 1; }
    .ab-lightbox-wrap {
      position: relative;
      max-width: 90vw; max-height: 90vh;
    }
    .ab-lightbox-wrap img.ab-lightbox-img {
      max-width: 90vw; max-height: 90vh;
      object-fit: contain;
      border-radius: 10px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      display: block;
    }
    .ab-lightbox-watermark {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 30%;
      min-width: 120px;
      max-width: 300px;
      opacity: 0.65;
      pointer-events: none;
      filter: drop-shadow(0 0 8px rgba(0,0,0,0.4));
    }
    .ab-lightbox-close {
      position: fixed; top: 20px; right: 30px;
      color: #fff; font-size: 36px;
      font-family: Arial, sans-serif;
      cursor: pointer; z-index: 10001;
      opacity: 0.7; transition: opacity 0.2s;
      line-height: 1;
    }
    .ab-lightbox-close:hover { opacity: 1; }
  `;
  document.head.appendChild(css);

  // Create overlay
  var overlay = document.createElement('div');
  overlay.className = 'ab-lightbox-overlay';
  overlay.innerHTML = `
    <span class="ab-lightbox-close">&times;</span>
    <div class="ab-lightbox-wrap">
      <img class="ab-lightbox-img" src="" alt="">
      <img class="ab-lightbox-watermark" src="AB logo.png" alt="">
    </div>
  `;
  document.body.appendChild(overlay);

  var lbImg = overlay.querySelector('.ab-lightbox-img');

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    overlay.style.display = 'flex';
    requestAnimationFrame(function() {
      overlay.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    setTimeout(function() {
      overlay.style.display = 'none';
      lbImg.src = '';
    }, 300);
    document.body.style.overflow = '';
  }

  overlay.style.display = 'none';

  // Close on overlay click
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay || e.target.classList.contains('ab-lightbox-close')) {
      closeLightbox();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeLightbox();
  });

  // Intercept image links
  var imgExts = /\.(jpg|jpeg|png|gif|webp)$/i;
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a');
    if (link && imgExts.test(link.getAttribute('href'))) {
      e.preventDefault();
      openLightbox(link.href, link.querySelector('img') ? link.querySelector('img').alt : '');
    }
  });

  /* ── Image download protection ── */

  // Disable right-click on all images
  document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG' || e.target.closest('.ab-lightbox-overlay')) {
      e.preventDefault();
    }
  });

  // Disable image dragging
  document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });

  // Block Ctrl+S / Cmd+S save page
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
    }
  });

  // Prevent long-press saving on mobile
  var protectCss = document.createElement('style');
  protectCss.textContent = `
    img {
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }
  `;
  document.head.appendChild(protectCss);
})();

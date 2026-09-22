/* "about this site" — an ! button beside the lightbulb opening a scrollable
   popup. Styled after the original tip box, but tall content that scrolls
   inside the box rather than a couple of lines. Self-contained (injects its
   own styles, button and markup) so every page picks it up with one tag. */
(function(){
  if(document.getElementById('about-site-btn')) return;

  var css=document.createElement('style');
  css.textContent=
  '#about-site-btn{'+
    'background:none;border:1px solid var(--accent);cursor:pointer;'+
    'width:19px;height:19px;border-radius:50%;flex:0 0 auto;'+
    'display:inline-flex;align-items:center;justify-content:center;'+
    'font-family:\'Space Mono\',monospace;font-weight:700;font-size:11px;line-height:1;'+
    'color:var(--accent);padding:0;margin-left:-7px;'+
    'align-self:center;position:relative;top:3px;'+
    'transition:transform 0.25s ease,background 0.25s ease,color 0.25s ease;}'+
  '#about-site-btn:hover{transform:scale(1.14);background:var(--accent);color:var(--cream);}'+
  /* the bulb carries a 26px right margin to hold itself off the nav links; with
     the ! sitting between them that margin pushed it away from the bulb and up
     against "work". Zero it and let the nav's own gap space all three evenly. */
  'nav #themeToggle{margin-right:0 !important;}'+
  '@media (max-width:600px){#about-site-btn{width:17px;height:17px;font-size:10px;margin-left:0;}}'+
  /* home button — phone only, where there is no visible nav list to get back from */
  '#home-btn{'+
    'background:none;border:none;cursor:pointer;flex:0 0 auto;'+
    'display:none;align-items:center;justify-content:center;'+
    'color:var(--accent);padding:0;margin-left:0;'+
    'align-self:center;position:relative;top:3px;'+
    /* The lightbulb artwork carries ~23% transparent padding on its right, so
       the drawn bulb stops well short of its box and the house looked pushed
       right. Nudge it back optically with a transform, which leaves the ! and
       everything after it exactly where they are. */
    'transform:translateX(-7px);'+
    'transition:transform 0.25s ease;}'+
  '#home-btn svg{width:17px;height:17px;display:block;fill:currentColor;}'+
  '#home-btn:hover{transform:translateX(-7px) scale(1.14);}'+
  '@media (max-width:600px){#home-btn{transform:translateX(-3px);}'+
    '#home-btn:hover{transform:translateX(-3px) scale(1.14);}}'+
  '@media (max-width:820px){#home-btn{display:inline-flex;}}'+
  /* the phone nav sets the bulb to 34px — a touch bigger than that */
  '@media (max-width:600px){nav .bulb .lb{height:39px;}}'+
  '@media (max-width:600px){#home-btn svg{width:16px;height:16px;}#home-btn{top:2px;}}'+
  '#about-overlay{'+
    'position:fixed;inset:0;z-index:10000;'+
    'display:flex;align-items:center;justify-content:center;padding:24px;'+
    'background:rgba(20,10,8,0.72);'+
    'opacity:0;pointer-events:none;transition:opacity 0.4s ease;}'+
  '#about-overlay.open{opacity:1;pointer-events:auto;}'+
  '#about-box{'+
    'position:relative;display:flex;flex-direction:column;'+
    'width:min(620px,92vw);max-height:min(78vh,720px);'+
    'background:var(--cream);border:1px solid var(--hair);'+
    'box-shadow:14px 14px 40px rgba(0,0,0,0.35);'+
    'padding:30px 6px 24px 30px;}'+
  '#about-close{'+
    'position:absolute;top:4px;right:12px;background:none;border:none;cursor:pointer;'+
    'color:var(--accent);font-family:\'Space Mono\',monospace;font-size:22px;line-height:1;padding:6px;z-index:2;}'+
  '#about-box .tip-h{text-align:left;margin-bottom:4px;padding-right:30px;}'+
  /* the body is what scrolls — the heading and close stay put */
  '#about-body{'+
    'overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;'+
    'padding:10px 24px 4px 0;margin-top:6px;}'+
  '#about-body h4{'+
    'font-family:\'Space Mono\',monospace;font-weight:700;'+
    'font-size:10.5px;letter-spacing:0.24em;text-transform:uppercase;'+
    'color:var(--accent);margin:20px 0 8px;}'+
  '#about-body h4:first-child{margin-top:0;}'+
  '#about-body p{'+
    'font-size:11.5px;letter-spacing:0.05em;line-height:1.85;color:var(--ink);margin-bottom:10px;}'+
  '#about-body ul{list-style:none;margin:0 0 6px;padding:0;}'+
  '#about-body li{'+
    'font-size:11.5px;letter-spacing:0.05em;line-height:1.8;color:var(--ink);'+
    'position:relative;padding-left:16px;margin-bottom:10px;}'+
  '#about-body li::before{content:"\\2022";position:absolute;left:0;color:var(--accent);}'+
  '#about-body b{color:var(--ink);font-weight:700;}'+
  '@media (max-width:600px){'+
    '#about-box{padding:26px 4px 20px 20px;max-height:82vh;}'+
    '#about-body{padding-right:18px;}'+
    '#about-btn-wrap{margin-left:10px;}}';
  document.head.appendChild(css);

  var HTML=
  '<h3 class="tip-h">about this site</h3>'+
  '<div id="about-body">'+
    '<h4>About my site</h4>'+
    '<p>My portfolio website is 100% vibecoded by Claude AI. However, all artworks, colours, '+
    'symbols and UI/UX design are my own. This website has taken many months to build and get '+
    'to the point it is at right now, all ideas and design aspects of the site were created by me.</p>'+

    '<h4>Interactions</h4>'+
    '<p>I wanted my website to be unique not only to my own design style, but also in comparison '+
    'to other vibecoded websites. One of my ideas was to add interactive elements for a more '+
    'unique, interesting user experience. The interactions are as listed below;</p>'+
    '<ul>'+
      '<li><b>Font changes:</b> the title &lsquo;Amelia Bobbin&rsquo; will cycle through different '+
      'fonts either by swiping with two fingers across a mousepad, pressing the space bar, or '+
      'clicking the text (on the desktop version, for a smaller screen version like a phone or '+
      'iPad, the fonts will change by tapping on them).</li>'+
      '<li><b>Light/Dark mode:</b> The lightbulb symbol at the top of the page will change the '+
      'colour scheme of the whole site between light and dark. Refreshing will set it back to '+
      'default (light). Switching also replays the orchids growing and the text typing itself out.</li>'+
      '<li><b>Subtle mouse cursor trail</b> inspired from my other creative computing projects.</li>'+
      '<li><b>Stack and gallery views:</b> every collection of work can be flipped between a stacked '+
      'deck, where pieces sit one behind the other, and a gallery wall showing everything at once. '+
      'I was inspired by Pinterest&rsquo;s image layout for the gallery view. '+
      'Switching one section switches them all, so you can read the whole site whichever way you prefer.</li>'+
      '<li><b>Moving through a deck:</b> the arrows either side, a two-finger swipe on a trackpad, '+
      'a swipe on a touchscreen, or the arrow keys and space bar. It loops, so you can keep going '+
      'round forever in either direction.</li>'+
      '<li><b>Full screen:</b> click or tap any piece to open it full screen, then use the arrows, '+
      'arrow keys or a swipe to move between pieces in that section. Escape, the &times;, or a click '+
      'outside closes it.</li>'+
      '<li><b>Videos:</b> on the phone, press and hold the left or right edge of a playing video to '+
      'run it at 2&times; speed &mdash; the middle stays a plain tap to play or pause &mdash; and drag '+
      'the bar along the bottom to scrub through. I was inspired by Instagram reels and TikTok videos '+
      'for this.</li>'+
      '<li><b>Downloadable fonts:</b> the typography page has the typefaces I drew by hand, previewed '+
      'in their own letterforms and free to download.</li>'+
    '</ul>'+

    '<h4>Phone and desktop are built differently</h4>'+
    '<p>I wanted the site to be easily accessible across devices, so the phone version is not just a '+
    'shrunken desktop one &mdash; whole components are rebuilt so each device gets something that '+
    'actually suits it. For the phone version I was inspired by other social media platforms like '+
    'Instagram for the post and carousel feel. iPads get their own in-between treatment, and are '+
    'identified by touch rather than screen size, since an iPad can report the same width as a laptop.</p>'+
    '<ul>'+
      '<li>Decks become full-width carousels you swipe through, with page dots instead of arrows.</li>'+
      '<li>Galleries become a two-column version of that same wall.</li>'+
      '<li>Videos become a TikTok-style player: no control bar, just tap, hold and drag.</li>'+
      '<li>Captions reveal themselves as you scroll past, since there is no cursor to hover with.</li>'+
      '<li>The navigation collapses into a full-screen drawer.</li>'+
      '<li>The orchid vines are left off small screens to keep them quick to load.</li>'+
    '</ul>'+

    '<h4>Symbols and decorations</h4>'+
    '<ul>'+
      '<li>All social media symbols and icons were drawn by me on Adobe Illustrator</li>'+
      '<li>Orchid decorations were inspired by orchid cybersigilism tattoos</li>'+
      '<li>Texture overlays to make website look more &lsquo;artistic&rsquo;</li>'+
      '<li>A paper grain over the whole page and a concrete texture inside the headings, so the type '+
      'looks printed rather than flat</li>'+
      '<li>Small drifting stars in the background, and my own logo and monogram throughout</li>'+
    '</ul>'+

    '<h4>Animations</h4>'+
    '<ul>'+
      '<li>Orchid swirl pattern grows/reverse grows when you scroll</li>'+
      '<li>Typing animation for headers and description text</li>'+
      '<li>Hover cursor animation</li>'+
      '<li>Sections fade and rise into place as you scroll down to them</li>'+
      '<li>Buttons fill with colour in a sweep when you hover or tap them</li>'+
      '<li>A scrolling banner of announcements across the top of every page</li>'+
      '<li>Artwork lifts slightly and its caption fades in when you hover over it</li>'+
    '</ul>'+
  '</div>';

  var ov=document.createElement('div');
  ov.id='about-overlay'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true');
  ov.innerHTML='<div id="about-box"><button id="about-close" aria-label="Close">&times;</button>'+HTML+'</div>';
  document.body.appendChild(ov);

  var btn=document.createElement('button');
  btn.id='about-site-btn'; btn.type='button';
  btn.setAttribute('aria-label','About this site');
  btn.title='about this site';
  btn.textContent='!';

  /* sit it beside the lightbulb; fall back to the end of the nav */
  var bulb=document.getElementById('themeToggle');
  if(bulb&&bulb.parentNode) bulb.parentNode.insertBefore(btn, bulb.nextSibling);
  else { var nav=document.querySelector('nav'); if(nav) nav.appendChild(btn); else return; }

  /* home, sitting with the bulb and the ! — only shown on the phone/tablet
     nav, where the links are behind the hamburger */
  if(!/(^|\/)index\.html$/.test(location.pathname) || true){
    var home=document.createElement('a');
    home.id='home-btn'; home.href='index.html';
    home.setAttribute('aria-label','Home'); home.title='home';
    home.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+
      '<path d="M12 3.1 4.4 11.4a1 1 0 0 0 .7 1.68h1.5V20.3a1 1 0 0 0 1 1h8.8a1 1 0 0 0 1-1'+
      'v-7.22h1.5a1 1 0 0 0 .7-1.68z"/></svg>';
    /* between the bulb and the !, rather than out past it */
    if(btn.parentNode) btn.parentNode.insertBefore(home, btn);
  }

  function open(){
    ov.classList.add('open');
    document.body.style.overflow='hidden';
    document.getElementById('about-body').scrollTop=0;
  }
  function close(){ ov.classList.remove('open'); document.body.style.overflow=''; }
  btn.addEventListener('click',open);
  document.getElementById('about-close').addEventListener('click',close);
  ov.addEventListener('click',function(e){ if(e.target===ov) close(); });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&ov.classList.contains('open')) close();
  });
})();

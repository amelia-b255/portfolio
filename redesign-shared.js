/* redesign sub-pages — shared behaviour.
   Mirrors redesign.html: light on every load, marquee, typed kicker,
   scroll-in reveals; plus the sub-page lightbox and demo loaders. */

/* ── lightbulb theme toggle ──
   The choice follows you from page to page, but a refresh starts fresh in
   light mode. The <head> snippet applies the stored class before first paint;
   this only wires the bulb and records what you pick. ── */
(function(){
  var html=document.documentElement;
  var btn=document.getElementById('themeToggle');
  if(btn) btn.addEventListener('click',function(){
    html.classList.toggle('dark');
    try{ sessionStorage.setItem('rd-theme', html.classList.contains('dark')?'dark':'light'); }catch(e){}
    if(window.__retype) window.__retype.forEach(function(f){ f(); });
    if(window.__vines) window.__vines.forEach(function(f){ f(); });
    if(window.RD_SYNC_BAR) window.RD_SYNC_BAR();   /* status-bar strip follows the banner */
    window.TRAIL_RGB=getComputedStyle(html).getPropertyValue('--trail').trim();
    var t=document.getElementById('ptitle');
    if(t){ t.classList.remove('name-anim'); void t.offsetWidth; t.classList.add('name-anim'); }
  });
})();

/* ── marquee (same announcement as the homepage banner) ── */
(function(){
  var el=document.getElementById('marq'); if(!el) return;
  var seg='<span>new artworks — posters &amp; print</span><span class="red">graphic design</span>';
  el.innerHTML=seg;
  var reps=1;
  while(el.getBoundingClientRect().width < window.innerWidth && reps<12){
    reps++; el.innerHTML=Array(reps+1).join(seg);
  }
  el.innerHTML=el.innerHTML+el.innerHTML;
  var SPEED=26;
  el.style.animationDuration=((el.getBoundingClientRect().width/2)/SPEED).toFixed(1)+'s';
})();

/* ── kicker typewriter — text comes from data-kicker on the element ── */
(function(){
  var el=document.getElementById('kick-text'); if(!el) return;
  var full=el.getAttribute('data-kicker')||'';
  var gen=0;
  function run(){
    var g=++gen, i=0;
    (function step(){
      if(g!==gen) return;
      i++;
      el.innerHTML=full.slice(0,i).replace(/^(\d\d)/,'<b>$1</b>');
      if(i<full.length) setTimeout(step,55);
    })();
  }
  run();
  (window.__retype=window.__retype||[]).push(run);
})();

/* ── scroll-in reveals ── */
(function(){
  var els=[].slice.call(document.querySelectorAll('.rise'));
  if(!('IntersectionObserver' in window)){ els.forEach(function(e){e.classList.add('visible');}); return; }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('visible'); io.unobserve(en.target); } });
  },{threshold:0.08});
  function arm(){ els.forEach(function(e){ io.observe(e); }); }
  arm();
  /* a reload restored from the back-forward cache keeps every element already
     marked visible, so nothing animates — clear and re-arm them */
  window.RD_REPLAY=function(){
    els.forEach(function(e){ e.classList.remove('visible'); io.unobserve(e); });
    void document.body.offsetWidth;
    arm();
  };
})();

/* ── a refresh replays the page from the top, on every device ──
   Browsers restore the old scroll position on reload, so anything already
   past would never animate again; and iOS restores from the back-forward
   cache without re-running any of this. Both are handled here. ── */
(function(){
  try{ if('scrollRestoration' in history) history.scrollRestoration='manual'; }catch(e){}
  window.addEventListener('pageshow',function(ev){
    var nav=(performance.getEntriesByType('navigation')[0]||{}).type;
    if(!ev.persisted && nav!=='reload' && nav!=='back_forward') return;
    try{ window.scrollTo(0,0); }catch(e){}
    if(window.RD_REPLAY) window.RD_REPLAY();
    if(window.__retype) window.__retype.forEach(function(f){ f(); });
  });
})();

/* ── lightbox: click any gallery/feature image for fullscreen,
      arrows / swipe to step through that gallery (kept from the original) ── */
(function(){
  var lb=document.getElementById('lightbox'); if(!lb) return;
  var im=lb.querySelector('img'), cap=lb.querySelector('.lb-cap');
  var group=[], idx=0;
  function show(i){
    idx=(i+group.length)%group.length;
    var g=group[idx];
    im.src=g.src; im.alt=g.alt||'';
    cap.textContent=g.cap||'';
    lb.querySelector('.lb-prev').style.display=group.length>1?'':'none';
    lb.querySelector('.lb-next').style.display=group.length>1?'':'none';
  }
  function openFrom(fig){
    var scope=fig.closest('.gallery')||fig;
    var figs=scope.classList&&scope.classList.contains('gallery')
      ? [].slice.call(scope.querySelectorAll('figure')).filter(function(f){
          return !f.classList.contains('g-break');
        })
      : [fig];
    group=figs.map(function(f){
      var img=f.querySelector('img');
      var t=f.querySelector('figcaption .t'), d=f.querySelector('figcaption .d');
      var cap=t?t.textContent.trim():img.alt;
      if(d&&d.textContent.trim()) cap+=' — '+d.textContent.trim();
      return {src:img.currentSrc||img.src, alt:img.alt, cap:cap};
    });
    show(figs.indexOf(fig));
    lb.classList.add('open');
    document.body.style.overflow='hidden';
  }
  function close(){ lb.classList.remove('open'); document.body.style.overflow=''; im.src=''; }
  document.addEventListener('click',function(e){
    if(!e.target.closest) return;
    /* never open the viewer from a control that happens to sit over a card */
    if(e.target.closest('.viewtoggle, .stack-nav, .stack-ui, .stack-cap button')) return;
    if(e.target.closest('.vidfig')) return;          /* video cards play in place */
    var fig=e.target.closest('.gallery figure, figure.feature');
    if(fig){ openFrom(fig); return; }
  });
  /* the stack's caption block is outside the deck — clicking it opens the
     front card, matching the original where the whole card is the link */
  document.addEventListener('click',function(e){
    var cap=e.target.closest&&e.target.closest('.stack-cap');
    if(!cap) return;
    if(e.target.closest('a')) return;      /* let caption links do their job */
    if(cap.previousElementSibling&&cap.previousElementSibling.querySelector('.vidgal')) return;
    var scene=cap.previousElementSibling;
    var gal=scene&&scene.querySelector?scene.querySelector('.gallery'):null;
    if(!gal) return;
    var f=[].slice.call(gal.querySelectorAll('figure')).find(function(x){
      return x.style.zIndex==String(gal.querySelectorAll('figure').length);
    });
    if(f) openFrom(f);
  });
  lb.addEventListener('click',function(e){
    if(e.target===lb||e.target===im) { if(e.target===lb) close(); }
  });
  lb.querySelector('.lb-x').addEventListener('click',close);
  lb.querySelector('.lb-prev').addEventListener('click',function(){ show(idx-1); });
  lb.querySelector('.lb-next').addEventListener('click',function(){ show(idx+1); });
  document.addEventListener('keydown',function(e){
    if(!lb.classList.contains('open')) return;
    if(e.key==='Escape'){ close(); return; }
    if(e.key==='ArrowLeft'){ e.preventDefault(); show(idx-1); }
    else if(e.key==='ArrowRight'||e.code==='Space'){ e.preventDefault(); show(idx+1); }
  });
  /* trackpad swipe in fullscreen, same feel as the deck */
  var lacc=0, lcool=0;
  lb.addEventListener('wheel',function(e){
    if(!lb.classList.contains('open')) return;
    if(Math.abs(e.deltaX)<=Math.abs(e.deltaY)) return;
    e.preventDefault();
    var now=performance.now();
    if(now<lcool) return;
    lacc+=e.deltaX;
    if(Math.abs(lacc)>60){ show(idx+(lacc>0?1:-1)); lacc=0; lcool=now+600; }
  },{passive:false});
  /* swipe */
  var tx=0;
  lb.addEventListener('touchstart',function(e){ tx=e.touches[0].clientX; },{passive:true});
  lb.addEventListener('touchend',function(e){
    var dx=e.changedTouches[0].clientX-tx;
    if(Math.abs(dx)>44) show(idx+(dx<0?1:-1));
  },{passive:true});
})();

/* ── coding demos: iframe loads only when asked for ── */
(function(){
  [].slice.call(document.querySelectorAll('.demo-cover')).forEach(function(btn){
    btn.addEventListener('click',function(){
      var slot=btn.closest('.demo-slot');
      var f=document.createElement('iframe');
      f.src=btn.getAttribute('data-src');
      var allow=btn.getAttribute('data-allow');
      if(allow) f.setAttribute('allow',allow);
      slot.appendChild(f);
      btn.remove();
    });
  });

  /* "view code" pulls the sketch straight out of the project's own file,
     the same way the original page does it */
  [].slice.call(document.querySelectorAll('.code-btn')).forEach(function(btn){
    var panel=document.getElementById(btn.getAttribute('data-panel'));
    var loaded=false;
    btn.addEventListener('click',function(){
      var open=panel.classList.toggle('open');
      btn.classList.toggle('on',open);
      btn.textContent=open?'hide code':'view code';
      if(!open||loaded) return;
      loaded=true;
      var el=panel.querySelector('code');
      el.textContent='loading code…';
      fetch(btn.getAttribute('data-src')).then(function(r){ return r.text(); }).then(function(t){
        var m=t.match(/<script>([\s\S]*?)<\/script>/);
        el.textContent=(m?m[1]:t).trim();
      }).catch(function(){
        el.textContent='Could not load code.';
      });
    });
  });
})();

/* ── stack / gallery view toggle, from the original site.
      Stack view is a real deck between two arrows: click them, swipe the
      trackpad sideways, or use ← / → / space. Gallery view is the
      original's 4-column masonry. ── */
(function(){
  var SVG_STACK='<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="15.5" width="20" height="3" rx="1.5"/><rect x="2" y="10.5" width="20" height="3" rx="1.5" opacity="0.55"/><rect x="2" y="5.5" width="20" height="3" rx="1.5" opacity="0.25"/></svg>';
  var SVG_GRID='<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>';
  var ROTS=[0,-6,4,-5,5,-2,6,-4,3,-5,4];   /* the original's fan angles */
  var decks=[], setters=[];
  /* The toggle is page-wide, and switching changes every section's height —
     which would slide the page under you. Anchor on the toggle you clicked:
     note where it sits in the viewport, switch, then scroll by the difference
     so it stays exactly where it was. */
  function setAllModes(m, anchor){
    var before = anchor ? anchor.getBoundingClientRect().top : null;
    setters.forEach(function(fn){ fn(m); });
    if(before===null) return;
    var apply=function(){
      var after=anchor.getBoundingClientRect().top;
      var diff=after-before;
      /* the page sets scroll-behavior:smooth for anchor links — this
         correction must be instant, or it animates and overshoots */
      if(Math.abs(diff)>1){
        try{ window.scrollBy({top:diff,left:0,behavior:'instant'}); }
        catch(e){
          var prev=document.documentElement.style.scrollBehavior;
          document.documentElement.style.scrollBehavior='auto';
          window.scrollBy(0,diff);
          document.documentElement.style.scrollBehavior=prev;
        }
      }
    };
    /* Re-apply as late-loading images change heights underneath us, but stop
       the moment the reader scrolls themselves so we never fight them. */
    var expected=null;
    var settle=function(){
      if(expected!==null && Math.abs(window.scrollY-expected)>2) return;  /* user took over */
      apply();
      expected=window.scrollY;
    };
    settle();
    requestAnimationFrame(settle);
    [120,320,600].forEach(function(ms){ setTimeout(settle,ms); });
  }

  [].slice.call(document.querySelectorAll('.gallery')).forEach(function(gal){
    if(gal.classList.contains('icons')) return;           /* icon grid stays a grid */
    var figs=[].slice.call(gal.querySelectorAll('figure')).filter(function(f){
      return !f.classList.contains('g-break');
    });
    var n=figs.length;
    if(n<2) return;
    var front=0;

    var tog=document.createElement('div');
    tog.className='viewtoggle';
    tog.innerHTML='<button type="button" class="active" data-v="stack">'+SVG_STACK+' stack</button>'
                 +'<button type="button" data-v="gallery">'+SVG_GRID+' gallery</button>';
    gal.parentNode.insertBefore(tog,gal);

    /* deck sits between its two arrows */
    var scene=document.createElement('div');
    scene.className='stack-scene';
    gal.parentNode.insertBefore(scene,gal);
    var prev=document.createElement('button');
    prev.type='button'; prev.className='stack-nav sp';
    prev.setAttribute('aria-label','Previous'); prev.textContent='‹';
    var next=document.createElement('button');
    next.type='button'; next.className='stack-nav sn';
    next.setAttribute('aria-label','Next'); next.textContent='›';
    scene.appendChild(prev); scene.appendChild(gal); scene.appendChild(next);

    var cap=document.createElement('div');
    cap.className='stack-cap';
    cap.innerHTML='<b class="t"></b><span class="d"></span>';
    scene.parentNode.insertBefore(cap,scene.nextSibling);

    var ui=document.createElement('div');
    ui.className='stack-ui';
    ui.innerHTML='<span class="cnt"></span>';
    cap.parentNode.insertBefore(ui,cap.nextSibling);
    var cnt=ui.querySelector('.cnt');
    var sec=gal.closest('.sec');
    var yearEl=sec?sec.querySelector('.secyear'):null;

    function update(){
      var wide=!window.matchMedia('(max-width: 820px)').matches;
      figs.forEach(function(f,i){
        var pos=(i-front+n)%n;
        var rot=ROTS[Math.min(pos,ROTS.length-1)];
        var landscape=f.getAttribute('data-orient')==='landscape';
        var boost=landscape?(wide?1.35:1.18):1;
        /* a boosted landscape card is wider than a phone — cap it so the deck
           never pushes the page sideways */
        boost=Math.min(boost,(window.innerWidth-44)/340);
        if(boost<1) boost=Math.max(boost,(window.innerWidth-16)/340);
        var scale=(1-Math.min(pos,5)*0.03)*boost;
        f.style.transform='rotate('+rot+'deg) scale('+scale+')';
        f.style.zIndex=n-pos;
        f.style.filter=pos===0?'drop-shadow(20px 20px 40px rgba(0,0,0,0.32))':'none';
        f.style.opacity=pos<5?1:0;
        f.style.pointerEvents=pos===0?'auto':'none';
      });
      var fc=figs[front];
      var st=fc.querySelector('figcaption .t'), sd=fc.querySelector('figcaption .d');
      cap.querySelector('.t').textContent=st?st.textContent:'';
      /* innerHTML so an award link inside a description survives as a link */
      cap.querySelector('.d').innerHTML=sd?sd.innerHTML:'';
      cnt.textContent=(front+1)+' / '+n;
      /* the section's year follows the card you're on, falling back to its own */
      if(yearEl) yearEl.textContent=fc.getAttribute('data-year')||yearEl.getAttribute('data-default')||'';
    }
    function show(i){ front=(i+n)%n; update(); }

    /* CSS columns balance greedily, so a short gallery can leave its last
       column empty — the container stays centred but the artwork sits off to
       the left. Narrow the box to the columns actually used so the block
       centres, keeping the card width identical to the original's 264.5px. */
    /* Flex rows centre themselves, including the last partial row, so no
       column fitting is needed any more. Kept as a no-op hook for the
       resize/load listeners. */
    function fitColumns(){ return; }
    function _unusedFitColumns(){
      if(gal.classList.contains('stack-mode')) return;
      gal.style.columnCount=''; gal.style.maxWidth='';
      if(!figs.length) return;
      var gap=parseFloat(getComputedStyle(gal).columnGap)||14;
      var natural=parseInt(getComputedStyle(gal).columnCount,10)||4;
      var cardW=figs[0].getBoundingClientRect().width;
      if(!cardW) return;
      function apply(n){
        gal.style.columnCount=n;
        gal.style.maxWidth=(n*cardW+(n-1)*gap)+'px';
      }
      /* a gallery never needs more columns than it has pieces */
      var target=Math.min(natural,figs.length);
      apply(target);
      /* Only trust a measured under-fill once every image has real height —
         before that the cards are zero-tall and all pile into one column. */
      var ready=[].slice.call(gal.querySelectorAll('img')).every(function(im){
        return im.complete && im.naturalWidth>0;
      });
      if(!ready) return;
      for(var pass=0;pass<3;pass++){
        var used={},count=0;
        figs.forEach(function(f){
          var x=Math.round(f.getBoundingClientRect().left);
          if(!used[x]){ used[x]=1; count++; }
        });
        if(count>=target) break;
        target=count; apply(target);
      }
    }

    function setMode(m){
      var stack=(m==='stack');
      gal.classList.toggle('stack-mode',stack);
      scene.classList.toggle('is-stack',stack);
      cap.style.display=stack?'':'none';
      ui.style.display=stack?'':'none';
      [].slice.call(tog.children).forEach(function(b){
        b.classList.toggle('active', b.getAttribute('data-v')===m);
      });
      if(stack){
        gal.style.columnCount=''; gal.style.maxWidth='';
        update();
      } else {
        figs.forEach(function(f){
          f.style.transform=''; f.style.zIndex=''; f.style.filter='';
          f.style.opacity=''; f.style.pointerEvents='';
        });
        if(yearEl) yearEl.textContent=yearEl.getAttribute('data-default')||yearEl.textContent;
        fitColumns();
      }
    }

    tog.addEventListener('click',function(e){
      var b=e.target.closest('button');
      if(b) setAllModes(b.getAttribute('data-v'), tog);   /* whole page, anchored here */
    });
    setters.push(setMode);
    prev.addEventListener('click',function(){ show(front-1); });
    next.addEventListener('click',function(){ show(front+1); });

    /* touch swipe */
    var tx=0;
    scene.addEventListener('touchstart',function(e){ tx=e.touches[0].clientX; },{passive:true});
    scene.addEventListener('touchend',function(e){
      if(!gal.classList.contains('stack-mode')) return;
      var dx=e.changedTouches[0].clientX-tx;
      if(Math.abs(dx)>44) show(front+(dx<0?1:-1));
    },{passive:true});

    /* two-finger trackpad swipe: accumulate horizontal delta, one step per
       deliberate swipe, then hold off so the momentum tail is ignored */
    var acc=0, cool=0;
    scene.addEventListener('wheel',function(e){
      if(!gal.classList.contains('stack-mode')) return;
      if(Math.abs(e.deltaX)<=Math.abs(e.deltaY)) return;   /* let vertical scroll through */
      e.preventDefault();
      var now=performance.now();
      if(now<cool) return;
      acc+=e.deltaX;
      if(Math.abs(acc)>60){ show(front+(acc>0?1:-1)); acc=0; cool=now+600; }
    },{passive:false});

    window.addEventListener('resize',function(){
      if(gal.classList.contains('stack-mode')) update(); else fitColumns();
    });
    /* images arrive after layout, so re-fit once they have real heights */
    [].slice.call(gal.querySelectorAll('img')).forEach(function(im){
      if(!im.complete) im.addEventListener('load',fitColumns,{once:true});
    });

    decks.push({scene:scene, gal:gal, step:function(d){ show(front+d); }});
    setMode('stack');   /* the original defaults to stack view */
  });

  /* ← / → / space drive whichever deck is nearest the middle of the screen */
  window.__deckStep=function(d){
    var best=null,bestDist=Infinity;
    decks.forEach(function(k){
      if(!k.gal.classList.contains('stack-mode')) return;
      var r=k.scene.getBoundingClientRect();
      if(r.bottom<0||r.top>window.innerHeight) return;     /* off screen */
      var dist=Math.abs((r.top+r.height/2)-window.innerHeight/2);
      if(dist<bestDist){ bestDist=dist; best=k; }
    });
    if(best){ best.step(d); return true; }
    return false;
  };
  document.addEventListener('keydown',function(e){
    var lb=document.getElementById('lightbox');
    if(lb&&lb.classList.contains('open')) return;          /* lightbox has its own keys */
    var tag=(document.activeElement&&document.activeElement.tagName)||'';
    if(tag==='INPUT'||tag==='TEXTAREA') return;
    var d=0;
    if(e.key==='ArrowLeft') d=-1;
    else if(e.key==='ArrowRight'||e.code==='Space') d=1;
    else return;
    if(window.__deckStep(d)) e.preventDefault();
  });
})();

/* ── deter casual image saving ──
   Blocks right-click, drag and long-press on artwork. This is a speed bump,
   not protection: a screenshot or the browser's network tab still gets the
   file. Nothing here can change that. */
(function(){
  function isArt(el){
    return el && el.closest && el.closest('.gallery figure, figure.feature, .cv-fig, .lightbox, .bcards');
  }
  document.addEventListener('contextmenu',function(e){
    if(e.target.tagName==='IMG'||isArt(e.target)) e.preventDefault();
  });
  document.addEventListener('dragstart',function(e){
    if(e.target.tagName==='IMG') e.preventDefault();
  });
  /* long-press on touch devices opens the same save sheet */
  document.addEventListener('touchstart',function(e){
    if(isArt(e.target)) e.target.style.webkitTouchCallout='none';
  },{passive:true});
})();

/* ── the original's tip popup: shows once on load, dismissed with × ──
   On the coding page it waits for the hero typing to finish, scrolls down to
   the first "open fullscreen" button and pulses it while the tip is up, then
   returns to the top of the page when the tip is dismissed. ── */
(function(){
  var o=document.getElementById('tip-overlay'); if(!o) return;
  var sw=o.querySelector('#tip-swipe-section');
  /* the swipe half only makes sense on touch-ish widths, as in the original */
  if(sw && !window.matchMedia('(max-width:1380px)').matches) sw.style.display='none';

  /* the coding page's demos are the tip's whole subject — point at them */
  var fsBtn=document.querySelector('.demo-actions a[target="_blank"]');
  var delay=900;
  if(fsBtn){
    /* the kicker types at 55ms a character; let it land, then breathe 1s */
    var k=document.getElementById('kick-text');
    var chars=k?(k.getAttribute('data-kicker')||'').length:0;
    delay=chars*55+300;   /* land just as the typing finishes */
  }
  setTimeout(function(){
    o.classList.add('tip-visible');
    if(fsBtn){
      fsBtn.classList.add('tip-target');
      var y=fsBtn.getBoundingClientRect().top+window.pageYOffset-window.innerHeight*0.72;
      window.scrollTo({top:Math.max(0,y),behavior:'smooth'});
    }
  }, delay);
  function dismiss(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    o.classList.remove('tip-visible');
    setTimeout(function(){ o.style.display='none'; }, 700);
    if(fsBtn){
      fsBtn.classList.remove('tip-target');
      window.scrollTo({top:0,behavior:'smooth'});
    }
  }
  o.querySelector('#tip-close').addEventListener('click',dismiss);
  o.addEventListener('click',function(e){ if(e.target===o) dismiss(e); });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&o.classList.contains('tip-visible')) dismiss();
  });
})();

/* ── phone menu: the original's hamburger behaviour — ☰ opens the drawer,
   turns into ×, closes on a link tap, an outside tap, or Escape ── */
(function(){
  var btn=document.getElementById('menuToggle');
  var ul=document.querySelector('nav ul');
  if(!btn||!ul) return;
  function set(open){
    ul.classList.toggle('open',open);
    btn.textContent=open?'\u00d7':'\u2630';
    btn.setAttribute('aria-expanded',open?'true':'false');
    document.body.style.overflow=open?'hidden':'';
  }
  btn.addEventListener('click',function(e){ e.stopPropagation(); set(!ul.classList.contains('open')); });
  ul.addEventListener('click',function(e){ if(e.target.closest('a')) set(false); });
  document.addEventListener('click',function(e){
    if(!ul.classList.contains('open')) return;
    if(e.target.closest('nav')) return;
    set(false);
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&ul.classList.contains('open')) set(false);
  });
})();

/* ── iPad: a tap plays the caption reveal and still opens the image; a
      press-and-hold plays it and swallows the click, so you can read a card
      without it going fullscreen. Phones keep their scroll-reveal only. ── */
(function(){
  function isPad(){ return !!window.RD_TOUCH && window.innerWidth>600; }
  var HOLD=350, timer=null, held=false, suppressUntil=0, holdFig=null;
  document.addEventListener('touchstart',function(e){
    if(!isPad()||!e.target.closest) return;
    var fig=e.target.closest('.gallery:not(.stack-mode) figure');
    if(!fig) return;
    fig.classList.add('scroll-active');          /* a plain tap shows it too */
    held=false; holdFig=fig;
    clearTimeout(timer);
    timer=setTimeout(function(){ held=true; }, HOLD);
  },{passive:true,capture:true});
  document.addEventListener('touchmove',function(){ clearTimeout(timer); },{passive:true,capture:true});
  document.addEventListener('touchend',function(){
    clearTimeout(timer);
    if(held&&holdFig){
      /* the click lands a moment after the release — swallow that one */
      suppressUntil=Date.now()+900;
      var f=holdFig;
      setTimeout(function(){ f.classList.remove('scroll-active'); },2200);
    }
    held=false;
  },{passive:true,capture:true});
  document.addEventListener('touchcancel',function(){
    clearTimeout(timer);
    if(holdFig) holdFig.classList.remove('scroll-active');
  },{passive:true,capture:true});
  /* swallow the click the held card would otherwise fire at the lightbox */
  document.addEventListener('click',function(e){
    if(Date.now()>suppressUntil) return;
    if(holdFig&&e.target.closest&&e.target.closest('figure')===holdFig){
      e.preventDefault(); e.stopPropagation(); suppressUntil=0;
    }
  },true);
})();

/* ── scroll-reveal captions on touch devices ──
   Ported from the original: with no pointer to hover, the card closest to the
   reading line gets .scroll-active and shows its caption. Fast flicks clear
   everything so captions do not strobe past. ── */
(function(){
  /* phones only — an iPad reveals a card by tapping or holding it instead */
  var mq = window.matchMedia('(max-width: 600px)');
  var hideTimer=null, settleTimer=null, ticking=false, lastY=window.scrollY;

  function cards(){
    return [].slice.call(document.querySelectorAll('.gallery:not(.stack-mode) figure'));
  }
  function clearAll(){
    document.querySelectorAll('.scroll-active').forEach(function(c){ c.classList.remove('scroll-active'); });
  }
  function update(){
    if(!mq.matches){ clearAll(); return; }
    var list=cards();
    if(!list.length){ clearAll(); return; }
    var vh=window.innerHeight, focal=vh*0.42, cx=window.innerWidth/2;
    var best=null, bestDist=Infinity;
    list.forEach(function(c){
      var r=c.getBoundingClientRect();
      if(r.bottom < vh*0.08 || r.top > vh*0.92) return;
      /* stagger the right-hand column so the pair does not both win */
      var stag=(r.left > cx-20)? r.height*0.55 : 0;
      var d=Math.abs((r.top+r.height/2+stag)-focal);
      if(d<bestDist){ bestDist=d; best=c; }
    });
    list.forEach(function(c){ c.classList.toggle('scroll-active', c===best); });
    if(best){
      if(hideTimer) clearTimeout(hideTimer);
      hideTimer=setTimeout(clearAll,500);   /* the original's timing */
    } else clearAll();
  }
  function onScroll(){
    var y=window.scrollY, v=Math.abs(y-lastY); lastY=y;
    if(hideTimer) clearTimeout(hideTimer);
    if(settleTimer) clearTimeout(settleTimer);
    settleTimer=setTimeout(update,120);
    if(v>50){ clearAll(); return; }         /* flicking — do not strobe */
    if(!ticking){ requestAnimationFrame(function(){ update(); ticking=false; }); ticking=true; }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll, {passive:true});
  document.addEventListener('click', function(e){
    if(e.target.closest('.viewtoggle')) setTimeout(update,300);
  }, true);
  setTimeout(update, 400);
})();

/* ── a playing video hides its own caption, so the overlay never sits over
      the picture once you have pressed play ── */
(function(){
  document.addEventListener('play',function(e){
    var f=e.target.closest&&e.target.closest('.vidgal figure');
    if(f) f.classList.add('playing');
  },true);
  ['pause','ended'].forEach(function(ev){
    document.addEventListener(ev,function(e){
      var f=e.target.closest&&e.target.closest('.vidgal figure');
      if(f) f.classList.remove('playing');
    },true);
  });
})();

/* ── phone: carry an orphaned portrait past the full-width landscape ──
   A landscape poster takes a whole row, so the portraits before it can end on
   an odd count and leave one stranded beside empty space mid-section. This
   walks each gallery, and when a run of portraits is odd, moves its last card
   down to join the next run — so the only short row is the last one. Nothing
   is resized and nothing else moves. ── */
(function(){
  var mq=window.matchMedia('(max-width: 600px)');
  function isFull(f){
    return f.getAttribute('data-orient')==='landscape' || f.classList.contains('g-wide');
  }
  function fix(gal){
    var figs=[].slice.call(gal.querySelectorAll(':scope > figure'));
    figs.forEach(function(f){ f.style.order=''; });
    if(!mq.matches) return;
    if(gal.classList.contains('stack-mode')||gal.classList.contains('vidgal')
       ||gal.classList.contains('icons')||gal.classList.contains('masonry')
       ||gal.classList.contains('mag-grid')) return;
    if(getComputedStyle(gal).display!=='flex') return;
    /* only where a landscape actually spans the row */
    var spans=figs.filter(isFull);
    if(!spans.length || spans[0].offsetWidth < gal.clientWidth*0.8) return;

    var runs=[], cur=[];
    figs.forEach(function(f){
      if(isFull(f)){ runs.push(cur); runs.push([f]); cur=[]; }
      else cur.push(f);
    });
    runs.push(cur);
    /* carry each odd run's last card forward into the next portrait run */
    for(var i=0;i<runs.length-1;i++){
      var r=runs[i];
      if(!r.length || isFull(r[0]) || r.length%2===0) continue;
      for(var j=i+1;j<runs.length;j++){
        if(runs[j].length && !isFull(runs[j][0])){ runs[j].unshift(r.pop()); break; }
      }
    }
    var n=1;
    runs.forEach(function(r){ r.forEach(function(f){ f.style.order=n++; }); });
  }
  function all(){ [].slice.call(document.querySelectorAll('.gallery')).forEach(fix); }
  window.addEventListener('resize',function(){ clearTimeout(window.__orphanT); window.__orphanT=setTimeout(all,150); });
  document.addEventListener('click',function(e){
    if(e.target.closest&&e.target.closest('.viewtoggle')) setTimeout(all,80);
  },true);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',all);
  else all();
  setTimeout(all,500);
})();

/* ── phone masonry for the mixed-height sections ──
   CSS columns fill top-to-bottom, one column at a time, so a card lands in
   whichever column the browser reaches — not under the card it follows. This
   does the packing by hand: each card goes into whichever column is currently
   shorter (reading order preserved), then the list is re-emitted column-major
   with an explicit break so the browser reproduces that exact split. Result:
   no holes, and a card sits directly under the one it followed. Phone only. ── */
(function(){
  var mq=window.matchMedia('(max-width: 600px)');
  var gals=[].slice.call(document.querySelectorAll('.gallery.masonry'));
  if(!gals.length) return;
  gals.forEach(function(g){ g.__orig=[].slice.call(g.children); });

  function reset(g){
    g.__orig.forEach(function(n){ n.style.breakBefore=''; g.appendChild(n); });
  }
  function pack(g){
    reset(g);
    if(!mq.matches) return;
    var seq=g.__orig.slice();
    /* the campaign photos read portraits first, then the shorter landscapes */
    if(g.classList.contains('flow')){
      seq.sort(function(a,b){                       /* sort is stable */
        return (a.getAttribute('data-orient')==='landscape'?1:0)
             - (b.getAttribute('data-orient')==='landscape'?1:0);
      });
      seq.forEach(function(n){ g.appendChild(n); });
    }
    /* every image must have a real height or the split is computed off stale
       numbers — bail and let the retries below pick it up once they load */
    var imgs=[].slice.call(g.querySelectorAll('img'));
    if(imgs.some(function(i){ return !i.complete || !i.naturalWidth; })) return;
    var rowGap=parseFloat(getComputedStyle(seq[0]).marginBottom)||8;
    var colA=[], colB=[], hA=0, hB=0;
    seq.forEach(function(n){
      var h=n.offsetHeight;
      if(!h) return;
      if(hA<=hB){ colA.push(n); hA+=h+rowGap; } else { colB.push(n); hB+=h+rowGap; }
    });
    if(!colA.length || !colB.length) return;
    /* greedy can leave a long tail if the last card is tall — hand the tail
       card back and forth while that shortens the ragged bottom */
    for(var pass=0;pass<4;pass++){
      var tall=(hA>hB)?colA:colB, shortc=(hA>hB)?colB:colA;
      if(tall.length<2) break;
      var h=tall[tall.length-1].offsetHeight+rowGap;
      var before=Math.abs(hA-hB), after=Math.abs((hA>hB?hA-h:hA+h)-(hA>hB?hB+h:hB-h));
      if(after>=before) break;
      shortc.push(tall.pop());
      if(hA>hB){ hA-=h; hB+=h; } else { hB-=h; hA+=h; }
    }
    colA.concat(colB).forEach(function(n){ n.style.breakBefore=''; g.appendChild(n); });
    /* a forced break sets the split; balancing then sizes the two columns.
       Never pin an explicit height with column-fill:auto — if the guess is
       short the overflow spills into extra columns off the side of the page. */
    colB[0].style.breakBefore='column';
  }
  function all(){ gals.forEach(pack); }
  window.addEventListener('resize',function(){ clearTimeout(window.__mT); window.__mT=setTimeout(all,150); });
  window.addEventListener('load',all);
  /* re-pack as each image resolves */
  [].slice.call(document.querySelectorAll('.gallery.masonry img')).forEach(function(i){
    i.addEventListener('load',function(){ clearTimeout(window.__mT); window.__mT=setTimeout(all,80); });
  });
  document.addEventListener('click',function(e){
    if(e.target.closest&&e.target.closest('.viewtoggle')) setTimeout(all,120);
  },true);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',all);
  else all();
  [400,1200,2500].forEach(function(ms){ setTimeout(all,ms); });   /* images arriving late */
})();

/* ── touch: CTA buttons play their sweep-fill, then follow through ──
   Driven from touchend rather than click: iOS spends the first tap applying
   the button's hover state and only clicks on the second, which is why the
   buttons needed pressing twice. Handling the touch directly means one tap
   always works — sweep first, then navigate (or submit). ── */
(function(){
  if(!window.RD_TOUCH && !window.matchMedia('(hover: none)').matches) return;
  var sx=0, sy=0, busy=false;
  document.addEventListener('touchstart',function(e){
    if(!e.target.closest||!e.target.closest('.cta')) return;
    var t=e.touches[0]; sx=t.clientX; sy=t.clientY;
  },{passive:true,capture:true});
  document.addEventListener('touchend',function(e){
    var b=e.target.closest&&e.target.closest('.cta');
    if(!b||busy) return;
    var t=e.changedTouches[0];
    if(Math.abs(t.clientX-sx)>10||Math.abs(t.clientY-sy)>10) return;  /* a drag, not a tap */
    e.preventDefault();                    /* no synthesized hover-then-click */
    busy=true;
    b.classList.add('cta-run');
    setTimeout(function(){
      if(b.tagName==='A' && b.getAttribute('href')) window.location=b.getAttribute('href');
      else if(b.form && b.form.requestSubmit) b.form.requestSubmit(b);
      else b.click();
      setTimeout(function(){ b.classList.remove('cta-run'); busy=false; },900);
    },520);
  },{passive:false,capture:true});
})();

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
  var seg='<span>new — download my fonts</span><span class="red">graphic design</span>';
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
    if(window.__deckReset) window.__deckReset();
    /* nothing should still be playing, or half played, from last time */
    [].slice.call(document.querySelectorAll('video')).forEach(function(v){
      try{ v.pause(); v.currentTime=0; }catch(e){}
    });
    [].slice.call(document.querySelectorAll('.ph-bar i')).forEach(function(f){ f.style.width='0'; });
    [].slice.call(document.querySelectorAll('.ph-feed')).forEach(function(f){ f.scrollTop=0; });
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
          return !f.classList.contains('g-break') && !f.classList.contains('ph-clone');
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

  /* A phone gets a different stack view entirely: images become an Instagram
     -style snap carousel, videos a TikTok-style vertical feed. Everything from
     601px up keeps the fanned deck exactly as it was. */
  function isPhone(){ return window.matchMedia('(max-width: 600px)').matches; }

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
      if(isPhone()){
        /* the carousel and the feed lay themselves out in CSS — the deck's
           inline transforms would fight the scroller, so clear them */
        figs.forEach(function(f){
          f.style.transform=''; f.style.zIndex=''; f.style.filter='';
          f.style.opacity=''; f.style.pointerEvents='';
        });
        paintCaption(); syncDots(); warm();
        return;
      }
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
      paintCaption();
    }
    /* pull in the cards on either side before you reach them — with lazy
       loading alone a swipe lands on a blank card while the file downloads */
    function warm(){
      for(var k=-2;k<=2;k++){
        var f=figs[(front+k+n)%n];
        if(!f) continue;
        [].slice.call(f.querySelectorAll('img')).forEach(function(im){
          if(im.__warm) return; im.__warm=1;
          im.loading='eager';
          if(im.decode) im.decode().catch(function(){});
        });
      }
    }
    function paintCaption(){
      var fc=figs[front];
      var st=fc.querySelector('figcaption .t'), sd=fc.querySelector('figcaption .d');
      cap.querySelector('.t').textContent=st?st.textContent:'';
      /* innerHTML so an award link inside a description survives as a link */
      cap.querySelector('.d').innerHTML=sd?sd.innerHTML:'';
      cnt.textContent=(front+1)+' / '+n;
      /* the section's year follows the card you're on, falling back to its own */
      if(yearEl) yearEl.textContent=fc.getAttribute('data-year')||yearEl.getAttribute('data-default')||'';
    }

    /* ── phone carousel: page dots, and the caption follows the scroll ── */
    var dots=null, strip=null;
    var DOT_STEP=13;          /* 6px dot + 7px gap */
    var DOT_WIN=7;            /* how many are on screen at once */
    function buildDots(){
      if(dots) return;
      dots=document.createElement('div');
      dots.className='ph-dots';
      strip=document.createElement('div');
      strip.className='strip';
      for(var i=0;i<n;i++){
        var d=document.createElement('i');
        d.setAttribute('data-i',i);
        strip.appendChild(d);
      }
      dots.appendChild(strip);
      dots.addEventListener('click',function(e){
        var t=e.target.closest('i'); if(!t) return;
        show(parseInt(t.getAttribute('data-i'),10));
      });
      /* a long gallery keeps its counter as well — seven dots cannot carry
         "where am I" across thirty-odd pieces on their own */
      ui.classList.toggle('many', n>DOT_WIN);
      ui.insertBefore(dots, ui.firstChild);
    }
    function syncDots(){
      if(!dots) return;
      var kids=[].slice.call(strip.children);
      if(n<=DOT_WIN){
        /* fewer dots than the window holds: shrink the window to fit them, or
           margin:auto centres an 84px box with the dots hugging its left edge */
        dots.style.width='auto';
        strip.style.transform='';
        kids.forEach(function(d,i){
          d.className=(i===front?'on':'');
        });
        return;
      }
      /* slide the strip so the current dot stays near the middle, shrinking
         the two at the edges — the way Instagram fades its overflow dots */
      dots.style.width='';
      var half=Math.floor(DOT_WIN/2);
      var anchor=Math.min(Math.max(front,half), n-1-half);
      strip.style.transform='translateX('+(-(anchor-half)*DOT_STEP)+'px)';
      kids.forEach(function(d,i){
        var rel=i-(anchor-half);
        var cls=[];
        if(rel<0||rel>DOT_WIN-1) cls.push('hid');
        else if(rel===0||rel===DOT_WIN-1) cls.push('sm');
        if(i===front) cls.push('on');
        d.className=cls.join(' ');
      });
    }
    /* ── looping ──
       A copy of the last card sits before the first and a copy of the first
       sits after the last. Settle on a copy and we jump to the real card it
       stands for, with snapping switched off for that one frame so the browser
       does not animate the correction. The seam is invisible because the copy
       and its original are the same picture. */
    var cloneHead=null, cloneTail=null;
    /* positioned — the carousel has been parked on its starting card. Until it
       has, the natural scrollLeft of 0 sits on the LEADING CLONE, and letting
       the wrap correction run from there threw the strip to its far end (which
       is why a gallery opened on its LAST piece instead of its first).
       seamHold — a programmatic cross-seam glide is in flight, so the wrap
       correction must keep its hands off until it lands. */
    var positioned=false, seamHold=false, userTouched=false;
    function buildLoop(){
      if(cloneHead||n<2) return;
      cloneHead=figs[n-1].cloneNode(true);
      cloneTail=figs[0].cloneNode(true);
      [cloneHead,cloneTail].forEach(function(c){
        c.classList.add('ph-clone');
        c.setAttribute('aria-hidden','true');
        c.removeAttribute('data-year');
        [].slice.call(c.querySelectorAll('img')).forEach(function(im){ im.loading='eager'; });
      });
      gal.insertBefore(cloneHead, gal.firstChild);
      gal.appendChild(cloneTail);
    }
    function dropLoop(){
      [cloneHead,cloneTail].forEach(function(c){ if(c&&c.parentNode) c.parentNode.removeChild(c); });
      cloneHead=cloneTail=null;
    }
    function jumpTo(i){
      front=(i+n)%n;
      var f=figs[front];
      /* an instant scrollTo lands exactly on a snap point, so snapping never
         has to be switched off — the old version turned it off for a frame and
         restored it on rAF, and any missed frame left the carousel free
         scrolling with no snap at all */
      try{ gal.scrollTo({left:f.offsetLeft-(gal.clientWidth-f.offsetWidth)/2,behavior:'instant'}); }
      catch(e){ gal.scrollLeft=f.offsetLeft-(gal.clientWidth-f.offsetWidth)/2; }
      gal.style.scrollSnapType='';        /* clear any stuck override */
      positioned=true;
      paintCaption(); syncDots(); warm();
    }
    /* Park on the real card rather than the clone that precedes it.
       This used to fire only from a standing start (scrollLeft < 4) and so lost
       a race: one scroll event while resting on the leading clone let the wrap
       correction teleport the strip to its far end first, and from there the
       guard could never fire again — the gallery simply stayed on its last
       piece. Now it holds the start position however the scroll got moved,
       until the reader actually touches it. */
    function ensureStart(){
      if(!cloneHead||!gal.classList.contains('ph-carousel')) return;
      if(userTouched) return;
      var f=figs[front]; if(!f||!f.offsetWidth) return;
      var want=f.offsetLeft-(gal.clientWidth-f.offsetWidth)/2;
      if(Math.abs(gal.scrollLeft-want)>2) jumpTo(front);
      else positioned=true;
    }
    /* True infinite scroll. The moment the scroll passes the last real card we
       subtract one strip width, and the moment it passes the first we add one.
       Because a copy of the last card sits before the first and a copy of the
       first sits after the last, the pixels either side of the seam are
       identical — so the correction is invisible even mid-swipe, and you can
       keep going round in either direction forever. Waiting for the scroll to
       settle before correcting, as this used to, is what made it read as a
       rewind rather than a loop. */
    var wrapping=false;
    function wrapIfPastEnd(){
      if(!cloneHead||wrapping||n<2) return;
      /* never before the carousel has been parked, and never while a cross-seam
         glide is running: in both cases the scroll is mid-flight, and correcting
         it then is exactly what landed the reader on the wrong card */
      if(!positioned||seamHold) return;
      var W=figs[0].offsetWidth||gal.clientWidth;
      var first=figs[0].offsetLeft, last=figs[n-1].offsetLeft;
      var strip=last-first+W;                        /* the real cards' width */
      var sl=gal.scrollLeft;
      /* The thresholds sit a FULL card beyond the real range — on the copies
         themselves. Anything closer overlaps: correcting a scroll just past
         the last card lands it just before the first, which immediately trips
         the other correction and throws it back. That ping-pong pinned the
         scroll and is why it looked like the carousel stopped at the last
         card. A copy is a whole snap position, so landing on one and
         correcting from it is still seamless — it holds the same picture. */
      if(sl>=last+W-2){ wrapping=true; gal.scrollLeft=sl-strip; wrapping=false; }
      else if(sl<=first-W+2){ wrapping=true; gal.scrollLeft=sl+strip; wrapping=false; }
    }

    /* which card is nearest the middle of the scroller */
    function nearestCard(){
      var mid=gal.scrollLeft+gal.clientWidth/2, best=0, bd=Infinity;
      figs.forEach(function(f,i){
        var c=f.offsetLeft+f.offsetWidth/2;
        var d=Math.abs(c-mid);
        if(d<bd){ bd=d; best=i; }
      });
      return best;
    }
    var scrollTick=null;
    gal.addEventListener('scroll',function(){
      if(!gal.classList.contains('ph-carousel')) return;
      wrapIfPastEnd();                    /* every frame, not on settle */
      clearTimeout(scrollTick);
      scrollTick=setTimeout(function(){
        wrapIfPastEnd();
        var i=nearestCard();
        if(i!==front){ front=i; paintCaption(); syncDots(); warm(); }
      },70);
    },{passive:true});

    function show(i){
      /* any deliberate move counts as engagement: the start-position guard must
         stop interfering from here on, or a lazily-loaded picture firing
         ensureStart() later drags the reader back to the first card */
      userTouched=true;
      front=(i+n)%n;
      if(gal.classList.contains('ph-carousel')){
        var f=figs[front];
        gal.scrollTo({left:f.offsetLeft-(gal.clientWidth-f.offsetWidth)/2,behavior:'smooth'});
        paintCaption(); syncDots(); warm();
        return;
      }
      update();
    }

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
      /* phone stack view: a carousel for artwork, a vertical feed for video */
      var vid=gal.classList.contains('vidgal');
      var phCar=stack&&isPhone()&&!vid, phFeed=stack&&isPhone()&&vid;
      gal.classList.toggle('ph-carousel',phCar);
      gal.classList.toggle('ph-feed',phFeed);
      scene.classList.toggle('ph-scene',phCar||phFeed);
      if(phCar){ buildDots(); buildLoop(); } else { dropLoop(); }
      if(dots) dots.style.display=phCar?'':'none';
      cap.style.display=(stack&&!phFeed)?'':'none';
      ui.style.display=(stack&&!phFeed)?'':'none';
      [].slice.call(tog.children).forEach(function(b){
        b.classList.toggle('active', b.getAttribute('data-v')===m);
      });
      if(stack){
        gal.style.columnCount=''; gal.style.maxWidth='';
        update();
        /* the leading clone means card one is not at scrollLeft 0 any more.
           Layout may not be settled yet, so nudge it a few times and stop as
           soon as it has taken — the guard only fires from the un-scrolled
           state, so it can never yank the page out from under a swipe. */
        if(phCar){
          positioned=false; userTouched=false;
          ensureStart();
          requestAnimationFrame(ensureStart);
          [60,250,800].forEach(function(ms){ setTimeout(ensureStart,ms); });
        }
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
    /* ── stepping past either end ──
       show() scrolls straight at the target card, so stepping forward off the
       last one animated all the way back down the strip to the first — the
       "rewind" instead of a loop. Glide onto the neighbouring COPY instead,
       which is one card away in the direction asked for, then swap to the real
       card once it lands. The copy holds the same picture, so the swap is
       invisible and you can keep going round forever. */
    function crossSeam(cl, realIdx){
      if(!cl){ show(realIdx); return; }
      userTouched=true;
      seamHold=true;
      var want=cl.offsetLeft-(gal.clientWidth-cl.offsetWidth)/2;
      try{ gal.scrollTo({left:want,behavior:'smooth'}); }
      catch(e){ gal.scrollLeft=want; }
      front=realIdx; paintCaption(); syncDots(); warm();
      var tries=0, lastPos=-1;
      (function settle(){
        setTimeout(function(){
          /* landed once the scroll stops moving (or patience runs out) */
          if(Math.abs(gal.scrollLeft-lastPos)<1 || ++tries>40){
            seamHold=false; jumpTo(realIdx);
          } else { lastPos=gal.scrollLeft; settle(); }
        },50);
      })();
    }
    function step(d){
      if(!gal.classList.contains('ph-carousel')){ show(front+d); return; }
      if(d>0 && front===n-1){ crossSeam(cloneTail,0); return; }
      if(d<0 && front===0){ crossSeam(cloneHead,n-1); return; }
      show(front+d);
    }
    prev.addEventListener('click',function(){ step(-1); });
    next.addEventListener('click',function(){ step(1); });

    /* touch swipe.
       On the phone carousel the gallery is already a native scroll-snap
       scroller: a swipe moves it a card by itself and the wrap correction
       already loops it. Stepping it AGAIN from touchend was a second move
       fighting the momentum of the first — the "glitchy" swiping. Leave touch
       to the browser there; this synthetic step is for the non-carousel deck. */
    var tx=0;
    scene.addEventListener('touchstart',function(e){
      tx=e.touches[0].clientX; userTouched=true; positioned=true;
    },{passive:true});
    scene.addEventListener('touchend',function(e){
      if(!gal.classList.contains('stack-mode')) return;
      if(gal.classList.contains('ph-carousel')) return;
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

    var wasPhone=isPhone();
    window.addEventListener('resize',function(){
      if(isPhone()!==wasPhone){                 /* crossed the phone boundary */
        wasPhone=isPhone();
        setMode(gal.classList.contains('stack-mode')?'stack':'gallery');
        return;
      }
      if(gal.classList.contains('stack-mode')) update(); else fitColumns();
    });
    /* images arrive after layout, so re-fit once they have real heights */
    [].slice.call(gal.querySelectorAll('img')).forEach(function(im){
      if(!im.complete) im.addEventListener('load',function(){
        fitColumns();
        /* a card only has a width once its picture has arrived, so this is
           often the first moment the start position can be measured at all */
        ensureStart();
      },{once:true});
    });

    decks.push({scene:scene, gal:gal, step:function(d){ step(d); },
      reset:function(){
        front=0;
        setMode('stack');
        if(gal.classList.contains('ph-carousel')) jumpTo(0); else update();
      }});
    setMode('stack');   /* the original defaults to stack view */
  });

  /* ← / → / space drive whichever deck is nearest the middle of the screen */
  /* back-navigation restores this page from the cache with everything exactly
     where it was — send each deck back to its first card */
  window.__deckReset=function(){
    decks.forEach(function(k){ if(k.reset) try{ k.reset(); }catch(e){} });
  };
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
  /* some tips only describe phone behaviour — never show those anywhere else */
  if(o.classList.contains('tip-phone-only')
     && !window.matchMedia('(max-width: 600px)').matches) return;
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
  /* On a phone every gallery is a two-column Pinterest wall, so the packer
     runs on all of them; above 600px it stays on the .masonry sections only. */
  function packTargets(){
    /* mag-grid and pkg-grid are real CSS grids on a phone now, not columns, so
       the hand packer has nothing to fix there — and because it re-appends
       every child to impose its own order, it was shuffling the magazine year
       titles away from the pieces they belong to. */
    var sel=window.matchMedia('(max-width: 600px)').matches
      ? '.gallery:not(.vidgal):not(.icons):not(.mag-grid):not(.pkg-grid)'
      : '.gallery.masonry';
    return [].slice.call(document.querySelectorAll(sel));
  }
  var gals=packTargets();
  if(!gals.length) return;
  /* same filter as in all() below — this capture runs first, so without it
     the loop copies are baked in as original content and reappear in gallery */
  gals.forEach(function(g){
    g.__orig=[].slice.call(g.children).filter(function(c){
      return !(c.classList && c.classList.contains('ph-clone'));
    });
  });

  function reset(g){
    g.__orig.forEach(function(n){ n.style.breakBefore=''; g.appendChild(n); });
  }
  function pack(g){
    /* a carousel or a video feed lays itself out — leave those alone, and in
       particular do not re-append their children, which would shuffle the
       loop copies out of place */
    if(g.classList.contains('stack-mode')||g.classList.contains('ph-carousel')
       ||g.classList.contains('ph-feed')) return;
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
  function all(){
    gals=packTargets();
    gals.forEach(function(g){
      /* the carousel's loop copies are not content — captured into __orig they
         get re-appended on every pack, which is how gallery view ended up
         showing each piece twice */
      if(!g.__orig) g.__orig=[].slice.call(g.children).filter(function(c){
        return !(c.classList && c.classList.contains('ph-clone'));
      });
    });
    gals.forEach(pack);
  }
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

/* ── phone video: a TikTok-style player ──
   The native control bar is a desktop artefact on a phone, so on a phone the
   videos lose it: tap toggles play/pause, holding either edge runs at 2x while
   your finger is down, a hairline bar shows progress, and a clip pauses itself
   when it scrolls out of view. Above 600px the normal controls are untouched. ── */
(function(){
  function isPhone(){ return window.matchMedia('(max-width: 600px)').matches; }
  var HOLD=280, timer=null, active=null, pill=null, held=false, startFig=null;

  function showPill(fig){
    if(!pill){
      pill=document.createElement('div');
      pill.className='ph-speed';
      pill.textContent='2\u00d7';
      document.body.appendChild(pill);
    }
    var r=fig.getBoundingClientRect();
    pill.style.top=Math.round(Math.max(14,r.top+14))+'px';
    pill.classList.add('on');
  }
  function hidePill(){ if(pill) pill.classList.remove('on'); }

  /* dress a video: drop the native chrome, add the glyph and the progress bar */
  function dress(host){
    if(host.__dressed) return;
    var v=host.querySelector('video'); if(!v) return;
    host.__dressed=1;
    host.classList.add('ph-player','paused');
    v.removeAttribute('controls');
    var play=document.createElement('div');
    play.className='ph-play'; play.innerHTML='<span><i></i></span>';
    var bar=document.createElement('div');
    bar.className='ph-bar'; bar.innerHTML='<i></i>';
    host.appendChild(play); host.appendChild(bar);
    /* Centre the glyph on the PICTURE. The host also carries the caption and
       the scrubber, so an inset:0 overlay is centred on all three and the
       button rode low on the frame. */
    function fitPlay(){
      if(!v.offsetHeight) return;
      play.style.top=v.offsetTop+'px';
      play.style.height=v.offsetHeight+'px';
      play.style.bottom='auto';
    }
    fitPlay();
    v.addEventListener('loadedmetadata',fitPlay);
    v.addEventListener('loadeddata',fitPlay);
    window.addEventListener('resize',fitPlay);
    [120,400,1200].forEach(function(ms){ setTimeout(fitPlay,ms); });
    var fill=bar.firstChild;
    v.addEventListener('timeupdate',function(){
      if(v.duration) fill.style.width=(v.currentTime/v.duration*100)+'%';
    });
    /* drag anywhere along the bar to scrub forward or back */
    var dragging=false;
    function seek(clientX){
      var r=bar.getBoundingClientRect();
      var p=Math.min(1,Math.max(0,(clientX-r.left)/r.width));
      if(v.duration){ v.currentTime=p*v.duration; fill.style.width=(p*100)+'%'; }
    }
    bar.addEventListener('touchstart',function(e){
      dragging=true; seek(e.touches[0].clientX);
    },{passive:true});
    bar.addEventListener('touchmove',function(e){
      if(dragging) seek(e.touches[0].clientX);
    },{passive:true});
    ['touchend','touchcancel'].forEach(function(ev){
      bar.addEventListener(ev,function(){ dragging=false; },{passive:true});
    });
    bar.addEventListener('click',function(e){ seek(e.clientX); e.stopPropagation(); });
    v.addEventListener('play',function(){ host.classList.remove('paused'); });
    v.addEventListener('pause',function(){ host.classList.add('paused'); });
    v.addEventListener('ended',function(){ host.classList.add('paused'); });
  }
  function undress(host){
    if(!host.__dressed) return;
    host.__dressed=0;
    host.classList.remove('ph-player','paused');
    var v=host.querySelector('video');
    if(v) v.setAttribute('controls','');
    [].slice.call(host.querySelectorAll('.ph-play,.ph-bar')).forEach(function(n){ n.remove(); });
  }
  function hosts(){
    return [].slice.call(document.querySelectorAll('.vidgal figure, .vidwrap'));
  }
  function apply(){
    hosts().forEach(isPhone()?dress:undress);
  }

  document.addEventListener('touchstart',function(e){
    if(!isPhone()||!e.target.closest) return;
    if(e.target.closest('.ph-bar')) return;   /* the scrubber owns its own drags */
    var host=e.target.closest('.ph-player');
    if(!host) return;
    var v=host.querySelector('video'); if(!v) return;
    startFig=host; held=false;
    var r=host.getBoundingClientRect();
    var x=e.touches[0].clientX-r.left;
    clearTimeout(timer);
    /* the middle third stays a plain tap target; the edges are the 2x zones */
    if(x>r.width*0.32 && x<r.width*0.68) return;
    timer=setTimeout(function(){
      if(v.paused) return;                 /* nothing to speed up */
      held=true; active=v; v.playbackRate=2; showPill(host);
    },HOLD);
  },{passive:true,capture:true});

  document.addEventListener('touchend',function(e){
    if(e.target.closest&&e.target.closest('.ph-bar')){ startFig=null; return; }
    clearTimeout(timer);
    if(active){ try{ active.playbackRate=1; }catch(err){} active=null; hidePill(); }
    if(!isPhone()||held||!startFig) { held=false; startFig=null; return; }
    var host=e.target.closest&&e.target.closest('.ph-player');
    if(host&&host===startFig){
      var v=host.querySelector('video');
      if(v){ if(v.paused) { var p=v.play(); if(p&&p.catch) p.catch(function(){}); } else v.pause(); }
    }
    startFig=null;
  },{passive:true,capture:true});

  ['touchcancel','touchmove'].forEach(function(ev){
    document.addEventListener(ev,function(){
      clearTimeout(timer);
      if(active){ try{ active.playbackRate=1; }catch(err){} active=null; hidePill(); }
      startFig=null;
    },{passive:true,capture:true});
  });

  /* a clip that scrolls out of the feed stops playing, as it would on TikTok */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      if(!isPhone()) return;
      entries.forEach(function(en){
        if(en.isIntersecting) return;
        var v=en.target.querySelector('video');
        if(v&&!v.paused) v.pause();
      });
    },{threshold:0.35});
    var watch=function(){
      hosts().forEach(function(f){ if(f.__vwatch) return; f.__vwatch=1; io.observe(f); });
    };
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',watch);
    else watch();
  }

  window.addEventListener('resize',function(){ clearTimeout(window.__vpT); window.__vpT=setTimeout(apply,180); });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply);
  else apply();
})();

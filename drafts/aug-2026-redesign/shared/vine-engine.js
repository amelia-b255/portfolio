/* The homepage's growing orchid vine engine, shared so every page can
   grow one. Extracted verbatim from index.html — window.growVine(canvas,
   opts) with the same options; theme recolour rides window.__vines. */
/* ── orchid vine: the ORIGINAL site's full hero-vine engine (multi-strand
   cluster, cybersigilism thorns, buds, mid/tip blooms, concrete grain on the
   strokes, mouse-wind sway, scroll retract) — recoloured for cream/vermillion.
   Random arrangement each load, exactly like the original desktop vines. ── */
window.growVine=function(cv, opts){
  if(!cv) return;
  opts=opts||{};
  /* the page's own red/orange, matching the type (theme-aware via CSS tokens) */
  function tok(n,f){ var v=getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v||f; }
  var COLS=[tok('--vine','#c2381c'),tok('--vine2','#a02c15'),tok('--vine3','#8e2110')];
  function J(a,b){ return a+Math.random()*(b-a); }
  function hexA(hex,a){ var n=parseInt(hex.slice(1),16); return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'; }
  function petal(ctx,ang,L,W){
    ctx.save(); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(0,0);
    ctx.bezierCurveTo(W*0.55,-L*0.30, W*0.50,-L*0.80, 0,-L);
    ctx.bezierCurveTo(-W*0.50,-L*0.80, -W*0.55,-L*0.30, 0,0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function drawOrchid(ctx,x,y,ang,size,cols,e,sh){
    if(e<=0) return;
    sh=sh||{open:1,wr:1,sep:1};
    var lat=1.25*sh.open;
    var sep=Math.min(2.45*Math.min(sh.open,1.08),2.75);
    ctx.save(); ctx.translate(x,y); ctx.rotate(ang); ctx.scale(e,e);
    ctx.lineWidth=1.15; ctx.globalAlpha=0.95;
    ctx.strokeStyle=cols[0]; ctx.fillStyle=hexA(cols[1],0.16);
    petal(ctx, 0,    size,             size*0.42*sh.wr);
    petal(ctx,  lat, size*0.92,        size*0.55*sh.wr);
    petal(ctx, -lat, size*0.92,        size*0.55*sh.wr);
    petal(ctx,  sep, size*0.62*sh.sep, size*0.34);
    petal(ctx, -sep, size*0.62*sh.sep, size*0.34);
    ctx.fillStyle=hexA(cols[0],0.5);
    petal(ctx, Math.PI, size*0.34, size*0.30);
    ctx.globalAlpha=1; ctx.fillStyle=cols[0];
    ctx.beginPath(); ctx.arc(0,0,1.7,0,6.2832); ctx.fill();
    /* cybersigilism centre: fine radiating spikes + stamen dots */
    ctx.globalAlpha=0.85; ctx.strokeStyle=cols[0]; ctx.lineWidth=0.85;
    for(var cs=0;cs<6;cs++){ var ca=cs*1.047+0.5;
      ctx.beginPath(); ctx.moveTo(Math.cos(ca)*size*0.12,Math.sin(ca)*size*0.12); ctx.lineTo(Math.cos(ca)*size*0.42,Math.sin(ca)*size*0.42); ctx.stroke(); }
    ctx.globalAlpha=0.7;
    for(var cd=0;cd<5;cd++){ var da=cd*1.257+0.3; ctx.beginPath(); ctx.arc(Math.cos(da)*size*0.24,Math.sin(da)*size*0.24,0.9,0,6.2832); ctx.fill(); }
    ctx.restore();
  }
  function drawBud(ctx,x,y,ang,size,cols,e){
    if(e<=0) return;
    ctx.save(); ctx.translate(x,y); ctx.rotate(ang); ctx.scale(e,e);
    ctx.lineWidth=1; ctx.globalAlpha=0.9;
    ctx.strokeStyle=cols[0]; ctx.fillStyle=hexA(cols[1],0.22);
    petal(ctx, 0.30, size, size*0.55);
    petal(ctx,-0.30, size, size*0.55);
    ctx.restore();
  }
  function buildLine(w,h,xFrac,lean,v0,scale){
    var x=w*xFrac, y=h-4, hd=-Math.PI/2-lean, v=v0;
    var n1=Math.round(J(125,145)*scale), A1=J(1.75,2.05);
    var n2=Math.round(J(100,120)*scale), A2=A1*J(1.10,1.30);
    var n3=Math.round(J(65,85)*scale),   A3=J(1.35,1.60);
    var ph=[
      {n:n1, t:A1/n1},
      {n:n2, t:-A2/n2},
      {n:n3, t:A3/n3},
      {n:Math.round(J(150,175)*Math.max(scale,0.8)), t:J(0.055,0.065), tg:1.008, vd:0.988}
    ];
    var wob=J(0.007,0.012), wobF=J(0.03,0.05), wobP=J(0,6.28);
    var pts=[{x:x,y:y,fr:0}], total=0, t=0;
    ph.forEach(function(p){ total+=p.n; });
    ph.forEach(function(p){
      var turn=p.t;
      for(var i=0;i<p.n;i++){
        t++; hd+=turn+wob*Math.sin(t*wobF+wobP); turn*=(p.tg||1);
        x+=Math.cos(hd)*v; y+=Math.sin(hd)*v; v*=(p.vd||1);
        if(t%2===0||t===total) pts.push({x:x,y:y,fr:t/total});
      }
    });
    return pts;
  }
  var TEX=new Image(); TEX.src='textures/tex-concrete.webp';
  var W,H,strands,ctx;
  function seed(){
    var dpr=Math.min(window.devicePixelRatio||1,2);
    W=cv.clientWidth; H=cv.clientHeight;
    if(!W||!H) return;
    cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
    ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
    /* the original desktop arrangement: 8 strands, random each load.
       Built inside a 45px inner margin so orchids never get cut off at the
       canvas edges when the wind sways them. */
    var Wb=W-90, Hb=H-45;
    var LEN=opts.len||1;      /* >1 = more segments, i.e. a naturally taller vine */
    var main=buildLine(Wb,Hb,J(0.40,0.48),J(0.82,0.98),J(2.1,2.3),1.0*LEN);
    var sub =buildLine(Wb,Hb,J(0.22,0.32),J(0.45,0.65),J(1.6,1.8),J(0.52,0.62)*LEN);
    var tiny=buildLine(Wb,Hb,J(0.10,0.20),J(0.30,0.50),J(1.3,1.5),J(0.34,0.44)*LEN);
    var mid2=buildLine(Wb,Hb,J(0.30,0.38),J(0.60,0.80),J(1.8,2.0),J(0.68,0.78)*LEN);
    var tiny2=buildLine(Wb,Hb,J(0.50,0.58),J(0.35,0.55),J(1.2,1.4),J(0.28,0.36)*LEN);
    var bare1=buildLine(Wb,Hb,J(0.05,0.12),J(0.55,0.75),J(1.6,1.8),J(0.55,0.68)*LEN);
    var bare2=buildLine(Wb,Hb,J(0.60,0.70),J(0.40,0.60),J(1.2,1.4),J(0.30,0.40)*LEN);
    var bare3=buildLine(Wb,Hb,J(0.18,0.26),J(0.45,0.65),J(1.4,1.6),J(0.42,0.52)*LEN);
    function budsFor(pts,list){ return list.map(function(b){ return {k:Math.floor(pts.length*b[0]), size:b[1], side:b[2]}; }); }
    function shp(o1,o2){ return {open:J(o1,o2), wr:J(0.85,1.25), sep:J(0.75,1.15)}; }
    /* bloom sizes scaled ~0.66 of the original's (this canvas is narrower) */
    strands=[
      {pts:main, lw:J(1.6,2.0), wf:J(0.7,1.0), off:0,
       bloom:J(36,45), shape:shp(0.95,1.20),
       buds:budsFor(main,[[0.48,J(9,11),1],[0.72,J(7,9),-1]]),
       midBloom:{k:Math.floor(main.length*J(0.50,0.62)), size:J(24,30), shape:shp(0.50,0.75)}},
      {pts:mid2, lw:J(1.3,1.6), wf:J(0.8,1.1), off:0.06,
       bloom:J(28,34), shape:shp(0.55,0.80), buds:budsFor(mid2,[[0.55,J(7,9),-1]]), midBloom:null},
      {pts:sub,  lw:J(1.1,1.4), wf:J(0.9,1.3), off:0.12,
       bloom:J(26,33), shape:shp(0.80,1.10), buds:budsFor(sub,[[0.58,J(7,9),1]]), midBloom:null},
      {pts:tiny, lw:J(0.9,1.1), wf:J(1.0,1.4), off:0.22,
       bloom:J(22,29), shape:shp(0.60,1.15), buds:[], midBloom:null},
      {pts:tiny2, lw:J(0.75,0.95), wf:J(1.1,1.5), off:0.30,
       bloom:0, buds:[], midBloom:null},
      {pts:bare1, lw:J(1.0,1.3), wf:J(0.9,1.2), off:0.10,
       bloom:0, buds:[], midBloom:null},
      {pts:bare2, lw:J(0.75,0.95), wf:J(1.2,1.5), off:0.26,
       bloom:0, buds:[], midBloom:null},
      {pts:bare3, lw:J(0.9,1.2), wf:J(1.0,1.3), off:0.16,
       bloom:0, buds:[], midBloom:null}
    ];
    /* Fit the WHOLE cluster inside a padded frame. The strands are random, so
       measure the real bounds and scale/translate — a fixed inset margin isn't
       enough and tip blooms were still being cut off at the top. PAD leaves
       room for the largest bloom's petals. */
    var PAD=46;
    var mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;
    strands.forEach(function(st){ st.pts.forEach(function(q){
      if(q.x<mnx)mnx=q.x; if(q.x>mxx)mxx=q.x;
      if(q.y<mny)mny=q.y; if(q.y>mxy)mxy=q.y;
    }); });
    var bw=Math.max(1,mxx-mnx), bh=Math.max(1,mxy-mny);
    /* ALWAYS uniform — scaling x and y separately stretched the curls into thin
       elongated loops. Height instead comes from opts.len growing a genuinely
       longer vine (more segments) above. */
    var scx,scy;
    scx=scy=Math.min(1,(W-PAD*2)/bw,(H-PAD*2)/bh);
    var offX=PAD-mnx*scx + (opts.alignLeft?0:Math.max(0,((W-PAD*2)-bw*scx)/2));
    var offY=(H-PAD)-mxy*scy;                   /* keep the base sitting on the bottom */
    strands.forEach(function(st){ st.pts.forEach(function(q){
      q.x=q.x*scx+offX; q.y=q.y*scy+offY;
    }); });
  }
  function render(g,wind){
    if(!ctx) return;
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation='source-over';
    ctx.lineCap='round'; ctx.lineJoin='round';
    var cols=COLS;
    for(var s=0;s<strands.length;s++){
      var st=strands[s], pts=st.pts, len=pts.length;
      var local=Math.max(0,Math.min(1,(g-st.off)/(1-st.off)));
      local=1-Math.pow(1-local,1.6);
      var n=Math.floor(local*(len-1));
      if(n<1) continue;
      var anchor=pts[0], bend=wind*st.wf;
      function TP(k){
        var p=pts[k];
        var a=bend*Math.pow(k/len,1.5)*1.6;
        var dx=p.x-anchor.x, dy=p.y-anchor.y;
        var ca=Math.cos(a), sa=Math.sin(a);
        return {x:anchor.x+dx*ca-dy*sa, y:anchor.y+dx*sa+dy*ca};
      }
      ctx.strokeStyle=cols[0];
      var px=null,py=null;
      for(var k=0;k<=n;k++){
        var P=TP(k);
        if(px!==null){
          ctx.globalAlpha=0.85;
          ctx.lineWidth=st.lw*(0.45+0.9*Math.pow(Math.sin(Math.PI*Math.min(pts[k].fr*1.1,1)),1.4));
          ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(P.x,P.y); ctx.stroke();
        }
        px=P.x; py=P.y;
      }
      /* cybersigilism: dense barbed hook-thorns + stipple dots along the stem */
      var cbf=Math.max(0.4,Math.min(1,W/420));
      var CSTEP=Math.max(4,Math.round(len/24));
      ctx.fillStyle=cols[0];
      for(var ck=CSTEP; ck<n-1; ck+=CSTEP){
        var cg=Math.min(1,(n-ck)/8); if(cg<=0) continue;
        var idx=Math.round(ck/CSTEP);
        var cside=(idx%2===0)?1:-1;
        var CA=TP(ck), CB=TP(Math.max(0,ck-2));
        var ctang=Math.atan2(CA.y-CB.y,CA.x-CB.x);
        var clen=(9+10*Math.abs(Math.sin(ck*0.7)))*cg*(1-0.22*pts[ck].fr)*cbf;
        if(clen<2) continue;
        var cperp=ctang+cside*1.12;
        var hx=CA.x+Math.cos(cperp-cside*0.6)*clen*0.55, hy=CA.y+Math.sin(cperp-cside*0.6)*clen*0.55;
        var tx=CA.x+Math.cos(cperp)*clen, ty=CA.y+Math.sin(cperp)*clen;
        var cbw=(st.lw*0.8+0.35)*cbf;
        ctx.globalAlpha=0.86;
        ctx.beginPath();
        ctx.moveTo(CA.x-Math.cos(ctang)*cbw, CA.y-Math.sin(ctang)*cbw);
        ctx.quadraticCurveTo(hx,hy,tx,ty);
        ctx.quadraticCurveTo(hx,hy,CA.x+Math.cos(ctang)*cbw, CA.y+Math.sin(ctang)*cbw);
        ctx.closePath(); ctx.fill();
        /* shorter straight counter-barb on the opposite side (barbed-wire feel) */
        var clen2=clen*0.5, cperp2=ctang-cside*1.15;
        var tx2=CA.x+Math.cos(cperp2)*clen2, ty2=CA.y+Math.sin(cperp2)*clen2;
        ctx.beginPath();
        ctx.moveTo(CA.x-Math.cos(ctang)*cbw*0.7, CA.y-Math.sin(ctang)*cbw*0.7);
        ctx.lineTo(tx2,ty2);
        ctx.lineTo(CA.x+Math.cos(ctang)*cbw*0.7, CA.y+Math.sin(ctang)*cbw*0.7);
        ctx.closePath(); ctx.fill();
        /* pinprick dots trailing off the thorn tip */
        ctx.globalAlpha=0.55;
        ctx.beginPath(); ctx.arc(tx+Math.cos(cperp)*4*cbf, ty+Math.sin(cperp)*4*cbf, 1.0*cbf, 0, 6.2832); ctx.fill();
        if(idx%2===0){ ctx.beginPath(); ctx.arc(tx+Math.cos(cperp)*9*cbf, ty+Math.sin(cperp)*9*cbf, 0.8*cbf, 0, 6.2832); ctx.fill(); }
      }
      /* buds pop once the growing tip passes them */
      for(var b=0;b<st.buds.length;b++){
        var bud=st.buds[b];
        if(bud.k>=n||bud.k<3) continue;
        var be=Math.min(1,(n-bud.k)/14); be=1-Math.pow(1-be,2);
        var bp=TP(bud.k), bq=TP(bud.k-3);
        var bang=Math.atan2(bp.y-bq.y,bp.x-bq.x)+Math.PI/2+bud.side*0.55;
        drawBud(ctx,bp.x,bp.y,bang,bud.size,cols,be);
      }
      /* a mid-stem orchid opens once the tip has passed it */
      if(st.midBloom && st.midBloom.k<n && st.midBloom.k>5){
        var me=Math.min(1,(n-st.midBloom.k)/16); me=1-Math.pow(1-me,2);
        var mp=TP(st.midBloom.k), mq=TP(st.midBloom.k-4);
        var mang=Math.atan2(mp.y-mq.y,mp.x-mq.x)+Math.PI/2;
        drawOrchid(ctx,mp.x,mp.y,mang,st.midBloom.size,cols,me,st.midBloom.shape);
      }
      /* the orchid bloom unfurls at the tip as the strand completes */
      if(st.bloom && local>0.88){
        var fe=(local-0.88)/0.12; fe=1-Math.pow(1-fe,3);
        var tp=TP(len-1), tq=TP(len-6);
        var fang=Math.atan2(tp.y-tq.y,tp.x-tq.x)+Math.PI/2;
        drawOrchid(ctx,tp.x,tp.y,fang,st.bloom,cols,fe,st.shape);
      }
    }
    /* concrete grain, clipped to the drawn strokes — same as the original */
    if(TEX.complete && TEX.naturalWidth){
      ctx.globalCompositeOperation='source-atop';
      ctx.globalAlpha=0.5;
      ctx.drawImage(TEX,0,0,W,H);
      ctx.globalCompositeOperation='source-over';
      ctx.globalAlpha=1;
    }
  }
  seed();
  var g=0, lastG=-1, wind=0, windV=0, lastW=0, loadT=0, lastTime=performance.now();
  window.addEventListener('mousemove', function(e){ windV+=(e.movementX||0)*0.00002; }, {passive:true});
  TEX.onload=function(){ lastG=-1; };
  /* hero vine keys off page scroll; section vines grow every time the section
     is scrolled into view — leaving wipes them back to nothing so the next
     arrival replays the growth from a fresh arrangement */
  var inView=!opts.onView;
  function replay(){ seed(); g=0; loadT=0; lastG=-1; inView=true; }
  function wipe(){ inView=false; g=0; loadT=0; lastG=-1; }
  cv.__replay=replay;
  if(opts.onView){
    if('IntersectionObserver' in window){
      var wasIn=false;
      new IntersectionObserver(function(en){
        en.forEach(function(e){
          if(e.isIntersecting){ if(!wasIn){ wasIn=true; replay(); } }
          else if(wasIn){ wasIn=false; wipe(); }
        });
      },{threshold:0.12}).observe(opts.onView);
    } else inView=true;
  }
  function loop(now){
    var dt=Math.min(now-lastTime,80); lastTime=now;
    if(inView) loadT=Math.min(1, loadT+dt/2600);
    windV+=(0-wind)*0.005; windV*=0.96; wind+=windV;
    var target, op=1;
    if(opts.onView){
      target=loadT;                       /* stays grown once revealed */
    } else {
      var sy=window.pageYOffset;
      target=Math.max(0,Math.min(1, loadT - sy/300));
      op=Math.max(0, 1-sy/750);
    }
    cv.style.opacity=op.toFixed(3);
    var ease=(target>g)?0.92:0.80;      /* grow gently, retract snappier */
    g+=(target-g)*(1-Math.pow(ease, dt/16.7));
    if(Math.abs(g-lastG)>0.0008 || Math.abs(wind-lastW)>0.0006){
      render(g, wind); lastG=g; lastW=wind;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(function(){ seed(); lastG=-1; },300); });
  /* let the theme toggle recolour + repaint this vine */
  (window.__vines=window.__vines||[]).push(function(){
    COLS=[tok('--vine','#c2381c'),tok('--vine2','#a02c15'),tok('--vine3','#8e2110')];
    seed();                 /* fresh arrangement */
    g=0; loadT=0; lastG=-1; /* and grow it again from nothing */
  });
};

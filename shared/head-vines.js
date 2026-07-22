/* head-vines.js — flanking orchid swirls on section titles for sub-pages.
   This is the SAME heading-vine system the homepage runs inline, packaged so
   every gallery/project page can share it. Each big <section> <h2> gets a vine
   on either side that grows in (after the title finishes typing) and retracts
   on scroll. Deterministic shape (seeded), thinner on phone, lighter thorns.
   The homepage keeps its own inline copy — do NOT include this there. */
(function(){
  var DARK=['#d9a091','#e9bda9','#c68a7b'], LIGHT=['#7a4848','#98595b','#6e3c3c'];
  function isLight(){ return document.documentElement.classList.contains('light-mode'); }
  function J(a,b){ return a+Math.random()*(b-a); }
  /* deterministic J-alike: same seed → same sequence (keeps every vine identical) */
  function mkRnd(seed){ var s=(seed>>>0)||1; return function(a,b){ s=(s*1664525+1013904223)>>>0; return a+(s/4294967296)*(b-a); }; }
  function hexA(hex,a){ var n=parseInt(hex.slice(1),16); return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'; }

  function petal(ctx,ang,L,W){
    ctx.save(); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(0,0);
    ctx.bezierCurveTo(W*0.55,-L*0.30, W*0.50,-L*0.80, 0,-L);
    ctx.bezierCurveTo(-W*0.50,-L*0.80, -W*0.55,-L*0.30, 0,0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function drawOrchid(ctx,x,y,ang,size,cols,e,sh,lwf){
    if(e<=0) return;
    sh=sh||{open:1,wr:1,sep:1}; lwf=lwf||1;
    var lat=1.25*sh.open;
    var sep=Math.min(2.45*Math.min(sh.open,1.08),2.75);
    ctx.save(); ctx.translate(x,y); ctx.rotate(ang); ctx.scale(e,e);
    ctx.lineWidth=1.15*lwf; ctx.globalAlpha=0.95;
    ctx.strokeStyle=cols[0]; ctx.fillStyle=hexA(cols[1],0.22);
    petal(ctx, 0,    size,             size*0.42*sh.wr);
    petal(ctx,  lat, size*0.92,        size*0.55*sh.wr);
    petal(ctx, -lat, size*0.92,        size*0.55*sh.wr);
    petal(ctx,  sep, size*0.62*sh.sep, size*0.34);
    petal(ctx, -sep, size*0.62*sh.sep, size*0.34);
    ctx.fillStyle=hexA(cols[0],0.55);
    petal(ctx, Math.PI, size*0.34, size*0.30);
    ctx.globalAlpha=1; ctx.fillStyle=cols[0];
    ctx.beginPath(); ctx.arc(0,0,1.7,0,6.2832); ctx.fill();
    ctx.globalAlpha=0.85; ctx.strokeStyle=cols[0]; ctx.lineWidth=0.85*lwf;
    for(var cs=0;cs<6;cs++){ var ca=cs*1.047+0.5;
      ctx.beginPath(); ctx.moveTo(Math.cos(ca)*size*0.12,Math.sin(ca)*size*0.12); ctx.lineTo(Math.cos(ca)*size*0.42,Math.sin(ca)*size*0.42); ctx.stroke(); }
    ctx.globalAlpha=0.7;
    for(var cd=0;cd<5;cd++){ var da=cd*1.257+0.3; ctx.beginPath(); ctx.arc(Math.cos(da)*size*0.24,Math.sin(da)*size*0.24,0.9,0,6.2832); ctx.fill(); }
    ctx.restore();
  }
  function drawBud(ctx,x,y,ang,size,cols,e,lwf){
    if(e<=0) return; lwf=lwf||1;
    ctx.save(); ctx.translate(x,y); ctx.rotate(ang); ctx.scale(e,e);
    ctx.lineWidth=1*lwf; ctx.globalAlpha=0.9;
    ctx.strokeStyle=cols[0]; ctx.fillStyle=hexA(cols[1],0.30);
    petal(ctx, 0.30, size, size*0.55);
    petal(ctx,-0.30, size, size*0.55);
    ctx.restore();
  }

  function buildLine(w,h,xFrac,lean,v0,scale,curl,rnd){
    curl=curl||1; rnd=rnd||J;
    var x=w*xFrac, y=h-4, hd=-Math.PI/2-lean, v=v0;
    var n1=Math.round(rnd(125,145)*scale), A1=rnd(1.75,2.05);
    var n2=Math.round(rnd(100,120)*scale), A2=A1*rnd(1.10,1.30);
    var n3=Math.round(rnd(65,85)*scale),   A3=rnd(1.35,1.60);
    var ph=[
      {n:n1, t:A1/n1*curl},
      {n:n2, t:-A2/n2*curl},
      {n:n3, t:A3/n3*curl},
      {n:Math.round(rnd(150,175)*Math.max(scale,0.8)), t:rnd(0.055,0.065), tg:1.008, vd:0.988}
    ];
    var wob=rnd(0.007,0.012), wobF=rnd(0.03,0.05), wobP=rnd(0,6.28);
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
  function budsFor(pts,list){ return list.map(function(b){ return {k:Math.floor(pts.length*b[0]), size:b[1], side:b[2]}; }); }

  var TEX=new Image(); TEX.src='textures/tex-concrete.jpg';

  function Field(el, fromBottom){ this.el=el; this.cv=el.firstChild; this.fromBottom=fromBottom; this.lite=true; this.mob=false; this.g=0; this.lastG=-1; this.lastW=0; }
  Field.prototype.seed=function(){
    var cv=this.cv, dpr=Math.min(window.devicePixelRatio||1,2);
    var w=cv.clientWidth, h=cv.clientHeight;
    if(!w||!h) return;
    cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr);
    this.ctx=cv.getContext('2d'); this.ctx.setTransform(dpr,0,0,dpr,0,0);
    this.w=w; this.h=h; this.light=isLight(); this.cols=this.light?LIGHT:DARK;
    var fromB=this.fromBottom, hsc=w/160;
    var hthin=(window.innerWidth<=600)?0.42:1;   /* thinner stems on phone */
    /* DETERMINISTIC: seeded per side so every heading vine is the SAME shape */
    var HR=mkRnd(fromB?9173:3391);
    var shpH=function(o1,o2){ return {open:HR(o1,o2), wr:HR(0.85,1.25), sep:HR(0.75,1.15)}; };
    var main=buildLine(w,h,HR(0.47,0.53),HR(0.80,1.00),HR(2.0,2.2),0.96,1.0,HR);
    if(!fromB) main=main.map(function(q){ return {x:w-q.x,y:h-q.y,fr:q.fr}; });
    var Lm=main.length;
    this.strands=[
      {pts:main, lw:HR(1.9,2.3)*hsc*hthin, wf:HR(0.55,0.80), off:0,
       bloom:HR(30,37)*hsc, shape:shpH(0.95,1.20),
       buds:budsFor(main,[[0.44,HR(10,13)*hsc,-1],[0.70,HR(9,12)*hsc,1]]),
       midBloom:{k:Math.floor(Lm*0.27), size:HR(26,33)*hsc, shape:shpH(0.55,0.80)},
       extraBlooms:[{k:Math.floor(Lm*0.55), size:HR(22,28)*hsc, shape:shpH(0.70,1.05)}]}
    ];
    /* fit the vine inside the flanking canvas (else it overflows and the orchids
       get clipped off-canvas — this is the step that keeps it compact + lush) */
    var mdx=w*0.20, mdyf=(this.side==='left'?0.80:0.64);
    this.strands.forEach(function(s){
      var mdy=h*mdyf;
      var ax=s.pts[0].x, ay=s.pts[0].y, mx=0, my=0, i;
      for(i=0;i<s.pts.length;i++){ var dx=Math.abs(s.pts[i].x-ax); if(dx>mx)mx=dx; var dy=Math.abs(s.pts[i].y-ay); if(dy>my)my=dy; }
      var scx=mx>mdx?mdx/mx:1, scy=my>mdy?mdy/my:1;
      for(i=0;i<s.pts.length;i++){ s.pts[i].x=ax+(s.pts[i].x-ax)*scx; s.pts[i].y=ay+(s.pts[i].y-ay)*scy; }
    });
    this.lastG=-1;
  };
  Field.prototype.render=function(g,wind){
    var ctx=this.ctx; if(!ctx) return;
    ctx.clearRect(0,0,this.w,this.h);
    ctx.globalCompositeOperation='source-over';
    ctx.lineCap='round'; ctx.lineJoin='round';
    var cols=this.cols, lite=this.lite;
    var owf=(lite && window.innerWidth<=600)?0.5:1;
    for(var s=0;s<this.strands.length;s++){
      var st=this.strands[s], pts=st.pts, len=pts.length;
      var local=Math.max(0,Math.min(1,(g-st.off)/(1-st.off)));
      local=1-Math.pow(1-local,1.6);
      var n=Math.floor(local*(len-1));
      if(n<1) continue;
      var anchor=pts[0], bend=wind*st.wf*(lite?0.5:1);
      function TP(k){
        var p=pts[k];
        var a=bend*Math.pow(k/len,1.5)*1.6;
        if(lite) a=Math.max(-0.08,Math.min(0.08,a));
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
      /* cybersigilism thorns (heading vines run the desktop-weight path; small canvas keeps them fine) */
      var mob=this.mob, cbf=Math.max(0.4,Math.min(1,this.w/420))*(mob?0.68:1);
      var CSTEP=Math.max(4,Math.round(len/(mob?15:24)));
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
        if(!mob || idx%2===0){
          var clen2=clen*(mob?0.42:0.5), cperp2=ctang-cside*1.15;
          var tx2=CA.x+Math.cos(cperp2)*clen2, ty2=CA.y+Math.sin(cperp2)*clen2;
          ctx.beginPath();
          ctx.moveTo(CA.x-Math.cos(ctang)*cbw*0.7, CA.y-Math.sin(ctang)*cbw*0.7);
          ctx.lineTo(tx2,ty2);
          ctx.lineTo(CA.x+Math.cos(ctang)*cbw*0.7, CA.y+Math.sin(ctang)*cbw*0.7);
          ctx.closePath(); ctx.fill();
        }
        if(!mob){
          ctx.globalAlpha=0.55;
          ctx.beginPath(); ctx.arc(tx+Math.cos(cperp)*4*cbf, ty+Math.sin(cperp)*4*cbf, 1.0*cbf, 0, 6.2832); ctx.fill();
          if(idx%2===0){ ctx.beginPath(); ctx.arc(tx+Math.cos(cperp)*9*cbf, ty+Math.sin(cperp)*9*cbf, 0.8*cbf, 0, 6.2832); ctx.fill(); }
        }
      }
      for(var b=0;b<st.buds.length;b++){
        var bud=st.buds[b];
        if(bud.k>=n||bud.k<3) continue;
        var be=Math.min(1,(n-bud.k)/14); be=1-Math.pow(1-be,2);
        var bp=TP(bud.k), bq=TP(bud.k-3);
        var bang=Math.atan2(bp.y-bq.y,bp.x-bq.x)+Math.PI/2+bud.side*0.55;
        drawBud(ctx,bp.x,bp.y,bang,bud.size,cols,be,owf);
      }
      if(st.midBloom && st.midBloom.k<n && st.midBloom.k>5){
        var me=Math.min(1,(n-st.midBloom.k)/16); me=1-Math.pow(1-me,2);
        var mp=TP(st.midBloom.k), mq=TP(st.midBloom.k-4);
        var mang=Math.atan2(mp.y-mq.y,mp.x-mq.x)+Math.PI/2;
        drawOrchid(ctx,mp.x,mp.y,mang,st.midBloom.size,cols,me,st.midBloom.shape,owf);
      }
      if(st.extraBlooms){ for(var xb=0;xb<st.extraBlooms.length;xb++){ var XB=st.extraBlooms[xb];
        if(XB.k<n && XB.k>5){ var xe=Math.min(1,(n-XB.k)/16); xe=1-Math.pow(1-xe,2);
          var xp=TP(XB.k), xq=TP(XB.k-4); var xa=Math.atan2(xp.y-xq.y,xp.x-xq.x)+Math.PI/2;
          drawOrchid(ctx,xp.x,xp.y,xa,XB.size,cols,xe,XB.shape,owf); } } }
      if(st.bloom && local>0.88){
        var fe=(local-0.88)/0.12; fe=1-Math.pow(1-fe,3);
        var tp=TP(len-1), tq=TP(len-6);
        var fang=Math.atan2(tp.y-tq.y,tp.x-tq.x)+Math.PI/2;
        drawOrchid(ctx,tp.x,tp.y,fang,st.bloom,cols,fe,st.shape,owf);
      }
    }
    if(TEX.complete && TEX.naturalWidth){
      ctx.globalCompositeOperation='source-atop';
      ctx.globalAlpha=0.5;
      ctx.drawImage(TEX,0,0,this.w,this.h);
      ctx.globalCompositeOperation='source-over';
      ctx.globalAlpha=1;
    }
  };

  function init(){
    /* big section titles: <section> <h2> without an inline font-size (that marks the
       smaller secondary headings), excluding the page hero */
    var heads=[].slice.call(document.querySelectorAll('section h2')).filter(function(h){
      if(h.closest('.hero')) return false;
      if(/font-size/i.test(h.getAttribute('style')||'')) return false;
      if(h.querySelector('.vine-head')) return false;
      /* typewriter.js runs first and blanks the text on init, so read the full title
         from its data-full attribute (falling back to any remaining text) */
      var txt=(h.getAttribute('data-full')||h.textContent||'').replace(/\s+/g,' ').trim();
      return txt.length>0;
    });
    if(!heads.length) return;

    var gcss=document.createElement('style');
    gcss.textContent=
       '.vine-head{position:relative;display:inline-block;}'
      +'.head-swirl{position:absolute;top:50%;width:240px;height:160px;pointer-events:none;opacity:0;z-index:0;transform:translateY(-50%);will-change:opacity;}'
      +'.head-swirl canvas{position:absolute;top:50%;left:50%;width:160px;height:240px;display:block;}'
      +'.head-swirl.hs-left{right:100%;margin-right:14px;}'
      +'.head-swirl.hs-right{left:100%;margin-left:14px;}'
      +'.head-swirl.hs-left canvas{transform:translate(-50%,-50%) rotate(-90deg);}'
      +'.head-swirl.hs-right canvas{transform:translate(-50%,-50%) rotate(90deg);}'
      +'@media(max-width:900px){.head-swirl{width:150px;height:104px;}.head-swirl canvas{width:104px;height:150px;}}'
      +'@media(max-width:600px){.head-swirl{width:76px;height:52px;}.head-swirl canvas{width:52px;height:76px;}}';
    document.head.appendChild(gcss);

    var borderFields=[];
    heads.forEach(function(h2){
      var sec=h2.closest('section')||h2.parentElement;
      var span=document.createElement('span'); span.className='vine-head';
      while(h2.firstChild) span.appendChild(h2.firstChild);
      h2.appendChild(span);
      [['left',true],['right',true]].forEach(function(sInfo){
        var d=document.createElement('div'); d.className='head-swirl hs-'+sInfo[0];
        var cv=document.createElement('canvas'); d.appendChild(cv); span.appendChild(d);
        var f=new Field(d, sInfo[1]); f.sec=sec; f.h2=h2; f.side=sInfo[0]; f.fade=0; f.seed(); f.g=0;
        borderFields.push(f);
      });
    });
    TEX.onload=function(){ borderFields.forEach(function(f){ f.lastG=-1; }); };
    if(!borderFields.length) return;

    var wind=0, windV=0;
    window.addEventListener('mousemove', function(e){ windV+=(e.movementX||0)*0.00002; }, {passive:true});
    var lastTime=performance.now();
    function loop(now){
      var dt=Math.min(now-lastTime,80); lastTime=now;
      windV+=(0-wind)*0.005; windV*=0.96; wind+=windV;
      for(var j=0;j<borderFields.length;j++){
        var bf=borderFields[j]; if(!bf.ctx) continue;
        var r=bf.sec.getBoundingClientRect(), vh=window.innerHeight;
        var vis=(r.bottom>40 && r.top<vh-40);
        /* gate growth on the title being fully typed (typewriter.js) so the grow-in
           is seen with the swirls in place, not hidden behind the typing text */
        var h2=bf.h2, full=h2 && h2.getAttribute('data-full');
        var typed=!full || ((h2.textContent||'').replace(/\s+/g,' ').trim().length >= full.length);
        var prog=typed ? Math.max(0,Math.min(1,(vh*0.92 - r.top)/(vh*0.5))) : 0;
        var bge=(prog>bf.g)?0.94:0.90;   /* grow slower; reverse-grow snappier */
        bf.g+=(prog-bf.g)*(1-Math.pow(bge, dt/16.7));
        bf.fade+=((vis?1:0)-bf.fade)*0.28;
        bf.el.style.opacity=bf.fade.toFixed(3);
        if(Math.abs(bf.g-bf.lastG)>0.0008 || Math.abs(wind-bf.lastW)>0.0006){
          bf.render(bf.g, wind); bf.lastG=bf.g; bf.lastW=wind;
        }
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    new MutationObserver(function(){ borderFields.forEach(function(f){ f.seed(); f.g=0; }); })
      .observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(function(){ borderFields.forEach(function(f){ f.seed(); }); },300); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

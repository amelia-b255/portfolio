#!/usr/bin/env python3
"""Mark every page of an installed draft as archived.

usage: inject.py <site-root> <slug> "<label>"

head: noindex + a storage shim so the draft's saved settings (theme etc.)
      never touch the live site's
body: a small fixed "← drafts" pill back to /drafts.html (not inside iframes;
      #thumb in the URL hides it and any splash popup, for thumbnails)
"""
import os, re, sys

root, slug, label = sys.argv[1], sys.argv[2], sys.argv[3]
MARK = "<!-- website-drafts archive -->"

HEAD = MARK + """
<meta name="robots" content="noindex">
<script>
(function(){try{
  var P='draft-%(slug)s:',S=Storage.prototype,g=S.getItem,t=S.setItem,r=S.removeItem,k=S.key;
  S.getItem=function(x){return g.call(this,P+x);};
  S.setItem=function(x,v){return t.call(this,P+x,v);};
  S.removeItem=function(x){return r.call(this,P+x);};
  S.clear=function(){for(var i=this.length-1;i>=0;i--){var kk=k.call(this,i);if(kk&&kk.indexOf(P)===0)r.call(this,kk);}};
}catch(e){}})();
</script>
"""

PILL = """<script>
(function(){try{
  if(location.hash.indexOf('thumb')>-1){
    var st=document.createElement('style');
    st.textContent='#spotlight-overlay,#splash-overlay,.splash-overlay,#splash,.splash{display:none!important}*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important}';
    (document.head||document.documentElement).appendChild(st);
    return;
  }
  if(window.top!==window.self) return;
  function add(){
    if(document.querySelector('[data-draft-pill]')) return;
    var host=document.createElement('div');
    host.setAttribute('data-draft-pill','');
    host.style.cssText='position:fixed;left:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:2147483647;';
    var sh=host.attachShadow?host.attachShadow({mode:'open'}):host;
    sh.innerHTML='<style>'
      +'a{all:initial;display:inline-flex;align-items:center;gap:7px;box-sizing:border-box;cursor:pointer;'
      +'font:700 11px/1 "Space Mono",ui-monospace,Menlo,monospace;letter-spacing:.08em;'
      +'color:#f2eddd;background:#c2381c;padding:11px 15px;border-radius:999px;'
      +'box-shadow:0 6px 22px rgba(38,16,20,.32);-webkit-tap-highlight-color:transparent;'
      +'transition:background .2s ease,transform .2s ease}'
      +'a:hover{background:#8e2110;transform:translateY(-1px)}'
      +'i{font-style:normal;font-weight:400;opacity:.78}'
      +'</style><a href="%(up)sdrafts.html">\\u2190 all drafts <i>\\u00b7 %(label)s</i></a>';
    document.body.appendChild(host);
  }
  if(document.body) add(); else document.addEventListener('DOMContentLoaded',add);
}catch(e){}})();
</script>
"""

base = os.path.join(root, "drafts", slug)
n = 0
for dirpath, _, files in os.walk(base):
    for f in files:
        if not f.lower().endswith((".html", ".htm")):
            continue
        fp = os.path.join(dirpath, f)
        s = open(fp, encoding="utf-8", errors="replace").read()
        if MARK in s:
            continue
        depth = len(os.path.relpath(dirpath, root).split(os.sep))
        head = HEAD % {"slug": slug}
        pill = PILL % {"up": "../" * depth, "label": label}
        m = re.search(r"<head[^>]*>", s, re.I) or re.search(r"<html[^>]*>", s, re.I)
        s = s[:m.end()] + "\n" + head + s[m.end():] if m else head + s
        idx = s.lower().rfind("</body>")
        s = s[:idx] + pill + s[idx:] if idx >= 0 else s + pill
        open(fp, "w", encoding="utf-8").write(s)
        n += 1
print(slug, "pages marked:", n)

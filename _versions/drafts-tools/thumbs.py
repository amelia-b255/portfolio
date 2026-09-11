import subprocess, os
from PIL import Image, ImageFilter
S=os.path.dirname(os.path.abspath(__file__)); OUT="/Users/ameliabobbin/dreamweaver/drafts/thumbs"
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
pages={"oct-2025":"drafts/oct-2025/graphic-design.html","mar-2026":"drafts/mar-2026/index.html",
 "apr-2026":"drafts/apr-2026/index.html","jun-2026":"drafts/jun-2026/index.html",
 "aug-2026":"drafts/aug-2026/index.html","aug-2026-redesign":"drafts/aug-2026-redesign/index.html",
 "current":"index.html"}
def shot(url,png,w,h,dpr):
    # headless Chrome writes the file at --timeout but can linger afterwards
    if os.path.exists(png): return
    subprocess.run(["perl","-e","alarm 20; exec @ARGV",CH,"--headless=new","--disable-gpu","--hide-scrollbars",
      "--no-first-run","--mute-audio","--user-data-dir="+S+"/chrome-thumb","--window-size=%d,%d"%(w,h),
      "--force-device-scale-factor=%d"%dpr,"--timeout=8000","--screenshot="+png,url],
      stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
def phone(url,png):
    # headless windows can't go below ~500px wide, so a true 390px phone
    # viewport comes from an iframe, cropped out afterwards
    if os.path.exists(png): return
    wrap=S+"/wrap-phone.html"
    open(wrap,"w").write('<body style="margin:0"><iframe src="%s" style="width:390px;height:844px;border:0;display:block"></iframe>'%url)
    tmp=png+".full.png"
    shot("file://"+wrap,tmp,600,900,2)
    if os.path.exists(tmp):
        Image.open(tmp).crop((0,0,780,1688)).save(png); os.remove(tmp)
for slug,pg in pages.items():
    url="http://localhost:8090/"+pg+"#thumb"
    lp=S+"/thumbraw/%s.png"%slug; pp=S+"/thumbraw/%s-phone.png"%slug
    shot(url,lp,1440,900,1); phone(url,pp)
    for src,dst,size in [(lp,OUT+"/%s.webp"%slug,(1200,750)),(pp,OUT+"/%s-phone.webp"%slug,(400,866))]:
        if os.path.exists(src):
            Image.open(src).convert("RGB").resize(size,Image.LANCZOS).save(dst,"WEBP",quality=82,method=6)
            print("ok",dst)
        else: print("MISSING",src)
# homepage card cover: four drafts fanned oldest (back) to today (front)
W,H=1600,1200; cv=Image.new("RGB",(W,H),(224,219,203))
for i,slug in enumerate(["oct-2025","apr-2026","jun-2026","current"]):
    im=Image.open(S+"/thumbraw/%s.png"%slug).convert("RGB").resize((1000,625),Image.LANCZOS)
    x,y=50+180*i,50+160*i
    sh=Image.new("L",(W,H),0); sh.paste(90,(x+14,y+18,x+1014,y+643)); sh=sh.filter(ImageFilter.GaussianBlur(22))
    cv.paste(Image.new("RGB",(W,H),(90,30,20)),(0,0),sh)
    cv.paste(Image.new("RGB",(1002,627),(150,120,105)),(x-1,y-1)); cv.paste(im,(x,y))
cv.resize((1200,900),Image.LANCZOS).save(OUT+"/cover.webp","WEBP",quality=82,method=6); print("ok cover")

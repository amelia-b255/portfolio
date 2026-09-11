#!/usr/bin/env python3
"""Rebuild one historical commit of the portfolio as a self-contained folder.

usage: snapshot.py <short-sha> <out-dir> <live-root>

- pulls every root *.html of that commit, then follows every reference
  (html attrs, css url(), quoted strings in js) to files that existed in
  that commit's tree
- images that are not webp are converted to webp (EXIF-rotated, capped
  at 2400px) and references are rewritten
- files identical to the same path in the live site (same blob sha, e.g.
  the LFS videos) are NOT copied; the server falls back to the live root
- prints a report of what was copied / converted / skipped / missing
"""
import html, io, json, os, re, subprocess, sys, urllib.parse, urllib.request, hashlib
from concurrent.futures import ThreadPoolExecutor

REPO = "amelia-b255/portfolio"
SCR = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(SCR, "blobcache")
os.makedirs(CACHE, exist_ok=True)

short, out, live = sys.argv[1], sys.argv[2], sys.argv[3]
# path from the snapshot's top folder back to the live site root
PREFIX = sys.argv[4] if len(sys.argv) > 4 else "../../"

def api(url):
    with urllib.request.urlopen(url, timeout=60) as r:
        return json.load(r)

tree_path = os.path.join(SCR, "trees", short + ".json")
tree = json.load(open(tree_path))
full = tree["sha"]
blobs = {x["path"]: x for x in tree["tree"] if x["type"] == "blob"}

# live tree: path -> blob sha
live_tree = {}
for line in subprocess.run(["git", "-C", live, "ls-tree", "-r", "HEAD"],
                           capture_output=True, text=True).stdout.splitlines():
    meta, path = line.split("\t", 1)
    if path.startswith('"'):
        path = json.loads(path)
    live_tree[path] = meta.split()[2]
live_by_sha = {}
for pth, sha in sorted(live_tree.items()):
    live_by_sha.setdefault(sha, pth)

TEXT = {".html", ".htm", ".css", ".js", ".json", ".svg", ".txt", ".xml"}
IMG = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tif", ".tiff", ".heic"}
VIDEO = {".mp4", ".mov", ".m4v", ".webm"}

def ext(p):
    return os.path.splitext(p)[1].lower()

def fetch_blob(path):
    b = blobs[path]
    cp = os.path.join(CACHE, b["sha"])
    if not os.path.exists(cp):
        url = "https://raw.githubusercontent.com/%s/%s/%s" % (
            REPO, full, urllib.parse.quote(path))
        with urllib.request.urlopen(url, timeout=300) as r:
            data = r.read()
        with open(cp + ".tmp", "wb") as f:
            f.write(data)
        os.replace(cp + ".tmp", cp)
    return cp

def is_lfs_pointer(cp):
    with open(cp, "rb") as f:
        return f.read(40).startswith(b"version https://git-lfs")

def fetch_real(path):
    """blob content, following a Git LFS pointer to the real media file"""
    cp = fetch_blob(path)
    if not is_lfs_pointer(cp):
        return cp
    lp = cp + ".lfs"
    if not os.path.exists(lp):
        url = "https://media.githubusercontent.com/media/%s/%s/%s" % (
            REPO, full, urllib.parse.quote(path))
        with urllib.request.urlopen(url, timeout=600) as r:
            data = r.read()
        with open(lp + ".tmp", "wb") as f:
            f.write(data)
        os.replace(lp + ".tmp", lp)
    return lp

STR_RE = re.compile(r'''"([^"\n]{1,400})"|'([^'\n]{1,400})'|`([^`\n]{1,400})`|url\(\s*([^)'"\s][^)]*?)\s*\)''')

def candidates(text):
    for m in STR_RE.finditer(text):
        s = next(g for g in m.groups() if g is not None)
        yield m.start(), s
        # srcset-ish lists
        if "," in s or " " in s:
            for part in re.split(r"[,\s]+", s):
                if part and part != s:
                    yield m.start(), part

def resolve(base_dir, token):
    t = token.strip()
    if not t or t.startswith(("data:", "mailto:", "tel:", "javascript:", "#", "//")):
        return None
    t = re.sub(r"^https?://(www\.)?(ameliab-portfolio\.netlify\.app|ameliabobbin\.com)", "", t)
    if re.match(r"^[a-z]+:", t, re.I):
        return None
    t = t.split("#", 1)[0].split("?", 1)[0]
    if not t:
        return None
    try:
        t = urllib.parse.unquote(html.unescape(t))
    except Exception:
        pass
    if t.startswith("/"):
        p = os.path.normpath(t.lstrip("/"))
    else:
        p = os.path.normpath(os.path.join(base_dir, t))
    if p.startswith(".."):
        return None
    if p in blobs:
        return p
    if p + "/index.html" in blobs:
        return p + "/index.html"
    if (p == "." or p == "") and "index.html" in blobs:
        return "index.html"
    return None

queue = sorted(p for p in blobs if p.endswith(".html") and "/" not in p)
seen = set(queue)
refs = {}          # text path -> list of (token, resolved)
i = 0
missing_tokens = set()
while i < len(queue):
    p = queue[i]; i += 1
    if ext(p) not in TEXT:
        continue
    cp = fetch_blob(p)
    text = open(cp, "rb").read().decode("utf-8", "replace")
    base = os.path.dirname(p)
    # strings inside scripts are resolved by the page that runs them, so a js
    # file under shared/ usually means paths from the site root
    bases = [base, ""] if ext(p) == ".js" and base else [base]
    lst = []
    for _, tok in candidates(text):
        r = None
        for b in bases:
            r = resolve(b, tok)
            if r:
                break
        if r:
            lst.append((tok, r, b))
            if r not in seen:
                seen.add(r); queue.append(r)
        elif re.search(r"\.(png|jpe?g|gif|webp|mp4|mov|pdf|css|js|svg|woff2?|ttf|otf)(\?|#|$)", tok.strip(), re.I) \
                and not tok.strip().startswith(("http", "data:", "//")) and len(tok) < 200:
            missing_tokens.add((p, tok.strip()))
    refs[p] = lst

# pre-fetch binaries in parallel
video_map = {}     # old path -> identical file already on the live site
bins = []
for p in queue:
    if ext(p) in TEXT:
        continue
    if ext(p) in VIDEO and blobs[p]["sha"] in live_by_sha:
        video_map[p] = live_by_sha[blobs[p]["sha"]]
    elif ext(p) not in VIDEO:
        bins.append(p)
with ThreadPoolExecutor(8) as ex:
    list(ex.map(fetch_real, bins))

from PIL import Image, ImageOps

def webp_name(p):
    stem, e = os.path.splitext(p)
    cand = stem + ".webp"
    if cand in blobs and cand not in rename.values():
        cand = stem + "-" + e.lstrip(".").lower() + ".webp"
    return cand

rename = {}
report = {"copied": 0, "converted": 0, "live_fallback": [], "lfs_missing": [], "bytes": 0}
os.makedirs(out, exist_ok=True)

def convert(src_cp, dst):
    key = hashlib.sha1(open(src_cp, "rb").read()).hexdigest()
    cached = os.path.join(CACHE, key + ".webp")
    if not os.path.exists(cached):
        im = Image.open(src_cp)
        n = getattr(im, "n_frames", 1)
        if n > 1:
            subprocess.run(["gif2webp", "-q", "80", "-m", "5", "-mixed", "-quiet", src_cp, "-o", cached + ".tmp"], check=True)
        else:
            im = ImageOps.exif_transpose(im)
            if im.mode in ("P", "LA", "PA"):
                im = im.convert("RGBA")
            elif im.mode in ("CMYK", "I;16", "I", "F", "L;16"):
                im = im.convert("RGB")
            elif im.mode not in ("RGB", "RGBA", "L"):
                im = im.convert("RGBA")
            w, h = im.size
            m = max(w, h)
            if m > 2400:
                s = 2400 / m
                im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
            im.save(cached + ".tmp", "WEBP", quality=84, method=6)
        os.replace(cached + ".tmp", cached)
    os.makedirs(os.path.dirname(dst) or ".", exist_ok=True)
    subprocess.run(["cp", "-c", cached, dst], check=True)

for p in queue:
    e = ext(p)
    if e in TEXT:
        continue
    if p in video_map:
        report["live_fallback"].append(p)
        continue
    if e in VIDEO:
        # a video that has since left the live site: bring the real file back
        report["lfs_missing"].append(p)
        cp = fetch_real(p)
        dst = os.path.join(out, p)
        os.makedirs(os.path.dirname(dst) or ".", exist_ok=True)
        subprocess.run(["cp", "-c", cp, dst], check=True)
        continue
    cp = fetch_real(p)
    if e in IMG:
        np_ = webp_name(p)
        rename[p] = np_
        convert(cp, os.path.join(out, np_))
        report["converted"] += 1
    else:
        dst = os.path.join(out, p)
        os.makedirs(os.path.dirname(dst) or ".", exist_ok=True)
        src = cp
        # an oversized webp that isn't shared with the live site: re-encode it
        # the same way the conversions are done, keeping whichever is smaller
        if e == ".webp" and blobs[p]["sha"] not in live_by_sha and os.path.getsize(cp) > 600_000:
            small = cp + ".small.webp"
            if not os.path.exists(small):
                try:
                    im = Image.open(cp)
                    if getattr(im, "n_frames", 1) == 1:
                        w, h = im.size
                        m = max(w, h)
                        if m > 2400:
                            im = im.resize((round(w * 2400 / m), round(h * 2400 / m)), Image.LANCZOS)
                        im.save(small + ".tmp", "WEBP", quality=84, method=6)
                        if os.path.getsize(small + ".tmp") < os.path.getsize(cp):
                            os.replace(small + ".tmp", small)
                        else:
                            os.remove(small + ".tmp")
                except Exception:
                    pass
            if os.path.exists(small):
                src = small
        subprocess.run(["cp", "-c", src, dst], check=True)
        report["copied"] += 1

def rewrite_token(tok, resolved, from_dir):
    new = rename.get(resolved)
    t = tok
    if resolved in video_map:
        depth = len([x for x in from_dir.split("/") if x])
        tail = ""
        mq = re.search(r"[?#].*$", t)
        if mq:
            tail = mq.group(0)
        return "../" * depth + PREFIX + urllib.parse.quote(video_map[resolved]) + tail
    # root-absolute or own-domain absolute -> relative (stay inside the archive)
    m = re.match(r"^(https?://(www\.)?(ameliab-portfolio\.netlify\.app|ameliabobbin\.com))?(/[^/].*|/)$", t)
    if m and (m.group(1) or t.startswith("/")):
        path_part = m.group(4)
        rel = os.path.relpath(path_part.lstrip("/") or ".", from_dir or ".")
        tail = ""
        if path_part.endswith("/") and rel != ".":
            tail = "/"
        t = (rel if rel != "." else "./") + tail
    if new:
        old_base = os.path.basename(resolved)
        new_base = os.path.basename(new)
        enc_old = urllib.parse.quote(old_base)
        if old_base in t:
            t = t[::-1].replace(old_base[::-1], new_base[::-1], 1)[::-1]
        elif enc_old in t:
            t = t[::-1].replace(enc_old[::-1], urllib.parse.quote(new_base)[::-1], 1)[::-1]
        elif old_base.replace(" ", "%20") in t:
            t = t[::-1].replace(old_base.replace(" ", "%20")[::-1], new_base.replace(" ", "%20")[::-1], 1)[::-1]
    return t

for p in queue:
    if ext(p) not in TEXT:
        continue
    cp = fetch_blob(p)
    text = open(cp, "rb").read().decode("utf-8", "replace")
    base = os.path.dirname(p)
    subs = {}
    for tok, r, b in refs.get(p, []):
        nt = rewrite_token(tok, r, b)
        if nt != tok:
            subs[tok] = nt
    if subs:
        def rep(m):
            g = next(x for x in m.groups() if x is not None)
            ng = g
            if g in subs:
                ng = subs[g]
            else:
                for part in sorted(set(re.split(r"[,\s]+", g)), key=len, reverse=True):
                    if part in subs:
                        ng = ng.replace(part, subs[part])
            return m.group(0).replace(g, ng, 1) if ng != g else m.group(0)
        text = STR_RE.sub(rep, text)
    dst = os.path.join(out, p)
    os.makedirs(os.path.dirname(dst) or ".", exist_ok=True)
    open(dst, "w", encoding="utf-8").write(text)

json.dump({"commit": full, "rename": rename, "report": report,
           "unresolved_refs": sorted(missing_tokens)},
          open(os.path.join(SCR, "report-%s.json" % short), "w"), indent=1)
size = int(subprocess.run(["du", "-sk", out], capture_output=True, text=True).stdout.split()[0])
print(short, "files:", len(queue), "converted:", report["converted"], "copied:", report["copied"],
      "live-fallback:", len(report["live_fallback"]), "lfs-missing:", report["lfs_missing"],
      "unresolved:", len(missing_tokens), "size KB:", size)

WEBSITE DRAFTS ARCHIVE (built 2026-09-11)

drafts.html lists the main versions of the site; each one lives in
drafts/<slug>/ as a full copy of that version's pages, rebuilt from the
GitHub history (github.com/amelia-b255/portfolio, public).

  slug                commit    date         what it is
  oct-2025            a787aa6   2025-10-18   first live site (pink)
  mar-2026            5bd05d4   2026-03-29   banner, AB logo, orchid hero
  apr-2026            cc9bcfc   2026-04-25   dark mode, $5 prints pop-up
  jun-2026            d21cb44   2026-06-28   textured red theme
  aug-2026            61d26b4   2026-08-28   original design, final (tag original-site-2026-08-28)
  aug-2026-redesign   2d84a8c   2026-08-31   redesign launch, first phone layout (tag phone-v1-2026-09-10)

How a draft is built (Python 3 + Pillow, run from this folder):
  1. trees/<sha>.json   = GitHub API git/trees/<full sha>?recursive=1
  2. python3 snapshot.py <sha> ../../drafts/<slug> /Users/ameliabobbin/dreamweaver ../../
       follows every page reference; converts png/jpg/gif to webp (max 2400px);
       re-encodes oversized webps; videos identical to a live file point at the
       live copy (../../music/...), others are restored from Git LFS
  3. python3 inject.py /Users/ameliabobbin/dreamweaver <slug> "<label>"
       adds noindex, keeps the draft's saved settings apart from the live
       site's, and the "← all drafts" pill
  4. python3 thumbs.py  (needs the local server on :8090) — laptop + phone
       screenshots into drafts/thumbs/, plus the homepage card cover
Then add a section for it in drafts.html.

Known historical quirk fixed by hand: mar-2026/music.html pointed at one.JPG
(the file was one.jpg) — now one.webp.

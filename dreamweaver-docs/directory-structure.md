# Directory Structure

```
dreamweaver/
│
├── index.html                     # Entry point / home page
├── graphic-design.html            # Main design portfolio
├── music.html                     # Music & performance
├── musiccv.html                   # Musical theatre CV
├── coding.html                    # Coding projects showcase
├── brand.html                     # Brand identity case study
├── design-cv.html                 # Design CV
├── photography.html               # Photography portfolio
├── extras.html                    # Drawings, posters & print
├── shortfilm.html                 # Short film showcase
├── theatre.html                   # Theatre production design
├── tram.html                      # Light rail safety campaign
│
├── projects/                      # Interactive coding projects
│   ├── otter-aquarium/            # p5.js 3D aquarium with WebGL shaders
│   │   ├── index.html
│   │   ├── shader.vert            # Vertex shader
│   │   ├── shader.frag            # Fragment shader
│   │   └── assets/
│   │       └── Arial.ttf
│   ├── moth-lifecycle/            # p5.js moth animation with audio
│   │   ├── index.html
│   │   └── assets/
│   │       ├── *.mp3              # Ambient sound effects
│   │       └── Ralsihten.otf      # Custom font
│   ├── hand-tracking/             # ML5.js neural network hand tracking
│   │   └── index.html
│   └── low-poly/                  # p5.js low-poly terrain generator
│       └── index.html
│
├── *.jpg / *.png / *.jpeg         # ~100+ image assets (flat in root)
├── *.mov / *.mp4                  # Video files (tracked by Git LFS)
├── *.pdf                          # CV and document downloads
│
├── .gitattributes                 # Git LFS configuration
├── readme.md                      # Brief project readme
├── DEV_SERVING.md                 # Local development instructions
├── OPTIMIZATION_SUMMARY.md        # Image optimization log
│
└── dreamweaver-docs/              # This documentation
```

## Key Observations

- **Flat asset structure**: All images and videos live in the project root alongside the HTML files. There is no `assets/`, `images/`, or `static/` folder at the top level.
- **Self-contained projects**: Each interactive project under `projects/` has its own `index.html` and local assets.
- **No `src/` or `dist/`**: Since there's no build step, the source files _are_ the served files.
- **Large repo size**: ~4.7 GB total, mostly from video files managed via Git LFS.

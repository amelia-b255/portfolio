# Assets & Media

## Organization

All top-level media files (images, videos, PDFs) are stored **flat in the project root** alongside the HTML files. There is no `assets/` or `images/` directory at the top level.

Project-specific assets (fonts, audio) are stored under each project's `assets/` subdirectory.

## Images

### Location
Root directory (`/`)

### Formats
- `.png` - Artwork, designs, graphics with transparency
- `.jpg` / `.jpeg` - Photographs, design work

### Naming Convention
Descriptive, lowercase names:
- `shortfilmposter.png`
- `pinkorchid.png`
- `addisonrae.png`
- `brandfinal.png`
- `tram1.png`, `tram2.png`, etc.

### Optimization
Images have been compressed for web delivery (documented in `OPTIMIZATION_SUMMARY.md`). Reductions of 60-95% in file size were achieved while maintaining visual quality.

## Videos

### Location
Root directory (`/`)

### Formats
- `.mp4` - Primary video format
- `.mov` - Additional video format

### Files
- `film.mp4` - Main short film
- `filmtrailer.mp4` - Film trailer
- `1.mov` through `15.mov` - Numbered performance/music videos

### Storage
Videos are tracked by **Git LFS** (Large File Storage) to keep the main Git repository manageable. The `.gitattributes` file configures this:

```
*.mov filter=lfs diff=lfs merge=lfs -text
*.mp4 filter=lfs diff=lfs merge=lfs -text
```

### Embedding
Videos are embedded using standard HTML5 `<video>` tags:

```html
<video controls controlslist="nodownload" preload="metadata">
    <source src="film.mp4" type="video/mp4">
</video>
```

- `controls` - Shows player controls
- `controlslist="nodownload"` - Hides the download button
- `preload="metadata"` - Loads only metadata on page load for performance

## Audio

### Location
`projects/moth-lifecycle/assets/`

### Files
- `slow-burner-ambient-184746.mp3` - Ambient background music
- `night-sounds-*.mp3` - Night environment audio
- `flying-moth-1-90806.mp3` - Moth wing sound effect

### Usage
Loaded and played through p5.js sound library within the moth lifecycle project. Multiple tracks are crossfaded for an immersive audio experience.

## Fonts

### Web Fonts (CDN)
Loaded via `@import` in CSS - see [Styling & Design System](./styling-and-design-system.md).

### Local Fonts
| Font           | Location                              | Used In          |
| -------------- | ------------------------------------- | ---------------- |
| Arial.ttf      | `projects/otter-aquarium/assets/`     | Otter aquarium   |
| Ralsihten.otf  | `projects/moth-lifecycle/assets/`     | Moth lifecycle   |

## PDFs

### Location
Root directory (`/`)

### Files
CV and document downloads linked from the portfolio pages (design CV, music CV).

## Size Considerations

The total repository is approximately **4.7 GB**, with the vast majority of that being video files. Images have been optimized but the video files remain large (some individual `.mov` files are 600 MB - 1.4 GB).

Git LFS ensures that cloning the repository doesn't download all video file versions, only the latest pointers. The actual video content is fetched on demand.

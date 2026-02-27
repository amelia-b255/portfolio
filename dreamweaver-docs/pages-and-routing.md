# Pages & Routing

## How Routing Works

There is no client-side router. Each page is a standalone HTML file. Navigation between pages uses standard `<a href="...">` links with relative paths (e.g., `href="music.html"`).

Netlify serves these files directly. Visiting `/music.html` serves `music.html` from the root.

## Page Map

### Main Portfolio Pages

| File                 | URL Path              | Description                                  |
| -------------------- | --------------------- | -------------------------------------------- |
| `index.html`         | `/`                   | Home / landing page                          |
| `graphic-design.html`| `/graphic-design.html`| Main graphic design portfolio                |
| `music.html`         | `/music.html`         | Music & performance with embedded videos     |
| `musiccv.html`       | `/musiccv.html`       | Musical theatre CV and qualifications        |
| `coding.html`        | `/coding.html`        | Coding projects showcase with syntax highlighting |
| `brand.html`         | `/brand.html`         | Brand identity case study                    |
| `design-cv.html`     | `/design-cv.html`     | Design CV page                               |
| `photography.html`   | `/photography.html`   | Photography gallery                          |
| `extras.html`        | `/extras.html`        | Drawings, orchid posters, calendar, print    |
| `shortfilm.html`     | `/shortfilm.html`     | "Blowing Out The Candles" short film         |
| `theatre.html`       | `/theatre.html`       | Theatre production design                    |
| `tram.html`          | `/tram.html`          | Light rail safety campaign design            |

### Interactive Projects

| File                               | URL Path                            | Description                       |
| ---------------------------------- | ----------------------------------- | --------------------------------- |
| `projects/otter-aquarium/index.html` | `/projects/otter-aquarium/`       | p5.js 3D aquarium with shaders   |
| `projects/moth-lifecycle/index.html` | `/projects/moth-lifecycle/`       | p5.js moth animation with audio  |
| `projects/hand-tracking/index.html`  | `/projects/hand-tracking/`        | ML5.js hand detection            |
| `projects/low-poly/index.html`       | `/projects/low-poly/`             | p5.js terrain generator          |

## Navigation Structure

Every main page shares a consistent navigation bar defined in its own HTML. The nav contains:

```
Home | Design | Music | Photography | Coding | More ▾
                                                  ├── Theatre
                                                  ├── Extras
                                                  └── Short Film
```

The navigation is implemented as a `<header>` with:
- A logo/brand link on the left
- Navigation links on the right
- A "More" dropdown for secondary pages
- A hamburger menu button for mobile (toggled via JS)

### Mobile Navigation

On screens narrower than ~968px:
- The nav links collapse behind a hamburger icon (three lines)
- Tapping the hamburger slides the menu in from the left
- Tapping outside the menu or clicking a link closes it

## Page Template Pattern

Every main page follows this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
    <link rel="icon" href="favicon.ico">
    <!-- Google Fonts imports -->
    <style>
        /* All page CSS embedded here */
    </style>
</head>
<body>
    <header><!-- Navigation --></header>
    <section class="hero"><!-- Hero banner --></section>
    <main><!-- Page content --></main>
    <footer><!-- Footer --></footer>

    <!-- 30 decorative star divs -->
    <div class="star" style="..."></div>
    ...

    <script>
        // All page JS embedded here
    </script>
</body>
</html>
```

There is no shared template or include system - each page duplicates the navigation, footer, and star decorations.

# Styling & Design System

## CSS Architecture

There are **no external CSS files**. All styles are embedded in `<style>` tags within each HTML page's `<head>`. This means style changes need to be replicated across files if they affect shared elements like the navbar or footer.

## Typography

### Font Stack

| Font                | Usage              | Source      |
| ------------------- | ------------------ | ----------- |
| MADE Sunflower      | Display headings   | CDN Fonts   |
| Archivo Black       | Bold headings      | Google Fonts|
| IM Fell DW Pica     | Body text (serif)  | Google Fonts|
| Georgia             | Fallback body      | System      |
| Fira Code           | Code snippets      | Google Fonts|
| Arial               | UI / fallback      | System      |

### Font Imports

Fonts are loaded via `@import` in the `<style>` block:

```css
@import url('https://fonts.googleapis.com/css2?family=IM+Fell+DW+Pica&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap');
@import url('https://fonts.cdnfonts.com/css/made-sunflower');
```

## Color Palette

### Primary Colors

| Color    | Hex       | Usage                              |
| -------- | --------- | ---------------------------------- |
| Mauve    | `#8b475d` | Primary brand / headings / links   |
| Sage     | `#a8c5b5` | Accent / star decorations          |
| Dusty Pink| `#f5c1cf`| Accent / backgrounds / stars       |
| Rose     | `#d4a5a5` | Star decorations / subtle accents  |
| Cream    | `#f5e6d0` | Background tones                   |

### Background

Pages use a multi-stop gradient background:

```css
background: linear-gradient(
    135deg,
    #f5e6d0 0%,   /* cream */
    #fce4ec 25%,   /* light pink */
    #f5e6d0 50%,   /* cream */
    #e8f5e9 75%,   /* light green */
    #fce4ec 100%   /* light pink */
);
```

This creates a warm, pastel feel consistent across all pages.

## Layout Patterns

### Grid System

The site uses CSS Grid for content layouts:

```css
/* 3-column photo/project grid */
.work-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}

/* 2-column layout */
.work-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
}

/* Auto-fit responsive grid */
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
```

### Responsive Breakpoints

| Breakpoint | Target         | Key Changes                            |
| ---------- | -------------- | -------------------------------------- |
| `968px`    | Tablet / small | Nav collapses to hamburger, grids go 2-col or 1-col |
| `480px`    | Phone          | Single column, reduced font sizes, smaller padding |

### Fixed Navigation Bar

```css
header {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    z-index: 1000;
}
```

The navbar uses a frosted glass effect (`backdrop-filter: blur`) and stays pinned to the top of the viewport.

## Animations

### Floating Stars

30 small decorative `<div class="star">` elements are scattered across each page with fixed positioning. They use a `gentleFloat` keyframe animation:

```css
@keyframes gentleFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
    50%      { transform: translateY(-20px) rotate(180deg); opacity: 1; }
}

.star {
    position: fixed;
    border-radius: 50%;
    animation: gentleFloat 6s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
}
```

Each star has a unique `animation-delay` (staggered from 0s to ~8.7s) so they float independently.

### Fade-In on Scroll

Content sections use an Intersection Observer (JS) to add a `.visible` class when they enter the viewport:

```css
.fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease, transform 0.8s ease;
}
.fade-in.visible {
    opacity: 1;
    transform: translateY(0);
}
```

### Hero Animation

```css
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
}
```

### Hover Effects

Cards and grid items respond to hover with elevation:

```css
.work-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(139, 71, 93, 0.15);
}
```

## Vendor Prefixes

The CSS includes vendor prefixes for cross-browser compatibility:

```css
-webkit-backdrop-filter: blur(12px);
-webkit-animation: gentleFloat ...;
-moz-animation: gentleFloat ...;
```

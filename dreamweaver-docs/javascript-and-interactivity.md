# JavaScript & Interactivity

## Approach

All JavaScript is **vanilla ES6** with no framework or bundler. Scripts are embedded directly in `<script>` tags at the bottom of each HTML file. External libraries are loaded from CDNs.

## Shared Functionality (All Main Pages)

### Mobile Hamburger Menu

```js
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});
```

Toggles the `.active` class to show/hide the mobile navigation overlay.

### Scroll-Triggered Navbar Styling

The navbar changes padding on scroll to become more compact:

```js
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.padding = '8px 0';
    } else {
        header.style.padding = '15px 0';
    }
});
```

### Fade-In on Scroll (Intersection Observer)

Elements with class `.fade-in` animate into view when scrolled to:

```js
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
```

### Dropdown Menu

The "More" nav dropdown opens on hover/click:

```js
document.querySelector('.dropdown').addEventListener('click', function(e) {
    this.classList.toggle('active');
});
```

## Page-Specific Features

### Music Page - Mouse Parallax

Decorative stars move slightly in response to mouse movement for a parallax effect:

```js
document.addEventListener('mousemove', (e) => {
    const stars = document.querySelectorAll('.star');
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    stars.forEach((star, i) => {
        const speed = (i % 5 + 1) * 0.3;
        star.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
});
```

### Coding Page - Syntax Highlighting

Uses Prism.js (loaded from CDN) for code block highlighting:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
```

## Interactive Projects (under `projects/`)

These are standalone p5.js applications, each with their own `index.html`.

### Otter Aquarium (`projects/otter-aquarium/`)

- **Library**: p5.js v1.9.0 (WEBGL mode)
- **Features**: 3D underwater scene, custom vertex/fragment shaders (`shader.vert`, `shader.frag`), particle systems, interactive clickable objects
- **Shaders**: GLSL shaders create water/wave visual effects applied to the 3D canvas

### Moth Lifecycle (`projects/moth-lifecycle/`)

- **Library**: p5.js v1.9.0
- **Features**: Animated moth life stages, ambient audio mixing (multiple `.mp3` tracks crossfaded), particle effects, interactive controls
- **Audio**: Uses p5.sound for loading and mixing ambient sounds (`slow-burner-ambient`, `night-sounds`, `flying-moth`)
- **Font**: Custom `Ralsihten.otf` loaded locally

### Hand Tracking (`projects/hand-tracking/`)

- **Libraries**: p5.js + ML5.js (machine learning)
- **Features**: Webcam-based hand detection using a pre-trained neural network, real-time canvas visualization of detected hand landmarks

### Low Poly Landscape (`projects/low-poly/`)

- **Library**: p5.js v1.9.0
- **Features**: Procedural low-poly terrain generation, multiple color palette options, drag interaction to rotate/explore the landscape, Monument Valley-inspired aesthetics

## CDN Dependencies

| Library    | Version | CDN                                | Used In             |
| ---------- | ------- | ---------------------------------- | -------------------- |
| p5.js      | 1.9.0   | cdnjs.cloudflare.com               | All 4 projects       |
| ML5.js     | latest  | unpkg.com                          | Hand tracking        |
| Prism.js   | 1.29.0  | cdnjs.cloudflare.com               | coding.html          |

## No Build Process

There is no transpilation, minification, or bundling. The JavaScript runs as written in the browser. This keeps the setup simple but means:
- No tree-shaking or dead code elimination
- No TypeScript or JSX
- No module imports (everything is global scope or IIFE)
- Browser compatibility depends on vanilla ES6 support

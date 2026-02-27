# Overview

## What Is This Project?

A **static portfolio website** for Amelia Bobbin, a multidisciplinary artist and designer. It showcases work across graphic design, music, theatre, photography, coding, and illustration.

**Live URL**: https://ameliab-portfolio.netlify.app/
**Repository**: https://github.com/amelia-b255/portfolio

## Tech Stack

| Layer       | Technology                        |
| ----------- | --------------------------------- |
| Markup      | HTML5 (hand-written, no templates)|
| Styling     | CSS3 (inline `<style>` per page)  |
| JavaScript  | Vanilla ES6 (no framework)        |
| Libraries   | p5.js, ML5.js, Prism.js (via CDN) |
| Fonts       | Google Fonts, CDN Fonts           |
| Hosting     | Netlify (continuous deployment)   |
| Version Ctrl| Git + Git LFS (for video files)   |
| Build Step  | None - served as raw static files |

## Architecture

This is a **zero-build static site**. There is no bundler, no npm, no package.json, and no build process. Each HTML file is a self-contained page with its own embedded `<style>` and `<script>` blocks. External libraries are loaded from CDNs.

Netlify deploys the repository directly - every push to `main` triggers a deploy that serves the files as-is.

## Content Areas

| Area              | Description                                       |
| ----------------- | ------------------------------------------------- |
| Graphic Design    | Brand identity, posters, illustrations            |
| Music             | Performance videos, achievements, musical CV      |
| Photography       | Curated photo gallery                             |
| Coding            | Interactive p5.js/ML5.js projects                 |
| Theatre           | Production design work                            |
| Film              | "Blowing Out The Candles" short film               |
| Drawings & Print  | Orchid posters, calendar designs, illustrations   |

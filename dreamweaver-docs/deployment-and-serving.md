# Deployment & Serving

## Production: Netlify

### How It Works

The site is hosted on **Netlify** with continuous deployment from GitHub.

- **Repository**: https://github.com/amelia-b255/portfolio
- **Live URL**: https://ameliab-portfolio.netlify.app/
- **Branch**: `main`
- **Build command**: None (static files served directly)
- **Publish directory**: Root (`/`)

### Deploy Process

1. Push changes to the `main` branch on GitHub
2. Netlify automatically detects the push
3. Since there is no build step, Netlify serves the files as-is
4. The site is live within seconds

### What Netlify Provides

- **HTTPS** with automatic SSL certificates
- **CDN** distribution for fast global access
- **Automatic deploys** on every push to `main`
- **Deploy previews** for pull requests
- **Custom domain** support (if configured)
- **Redirect/rewrite rules** (via `_redirects` or `netlify.toml`, not currently used)

### No Build Configuration

There is no `netlify.toml`, no build command, and no `_redirects` file. Netlify serves the raw HTML/CSS/JS files directly from the repository root.

## Git LFS

Video files (`.mov`, `.mp4`) are stored using **Git Large File Storage** to avoid bloating the Git history.

### Configuration (`.gitattributes`)

```
*.mov filter=lfs diff=lfs merge=lfs -text
*.mp4 filter=lfs diff=lfs merge=lfs -text
```

### Impact on Deployment

Netlify supports Git LFS natively. When deploying, it fetches the actual video files from LFS storage and serves them alongside the rest of the site.

### Setup for New Contributors

Anyone cloning the repo needs Git LFS installed:

```bash
# Install Git LFS (macOS)
brew install git-lfs

# Initialize LFS in your git config
git lfs install

# Clone the repo (LFS files are fetched automatically)
git clone https://github.com/amelia-b255/portfolio.git
```

## Local Development

There is no dev server or hot-reload setup. To run locally, use any static file server.

### Option 1: Python (built-in)

```bash
cd /path/to/dreamweaver
python3 -m http.server 8080 --bind 0.0.0.0
```

Then open http://localhost:8080

### Option 2: Node.js http-server

```bash
# Install once
npm install -g http-server

# Run
cd /path/to/dreamweaver
http-server -p 8080 -a 0.0.0.0
```

Then open http://localhost:8080

### Option 3: Open HTML Files Directly

For basic testing, you can open any `.html` file directly in a browser. However, some features (like p5.js projects that load assets via fetch) require a proper HTTP server due to CORS restrictions.

### Testing on Other Devices (Same Network)

1. Find your local IP: `ifconfig | grep "inet "`
2. Start a server bound to `0.0.0.0` (as shown above)
3. On your phone/tablet, visit `http://YOUR_IP:8080`

## Version Control Workflow

### Branching

Development happens on `main`. The typical workflow:

1. Make changes locally
2. Test in browser with a local server
3. Commit and push to `main`
4. Netlify auto-deploys

### Commit History

The project has 100+ commits documenting iterative development. Recent work has focused on:
- Mobile responsiveness fixes
- Image optimization
- Layout adjustments
- New content sections (orchid posters, calendar)

## Summary

| Aspect           | Detail                                   |
| ---------------- | ---------------------------------------- |
| Hosting          | Netlify (free tier)                      |
| Deploy trigger   | Push to `main` on GitHub                 |
| Build step       | None                                     |
| SSL              | Automatic via Netlify                    |
| CDN              | Netlify Edge                             |
| Large files      | Git LFS for `.mov` and `.mp4`            |
| Local dev        | Any static HTTP server (python, node)    |
| CI/CD config     | None needed - zero-build deployment      |

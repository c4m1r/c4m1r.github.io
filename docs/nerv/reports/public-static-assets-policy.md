# Public & Static Assets Policy

## Overview
This document defines the strict asset placement and build output policy for `c4m1r.github.io`.

## Asset & Directory Placement

### 1. `public/` (Verbatim Static Files)
Files in `public/` are copied verbatim to the build output root (`dist/`) without transformation or hashing.
- `public/robots.txt` — Web crawler instructions.
- `public/404.html` — SPA GitHub Pages redirect handler for deep links.
- `public/favicon.ico` / icons (if added in the future).
- **POLICY**: Only place files here that must be served at a fixed, unhashed URL path. Do NOT place React code, CSS, or Vite-processed assets here.

### 2. `src/` (Application Source & Processed Assets)
All code, styling, and imported media assets belong inside `src/`.
- `src/content/` — Raw markdown articles, wiki pages, projects, and media.
- `src/styles/` — Global CSS stylesheets, theme tokens, and component styles.
- `src/themes/` — Theme-specific assets (wallpapers, icons, sound effects) imported via TS/CSS modules.
- **POLICY**: Images, audio, and video referenced in code or frontmatter must reside in `src/` to benefit from Vite hashing, bundling, and optimization.

### 3. `dist/` (Generated Production Build Artifact)
- Generated exclusively by `npm run build` (`vite build`).
- Target directory for GitHub Pages deployment (`deploy.yml`).
- **STRICT POLICY**:
  - `dist` is `.gitignore`d and must NEVER be committed to Git.
  - NEVER manually edit files inside `dist`.
  - NEVER copy `dist/assets` back into `public/` or `src/`.
  - `dist` is not a source of truth; it is disposable build output.

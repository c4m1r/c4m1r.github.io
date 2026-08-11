# Repo Size Audit

## Summary
- **Local folder size**: ~554.12 MB (Total disk usage including node_modules and build artifacts)
- **.git size**: 196.62 MB (Packed object database in `.git/objects/`)
- **GitHub reported size**: ~196 MB (Current packed commit history size)
- **Largest local folders**:
  1. `src/` (212.10 MB)
  2. `.git/` (196.62 MB)
  3. `node_modules/` (132.41 MB)
  4. `dist/` (12.78 MB)
- **Largest tracked files in current tree**:
  1. `src/apps/mediaplayer/assets/music/1JIzFhI9Lt5FyslawmHCBi.mp3` (6.56 MB)
  2. `src/apps/mediaplayer/assets/music/1gl0S9pS0Zw0qfa14rDD3D.mp3` (3.39 MB)
  3. `src/themes/ios6/assets/avatars/profile.gif` (2.99 MB)
  4. `src/themes/ios6/assets/user.gif` (2.99 MB)
  5. `src/themes/winxp/assets/avatars/profile.gif` (2.99 MB)
  6. `src/themes/winxp/assets/user.gif` (2.99 MB)
  7. `src/apps/mediaplayer/assets/music/3jjsRKEsF42ccXf8kWR3nu.mp3` (2.96 MB)
  8. `src/content/blog/preview.webm` (1.59 MB)
  9. `src/content/pictures/wallpapers/ios/ios6-background-1.png` (1.03 MB)
- **Largest Git history blobs**: Matches tracked media assets; no untracked historical blobs exist.
- **Ignored/generated folders**: `node_modules` (132.41 MB), `dist` (12.78 MB), `.DS_Store` files.
- **Temp/donor folders**: No `Temp` folder exists in project root.
- **LFS status**: Git LFS not installed or not configured.

---

## Findings
- The total local working directory size (~554 MB) is driven by three main components:
  1. `src/` (212 MB): Contains tracked high-resolution PNG icon packs, MP3 audio files, animated GIFs, and video assets required for themes and apps.
  2. `.git/` (196 MB): Houses the Git pack file (`.git/objects/pack/pack-*.pack`), which compresses all historical commits and media assets.
  3. `node_modules/` (132 MB): Installed local npm development dependencies (esbuild, typescript, lucide-react, etc.).
  4. `dist/` (12.78 MB): Untracked production build outputs.
- GitHub's remote repository size (~196 MB) corresponds directly to the `.git/objects` packfile size.

---

## Safe Local Cleanup
1. Local generated folders (`dist/` 12.78 MB) can be deleted safely and regenerated on build.
2. `node_modules/` (132.41 MB) can be pruned or reinstalled via `npm ci`.
3. Unused local build caches (`.vite/`, `coverage/`, `playwright-report/`) are properly ignored in `.gitignore`.

---

## Git History Cleanup Candidates
- **Audio Assets**: `1JIzFhI9Lt5FyslawmHCBi.mp3` (6.56 MB), `1gl0S9pS0Zw0qfa14rDD3D.mp3` (3.39 MB), `3jjsRKEsF42ccXf8kWR3nu.mp3` (2.96 MB).
- **GIF Animations**: Avatar GIFs (`user.gif`, `profile.gif` @ 2.99 MB each across theme assets).
- **Video Assets**: `preview.webm` (1.59 MB).
- **Icon Packs**: Hundreds of 0.5-0.8 MB PNG icons under `src/themes/winxp/assets/icons/`.

---

## Risks
- Running `git filter-repo` or BFG to strip media files from `.git` history requires a **forced push** (`git push --force`) and breaks commit hashes for any open branches.
- Removing tracked media files (`.mp3`, `.gif`, `.png`) without providing CDN links or compressed alternatives will break media playback and OS visual theme assets in runtime.

---

## Recommended Next Step
- **Safe local cleanup only**: Keep tracked source assets intact for now, prune local `dist/` cache, and establish a separate asset optimization / Git LFS migration plan for heavy media files.
